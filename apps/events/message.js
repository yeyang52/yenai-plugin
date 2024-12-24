import { common } from "../../model/index.js"
import { Config } from "../../components/index.js"

Bot.on?.("message", async(e) => {
  // 判断是否存在消息
  if (!e?.message?.length) return false
  // 判断是否为机器人消息
  if (e.user_id == (e.bot ?? Bot).uin) return false
  // 判断是否主人消息
  if (Config.masterQQ.includes(e.user_id)) return false
  // 消息通知
  let msg = null
  let specialMsg = null
  let rawMsg = null
  const cfg = Config.getNotice(e.self_id, e.group_id)
  // 特殊消息处理
  const msgType = getMsgType(e.message)
  if (msgType) {
    specialMsg = msgType.msg
    rawMsg = [ msgType.type ]
  } else {
    rawMsg = e.message
  }

  switch (e.message_type) {
    case "group": {
      if (!cfg.groupMessage) return false
      logger.info("[Yenai-Plugin]群聊消息")
      msg = [
        segment.image(`https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/100`),
      `[消息(${e.self_id}) - 群聊消息]\n`,
      `来源群号：${e.group_id}\n`,
      `来源群名：${e.group_name}\n`,
      `发送人账号：${e.user_id}\n`,
      `发送人昵称：${e.sender.nickname}\n`,
      "消息内容：",
      ...rawMsg
      ]
      break
    }
    case "private": {
      if (e.sub_type === "friend") {
        if (!cfg.privateMessage) return false

        logger.info("[Yenai-Plugin]好友消息")
        msg = [
          segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${e.user_id}`),
          `[消息(${e.self_id}) - 好友消息]\n`,
          `好友账号：${e.user_id}\n`,
          `好友昵称：${e.sender.nickname}\n`,
          "消息内容：",
          ...rawMsg
        ]
        // 添加提示消息
        const key = `yenai:notice:privateMessage:${e.user_id}`
        if (!(await redis.get(key))) {
          await redis.set(key, "1", { EX: 600 })
          msg.push(
            "\n-------------\n",
            "引用该消息：回复 <内容>\n",
        `或发送:回复 ${e.user_id} <内容>`
          )
        }
      } else if (e.sub_type === "group") {
        if (!cfg.grouptemporaryMessage) return false
        logger.info("[Yenai-Plugin]群临时消息")
        // 发送的消息
        msg = [
          segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${e.user_id}`),
          `[消息(${e.self_id}) - 群临时消息]\n`,
          `来源群号：${e.sender.group_id}\n`,
          `发送人账号：${e.user_id}\n`,
          "消息内容：",
          ...rawMsg
        ]
        // 添加提示消息
        const key = `yenai:notice:tempprivateMessage:${e.user_id}`
        if (!(await redis.get(key))) {
          await redis.set(key, "1", { EX: 600 })
          msg.push(
            "\n-------------\n",
            "可回复 \"加为好友\" 添加好友\n或 \"回复 <消息>\""
          )
        }
      }
      break
    }
    default:
      return false
  }
  if (!msg) return
  // 发送消息
  await common.sendMasterMsg(msg, (e.bot ?? Bot).uin)
  if (specialMsg) await common.sendMasterMsg(specialMsg, (e.bot ?? Bot).uin)
})

/**
 * 特殊消息处理
 * @param msg
 */
function getMsgType(msg) {
  const msgType = {
    record: {
      msg: segment.record(msg[0].url),
      type: "[语音]"
    },
    video: {
      msg: segment.video(msg[0].file),
      type: "[视频]"
    },
    xml: {
      msg,
      type: "[合并消息]"
    },
    json: {
      msg,
      type: "[JSON]"
    }
  }
  return msgType[msg[0].type]
}
