import { common } from "../../model/index.js"
import _ from "lodash"

export class Assistant_Other extends plugin {
  constructor() {
    super({
      name: "椰奶助手-其他",
      event: "message",
      priority: 500,
      rule: [
        {
          reg: "^#取直链",
          fnc: "ImageLink"
        },
        {
          reg: "^#取face",
          fnc: "Face"
        },
        {
          reg: "^#ocr",
          fnc: "imageOcr"
        }

      ]
    })
  }

  /**
   * 取直链
   * @param e
   */
  async ImageLink(e) {
    const sourceImg = await common.takeSourceMsg(e, { img: true })
    const img = sourceImg || e.img
    if (_.isEmpty(img)) {
      this.setContext("_ImageLinkContext")
      await this.reply("⚠ 请发送图片")
      return
    }
    await e.reply(`✅ 检测到${img.length}张图片`)
    if (img.length >= 2) {
      // 大于两张图片以转发消息发送
      let msg = []
      for (let i of img) {
        msg.push([ segment.image(i), "直链:", i ])
      }
      common.getforwardMsg(e, msg)
    } else {
      await e.reply([ segment.image(img[0]), "直链:", img[0] ])
    }
    return true
  }

  async _ImageLinkContext() {
    let img = this.e.img
    if (this.e.msg === "取消") {
      this.finish("_ImageLinkContext")
      await this.reply("✅ 已取消")
      return
    }
    if (!img) {
      this.setContext("_ImageLinkContext")
      await this.reply("⚠ 请发送图片或取消")
      return
    }
    await this.e.reply(img[0])
    this.finish("_ImageLinkContext")
  }

  /**
   * 取Face表情
   * @param e
   */
  async Face(e) {
    let face = []
    for (let m of e.message) {
      if (m.type === "face") {
        let s = false
        for (let i of face) { if (i.id === m.id) s = true }
        if (!s) face.push(m)
      }
    }
    if (face.length === 0) return e.reply("❎ 表情参数不可为空", true)

    let res = face.map(function(item) {
      return [
        "表情：",
        item,
        `\nid：${item.id}`,
        `\n描述：${item.text}`
      ]
    })

    if (res.length >= 2) {
      common.getforwardMsg(e, res)
    } else {
      e.reply(res[0])
    }
  }

  async imageOcr(e) {
    const imageOcr = e.bot.imageOcr || Bot.imageOcr
    if (!imageOcr) return this.reply("❎ 当前协议暂不支持OCR")
    const sourceImg = await common.takeSourceMsg(e, { img: true })
    const img = sourceImg || e.img
    if (_.isEmpty(img)) {
      this.setContext("_imageOcrContext")
      return this.reply("⚠ 请发送图片")
    }
    let res = await imageOcr(img[0])
    let r = res.wordslist.map(i => i.words).join("\n")
    e.reply(r)
    return true
  }

  async _imageOcrContext(e) {
    e.img = this.e.img
    if (this.e.msg === "取消") {
      this.finish("_imageOcrContext")
      return this.reply("✅ 已取消")
    }
    if (!e.img) {
      this.setContext("_imageOcrContext")
      return this.reply("⚠ 请发送图片或取消")
    }
    this.imageOcr(e)
    this.finish("_imageOcrContext")
  }
}
