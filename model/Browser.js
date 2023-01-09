import puppeteer from 'puppeteer'
import { segment } from 'oicq'
let sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms))
}
export default new class Browser {
    /**
     * @description:返回网页截图
     * @param {String} url 网页链接
     * @param {Object} headers 请求头
     * @param {Number} setViewport.width 设备宽度 
     * @param {Number} setViewport.height 设备高度
     * @param {Number} setViewport.deviceScaleFactor 设备缩放(提高图片质量)
     * @return {image} 可直接发送的图片
     */
    async Webpage(url, headers = {}, setViewport = {
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1
    }, font = false, ck = false, fullPage = true) {

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
            await page.setExtraHTTPHeaders(headers)
            if (ck) await page.setCookie(...ck)
            await page.goto(url, { 'timeout': 1000 * 30, 'waitUntil': 'networkidle0' });
            await page.setViewport(setViewport);
            await page.addStyleTag({
                content: font ? `* {font-family: "汉仪文黑-65W","雅痞-简","圆体-简","PingFang SC","微软雅黑", sans-serif !important;}` : ''
            })

            let res = await page.screenshot({
                // path: './paper.jpeg',
                type: 'jpeg',
                fullPage,
                quality: 100
            }).catch(err => {
                console.log('截图失败');
                console.log(err);
            });
            return segment.image(res)
        } catch (e) {
            console.log('执行异常');
            return false;
        } finally {
            await browser.close();
        }

    }
}