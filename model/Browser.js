import puppeteer from 'puppeteer'
import { segment } from 'oicq'
let sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms))
}
export default new class Browser {

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

        const browser = await puppeteer.launch({
            args: [
                '--disable-gpu',
                '--disable-dev-shm-usage',
                '--disable-setuid-sandbox',
                '--no-first-run',
                '--no-sandbox',
                '--no-zygote',
                '--single-process'
            ]
        });
        const page = await browser.newPage();
        try {
            //设置请求头
            if (headers) await page.setExtraHTTPHeaders(headers)
            //设置cookie
            if (cookie) await page.setCookie(...cookie)
            //模拟设备
            if (emulate) await page.emulate(this.devices[emulate] || puppeteer.devices[emulate] || emulate)
            //设置宽度
            if (setViewport) await page.setViewport(setViewport)
            await page.goto(url, { 'timeout': 1000 * 30, 'waitUntil': 'networkidle0' });
            //设置字体
            if (font) await page.addStyleTag({ content: `* {font-family: "汉仪文黑-65W","雅痞-简","圆体-简","PingFang SC","微软雅黑", sans-serif !important;}` })

            let screenshot = await page.screenshot({
                // path: './paper.jpeg',
                type: 'jpeg',
                fullPage,
                quality: 100
            }).catch(err => {
                console.log('截图失败');
                console.log(err);
            });
            return segment.image(screenshot)
        } catch (e) {
            logger.error(e);
            return false;
        } finally {
            await browser.close();
        }

    }

    get devices() {
        return {
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
        }
    }
}