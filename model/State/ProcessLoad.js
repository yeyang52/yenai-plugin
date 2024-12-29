import _ from "lodash"
import si from "systeminformation"
import { Config } from "../../components/index.js"
import { getFileSize } from "./utils.js"

export default async function(e) {
  const { show, list, showMax, showCmd, filterList } = Config.state.processLoad
  if (!show || (show === "pro" && !e.isPro)) {
    return false
  }
  try {
    const ps = await si.processes().then(i => {
      i.list = i.list.filter(i => !filterList.includes(i.name))
      return i
    })

    const result = []
    if (showMax.show) {
      switch (showMax.order) {
        case "cpu":
          result.push(..._.orderBy(ps.list, "cpu", "desc").slice(0, showMax.showNum))
          break
        case "mem":
          result.push(..._.orderBy(ps.list, "mem", "desc").slice(0, showMax.showNum))
          break
        case "cpu_mem": {
          const cpuOrder = _.orderBy(ps.list, "cpu", "desc")
          const memOrder = _.orderBy(ps.list, "mem", "desc")

          const cpuNum = Math.ceil(showMax.showNum / 2)
          const memNum = showMax.showNum - cpuNum

          result.push(
            ...cpuOrder.slice(0, cpuNum),
            "hr",
            ...memOrder.slice(0, memNum)
          )
          break
        }
      }
    }

    if (list?.length) {
      const l = list.map(i => i.startsWith("$") ? globalThis.eval(i.replace("$", "")) : i)
      const r = {}
      for (const i of ps.list) {
        const { name, command } = i
        const nameWithoutExe = process.platform === "win32" && l.includes(name.replace(/.exe$/, ""))
        if (l.includes(name) || l.includes(command) || nameWithoutExe) {
          if (!result.includes(i)) {
            const k = showCmd ? i.command : i.name
            if (k in r) {
              r[k].pid += `,${i.pid}`
              r[k].cpu += i.cpu
              r[k].memRss += i.memRss
              r[k].childNums++
            } else {
              r[k] = i
              r[k].childNums = 0
            }
          }
        }
      }
      result.push("hr", ...Object.values(r))
    }
    const processChild = getProcessChild(ps.list, result.map(i => i.pid))
    ps.list = result.map(item => {
      if (item === "hr") return item
      const { name, command, pid, cpu, memRss, childNums } = item
      const childNum = childNums ?? processChild[pid]?.length
      const child = childNum > 0 ? `(${childNum})` : ""
      const handleName = (showCmd ? command : name) + child
      return {
        name: handleName,
        pid,
        cpu: cpu.toFixed(1) + "%",
        mem: getFileSize(memRss * 1024)
      }
    })
    return ps
  } catch (error) {
    logger.error(error)
    return false
  }
}
function getProcessChild(list, pids) {
  const processMap = {}
  pids = pids.map(i => +i ?? i)
  list.forEach(process => {
    process.parentPid = +process.parentPid ?? process.parentPid
    if (pids.includes(process.parentPid)) {
      if (processMap[process.parentPid]) {
        processMap[process.parentPid].push(process)
      } else {
        processMap[process.parentPid] = [ process ]
      }
    }
  })

  return processMap
}
