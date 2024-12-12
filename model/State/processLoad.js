import si from "systeminformation"
import { Config } from "../../components/index.js"
import _ from "lodash"
import { getFileSize } from "./utils.js"

export default async function(e) {
  const { show, list, showPid, showMax } = Config.state.processLoad
  if (!show || (show === "pro" && !e.isPro)) {
    return false
  }
  try {
    let task = []
    if (showMax.show) {
      const orderFun = (type) => {
        const MapFun = {
          cpu(list, slices) {
            return _.orderBy(list, "cpu", "desc").slice(0, slices)
          },
          mem(list, slices) {
            return _.orderBy(list, "mem", "desc").slice(0, slices)
          },
          cpu_mem(list, slices) {
            const cpuOrder = _.orderBy(list, "cpu", "desc")
            const memOrder = _.orderBy(list, "mem", "desc")

            const cpuNum = Math.ceil(slices / 2)
            const memNum = slices - cpuNum

            return [
              ...cpuOrder.slice(0, cpuNum),
              "hr",
              ...memOrder.slice(0, memNum)
            ]
          }
        }
        return MapFun[type] ?? MapFun.mem
      }
      task.push(
        si.processes()
          .then(r => orderFun(showMax.order)(r.list, showMax.showNum)
          )
      )
    }
    if (list?.length) {
      task.push(si.processLoad(list.join(",")))
    }
    if (showMax.show && list?.length) {
      task.splice(1, 0, "hr")
    }
    let result = await Promise.all(task)

    return _.flatten(result).map(item => {
      if (item === "hr") return item
      const { proc, name, pid, cpu, memRss, mem } = item
      const displayName = `${proc || name}${showPid ? ` (${pid})` : ""}`
      const MEM = memRss === undefined ? mem.toFixed(1) + "%" : getFileSize(memRss)
      return {
        first: displayName,
        tail: `CPU ${cpu.toFixed(1)}% | MEM ${MEM}`
      }
    })
  } catch (error) {
    logger.error(error)
    return false
  }
}
