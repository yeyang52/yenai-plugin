import { Circle, getFileSize, si } from "./utils.js"

/** 获取当前内存占用 */
export default async function getMemUsage() {
  const { mem: { total, used, active, buffcache } } = await si.get({
    mem: "total,used,active,buffcache"
  })
  const usedPercentage = (used / total).toFixed(2)
  const activePercentage = (active / total).toFixed(2)
  const buffcachePercentage = (buffcache / total).toFixed(2)

  const buffcacheMem = getFileSize(buffcache)
  const totalMem = getFileSize(total)
  const activeMem = getFileSize(active)

  const isBuff = buffcache && buffcache != 0
  const buffcacheInner = isBuff ? `/${Math.round(buffcachePercentage * 100)}` : ""

  return {
    ...Circle(activePercentage),
    inner: `${Math.round(activePercentage * 100)}${buffcacheInner}%`,
    title: "RAM",
    info: [
        `总共 ${totalMem}`,
        `主动使用 ${activeMem}`,
        `缓冲区/缓存 ${buffcacheMem}`
    ],
    buffcache: {
      ...Circle(usedPercentage),
      color: "#969696",
      isBuff
    }
  }
}
