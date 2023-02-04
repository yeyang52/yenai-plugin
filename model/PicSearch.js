import fetch from 'node-fetch'
import { Config } from '../components/index.js'
import { common } from './index.js'
import sagiri from '../tools/sagiri.js'
import lodash from 'lodash'
export default new class {
  constructor () {
    this.ascii2dDomain = 'https://ascii2d.net'
  }

  async SauceNAO (url) {
    let apiKey = Config.picSearch.SauceNAOApiKey
    if (!apiKey) return { error: '未配置SauceNAOApiKey，无法使用SauceNAO搜图，请在 https://saucenao.com/user.php?page=search-api 进行获取' }

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
    // if (lodash.isEmpty(format)) return { error: 'SauceNAO搜图无数据，使用 Ascii2D 进行搜图' }
    if (lodash.isEmpty(format)) return { error: 'SauceNAO搜图无数据' }

    let msgMap = async item => [
      `SauceNAO (${item.similarity}%)\n`,
      await common.proxyRequestImg(item.thumbnail),
      `\nSite：${item.site}\n`,
      `作者：${item.authorName}(${item.authorUrl})\n`,
      `来源：${item.url[0]}`
    ]
    let maxSimilarity = format[0].similarity
    let filterSimilarity = format.filter(item => item.similarity > 80)
    let message = []
    if (lodash.isEmpty(filterSimilarity)) {
      let filterPixiv = filterSimilarity.filter(item => item.site == 'Pixiv')
      if (lodash.isEmpty(filterPixiv)) {
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
    return {
      maxSimilarity,
      isTooLow: maxSimilarity > Config.picSearch.SauceNAO_Min_sim,
      message
    }
  }

  async Ascii2D () {
    // ing~
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
