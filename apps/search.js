import plugin from '../../../lib/plugins/plugin.js'
import lodash from 'lodash'
import Browser from '../model/Browser.js'
import { segment } from "oicq";

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
      name: '搜索',
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
    let reg = new RegExp(`#?${regRet[1]}搜索`)
    let content = e.msg.replace(reg, "")
    let url = SEARCH_MAP[regRet[1]] + encodeURIComponent(content)
    let res = await Browser.webPreview(url)

    if (res) {
      e.reply([segment.image(res), url]);
    } else {
      e.reply("截图失败");
    }

  }
}
