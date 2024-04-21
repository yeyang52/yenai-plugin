import { createRequire } from "module"
import moment from "moment"
import { Plugin_Path } from "../../components/index.js"
import { formatDuration } from "../../tools/index.js"
import { getImgPalette, importColorThief } from "./utils.js"
const require = createRequire(import.meta.url)

export default async function getBotState(botList) {
  const dataPromises = botList.map(async(i) => {
    const bot = Bot[i]
    if (!bot?.uin) return ""
    // 头像
    const avatarUrl = bot.avatar || (Number(bot.uin) ? `https://q1.qlogo.cn/g?b=qq&s=0&nk=${bot.uin}` : "default")
    const avatar = await getAvatarColor(avatarUrl)

    const nickname = bot.nickname || "未知"
    const platform = bot.apk ? `${bot.apk.display} v${bot.apk.ver}` : bot.version?.version || "未知"
    const messageCount = await getMessageCount(bot)
    const countContacts = getCountContacts(bot)
    const onlineStatus = bot.status ?? 11
    const botRunTime = formatDuration(Date.now() / 1000 - bot.stat?.start_time, "dd天hh:mm:ss", true)
    const botVersion = bot.version
      ? `${bot.version.name}${bot.apk ? ` ${bot.version.version}` : ""}`
      : `ICQQ v${require("icqq/package.json").version}`

    return {
      avatar,
      nickname,
      botRunTime,
      onlineStatus,
      platform,
      botVersion,
      messageCount,
      countContacts
    }
  })

  return Promise.all(dataPromises)
}
// function extractVersion(versionString) {
//   const regex = /\d+\.\d+\.\d+/
//   const match = versionString.match(regex)
//   const version = match ? match[0] : versionString
//   return version
// }

async function getAvatarColor(url) {
  const defaultAvatar = `${Plugin_Path}/resources/state/img/default_avatar.jpg`
  try {
    await importColorThief()
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
  const sent = await redis.get(`Yz:count:send:msg:bot:${bot.uin}:total`) || bot.stat?.sent_msg_cnt
  const recv = await redis.get(`Yz:count:receive:msg:bot:${bot.uin}:total`) || bot.stat?.recv_msg_cnt
  const screenshot = await redis.get(`Yz:count:send:image:bot:${bot.uin}:total`) || await redis.get(`Yz:count:screenshot:day:${nowDate}`)
  return {
    sent: sent || 0,
    recv: recv || 0,
    screenshot: screenshot || 0
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
