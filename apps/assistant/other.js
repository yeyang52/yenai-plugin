import _ from "lodash"
import { Config } from "../../components/index.js"
import { common } from "../../model/index.js"
import cfg from "../../../../lib/config/config.js"

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
          reg: "^#(ocr|提?取文字)",
          fnc: "imageOcr"
        },
        {
          reg: "^#?(查?看|取)(群)?头像",
          fnc: "LookAvatar"
        },
        {
          reg: "^#?(设置|修改)日志等级",
          fnc: "logs"
        }
      ]
    })
  }

  /**
   * 取直链
   * @param e
   */
  async ImageLink(e) {
    const sourceFile = await common.gtakeSourceMs(e, { file: true })
    if (sourceFile) return e.reply(`下载链接:\n${sourceFile}`, true)

    const sourceImg = await common.takeSourceMsg(e, { img: true })
    const img = sourceImg || e.img

    if (_.isEmpty(img)) {
      this.setContext("_ImageLinkContext")
      await this.reply("⚠ 请发送图片")
      return
    }

    await e.reply(`✅ 检测到${img.length}张图片`)

    if (img.length >= 2) {
      const msg = img.map(i => [ segment.image(i), "\n", i ])
      common.getforwardMsg(e, msg)
    } else {
      await e.reply([ segment.image(img[0]), "直链:\n", img[0] ])
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

  /**
   * 图片提取文字
   * @param e
   */
  async imageOcr(e) {
    try {
      const imageOcr = e.bot?.imageOcr?.bind(e.bot) || Bot.imageOcr
      if (!imageOcr) return this.reply("❎ 当前协议暂不支持OCR")
      const sourceImg = await common.takeSourceMsg(e, { img: true })
      const img = sourceImg || e.img
      if (_.isEmpty(img)) {
        this.setContext("_imageOcrContext")
        return this.reply("⚠ 请发送图片")
      }
      let res = await imageOcr(img[0])
      let r = res?.wordslist?.map(i => i.words).join("\n")
      if (!r) return e.reply("❎ 获取失败,请稍后再试")
      e.reply(r, true)
      return true
    } catch (error) {
      e.reply("❎ 获取失败,请稍后再试")
      logger.error("获取OCR错误:", error)
    }
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

  /**
   * 查看头像
   */
  async LookAvatar() {
    try {
      let id, url
      if (this.e.msg.includes("群")) {
        id = this.e.msg.replace(/^#?(查?看|取)(群)?头像/, "").trim() || this.e.group_id
        url = await this.e.bot.pickGroup(id).getAvatarUrl()
      } else {
        id = this.e.msg.replace(/^#?(查?看|取)(群)?头像/, "").trim() || this.e.at || this.e.message.find(item => item.type == "at")?.qq || this.e.user_id
        url = await this.e.group?.pickMember(id)?.getAvatarUrl()
        if (!url) url = await this.e.bot.pickFriend(id).getAvatarUrl()
      }
      const msgTest = this.e.msg.includes("取")
      if (url) return await this.e.reply(msgTest ? `${url}` : segment.image(url), true)
    } catch (error) {
      logger.error("获取头像错误", error)
    }
    await this.reply("❎ 获取头像错误", true)
    return false
  }

  /**
   * 设置日志等级
   */
  async logs() {
    if (!common.checkPermission(this.e, "master")) return

    const logs = [ "trace", "debug", "info", "warn", "fatal", "mark", "error", "off" ]
    const level = this.e.msg.replace(/^#?(设置|修改)日志等级/, "").trim()

    if (!logs.includes(level)) return this.e.reply("❎ 请输入正确的参数，可选：\ntrace,debug,info,warn,fatal,mark,error,off")

    const { log_level } = cfg.bot
    if (log_level === level) return this.e.reply(`❎ 日志等级已是${level}了`)

    Config.modify("bot", "log_level", level, "config", true)
    this.e.reply(`✅ 已将日志等级设置为${level}`)
  }
}
