/* eslint-disable no-void */
import fetch from 'node-fetch'
import { Config } from '../components/index.js'
import { common } from './index.js'
import sites from '../tools/sites.js'

export default new class {
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
    if (!res) return { error: 'SauceNAO搜图请求失败' }
    let msg = await Promise.all(sites(res).map(async item => [
      `SauceNAO (${item.similarity})\n`,
      await common.proxyRequestImg(item.thumbnail),
      `\nsite：${item.site}\n`,
      `作者：${item.authorName}\n`,
      `作者主页：${item.authorUrl}\n`,
      `作品链接：${item.url[0]}`
    ]))
    if (res.headers.long_remaining < 10) {
      msg.push(`SauceNAO 24h 内仅剩 ${res.headers.long_remaining} 次使用次数`)
    }
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
