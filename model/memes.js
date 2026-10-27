import fs from "fs"
import _ from "lodash"
import fetch from "node-fetch"
import { Plugin_Path, Log_Prefix } from "../components/index.js"
let Jimp = null
try {
  Jimp = (await import("jimp")).default
} catch {}
let sharp = null
try {
  sharp = (await import("sharp")).default
} catch {}
export default new class {
  constructor() {
    this.folderPath = `${Plugin_Path}/resources/memes`
  }

  /**
   * 比心/赞
   * @param image
   */
  async zan(image) {
    if (!Jimp) return false
    let background = await Jimp.read(this.getRandomImagePath(`${this.folderPath}/bixin`))
    let image2 = await this.readAvatar(image)
    image2.resize(100, 100).circle()
    background.composite(image2, 30, 300)
    const buff = await background.getBufferAsync(Jimp.MIME_JPEG)
    // debug
    let kb = (buff.length / 1024).toFixed(2) + "kb"
    logger.debug(`${Log_Prefix}[memes]生成zan ${kb}`)
    return buff
  }

  /**
   * 爬
   * @param image
   */
  async crawl(image) {
    if (!Jimp) return false
    let background = await Jimp.read(this.getRandomImagePath(`${this.folderPath}/crawl`))
    let image2 = await this.readAvatar(image)
    image2.resize(100, 100).circle()
    background.composite(image2, 0, 400)
    const buff = await background.getBufferAsync(Jimp.MIME_JPEG)
    // debug
    let kb = (buff.length / 1024).toFixed(2) + "kb"
    logger.debug(`${Log_Prefix}[memes]生成crawl ${kb}`)
    return buff
  }

  async ganyu(image) {
    if (!Jimp) return false
    let images = new Jimp(700, 598)
    let avatar = await this.readAvatar(image)
    avatar.resize(235, 235)
    images.composite(avatar, 425, 327)
    let backgrounp = await Jimp.read(this.getRandomImagePath(`${this.folderPath}/ganyu`))
    images.composite(backgrounp, 0, 0)
    const buff = await images.getBufferAsync(Jimp.MIME_JPEG)
    // debug
    let kb = (buff.length / 1024).toFixed(2) + "kb"
    logger.debug(`${Log_Prefix}[memes]生成ganyu ${kb}`)
    return buff
  }

  /**
   * 读取头像
   *
   * QQ 头像（q1.qlogo.cn）现在默认返回 webp，而 Jimp 0.22 不支持 webp，
   * 直接 Jimp.read 会抛 `Unsupported MIME type: image/webp`：
   * 点赞本身成功了，可回复图生成不出来，用户看到的就是「点了赞但没人回话」。
   * 所以先用 sharp 把头像转成 JPEG，再交给 Jimp 合成；
   * sharp 不可用或转码失败时退回原来的读法，不影响老环境。
   * @param {string|Buffer} image
   * @returns {Promise<Jimp>}
   */
  async readAvatar(image) {
    if (sharp) {
      try {
        const buffer = Buffer.isBuffer(image) ? image : await this.download(image)
        return await Jimp.read(await sharp(buffer).jpeg().toBuffer())
      } catch (err) {
        logger.debug(`${Log_Prefix}[memes]头像转码失败，回退直接读取: ${err?.message || err}`)
      }
    }
    return await Jimp.read(image)
  }

  /**
   * 下载图片为 Buffer
   * @param {string} url
   * @returns {Promise<Buffer>}
   */
  async download(url) {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } })
    if (!res.ok) throw new Error(`下载失败 ${res.status}`)
    return Buffer.from(await res.arrayBuffer())
  }

  /**
   * 获取文件夹中随机的一张图片路径
   * @param {string} folderPath - 文件夹路径
   * @returns {string} - 图片路径
   */
  getRandomImagePath(folderPath) {
  // 读取文件夹里的所有文件
    const files = fs.readdirSync(folderPath)

    // 过滤出图片文件
    const images = _.filter(files, file => {
      return /\.(gif|jpe?g|png)$/i.test(file)
    })

    // 随机选择一张图片
    const randomImage = _.sample(images)

    // 图片路径
    const imagePath = `${folderPath}/${randomImage}`

    return imagePath
  }
}()
