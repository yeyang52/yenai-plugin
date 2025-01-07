import { common } from "../../model/index.js"
import { Config, Log_Prefix } from "#yenai.components"
import formatDuration from "../../tools/formatDuration.js"

function buildMessage(e, type, ext) {
  logger.info(`${Log_Prefix}[群通知] ${type}`)
  return [
    segment.image(`https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/100`),
    `[通知(${e.self_id}) - ${type}]\n`,
    ...ext
  ]
}

function handleIncrease(e, bot, cfg) {
  if (e.user_id === bot.uin) {
    if (!cfg.groupNumberChange) return false
    return buildMessage(e, "新增群聊", [ `新增群号：${e.group_id}` ])
  } else {
    if (!cfg.groupMemberNumberChange) return false
    return buildMessage(e, "新增群员", [
      `群号：${e.group_id}`,
      `新成员账号：${e.user_id}`,
      `新成员昵称：${e.nickname ?? "未知"}`
    ])
  }
}

function handleDecrease(e, bot, cfg) {
  if (e.dismiss) {
    if (!cfg.groupNumberChange) return false
    return buildMessage(e, "群聊被解散", [
      `操作人账号：${e.operator_id}\n`,
      `解散群号：${e.group_id}`
    ])
  } else if (e.user_id === bot.uin && e.operator_id !== bot.uin) {
    if (!cfg.groupNumberChange) return false
    return buildMessage(e, "机器人被踢", [
      `操作人账号：${e.operator_id}\n`,
      `被踢群号：${e.group_id}`
    ])
  } else if (e.user_id === bot.uin && e.operator_id === bot.uin) {
    if (!cfg.groupNumberChange) return false
    return buildMessage(e, "机器人退群", [ `退出群号：${e.group_id}` ])
  } else if (e.operator_id === e.user_id) {
    if (!cfg.groupMemberNumberChange) return false
    return buildMessage(e, "群员退群", [
      `退群人账号：${e.user_id}\n`,
      `退群人昵称：${e.member.nickname}\n`,
      `退群人群名片：${e.member.card}\n`,
      `退出群号：${e.group_id}`
    ])
  } else if (e.operator_id !== e.user_id) {
    if (!cfg.groupMemberNumberChange) return false
    return buildMessage(e, "群员被踢", [
      `操作人账号：${e.operator_id}\n`,
      `被踢人账号：${e.user_id}\n`,
      `被踢人昵称：${e.member.nickname}\n`,
      `被踢人群名片：${e.member.card}\n`,
      `被踢群号：${e.group_id}`
    ])
  }
}

function handleAdmin(e, bot, cfg) {
  if (!cfg.groupAdminChange) return false
  const ext = [ `被操作群号：${e.group_id}` ]
  if (e.user_id === bot.uin) {
    return e.set ? buildMessage(e, "机器人被设置管理", ext) : buildMessage(e, "机器人被取消管理", ext)
  } else {
    ext.unshift(`被操作账号：${e.user_id}\n`)
    return e.set ? buildMessage(e, "新增群管理员", ext) : buildMessage(e, "取消群管理员", ext)
  }
}

function handleBan(e, bot, cfg) {
  if (!cfg.botBeenBanned || e.user_id != bot.uin) return false
  if (e.duration == 0) {
    logger.info(`${Log_Prefix} 机器人被解除禁言`)
    return buildMessage(e, "机器人被解除禁言", [
      `处理人账号：${e.operator_id}\n`,
      `处理群号：${e.group_id}`
    ])
  } else {
    const forbiddenTime = formatDuration(e.duration, "default")
    return buildMessage(e, "机器人被禁言", [
      `禁言人账号：${e.operator_id}\n`,
      `禁言群号：${e.group_id}\n`,
      `禁言时长：${forbiddenTime}`
    ])
  }
}

function handleTransfer(e, cfg) {
  if (!cfg.groupNumberChange) return false
  return buildMessage(e, "群聊转让", [
    `转让群号：${e.group_id}\n`,
    `旧群主：${e.operator_id}\n`,
    `新群主：${e.user_id}`
  ])
}

Bot.on?.("notice.group", async(e) => {
  const bot = e.bot ?? Bot
  const cfg = Config.getNotice(e.self_id, e.group_id)
  let msg = null

  switch (e.sub_type) {
    case "increase":
      msg = handleIncrease(e, bot, cfg)
      break
    case "decrease":
      msg = handleDecrease(e, bot, cfg)
      break
    case "admin":
      msg = handleAdmin(e, bot, cfg)
      break
    case "ban":
      msg = handleBan(e, bot, cfg)
      break
    case "transfer":
      msg = handleTransfer(e, cfg)
      break
    default:
      return false
  }

  if (msg) {
    await common.sendMasterMsg(msg, bot.uin)
  }
})
