import { formatDuration } from '../../tools/index.js'
import { Version, Plugin_Name } from '../../components/index.js'
import os from 'os'
import { status } from '../../constants/other.js'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

export default async function getBotState (botList) {
  const defaultAvatar = `../../../../../plugins/${Plugin_Name}/resources/state/img/default_avatar.jpg`
  const BotName = Version.name
  const systime = formatDuration(os.uptime(), 'dd天hh小时mm分', false)

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

    return `<div class="box">
      <div class="tb">
          <div class="avatar">
              <img src="${avatar}"
                  onerror="this.src= '${defaultAvatar}'; this.onerror = null;">
          </div>
          <div class="header">
              <h1>${nickname}</h1>
              <hr noshade>
              <p> ${BotName} 已运行 ${runTime}</p>
              <p>${onlineStatus}(${platform}) | ${botVersion}</p>
              <p>收${recv || 0} | 发${sent || 0} | 图片${screenshot || 0} | 好友${friendQuantity} | 群${groupQuantity} | 群员${groupMemberQuantity}</p>
              <p>Node.js ${process.version} | ${process.platform} ${process.arch} | 系统运行 ${systime}</p>
          </div>
      </div>
  </div>`
  })

  const dataArray = await Promise.all(dataPromises)
  return dataArray.join('')
}
