import { common } from '../../model/index.js'
import { Config } from '../../components/index.js'

Bot.on?.('message', async (e) => {
  // 判断是否存在消息
  if (!e?.message?.length) return false
  // 判断是否为机器人消息
  if (e.user_id == (e.bot ?? Bot).uin) return false
  // 判断是否主人消息
  if (Config.masterQQ.includes(e.user_id)) return false
  // 删除缓存时间
  const deltime = Config.whole.deltime
  // 判断群聊还是私聊
  if (e.isGroup) {
    // 关闭撤回停止存储
    if (Config.getGroup(e.group_id).groupRecall) {
      logger.debug(`[Yenai-Plugin]存储群消息${(e.group_id)}}=> ${e.message_id}`)
      // 写入
      await redis.set(
        `notice:messageGroup:${e.message_id}`,
        JSON.stringify(e.message),
        { EX: deltime }
      )
    }
  } else if (e.isPrivate) {
    // 关闭撤回停止存储
    if (Config.whole.PrivateRecall) {
      logger.debug(`[Yenai-Plugin]存储私聊消息(${e.user_id})=> ${e.message_id}`)
      // 写入
      await redis.set(
        `notice:messagePrivate:${e.message_id}`,
        JSON.stringify(e.message),
        { EX: deltime }
      )
    }
  }
  // 消息通知
  let msg = null
  let forwardMsg = null
  if (
    e.message[0].type == 'flash' &&
    e.message_type === 'group'
  ) {
    if (!Config.getGroup(e.group_id).flashPhoto) return false
    logger.info('[Yenai-Plugin]群聊闪照')
    msg = [
      segment.image(`https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/100`),
      `[消息(${e.self_id}) - 闪照消息]\n`,
      `发送人账号：${e.user_id}\n`,
      `发送人昵称：${e.sender.nickname}\n`,
      `来源群号：${e.group_id}\n`,
      `来源群名：${e.group_name}\n`,
      `闪照链接:${e.message[0].url}`
    ]
  } else if (
    e.message[0].type == 'flash' &&
    e.message_type === 'discuss' &&
    Config.whole.flashPhoto
  ) {
    logger.info('[Yenai-Plugin]讨论组闪照')
    msg = [
      segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${e.user_id}`),
      `[消息(${e.self_id}) - 闪照消息]\n`,
      `发送人账号：${e.user_id}\n`,
      `发送人昵称：${e.sender.nickname}\n`,
      `讨论组号：${e.discuss_id}\n`,
      `讨论组名：${e.discuss_name}\n`,
      `闪照链接:${e.message[0].url}`
    ]
  } else if (
    e.message[0].type == 'flash' &&
    e.message_type === 'private' &&
    Config.whole.flashPhoto
  ) {
    logger.info('[Yenai-Plugin]好友闪照')
    msg = [
      segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${e.user_id}`),
      `[消息(${e.self_id}) - 闪照消息]\n`,
      `发送人账号：${e.user_id}\n`,
      `发送人昵称：${e.sender.nickname}\n`,
      `闪照链接:${e.message[0].url}`
    ]
  } else if (e.message_type === 'private' && e.sub_type === 'friend') {
    if (!Config.whole.privateMessage) return false

    // 特殊消息处理
    const arr = getMsgType(e.message)
    if (arr) {
      forwardMsg = arr.msg
      e.message = arr.type
    }
    logger.info('[Yenai-Plugin]好友消息')
    msg = [
      segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${e.user_id}`),
      `[消息(${e.self_id}) - 好友消息]\n`,
      `好友账号：${e.user_id}\n`,
      `好友昵称：${e.sender.nickname}\n`,
      '消息内容：',
      ...e.message
    ]
    // 添加提示消息
    const key = `yenai:notice:privateMessage:${e.user_id}`
    if (!(await redis.get(key))) {
      await redis.set(key, '1', { EX: 600 })
      msg.push(
        '\n-------------\n',
        '引用该消息：回复 <内容>\n',
        `或发送:回复 ${e.user_id} <内容>`
      )
    }
  } else if (e.message_type === 'private' && e.sub_type === 'group') {
    if (!Config.getGroup(e.group_id).grouptemporaryMessage) return false
    // 特殊消息处理
    const arr = getMsgType(e.message)
    if (arr) {
      forwardMsg = arr.msg
      e.message = arr.type
    }
    logger.info('[Yenai-Plugin]群临时消息')
    // 发送的消息
    msg = [
      segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${e.user_id}`),
      `[消息(${e.self_id}) - 群临时消息]\n`,
      `来源群号：${e.sender.group_id}\n`,
      `发送人账号：${e.user_id}\n`,
      '消息内容：',
      ...e.message
    ]
    // 添加提示消息
    const key = `yenai:notice:tempprivateMessage:${e.user_id}`
    if (!(await redis.get(key))) {
      await redis.set(key, '1', { EX: 600 })
      msg.push(
        '\n-------------\n',
        '可回复 "加为好友" 添加好友\n或 "回复 <消息>"'
      )
    }
  } else if (e.message_type === 'group') {
    if (!Config.getGroup(e.group_id).groupMessage) return false
    // 特殊消息处理
    const arr = getMsgType(e.message)
    if (arr) {
      forwardMsg = arr.msg
      e.message = arr.type
    }
    logger.info('[Yenai-Plugin]群聊消息')
    msg = [
      segment.image(`https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/100`),
      `[消息(${e.self_id}) - 群聊消息]\n`,
      `来源群号：${e.group_id}\n`,
      `来源群名：${e.group_name}\n`,
      `发送人账号：${e.user_id}\n`,
      `发送人昵称：${e.sender.nickname}\n`,
      '消息内容：',
      ...e.message
    ]
  } else if (e.message_type === 'discuss') {
    if (!Config.getGroup(e.group_id).groupMessage) return false
    logger.info('[Yenai-Plugin]讨论组消息')
    msg = [
      segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${e.user_id}`),
      `[消息(${e.self_id}) - 群聊消息]\n`,
      `来源讨论组号：${e.discuss_id}\n`,
      `来源讨论组名：${e.discuss_name}\n`,
      `发送人账号：${e.user_id}\n`,
      `发送人昵称：${e.sender.nickname}\n`,
      `消息内容：${e.raw_message}`
    ]
  } else {
    return false
  }
  // 发送消息
  await common.sendMasterMsg(msg)
  if (forwardMsg) await common.sendMasterMsg(forwardMsg)
})
// 特殊消息处理
function getMsgType (msg) {
  const msgType = {
    record: {
      msg: segment.record(msg[0].url),
      type: '[语音]'
    },
    video: {
      msg: segment.video(msg[0].file),
      type: '[视频]'
    },
    xml: {
      msg,
      type: '[合并消息]'
    }
  }
  return msgType[msg[0].type]
}
