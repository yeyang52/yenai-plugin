import _ from "lodash"
import si from "systeminformation"
import Monitor from "./Monitor.js"
import { getFileSize } from "./utils.js"
import { Config } from "../../components/index.js"
/**
 *  获取硬盘
 */
export async function getFsSize() {
  // 去重
  let fsSize = _.uniqWith(await si.fsSize(),
    (a, b) =>
      a.used === b.used && a.size === b.size && a.use === b.use && a.available === b.available
  )
  // macOS: 根目录"/"显示的是系统快照卷用量，真正的用户数据在 /System/Volumes/Data，
  // 将其用量合并到根目录上展示，避免根目录百分比失真
  mergeRootWithDataVolume(fsSize)
  fsSize = fsSize
    .filter(item => item.size && item.used && item.available && item.use)
    .filter(item => !isHiddenMount(item))
    // 为空返回false
  if (_.isEmpty(fsSize)) return false
  // 数值转换
  let n = 0
  let { style } = Config.state
  return fsSize.map(item => {
    if (item.mount == "/") item.mount += " (根目录)"
    let userColor = null
    if (style.progressBarColor.low instanceof Array && style.progressBarColor.low.length > 0) {
      userColor = style.progressBarColor.low[n % style.progressBarColor.low.length]
      n++
    }
    item.used = getFileSize(item.used)
    item.size = getFileSize(item.size)
    item.available = getFileSize(item.available)
    item.use = Math.round(item.use)
    item.color = setColor(item.use, userColor)
    item.per = Circle(item.use / 100)
    return item
  })
}
function setColor(use, userColor) {
  if (use >= 90) {
    return "var(--high-color)"
  } else if (use >= 70) {
    return "var(--medium-color)"
  }
  return userColor ?? "var(--low-color)"
}

/**
 * 获取磁盘读写速度
 * @returns {object | boolean} 返回一个对象，包含读速度（rx_sec）和写速度（wx_sec），如果无法获取则返回false。
 */
export function getDiskSpeed() {
  let data = Monitor.disksIO
  if (!data?.length) return false
  data.map(item => {
    item.rIO_sec = "<span>" + getFileSize(item.rIO_sec, { showByte: false }) + "</span>"
    item.wIO_sec = "<span>" + getFileSize(item.wIO_sec, { showByte: false }) + "</span>"
    item.tIO_sec = item.tIO_sec !== undefined ? "<span>" + getFileSize(item.tIO_sec, { showByte: false }) + "</span>" : false
    return item
  })

  return data
}
function Circle(res) {
  let perimeter = 3.14 * 54
  let per = perimeter - perimeter * res
  return per
}

/**
 * 判断是否为不需要展示的挂载
 * macOS 系统内部卷、隐藏挂载（如 Time Machine 的 .timemachine、NFS 备份快照等）
 */
function isHiddenMount(item) {
  const mount = item.mount || ""
  // macOS 系统内部卷
  if (mount.startsWith("/System/Volumes/")) return true
  // 隐藏目录挂载（如 /Volumes/.timemachine 下的 NAS/Time Machine 挂载）
  if (mount.split("/").some(seg => seg.startsWith("."))) return true
  // Time Machine 备份快照（NFS 挂载的 com.apple.TimeMachine.* 快照）
  if ((item.fs || "").startsWith("com.apple.TimeMachine.")) return true
  return false
}

/**
 * macOS 根目录 "/" 显示的是系统快照卷（sealed system volume）的用量，
 * 真正的用户数据在 /System/Volumes/Data，这里把它的数据合并到根目录上展示
 */
function mergeRootWithDataVolume(list) {
  const root = list.find(item => item.mount === "/")
  const data = list.find(item => item.mount === "/System/Volumes/Data")
  if (root && data) {
    root.fs = data.fs
    root.used = data.used
    root.size = data.size
    root.available = data.available
    root.use = data.use
  }
}
