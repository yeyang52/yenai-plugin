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
  const { systemResources } = Config.state
  const systemResourcesList = systemResources.map(i => SYSTEM_RESOURCE_MAP[i]())
  const visualDataPromise = Promise.all(
    e.debugFun.adds(systemResourcesList, systemResources)
  ).then(r => {
    return r.map(i => {
      if (i.percentage !== undefined) {
        i.percentage = Circle(i.percentage)
      }
      if (i.buffcache?.percentage !== undefined) {
        i.buffcache.percentage = Circle(i.buffcache.percentage)
      }
      return i
    })
  })

  return visualDataPromise
}

function Circle(res) {
  let perimeter = 3.14 * 80
  let per = perimeter - perimeter * res
  let color = "--low-color"
  if (res >= 0.9) {
    color = "--high-color"
  } else if (res >= 0.8) {
    color = "--medium-color"
  }
  return {
    per,
    color: `var(${color})`
  }
}
