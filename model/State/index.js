import _ from "lodash"
import moment from "moment"
import { Config, Data } from "../../components/index.js"
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
  /** bot列表 */

  const visualDataPromise = Promise.all([
    getCPU(),
    getRAM(),
    getSWAP(),
    getGPU(),
    getNode()
  ])
  const promiseTaskList = [
    visualDataPromise,
    getFastFetch(e),
    getFsSize(),
    getNetworkTestList(e),
    getBotState(e),
    getStyle()
  ]

  const [
    visualData,
    FastFetch,
    HardDisk, psTest, BotStatusList, style
  ] = await Promise.all(promiseTaskList)

  const chartData = JSON.stringify(
    common.checkIfEmpty(Monitor.chartData, [ "echarts_theme", "cpu", "ram" ])
      ? ""
      : Monitor.chartData
  )

  // 配置
  const { closedChart } = Config.state

  return {
    BotStatusList,
    chartData: closedChart ? false : chartData,
    visualData: _.compact(visualData),
    otherInfo: getOtherInfo(e),
    psTest: _.isEmpty(psTest) ? undefined : psTest,
    fsStats: getDiskSpeed(),
    copyright: getCopyright(),
    network: getNetwork(),
    Config: JSON.stringify(Config.state),
    FastFetch,
    HardDisk,
    style,
    time: moment().format("YYYY-MM-DD HH:mm:ss"),
    isPro: e.isPro,
    chartCfg: JSON.stringify(getChartCfg())
  }
}

export async function getMonitorData() {
  return {
    chartData: JSON.stringify(Monitor.chartData),
    backdrop: await getBackground(),
    chartCfg: JSON.stringify(getChartCfg())
  }
}

function getChartCfg() {
  const echarts_theme = Data.readJSON("resources/state/theme_westeros.json")

  return {
    echarts_theme
  }
}
