import puppeteer from 'puppeteer'

class Browser {
    /**
     * @description: 返回网页截图
     * @param {String} url 网页链接
     * @return {image} 图片
     */
    async Webpage(url) {
        const browser = await puppeteer.launch({
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        });
        const page = await browser.newPage();
        await page.goto(url, { 'timeout': 1000 * 30, 'waitUntil': 'networkidle0' });
        await page.setViewport({
            width: 1920,
            height: 1080
        });
        // await page.autoScroll(page);
        try {
            let res = await page.screenshot({
                path: './paper.jpeg',
                fullPage: true,
                quality: 70
            }).catch(err => {
                console.log('截图失败');
                console.log(err);
            });
            await page.waitFor(5000);
            return res
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
    async webPreview(url, width = 1920, height = 1080) {

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
        await page.goto(url);
        await page.setViewport({
            width: width,
            height: height
        });

        let res = await page.screenshot({
            fullPage: true
        })

        await browser.close();
        return res
    }
}


export default new Browser();