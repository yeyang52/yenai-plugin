import fetch from 'node-fetch'
import { Config } from '../components/index.js'
import { common, puppeteer } from './index.js'
import sagiri from '../tools/sagiri.js'
import lodash from 'lodash'
import { segment } from 'oicq'
let cheerio = ''
export default new class {
  constructor () {
    this.ascii2dDomain = 'https://ascii2d.net'
  }

  async SauceNAO (url) {
    let apiKey = Config.picSearch.SauceNAOApiKey
    if (!apiKey) return { error: '未配置SauceNAOApiKey，无法使用SauceNAO搜图，请在 https://saucenao.com/user.php?page=search-api 进行获取，请用指令：#SauceNAOapiKey <apikey> 进行添加' }

    let params = {
      url,
      db: 999,
      api_key: apiKey,
      output_type: 2,
      numres: 3
    }
    let res = await this.request('https://saucenao.com/search.php', params)
    if (!res) return { error: 'SauceNAO搜图网络请求失败，注：移动网络无法访问saucenao，可尝试配置代理' }
    if (res.header.status != 0) return { error: 'SauceNAO搜图，错误信息：' + res.header.message.replace(/<.*?>/g, '') }
    let format = sagiri(res)
    if (lodash.isEmpty(format)) return { error: 'SauceNAO搜图无数据，自动使用 Ascii2D 进行搜图' }
    // if (lodash.isEmpty(format)) return { error: 'SauceNAO搜图无数据' }

    let msgMap = async item => [
      `SauceNAO (${item.similarity}%)\n`,
      await common.proxyRequestImg(item.thumbnail),
      `\nSite：${item.site}\n`,
      `作者：${item.authorName}(${item.authorUrl})\n`,
      `来源：${item.url.toString()}`
    ]
    let maxSimilarity = format[0].similarity
    if (res.maxSimilarity < Config.picSearch.SauceNAO_Min_sim) {
      return { error: `SauceNAO 相似度 ${res.maxSimilarity}% 过低，自动使用 Ascii2D 进行搜索` }
    }
    let filterSimilarity = format.filter(item => item.similarity > 80)
    let message = []
    if (!lodash.isEmpty(filterSimilarity)) {
      let filterPixiv = filterSimilarity.filter(item => item.site == 'Pixiv')
      if (!lodash.isEmpty(filterPixiv)) {
        message.push(await msgMap(filterPixiv[0]))
      } else {
        message.push(await msgMap(filterSimilarity[0]))
      }
    } else {
      message = await Promise.all(format.map(msgMap))
    }

    if (res.header.long_remaining < 30) {
      message.push(`${maxSimilarity > 80 ? '\n' : ''}SauceNAO 24h 内仅剩 ${res.header.long_remaining} 次使用次数`)
    }
    if (res.header.short_remaining < 3) {
      message.push(`${maxSimilarity > 80 ? '\n' : ''}SauceNAO 30s 内仅剩 ${res.header.short_remaining} 次。`)
    }
    return message
  }

  async Ascii2D (url) {
    let res = await puppeteer.get(`https://ascii2d.net//search/url/${url}`, 'body > .container')
    if (!res) return { error: 'Ascii2D搜图请求失败' }
    let data = await this.parse(res.data)
    if (data?.error) return data.error
    if (lodash.isEmpty(data)) return { error: 'Ascii2D数据获取失败' }
    let msg = data.map(item => [
      segment.image(item.image),
      `\n${item.hash}\n`,
      `${item.info}\n`,
      `作者:${item.author.text}(${item.author.link})\n`,
      `来源:${item.source.text}(${item.source.link})`
    ])
    msg.unshift('Ascii2D搜图结果')
    return msg
  }

  async parse (body) {
    if (!cheerio) {
      try {
        cheerio = await import('cheerio')
      } catch (e) {
        return { error: '未检测到依赖cheerio，请安装后再使用Ascii2D搜图' }
      }
    }
    const BASE_URL = 'https://ascii2d.obfs.dev/'
    const $ = cheerio.load(body, { decodeEntities: true })
    return lodash.map($('.item-box'), (item) => {
      const detail = $('.detail-box', item)
      const hash = $('.hash', item)
      const info = $('.info-box > .text-muted', item)
      const [image] = $('.image-box > img', item)

      const [source, author] = $('a[rel=noopener]', detail)

      if (!source && !author) return

      return {
        hash: hash.text(),
        info: info.text(),
        image: new URL(
          image.attribs.src ?? image.attribs['data-cfsrc'],
          BASE_URL
        ).toString(),
        source: source
          ? { link: source.attribs.href, text: $(source).text() }
          : undefined,
        author: author
          ? { link: author.attribs.href, text: $(author).text() }
          : undefined
      }
    }).filter(v => v !== undefined)
  }

  async request (url, params, headers) {
    const qs = (obj) => {
      let res = ''
      for (const [k, v] of Object.entries(obj)) { res += `${k}=${encodeURIComponent(v)}&` }
      return res.slice(0, res.length - 1)
    }
    let proxy = await common.getAgent()
    return await fetch(url + '?' + qs(params), {
      agent: proxy,
      headers
    }).then(res => res.json()).catch(err => console.log(err))
  }
}()
