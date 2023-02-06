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
    if (!this.handlePermission()) return e.reply(SWITCH_ERROR)
    e.reply(Pixiv.startMsg)
    let regRet = e.msg.match(searchReg)
    let page = common.translateChinaNum(regRet[5])
    let msg = await Bika.search(regRet[3], page, regRet[2]).catch(err => { e.reply(err.message) })
    if (!msg) return
    common.getRecallsendMsg(e, msg)
  }

  /** 漫画页面 */
  async comicPage (e) {
    if (!this.handlePermission()) return e.reply(SWITCH_ERROR)
    e.reply(Pixiv.startMsg)
    let regRet = e.msg.match(comicPageReg)
    let page = common.translateChinaNum(regRet[4])
    let order = common.translateChinaNum(regRet[6])
    let msg = await Bika.comicPage(regRet[2], page, order).catch(err => { e.reply(err.message) })
    if (!msg) return
    common.getRecallsendMsg(e, msg)
  }

  /** 类别列表 */
  async categories (e) {
    if (!this.handlePermission()) return e.reply(SWITCH_ERROR)
    e.reply(Pixiv.startMsg)
    let msg = await Bika.categories().catch(err => { e.reply(err.message) })
    if (!msg) return
    common.getRecallsendMsg(e, msg)
  }

  /** 漫画细节 */
  async comicDetail (e) {
    if (!this.handlePermission()) return e.reply(SWITCH_ERROR)
    e.reply(Pixiv.startMsg)
    let id = e.msg.match(new RegExp(`#?${Prefix}(详情|细节)(.*)`))[3]
    let msg = await Bika.comicDetail(id).catch(err => { e.reply(err.message) })
    if (!msg) return
    common.getRecallsendMsg(e, msg, { oneMsg: true })
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

  /** 权限判定 */
  handlePermission () {
    let { sesepro } = Config.getGroup(this.e.group_id)
    return sesepro || this.e.isMaster
  }
}
