import { Config } from '../../components/index.js'
import moment from 'moment'
import request from '../../lib/request/request.js'
import md5 from 'md5'

const CLIENT_ID = 'MOBrBDS8blbauoSck0ZfDbtuzpyT'
const CLIENT_SECRET = 'lsACyCD94FhDUtGTXi3QzcFE2uU1hqtDaKeqrdwj'
const HASH_SECRET = '28c1fdd170a5204386cb1313c7077b34f83e4aaf4aa829ce78c231e05b0bae2c'

export const headers = {
  'User-Agent': 'PixivIOSApp/7.13.3 (iOS 14.6; iPhone13,2)',
  'Accept-Language': Config.pixiv.language,
  'App-OS': 'ios',
  'App-OS-Version': '14.6',
  'Content-Type': 'application/x-www-form-urlencoded',
  'Accept': '*/*',
  'Connection': 'Keep-Alive'
}

export async function login (refresh_token) {
  const local_time = moment().format()
  let _headers = {
    ...headers,
    'X-Client-Time': local_time,
    'X-Client-Hash': md5(`${local_time}${HASH_SECRET}`)
  }
  const data = {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: 'refresh_token',
    refresh_token
  }
  const { response, error } = await request.post('https://oauth.secure.pixiv.net/auth/token', {
    data,
    headers: _headers
  }).then(res => res.json())
  if (error) throw Error(`[Yenai][Pixiv]login Error Response: ${error}`)
  if (response.access_token) {
    const { id, name, account } = this.auth.user
    logger.info(`[Yenai][Pixiv]login ${logger.yellow(`${name}(${id}) @${account}`)} ${logger.green('success')}`)
  } else {
    logger.error(`[Yenai][Pixiv]login ${logger.red('fail')}`)
  }
  return response
}
