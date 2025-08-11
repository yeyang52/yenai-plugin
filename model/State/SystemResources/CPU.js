import si from "systeminformation"

let cpu = null;
(async() => {
  cpu = await si.cpu()
})()

export default async function getCpuInfo() {
  let { currentLoad: { currentLoad } } = await si.get({
    currentLoad: "currentLoad"
  })
  let { manufacturer, speed, cores, brand } = cpu ?? {}
  if (currentLoad == null || currentLoad == undefined) return false
  manufacturer = manufacturer?.split(" ")?.[0] ?? "unknown"
  return {
    percentage: currentLoad / 100,
    inner: Math.round(currentLoad) + "%",
    title: "CPU",
    detailed: brand || false,
    info: [ `${manufacturer} ${cores}核 ${speed ? `${speed}GHz` : ""}` ]

  }
}
