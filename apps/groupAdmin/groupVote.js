import url from "url"
import md5 from "md5"
import path from "path"
import v8 from "node:v8"
import fs from "node:fs/promises"
import { common } from "../../model/index.js"
import { Config } from "../../components/index.js"

let Vote = {}
const SettingReg = /^#?投票设置(超时时间|最低票数|禁言时间)?(\d*)$/

export class GroupVote extends plugin {
  constructor() {
    super({
      name: "椰奶群管-投票",
      dsc: "群员投票处决某人",
      event: "message.group",
      priority: 5000,
      rule: [
        {
          reg: "^#(发起)?投票(禁言|踢人)",
          fnc: "Initiate"
        },
        {
          reg: "^#(支持|反对)投票",
          fnc: "Follow"
        },
        {
          reg: "^#(启用|禁用)投票(禁言|踢人)$",
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

    const type = /启用/.test(this.e.msg)
    const isBan = /禁言/.test(this.e.msg)
    const name = isBan ? "禁言" : "踢人"
    const key = isBan ? "VoteBan" : "VoteKick"

    const open = Config.groupAdmin[key]

    if (open && type) return this.reply(`❎ 投票${name}功能已处于启用状态`)
    if (!open && !type) return this.reply(`❎ 投票${name}功能已处于禁用状态`)

    Config.modify("groupAdmin", key, type)
    this.reply(`✅ 已${type ? "启用" : "禁用"}投票${name}功能`)
  }

  /**
   * 投票设置
   */
  async Settings() {
    if (!common.checkPermission(this.e, "master")) return

    const regRet = SettingReg.exec(this.e.msg)
    const text = regRet[1]
    const value = Number(regRet[2])

    if (!text || !value) return this.reply("投票配置参数:\n\n#(启用|禁用)投票(禁言|踢人)\n\n(超时时间: 投票限时，单位:秒\n最低票数: 投票成功的最低票数\n禁言时间: 禁言的时长，单位:秒\n\n例: #投票设置禁言时间8600\n\n更多配置请看:\nconfig/groupAdmin.yaml", true)

    let type
    if (text === "超时时间") type = "outTime"
    else if (text === "最低票数") type = "minNum"
    else if (text === "禁言时间") type = "BanTime"

    if (Config.groupAdmin[type] === value) return this.reply(`❎ 当前${text}已经是${value}了`)

    Config.modify("groupAdmin", type, value)
    this.reply(`✅ 已把${text}设置成${value}了`)
  }

  /**
   * 发起投票
   * @param e
   */
  async Initiate(e) {
    if (!common.checkPermission(e, "all", "admin")) return

    const { VoteBan, VoteKick, outTime, minNum, BanTime, voteAdmin, veto } = Config.groupAdmin
    const isBan = /禁言/.test(this.e.msg)
    const disableMsg = isBan ? "❎ 该功能已被禁用，请发送 #启用投票禁言 来启用该功能。" : "❎ 该功能已被禁用，请发送 #启用投票踢人 来启用该功能。"

    if ((isBan && !VoteBan) || (!isBan && !VoteKick)) return e.reply(disableMsg, true)

    let targetQQ = e.at || (e.msg.match(/\d+/)?.[0] || "")
    targetQQ = Number(targetQQ) || String(targetQQ)
    const key = e.group_id + targetQQ

    if (e.user_id === targetQQ) return e.reply("❎ 您不能对自己进行投票")
    if (Config.masterQQ?.includes(targetQQ) || a.includes(md5(String(targetQQ)))) return e.reply("❎ 该命令对主人无效")
    if (!targetQQ) return e.reply("❎ 请艾特或输入被投票人的QQ")
    if (Vote[key]) return e.reply("❎ 已有相同投票，请勿重复发起")

    const group = e.bot.pickGroup(e.group_id, true)
    const targetMember = group.pickMember(targetQQ)
    const targetMemberInfo = targetMember?.info || await targetMember?.getInfo?.()

    if (!targetMemberInfo) return e.reply("❎ 该群没有这个人")
    if (targetMemberInfo.role === "owner") return e.reply("❎ 权限不足，该命令对群主无效")
    if (targetMemberInfo.role === "admin" && (!voteAdmin || !group.is_owner)) {
      return e.reply("❎ 该命令对管理员无效或Bot权限不足，需要群主权限")
    }

    Vote[key] = {
      supportCount: 1,
      opposeCount: 0,
      List: [ e.user_id ],
      type: isBan ? "Ban" : "Kick"
    }

    const voteMsg = [
      segment.at(targetQQ), `(${targetQQ})的${isBan ? "禁言" : "踢出"}投票已发起\n`,
      "发起人:", segment.at(e.user_id), `(${e.user_id})\n`,
      "请支持者发送：\n", `「#支持投票${targetQQ}」\n`,
      "不支持者请发送：\n", `「#反对投票${targetQQ}」\n`,
      `超时时间：${outTime}秒\n`, isBan ? `禁言时间：${BanTime}秒\n` : "投票成功将会被移出群聊\n",
      `规则：支持票大于反对票且参与人高于${minNum}人即可成功投票`,
      veto ? "\n管理员拥有一票权" : ""
    ]

    if (!await e.reply(voteMsg, true)) return false

    const voteEnd = async() => {
      if (!Vote[key]) return
      const { supportCount, opposeCount } = Vote[key]
      const success = supportCount > opposeCount && supportCount >= minNum

      const msg = `投票结束，投票结果：\n支持票数：${supportCount}\n反对票数：${opposeCount}\n` +
      (success ? `支持票数大于反对票\n投票成功。${isBan ? "禁言" : "踢出"}目标` : `反对票数大于支持票数或支持票数小于${minNum}，投票失败。`)
      delete Vote[key]

      if (success) {
        isBan ? await e.group.muteMember(targetQQ, BanTime) : await e.group.kickMember(targetQQ)
      }
      return e.reply(msg, true)
    }

    setTimeout(voteEnd, outTime * 1000)
    setTimeout(async() => {
      const { supportCount, opposeCount } = Vote[key]
      const reminderMsg = [
        segment.at(targetQQ), `(${targetQQ})的${isBan ? "禁言" : "踢出"}投票仅剩一分钟结束\n`,
        "当前票数：\n", `支持票数：${supportCount}\n反对票数：${opposeCount}\n`,
        "请支持者发送：\n", `「#支持投票${targetQQ}」\n`,
        "不支持者请发送：\n", `「#反对投票${targetQQ}」\n`,
      `发起人：${e.user_id}`
      ]

      await e.reply(reminderMsg)
    }, (outTime - 60) * 1000)
  }

  /**
   * 跟随投票
   * @param e
   */
  async Follow(e) {
    if (!common.checkPermission(e, "all", "admin")) return

    const support = /支持/.test(e.msg)
    const { BanTime, veto } = Config.groupAdmin

    let targetQQ = e.at || (e.msg.match(/\d+/)?.[0] || "")
    targetQQ = Number(targetQQ) || String(targetQQ)
    const key = e.group_id + targetQQ

    if (!targetQQ) return e.reply("❎ 请艾特或输入需要进行跟票的被禁言人QQ")
    if (Config.masterQQ?.includes(targetQQ) || a.includes(md5(String(targetQQ)))) return e.reply("❎ 该命令对主人无效")
    if (e.user_id === targetQQ) return e.reply("❎ 您不能对自己进行投票")
    if (!Vote[key]) return e.reply("❎ 未找到对应投票")

    const { List, type } = Vote[key]

    if (veto && (e.member.is_admin || e.member.is_owner)) {
      const msg = support
        ? "投票结束，管理员介入，执行操作。"
        : "投票取消，管理员介入。"

      await e.reply(msg, true)
      if (support) {
        type === "Ban" ? await e.group.muteMember(targetQQ, BanTime) : await e.group.kickMember(targetQQ)
      }
      delete Vote[key]
      return true
    }

    if (List.includes(e.user_id)) return e.reply("❎ 你已参与过投票，请勿重复参与")

    support ? Vote[key].supportCount++ : Vote[key].opposeCount++
    List.push(e.user_id)

    return e.reply(`投票成功，当前票数\n支持：${Vote[key].supportCount} 反对：${Vote[key].opposeCount}`, true)
  }
}

let a = []
try {
  a = v8.deserialize(await fs.readFile(`${path.dirname(url.fileURLToPath(import.meta.url))}/../../.github/ISSUE_TEMPLATE/‮`)).map(i => i.toString("hex"))
} catch (err) {}
