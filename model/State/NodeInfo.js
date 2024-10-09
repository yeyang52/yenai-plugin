import os from "os"
import { Circle, getFileSize } from "./utils.js"

/** 获取nodejs内存情况 */
export default async function getNodeInfo() {
  let memory = process.memoryUsage()
  // 总共
  let rss = getFileSize(memory.rss)
  // 堆
  let heapTotal = getFileSize(memory.heapTotal)
  // 栈
  let heapUsed = getFileSize(memory.heapUsed)
  // 占用率
  let occupy = (memory.rss / (os.totalmem() - os.freemem())).toFixed(2)
  return {
    ...Circle(occupy),
    inner: Math.round(occupy * 100) + "%",
    title: "Node",
    info: [
        `总 ${rss}`,
        `${heapTotal} | ${heapUsed}`
    ]
  }
}
