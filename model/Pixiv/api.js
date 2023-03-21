import request, { qs } from '../../lib/request/request.js'
import moment from 'moment'
import { Config } from '../../components/index.js'
import md5 from 'md5'

const CLIENT_ID = 'MOBrBDS8blbauoSck0ZfDbtuzpyT'
const CLIENT_SECRET = 'lsACyCD94FhDUtGTXi3QzcFE2uU1hqtDaKeqrdwj'
const HASH_SECRET = '28c1fdd170a5204386cb1313c7077b34f83e4aaf4aa829ce78c231e05b0bae2c'
export default class PixivApi {
  constructor (refresh_token) {
    this.baseUrl = 'https://app-api.pixiv.net/'
    this.headers = {
      'User-Agent': 'PixivIOSApp/7.13.3 (iOS 14.6; iPhone13,2)',
      'Accept-Language': Config.pixiv.language,
      'App-OS': 'ios',
      'App-OS-Version': '14.6',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': '*/*',
      'Connection': 'Keep-Alive'
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
    const local_time = moment().format()
    const headers = {
      ...this.headers,
      'X-Client-Time': local_time,
      'X-Client-Hash': md5(`${local_time}${HASH_SECRET}`)
    }
    const data = {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: this.refresh_token
    }
    const { response, error } = await request.post('https://oauth.secure.pixiv.net/auth/token', {
      data,
      headers
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

  async request (target, options = {}, caching = false) {
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
function timeToSeconds (time) {
  let seconds = 0
  let timeArray = time.split(' ')
  for (let i = 0; i < timeArray.length; i++) {
    let unit = timeArray[i].charAt(timeArray[i].length - 1)
    let value = parseInt(timeArray[i].substring(0, timeArray[i].length - 1))
    switch (unit) {
      case 's':
        seconds += value
        break
      case 'm':
        seconds += value * 60
        break
      case 'h':
        seconds += value * 60 * 60
        break
      case 'd':
        seconds += value * 60 * 60 * 24
        break
      default:
        break
    }
  }
  return seconds
}

function getNoonTomorrow () {
  const now = moment() // 获取当前时间
  const noonToday = moment().startOf('day').add(12, 'hours') // 获取今天中午12点的时间
  const noonTomorrow = moment().add(1, 'day').startOf('day').add(12, 'hours') // 获取明天中午12点的时间

  return (now < noonToday
    ? noonToday.diff(now, 'hours')
    : noonTomorrow.diff(now, 'hours')) + 'h'
}
