import { funApi, common, memes } from "../model/index.js"
import _ from "lodash"
import { Config } from "../components/index.js"
import { successImgs, faildsImgs } from "../constants/fun.js"

export class ThumbUp extends plugin {
  constructor (e) {
    super({
      name: "椰奶点赞",
      event: "message",
      priority: 500,
      rule: [
        {
          reg: "^#?((我要|给我)?(资料卡)?(点赞)?(赞|超|操|草|抄|吵|炒)我)$|((赞|超|操|草|抄|吵|炒)(他|她|它|TA|ta|Ta))$",
          fnc: "thumbUp"
        }
      ]
    })
    if (e?.message?.[0]?.text == "#全部赞我") { this.thumbUp(e) }
  }

  /**
   * 点赞
   * @param e
   */
  async thumbUp (e) {
    let _do = "赞"
    let userId = e.user_id
    let isSelf = true
    if (e.msg.includes("超", "操", "草", "抄", "吵", "炒")) {
      _do = "超"
    }
    if (e.at && e.msg.includes("他", "她", "它", "TA", "ta", "Ta")) {
      userId = e.at
      isSelf = false
    }
    /** 判断是否为好友 */
    let isFriend = await (e.bot ?? Bot).fl.get(userId)
    let allowLikeByStrangers = Config.whole.Strangers_love
    if (!isFriend && !allowLikeByStrangers) { return (e.message?.[0]?.text == "#全部赞我") ? false : e.reply(`不加好友不${_do}🙄`, true) }
    /** 执行点赞 */
    let n = 0
    let failsMsg = `今天已经${_do}过了，还搁这讨${_do}呢！！！`
    for (let i = 0; i < 10; i++) {
      let res = null
      try {
        res = await new funApi.ThumbUpApi(e).thumbUp(userId, 10)
      } catch (error) {
        logger.error(error)
        return common.handleException(e, error)
      }
      logger.debug(`${e.logFnc}给${userId}点赞`, res)
      if (res.code) {
        if (res.code == 1) {
          failsMsg = `${_do}失败，请检查是否开启陌生人点赞或添加好友`
        } else {
          if (_do == "超") {
            failsMsg = res.msg.replace(/点赞/g, "超").replace("给", "超").replace("点", "").replace("个赞", "下")
          } else {
            failsMsg = res.msg
          }
        }
        break
      } else {
        n += 10
      }
    }
    let successMsg = `给${isSelf ? "你" : userId}${_do}了${n}下哦，记得回我~ ${isFriend ? "" : `(如${_do}失败请添加好友)`}`
    const avatar = `https://q1.qlogo.cn/g?b=qq&s=100&nk=${userId}`
    const successFn = _.sample([ "ganyu", "zan" ])

    /** 判断点赞是否成功 */
    let msg = n > 0
      ? [
          `\n${successMsg}`,
          segment.image((await memes[successFn](avatar)) ||
            _.sample(successImgs) + userId)
        ]
      : (e.message?.[0]?.text == "#全部赞我")
          ? []
          : [
          `\n${failsMsg}`,
          segment.image((await memes.crawl(avatar)) ||
            _.sample(faildsImgs) + userId)
            ]

    /** 回复 */
    if (msg.length) { return e.reply(msg, true, { at: userId }) }
  }
}
