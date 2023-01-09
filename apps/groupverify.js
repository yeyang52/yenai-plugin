import plugin from '../../../lib/plugins/plugin.js'
import { segment } from "oicq";
import { Config } from "../components/index.js"
import { YamlReader, common } from '../model/index.js'
//全局
let temp = {};
const ops = ["+", "-"];
export class NEWCMD extends plugin {
  constructor() {
    super({
      name: '椰奶入群验证',
      dsc: '重新验证和绕过验证',
      event: 'message.group',
      priority: 5,
      rule: [
        {
          reg: '^#重新验证.*$',
          fnc: 'cmdReverify'
        },
        {
          reg: '^#绕过验证.*$',
          fnc: 'cmdPass'
        },
        {
          reg: '^#开启验证$',
          fnc: 'openverify'
        },
        {
          reg: '^#关闭验证$',
          fnc: 'closeverify'
        },
        {
          reg: '^#切换验证模式$',
          fnc: 'setmode'
        },
        {
          reg: '^#设置验证超时时间(\\d+)(s|秒)?$',
          fnc: 'setovertime'
        }
      ]
    })
    this.verifypath = `./plugins/yenai-plugin/config/config/groupverify.yaml`;
  }
  //重新验证
  async cmdReverify(e) {

    if (e?.group?.mute_left > 0) return

    let verifycfg = Config.verifycfg

    if (!e.group.is_admin && !e.group.is_owner) return e.reply("做不到，怎么想我都做不到吧ヽ(≧Д≦)ノ", true);

    if (!verifycfg.openGroup.includes(e.group_id)) return e.reply("当前群未开启验证哦~", true);

    if (!e.isMaster && !e.member.is_owner && !e.member.is_admin) return e.reply("❎ 该命令仅限管理员可用", true);

    let qq = e.msg.replace(/#|重新验证/g, "").trim();

    if (e.message.length != 1) {
      qq = e.message.find(item => item.type == "at")?.qq
    } else {
      qq = Number(qq.match(/[1-9]\d*/g));
    }
    if (!(/\d{5,}/.test(qq))) return e.reply("❎ 请输入正确的QQ号");

    if (qq == Bot.uin) return

    if (Config.masterQQ.includes(qq)) return e.reply("❎ 该命令对机器人管理员无效");

    if (temp[qq + e.group_id]) return e.reply("❎ 目标群成员处于验证状态");

    await verify(qq, e.group_id, e)
  }
  //绕过验证
  async cmdPass(e) {
    let verifycfg = Config.verifycfg

    if (!e.group.is_admin && !e.group.is_owner) return e.reply("做不到，怎么想我都做不到吧ヽ(≧Д≦)ノ", true);

    if (!verifycfg.openGroup.includes(e.group_id)) return e.reply("当前群未开启验证哦~", true);

    if (!e.isMaster && !e.member.is_owner && !e.member.is_admin) return e.reply("❎ 该命令仅限管理员可用", true);

    let qq = e.msg.replace(/#|绕过验证/g, "").trim();

    if (e.message.length != 1) {
      qq = e.message.find(item => item.type == "at")?.qq
    } else {
      qq = Number(qq.match(/[1-9]\d*/g));
    }
    if (!(/\d{5,}/.test(qq))) return e.reply("❎ 请输入正确的QQ号");

    if (qq == Bot.uin) return

    if (!temp[qq + e.group_id]) return e.reply("❎ 目标群成员当前无需验证");

    clearTimeout(temp[qq + e.group_id].kickTimer);

    clearTimeout(temp[qq + e.group_id].remindTimer);

    delete temp[qq + e.group_id];

    return await e.reply(verifycfg.SuccessMsgs[e.group_id] || verifycfg.SuccessMsgs[0] || "✅ 验证成功，欢迎入群");
  }

  //开启验证
  async openverify(e) {
    if (!e.isMaster && !e.member.is_owner && !e.member.is_admin) return e.reply("❎ 该命令仅限管理员可用", true);
    if (!e.group.is_admin && !e.group.is_owner) return e.reply("做不到，怎么想我都做不到吧ヽ(≧Д≦)ノ", true);
    let verifycfg = Config.verifycfg
    if (verifycfg.openGroup.indexOf(e.group_id) != -1) return e.reply("❎ 本群验证已处于开启状态")
    new YamlReader(this.verifypath).addIn('openGroup', e.group_id)
    e.reply("✅ 已开启本群验证")
  }

  //关闭验证
  async closeverify(e) {
    if (!e.isMaster && !e.member.is_owner && !e.member.is_admin) return e.reply("❎ 该命令仅限管理员可用", true);
    let verifycfg = Config.verifycfg
    let key = verifycfg.openGroup.indexOf(e.group_id)
    if (key == -1) return e.reply("❎ 本群暂未开启验证")
    new YamlReader(this.verifypath).delete(`openGroup.${key}`)
    e.reply("✅ 已关闭本群验证")
  }
  //切换验证模式
  async setmode(e) {
    if (!e.isMaster) return e.reply("❎ 该命令仅限主人可用", true);
    let verifycfg = Config.verifycfg
    let value = verifycfg.mode == "模糊" ? "精确" : "模糊"
    new YamlReader(this.verifypath).set(`mode`, value)
    e.reply(`✅ 已切换验证模式为${value}验证`)
  }
  //设置验证超时时间
  async setovertime(e) {
    if (!e.isMaster) return e.reply("❎ 该命令仅限主人可用", true);
    let overtime = e.msg.match(/\d+/g)
    new YamlReader(this.verifypath).set("time", Number(overtime))
    e.reply(`✅ 已将验证超时时间设置为${overtime}秒`)
    if (overtime < 60) {
      e.reply(`建议至少一分钟(60秒)哦ε(*´･ω･)з`)
    }
  }
}





//进群监听
Bot.on("notice.group.increase", async (e) => {
  let verifycfg = Config.verifycfg

  if (!verifycfg.openGroup.includes(e.group_id)) return;

  if (!e.group.is_admin && !e.group.is_owner) return;

  if (e.user_id == Bot.uin) return

  if (Config.masterQQ.includes(e.user_id)) return

  if (e?.group?.mute_left > 0) return

  await verify(e.user_id, e.group_id, e)
})

//答案监听
Bot.on('message.group', async (e) => {
  let verifycfg = Config.verifycfg

  if (!verifycfg.openGroup.includes(e.group_id)) return;

  if (!e.group.is_admin && !e.group.is_owner) return;

  if (!temp[e.user_id + e.group_id]) return;

  const { verifyCode, kickTimer, remindTimer } = temp[e.user_id + e.group_id];

  const { nums, operator } = temp[e.user_id + e.group_id];

  const isAccurateModeOK = verifycfg.mode === "精确" && e.raw_message == verifyCode;

  const isVagueModeOK = verifycfg.mode === "模糊" && e.raw_message.includes(verifyCode);

  const isOK = isAccurateModeOK || isVagueModeOK;

  if (isOK) {
    delete temp[e.user_id + e.group_id];
    clearTimeout(kickTimer);
    clearTimeout(remindTimer);
    return await e.reply(verifycfg.SuccessMsgs[e.group_id] || verifycfg.SuccessMsgs[0] || "✅ 验证成功，欢迎入群");
  } else {
    temp[e.user_id + e.group_id].remainTimes -= 1;

    const { remainTimes } = temp[e.user_id + e.group_id];

    if (remainTimes > 0) {
      await e.recall();

      const msg = `❎ 验证失败，你还有「${remainTimes}」次机会，请发送「${nums[0]} ${operator} ${nums[1]}」的运算结果`;
      return await e.reply([segment.at(e.user_id), msg]);
    }
    clearTimeout(kickTimer);
    clearTimeout(remindTimer);
    await e.reply([segment.at(e.user_id), `验证失败，请重新申请`]);
    delete temp[e.user_id + e.group_id];
    return await e.group.kickMember(e.user_id, true)
  }
})

//主动退群
Bot.on('notice.group.decrease', async (e) => {
  if (!e.group.is_admin && !e.group.is_owner) return;

  if (!temp[e.user_id + e.group_id]) return;

  clearTimeout(temp[e.user_id + e.group_id].kickTimer);

  clearTimeout(temp[e.user_id + e.group_id].remindTimer);

  delete temp[e.user_id + e.group_id];

  return e.reply(`「${e.user_id}」主动退群，验证流程结束`);
})

//发送验证信息
async function verify(user_id, group_id, e) {
  if (!e.group.is_admin && !e.group.is_owner) return;

  logger.mark(`[椰奶]进行${user_id}的验证`)

  let verifycfg = Config.verifycfg
  let { range } = verifycfg
  const remainTimes = verifycfg.times;

  const operator = ops[getRndInteger(0, 1)]

  let [m, n] = [getRndInteger(range.min, range.max), getRndInteger(range.min, range.max)]
  while (m == n) {
    n = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  }

  [m, n] = [m >= n ? m : n, m >= n ? n : m];

  const verifyCode = String(operator === "-" ? m - n : m + n);
  logger.mark(`[验证]答案：${verifyCode}`)
  const kickTimer = setTimeout(async () => {
    e.reply([segment.at(user_id), " 验证超时，移出群聊，请重新申请"]);

    delete temp[user_id + group_id];

    clearTimeout(kickTimer);

    return await e.group.kickMember(user_id, true)

  }, verifycfg.time * 1000);

  const shouldRemind = verifycfg.remindAtLastMinute && verifycfg.time >= 120;

  const remindTimer = setTimeout(async () => {

    if (shouldRemind && temp[user_id + group_id].remindTimer) {

      const msg = ` 验证仅剩最后一分钟，请发送「${m}${operator}${n}」的运算结果，否则将会被移出群聊`;

      await e.reply([segment.at(user_id), msg]);
    }
    clearTimeout(remindTimer);

  }, Math.abs(verifycfg.time * 1000 - 60000));

  const msg = ` 欢迎，请在「${verifycfg.time}」秒内发送「${m}${operator}${n}」的运算结果，否则将会被移出群聊`;

  await common.sleep(600);
  //消息发送成功才写入
  if (await e.reply([segment.at(user_id), msg])) {
    temp[user_id + group_id] = {
      remainTimes,
      nums: [m, n],
      operator,
      verifyCode,
      kickTimer,
      remindTimer
    };
  }
}
//随机数
function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}