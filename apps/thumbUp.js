import { funApi, common, memes } from "../model/index.js"
import _ from "lodash"
import { Config } from "../components/index.js"

!Config.thumbUp.cloneAllThumbUp && Bot.on("message.group", e => {
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
    const cfg = Config.thumbUp
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
    const variableMain = {
      at: segment.at(userId),
      doType,
      userId: isSelf ? "你" : userId
    }
    /** 判断是否为好友 */
    let isFriend = await (e.bot ?? Bot).fl.get(userId)
    let allowLikeByStrangers = cfg.strangeThumbUp
    if (!isFriend && !allowLikeByStrangers) {
      const msg = handleMsg(cfg.noFriendMsg, variableMain)
      if (!msg) return false
      return (message == "#全部赞我") ? false : e.reply(msg, true)
    }

    /** 执行点赞 */
    let n = 0

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
        // 暂不处理其他情况
        // if (!failsMsg) break
        // if (res.code == 1) {
        //   failsMsg = `${doType}失败，请检查是否开启陌生人点赞或添加好友`
        // } else if (res.code == 51 && isSelf) {
        //   failsMsg = generateFailMsg(doType, res.msg).replace("他", "你")
        // } else {
        //   failsMsg = generateFailMsg(doType, res.msg)
        // }
        break
      } else {
        n += 10
      }
    }
    const avatar = `https://q1.qlogo.cn/g?b=qq&s=100&nk=${userId}`
    async function getSuccessMsg() {
      const isImg = cfg.successMsg.includes("{{img}}")
      const successFn = _.sample([ "ganyu", "zan" ])
      const variableSuccess = {
        ...variableMain,
        thumbUpNum: n + "",
        img: isImg ? segment.image((await memes[successFn](avatar))) : false,
        isFriend
      }
      return handleMsg(cfg.successMsg, variableSuccess)
    }

    async function getfailsMsg() {
      const isImg = cfg.failsMsg.includes("{{img}}")
      return handleMsg(cfg.failsMsg, {
        ...variableMain,
        img: isImg ? segment.image((await memes.crawl(avatar))) : false
      })
    }

    if (message == "#全部赞我" && n == 0) return false
    /** 判断点赞是否成功 */
    let msg = n > 0 ? await getSuccessMsg() : await getfailsMsg()
    /** 回复 */
    if (msg?.length) {
      return e.reply(msg, true, { recallMsg: cfg.recall })
    }
  }
}
// 工具函数：生成失败消息
// function generateFailMsg(doType, originalMsg) {
//   let failsMsg
//   if (doType === "超") {
//     failsMsg = originalMsg.replace(/点赞/g, "超").replace("给", "超").replace("点", "").replace("个赞", "下")
//   } else {
//     failsMsg = originalMsg
//   }
//   return failsMsg
// }

const handleMsg = (msg, variable, regex = /{{(.*?)}}/g) => {
  if (!msg) return false
  let parse = parseMessage(msg, regex)
  if (!parse?.length) return false
  let res = parse.map(item => {
    regex.lastIndex = 0
    let reg = regex.exec(item)
    if (!reg) return item
    if (/^\s?noFriend:/.test(reg[1])) {
      if (variable.isFriend) {
        let s = reg[1].split("noFriend:")
        return handleMsg(s[1], variable, /{(.*?)}/g)
      } else {
        return ""
      }
    } else {
      return variable[reg[1]]
    }
  })
  return _.flatten(res).filter(Boolean)
}

function parseMessage(msg, regex) {
  try {
    let match
    const result = []
    let lastIndex = 0

    while ((match = regex.exec(msg)) !== null) {
      if (lastIndex < match.index) {
        result.push(msg.slice(lastIndex, match.index))
      }
      result.push(match[0])
      lastIndex = regex.lastIndex
    }

    if (lastIndex < msg.length) {
      result.push(msg.slice(lastIndex))
    }
    return result
  } catch (error) {
    logger.error("[Yenai-Plugin][点赞]自定义回复消息错误", error)
    return false
  }
}
