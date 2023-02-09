import { Bika, common, Pixiv } from '../model/index.js'
import { Config } from '../components/index.js'

// 文案
const SWITCH_ERROR = '主人没有开放这个功能哦(＊／ω＼＊)'

// 汉字数字匹配正则
const numReg = '[一壹二两三四五六七八九十百千万亿\\d]+'
const Prefix = '(bika|哔咔)'
// 命令正则
const searchReg = new RegExp(`^#?${Prefix}(类别|作者|高级)?搜索(.*?)(第(${numReg})页)?$`)
const comicPageReg = new RegExp(`^#?${Prefix}id(.*?)(第(${numReg})页)?(第(${numReg})话)?$`)
export class NewBika extends plugin {
  constructor () {
    super({
      name: '椰奶哔咔',
      event: 'message',
      priority: 2000,
      rule: [
        {
          reg: searchReg,
          fnc: 'search'
        },
        {
          reg: comicPageReg,
          fnc: 'comicPage'
        },
        {
          reg: `^#?${Prefix}看\\d+$`,
          fnc: 'viewComicPage'
        },
        {
          reg: `^#?${Prefix}类别列表$`,
          fnc: 'categories'
        },
        {
          reg: `^#?${Prefix}(详情|细节)(.*)$`,
          fnc: 'comicDetail'
        },
        {
          reg: `^#?${Prefix}修改图片质量(.*)$`,
          fnc: 'imageQuality'
        },
        {
          reg: `^#?${Prefix}(开启|关闭)直连$`,
          fnc: 'directConnection'
        }
      ]

    })
  }

  /** 搜索 */
  async search (e) {
    if (!await this.Authentication(e)) return
    e.reply(Pixiv.startMsg)
    let regRet = e.msg.match(searchReg)
    let page = common.translateChinaNum(regRet[5])
    await Bika.search(regRet[3], page, regRet[2])
      .then(res => common.getRecallsendMsg(e, res))
      .catch(err => { e.reply(err.message) })
  }

  /** 漫画页面 */
  async comicPage (e) {
    if (!await this.Authentication(e)) return
    e.reply(Pixiv.startMsg)
    let regRet = e.msg.match(comicPageReg)
    let page = common.translateChinaNum(regRet[4])
    let order = common.translateChinaNum(regRet[6])
    await Bika.comicPage(regRet[2], page, order)
      .then(res => common.getRecallsendMsg(e, res))
      .catch(err => { e.reply(err.message) })
  }

  async viewComicPage (e) {
    if (!await this.Authentication(e)) return
    if (!Bika.searchCaching) return e.reply('请先搜索后再使用此命令')
    let number = e.msg.match(/\d+/) - 1
    let id = Bika.searchCaching[number]._id
    if (!id) return e.reply('未获取到目标作品，请使用id进行查看')
    await Bika.comicPage(id)
      .then(res => common.getRecallsendMsg(e, res))
      .catch(err => { e.reply(err.message) })
  }

  /** 类别列表 */
  async categories (e) {
    if (!await this.Authentication(e)) return
    e.reply(Pixiv.startMsg)
    await Bika.categories()
      .then(res => common.getRecallsendMsg(e, res))
      .catch(err => { e.reply(err.message) })
  }

  /** 漫画细节 */
  async comicDetail (e) {
    if (!await this.Authentication(e)) return
    e.reply(Pixiv.startMsg)
    let id = e.msg.match(new RegExp(`#?${Prefix}(详情|细节)(.*)`))[3]
    await Bika.comicDetail(id)
      .then(res => common.getRecallsendMsg(e, res, { oneMsg: true }))
      .catch(err => { e.reply(err.message) })
  }

  /** 图片质量 */
  async imageQuality (e) {
    let quality = e.msg.match(new RegExp(`#?${Prefix}修改图片质量(.*)`))[2]
    let imageQualityType = {
      低质量: 'low',
      中等质量: 'medium',
      高质量: 'high',
      原图: 'original'
    }
    if (!imageQualityType[quality] && !Object.values(imageQualityType).includes(quality)) return e.reply(`错误参数，支持的参数为${Object.keys(imageQualityType).join('，')}`)
    let type = imageQualityType[quality] ?? quality
    Config.modify('bika', 'imageQuality', type)
    e.reply(`✅ 已将bika图片质量修改为${quality}(${type})`)
  }

  /** 图片直连 */
  async directConnection (e) {
    if (!e.isMaster) return false
    Config.modify('bika', 'bikaDirectConnection', /开启/.test(e.msg))
    e.reply(`✅ 已${/开启/.test(e.msg) ? '开启' : '关闭'}哔咔直连`)
  }

  async Authentication (e) {
    if (e.isMaster) return true
    if (!Config.getGroup(e.group_id).sesepro) {
      e.reply(SWITCH_ERROR)
      return false
    }
    if (!Config.bika.allowPM && !e.isGroup) {
      e.reply('主人已禁用私聊该功能')
      return false
    }
    if (!await common.limit(e.user_id, 'bika', Config.bika.limit)) {
      e.reply('[bika]您已达今日次数上限', true, { at: true })
      return false
    }
    return true
  }
}
