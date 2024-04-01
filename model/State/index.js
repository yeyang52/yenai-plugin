import _ from 'lodash'
import common from '../../lib/common/common.js'
import getBotState from './BotState.js'
import getCPU from './CPU.js'
import { osInfo, si } from './DependencyChecker.js'
import getFastFetch from './FastFetch.js'
import getFsSize from './FsSize.js'
import getGPU from './GPU.js'
import Monitor from './Monitor.js'
import getNetworTestList from './NetworkLatency.js'
import getNodeInfo from './NodeInfo.js'
import getRAM from './RAM.js'
import getOtherInfo from './OtherInfo.js'

export { osInfo, si }

export async function getData (e) {
  // 可视化数据
  let visualData = _.compact(await Promise.all([
    // CPU板块
    getCPU(),
    // 内存板块
    getRAM(),
    // GPU板块
    getGPU(),
    // Node板块
    getNodeInfo()
  ]))
  let promiseTaskList = [
    getFastFetch(e),
    getFsSize()
  ]

  let NetworTestList = getNetworTestList()
  promiseTaskList.push(NetworTestList)

  let [FastFetch, HardDisk, psTest] = await Promise.all(promiseTaskList)
  /** bot列表 */
  let BotList = _getBotList(e)

  return {
    BotStatusList: await getBotState(BotList),
    chartData: JSON.stringify(common.checkIfEmpty(Monitor.chartData, ['echarts_theme', 'cpu', 'ram']) ? undefined : Monitor.chartData),
    visualData,
    otherInfo: getOtherInfo(),
    psTest: _.isEmpty(psTest) ? undefined : psTest,
    FastFetch,
    HardDisk,
    // 硬盘速率
    fsStats: Monitor.DiskSpeed
  }
}

function _getBotList (e) {
  /** bot列表 */
  let BotList = [e.self_id]

  if (e.msg.includes('pro')) {
    if (Array.isArray(Bot?.uin)) {
      BotList = Bot.uin
    } else if (Bot?.adapter && Bot.adapter.includes(e.self_id)) {
      BotList = Bot.adapter
    }
  }
  return BotList
}
