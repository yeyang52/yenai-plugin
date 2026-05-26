import { getFileSize } from "./utils.js"
import si from "systeminformation"
import { Log_Prefix } from "#yenai.components"

global.yenai_debug ||= {}
global.yenai_debug.si = si

export class BuildDebug {
  constructor(e) {
    this.e = e
    this.isDebug = e.isDebug
    this.debugMessages = []
    this.startUsage = e.isDebug && {
      mem: process.memoryUsage(),
      cpu: process.cpuUsage()
    }
  }

  adds(promises, nameMap) {
    return promises.map((v, i) => this._timePromiseExecution(v, nameMap[i]))
  }

  addIn(obj) {
    const res = []
    for (const key in obj) {
      res.push(this._timePromiseExecution(obj[key], key))
    }
    return res
  }

  add(promises, name) {
    return this._timePromiseExecution(promises, name)
  }

  addMsg(message) {
    return this.debugMessages.push(message)
  }

  send() {
    const endUsage = {
      mem: process.memoryUsage(),
      cpu: process.cpuUsage()
    }
    const msg = [
      "-----------椰奶状态debug------------",
      "------------模块执行时间------------",
      ...this.debugMessages,
      "-----------内存CPU使用情况----------",
      `开始 CPU (user): ${getFileSize(this.startUsage.cpu.user)}`,
      `结束 CPU (user): ${getFileSize(endUsage.cpu.user)}`,
      `CPU 增量: ${getFileSize(endUsage.cpu.user - this.startUsage.cpu.user)}`,
      `开始 CPU (system): ${getFileSize(this.startUsage.cpu.system)}`,
      `结束 CPU (system): ${getFileSize(endUsage.cpu.system)}`,
      `CPU 增量: ${getFileSize(endUsage.cpu.system - this.startUsage.cpu.system)}`,
      `开始内存 (RSS): ${getFileSize(this.startUsage.mem.rss)}`,
      `结束内存 (RSS): ${getFileSize(endUsage.mem.rss)}`,
      `内存增量: ${getFileSize(endUsage.mem.rss - this.startUsage.mem.rss)}`,
      "---------------END---------------"
    ]
    this.e.reply(msg.join("\n"))
  }

  _timePromiseExecution(promiseFn, name) {
    const startTime = Date.now()
    return promiseFn.then((result) => {
      const endTime = Date.now()
      const duration = endTime - startTime
      const ter = logger.green(duration + " ms")
      logger.debug(`${Log_Prefix}[State] 获取 ${logger.magenta(name)} 用时: ${ter}`)
      this.debugMessages.push(`${name}: ${duration} ms`)
      return result
    })
  }
}
