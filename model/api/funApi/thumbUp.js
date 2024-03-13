import _ from 'lodash'
import { memes, common } from '../../index.js'
import { Config } from '../../../components/index.js'
import { successImgs, faildsImgs } from '../../../constants/fun.js'

export default async function thumbUp (e) {
  let _do = '赞'
  let userId = e.user_id
  let isSelf = true
  if (e.msg.includes('超', '操', '草', '抄', '吵', '炒')) {
    _do = '超'
  }
  if (e.at && e.msg.includes('他', '她', '它', 'TA', 'ta', 'Ta')) {
    userId = e.at
    isSelf = false
  }
  /** 判断是否为好友 */
  let isFriend = await (e.bot ?? Bot).fl.get(userId)
  let allowLikeByStrangers = Config.whole.Strangers_love
  if (!isFriend && !allowLikeByStrangers) return e.reply(`不加好友不${_do}🙄`, true)
  /** 执行点赞 */
  let n = 0
  let failsMsg = `今天已经${_do}过了，还搁这讨${_do}呢！！！`
  for (let i = 0; i < 10; i++) {
    let res = null
    try {
      res = await new ThumbUpApi(e).thumbUp(userId, 10)
    } catch (error) {
      logger.error(error)
      return common.handleException(e, error)
    }
    logger.debug(`${e.logFnc}给${userId}点赞`, res)
    if (res.code) {
      if (res.code == 1) {
        failsMsg = `${_do}失败，请检查是否开启陌生人点赞或添加好友`
      } else {
        if (_do == '超') {
          failsMsg = res.msg.replace(/点赞/g, '超').replace('给', '超').replace('点', '').replace('个赞', '下')
        } else {
          failsMsg = res.msg
        }
      }
      break
    } else {
      n += 10
    }
  }
  let successMsg = `给${isSelf ? '你' : userId}${_do}了${n}下哦，记得回我~ ${isFriend ? '' : `(如${_do}失败请添加好友)`}`
  const avatar = `https://q1.qlogo.cn/g?b=qq&s=100&nk=${userId}`
  const successFn = _.sample(['ganyu', 'zan'])

  /** 判断点赞是否成功 */
  let msg = n > 0
    ? [
          `\n${successMsg}`,
          segment.image((await memes[successFn](avatar)) ||
            _.sample(successImgs) + userId)
      ]
    : [
          `\n${failsMsg}`,
          segment.image((await memes.crawl(avatar)) ||
            _.sample(faildsImgs) + userId)
      ]

  /** 回复 */
  e.reply(msg, true, { at: userId })
}

class ThumbUpApi {
  constructor (e) {
    this.e = e
    this.Bot = e.bot ?? Bot
  }

  /**
     * @description: 陌生人点赞
     * @param {Number} uid QQ号
     * @param {Number} times 数量
     * @return {Object}
     */
  async thumbUp (uid, times = 1) {
    try {
      let core = this.Bot.icqq?.core
      if (!core) core = (await import('icqq')).core
      if (times > 20) { times = 20 }
      let ReqFavorite
      if (this.Bot.fl.get(uid)) {
        ReqFavorite = core.jce.encodeStruct([
          core.jce.encodeNested([
            this.Bot.uin, 1, this.Bot.sig.seq + 1, 1, 0, Buffer.from('0C180001060131160131', 'hex')
          ]),
          uid, 0, 1, Number(times)
        ])
      } else {
        ReqFavorite = core.jce.encodeStruct([
          core.jce.encodeNested([
            this.Bot.uin, 1, this.Bot.sig.seq + 1, 1, 0, Buffer.from('0C180001060131160135', 'hex')
          ]),
          uid, 0, 5, Number(times)
        ])
      }
      const body = core.jce.encodeWrapper({ ReqFavorite }, 'VisitorSvc', 'ReqFavorite', this.Bot.sig.seq + 1)
      const payload = await this.Bot.sendUni('VisitorSvc.ReqFavorite', body)
      let result = core.jce.decodeWrapper(payload)[0]
      return { code: result[3], msg: result[4] }
    } catch (error) {
      return this.origThumbUp(uid, times)
    }
  }

  async origThumbUp (uid, times) {
    const friend = this.Bot.pickFriend(uid)
    if (!friend?.thumbUp) throw Error('当前协议端不支持点赞，详情查看\nhttps://gitee.com/TimeRainStarSky/Yunzai')
    const res = { ...await friend.thumbUp(times) }
    if (res.retcode && !res.code) { res.code = res.retcode }
    if (res.message && !res.msg) { res.msg = res.message }
    return res
  }
}
