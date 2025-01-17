import si from "systeminformation"

let cpu = null;
(async() => {
  cpu = await si.cpu()
})()
export default async function getCpuInfo() {
  let { currentLoad: { currentLoad }, fullLoad } = await si.get({
    currentLoad: "currentLoad",
    fullLoad: "*"
  })
  let { manufacturer, speed, cores } = cpu ?? {}
  if (currentLoad == null || currentLoad == undefined) return false
  fullLoad = Math.round(fullLoad)
  manufacturer = manufacturer?.split(" ")?.[0] ?? "unknown"
  return {
    percentage: currentLoad / 100,
    inner: Math.round(currentLoad) + "%",
    title: "CPU",
    info: [
        `${manufacturer} ${cores}核 ${speed}GHz`,
        `CPU满载率 ${fullLoad}%`
    ]

  }
}
