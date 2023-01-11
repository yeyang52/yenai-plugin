import { segment } from 'oicq'
import lodash from 'lodash'
import puppeteer from 'puppeteer'
import pet from '../../../lib/puppeteer/puppeteer.js';


export default new class Browser {
    constructor() {
        this.devices = {
            'QQTheme': {
                name: 'QQTheme',
                userAgent: 'Mozilla/5.0 (Linux; Android 12; M2012K11AC Build/SKQ1.220303.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/98.0.4758.102 MQQBrowser/6.2 TBS/046317 Mobile Safari/537.36 V1_AND_SQ_8.9.10_3296_YYB_D A_8091000 QQ/8.9.10.9145 NetType/WIFI WebP/0.3.0 Pixel/1080 StatusBarHeight/80 SimpleUISwitch/0 QQTheme/1000 InMagicWin/0 StudyMode/0 CurrentMode/0 CurrentFontScale/1.0 GlobalDensityScale/0.98181814 AppId/537135947',
                viewport: {
                    width: 375,
                    height: 667,
                    deviceScaleFactor: 2,
                    isMobile: true,
                    hasTouch: true,
                    isLandscape: false,
                },
            },
            ...puppeteer.devices
        }
    }

    /**
     * @description: 返回网页截图
     * @param {Object} Methods 参数对象
     * @param {String} Methods.url 网页链接
     * @param {Object} Methods.headers 请求头
     * @param {Object} Methods.setViewport 设置宽度和高度和缩放
     * @param {Boolean} Methods.font 是否修改字体
     * @param {Object} Methods.cookie 设置cookie
     * @param {Boolean} Methods.fullPage 是否截取完整网页
     * @param {Object} Methods.emulate 模拟设备
     * @return {img} 可直接发送的构造图片
     */
    async Webpage({
        url,
        headers = false,
        setViewport = false,
        font = false,
        cookie = false,
        fullPage = true,
        emulate = false
    }) {
        if (!await pet.browserInit()) {
            return false
        }
        let buff = ''
        let start = Date.now()
        let name = lodash.truncate(url)
        pet.shoting.push(name)
        try {
            const page = await pet.browser.newPage();
            //设置请求头
            if (headers) await page.setExtraHTTPHeaders(headers)
            //设置cookie
            if (cookie) await page.setCookie(...cookie)
            //模拟设备
            if (emulate) await page.emulate(this.devices[emulate] || emulate)
            //设置宽度
            if (setViewport) await page.setViewport(setViewport)
            await page.goto(url, { 'timeout': 1000 * 30, 'waitUntil': 'networkidle0' });
            //设置字体
            if (font) await page.addStyleTag({ content: `* {font-family: "汉仪文黑-65W","雅痞-简","圆体-简","PingFang SC","微软雅黑", sans-serif !important;}` })

            buff = await page.screenshot({
                // path: './paper.jpeg',
                type: 'jpeg',
                fullPage,
                quality: 100
            })
            await page.close().catch((err) => logger.error(err));
        } catch (err) {
            logger.error(`网页截图失败:${name}${err}`);
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

        logger.mark(`[网页截图][${name}][${pet.renderNum}次] ${kb} ${logger.green(`${Date.now() - start}ms`)}`)

        pet.restart()
        return segment.image(buff)
    }
}