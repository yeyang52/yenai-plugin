import { Circle } from "./utils.js"
import si from "systeminformation"
/** 获取CPU占用 */
export default async function getCpuInfo() {
  let { currentLoad: { currentLoad }, cpu, fullLoad } = await si.get({
    currentLoad: "currentLoad",
    cpu: "manufacturer,speed,cores",
    fullLoad: "*"
  })
  let { manufacturer, speed, cores } = cpu
  if (currentLoad == null || currentLoad == undefined) return false
  fullLoad = Math.round(fullLoad)
  manufacturer = manufacturer?.split(" ")?.[0] ?? "unknown"
  return {
    ...Circle(currentLoad / 100),
    inner: Math.round(currentLoad) + "%",
    title: "CPU",
    info: [
        `${manufacturer} ${cores}核 ${speed}GHz`,
        `CPU满载率 ${fullLoad}%`
    ]

  }
}
