import puppeteer from 'puppeteer'
import { segment } from 'oicq'
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
    }, font = false) {
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
        await page.setExtraHTTPHeaders(headers)
        await page.goto(url, { 'timeout': 1000 * 30, 'waitUntil': 'networkidle0' });
        await page.setViewport(setViewport);
        await page.addStyleTag({
            content: font ? `* {font-family: "汉仪文黑-65W","雅痞-简","圆体-简","PingFang SC","微软雅黑", sans-serif !important;}` : ''
        })
        try {
            let res = await page.screenshot({
                // path: './paper.jpeg',
                type: 'jpeg',
                fullPage: true,
                quality: 100
            }).catch(err => {
                console.log('截图失败');
                console.log(err);
            });
            // await page.waitFor(5000);
            return segment.image(res)
        } catch (e) {
            console.log('执行异常');
            return false;
        } finally {
            await browser.close();
        }

    }

    /**
     * @description: 截图不滚动不等待加载
     * @param {String} url 网页链接
     * @param {Number} width 页面的宽度
     * @param {Number} height 页面的高度
     * @return {image} 图片
     */
    async webPreview(url, width = 1920, height = 1080, headers = {}) {

        const browser = await puppeteer.launch({
            headless: true,
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
        await page.setExtraHTTPHeaders(headers)
        await page.goto(url);
        await page.setViewport({
            width: width,
            height: height
        });

        let res = await page.screenshot({
            fullPage: true
        })

        await browser.close();
        return segment.image(res)
    }
}