import child_process from "child_process"
import util from "util"
import { Config } from "../../components/index.js"
const execAsync = util.promisify(child_process.exec)

const getFastFetchFun = await initFastFetch()

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
    logger.error(`[Yenai-Plugin][状态][FastFetch]Error 无法获取FastFetch 请检查是否使用git bash启动Yunzai-bot或安装手动 fastfetch 项目地址：https://github.com/fastfetch-cli/fastfetch\n错误信息：${error.message}`)
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
  let { stdout } = await execAsync("fastfetch --pipe -l none")

  let output = "<div class='box fastFetch' data-boxInfo='FastFetch'>"
  output += _printInfo(stdout)
  output += "</div>"
  return output
}

async function bashGetFastFetch() {
  let { stdout } = await execAsync("bash plugins/yenai-plugin/resources/state/state.sh")
  return stdout.trim()
}
function _printInfo(input) {
  const lines = input.split("\n").filter(i => i.includes(":")).map(line => line.replace(/: /, "</p><p>"))
  return lines.map(line => `<div class='speed'><p>${line}</p></div>`).join("")
}

async function initFastFetch() {
  let getFastFetchFun = null

  const [ bashResult, directResult ] = await Promise.allSettled([
    bashGetFastFetch(),
    directlyGetFastFetch()
  ])

  if (bashResult.status === "fulfilled") {
    getFastFetchFun = bashGetFastFetch
  } else if (directResult.status === "fulfilled") {
    getFastFetchFun = directlyGetFastFetch
  } else {
    logger.debug("[Yenai-Plugin][状态][FastFetch]Both fetch methods failed:", bashResult.reason, directResult.reason)
  }

  return getFastFetchFun
}
