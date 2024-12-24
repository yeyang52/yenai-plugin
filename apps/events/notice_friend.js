import { common } from "../../model/index.js"
import { Config } from "../../components/index.js"

Bot.on?.("notice.friend", async(e) => {
  let msg = null
  let forwardMsg = null
  switch (e.sub_type) {
    case "increase": {
      if (!Config.getNotice(e.self_id).friendNumberChange) return false
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
      if (!Config.getNotice(e.self_id).friendNumberChange) return false
      logger.info("[Yenai-Plugin]好友减少")
      msg = [
        segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${e.user_id}`),
        `[通知(${e.self_id}) - 好友减少]\n`,
          `好友账号：${e.user_id}\n`,
          `好友昵称：${e.nickname}`
      ]
      break
    }
    case "poke": {
      if (!Config.getNotice(e.self_id).privateMessage) return false
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
})
