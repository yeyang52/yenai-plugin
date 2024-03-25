import _ from 'lodash'
import { getFileSize } from './utils.js'
import { si } from './index.js'

/**
 *  获取硬盘
 * @returns {*}
 */
export default async function getFsSize () {
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
    item.color = 'var(--low-color)'
    if (item.use >= 90) {
      item.color = 'var(--high-color)'
    } else if (item.use >= 70) {
      item.color = 'var(--medium-color)'
    }
    return item
  })
}
