import { Circle, getFileSize, si } from "./utils.js"

export default async function getSwapInfo() {
  const swapData = await si.get({
    mem: "swaptotal,swapused,swapfree"
  })
  const { mem: { swaptotal, swapused } } = swapData

  const swapUsagePercentage = (swapused / swaptotal) * 100
  const formatSwaptotal = getFileSize(swaptotal)
  const formatSwapused = getFileSize(swapused)

  return {
    ...Circle(swapUsagePercentage / 100),
    inner: `${Math.round(swapUsagePercentage)}%`,
    title: "SWAP",
    info: [ `${formatSwapused} / ${formatSwaptotal}` ]
  }
}
