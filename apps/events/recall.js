import { Config } from "../../components/index.js"
import moment from "moment"
import { common } from "../../model/index.js"

const redisKeyPre = "yenai:notice:message"
const redisKeyPreGroup = redisKeyPre + "Group:"
const redisKeyPrePrivate = redisKeyPre + "Private:"
Bot.on?.("message", async(e) => {
  // 判断是否存在消息
  if (!e?.message?.length) return false
  // 判断是否为机器人消息
  if (e.user_id == (e.bot ?? Bot).uin) return false
  // 判断是否主人消息
  if (Config.masterQQ.includes(e.user_id)) return false

  const deltime = Config.whole.deltime
  // 判断群聊还是私聊
  if (e.message_type == "group") {
    // 关闭撤回停止存储
    if (Config.getAlone(e.self_id, e.group_id).groupRecall) {
      // logger.debug(`[Yenai-Plugin]存储群消息${e.group_id}=>${e.message_id}`)
      // 写入
      await redis.set(
        redisKeyPreGroup + e.message_id,
        JSON.stringify(e.message),
        { EX: deltime }
      )
    }
  } else if (e.message_type == "private") {
    // 关闭撤回停止存储
    if (Config.getAlone(e.self_id).PrivateRecall) {
      // logger.debug(`[Yenai-Plugin]存储私聊消息${e.user_id}=>${e.message_id}`)
      // 写入
      await redis.set(
        redisKeyPrePrivate + e.message_id,
        JSON.stringify(e.message),
        { EX: deltime }
      )
    }
  }
})

Bot.on?.("notice.group.recall", async(e) => {
  const bot = e.bot ?? Bot
  // 开启或关闭
  if (!Config.getAlone(e.self_id, e.group_id).groupRecall) return false
  // 是否为机器人撤回
  if (e.user_id == bot.uin || e.operator_id == bot.uin) return false
  // 是否为主人撤回
  if (Config.masterQQ.includes(e.user_id)) return false
  // 读取
  const rawMsg = JSON.parse(await redis.get(redisKeyPreGroup + e.message_id))
  // 无数据 return出去
  if (!rawMsg) return false
  const { type } = rawMsg[0]
  const msgType = getSpecialMsgType(rawMsg)
  let special = ""
  let forwardMsg = null
  let msg = null
  if (msgType[type]) {
    forwardMsg = await msgType[type].msg()
    special = msgType[type].type
  } else {
    // 正常处理
    forwardMsg = await Bot.makeForwardMsg([
      {
        message: rawMsg,
        nickname: e.group.pickMember(e.user_id).card,
        user_id: e.user_id
      }
    ], true)
  }
  // 判断是否管理撤回
  let isManage = ""
  if (e.operator_id != e.user_id) {
    isManage = `撤回管理：${e.group.pickMember(e.operator_id).card}(${e.operator_id})\n`
  }
  isManage ? logger.info("[Yenai-Plugin]群聊管理撤回") : logger.info("[Yenai-Plugin]群聊撤回")
  // 发送的消息
  msg = [
    segment.image(`https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/100`),
    `[通知(${e.self_id}) - 群聊${isManage ? "管理" : ""}撤回]\n`,
    `撤回群名：${e.group_name}\n`,
    `撤回群号：${e.group_id}\n`,
    isManage,
    `${isManage ? "被撤回人" : "撤回人员"}：${e.group.pickMember(e.user_id).card
    }(${e.user_id})\n`,
    `撤回时间：${moment(e.time * 1000).format("MM-DD HH:mm:ss")}`,
    special ? `\n特殊消息：${special}` : ""
  ]
  sendMsg(bot, msg, forwardMsg)
})

Bot.on?.("notice.friend.recall", async(e) => {
  if (!Config.getAlone(e.self_id).PrivateRecall) return false

  if (e.user_id == (e.bot ?? Bot).uin) return false

  if (Config.masterQQ.includes(e.user_id)) return false

  logger.info("[Yenai-Plugin]好友撤回")

  let rawMsg = JSON.parse(await redis.get(redisKeyPrePrivate + e.message_id))

  if (!rawMsg) return false
  let forwardMsg = null
  let msg = null
  const msgType = getSpecialMsgType(rawMsg)
  const { type } = rawMsg[0]
  if (msgType[type]) {
    forwardMsg = msgType[type].msg()
    rawMsg = msgType[type].type
  }
  // 消息
  msg = [
    segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${e.user_id}`),
    `[消息(${e.self_id}) - 好友撤回消息]\n`,
    `好友账号：${e.user_id}\n`,
    `撤回时间：${moment(e.time * 1000).format("MM-DD HH:mm:ss")}\n`,
    "撤回消息：",
    ...rawMsg
  ]
  sendMsg(e.bot ?? Bot, msg, forwardMsg)
})
async function sendMsg(bot, msg, forwardMsg = null) {
  await common.sendMasterMsg(msg, bot.uin)
  if (forwardMsg) await common.sendMasterMsg(forwardMsg, bot.uin)
}
function getSpecialMsgType(rawMsg) {
  const { url, file } = rawMsg[0]
  return {
    record: {
      msg: () => segment.record(url),
      type: "[语音]"
    },
    video: {
      msg: () => segment.video(file),
      type: "[视频]"
    },
    xml: {
      msg: () => rawMsg,
      type: "[合并消息]"
    }
  }
}
