import { getFileSize, Circle } from "./utils.js"
import os from "os"

/** 获取当前内存占用 */
export default function getMemUsage() {
  const freeMemory = os.freemem()
  const totalMemory = os.totalmem()

  const memoryUsagePercentage = (1 - freeMemory / totalMemory).toFixed(2)
  const freeMem = getFileSize(freeMemory)
  const totalMem = getFileSize(totalMemory)
  const usingMemory = getFileSize(totalMemory - freeMemory)

  return {
    ...Circle(memoryUsagePercentage),
    inner: `${Math.round(memoryUsagePercentage * 100)}%`,
    title: "RAM",
    info: [
        `总共 ${totalMem}`,
        `已用 ${usingMemory}`,
        `空闲 ${freeMem}`
    ]
  }
}
