import fs from "fs"
import _ from "lodash"
import { Plugin_Path } from "../components/index.js"
let Jimp = null
try {
  Jimp = (await import("jimp")).default
} catch {}
export default new class {
  constructor () {
    this.folderPath = `${Plugin_Path}/resources/memes`
  }

  /**
   * 比心/赞
   * @param image
   */
  async zan (image) {
    if (!Jimp) return false
    let background = await Jimp.read(this.getRandomImagePath(`${this.folderPath}/bixin`))
    let image2 = await Jimp.read(image)
    image2.resize(100, 100).circle()
    background.composite(image2, 30, 300)
    const buff = await background.getBufferAsync(Jimp.MIME_JPEG)
    // debug
    let kb = (buff.length / 1024).toFixed(2) + "kb"
    logger.debug(`[Yenai-Plugin][memes]生成zan ${kb}`)
    return buff
  }

  /**
   * 爬
   * @param image
   */
  async crawl (image) {
    if (!Jimp) return false
    let background = await Jimp.read(this.getRandomImagePath(`${this.folderPath}/crawl`))
    let image2 = await Jimp.read(image)
    image2.resize(100, 100).circle()
    background.composite(image2, 0, 400)
    const buff = await background.getBufferAsync(Jimp.MIME_JPEG)
    // debug
    let kb = (buff.length / 1024).toFixed(2) + "kb"
    logger.debug(`[Yenai-Plugin][memes]生成crawl ${kb}`)
    return buff
  }

  async ganyu (image) {
    if (!Jimp) return false
    let images = new Jimp(700, 598)
    let avatar = await Jimp.read(image)
    avatar.resize(235, 235)
    images.composite(avatar, 425, 327)
    let backgrounp = await Jimp.read(this.getRandomImagePath(`${this.folderPath}/ganyu`))
    images.composite(backgrounp, 0, 0)
    const buff = await images.getBufferAsync(Jimp.MIME_JPEG)
    // debug
    let kb = (buff.length / 1024).toFixed(2) + "kb"
    logger.debug(`[Yenai-Plugin][memes]生成ganyu ${kb}`)
    return buff
  }

  /**
   * 获取文件夹中随机的一张图片路径
   * @param {string} folderPath - 文件夹路径
   * @returns {string} - 图片路径
   */
  getRandomImagePath (folderPath) {
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
