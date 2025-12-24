import { getFileSize } from "../utils.js"
import si from "systeminformation"
export default async function getSwapInfo() {
  const swapData = await si.get({
    mem: "swaptotal,swapused,swapfree"
  })
  const { mem: { swaptotal, swapused, swapfree } } = swapData

  const swapUsagePercentage = (swapused / swaptotal) * 100
  const formatSwaptotal = getFileSize(swaptotal)
  const formatSwapused = getFileSize(swapused)
  const formatSwapfree = getFileSize(swapfree)

  return {
    percentage: swapUsagePercentage / 100,
    inner: `${Math.round(swapUsagePercentage)}%`,
    title: "SWAP",
    detailed: `Available ${formatSwapfree} `,
    info: [ `${formatSwapused} / ${formatSwaptotal}` ]
  }
}
