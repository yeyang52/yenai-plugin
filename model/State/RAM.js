import { getFileSize, Circle } from './utils.js'
import os from 'os'

/** 获取当前内存占用 */
export default function getMemUsage () {
  // 内存使用率
  let MemUsage = (1 - os.freemem() / os.totalmem()).toFixed(2)
  // 空闲内存
  let freemem = getFileSize(os.freemem())
  // 总共内存
  let totalmem = getFileSize(os.totalmem())
  // 使用内存
  let Usingmemory = getFileSize((os.totalmem() - os.freemem()))

  return {
    ...Circle(MemUsage),
    inner: Math.round(MemUsage * 100) + '%',
    title: 'RAM',
    info: [
        `总共 ${totalmem}`,
        `已用 ${Usingmemory}`,
        `空闲 ${freemem}`
    ]
  }
}
