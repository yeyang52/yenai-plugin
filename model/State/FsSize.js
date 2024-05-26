import _ from "lodash"
import { getFileSize, si } from "./utils.js"
import Monitor from "./Monitor.js"

/**
 *  获取硬盘
 * @returns {*}
 */
export async function getFsSize() {
  // 去重
  let HardDisk = _.uniqWith(await si.fsSize(),
    (a, b) =>
      a.used === b.used && a.size === b.size && a.use === b.use && a.available === b.available
  )
    .filter(item => item.size && item.used && item.available && item.use)
    // 为空返回false
  if (_.isEmpty(HardDisk)) return false
  // 数值转换
  return HardDisk.map(item => {
    item.used = getFileSize(item.used)
    item.size = getFileSize(item.size)
    item.use = Math.round(item.use)
    item.color = "var(--low-color)"
    if (item.use >= 90) {
      item.color = "var(--high-color)"
    } else if (item.use >= 70) {
      item.color = "var(--medium-color)"
    }
    return item
  })
}
/**
 * 获取磁盘读写速度
 * @returns {object | boolean} 返回一个对象，包含读速度（rx_sec）和写速度（wx_sec），如果无法获取则返回false。
 */
export function getDiskSpeed() {
  let fsStats = Monitor.fsStats
  if (!fsStats || fsStats.rx_sec == null || fsStats.wx_sec == null) {
    return false
  }
  return {
    rx_sec: getFileSize(fsStats.rx_sec, { showByte: false, showSuffix: false }),
    wx_sec: getFileSize(fsStats.wx_sec, { showByte: false, showSuffix: false })
  }
}
