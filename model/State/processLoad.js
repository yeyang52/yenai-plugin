import si from "systeminformation"
import { Config } from "../../components/index.js"

export default async function(e) {
  const { show, list, showPid } = Config.state.processLoad
  if (!list && !list.length == 0) return false
  if (!show) {
    return false
  }
  if (show === "pro" && !e.isPro) {
    return false
  }
  try {
    let data = await si.processLoad(list.join(","))
    return data.map(item => {
      let name = item.proc
      if (showPid) {
        name += `(${item.pid})`
      }
      item.cpu = item.cpu.toFixed(1)
      item.mem = item.mem.toFixed(1)
      return {
        first: name,
        tail: `CPU ${item.cpu}% | MEM ${item.mem}%`
      }
    })
  } catch (error) {
    logger.error(error)
    return false
  }
}
