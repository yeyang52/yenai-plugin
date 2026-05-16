import child_process from "child_process"
import util from "util"
import { Config, Log_Prefix } from "../../components/index.js"

const execAsync = util.promisify(child_process.exec)
let getFastFetchFun = null;
(async() => {
  getFastFetchFun = await initFastFetch()
})()

/**
 * 获取FastFetch
 * @param e
 */
export default async function getFastFetch(e) {
  if (!isFeatureVisible(e.isPro)) return ""
  if (!getFastFetchFun) return ""

  try {
    return await getFastFetchFun()
  } catch (error) {
    logger.error(`${Log_Prefix}[State][FastFetch]Error 无法获取FastFetch 请检查是否使用git bash启动Yunzai-bot或手动安装 fastfetch 项目地址：https://github.com/fastfetch-cli/fastfetch\n错误信息：${error.message}`)
    return ""
  }
}
function isFeatureVisible(isPro) {
  const { showFastFetch } = Config.state
  if (showFastFetch === true) return true
  if (showFastFetch === "pro" && isPro) return true
  if (showFastFetch === "default") {
    if (!isPlatformWin() || isPro) return true
  }
  return false
}
function isPlatformWin() {
  return process.platform === "win32"
}

async function directlyGetFastFetch() {
  let { stdout } = await execAsync("fastfetch --config ./plugins/yenai-plugin/resources/state/fastfetch/config.jsonc")

  let output = "<div class='box fastFetch' data-boxInfo='FastFetch'>"
  output += "<div class='title'><img src=\"../../../../../plugins/yenai-plugin/resources/state/icon/设置.png\" class='icon'>系统信息</div>"
  output += "<div class='content'>"
  output += _printInfo(stdout)
  output += "</div>"
  output += "</div>"
  return output
}

async function bashGetFastFetch() {
  let { stdout } = await execAsync("bash plugins/yenai-plugin/resources/state/fastfetch/fastfetch.sh")
  return stdout.trim()
}
function _printInfo(input) {
  const regex = /^(.*)\s+\((#[0-9A-Fa-f]{6})\)(.*?): (.*)/
  const lines = input.split("\n").filter(i => i.includes(":")).map(line => {
    const match = line.match(regex)
    return `<div class='speed'><p><span class="icon" style="color:${match[2]}">${match[1]}</span>${match[3]}</p><p>${match[4]}</p></div>`
  })
  return lines.join("")
}

async function initFastFetch() {
  let getFastFetchFun = null

  const [ bashResult, directResult ] = await Promise.allSettled([
    bashGetFastFetch(),
    directlyGetFastFetch()
  ])

  if (directResult.status === "fulfilled") {
    getFastFetchFun = directlyGetFastFetch
  } else if (bashResult.status === "fulfilled") {
    getFastFetchFun = bashGetFastFetch
  } else {
    logger.debug(`${Log_Prefix}[State][FastFetch]Both fetch methods failed:`, bashResult.reason, directResult.reason)
  }

  return getFastFetchFun
}

export async function getDiskIo() {
  try {
    let { stdout } = await execAsync("fastfetch -s diskio --format json")
    if (!stdout) return false
    let data = JSON.parse(stdout)[0]
    if (data.error) return false
    return data.result.map(i => {
      i.rIO_sec = i.bytesRead
      i.wIO_sec = i.bytesWritten
      i.name = i.name.trim()
      return i
    })
  } catch (error) {
    logger.debug(`${Log_Prefix}[State][FastFetch][DiskIO] 获取DiskIO失败：`, error)
    return false
  }
}
export async function getNetIo() {
  try {
    let { stdout } = await execAsync("fastfetch -s netIO --format json")
    if (!stdout) return false
    let data = JSON.parse(stdout)[0]
    if (data.error) return false
    return data.result.map(i => {
      i.rx_sec = i.rxBytes
      i.tx_sec = i.txBytes
      i.iface = i.name
      i.rx_bytes = 0
      i.tx_bytes = 0
      return i
    })
  } catch (error) {
    logger.debug(`${Log_Prefix}[State][FastFetch][NetIO] 获取NetIO失败：`, error)
    return false
  }
}
