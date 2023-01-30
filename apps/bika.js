import { Bika, common } from '../model/index.js'
import { Config } from '../components/index.js'

// 文案
const SWITCH_ERROR = '主人没有开放这个功能哦(＊／ω＼＊)'

// 汉字数字匹配正则
let numReg = '[一壹二两三四五六七八九十百千万亿\\d]+'
let newPageReg = new RegExp(`第(${numReg}页`)
export class newBika extends plugin {
  constructor () {
    super({
      name: '椰奶哔咔',
      event: 'message',
      priority: 2000,
      rule: [
        {
          reg: `^#?(bika|哔咔)搜索(.*?)(第${numReg}页)?$`,
          fnc: 'search'
        },
        {
          reg: `^#?(bika|哔咔)id(.*?)(第${numReg}页)?$`,
          fnc: 'comicPage'
        }
      ]

    })
  }

  async search (e) {
    if (!this.handlePermission()) return e.reply(SWITCH_ERROR)
    let keyword = e.msg.replace(/#?(bika|哔咔)搜索/g, '').trim()
    let page = e.msg.match(newPageReg)
    let msg = await Bika.search(keyword, page[1])
    if (msg.error) return e.reply(msg.error)
    common.getRecallsendMsg(e, msg)
  }

  async comicPage (e) {
    if (!this.handlePermission()) return e.reply(SWITCH_ERROR)
    let id = e.msg.replace(/#?(bika|哔咔)id/g, '').trim()
    let page = e.msg.match(newPageReg)
    let msg = await Bika.comicPage(id, page[1])
    if (msg.error) return e.reply(msg.error)
    common.getRecallsendMsg(e, msg)
  }

  handlePermission () {
    let { sesepro } = Config.getGroup(this.e.group_id)
    return !sesepro && !this.e.isMaster
  }
}
