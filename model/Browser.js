import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const puppeteer = require('puppeteer');


class Browser {
    async Webpage(url) {
        // 启动Chromium
        const browser = await puppeteer.launch({ ignoreHTTPSErrors: true, headless: false, args: ['--no-sandbox'] });
        // 打开新页面
        const page = await browser.newPage();
        // 设置页面分辨率
        await page.setViewport({ width: 1920, height: 1080 });

        let request_url = url;
        // 访问
        await page.goto(request_url, { waitUntil: 'domcontentloaded' }).catch(err => console.log(err));
        await page.waitFor(1000);
        let title = await page.title();
        console.log(title);

        // 网页加载最大高度
        const max_height_px = 2000;
        // 滚动高度
        let scrollStep = 1080;
        let height_limit = false;
        let mValues = { 'scrollEnable': true, 'height_limit': height_limit };

        while (mValues.scrollEnable) {
            mValues = await page.evaluate((scrollStep, max_height_px, height_limit) => {

                // 防止网页没有body时，滚动报错
                if (document.scrollingElement) {
                    let scrollTop = document.scrollingElement.scrollTop;
                    document.scrollingElement.scrollTop = scrollTop + scrollStep;

                    if (null != document.body && document.body.clientHeight > max_height_px) {
                        height_limit = true;
                    } else if (document.scrollingElement.scrollTop + scrollStep > max_height_px) {
                        height_limit = true;
                    }

                    let scrollEnableFlag = false;
                    if (null != document.body) {
                        scrollEnableFlag = document.body.clientHeight > scrollTop + 1081 && !height_limit;
                    } else {
                        scrollEnableFlag = document.scrollingElement.scrollTop + scrollStep > scrollTop + 1081 && !height_limit;
                    }

                    return {
                        'scrollEnable': scrollEnableFlag,
                        'height_limit': height_limit,
                        'document_scrolling_Element_scrollTop': document.scrollingElement.scrollTop
                    };
                }

            }, scrollStep, max_height_px, height_limit);

            await this.sleep(800);
        }

        try {
            let res = await page.screenshot({
                fullPage: true
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
     * @return {img} 图片
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
    //延时函数
    sleep(delay) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    resolve(1)
                } catch (e) {
                    reject(0)
                }
            }, delay)
        })
    }
}


export default new Browser();