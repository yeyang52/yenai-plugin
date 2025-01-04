import { Bika, common, Pixiv } from "../model/index.js"
import { Config } from "../components/index.js"
import { Admin_Fun } from "./admin/fun.js"
import translateChinaNum from "../tools/translateChinaNum.js"

// 汉字数字匹配正则
const numReg = "[零一壹二两三四五六七八九十百千万亿\\d]+"
const Prefix = "(bika|哔咔)"
// 命令正则
const searchReg = new RegExp(`^#?${Prefix}(类别|作者|高级)?搜索(.*?)(第(${numReg})页)?$`)
const comicPageReg = new RegExp(`^#?${Prefix}id(.*?)(第(${numReg})页)?(第(${numReg})话)?$`)
export class NewBika extends plugin {
  constructor() {
    super({
      name: "椰奶哔咔",
      event: "message",
      priority: 2000,
      rule: [
        {
          reg: searchReg,
          fnc: "search"
        },
        {
          reg: comicPageReg,
          fnc: "comicPage"
        },
        {
          reg: `^#?${Prefix}看\\d+$`,
          fnc: "viewComicPage"
        },
        {
          reg: `^#?${Prefix}下一页$`,
          fnc: "nextComicPage"
        },
        {
          reg: `^#?${Prefix}下一话$`,
          fnc: "nextChapter"
        },
        {
          reg: `^#?${Prefix}类别列表$`,
          fnc: "categories"
        },
        {
          reg: `^#?${Prefix}(详情|细节)(.*)$`,
          fnc: "comicDetail"
        },
        {
          reg: `^#?${Prefix}修改图片质量(.*)$`,
          fnc: "imageQuality"
        },
        {
          reg: `^#?${Prefix}(开启|关闭)直连$`,
          fnc: "directConnection"
        }
      ]

    })
  }

  /**
   * 搜索
   * @param e
   */
  async search(e) {
    if (!await this._Authentication(e)) return
    e.reply(Pixiv.startMsg)
    let regRet = e.msg.match(searchReg)
    let page = translateChinaNum(regRet[5])
    await Bika.search(regRet[3], page, regRet[2])
      .then(res => common.recallSendForwardMsg(e, res))
      .catch(err => common.handleException(e, err))
  }

  /**
   * 漫画页面
   * @param e
   */
  async comicPage(e) {
    if (!await this._Authentication(e)) return
    e.reply(Pixiv.startMsg)
    let regRet = e.msg.match(comicPageReg)
    let page = translateChinaNum(regRet[4])
    let order = translateChinaNum(regRet[6])
    await Bika.comicPage(regRet[2], page, order)
      .then(res => common.recallSendForwardMsg(e, res))
      .catch(err => common.handleException(e, err))
  }

  /**
   * 快速查看
   * @param e
   */
  async viewComicPage(e) {
    if (!await this._Authentication(e)) return
    let number = e.msg.match(/\d+/) - 1
    await Bika.viewComicPage(number)
      .then(res => common.recallSendForwardMsg(e, res))
      .catch(err => common.handleException(e, err))
  }

  /**
   * 下一页
   * @param e
   */
  async nextComicPage(e) {
    if (!await this._Authentication(e)) return
    await Bika.next()
      .then(res => common.recallSendForwardMsg(e, res))
      .catch(err => common.handleException(e, err))
  }

  /**
   * 下一话
   * @param e
   */
  async nextChapter(e) {
    if (!await this._Authentication(e)) return
    await Bika.next("chapter")
      .then(res => common.recallSendForwardMsg(e, res))
      .catch(err => common.handleException(e, err))
  }

  /**
   * 类别列表
   * @param e
   */
  async categories(e) {
    if (!await this._Authentication(e)) return
    e.reply(Pixiv.startMsg)
    await Bika.categories()
      .then(res => common.recallSendForwardMsg(e, res))
      .catch(err => common.handleException(e, err))
  }

  /**
   * 漫画细节
   * @param e
   */
  async comicDetail(e) {
    if (!await this._Authentication(e)) return
    e.reply(Pixiv.startMsg)
    let id = e.msg.match(new RegExp(`#?${Prefix}(详情|细节)(.*)`))[3]
    await Bika.comicDetail(id)
      .then(res => common.recallSendForwardMsg(e, res, { oneMsg: true }))
      .catch(err => common.handleException(e, err))
  }

  /**
   * 图片质量
   * @param e
   */
  async imageQuality(e) {
    let quality = e.msg.match(new RegExp(`#?${Prefix}修改图片质量(.*)`))[2]
    let imageQualityType = {
      低质量: "low",
      中等质量: "medium",
      高质量: "high",
      原图: "original"
    }
    if (!imageQualityType[quality] && !Object.values(imageQualityType).includes(quality)) return e.reply(`错误参数，支持的参数为${Object.keys(imageQualityType).join("，")}`)
    let type = imageQualityType[quality] ?? quality
    Config.modify("bika", "imageQuality", type)
    new Admin_Fun().sendImg(e)
  }

  /**
   * 图片直连
   * @param e
   */
  async directConnection(e) {
    if (!this.e.isMaster) { return true }
    let now = Config.bika.bikaDirectConnection
    let isSwitch = /开启/.test(e.msg)
    if (now && isSwitch) return e.reply("❎ bika图片直连已处于开启状态")
    if (!now && !isSwitch) return e.reply("❎ bika图片直连已处于关闭状态")
    Config.modify("bika", "bikaDirectConnection", isSwitch)
    new Admin_Fun().sendImg(e)
  }

  async _Authentication(e) {
    if (!this.e.isMaster) { return true }
    if (!common.checkSeSePermission(e, "sesepro")) return false
    if (!Config.bika.allowPM && !e.isGroup) {
      e.reply("主人已禁用私聊该功能")
      return false
    }
    if (!await common.limit(e.user_id, "bika", Config.bika.limit)) {
      e.reply("您已达今日「bika」次数上限", true, { at: true })
      return false
    }
    return true
  }
}
