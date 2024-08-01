import { funApi, common, memes } from "../model/index.js"
import _ from "lodash"
import { Config } from "../components/index.js"

Bot.on("message.group", e => {
  if (e?.message?.[0]?.text == "#全部赞我") { (new ThumbUp()).thumbUp(e) }
})

export class ThumbUp extends plugin {
  constructor(e) {
    super({
      name: "椰奶点赞",
      event: "message",
      priority: 500,
      rule: [
        {
          reg: "^#?((我要|给我)?(资料卡)?(点赞)|(赞|超|操|草|抄|吵|炒)(我|他|她|它|TA|ta|Ta))$",
          fnc: "thumbUp"
        }
      ]
    })
  }

  /**
   * 点赞
   * @param e
   */
  async thumbUp(e) {
    const message = e.msg || e.message?.[0]?.text
    const DO_ZAN = "赞"
    const DO_CHAO = "超"
    let doType = DO_ZAN
    let userId = e.user_id
    let isSelf = true

    // 使用数组和includes方法的正确用法
    const forbiddenWords = [ "超", "操", "草", "抄", "吵", "炒" ]
    if (forbiddenWords.some(word => message.includes(word))) {
      doType = DO_CHAO
    }

    const atWords = [ "他", "她", "它", "TA", "ta", "Ta" ]
    if (e.at && atWords.some(word => message.includes(word))) {
      userId = e.at
      isSelf = false
    }
    /** 判断是否为好友 */
    let isFriend = await (e.bot ?? Bot).fl.get(userId)
    let allowLikeByStrangers = Config.whole.Strangers_love
    if (!isFriend && !allowLikeByStrangers) {
      return (message == "#全部赞我") ? false : e.reply(`不加好友不${doType}🙄`, true)
    }

    /** 执行点赞 */
    let n = 0
    let failsMsg = `今天已经${doType}过了，还搁这讨${doType}呢！！！`
    let thumbUpApi = new funApi.ThumbUpApi(e) // 复用ThumbUpApi实例
    for (let i = 0; i < 10; i++) {
      let res = null
      try {
        res = await thumbUpApi.thumbUp(userId, 10)
      } catch (error) {
        logger.error(error)
        return common.handleException(e, error)
      }

      logger.debug(`${e.logFnc}给${userId}点赞`, res)

      if (res.code) {
        if (res.code == 1) {
          failsMsg = `${doType}失败，请检查是否开启陌生人点赞或添加好友`
        } else if (res.code == 51 && isSelf) {
          failsMsg = generateFailMsg(doType, res.msg).replace("他", "你")
        } else {
          failsMsg = generateFailMsg(doType, res.msg)
        }
        break
      } else {
        n += 10
      }
    }
    let successMsg = `给${isSelf ? "你" : userId}${doType}了${n}下哦，记得回我~ ${isFriend ? "" : `(如${doType}失败请添加好友)`}`
    const avatar = `https://q1.qlogo.cn/g?b=qq&s=100&nk=${userId}`
    const successFn = _.sample([ "ganyu", "zan" ])
    const mention = segment.at(userId)

    if (message == "#全部赞我")failsMsg = "return"
    /** 判断点赞是否成功 */
    let msg = await generateResponseMsg(n > 0, successMsg, failsMsg, avatar, successFn, mention)

    /** 回复 */
    if (msg.length) { return e.reply(msg, true) }
  }
}
// 工具函数：生成失败消息
function generateFailMsg(doType, originalMsg) {
  let failsMsg
  if (doType === "超") {
    failsMsg = originalMsg.replace(/点赞/g, "超").replace("给", "超").replace("点", "").replace("个赞", "下")
  } else {
    failsMsg = originalMsg
  }
  return failsMsg
}
// 工具函数：生成响应消息
async function generateResponseMsg(isSuccess, successMsg, failsMsg, avatar, successFn, mention) {
  if (isSuccess) {
    const imageSegment = segment.image((await memes[successFn](avatar)))
    return [ mention, `\n${successMsg}`, imageSegment ]
  } else {
    const imageSegment = segment.image((await memes.crawl(avatar)))
    if (failsMsg == "return") return []
    return [ mention, `\n${failsMsg}`, imageSegment ]
  }
}
