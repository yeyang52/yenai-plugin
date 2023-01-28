import plugin from '../../../lib/plugins/plugin.js'
import { Config } from '../components/index.js'
import { Pixiv, common, setu } from '../model/index.js'

// 文案
const SWITCH_ERROR = '主人没有开放这个功能哦(＊／ω＼＊)'
// 汉字数字匹配正则
let numReg = '[一壹二两三四五六七八九十百千万亿\\d]+'
// 正则
let rankingrReg = new RegExp(`^#?看看((\\d{4}-\\d{1,2}-\\d{1,2})的)?(${Object.keys(Pixiv.RankReg).join('|')})(r18)?榜\\s?(第(${numReg})页)?$`, 'i')
let tagReg = /^#?tag(pro)?搜图(.*)$/i
let pidReg = /^#?pid搜图\s?(\d+)$/i
let uidReg = /^#?uid搜图(.*)$/i
let randomImgReg = new RegExp(`^#?来(${numReg})?张(好(康|看)(的|哒)|hkd|涩图)$|#有内鬼$`)

export class example extends plugin {
  constructor () {
    super({
      name: '椰奶pixiv',
      event: 'message',
      priority: 500,
      rule: [
        {
          reg: pidReg,
          fnc: 'saucenaoPid'
        },
        {
          reg: rankingrReg,
          fnc: 'pixivRanking'
        },
        {
          reg: tagReg,
          fnc: 'saucenaoTags'
        },
        {
          reg: '^#?(查看|获取)?热门(t|T)(a|A)(g|G)$',
          fnc: 'trendTags'
        },
        {
          reg: uidReg,
          fnc: 'saucenaoUid'
        },
        {
          reg: randomImgReg,
          fnc: 'randomImg'
        },
        {
          reg: '^#?看?看?相关作品(\\d+)$',
          fnc: 'relatedWorks'
        },
        {
          reg: '^#?(P|p)ximg(pro)?$',
          fnc: 'pximg'
        }
      ]
    })
  }

  // pid搜图
  async saucenaoPid (e) {
    let { sese, sesepro } = Config.getGroup(e.group_id)
    if (!sese && !sesepro && !e.isMaster) return e.reply(SWITCH_ERROR)

    await e.reply('你先别急，正在给你搜了(。-ω-)zzz')

    let regRet = pidReg.exec(e.msg)

    let res = await Pixiv.Worker(regRet[1], !e.isMaster && !setu.getR18(e.group_id))

    if (res?.error) return e.reply(res.error)

    let { msg, img } = res

    await e.reply(msg)

    img.length == 1 ? common.recallsendMsg(e, img) : common.getRecallsendMsg(e, img, false)
  }

  // p站排行榜
  async pixivRanking (e) {
    let regRet = rankingrReg.exec(e.msg)
    let { sese, sesepro } = Config.getGroup(e.group_id)
    if (((!sese && !sesepro) || (regRet[4] && !setu.getR18(e.group_id))) && !e.isMaster) {
      return e.reply(SWITCH_ERROR)
    }

    await e.reply('你先别急，马上去给你找哦ε(*´･ω･)з')

    let page = common.translateChinaNum(regRet[6] || 1)
    let res = await Pixiv.Rank(page, regRet[2], regRet[3], regRet[4])

    if (res?.error) return e.reply(res.error)

    common.getRecallsendMsg(e, res)

    return true
  }

  /** 关键词搜图 */
  async saucenaoTags (e) {
    let regRet = tagReg.exec(e.msg)

    let { sese, sesepro } = Config.getGroup(e.group_id)
    if (((!sese && !sesepro) || (!sesepro && regRet[1])) && !e.isMaster) {
      return e.reply('主人没有开放这个功能哦(＊／ω＼＊)')
    }

    await e.reply('你先别急，正在给你搜了(。-ω-)zzz')

    let tag = regRet[2]

    let pagereg = new RegExp(`第(${numReg})页`)

    let page = pagereg.exec(e.msg)

    if (page) {
      tag = tag.replace(page[0], '')
      page = common.translateChinaNum(page[1])
    } else {
      page = '1'
    }
    let res = null
    if (regRet[1]) {
      res = await Pixiv.searchTagspro(tag, page, !setu.getR18(e.group_id))
    } else {
      res = await Pixiv.searchTags(tag, page)
    }
    if (res?.error) return e.reply(res.error)
    common.getRecallsendMsg(e, res)

    return true
  }

  /** 获取热门tag */
  async trendTags (e) {
    let { sese, sesepro } = Config.getGroup(e.group_id)
    if (!sese && !sesepro && !e.isMaster) return e.reply(SWITCH_ERROR)
    await e.reply('你先别急，马上去给你找哦ε(*´･ω･)з')

    let res = await Pixiv.gettrend_tags()

    if (res?.error) return e.reply(res.error)

    common.getRecallsendMsg(e, res)
  }

  /** 以uid搜图**/
  async saucenaoUid (e) {
    let { sese, sesepro } = Config.getGroup(e.group_id)
    if (!sese && !sesepro && !e.isMaster) return e.reply(SWITCH_ERROR)
    await e.reply('你先别急，正在给你搜了(。-ω-)zzz')

    let regRet = uidReg.exec(e.msg)

    let key = regRet[1]

    let pagereg = new RegExp(`第(${numReg})页`)

    let page = pagereg.exec(e.msg)

    if (page) {
      key = key.replace(page[0], '')
      page = page[1]
    } else {
      page = '1'
    }
    page = common.translateChinaNum(page)

    let res = await Pixiv.public(key, page, !setu.getR18(e.group_id))

    if (res?.error) return e.reply(res.error)

    common.getRecallsendMsg(e, res)
  }

  // 随机原创插画
  async randomImg (e) {
    let { sese, sesepro } = Config.getGroup(e.group_id)
    if (!sese && !sesepro && !e.isMaster) return e.reply(SWITCH_ERROR)
    await e.reply('你先别急，马上去给你找哦ε(*´･ω･)з')

    let regRet = randomImgReg.exec(e.msg)

    let num = regRet[1] || 1
    if (num > 50) {
      e.reply('你要的太多辣，奴家只给你一张辣(•́へ•́ ╬)')
      num = 1
    }
    num = common.translateChinaNum(num)
    let res = await Pixiv.getrandomimg(num)

    if (res?.error) return e.reply(res.error)

    common.getRecallsendMsg(e, res)
  }

  // 相关作品
  async relatedWorks (e) {
    let { sese, sesepro } = Config.getGroup(e.group_id)
    if (!sese && !sesepro && !e.isMaster) return e.reply(SWITCH_ERROR)
    await e.reply('你先别急，马上去给你找哦ε(*´･ω･)з')
    let regRet = e.msg.match(/\d+/)
    let res = await Pixiv.getrelated_works(regRet[0], !setu.getR18(e.group_id))
    if (res?.error) return e.reply(res.error)
    common.getRecallsendMsg(e, res)
  }

  // p站单图
  async pximg (e) {
    let ispro = /pro/.test(e.msg)

    let { sese, sesepro } = Config.getGroup(e.group_id)
    if (((!sese && !sesepro) || (!sesepro && ispro)) && !e.isMaster) return e.reply(SWITCH_ERROR)

    let res = await Pixiv.getPximg(ispro)
    if (res?.error) return e.reply(res.error)
    ispro ? common.getRecallsendMsg(e, [res]) : common.recallsendMsg(e, res)
  }
}
