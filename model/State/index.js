import _ from "lodash"
import moment from "moment"
import { Config } from "../../components/index.js"
import common from "../../lib/common/common.js"
import getBotState from "./BotState.js"
import getFastFetch from "./FastFetch.js"
import { getDiskSpeed, getFsSize } from "./FsSize.js"
import Monitor from "./Monitor.js"
import { getNetwork, getNetworkTestList } from "./Network.js"
import getOtherInfo, { getCopyright } from "./OtherInfo.js"
import { BuildDebug } from "./Debug.js"
import getProcessLoad from "./ProcessLoad.js"
import getRedisInfo from "./Redis.js"
import getStyle from "./Style.js"
import getSystemResources from "./SystemResources/index.js"

export async function getData(e) {
  e.isPro = e.msg.includes("pro")
  e.isDebug = e.msg.includes("debug")
  const debugFun = new BuildDebug(e)
  e.debugFun = debugFun

  // 配置
  const { chartsCfg } = Config.state
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
    getCopyright(),
    getSystemResources(e),
    ...debugTasks
  ]

  const [
    copyright,
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
    // 数据
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
    processLoad,
    // 样式
    style,
    // 版权
    copyright,
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
  return check ? false : JSON.stringify(Monitor.chartData)
}
