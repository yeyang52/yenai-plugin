import { formatDuration } from '../../tools/index.js'
import { Version, Plugin_Name } from '../../components/index.js'
import { status } from '../../constants/other.js'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

export default async function getBotState (botList) {
  const defaultAvatar = `../../../../../plugins/${Plugin_Name}/resources/state/img/default_avatar.jpg`
  const BotName = Version.name

  const dataPromises = botList.map(async (i) => {
    const bot = Bot[i]
    if (!bot?.uin) return ''

    const avatar = bot.avatar || (Number(bot.uin) ? `https://q1.qlogo.cn/g?b=qq&s=0&nk=${bot.uin}` : defaultAvatar)
    const nickname = bot.nickname || '未知'
    const onlineStatus = status[bot.status] || '在线'
    const platform = bot.apk ? `${bot.apk.display} v${bot.apk.version}` : bot.version?.version || '未知'

    const sent = await redis.get(`Yz:count:send:msg:bot:${bot.uin}:total`) || await redis.get('Yz:count:sendMsg:total')
    const recv = await redis.get(`Yz:count:receive:msg:bot:${bot.uin}:total`) || bot.stat?.recv_msg_cnt
    const screenshot = await redis.get(`Yz:count:send:image:bot:${bot.uin}:total`) || await redis.get('Yz:count:screenshot:total')

    const friendQuantity = bot.fl?.size || 0
    const groupQuantity = bot.gl?.size || 0
    const groupMemberQuantity = Array.from(bot.gml?.values() || []).reduce((acc, curr) => acc + curr.size, 0)
    const runTime = formatDuration(Date.now() / 1000 - bot.stat?.start_time, 'dd天hh小时mm分', false)
    const botVersion = bot.version ? `${bot.version.name}(${bot.version.id})${bot.apk ? ` ${bot.version.version}` : ''}` : `ICQQ(QQ) v${require('icqq/package.json').version}`

    return {
      avatar,
      defaultAvatar,
      nickname,
      BotName,
      runTime,
      onlineStatus,
      platform,
      botVersion,
      recv,
      sent,
      screenshot,
      friendQuantity,
      groupQuantity,
      groupMemberQuantity,
      process: {
        version: process.version,
        platform: process.platform,
        arch: process.arch
      }
    }
  })

  return await Promise.all(dataPromises)
}
