import request from "../../lib/request/request.js"
import { Config } from "../../components/index.js"

export default function getNetworTestList () {
  let { psTestSites, psTestTimeout } = Config.state
  if (psTestSites) {
    let psTest = psTestSites?.map(i => getNetworkLatency(i.url, psTestTimeout).then(res => {
      return {
        first: i.name,
        tail: res
      }
    }))
    return Promise.all(psTest)
  } else {
    return []
  }
}
/**
 * 网络测试
 * @param {string} url 测试的url
 * @param {number} [timeoutTime] 超时时间
 * @returns {string}
 */
async function getNetworkLatency (url, timeoutTime = 5000) {
  const AbortController = globalThis.AbortController || await import("abort-controller")

  const controller = new AbortController()
  const timeout = setTimeout(() => {
    controller.abort()
  }, timeoutTime)
  try {
    const startTime = Date.now()
    let { status } = await request.get(url, { signal: controller.signal })
    const endTime = Date.now()
    let delay = endTime - startTime
    let color = ""; let statusColor = ""
    if (delay > 2000) {
      color = "#F44336"
    } else if (delay > 500) {
      color = "#d68100"
    } else {
      color = "#188038"
    }
    if (status >= 500) {
      statusColor = "#9C27B0"
    } else if (status >= 400) {
      statusColor = "#F44336"
    } else if (status >= 300) {
      statusColor = "#FF9800"
    } else if (status >= 200) {
      statusColor = "#188038"
    } else if (status >= 100) {
      statusColor = "#03A9F4"
    }
    return `<span style='color:${statusColor}'>${status}</span> | <span style='color:${color}'>${delay}ms</span>`
  } catch {
    return "<span style='color:#F44336'>timeout</span>"
  } finally {
    clearTimeout(timeout)
  }
}
