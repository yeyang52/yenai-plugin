import { Bika, common, Pixiv } from '../model/index.js'
import { Config } from '../components/index.js'

// 文案
const SWITCH_ERROR = '主人没有开放这个功能哦(＊／ω＼＊)'

// 汉字数字匹配正则
const numReg = '[一壹二两三四五六七八九十百千万亿\\d]+'

// 命令正则
const searchReg = new RegExp(`^#?(bika|哔咔)搜索(.*?)(第(${numReg})页)?$`)
const comicPageReg = new RegExp(`^#?(bika|哔咔)id(.*?)(第(${numReg})页)?$`)
export class newBika extends plugin {
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
        }
      ]

    })
  }

  /** 搜索 */
  async search (e) {
    if (!this.handlePermission()) return e.reply(SWITCH_ERROR)
    e.reply(Pixiv.startMsg)
    let regRet = e.msg.match(searchReg)
    let page = common.translateChinaNum(regRet[4])
    let msg = await Bika.search(regRet[2], page)
    if (msg.error) return e.reply(msg.error)
    common.getRecallsendMsg(e, msg)
  }

  /** 漫画页面 */
  async comicPage (e) {
    if (!this.handlePermission()) return e.reply(SWITCH_ERROR)
    e.reply(Pixiv.startMsg)
    let regRet = e.msg.match(comicPageReg)
    let page = common.translateChinaNum(regRet[4])
    let msg = await Bika.comicPage(regRet[2], page)
    if (msg.error) return e.reply(msg.error)
    common.getRecallsendMsg(e, msg)
  }

  /** 权限判定 */
  handlePermission () {
    let { sesepro } = Config.getGroup(this.e.group_id)
    return sesepro || this.e.isMaster
  }
}
