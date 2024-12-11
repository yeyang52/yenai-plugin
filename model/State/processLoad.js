import si from "systeminformation"
import { Config } from "../../components/index.js"
import _ from "lodash"

export default async function(e) {
  const { show, list, showPid, showMax } = Config.state.processLoad
  if (!show || (show === "pro" && !e.isPro)) {
    return false
  }
  try {
    let task = []
    if (showMax.show) {
      task.push(
        si.processes()
          .then(r => _.orderBy(r.list, showMax.order, "desc")
            .slice(0, showMax.showNum)
          )
      )
    }
    if (list && list.length != 0) {
      task.push(si.processLoad(list.join(",")))
    }
    if (showMax.show && (list && list.length != 0)) {
      task.splice(1, 0, "hr")
    }
    let result = await Promise.all(task)
    return _.flatten(result).map(item => {
      if (item === "hr") return item
      const { proc, name, pid, cpu, mem } = item
      const displayName = `${proc || name}${showPid ? ` (${pid})` : ""}`

      return {
        first: displayName,
        tail: `CPU ${cpu.toFixed(1)}% | MEM ${mem.toFixed(1)}%`
      }
    })
  } catch (error) {
    logger.error(error)
    return false
  }
}
