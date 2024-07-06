import fetch from "node-fetch"
import { Config, Plugin_Path } from "../../components/index.js"
import { Agent } from "https"
import { HttpsProxyAgent } from "./httpsProxyAgentMod.js"
import _ from "lodash"

const CHROME_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.79 Safari/537.36"
const POSTMAN_UA = "PostmanRuntime/7.29.0"

class HTTPResponseError extends Error {
  constructor(response) {
    super(`HTTP Error Response: ${response.status} ${response.statusText}`)
    this.response = response
  }
}

class RequestError extends Error {
  constructor(message) {
    super(message)
    this.name = "RequestError"
  }
}

const checkStatus = response => {
  if (response.ok) {
    // response.status >= 200 && response.status < 300
    return response
  } else {
    throw new HTTPResponseError(response)
  }
}

export const qs = (obj) => {
  let res = ""
  for (const [ k, v ] of Object.entries(obj)) { res += `${k}=${encodeURIComponent(v)}&` }
  return res.slice(0, res.length - 1)
}

const mergeOptions = (defaultOptions, userOptions) => {
  const _defaultOptions = {
    outErrorLog: true
  }
  // 优化headers的合并逻辑，确保安全性
  const headers = { ...defaultOptions.headers, ...userOptions.headers }
  return { ..._defaultOptions, ...defaultOptions, ...userOptions, headers }
}

export default new class {
  /**
   * 发送HTTP GET请求并返回响应
   * @async
   * @name get
   * @param {string} url - 请求的URL
   * @param {object} [options] - 请求的配置项
   * @param {object} [options.params] - 请求的参数
   * @param {object} [options.headers] - 请求的HTTP头部
   * @param {boolean} [options.closeCheckStatus] - 是否关闭状态检查
   * @param {'buffer'|'json'|'text'|'arrayBuffer'|'formData'|'blob'}[options.responseType] - 期望的返回数据，如果设置了该值，则返回响应数据的特定的方法（如json()、text()等）
   * @param {boolean} [options.origError] 出现错误是否返回原始错误
   * @param {boolean} [options.outErrorLog] 出现错误是否在控制台打印错误日志，默认为true
   * @returns {Promise<Response|*>} - HTTP响应或响应数据
   * @throws {Error} - 如果请求失败，则抛出错误，将`options.origError`设置为true则抛出原始错误
   */
  async get(url, options = {}) {
    options = mergeOptions({ method: "GET", url }, options)
    options = this._prepareRequest(options)
    return this._reques(options)
  }

  /**
   * 发送HTTP POST请求并返回响应
   * @async
   * @function
   * @param {string} url - 请求的URL
   * @param {object} [options] - 请求的配置项
   * @param {object} [options.data] - 请求的数据
   * @param {object} [options.params] - 请求的参数
   * @param {object} [options.headers] - 请求的HTTP头部
   * @param {boolean} [options.closeCheckStatus] - 是否关闭状态检查
   * @param {'buffer'|'json'|'text'|'arrayBuffer'|'formData'|'blob'} [options.responseType] - 期望的返回数据，如果设置了该值，则返回响应数据的特定的方法（如json()、text()等）
   * @param {boolean} [options.origError] 出现错误是否返回原始错误
   * @param {boolean} [options.outErrorLog] 出现错误是否在控制台打印错误日志，默认为true
   * @returns {Promise<Response|*>} - HTTP响应或响应数据
   * @throws {Error} - 如果请求失败，则抛出错误，将`options.origError`设置为true则抛出原始错误
   */
  async post(url, options = {}) {
    options = mergeOptions({
      method: "POST", headers: { "Content-Type": "application/json" }, url
    }, options)
    options = this._prepareRequest(options)

    if (options.data) {
      logger.debug("[Yenai-Plugin]POST request params data: ", options.data)
      if (/json/.test(options.headers["Content-Type"])) {
        options.body = JSON.stringify(options.data)
      } else if (
        /x-www-form-urlencoded/.test(options.headers["Content-Type"])
      ) {
        options.body = qs(options.data)
      } else {
        options.body = options.data
      }
      delete options.data
    }
    return this._reques(options)
  }

  /**
   * 绕cf Get请求
   * @param {string} url
   * @param {object} options 同fetch第二参数
   * @param {object} options.params 请求参数
   * @returns {Promise<Response|*>}
   */
  async cfGet(url, options = {}) {
    options.cf = true
    options.headers = {
      "User-Agent": POSTMAN_UA,
      ...options.headers
    }
    return this.get(url, options)
  }

  /**
   * 绕cf Post请求
   * @param {string} url
   * @param {object} options 同fetch第二参数
   * @param {object | string} options.data 请求参数
   * @returns {Promise<Response|*>}
   */
  async cfPost(url, options = {}) {
    options.cf = true
    options.headers = {
      "User-Agent": POSTMAN_UA,
      ...options.headers
    }
    return this.post(url, options)
  }

  getAgent(cf, isProxy = true) {
    let { proxyAddress } = Config.proxy
    let { cfTLSVersion } = Config.picSearch
    return cf
      ? this.getTlsVersionAgent(proxyAddress, cfTLSVersion, isProxy)
      : isProxy
        ? new HttpsProxyAgent(proxyAddress)
        : false
  }

  /**
   * 从代理字符串获取指定 TLS 版本的代理
   * @param {string} str
   * @param {import('tls').SecureVersion} tlsVersion
   * @param isProxy
   */
  getTlsVersionAgent(str, tlsVersion, isProxy) {
    const tlsOpts = {
      maxVersion: tlsVersion,
      minVersion: tlsVersion
    }
    if (typeof str === "string") {
      const isHttp = str.startsWith("http")
      if (isHttp && isProxy) {
        const opts = {
          ..._.pick(new URL(str), [
            "protocol",
            "hostname",
            "port",
            "username",
            "password"
          ]),
          tls: tlsOpts
        }
        return new HttpsProxyAgent(opts)
      }
    }
    return new Agent(tlsOpts)
  }

  /**
   * 代理请求图片
   * @param {string} url 图片链接
   * @param {object} options 配置
   * @param {boolean} options.cache 是否缓存
   * @param {number} options.timeout 超时时间
   * @param {object} options.headers 请求头
   * @returns {Promise<import('icqq').ImageElem>} 构造图片消息
   */
  async proxyRequestImg(url, { cache, timeout, headers } = {}) {
    if (!this.getAgent()) return segment.image(url, cache, timeout, headers)
    const start = Date.now()
    let Request = await this.get(url, {
      headers,
      responseType: "buffer"
    }).catch(err => logger.error(err))
    const kb = Request ? logger.magenta((Request?.length / 1024).toFixed(2) + "kb") : logger.red("error")
    const ms = logger.green(Date.now() - start + "ms")
    logger.debug(`[Yenai-Plugin][proxyRequestImg][${_.truncate(url)}] ${kb} ${ms}`)
    return segment.image(Request ?? `${Plugin_Path}/resources/img/imgerror.png`, cache, timeout)
  }

  _prepareRequest(options) {
    // 处理参数
    if (options.params) {
      options.url = `${options.url}?${qs(options.params)}`
    }
    logger.debug(`[Yenai-Plugin] ${options.method.toUpperCase()}请求：${decodeURI(options.url)}`)
    options.headers = {
      "User-Agent": options.headers && options.headers["User-Agent"] ? options.headers["User-Agent"] : CHROME_UA,
      ...options.headers
    }

    if (options.agent === undefined || options.agent === true) {
      const isProxy = options.agent === true || this.verifyIsProxy(options.url)
      options.agent = this.getAgent(options.cf, isProxy)
    }
    return options
  }

  async _reques(options) {
    try {
      let res = await fetch(options.url, options)
      res = await this._handleRes(res, options)
      return res
    } catch (err) {
      this._handleError(err, options)
    }
  }

  _handleRes(res, options) {
    if (!options.closeCheckStatus) {
      res = checkStatus(res)
    }
    const responseType = options.responseType || options.statusCode
    if (responseType) {
      return res[responseType]()
    }
    return res
  }

  _handleError(err, options) {
    options.outErrorLog && logger.error(err)
    if (options.origError) throw err

    throw new RequestError(
        `${options.method.toUpperCase()} Error，${err.message.match(/reason:(.*)/)?.[1] || err.message}`
    )
  }

  verifyIsProxy(url) {
    const { blacklist, switchProxy, whitelist } = Config.proxy
    for (const i of whitelist) {
      let res = matchWithWildcards(i, url)
      if (res) return true
    }
    for (const i of blacklist) {
      let res = matchWithWildcards(i, url)
      if (res) return false
    }
    return switchProxy
  }
}()
function matchWithWildcards(pattern, text) {
  const regexPattern =
    pattern
      .replace(/\./g, "\\.")
      .replace(/\*/g, ".*")
      .replace(/\?/g, ".")
  const regex = new RegExp(regexPattern)
  return regex.test(text)
}
