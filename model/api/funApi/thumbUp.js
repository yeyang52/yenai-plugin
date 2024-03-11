import _ from 'lodash'
import { QQApi, memes, common } from '../../index.js'
import { Config } from '../../../components/index.js'
import { successImgs, faildsImgs } from '../../../constants/fun.js'

export default async function thumbUp (e) {
  let _do = '赞'
  if (e.msg.includes('超', '操', '草', '抄', '吵', '炒')) {
    _do = '超'
  }
  /** 判断是赞自己还是赞别人 */
  if (e.at && e.msg.includes('他', '她', '它', 'TA', 'ta', 'Ta')) {
    /** 判断是否为好友 */
    let isFriend = await (e.bot ?? Bot).fl.get(e.at)
    let allowLikeByStrangers = Config.whole.Strangers_love
    if (!isFriend && !allowLikeByStrangers) return e.reply(`不加好友不${_do}🙄`, true)
    /** 执行点赞 */
    let n = 0
    let failsMsg = `今天已经${_do}过了，还搁这讨${_do}呢！！！`
    for (let i = 0; i < 10; i++) {
      let res = null
      try {
        res = await new QQApi(e).thumbUp(e.at, 10)
      } catch (error) {
        logger.error(error)
        return common.handleException(e, error)
      }
      logger.debug(`${e.logFnc}给${e.at}点赞`, res)
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
    let successMsg = `给${e.at}${_do}了${n}下哦，记得回我~ ${isFriend ? '' : `(如${_do}失败请添加好友)`}`
    const avatar = `https://q1.qlogo.cn/g?b=qq&s=100&nk=${e.at}`
    const successFn = _.sample(['ganyu', 'zan'])

    /** 判断点赞是否成功 */
    let msg = n > 0
      ? [
          `\n${successMsg}`,
          segment.image((await memes[successFn](avatar)) ||
            _.sample(successImgs) + e.user_id)
        ]
      : [
          `\n${failsMsg}`,
          segment.image((await memes.crawl(avatar)) ||
            _.sample(faildsImgs) + e.user_id)
        ]

    /** 回复 */
    e.reply(msg, true, { at: e.at })
  } else if (!e.msg.includes('他', '她', '它', 'TA', 'ta', 'Ta')) {
    /** 判断是否为好友 */
    let isFriend = await (e.bot ?? Bot).fl.get(e.user_id)
    let allowLikeByStrangers = Config.whole.Strangers_love
    if (!isFriend && !allowLikeByStrangers) return e.reply(`不加好友不${_do}🙄`, true)

    /** 执行点赞 */
    let n = 0
    let failsMsg = `今天已经${_do}过了，还搁这讨${_do}呢！！！`
    for (let i = 0; i < 10; i++) {
      let res = null
      try {
        res = await new QQApi(e).thumbUp(e.user_id, 10)
      } catch (error) {
        logger.error(error)
        return common.handleException(e, error)
      }
      logger.debug(`${e.logFnc}给${e.user_id}点赞`, res)
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
    let successMsg = `给你${_do}了${n}下哦，记得回我~ ${isFriend ? '' : `(如${_do}失败请添加好友)`}`
    const avatar = `https://q1.qlogo.cn/g?b=qq&s=100&nk=${e.user_id}`
    const successFn = _.sample(['ganyu', 'zan'])

    /** 判断点赞是否成功 */
    let msg = n > 0
      ? [
          `\n${successMsg}`,
          segment.image((await memes[successFn](avatar)) ||
            _.sample(successImgs) + e.user_id)
        ]
      : [
          `\n${failsMsg}`,
          segment.image((await memes.crawl(avatar)) ||
            _.sample(faildsImgs) + e.user_id)
        ]

    /** 回复 */
    e.reply(msg, true, { at: true })
  }
}
