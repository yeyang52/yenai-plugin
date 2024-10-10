import _ from "lodash"
import moment from "moment"
import { Config } from "../../components/index.js"
import common from "../../lib/common/common.js"
import getBotState from "./BotState.js"
import getCPU from "./CPU.js"
import getFastFetch from "./FastFetch.js"
import { getDiskSpeed, getFsSize } from "./FsSize.js"
import getGPU from "./GPU.js"
import Monitor from "./Monitor.js"
import { getNetwork, getNetworkTestList } from "./Network.js"
import getNode from "./NodeInfo.js"
import getOtherInfo, { getCopyright } from "./OtherInfo.js"
import getRAM from "./RAM.js"
import getSWAP from "./SWAP.js"
import getStyle, { getBackground } from "./style.js"

export async function getData(e) {
  e.isPro = e.msg.includes("pro")
  e.isDebug = e.msg.includes("debug")
  // 配置
  const { closedChart, systemResources } = Config.state
  // const _nameMap1 = [ "CPU", "RAM", "SWAP", "GPU", "Node" ]
  const _nameMap2 = [ "visualData", "FastFetch", "FsSize", "NetworkTest", "BotState", "Style" ]
  const debugFun = buildDebug(e.isPro)

  const mapFun = {
    "CPU": getCPU,
    "RAM": getRAM,
    "SWAP": getSWAP,
    "GPU": getGPU,
    "Node": getNode
  }
  const visualDataPromise = Promise.all(
    debugFun.add(systemResources.map(i => mapFun[i]()), systemResources)
  )
  const promiseTaskList = debugFun.add([
    visualDataPromise,
    getFastFetch(e),
    getFsSize(),
    getNetworkTestList(e),
    getBotState(e),
    getStyle()
  ], _nameMap2)
  const start = Date.now()
  const [
    visualData,
    FastFetch,
    HardDisk,
    psTest,
    BotStatusList,
    style
  ] = await Promise.all(promiseTaskList).then(res => {
    const end = Date.now()
    logger.debug(`Promise all: ${end - start} ms`)
    debugFun.addMsg(`all: ${end - start} ms`)
    return res
  })

  e.isDebug && debugFun.send(e)

  const chartData = JSON.stringify(
    common.checkIfEmpty(Monitor.chartData, [ "echarts_theme", "cpu", "ram" ])
      ? ""
      : Monitor.chartData
  )

  return {
    BotStatusList,
    chartData: closedChart ? false : chartData,
    visualData: _.compact(visualData),
    otherInfo: getOtherInfo(e),
    psTest: _.isEmpty(psTest) ? undefined : psTest,
    fsStats: getDiskSpeed(),
    copyright: await getCopyright(),
    network: getNetwork(),
    Config: JSON.stringify(Config.state),
    FastFetch,
    HardDisk,
    style,
    time: moment().format("YYYY-MM-DD HH:mm:ss"),
    isPro: e.isPro
  }
}

export async function getMonitorData() {
  return {
    chartData: JSON.stringify(Monitor.chartData),
    backdrop: await getBackground()
  }
}

function buildDebug(isDebug) {
  const debugMessages = []
  const startUsage = isDebug && {
    mem: process.memoryUsage(),
    cpu: process.cpuUsage()
  }
  function timePromiseExecution(promiseFn, name) {
    const startTime = Date.now()
    return promiseFn.then((result) => {
      const endTime = Date.now()
      logger.debug(`Promise ${name}: ${endTime - startTime} ms`)
      debugMessages.push(`${name}: ${endTime - startTime} ms`)
      return result
    })
  }
  return {
    add(promises, nameMap) {
      return promises.map((v, i) => timePromiseExecution(v, nameMap[i]))
    },
    addMsg(message) {
      return debugMessages.push(message)
    },
    send(e) {
      const endUsage = {
        mem: process.memoryUsage(),
        cpu: process.cpuUsage()
      }
      e.reply([
        debugMessages.join("\n"),
        `\nstartCpuUsageUser: ${startUsage.cpu.user}\n`,
        `endCpuUsageUser: ${endUsage.cpu.user}\n`,
        `startCpuUsageSystem: ${startUsage.cpu.system}\n`,
        `endCpuUsageSystem: ${endUsage.cpu.system}\n`,
        `startMemUsageUser: ${startUsage.mem.rss}\n`,
        `endMemUsageUser: ${endUsage.mem.rss}`
      ])
      debugMessages.length = 0
    }
  }
}
