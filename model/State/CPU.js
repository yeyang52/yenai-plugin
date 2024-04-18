import os from "os"
import { si, osInfo, Circle } from "./utils.js"

/** 获取CPU占用 */
export default async function getCpuInfo() {
  let { currentLoad: { currentLoad }, cpuCurrentSpeed } = await si.get({
    currentLoad: "currentLoad",
    cpuCurrentSpeed: "max,avg"
  })
  if (currentLoad == null || currentLoad == undefined) return false
  // 核心
  const cores = os.cpus()
  // cpu制造者
  const cpuModel = cores[0]?.model.slice(0, cores[0]?.model.indexOf(" ")) || ""
  return {
    ...Circle(currentLoad / 100),
    inner: Math.round(currentLoad) + "%",
    title: "CPU",
    info: [
        `${cpuModel} ${cores.length}核 ${osInfo?.arch}`,
        `平均${cpuCurrentSpeed.avg}GHz`,
        `最大${cpuCurrentSpeed.max}GHz`
    ]

  }
}
