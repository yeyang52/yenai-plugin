import _ from "lodash"
import { Config } from "../../components/index.js"
import common from "../../lib/common/common.js"
import getBotState from "./BotState.js"
import getCPU from "./CPU.js"
import getFastFetch from "./FastFetch.js"
import getFsSize, { getDiskSpeed } from "./FsSize.js"
import getGPU from "./GPU.js"
import Monitor from "./Monitor.js"
import { getNetworkTestList, getNetwork } from "./Network.js"
import getNode from "./NodeInfo.js"
import getOtherInfo, { getCopyright } from "./OtherInfo.js"
import getRAM from "./RAM.js"
import getSWAP from "./SWAP.js"
import { getBackground } from "./style.js"
import moment from "moment"
export async function getData(e) {
  e.isPro = e.msg.includes("pro")
  /** bot列表 */
  const BotList = _getBotList(e)
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
    getBotState(e, BotList),
    getBackground()
  ]

  const [
    visualData,
    FastFetch,
    HardDisk, psTest, BotStatusList, backdrop
  ] = await Promise.all(promiseTaskList)

  const isBotIndex = /pro/.test(e.msg) && BotList.length > 1
  const chartData = JSON.stringify(
    common.checkIfEmpty(Monitor.chartData, [ "echarts_theme", "cpu", "ram" ])
      ? ""
      : Monitor.chartData
  )

  const time = moment().format("YYYY-MM-DD HH:mm:ss")

  // 配置
  const { closedChart } = Config.state
  const style = {
    backdrop
  }
  return {
    BotStatusList,
    chartData: closedChart ? false : chartData,
    visualData: _.compact(visualData),
    otherInfo: getOtherInfo(),
    psTest: _.isEmpty(psTest) ? undefined : psTest,
    fsStats: getDiskSpeed(),
    copyright: getCopyright(),
    network: getNetwork(),
    Config: JSON.stringify(Config.state),
    _Config: Config.state,
    FastFetch,
    HardDisk,
    isBotIndex,
    style,
    time,
    isPro: e.isPro
  }
}

function _getBotList(e) {
  /** bot列表 */
  let BotList = [ e.self_id ]

  if (e.isPro) {
    if (Array.isArray(Bot?.uin)) {
      BotList = Bot.uin
    } else if (Bot?.adapter && Bot.adapter.includes(e.self_id)) {
      BotList = Bot.adapter
    }
  }
  return BotList
}
