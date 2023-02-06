import plugin from '../../../lib/plugins/plugin.js'
import { Config } from '../components/index.js'
import { Pixiv, common, setu } from '../model/index.js'

// 文案
const SWITCH_ERROR = '主人没有开放这个功能哦(＊／ω＼＊)'
// 汉字数字匹配正则
const numReg = '[一壹二两三四五六七八九十百千万亿\\d]+'
// 正则
const pidReg = /^#?pid搜图\s?(\d+)$/i

const rankingrReg = new RegExp(`^#?看看((\\d{4}-\\d{1,2}-\\d{1,2})的)?(${Object.keys(Pixiv.ranktype).join('|')})(r18)?榜\\s?(第(${numReg})页)?$`, 'i')
const tagReg = new RegExp(`^#?tag(pro)?搜图(.*?)(第(${numReg})页)?$`, 'i')
const uidReg = new RegExp(`^#?uid搜图(.*?)(第(${numReg})页)?$`, 'i')
const searchUser = new RegExp(`^#?user搜索(.*?)(第(${numReg})页)?$`, 'i')
const randomImgReg = new RegExp(`^#?来(${numReg})?张(好(康|看)(的|哒)|hkd|涩图)$|#有内鬼$`)

export class NewPixiv extends plugin {
  constructor () {
    super({
      name: '椰奶pixiv',
      event: 'message',
      priority: 500,
      rule: [
        {
          reg: pidReg,
          fnc: 'searchPid'
        },
        {
          reg: rankingrReg,
          fnc: 'pixivRanking'
        },
        {
          reg: tagReg,
          fnc: 'searchTags'
        },
        {
          reg: uidReg,
          fnc: 'searchUid'
        },
        {
          reg: searchUser,
          fnc: 'searchUser'
        },
        {
          reg: randomImgReg,
          fnc: 'randomImg'
        },
        {
          reg: '^#?(查看|获取)?热门(t|T)(a|A)(g|G)$',
          fnc: 'trendTags'
        },
        {
          reg: '^#?看?看?相关作品(\\d+)$',
          fnc: 'related'
        },
        {
          reg: '^#?(P|p)ximg(pro)?$',
          fnc: 'pximg'
        },
        {
          reg: '^#(p站|pixiv)(查看|更换)代理.*$',
          fnc: 'setProxy',
          permission: 'master'
        },
        {
          reg: '^#(p站|pixiv)(开启|关闭)直连$',
          fnc: 'directConnection',
          permission: 'master'
        }
      ]
    })
  }

  // pid搜图
  async searchPid (e) {
    let { sese, sesepro } = Config.getGroup(e.group_id)
    if (!sese && !sesepro && !e.isMaster) return e.reply(SWITCH_ERROR)

    e.reply(Pixiv.startMsg)

    let regRet = pidReg.exec(e.msg)

    let res = await Pixiv.illust(regRet[1], !e.isMaster && !setu.getR18(e.group_id))

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

    e.reply(Pixiv.startMsg)

    let page = common.translateChinaNum(regRet[6])
    let res = await Pixiv.Rank(page, regRet[2], regRet[3], regRet[4])

    if (res?.error) return e.reply(res.error)

    common.getRecallsendMsg(e, res)

    return true
  }

  /** 关键词搜图 */
  async searchTags (e) {
    let regRet = tagReg.exec(e.msg)

    let { sese, sesepro } = Config.getGroup(e.group_id)
    if (((!sese && !sesepro) || (!sesepro && regRet[1])) && !e.isMaster) return e.reply(SWITCH_ERROR)

    e.reply(Pixiv.startMsg)

    let page = common.translateChinaNum(regRet[4])
    let res = await Pixiv[`searchTags${regRet[1] ? 'pro' : ''}`](regRet[2], page, !setu.getR18(e.group_id))
    if (res?.error) return e.reply(res.error)

    common.getRecallsendMsg(e, res)
  }

  /** 获取热门tag */
  async PopularTags (e) {
    let { sese, sesepro } = Config.getGroup(e.group_id)
    if (!sese && !sesepro && !e.isMaster) return e.reply(SWITCH_ERROR)

    e.reply(Pixiv.startMsg)

    let res = await Pixiv.PopularTags()

    if (res?.error) return e.reply(res.error)

    common.getRecallsendMsg(e, res)
  }

  /** 以uid搜图**/
  async searchUid (e) {
    let { sese, sesepro } = Config.getGroup(e.group_id)
    if (!sese && !sesepro && !e.isMaster) return e.reply(SWITCH_ERROR)

    e.reply(Pixiv.startMsg)

    let regRet = uidReg.exec(e.msg)
    let page = common.translateChinaNum(regRet[3])

    let res = await Pixiv.userIllust(regRet[1], page, !setu.getR18(e.group_id))

    if (res?.error) return e.reply(res.error)

    common.getRecallsendMsg(e, res)
  }

  // 随机原创插画
  async randomImg (e) {
    let { sese, sesepro } = Config.getGroup(e.group_id)
    if (!sese && !sesepro && !e.isMaster) return e.reply(SWITCH_ERROR)

    e.reply(Pixiv.startMsg)

    let regRet = randomImgReg.exec(e.msg)

    let num = regRet[1] || 1
    if (num > 50) {
      e.reply('你要的太多辣，奴家只给你一张辣(•́へ•́ ╬)')
      num = 1
    }
    num = common.translateChinaNum(num)
    let res = await Pixiv.randomImg(num)

    if (res?.error) return e.reply(res.error)

    common.getRecallsendMsg(e, res)
  }

  // 相关作品
  async related (e) {
    let { sese, sesepro } = Config.getGroup(e.group_id)
    if (!sese && !sesepro && !e.isMaster) return e.reply(SWITCH_ERROR)

    e.reply(Pixiv.startMsg)

    let regRet = e.msg.match(/\d+/)
    let res = await Pixiv.related(regRet[0], !setu.getR18(e.group_id))
    if (res?.error) return e.reply(res.error)
    common.getRecallsendMsg(e, res)
  }

  // p站单图
  async pximg (e) {
    let ispro = /pro/.test(e.msg)

    let { sese, sesepro } = Config.getGroup(e.group_id)
    if (((!sese && !sesepro) || (!sesepro && ispro)) && !e.isMaster) return e.reply(SWITCH_ERROR)

    let res = await Pixiv.pximg(ispro)
    if (res?.error) return e.reply(res.error)
    ispro ? common.getRecallsendMsg(e, [res]) : common.recallsendMsg(e, res)
  }

  /** 搜索用户 */
  async searchUser (e) {
    let { sese, sesepro } = Config.getGroup(e.group_id)
    if (!sese && !sesepro && !e.isMaster) return e.reply(SWITCH_ERROR)

    e.reply(Pixiv.startMsg)
    let regRet = e.msg.match(searchUser)
    let page = common.translateChinaNum(regRet[3])
    let msg = await Pixiv.searchUser(regRet[1], page, !setu.getR18(e.group_id))
    if (msg.error) return e.reply(msg.error)

    common.getRecallsendMsg(e, msg)
  }

  // 更换代理
  async setProxy (e) {
    let proxydef = [
      'i.pixiv.re',
      'proxy.pixivel.moe',
      'px2.rainchan.win',
      'sex.nyan.xyz'
    ]
    if (/查看/.test(e.msg)) return e.reply(await redis.get('yenai:proxy'))
    let proxy = e.msg.replace(/#|(p站|pixiv)更换代理/g, '').trim()
    if (/^[1234]$/.test(proxy)) proxy = proxydef[proxy - 1]
    if (!/([\w\d]+\.){2}[\w\d]+/.test(proxy)) return e.reply('请检查代理地址是否正确')
    logger.mark(`${e.logFnc}切换为${proxy}`)
    Config.modify('pixiv', 'pixivImageProxy', proxy)
    e.reply(`✅ 已经切换代理为「${proxy}」`)
  }

  /** 图片直连 */
  async directConnection (e) {
    if (!e.isMaster) return false
    Config.modify('pixiv', 'pixivDirectConnection', /开启/.test(e.msg))
    e.reply(`✅ 已${/开启/.test(e.msg) ? '开启' : '关闭'}Pixiv直连`)
  }
}
