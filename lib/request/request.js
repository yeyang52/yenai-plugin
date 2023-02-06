import fetch from 'node-fetch'
import { segment } from 'oicq'
import { Config } from '../../components/index.js'
import { Agent } from 'https'
import { HttpsProxyAgent } from './httpsProxyAgentMod.mjs'
import _ from 'lodash'

const CHROME_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.79 Safari/537.36'
const POSTMAN_UA = 'PostmanRuntime/7.29.0'

export default new class {
  async get (url, options = {}) {
    // 处理参数
    if (options.params) {
      const values = Object.values(options.params)
      const keys = Object.keys(options.params)
      const arr = []
      for (let i = 0; i < values.length; i++) {
        arr.push(`${keys[i]}=${values[i]}`)
      }
      const str = arr.join('&')
      url += `?${str}`
    }
    options.headers = {
      'User-Agent': CHROME_UA,
      ...options.headers
    }
    if (!options.agent)options.agent = await this.getAgent()
    return await fetch(url, options).catch(err => {
      logger.error(err)
      const reason = err.message.match(/reason:(.*)/)
      throw Error(`Request Get Error，reason：${reason[1]}`)
    })
  }

  async post (url, options = {}) {
    options.method = 'POST'
    options.headers = {
      'User-Agent': CHROME_UA,
      ...options.headers
    }
    if (typeof options.data === 'object') {
      options.body = JSON.stringify(options.data)
      options.headers['Content-Type'] = 'application/json'
    }
    if (!options.agent)options.agent = await this.getAgent()
    return await fetch(url, options).catch(err => {
      logger.error(err)
      throw Error(`Request Post Error，reason：${err.message.match(/reason:(.*)/)[1]}`)
    })
  }

  async cfGet (url, options = {}) {
    options.agent = await this.getAgent(true)
    options.headers = {
      'User-Agent': POSTMAN_UA,
      ...options.headers
    }
    return this.get(url, options)
  }

  async cfPost (url, options = {}) {
    options.agent = await this.getAgent(true)
    options.headers = {
      'User-Agent': POSTMAN_UA,
      ...options.headers
    }
    return this.post(url, options)
  }

  async getAgent (cf) {
    let { proxyAddress, switchProxy } = Config.proxy; let { cfTLSVersion } = Config.picSearch
    return cf ? this.getTlsVersionAgent(proxyAddress, cfTLSVersion) : (switchProxy ? new HttpsProxyAgent(proxyAddress) : false)
  }

  /**
 * 从代理字符串获取指定 TLS 版本的代理
 * @param {string} str
 * @param {import('tls').SecureVersion} tlsVersion
 */
  getTlsVersionAgent (str, tlsVersion) {
  /** @type {import('tls').SecureContextOptions} */
    const tlsOpts = {
      maxVersion: tlsVersion,
      minVersion: tlsVersion
    }
    if (typeof str === 'string') {
      const isHttp = str.startsWith('http')
      if (isHttp && Config.proxy.switchProxy) {
        const opts = { ..._.pick(new URL(str), ['protocol', 'hostname', 'port', 'username', 'password']), tls: tlsOpts }
        return new HttpsProxyAgent(opts)
      }
    }
    return new Agent(tlsOpts)
  }

  /**
   * @description: 代理请求图片
   * @param {String} url 图片链接
   * @param {Boolean} cache 是否缓存
   * @param {Number} timeout 超时时间
   * @param {Object} headers 请求头
   * @return {segment.image} 构造图片消息
   */
  async proxyRequestImg (url, { cache, timeout, headers } = {}) {
    if (!await this.getAgent()) return segment.image(url, cache, timeout, headers)
    let buffer = await this.get(url, {
      headers
    }).then(res => res.arrayBuffer())
      .catch((err) => logger.warn(`图片加载失败 reason: ${err.message}`))
    if (!buffer) return segment.image('/plugins/yenai-plugin/resources/img/imgerror.png')
    let buff = Buffer.from(buffer)
    logger.debug(`Success: imgSize => ${(buff.length / 1024).toFixed(2) + 'kb'}`)
    return segment.image(buff, cache, timeout)
  }
}()
