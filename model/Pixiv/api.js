import request from '../../lib/request/request.js'
import moment from 'moment'
import { Config } from '../../components/index.js'
export default class PixivApi {
  constructor (refresh_token) {
    this.baseUrl = 'https://app-api.pixiv.net/'
    this.headers = {
      'User-Agent': 'PixivIOSApp/7.13.3 (iOS 14.6; iPhone13,2)',
      'Accept-Language': Config.pixiv.language,
      'App-OS': 'ios',
      'App-OS-Version': '14.6',
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: '*/*',
      Connection: 'keep-alive'
    }
    this._once = false
    this.refresh_token = refresh_token
    this.access_token = null
    this.auth = null
    this.login()
  }

  async login () {
    if (!this.refresh_token) {
      throw Error('[Yenai][Pixiv] 未配置refresh_token刷新令牌')
    }
    const data = {
      client_id: 'MOBrBDS8blbauoSck0ZfDbtuzpyT',
      client_secret: 'lsACyCD94FhDUtGTXi3QzcFE2uU1hqtDaKeqrdwj',
      grant_type: 'refresh_token',
      refresh_token: this.refresh_token
    }
    const { response, error } = await request.post('https://oauth.secure.pixiv.net/auth/token', {
      data,
      headers: this.headers
    }).then(res => res.json())
    if (error) throw Error(`[Yenai][Pixiv]login Error Response: ${error}`)
    this.access_token = response.access_token
    this.refresh_token = response.refresh_token
    this.auth = response
    if (this.access_token) {
      const { id, name, account } = this.auth.user
      logger.info(`[Yenai][Pixiv]login ${logger.yellow(`${name}(${id}) @${account}`)} ${logger.green('success')}`)
    } else {
      logger.error(`[Yenai][Pixiv]login ${logger.red('fail')}`)
    }
  }

  async request (target, options = {}) {
    try {
      return await this._get(target, options)
    } catch (error) {
      if (this._once) {
        this._once = false
        throw error
      }
      await this.login()
      this._once = true
      return await this._get(target, options)
    }
  }

  async _get (target, options = {}) {
    const headers = {
      ...this.headers,
      Authorization: `Bearer ${this.access_token}`
    }
    return request[options.data ? 'post' : 'get'](this.baseUrl + target, { headers, ...options, statusCode: 'json' })
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
    })
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
