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
import { BuildDebug } from "./Debug.js"
import getProcessLoad from "./ProcessLoad.js"
import getRedisInfo from "./Redis.js"
import getStyle from "./Style.js"

const SYSTEM_RESOURCE_MAP = {
  "CPU": getCPU,
  "RAM": getRAM,
  "SWAP": getSWAP,
  "GPU": getGPU,
  "Node": getNode
}
export async function getData(e) {
  e.isPro = e.msg.includes("pro")
  e.isDebug = e.msg.includes("debug")
  // 配置
  const { chartsCfg, systemResources } = Config.state

  const debugFun = new BuildDebug(e)
  const systemResourcesList = systemResources.map(i => SYSTEM_RESOURCE_MAP[i]())
  const visualDataPromise = Promise.all(
    debugFun.adds(systemResourcesList, systemResources)
  )
  const debugTasks = debugFun.addIn({
    "FastFetch": getFastFetch(e),
    "FsSize": getFsSize(),
    "NetworkTest": getNetworkTestList(e),
    "BotState": getBotState(e),
    "Style": getStyle(),
    "Redis": getRedisInfo(e.isPro),
    "ProcessLoad": getProcessLoad(e)
  })

  const promiseTaskList = [
    visualDataPromise,
    ...debugTasks
  ]

  const [
    visualData,
    FastFetch,
    HardDisk,
    psTest,
    BotStatusList,
    style,
    redisInfo,
    processLoad
  ] = await debugFun.add(Promise.all(promiseTaskList), "all")

  e.isDebug && debugFun.send()

  return {
    BotStatusList,
    redis: redisInfo,
    chartData: getChartData(e, chartsCfg.show),
    visualData: _.compact(visualData),
    otherInfo: getOtherInfo(e),
    disks: {
      disksIo: getDiskSpeed(),
      disksSize: HardDisk
    },
    network: {
      speed: getNetwork(),
      psTest: _.isEmpty(psTest) ? undefined : psTest
    },
    FastFetch,
    style,
    processLoad,
    // 版权
    copyright: await getCopyright(),
    // 配置
    Config: JSON.stringify(Config.state),
    rawConfig: Config.state,
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

function getChartData(e, cfg) {
  if (cfg !== true && !(cfg === "pro" && e.isPro)) return false
  let check = common.checkIfEmpty(Monitor.chartData.network)
  console.log(check, Monitor.chartData.network)
  return check ? false : JSON.stringify(Monitor.chartData)
}
