import fs from 'fs'
import _ from 'lodash'
import { Plugin_Path } from '../components/index.js'
let Jimp = null

export default new class {
  constructor () {
    this.folderPath = `${Plugin_Path}/resources/memes`
  }

  async importJimp () {
    try {
      Jimp = await import('jimp')
    } catch {
      return false
    }
  }

  /** 比心/赞 */
  async zan (image) {
    if (!await this.importJimp()) return false
    let background = await Jimp.read(this.getRandomImagePath(`${this.folderPath}/bixin`))
    let image2 = await Jimp.read(image)
    image2.resize(100, 100).circle()
    background.composite(image2, 30, 300)
    return background.getBufferAsync(Jimp.MIME_JPEG)
  }

  /** 爬 */
  async crawl (image) {
    if (!await this.importJimp()) return false
    let background = await Jimp.read(this.getRandomImagePath(`${this.folderPath}/crawl`))
    let image2 = await Jimp.read(image)
    image2.resize(100, 100).circle()
    background.composite(image2, 0, 400)
    return background.getBufferAsync(Jimp.MIME_JPEG)
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
