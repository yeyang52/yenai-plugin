import si from "systeminformation"
import { Config } from "../../components/index.js"
import _ from "lodash"
import { getFileSize } from "./utils.js"

export default async function(e) {
  const { show, list, showPid, showMax, showCmd } = Config.state.processLoad
  if (!show || (show === "pro" && !e.isPro)) {
    return false
  }
  try {
    const ps = await si.processes()
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
      // eslint-disable-next-line no-eval
      const l = list.map(i => i.startsWith("$") ? eval(i.replace("$", "")) : i)
      const r = {}
      for (const i of ps.list) {
        if ((l.includes(i.name) || l.includes(i.command) || (process.platform === "win32" && l.includes(i.name.replace(/.exe$/, "")))) && !result.includes(i)) {
          const k = showCmd ? i.command : i.name
          if (k in r) {
            r[k].pid += `,${i.pid}`
            r[k].cpu += i.cpu
            r[k].memRss += i.memRss
          } else r[k] = i
        }
      }
      result.push("hr", ...Object.values(r))
    }

    return result.map(item => {
      if (item === "hr") return item
      const { name, command, pid, cpu, memRss } = item
      const displayName = `${showCmd ? command : name}${showPid ? ` (${pid})` : ""}`
      return {
        first: displayName,
        tail: `CPU ${cpu.toFixed(1)}% | MEM ${getFileSize(memRss * 1024)}`
      }
    })
  } catch (error) {
    logger.error(error)
    return false
  }
}
