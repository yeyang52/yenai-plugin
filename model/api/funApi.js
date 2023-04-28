import _ from 'lodash'
import md5 from 'md5'
import fetch from 'node-fetch'
import request from '../../lib/request/request.js'
import { puppeteer } from '../index.js'
import { xiurenTypeId, youDaoLangType, pandadiuType } from '../../constants/fun.js'

const API_ERROR = '出了点小问题，待会再试试吧'

let cheerio = null
export default new class {
  constructor () {
    this.xiurenTypeId = xiurenTypeId
  }

  async _importDependency () {
    if (cheerio) return cheerio
    cheerio = await import('cheerio')
      .catch(() => {
        throw Error('未检测到依赖cheerio，请安装后再使用该功能，安装命令：pnpm add cheerio -w 或 pnpm install -P')
      })
  }

  /** 有道翻译 */
  async youdao (msg, to = 'auto', from = 'auto') {
    if (to != 'auto') to = youDaoLangType.find(item => item.label == to)?.code
    if (from != 'auto') from = youDaoLangType.find(item => item.label == from)?.code
    if (!to || !from) return `未找到翻译的语种，支持的语言为：\n${youDaoLangType.map(item => item.label).join('，')}\n示例：#翻译你好 - 自动翻译\n#日语翻译你好 - 指定翻译为语种\n#中文-日语翻译你好 - 指定原语言翻译为指定语言`
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
      'Host': 'fanyi.youdao.com',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/98.0.4758.102',
      'Referer': 'https://fanyi.youdao.com/',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Cookie': 'OUTFOX_SEARCH_USER_ID_NCOO=133190305.98519628; OUTFOX_SEARCH_USER_ID="2081065877@10.169.0.102";'
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
    } catch (err) {
      logger.error(err)
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
    await this._importDependency()
    const url = `http://hs.heisiwu.com/${type}/page/${_.random(1, page)}`
    const home = await request.get(url).then(res => res.text())
    const href = _.sample(_.map(cheerio.load(home)('article > a'), (item) => item.attribs.href))
    if (_.isEmpty(href)) throw Error('获取页面失败')
    const details = await request.get(href).then(res => res.text())
    const $ = cheerio.load(details)
    const imgs = _.map($('.alignnone'), (item) => item.attribs.src)
    if (_.isEmpty(imgs)) throw Error('获取图片失败')
    const title = $('.article-content > p:nth-child(1)').text()
    const msg = imgs.map(item => segment.image(item, undefined, undefined,
      {
        'Referer': 'http://hs.heisiwu.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36 Edg/108.0.1462.46'
      })
    )
    return [title, ..._.take(msg, 30)]
  }

  async pandadiu (type = 'cos', keywords = '') {
    await this._importDependency()
    let domain = 'https://www.pandadiu.com'
    const { id, page } = pandadiuType[type]
    let homeUrl = `${domain}/list-${id}-${_.random(1, page)}.html`
    if (keywords) {
      homeUrl = `${domain}/index.php?m=search&c=index&a=init&typeid=1&siteid=1&q=${keywords}`
    }
    logger.debug('[Yenai-Plugin][acg]作品索引页：' + homeUrl)
    const home = await request.get(homeUrl).then(res => res.text())
    const href = _.sample(_.map(cheerio.load(home)('div.cos-list.clearfix > ul > a, div.cover.mod_imgLight > a'), item => item.attribs.href))
    if (!href) throw Error('未找到结果')
    logger.debug('[Yenai-Plugin][acg]图片详情页：' + domain + href)
    const details = await request.get(domain + href).then(res => res.text())
    const $ = cheerio.load(details)
    const imgs = _.map($('div.con > p > img'), item =>
      segment.image(item.attribs.src.includes('http')
        ? item.attribs.src
        : domain + item.attribs.src
      ))
    const title = $('div.title > h1').text()
    return [
      title,
      ..._.take(imgs, 30)
    ]
  }

  async mengdui (keywords, isSearch) {
    await this._importDependency()
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
    const number = `序号：${href.match(/(\d+).html/)[1]}`
    return [title, number, ..._.take(imgs, 30)]
  }

  async xiuren (type) {
    await this._importDependency()
    // 可扩展
    let handleType = this.xiurenTypeId[type]
    let homeUrl = `https://www.lisiku1.com/forum-${handleType.id}-${_.random(1, handleType.maxPage)}.html`
    let html = await request.get(homeUrl).then(res => res.text())
    let $ = cheerio.load(html)
    let href = _.sample(
      _.map(
        $('#moderate > div > div.kind_show > div > div:nth-child(1) > a'),
        (item) => item.attribs.href
      )
    )
    let imgPageUrl = 'https://www.lisiku1.com/' + href
    let imgPage = await request.get(imgPageUrl).then((res) =>
      res.text()
    )
    let $1 = cheerio.load(imgPage)
    let imgList = _.map(
      $1(
        'td > img'
      ), item => segment.image('https://www.lisiku1.com/' + item.attribs.src)
    )
    return imgList
  }

  async bgg (keyword) {
    await this._importDependency()
    let url = 'https://www.gstonegames.com/game/?hot_sort=1&keyword=' + encodeURIComponent(keyword)
    const home = await request.get(url).then((res) => res.text())
    const $ = cheerio.load(home)

    // 获取集石第一个搜索结果的地址
    const firstGameLink = $('.goods-list.fl').first().find('a').attr('href')
    // 如果搜不到
    if (!firstGameLink) {
      const screenshot = await puppeteer.Webpage({ url })
      return [
        '集石搜索不到该游戏：',
        `搜索地址：${url}`,
        '\n以下是搜索页面的截图：',
        screenshot
      ]
    }
    // 拼出集石详情网址并访问
    let href = `https://www.gstonegames.com${firstGameLink}`
    logger.info(`集石详情网址：${href}`)

    const detailshtml = await request.get(href).then((res) => res.text())

    const details$ = cheerio.load(detailshtml)

    // 获取游戏类型
    const gametype = details$(
      '.published:contains("分类信息") .part-left-title + ul li:nth-child(1) a'
    )
      .text()
      .trim()
    const gamemode = details$(
      '.published:contains("分类信息") .part-left-title + ul li:nth-child(2) a'
    )
      .text()
      .trim()
    // const gamemove =details$('.published:contains("分类信息") .part-left-title + ul li:nth-child(3) a').text().trim();

    // 获取BGG网址
    const bgglink = details$('.published.who.matop15.mabot50')
      .eq(2)
      .find('a')
      .attr('href')
    // 如果搜不到
    if (!bgglink) {
      let url = href
      const screenshot = await puppeteer.Webpage({ url })
      return [
        '集石该游戏页面无BGG信息：',
        `搜索地址：${url}`,
        '\n以下是该游戏集石页面的截图：',
        screenshot
      ]
    }
    // 如果搜到了
    logger.info(bgglink)
    // 扒集石的数据
    const gameName2 = details$('.details-title h2 a').text().trim()
    logger.info(`游戏中文名字:${gameName2}`)

    // 访问bgg
    const bgghtml = await request.get(bgglink).then((res) => res.text())

    const bgg$ = cheerio.load(bgghtml)

    // 开扒
    let scriptdataA = bgg$('script').eq(2).text()
    let scriptdata = JSON.parse(
      scriptdataA.substring(
        scriptdataA.indexOf('GEEK.geekitemPreload = ') + 22,
        scriptdataA.indexOf('GEEK.geekitemSettings = ') - 3
      )
    )
    let {
      minplayers,
      maxplayers,
      minplaytime,
      maxplaytime,
      minage
    } = scriptdata.item
    let avgweight = scriptdata.item.stats.avgweight.substring(0, 4)
    let OverallRank = scriptdata.item.rankinfo[0].rank
    const gameName1 = JSON.parse(
      bgg$("script[type='application/ld+json']").text()
    ).name
    const gameimg = JSON.parse(
      bgg$("script[type='application/ld+json']").text()
    ).image

    logger.info(`游戏英文名字:${gameName1}`)

    // 回复
    return [
      `游戏中文名：${gameName2}\n`,
      `游戏英文名：${gameName1}\n`,
      `游戏类型：${gametype}\n`,
      `游戏模式：${gamemode}\n`,
      `BGG地址：${bgglink}\n`,
      `集石地址：${href}\n`,
      `BGG当前总排名：${OverallRank}\n`,
      `支持游玩人数：${minplayers}-${maxplayers}\n`,
      `大概游玩时间：${minplaytime}-${maxplaytime}分钟\n`,
      `推荐年龄：${minage}+\n`,
      `游戏重度：${avgweight}/5\n`,
      segment.image(gameimg)
    ]
  }

  async coser () {
    await this._importDependency()
    const domain = 'https://t2cy.com'
    const homeUrl = `${domain}/acg/cos/index_${_.random(1, 30)}.html`
    logger.debug('[Yenai-Plugin][coser]作品索引页：' + homeUrl)
    const home = await request.get(homeUrl).then(res => res.text())
    const $ = cheerio.load(home)
    const href = _.sample(
      _.map(
        $('body > div > div.content.hidden > ul.cy2-coslist.clr > li > div.showImg > a'),
        (item) => item.attribs.href
      )
    )
    if (!href) throw Error('未知错误')
    logger.debug('[Yenai-Plugin][coser]图片详情页：' + domain + href)
    const imgPage = await request.get(domain + href).then(res => res.text())
    const $1 = cheerio.load(imgPage)
    const imgList = _.map(
      $1(
        'body > div > div.content.pb20.clr > div.cy_cosCon > div.w.maxImg.tc > p > img'
      ), item => segment.image(_.includes(item.attribs.src, 'http') ? item.attribs.src : domain + (item.attribs['data-loadsrc'] || item.attribs.src))
    )
    const title = $1('h1').text().trim()
    return [title, ..._.take(imgList, 20)]
  }
}()
