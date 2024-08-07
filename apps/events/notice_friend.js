import { common } from "../../model/index.js"
import { Config } from "../../components/index.js"

Bot.on?.("notice.friend", async(e) => {
  let msg
  let forwardMsg
  switch (e.sub_type) {
    /** 好友列表增加 */
    case "increase": {
      if (!Config.getAlone(e.self_id).friendNumberChange) return false
      logger.info("[Yenai-Plugin]新增好友")
      msg = [
        segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${e.user_id}`),
        `[通知(${e.self_id}) - 新增好友]\n`,
          `好友账号：${e.user_id}\n`,
          `好友昵称：${e.nickname}`
      ]
      break
    }
    /** 好友列表减少 */
    case "decrease": {
      if (!Config.getAlone(e.self_id).friendNumberChange) return false
      logger.info("[Yenai-Plugin]好友减少")
      msg = [
        segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${e.user_id}`),
        `[通知(${e.self_id}) - 好友减少]\n`,
          `好友账号：${e.user_id}\n`,
          `好友昵称：${e.nickname}`
      ]
      break
    }
    /** 撤回 */
    case "recall": {
      if (!Config.getAlone(e.self_id).PrivateRecall) return false

      if (e.user_id == (e.bot ?? Bot).uin) return false
      // 主人撤回
      if (Config.masterQQ.includes(e.user_id)) return false
      logger.info("[Yenai-Plugin]好友撤回")
      // 读取
      let res = JSON.parse(
        await redis.get(`notice:messagePrivate:${e.message_id}`)
      )
      // 无数据 return
      if (!res) return false
      const msgType = {
        flash: {
          msg: () => false,
          type: [ "[闪照]\n", "撤回闪照：", segment.image(res[0].url) ]
        },
        record: {
          msg: () => segment.record(res[0].url),
          type: "[语音]"
        },
        video: {
          msg: () => segment.video(res[0].file),
          type: "[视频]"
        },
        xml: {
          msg: () => res,
          type: "[合并消息]"
        }
      }
      if (msgType[res[0].type]) {
        forwardMsg = msgType[res[0].type].msg()
        res = msgType[res[0].type].type
      }
      // 消息
      msg = [
        segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${e.user_id}`),
        `[消息(${e.self_id}) - 好友撤回消息]\n`,
          `好友账号：${e.user_id}\n`,
          `撤回时间：${formatDate(e.time)}\n`,
          "撤回消息：",
          ...res
      ]
      break
    }
    case "poke": {
      if (!Config.getAlone(e.self_id).privateMessage) return false
      logger.info("[Yenai-Plugin]好友戳一戳")
      msg = [
        segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${e.user_id}`),
        `[消息(${e.self_id}) - 戳一戳]\n`,
          `来源账号：${e.user_id}`
      ]
      break
    }
    default:
      return false
  }
  await common.sendMasterMsg(msg, (e.bot ?? Bot).uin)
  if (forwardMsg) await common.sendMasterMsg(forwardMsg, (e.bot ?? Bot).uin)
}
)

/**
 * 时间转换
 * @param time
 */
function formatDate(time) {
  let now = new Date(parseFloat(time) * 1000)
  // 月
  let month = now.getMonth() + 1
  // 日
  let date = now.getDate()
  // 补0
  if (month >= 1 && month <= 9) month = "0" + month
  if (date >= 0 && date <= 9) date = "0" + date
  // 时
  let hour = now.getHours()
  // 分
  let minute = now.getMinutes()
  // 补0
  if (hour >= 1 && hour <= 9) hour = "0" + hour
  if (minute >= 0 && minute <= 9) minute = "0" + minute
  return `${month}-${date} ${hour}:${minute} `
}
