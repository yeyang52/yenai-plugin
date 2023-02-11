import request from '../../lib/request/request.js'
import moment from 'moment'
import { Config } from '../../components/index.js'
export default class PixivApi {
  constructor (refresh_token) {
    this.access_token = null
    this.baseUrl = 'https://app-api.pixiv.net/'
    this.headers = {
      'User-Agent': 'PixivIOSApp/7.13.3 (iOS 14.6; iPhone13,2)',
      'Accept-Language': Config.pixiv.language,
      'App-OS': 'ios',
      'App-OS-Version': '14.6',
      Accept: '*/*',
      Connection: 'keep-alive'
    }
    this.login(refresh_token)
  }

  async login (refresh_token) {
    if (!refresh_token) {
      throw Error('Pixiv 未配置refresh_token刷新令牌')
    }
    const body = {
      client_id: 'MOBrBDS8blbauoSck0ZfDbtuzpyT',
      client_secret: 'lsACyCD94FhDUtGTXi3QzcFE2uU1hqtDaKeqrdwj',
      grant_type: 'refresh_token',
      refresh_token
    }
    const { response, error } = await request.post('https://oauth.secure.pixiv.net/auth/token', {
      body,
      headers: this.headers
    }).then(res => res.json())
    if (error) throw Error(`Pixiv login Error Response: ${error}`)
    this.access_token = response.access_token
  }

  async request (target, options = {}) {
    const headers = {
      ...this.headers,
      Authorization: `Bearer ${this.access_token}`
    }
    return request[options.data ? 'post' : 'get'](this.baseUrl + target, { headers, ...options }).then(res => res.json())
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
}
