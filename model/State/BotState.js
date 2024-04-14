import { formatDuration } from "../../tools/index.js"
import { Plugin_Path } from "../../components/index.js"
import { createRequire } from "module"
import common from "../../lib/common/common.js"
import { importColorThief, getImgPalette } from "./utils.js"
const require = createRequire(import.meta.url)

export default async function getBotState(botList) {
  const dataPromises = botList.map(async(i) => {
    const bot = Bot[i]
    if (!bot?.uin) return ""
    // 头像
    // const avatarUrl = bot.avatar || (Number(bot.uin) ? `https://q1.qlogo.cn/g?b=qq&s=0&nk=${bot.uin}` : "default")
    const avatarUrl = "https://q1.qlogo.cn/g?b=qq&s=0&nk=3545187491"
    const avatarPath = Plugin_Path + `/temp/state/avatar_${i}`
    const avatar = await getAvatarColor(avatarUrl, avatarPath)

    const nickname = bot.nickname || "未知"
    const platform = bot.apk ? `${bot.apk.display} v${extractVersion(bot.apk.version)}` : bot.version?.version || "未知"

    const sent = await redis.get(`Yz:count:send:msg:bot:${bot.uin}:total`) || await redis.get("Yz:count:sendMsg:total")
    const recv = await redis.get(`Yz:count:receive:msg:bot:${bot.uin}:total`) || bot.stat?.recv_msg_cnt
    const screenshot = await redis.get(`Yz:count:send:image:bot:${bot.uin}:total`) || await redis.get("Yz:count:screenshot:total")

    const friendQuantity = bot.fl?.size || 0
    const groupQuantity = bot.gl?.size || 0
    const onlineStatus = bot.status ?? 11
    const groupMemberQuantity = Array.from(bot.gml?.values() || []).reduce((acc, curr) => acc + curr.size, 0)
    const botRunTime = formatDuration(Date.now() / 1000 - bot.stat?.start_time, "dd天hh:mm:ss", true)
    const botVersion = bot.version ? `${bot.version.name}${bot.apk ? ` ${bot.version.version}` : ""}` : `ICQQ v${require("icqq/package.json").version}`

    return {
      avatar,
      nickname,
      botRunTime,
      onlineStatus,
      platform,
      botVersion,
      recv,
      sent,
      screenshot,
      friendQuantity,
      groupQuantity,
      groupMemberQuantity
    }
  })

  return await Promise.all(dataPromises)
}
function extractVersion(versionString) {
  const regex = /\d+\.\d+\.\d+/
  const match = versionString.match(regex)
  const version = match ? match[0] : versionString
  return version
}

async function getAvatarColor(url, path) {
  const defaultAvatar = `${Plugin_Path}/resources/state/img/default_avatar.jpg`
  try {
    await importColorThief()
    if (url != "default") {
      path = await common.downFile(url, path, { imgAutoSuffix: true })
    } else {
      path = defaultAvatar
    }
    let avatar = await getImgPalette(path)
    return avatar
  } catch {
    return {
      similarColor1: "#fff1eb",
      similarColor2: "#ace0f9",
      path: url
    }
  }
}
