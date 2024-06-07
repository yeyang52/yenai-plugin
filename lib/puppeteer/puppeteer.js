import _ from "lodash"
import devices from "./devices.js"
import render from "./render.js"
import puppeteer from "puppeteer"
import common from "../../../../lib/common/common.js"
// let puppeteer = null
// let StealthPlugin = null
// try {
//   puppeteer = (await import('puppeteer-extra')).default
//   StealthPlugin = (await import('puppeteer-extra-plugin-stealth')).default
//   puppeteer.use(StealthPlugin())
// } catch {}

export default new class extends render {
  constructor() {
    super()
    this.browser = false
    this.config = {
      args: [ "--no-sandbox" ],
      headless: "new"
    }
    this.lock = false
    this.shoting = []
    /** 截图数达到时重启浏览器 避免生成速度越来越慢 */
    this.restartNum = 100
    /** 截图次数 */
    this.renderNum = 0
  }

  /**
   * 截取网页截图
   * @async
   * @param {object} options - 参数选项对象
   * @param {string} options.url - 网页URL地址
   * @param {object | false} [options.headers] - 请求头信息
   * @param {object | false} [options.setViewport] - 设置浏览器视窗大小
   * @param {boolean} [options.font] - 是否设置字体样式
   * @param {object | false} [options.cookie] - 设置cookie信息
   * @param {boolean} [options.fullPage] - 是否截取整个网页
   * @param {keyof typeof import('puppeteer').KnownDevices | 'QQTheme'} [options.emulate] - 模拟设备信息
   * @param {Array|false} [options.click] - 点击事件
   * @returns {Promise<object>} Promise对象，如果截图成功返回构造图片消息，否则返回false
   */
  async Webpage({
    url,
    headers = false,
    setViewport = false,
    font = false,
    cookie = false,
    fullPage = true,
    emulate = false,
    click = false
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
      // 点击事件
      if (click) {
        for (let i of click) {
          await page.click(i.selector)
          await common.sleep(i.time)
        }
      }

      buff = await page.screenshot({
        // path: './paper.jpeg',
        type: "jpeg",
        fullPage,
        quality: 100
      })
      await page.close().catch((err) => logger.error(err))
    } catch (err) {
      logger.error(`网页截图失败:${name}${err}`)
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
      logger.error(`网页截图为空:${name}`)
      return false
    }

    this.renderNum++

    /** 计算图片大小 */
    let kb = (buff.length / 1024).toFixed(2) + "kb"

    logger.mark(
      `[网页截图][${name}][${this.renderNum}次] ${kb} ${logger.green(
        `${Date.now() - start}ms`
      )}`
    )

    this.restart()
    return segment.image(buff)
  }

  async launch() {
    if (this.browser) return this.browser
    logger.mark("[Yenai-Plugin]Puppeteer launching")
    // if (!puppeteer) {
    //   logger.error(`[Yenai-Plugin][Puppeteer]缺少依赖项，请执行 ${logger.red('pnpm add puppeteer-extra puppeteer-extra-plugin-stealth -w')}`)
    //   return false
    // }
    this.browser = await puppeteer.launch(this.config).catch((err) => {
      logger.error(err.toString())
      if (String(err).includes("correct Chromium")) {
        logger.error(
          "没有正确安装Chromium，可以尝试执行安装命令：node ./node_modules/puppeteer/install.js"
        )
      }
    })
    if (!this.browser) {
      logger.error("[Yenai-Plugin]puppeteer launching error")
      return false
    }
    logger.mark("[Yenai-Plugin]Puppeteer launched")
    /** 监听Chromium实例是否断开 */
    this.browser.on("disconnected", (e) => {
      logger.error("[Yenai-Plugin]Chromium实例关闭或崩溃！")
      this.browser = false
    })

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

  /** 重启 */
  restart() {
    /** 截图超过重启数时，自动关闭重启浏览器，避免生成速度越来越慢 */
    if (this.renderNum % this.restartNum === 0) {
      if (this.shoting.length <= 0) {
        setTimeout(async() => {
          if (this.browser) {
            await this.browser.close().catch((err) => logger.error(err))
          }
          this.browser = false
          logger.mark("[Yenai-Plugin]puppeteer 关闭重启...")
        }, 100)
      }
    }
  }
}()
