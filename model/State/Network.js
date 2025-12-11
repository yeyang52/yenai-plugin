import { Config, Log_Prefix } from "../../components/index.js"
import request from "../../lib/request/request.js"
import Monitor from "./Monitor.js"
import { createAbortCont, getFileSize } from "./utils.js"
import _ from "lodash"

/** 获取当前网速 */
export function getNetwork() {
  let network = Monitor.network
  if (!network || network.length === 0) {
    return false
  }
  let data = network?.[0]
  let result = {}
  if (data) {
    if (data.rx_sec != null && data.tx_sec != null) {
      let _rx = getFileSize(data.rx_sec, { showByte: false, aloneUnit: true })
      let _tx = getFileSize(data.tx_sec, { showByte: false, aloneUnit: true })
      result.speed = {}
      result.speed.download = _rx
      result.speed.upload = _tx
    }
    if (data.rx_bytes != null && data.tx_bytes != null) {
      let _rxB = getFileSize(data.rx_bytes, { aloneUnit: true })
      let _txB = getFileSize(data.tx_bytes, { aloneUnit: true })
      result.traffic = {}
      result.traffic.download = _rxB
      result.traffic.upload = _txB
    }
  }

  return _.isEmpty(result) ? false : result
}

/**
 * 获取网络测试列表。
 * @param e
 * @returns {Promise<Array>} 返回一个Promise，该Promise解析为网络测试结果的数组。
 */
export async function getNetworkTestList(e) {
  const { show, list, timeout, concurNum } = Config.state.psTestSites

  if (!show || !list.length || (show === "pro" && !e.isPro)) {
    return false
  }

  return concurRequests(list, concurNum, timeout)
}

const concurRequests = (urls, maxNum, timeout) => {
  if (urls.length === 0) {
    return Promise.resolve([])
  }

  return new Promise((resolve) => {
    let nextIndex = 0
    let finishCount = 0
    const result = []
    async function _request() {
      if (nextIndex >= urls.length) return
      const i = nextIndex
      const url = urls[nextIndex++]
      const resp = await handleSite(url, timeout)
      result[i] = resp
      finishCount++
      if (finishCount === urls.length) {
        logger.debug(`${Log_Prefix}[State] 已完成所有网络测试`)
        return resolve(result)
      }
      _request()
    }
    for (let i = 0; i < Math.min(maxNum, urls.length); i++) {
      _request()
    }
  })
}

const handleSite = (site, timeout) => {
  return getNetworkLatency(site.url, timeout, site.useProxy)
    .then(res => ({ name: site.name, status: res.status, delay: res.delay }))
    .catch(error => {
      const errorMsg = handleError(error, site.name)
      const errorSpan = (errorMsg) => `<span style='color:#F44336'>${errorMsg}</span>`
      return { name: site.name, status: errorSpan("-"), delay: errorSpan(errorMsg) }
    })
}

const handleError = (error, siteName) => {
  let errorMsg = "Error"
  const prefix = `${Log_Prefix}[State]`
  if (error.name === "AbortError") {
    logger.warn(`${prefix}请求 ${siteName} 超时`)
    errorMsg = "Timeout"
  } else if (error.message.includes("ECONNRESET")) {
    logger.warn(`${prefix}请求 ${siteName} 发生了 ECONNRESET 错误:`, error.message)
    errorMsg = "Econnreset"
  } else {
    logger.error(`${prefix}请求 ${siteName} 过程中发生错误:`, error.message)
  }
  return errorMsg
}

/**
 * 网络测试
 * @param {string} url 测试的url
 * @param {number} [timeoutTime] 超时时间
 * @param {boolean} useProxy 是否使用代理
 * @returns {string}
 */
async function getNetworkLatency(url, timeoutTime = 5000, useProxy = false) {
  let { controller, clearTimeout } = await createAbortCont(timeoutTime)

  try {
    const startTime = Date.now()
    let { status } = await request.get(url, {
      signal: controller.signal,
      origError: true,
      outErrorLog: false,
      agent: !!useProxy
    })
    const endTime = Date.now()
    let delay = endTime - startTime
    logger.debug(`${Log_Prefix}[State][网络测试][${url}] ${logger.blue(status)} ${logger.green(delay + "ms")}`)

    const COLOR_DELAY_GOOD = "#188038"
    const COLOR_DELAY_AVERAGE = "#d68100"
    const COLOR_DELAY_BAD = "#F44336"
    const COLOR_STATUS_OK = "#188038"
    const COLOR_STATUS_WARNING = "#FF9800"
    const COLOR_STATUS_DANGER = "#9C27B0"
    const COLOR_STATUS_INFO = "#03A9F4"
    const COLOR_STATUS_BAD = "#F44336"

    let color = delay > 2000
      ? COLOR_DELAY_BAD
      : delay > 500
        ? COLOR_DELAY_AVERAGE
        : COLOR_DELAY_GOOD

    let statusColor = status >= 500
      ? COLOR_STATUS_DANGER
      : status >= 400
        ? COLOR_STATUS_BAD
        : status >= 300
          ? COLOR_STATUS_WARNING
          : status >= 200
            ? COLOR_STATUS_OK
            : status >= 100
              ? COLOR_STATUS_INFO
              : ""

    return {
      status: `<span style='color:${statusColor}'>${status}</span>`,
      delay: `<span style='color:${color}'>${delay}ms</span>`
    }
  } finally {
    clearTimeout()
  }
}
