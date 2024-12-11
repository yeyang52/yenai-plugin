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
import getRedisInfo from "./redis.js"
import getStyle from "./style.js"
import { BuildDebug } from "./debug.js"
import getProcessLoad from "./processLoad.js"
import si from "systeminformation"

global.yenai_debug ||= {}
global.yenai_debug.si = si

export async function getData(e) {
  e.isPro = e.msg.includes("pro")
  e.isDebug = e.msg.includes("debug")
  // 配置
  const { closedChart, systemResources } = Config.state
  const MAP_FUN = {
    "CPU": getCPU,
    "RAM": getRAM,
    "SWAP": getSWAP,
    "GPU": getGPU,
    "Node": getNode
  }
  const debugFun = new BuildDebug(e)

  const visualDataPromise = Promise.all(
    debugFun.adds(systemResources.map(i => MAP_FUN[i]()), systemResources)
  )
  const debugTaskList = debugFun.adds([
    getFastFetch(e),
    getFsSize(),
    getNetworkTestList(e),
    getBotState(e),
    getStyle(),
    getRedisInfo(e.isPro),
    getProcessLoad(e)
  ], [ "FastFetch", "FsSize", "NetworkTest", "BotState", "Style", "Redis", "processLoad" ])

  const promiseTaskList = [
    visualDataPromise,
    ...debugTaskList
  ]

  const [
    visualData,
    FastFetch,
    HardDisk,
    psTest,
    BotStatusList,
    style,
    redis,
    processLoad
  ] = await debugFun.add(Promise.all(promiseTaskList), "all")

  e.isDebug && debugFun.send()

  const chartData = JSON.stringify(
    common.checkIfEmpty(Monitor.chartData, [ "echarts_theme", "cpu", "ram" ])
      ? ""
      : Monitor.chartData
  )

  return {
    BotStatusList,
    redis,
    chartData: closedChart ? false : chartData,
    visualData: _.compact(visualData),
    otherInfo: getOtherInfo(e),
    psTest: _.isEmpty(psTest) ? undefined : psTest,
    fsStats: getDiskSpeed(),
    copyright: await getCopyright(),
    network: getNetwork(),
    Config: JSON.stringify(Config.state),
    rawConfig: Config.state,
    FastFetch,
    HardDisk,
    style,
    processLoad,
    time: moment().format("YYYY-MM-DD HH:mm:ss"),
    isPro: e.isPro
  }
}

export async function getMonitorData() {
  return {
    chartData: JSON.stringify(Monitor.chartData),
    ...await getStyle()
  }
}
