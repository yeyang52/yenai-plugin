import plugin from '../../../lib/plugins/plugin.js'
import { segment } from 'oicq'
import { common } from '../model/index.js'
import { Config } from '../components/index.js'

/** 好友通知 */
export class Friends extends plugin {
  constructor () {
    super({
      name: '椰奶好友通知',
      event: 'notice.friend',
      priority: 5000
    })
  }

  async accept (e) {
    let msg
    let forwardMsg
    switch (e.sub_type) {
      case 'increase': {
        if (!Config.Notice.friendNumberChange) return false
        logger.mark('[椰奶]新增好友')
        msg = [
          segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${e.user_id}`),
          '[通知 - 新增好友]\n',
          `好友QQ：${e.user_id}\n`,
          `好友昵称：${e.nickname}`
        ]
        break
      }
      case 'decrease': {
        if (!Config.Notice.friendNumberChange) return false
        logger.mark('[椰奶]好友减少')
        msg = [
          segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${e.user_id}`),
          '[通知 - 好友减少]\n',
          `好友QQ：${e.user_id}\n`,
          `好友昵称：${e.nickname}`
        ]
        break
      }
      case 'recall': {
        if (!Config.Notice.PrivateRecall) return false

        if (e.user_id == Bot.uin) return false

        if (Config.masterQQ.includes(e.user_id)) return false
        logger.mark('[椰奶]好友撤回')
        // 读取
        let res = JSON.parse(
          await redis.get(`notice:messagePrivate:${e.message_id}`)
        )
        // 无数据 return
        if (!res) return false
        // 撤回为闪照处理
        if (res[0].type === 'flash') {
          let url = res[0].url
          res = ['[闪照]\n', '撤回闪照：', segment.image(url)]
        } else if (res[0].type === 'record') {
          // 语音
          forwardMsg = segment.record(res[0].url)
          res = '[语音]'
        } else if (res[0].type === 'video') {
          // 视频
          forwardMsg = segment.video(res[0].file)
          res = '[视频]'
        } else if (res[0].type === 'xml') {
          // 合并消息
          forwardMsg = res
          res = '[合并消息]'
        }
        // 消息
        msg = [
          segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${e.user_id}`),
          '[消息 - 好友撤回消息]\n',
          `好友QQ：${e.user_id}\n`,
          `撤回时间：${formatDate(e.time)}\n`,
          '撤回消息：',
          ...res
        ]
        break
      }
      case 'poke': {
        if (!Config.Notice.privateMessage) return false
        logger.mark('[椰奶]好友戳一戳')
        msg = [
          segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${e.user_id}`),
          '[消息 - 戳一戳]\n',
          `来源QQ：${e.user_id}`
        ]
        break
      }
      default:
        return false
    }
    await common.sendMasterMsg(msg)
    if (forwardMsg) await common.sendMasterMsg(forwardMsg)
  }
}

/** 时间转换 */
function formatDate (time) {
  let now = new Date(parseFloat(time) * 1000)
  // 月
  let month = now.getMonth() + 1
  // 日
  let date = now.getDate()
  // 补0
  if (month >= 1 && month <= 9) month = '0' + month
  if (date >= 0 && date <= 9) date = '0' + date
  // 时
  let hour = now.getHours()
  // 分
  let minute = now.getMinutes()
  // 补0
  if (hour >= 1 && hour <= 9) hour = '0' + hour
  if (minute >= 0 && minute <= 9) minute = '0' + minute
  return `${month}-${date} ${hour}:${minute} `
}
