import { Config } from "../../components/index.js"
import request from "../../lib/request/request.js"
import Monitor from "./Monitor.js"
import { getFileSize, createAbortCont } from "./utils.js"

const defList = [
  { name: "Baidu", url: "https://baidu.com" },
  { name: "Google", url: "https://google.com" },
  { name: "TRSS", url: "https://trss.me" }
]
/**
 * 获取网络测试列表。
 * @param e
 * @returns {Promise<Array>} 返回一个Promise，该Promise解析为网络测试结果的数组。
 */
export function getNetworkTestList(e) {
  const { psTestSites, psTestTimeout } = Config.state
  if (!psTestSites) {
    return Promise.resolve([])
  }
  const parsedData = parseConfig(psTestSites, psTestTimeout)

  if (!parsedData.show) {
    return Promise.resolve([])
  }
  if (parsedData.show === "pro" && !e.isPro) {
    return Promise.resolve([])
  }
  if (parsedData.list.length === 0) {
    return Promise.resolve([])
  }

  // 使用Promise.all集中处理所有Promise
  let currentRequests = 0
  return Promise.all(parsedData.list.map((site) => {
    currentRequests++
    return handleSite(site).finally(() => {
      if (--currentRequests === 0) {
        logger.debug("[Yenai-Plugin][状态]已完成所有网络测试")
      }
    })
  }))
}

const handleSite = (site) => {
  return getNetworkLatency(site.url, site.timeout, site.useProxy)
    .then(res => ({ first: site.name, tail: res }))
    .catch(error => {
      const errorMsg = handleError(error, site.name)
      const errorSpan = `<span style='color:#F44336'>${errorMsg}</span>`
      return { first: site.name, tail: errorSpan }
    })
}

const handleError = (error, siteName) => {
  let errorMsg = "Error"
  const prefix = "[Yenai-Plugin][状态]"
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
 * 解析配置参数并返回配置对象。
 * @param {Array | string | boolean} psTestSites - 预期应该是对象包含show,list,timeout
 * @param {number} psTestTimeout - 保留老配置文件psTestTimeout
 * @returns {object} 包含配置信息的对象。
 */
function parseConfig(psTestSites, psTestTimeout) {
  let data = {
    show: "pro",
    list: [],
    timeout: psTestTimeout ?? 5000
  }

  if (Array.isArray(psTestSites)) {
    data.list = psTestSites
  } else if (typeof psTestSites === "object") {
    data = { ...data, ...psTestSites }
  } else if (
    (typeof psTestSites === "boolean" && psTestSites === true) ||
    (typeof psTestSites === "string" && psTestSites === "default")
  ) {
    data.show = true
    data.list = defList
  }

  return data
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
    logger.debug(`[Yenai-Plugin][状态][网络测试][${url}] ${logger.blue(status)} ${logger.green(delay + "ms")}`)

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

    return `<span style='color:${statusColor}'>${status}</span> | <span style='color:${color}'>${delay}ms</span>`
  } finally {
    clearTimeout()
  }
}
/** 获取当前网速 */
export function getNetwork() {
  let network = Monitor.network
  if (!network || network.length === 0) {
    return false
  }
  let data = []
  for (let v of network) {
    if (v.rx_sec != null && v.tx_sec != null) {
      let _rx = getFileSize(v.rx_sec, { showByte: false, showSuffix: false })
      let _tx = getFileSize(v.tx_sec, { showByte: false, showSuffix: false })
      data.push({
        first: v.iface,
        tail: `↑${_tx}/s | ↓${_rx}/s`
      })
    }
  }
  return data.length === 0 ? false : data
}
