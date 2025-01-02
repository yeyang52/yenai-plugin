import _ from "lodash"
import devices from "./devices.js"
import render from "./render.js"
import Renderer from "../../../../lib/renderer/loader.js"
const renderer = Renderer.getRenderer()

export default new class extends render {
  constructor() {
    super()
    this.browser = false
    this.shoting = []
  }

  /**
   * 异步函数Webpage，用于网页截图
   * @param {string} url - 需要截图的网页URL
   * @param {object} params - 包含多个参数的对象
   * @param {object} params.headers - 可选，HTTP请求头
   * @param {object} params.setViewport - 可选，设置视口大小
   * @param {boolean} params.font - 可选，是否添加特定字体样式
   * @param {object} params.cookie - 可选，需要设置的cookie
   * @param {boolean} params.fullPage - 是否截取整个页面，默认true
   * @param {string} params.emulate - 可选，模拟的设备类型
   * @param {Function} params.beforeLaunch - 可选，页面创建前的回调函数
   * @param {Function} params.afterLaunch - 可选，页面创建后的回调函数
   * @returns {Promise<boolean | object>} - 返回截图的base64编码或false表示失败
   */
  async Webpage(url, {
    headers = false,
    setViewport = false,
    font = false,
    cookie = false,
    fullPage = true,
    emulate = false,
    beforeLaunch = null,
    afterLaunch = null
  }) {
    if (!(await this.launch())) {
      return false
    }
    let buff = ""
    let start = Date.now()
    let name = _.truncate(url)
    this.shoting.push(name)
    try {
      const page = await this.browser.newPage()

      if (typeof beforeLaunch === "function") {
        await beforeLaunch(page)
      }
      // 设置请求头
      if (headers) await page.setExtraHTTPHeaders(headers)
      // 设置cookie
      if (cookie) await page.setCookie(...cookie)
      // 模拟设备
      if (emulate) await page.emulate(devices[emulate] || emulate)
      // 设置宽度
      if (setViewport) await page.setViewport(setViewport)
      // 打卡新标签页
      await page.goto(url, { timeout: 1000 * 60, waitUntil: "networkidle0" })
      // 设置字体
      if (font) {
        await page.addStyleTag({
          content:
            "* {font-family: \"汉仪文黑-65W\",\"雅痞-简\",\"圆体-简\",\"PingFang SC\",\"微软雅黑\", sans-serif !important;}"
        })
      }

      if (typeof afterLaunch === "function") {
        await afterLaunch(page)
      }
      buff = await page.screenshot({
        // path: './paper.jpeg',
        type: "jpeg",
        fullPage,
        quality: 100,
        encoding: "base64"
      })
      await page.close().catch((err) => logger.error(err))
    } catch (err) {
      logger.error(`[Yenai-Plugin]网页截图失败:${name}${err}`)
      /** 关闭浏览器 */
      if (this.browser) {
        await this.browser.close().catch((err) => logger.error(err))
      }
      this.browser = false
      buff = ""
      return false
    }
    this.shoting.pop()

    if (!buff) {
      logger.error(`[Yenai-Plugin]网页截图为空:${name}`)
      return false
    }

    renderer.renderNum++

    /** 计算图片大小 */
    let kb = (buff.length / 1024).toFixed(2) + "kb"

    logger.mark(
      `[Yenai-Plugin][网页截图][${name}][${renderer.renderNum}次] ${kb} ${logger.green(
        `${Date.now() - start}ms`
      )}`
    )
    renderer.restart()
    return segment.image("base64://" + buff)
  }

  async launch() {
    if (this.browser) return this.browser
    if (!renderer.browser) {
      let res = await renderer.browserInit()
      if (!res) return false
    }
    this.browser = renderer.browser
    return this.browser
  }

  /**
   * 异步跳转到指定 URL，等待指定选择器，返回页面数据对象。
   * @async
   * @param {string} url - 要跳转的 URL。
   * @param {string} waitSelector - 等待页面渲染的选择器。
   * @returns {object} - 包含 URL 和页面数据的对象。
   * @throws 如果导航或页面数据检索失败，将抛出错误。
   */
  async get(url, waitSelector) {
    if (!(await this.launch())) {
      return false
    }
    const page = await this.browser.newPage()
    try {
      logger.debug("Puppeteer get", url)
      await page.goto(url)
      await page.waitForSelector(waitSelector).catch((e) => {
        logger.error(`Puppeteer get "${url}" wait "${waitSelector}" error`)
        logger.error(e)
      })
      const res = await page.evaluate(() => ({
        url: window.location.href,
        data: document.documentElement.outerHTML
      }))
      return res
    } catch (e) {
      logger.error(`Puppeteer get "${url}" error`)
      throw e
    } finally {
      page.close()
    }
  }
}()
