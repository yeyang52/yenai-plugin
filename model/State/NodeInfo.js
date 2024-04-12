import { getFileSize, Circle } from "./utils.js"
import os from "os"
import { Config } from "../../components/index.js"

/** 获取nodejs内存情况 */
export default function getNodeInfo() {
  if (Config.state.closedNodeInfo) return false
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
        `堆 ${heapTotal}`,
        `栈 ${heapUsed}`
    ]
  }
}
