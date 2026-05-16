import getGPU from "./GPU.js"
import getSWAP from "./SWAP.js"
import getRAM from "./RAM.js"
import getCPU from "./CPU.js"
import getNode from "./Node.js"
import { Config } from "../../../components/index.js"
const SYSTEM_RESOURCE_MAP = {
  "CPU": getCPU,
  "RAM": getRAM,
  "SWAP": getSWAP,
  "GPU": getGPU,
  "Node": getNode
}

export default async function getSystemResources(e) {
  const { systemResources, style } = Config.state
  const systemResourcesList = systemResources.map(i => SYSTEM_RESOURCE_MAP[i]())
  const visualDataPromise = Promise.all(
    e.debugFun.adds(systemResourcesList, systemResources)
  ).then(r => {
    let n = 0
    return r.map(i => {
      if (i.percentage !== undefined) {
        let userColor = null
        if (style.progressBarColor.low instanceof Array && style.progressBarColor.low.length > 0) {
          userColor = style.progressBarColor.low[n % style.progressBarColor.low.length]
          n++
        }
        i.percentage = Circle(i.percentage, userColor)
      }
      return i
    })
  })

  return visualDataPromise
}

export function Circle(res, userColor) {
  let perimeter = 3.14 * 88
  let per = perimeter - perimeter * res
  let color = userColor ?? "var(--low-color)"
  if (res >= 0.9) {
    color = "var(--high-color)"
  } else if (res >= 0.8) {
    color = "var(--medium-color)"
  }
  return {
    per,
    color
  }
}
