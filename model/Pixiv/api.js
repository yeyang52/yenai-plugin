import request, { qs } from '../../lib/request/request.js'
import moment from 'moment'
import { login, headers } from './login.js'
import { timeToSeconds, getNoonTomorrow } from './utils.js'

export default class PixivApi {
  constructor (refresh_token) {
    this.baseUrl = 'https://app-api.pixiv.net/'
    this.headers = headers
    this._once = false
    this.refresh_token = refresh_token
    this.access_token = null
    this.auth = null
  }

  async login () {
    if (!this.refresh_token) {
      throw Error('[Yenai][Pixiv] 未配置refresh_token刷新令牌')
    }
    const response = await login(this.refresh_token)
    this.access_token = response.access_token
    this.refresh_token = response.refresh_token
    this.auth = response
  }

  async request (target, options = {}, caching = false) {
    if (!this.auth) await this.login()
    try {
      return await this._get(target, options, caching)
    } catch (error) {
      if (this._once) {
        this._once = false
        throw error
      }
      await this.login()
      this._once = true
      return await this._get(target, options, caching)
    }
  }

  async _get (target, options = {}, cache) {
    const headers = {
      ...this.headers,
      Authorization: `Bearer ${this.access_token}`
    }
    // 读取缓存
    const cacheUrl = options.params ? target + '?' + qs(options.params) : target
    const cacheKey = `yenai:pixiv:cache:${cacheUrl}`
    const cacheData = await redis.get(cacheKey)
    if (cacheData) return JSON.parse(cacheData)
    // 请求
    let data = await request[options.data ? 'post' : 'get'](this.baseUrl + target, {
      headers,
      ...options,
      statusCode: 'json'
    })
    // 写入缓存
    if (cache) {
      redis.set(cacheKey, JSON.stringify(data), {
        EX: timeToSeconds(cache)
      })
    }
    return data
  }

  async tags () {
    return this.request('v1/trending-tags/illust')
  }

  async rank ({
    mode = 'week',
    date = moment().subtract(moment().utcOffset(9).hour() >= 12 ? 1 : 2, 'days').format('YYYY-MM-DD'),
    page = 1,
    size = 30
  }) {
    return this.request('v1/illust/ranking', {
      params: {
        mode,
        date,
        offset: (page - 1) * size
      }
    }, getNoonTomorrow())
  }

  async illust ({ id }) {
    return this.request('v1/illust/detail', {
      params: {
        illust_id: id
      }
    })
  }

  async member ({ id }) {
    return this.request('v1/user/detail', {
      params: {
        illust_id: id
      }
    })
  }

  async member_illust ({
    id,
    page = 1,
    size = 30,
    illust_type = 'illust'
  }) {
    return this.request('v1/user/illusts', {
      params: {
        user_id: id,
        type: illust_type,
        offset: (page - 1) * size
      }
    })
  }

  async search ({
    word,
    page = 1,
    size = 30,
    order = 'date_desc',
    mode = 'partial_match_for_tags',
    include_translated_tag_results = true
  }) {
    return this.request('v1/search/illust', {
      params: {
        word,
        search_target: mode,
        sort: order,
        offset: (page - 1) * size,
        include_translated_tag_results
      }
    })
  }

  async search_user ({
    word,
    page = 1,
    size = 30
  }) {
    return await this.request(
      'v1/search/user',
      {
        params: {
          word,
          offset: (page - 1) * size
        }
      }
    )
  }

  async related ({
    id,
    page = 1,
    size = 30
  }) {
    return await this.request(
      'v2/illust/related',
      {
        params: {
          illust_id: id,
          offset: (page - 1) * size
        }
      }
    )
  }

  async illustRecommended (params = {}) {
    return await this.request('v1/illust/recommended', params)
  }
}
