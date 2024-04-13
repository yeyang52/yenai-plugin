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

export async function getData(e) {
  // 可视化数据
  const visualData = _.compact(await Promise.all([
    getCPU(),
    getRAM(),
    getGPU(),
    getNode(),
    getSWAP()
  ]))

  const promiseTaskList = [
    getFastFetch(e),
    getFsSize(),
    getNetworkTestList()
  ]

  const [ FastFetch, HardDisk, psTest ] = await Promise.all(promiseTaskList)
  /** bot列表 */
  const BotList = _getBotList(e)
  const isBotIndex = /pro/.test(e.msg) && BotList.length > 1
  const chartData = JSON.stringify(common.checkIfEmpty(Monitor.chartData, [ "echarts_theme", "cpu", "ram" ]) ? undefined : Monitor.chartData)
  // 配置
  const { closedChart } = Config.state
  return {
    BotStatusList: await getBotState(BotList),
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
    isBotIndex
  }
}

function _getBotList(e) {
  /** bot列表 */
  let BotList = [ e.self_id ]

  if (e.msg.includes("pro")) {
    if (Array.isArray(Bot?.uin)) {
      BotList = Bot.uin
    } else if (Bot?.adapter && Bot.adapter.includes(e.self_id)) {
      BotList = Bot.adapter
    }
  }
  return BotList
}
