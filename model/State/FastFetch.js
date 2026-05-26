import child_process from "child_process"
import util from "util"
import { Config, Log_Prefix } from "../../components/index.js"

const execAsync = util.promisify(child_process.exec)
// let getFastFetchFun = null;
// (async() => {
//   getFastFetchFun = await initFastFetch()
// })()

/**
 * 获取FastFetch
 * @param e
 */
export default async function getFastFetch(e) {
  if (!isFeatureVisible(e.isPro)) return false

  try {
    return await getFastFetchFun()
  } catch (error) {
    logger.error(`${Log_Prefix}[State][FastFetch]Error 无法获取FastFetch 请检查是否使用git bash启动Yunzai-bot或手动安装 fastfetch 项目地址：https://github.com/fastfetch-cli/fastfetch\n错误信息：${error.message}`)
    return false
  }
}

async function getFastFetchFun() {
  try {
    return await directlyGetFastFetch()
  } catch (error) {
    return await getNeowofetch()
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
  const regex = /^(.*)\s+\((#[0-9A-Fa-f]{6})\)(.*?): (.*)/
  const lines = stdout.split("\n").filter(i => i.includes(":")).map(line => {
    const match = line.match(regex)
    return {
      icon: {
        color: match[2],
        icon: match[1]
      },
      key: match[3],
      value: match[4]
    }
  })

  logger.debug(`${Log_Prefix}[State][FastFetch] fastfetch执行结果：`, lines)
  return lines
}

async function getNeowofetch() {
  let { stdout } = await execAsync("pnpx neowofetch --stdout")
  return stdout.split("\n").filter(i => i.includes(":")).map(line => {
    let res = line.split(": ")
    return {
      key: res[0],
      value: res[1]
    }
  })
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
      i.name = "Disk IO · " + i.name
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
