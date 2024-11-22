import { Circle, getFileSize } from "./utils.js"
import si from "systeminformation"

/** 获取当前内存占用 */
export default async function getMemUsage() {
  const { mem: { total, used, active, buffcache } } = await si.get({
    mem: "total,used,active,buffcache"
  })
  const usedPercentage = (used / total).toFixed(2)
  const activePercentage = (active / total).toFixed(2)
  // const buffcachePercentage = (buffcache / total).toFixed(2)

  const buffcacheMem = getFileSize(buffcache)
  const totalMem = getFileSize(total)
  const activeMem = getFileSize(active)

  const isBuff = buffcache && buffcache != 0
  // const buffcacheInner = isBuff ? `/${Math.round(buffcachePercentage * 100)}` : ""

  return {
    ...Circle(activePercentage),
    inner: `${Math.round(activePercentage * 100)}%`,
    title: "RAM",
    info: [
        `${activeMem} / ${totalMem}`,
        isBuff ? `缓冲区/缓存 ${buffcacheMem}` : ""
    ],
    buffcache: {
      ...Circle(usedPercentage),
      color: "#bcbbbbb0",
      isBuff
    }
  }
}
