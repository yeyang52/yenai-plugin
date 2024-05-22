import { createRequire } from "module"
import moment from "moment"
import { Plugin_Path } from "../../components/index.js"
import { formatDuration } from "../../tools/index.js"
import { getImgPalette } from "./utils.js"
const require = createRequire(import.meta.url)

export default async function getBotState(e) {
  const botList = _getBotList(e)
  const dataPromises = botList.map(async(i) => {
    const bot = Bot[i]
    if (!bot?.uin) return ""

    const { nickname = "未知", status = 11, apk, version } = bot

    // 头像
    const avatarUrl = bot.avatar ?? (Number(bot.uin) ? `https://q1.qlogo.cn/g?b=qq&s=3&nk=${bot.uin}` : "default")
    const avatar = await getAvatarColor(avatarUrl)

    const verKey = e.isPro ? "version" : "ver"
    const platform = apk
      ? `${apk.display} v${apk[verKey]}`
      : version?.version ?? "未知"

    const messageCount = await getMessageCount(bot)

    const countContacts = getCountContacts(bot)

    const botRunTime = formatDuration(Date.now() / 1000 - bot.stat?.start_time, "dd天hh:mm:ss", true)

    const botVersion = version
      ? `${version.name}${apk ? ` ${version.version}` : ""}`
      : `ICQQ v${require("icqq/package.json").version}`

    return {
      avatar,
      nickname,
      botRunTime,
      status,
      platform,
      botVersion,
      messageCount,
      countContacts
    }
  })

  return Promise.all(dataPromises)
}

async function getAvatarColor(url) {
  const defaultAvatar = `${Plugin_Path}/resources/state/img/default_avatar.jpg`
  try {
    if (url == "default") {
      url = defaultAvatar
    }
    let avatar = await getImgPalette(url)
    return avatar
  } catch {
    return {
      similarColor1: "#fff1eb",
      similarColor2: "#ace0f9",
      path: url
    }
  }
}
async function getMessageCount(bot) {
  const nowDate = moment().format("MMDD")
  const keys = [
      `Yz:count:send:msg:bot:${bot.uin}:total`,
      `Yz:count:receive:msg:bot:${bot.uin}:total`,
      `Yz:count:send:image:bot:${bot.uin}:total`,
      `Yz:count:screenshot:day:${nowDate}`
  ]

  const values = await redis.mGet(keys) || []

  const sent = values[0] || bot.stat?.sent_msg_cnt || 0
  const recv = values[1] || bot.stat?.recv_msg_cnt || 0
  const screenshot = values[2] || values[3] || 0

  return {
    sent,
    recv,
    screenshot
  }
}

function getCountContacts(bot) {
  const friend = bot.fl?.size || 0
  const group = bot.gl?.size || 0
  const groupMember = Array.from(bot.gml?.values() || []).reduce((acc, curr) => acc + curr.size, 0)
  return {
    friend,
    group,
    groupMember
  }
}

function _getBotList(e) {
  /** bot列表 */
  let BotList = [ e.self_id ]

  if (e.isPro) {
    if (Array.isArray(Bot?.uin)) {
      BotList = Bot.uin
    } else if (Bot?.adapter && Bot.adapter.includes(e.self_id)) {
      BotList = Bot.adapter
    }
  }
  return BotList
}
