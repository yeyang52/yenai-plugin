import { formatDuration } from "../../tools/index.js"
import { Plugin_Name, Plugin_Path } from "../../components/index.js"
import { createRequire } from "module"
import common from "../../../../lib/common/common.js"
const require = createRequire(import.meta.url)

export default async function getBotState(botList) {
  const defaultAvatar = `../../../../../plugins/${Plugin_Name}/resources/state/img/default_avatar.jpg`
  const dataPromises = botList.map(async(i) => {
    const bot = Bot[i]
    if (!bot?.uin) return ""
    // 头像
    const avatarUrl = bot.avatar || (Number(bot.uin) ? `https://q1.qlogo.cn/g?b=qq&s=0&nk=${bot.uin}` : defaultAvatar)
    const avatarPath = Plugin_Path + `/temp/state/avatar_${i}.png`
    const avatarShadowColor = await getAvatarColor(avatarUrl, avatarPath)

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
    console.log(avatarShadowColor)
    return {
      avatar: avatarPath,
      avatarShadowColor,
      defaultAvatar,
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
  try {
    let { getColor } = await import("colorthief")
    await common.downFile(url, path)
    let color = await getColor(path)
    return `rgb(${color[0]},${color[1]},${color[2]})`
  } catch {
    return "#fff"
  }
}
