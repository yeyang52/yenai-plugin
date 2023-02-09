import fetch from 'node-fetch'
import md5 from 'md5'
import _ from 'lodash'
import request from '../../lib/request/request.js'
import { segment } from 'oicq'
const API_ERROR = '出了点小问题，待会再试试吧'

export default new class {
  constructor () {
    this.langtype = [{
      code: 'ar',
      label: '阿拉伯语',
      alphabet: 'A'
    }, {
      code: 'de',
      label: '德语',
      alphabet: 'D'
    }, {
      code: 'ru',
      label: '俄语',
      alphabet: 'E'
    }, {
      code: 'fr',
      label: '法语',
      alphabet: 'F'
    }, {
      code: 'ko',
      label: '韩语',
      alphabet: 'H'
    }, {
      code: 'nl',
      label: '荷兰语',
      alphabet: 'H'
    }, {
      code: 'pt',
      label: '葡萄牙语',
      alphabet: 'P'
    }, {
      code: 'ja',
      label: '日语',
      alphabet: 'R'
    }, {
      code: 'th',
      label: '泰语',
      alphabet: 'T'
    }, {
      code: 'es',
      label: '西班牙语',
      alphabet: 'X'
    }, {
      code: 'en',
      label: '英语',
      alphabet: 'Y'
    }, {
      code: 'it',
      label: '意大利语',
      alphabet: 'Y'
    }, {
      code: 'vi',
      label: '越南语',
      alphabet: 'Y'
    }, {
      code: 'id',
      label: '印度尼西亚语',
      alphabet: 'Y'
    }, {
      code: 'zh-CHS',
      label: '中文',
      alphabet: 'Z'
    }]
  }

  /** 有道翻译 */
  async youdao (msg, to = 'auto', from = 'auto') {
    if (to != 'auto') to = this.langtype.find(item => item.label == to)?.code
    if (from != 'auto') from = this.langtype.find(item => item.label == from)?.code
    if (!to || !from) return `未找到翻译的语种，支持的语言为：\n${this.langtype.map(item => item.label).join('，')}\n示例：#翻译你好 - 自动翻译\n#日语翻译你好 - 指定翻译为语种\n#中文-日语翻译你好 - 指定原语言翻译为指定语言`
    // 翻译结果为空的提示
    const RESULT_ERROR = '找不到翻译结果'
    // API 请求错误提示
    const qs = (obj) => {
      let res = ''
      for (const [k, v] of Object.entries(obj)) { res += `${k}=${encodeURIComponent(v)}&` }
      return res.slice(0, res.length - 1)
    }
    const appVersion = '5.0 (Windows NT 10.0; Win64; x64) Chrome/98.0.4750.0'
    const payload = {
      from,
      to,
      bv: md5(appVersion),
      client: 'fanyideskweb',
      doctype: 'json',
      version: '2.1',
      keyfrom: 'fanyi.web',
      action: 'FY_BY_DEFAULT',
      smartresult: 'dict'
    }
    const headers = {
      Host: 'fanyi.youdao.com',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/98.0.4758.102',
      Referer: 'https://fanyi.youdao.com/',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      Cookie: 'OUTFOX_SEARCH_USER_ID_NCOO=133190305.98519628; OUTFOX_SEARCH_USER_ID="2081065877@10.169.0.102";'
    }
    const api = 'https://fanyi.youdao.com/translate_o?smartresult=dict&smartresult=rule'
    const key = 'Ygy_4c=r#e#4EX^NUGUc5'

    const i = msg // 翻译的内容
    const lts = '' + new Date().getTime()
    const salt = lts + parseInt(String(10 * Math.random()), 10)
    const sign = md5(payload.client + i + salt + key)
    const postData = qs(Object.assign({ i, lts, sign, salt }, payload))
    try {
      let { errorCode, translateResult } = await fetch(api, {
        method: 'POST',
        body: postData,
        headers
      }).then(res => res.json()).catch(err => console.error(err))
      if (errorCode != 0) return API_ERROR
      translateResult = _.flattenDeep(translateResult)?.map(item => item.tgt).join('\n')
      if (!translateResult) return RESULT_ERROR
      return translateResult
    } catch (e) {
      console.log(e)
      return API_ERROR
    }
  }

  /** 随机唱歌/唱鸭 */
  async randomSinging () {
    try {
      const api = 'https://m.api.singduck.cn/user-piece/SoQJ9cKu61FJ1Vwc7'
      let res = await fetch(api).then(res => res.text())
      let JSONdara = JSON.parse(res.match(/<script id="__NEXT_DATA__" type="application\/json" crossorigin="anonymous">(.*?)<\/script>/)[1])
      if (!JSONdara) return { error: API_ERROR }
      let piece = _.sample(JSONdara.props.pageProps.pieces)
      let { songName, lyric, audioUrl } = piece
      if (!audioUrl) return { error: '找不到歌曲文件' }
      return {
        lyrics: `《${songName}》\n${lyric}`,
        audioUrl: decodeURIComponent(audioUrl)
      }
    } catch (error) {
      console.log(error)
      return { error: API_ERROR }
    }
  }

  /**
   * @description: 黑丝屋
   * @param {data.heisiType} type 类型
   * @param {Number} page 页数
   * @return {*}
   */
  async heisiwu (type, page) {
    const { load } = await import('cheerio')
      .catch(() => {
        throw Error('未检测到依赖cheerio，请安装后再使用该功能，安装命令：pnpm add cheerio -w 或 pnpm install -P')
      })
    const url = `http://hs.heisiwu.com/${type}/page/${_.random(1, page)}`
    const home = await request.get(url).then(res => res.text())
    const href = _.sample(_.map(load(home)('article > a'), (item) => item.attribs.href))
    if (_.isEmpty(href)) throw Error('获取页面失败')
    const details = await request.get(href).then(res => res.text())
    const $ = load(details)
    const imgs = _.map($('.alignnone'), (item) => item.attribs.src)
    if (_.isEmpty(imgs)) throw Error('获取图片失败')
    const title = $('.article-content > p:nth-child(1)').text()
    const msg = imgs.map(item => segment.image(item, undefined, undefined,
      {
        Referer: 'http://hs.heisiwu.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36 Edg/108.0.1462.46'
      })
    )
    return [title, ...msg]
  }

  /** @deprecated use `funApi.heisiwu()` */
  async heisiwux (type, page) {
    // 请求主页面
    let url = `http://hs.heisiwu.com/${type}/page/${_.random(1, page)}`
    let homePage = await request.get(url).then(res => res.text())
    // 解析html
    let childPageUrlList = homePage.match(/<a target(.*?)html/g)
    let childPageUrl = _.sample(childPageUrlList).match(/href="(.*)/)
    // 请求图片页面
    let childPage = await request.get(childPageUrl[1]).then(res => res.text())
    // 获取html列表
    let imghtml = childPage.match(/<img loading(.*?)jpg/g)
    // 提取图片并转换
    return imghtml.map(item => {
      item = segment.image(item.match(/src="(.*)/)[1])
      item.headers = {
        Referer: 'http://hs.heisiwu.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36 Edg/108.0.1462.46'
      }
      return item
    })
  }

  async pandadiu (keywords = '') {
    const { load } = await import('cheerio')
      .catch(() => {
        throw Error('未检测到依赖cheerio，请安装后再使用该功能，安装命令：pnpm add cheerio -w 或 pnpm install -P')
      })
    let domain = 'https://www.pandadiu.com'
    let url = ''
    if (keywords) {
      url = `${domain}/index.php?m=search&c=index&a=init&typeid=1&siteid=1&q=${keywords}`
    } else {
      url = `${domain}/list-31-${_.random(1, 177)}.html`
    }
    const home = await request.get(url).then(res => res.text())
    const href = _.sample(_.map(load(home)('div.cover.mod_imgLight > a, li.wrap > div > a'), item => item.attribs.href))
    const details = await request.get(domain + href).then(res => res.text())
    const $ = load(details)
    const imgs = _.map($('div.con > p > img'), item => item.attribs.src)
    const title = $('div.title > h1').text()
    return [
      title,
      ...imgs.map(item => {
        return segment.image(new RegExp(domain).test(item) ? item : domain + item)
      })
    ]
  }

  async mengdui (keywords, isSearch) {
    const cheerio = await import('cheerio')
      .catch(() => {
        throw Error('未检测到依赖cheerio，请安装后再使用该功能，安装命令：pnpm add cheerio -w 或 pnpm install -P')
      })
    const domain = 'https://b6u8.com'
    let href = ''
    if (isSearch) {
      const mengduipage = JSON.parse(await redis.get('yenai:mengduipage')) || {}
      const randomPage = _.random(1, mengduipage[keywords] || 1)
      const url = `${domain}/search.php?mdact=community&q=${keywords}&page=${randomPage}`
      const home = await request.get(url).then(res => res.text())
      const $ = cheerio.load(home)
      href = _.sample(_.map($('div.md-wide > ul > li > a'), item => item.attribs.href))
      if (!href) throw Error($('div.no-tips > p:nth-of-type(1)').text().trim())
      const maxPage = $('div.pagebar.md-flex-wc.mb20 > a:not(:last-child)').length
      mengduipage[keywords] = maxPage
      await redis.set('yenai:mengduipage', JSON.stringify(mengduipage))
    } else {
      let random = keywords
      if (!random) {
        do {
          random = _.random(1, 11687)
        } while (
          _.inRange(random, 7886, 10136)
        )
      }
      href = `${domain}/post/${random}.html`
    }
    const details = await request.get(href).then(res => res.text())
    const $ = cheerio.load(details)
    const imgs = _.map($('div.md-text.mb20.f-16 > p > img'), item => segment.image(item.attribs.src))
    const title = $('h1').text().trim()
    return [title, ...imgs]
  }
}()
