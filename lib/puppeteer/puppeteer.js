import fs from 'fs'
import _ from 'lodash'
import pet from '../../../../lib/puppeteer/puppeteer.js'
import { Data, Version, Plugin_Name, Config } from '../../components/index.js'
const puppeteer = await import('puppeteer')
const _path = process.cwd()
export default new (class newPuppeteer {
  constructor () {
    this.devices = {
      QQTheme: {
        name: 'QQTheme',
        userAgent:
          'Mozilla/5.0 (Linux; Android 12; M2012K11AC Build/SKQ1.220303.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/98.0.4758.102 MQQBrowser/6.2 TBS/046317 Mobile Safari/537.36 V1_AND_SQ_8.9.10_3296_YYB_D A_8091000 QQ/8.9.10.9145 NetType/WIFI WebP/0.3.0 Pixel/1080 StatusBarHeight/80 SimpleUISwitch/0 QQTheme/1000 InMagicWin/0 StudyMode/0 CurrentMode/0 CurrentFontScale/1.0 GlobalDensityScale/0.98181814 AppId/537135947',
        viewport: {
          width: 375,
          height: 667,
          deviceScaleFactor: 2,
          isMobile: true,
          hasTouch: true,
          isLandscape: false
        }
      },
      ...puppeteer.devices
    }
    this.browser = false
    this.config = {
      headless: 'chrome',
      args: ['--no-sandbox']
    }
  }

  /**
   * 截取网页截图
   *
   * @async
   * @param {Object} options - 参数选项对象
   * @param {string} options.url - 网页URL地址
   * @param {Object|false} [options.headers=false] - 请求头信息
   * @param {Object|false} [options.setViewport=false] - 设置浏览器视窗大小
   * @param {boolean} [options.font=false] - 是否设置字体样式
   * @param {Object|false} [options.cookie=false] - 设置cookie信息
   * @param {boolean} [options.fullPage=true] - 是否截取整个网页
   * @param {string|boolean} [options.emulate=false] - 模拟设备信息
   * @param {Array|false} [options.click=false] - 点击事件
   * @returns {Promise<import('icqq').segment.image>} Promise对象，如果截图成功返回构造图片消息，否则返回false
   */
  async Webpage ({
    url,
    headers = false,
    setViewport = false,
    font = false,
    cookie = false,
    fullPage = true,
    emulate = false,
    click = false
  }) {
    if (!(await pet.browserInit())) {
      return false
    }
    let buff = ''
    let start = Date.now()
    let name = _.truncate(url)
    pet.shoting.push(name)
    try {
      const page = await pet.browser.newPage()
      // 设置请求头
      if (headers) await page.setExtraHTTPHeaders(headers)
      // 设置cookie
      if (cookie) await page.setCookie(...cookie)
      // 模拟设备
      if (emulate) await page.emulate(this.devices[emulate] || emulate)
      // 设置宽度
      if (setViewport) await page.setViewport(setViewport)
      // 打卡新标签页
      await page.goto(url, { timeout: 1000 * 60, waitUntil: 'networkidle0' })
      // 设置字体
      if (font) {
        await page.addStyleTag({
          content:
            '* {font-family: "汉仪文黑-65W","雅痞-简","圆体-简","PingFang SC","微软雅黑", sans-serif !important;}'
        })
      }
      // 点击事件
      if (click) {
        for (let i of click) {
          await page.click(i.selector)
          await page.waitForTimeout(i.time)
        }
      }

      buff = await page.screenshot({
        // path: './paper.jpeg',
        type: 'jpeg',
        fullPage,
        quality: 100
      })
      await page.close().catch((err) => logger.error(err))
    } catch (err) {
      logger.error(`网页截图失败:${name}${err}`)
      /** 关闭浏览器 */
      if (pet.browser) {
        await pet.browser.close().catch((err) => logger.error(err))
      }
      pet.browser = false
      buff = ''
      return false
    }
    pet.shoting.pop()

    if (!buff) {
      logger.error(`网页截图为空:${name}`)
      return false
    }

    pet.renderNum++

    /** 计算图片大小 */
    let kb = (buff.length / 1024).toFixed(2) + 'kb'

    logger.mark(
      `[网页截图][${name}][${pet.renderNum}次] ${kb} ${logger.green(
        `${Date.now() - start}ms`
      )}`
    )

    pet.restart()
    return segment.image(buff)
  }

  async launch () {
    if (this.browser) return this.browser
    logger.mark('Puppeteer launching')
    this.browser = await puppeteer.launch(this.config).catch((err) => {
      logger.error(err.toString())
      if (String(err).includes('correct Chromium')) {
        logger.error(
          '没有正确安装Chromium，可以尝试执行安装命令：node ./node_modules/puppeteer/install.js'
        )
      }
    })
    if (!this.browser) {
      logger.error('puppeteer launching error')
      return false
    }
    logger.mark('Puppeteer launched')
    /** 监听Chromium实例是否断开 */
    this.browser.on('disconnected', (e) => {
      logger.error('[椰奶]Chromium实例关闭或崩溃！')
      this.browser = false
    })

    return this.browser
  }

  async get (url, waitSelector) {
    if (!(await this.launch())) {
      return false
    }
    const page = await this.browser.newPage()
    try {
      logger.debug('Puppeteer get', url)
      await page.goto(url)
      await page.waitForSelector(waitSelector).catch((e) => {
        console.error(`Puppeteer get "${url}" wait "${waitSelector}" error`)
        console.error(e)
      })
      const res = await page.evaluate(() => ({
        url: window.location.href,
        data: document.documentElement.outerHTML
      }))
      return res
    } catch (e) {
      console.error(`Puppeteer get "${url}" error`)
      throw e
    } finally {
      page.close()
    }
  }

  /**
   * @description: 渲染HTML
   * @param {String} path 文件路径
   * @param {Object} params 参数
   * @param {Object} cfg
   */
  async render (path, params, cfg) {
    let [app, tpl] = path.split('/')
    let { e } = cfg
    let layoutPath =
      process.cwd() + `/plugins/${Plugin_Name}/resources/common/layout/`
    let resPath = `../../../../../plugins/${Plugin_Name}/resources/`
    Data.createDir(`data/html/${Plugin_Name}/${app}/${tpl}`, 'root')
    let data = {
      ...params,
      _plugin: Plugin_Name,
      saveId: params.saveId || params.save_id || tpl,
      tplFile: `./plugins/${Plugin_Name}/resources/${app}/${tpl}.html`,
      pluResPath: resPath,
      _res_path: resPath,
      _layout_path: layoutPath,
      _tpl_path:
        process.cwd() + `/plugins/${Plugin_Name}/resources/common/tpl/`,
      defaultLayout: layoutPath + 'default.html',
      elemLayout: layoutPath + 'elem.html',
      pageGotoParams: {
        waitUntil: 'networkidle0'
      },
      sys: {
        scale: this.scale(cfg.scale || 1),
        copyright: `Created By Yunzai-Bot<span class="version">${Version.yunzai}</span> & yenai-Plugin<span class="version">${Version.ver}</span>`
      },
      quality: 100
    }
    if (process.argv.includes('web-debug')) {
      // debug下保存当前页面的渲染数据，方便模板编写与调试
      // 由于只用于调试，开发者只关注自己当时开发的文件即可，暂不考虑app及plugin的命名冲突
      let saveDir = _path + '/data/ViewData/'
      if (!fs.existsSync(saveDir)) {
        fs.mkdirSync(saveDir)
      }
      let file = saveDir + tpl + '.json'
      data._app = app
      fs.writeFileSync(file, JSON.stringify(data))
    }
    let base64 = await pet.screenshot(`${Plugin_Name}/${app}/${tpl}`, data)
    let ret = true
    if (base64) {
      ret = await e.reply(base64)
    }
    return cfg.retMsgId ? ret : true
  }

  scale (pct = 1) {
    let scale = Config.Notice.renderScale
    scale = Math.min(2, Math.max(0.5, scale / 100))
    pct = pct * scale
    return `style=transform:scale(${pct})`
  }
})()
