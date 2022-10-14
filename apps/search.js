import plugin from '../../../lib/plugins/plugin.js'
import { segment } from "oicq";
import { createRequire } from 'module'
import lodash from 'lodash'
const require = createRequire(import.meta.url)

const SEARCH_MAP = {

  "百度": "https://www.baidu.com/s?wd=",

  "必应": "https://cn.bing.com/search?q=",

  "谷歌": "https://www.google.com/search?q=",

  "微博": "https://s.weibo.com/weibo?q=",

  "淘宝": "https://s.taobao.com/search?q=",

  "京东": "https://search.jd.com/Search?keyword=",

  "知乎": "https://www.zhihu.com/search?q=",

  "头条": "https://so.toutiao.com/search?keyword=",

  "抖音": "https://www.douyin.com/search/",

  "快手": "https://www.kuaishou.com/search/video?searchKey=",

  "虎牙": "https://www.huya.com/search?hsk=",

  "斗鱼": "https://www.douyu.com/search/?kw=",

  "萌娘百科": "https://zh.moegirl.org.cn/index.php?search=",

  "B站": "https://search.bilibili.com/all?keyword=",

  "腾讯视频": "https://v.qq.com/x/search/?q=",

  "优酷": "https://so.youku.com/search_video/",

  "爱奇艺": "https://so.iqiyi.com/so/q_",

  "芒果TV": "https://so.mgtv.com/so?k=",

  "百度图片": "https://image.baidu.com/search/index?tn=baiduimage&word=",

  "百度文库": "https://wenku.baidu.com/search?word=",

  "4399": "https://so2.4399.com/search/search.php?k=",

  "GitHub": "https://github.com/search?q=",

  "力扣": "https://leetcode.cn/search/?q=",

  "MDN": "https://developer.mozilla.org/zh-CN/search?q=",

  "CSDN": "https://so.csdn.net/so/search?q=",

  "掘金": "https://juejin.cn/search?query=",

  "油猴": "https://greasyfork.org/zh-CN/scripts?q=",
};

const searchReg = new RegExp(`^#?(${lodash.keys(SEARCH_MAP).join('|')})搜索.*`)

export class example extends plugin {
  constructor() {
    super({
      name: '聚合搜索',
      dsc: '搜索',
      event: 'message',
      priority: 5000,
      rule: [
        {
          reg: searchReg,
          fnc: 'search'
        },
        {
          reg: '#?搜索菜单',
          fnc: 'help'
        }
      ]

    })
  }

  async help(e) {
    const searchs = Object.keys(SEARCH_MAP);
    const menu = "当前支持的搜索引擎：\n";
    const tip = "\n格式：<搜索引擎> + 搜索 + <关键词>\n比如：萌娘百科搜索可莉";
    return e.reply(menu + searchs.join("、") + tip);
  }
  async search(e) {
    let regRet = searchReg.exec(e.msg)
    let content = e.msg.replace(regRet[1] + '搜索', "")
    let url = SEARCH_MAP[regRet[1]] + encodeURIComponent(content)

    const puppeteer = require('puppeteer');
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
    const max_height_px = 20000;
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

      await sleep(800);
    }

    try {
      await this.reply([segment.image(await page.screenshot({
        fullPage: true
      })), url]).catch(err => {
        console.log('截图失败');
        console.log(err);
      });
      await page.waitFor(5000);

    } catch (e) {
      console.log('执行异常');
    } finally {
      await browser.close();
    }

  }

}
//延时函数
function sleep(delay) {
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