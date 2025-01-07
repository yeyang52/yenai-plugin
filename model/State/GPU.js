import si from "systeminformation"
import { Circle } from "./utils.js"
import { Log_Prefix } from "#yenai.components"
let isGPU = false;

(async function initGetIsGPU() {
  const { controllers } = await si.graphics()
  // 初始化GPU获取
  if (controllers?.find(item =>
    item.memoryUsed && item.memoryFree && item.utilizationGpu)
  ) {
    isGPU = true
  }
})()

/** 获取GPU占用 */
export default async function getGPU() {
  if (!isGPU) return false
  try {
    const { controllers } = await si.graphics()
    let graphics = controllers?.find(item =>
      item.memoryUsed && item.memoryFree && item.utilizationGpu
    )
    if (!graphics) {
      logger.warn(`${Log_Prefix}[State]状态GPU数据异常：\n`, controllers)
      return false
    }
    let {
      vendor, temperatureGpu, utilizationGpu,
      memoryTotal, memoryUsed /* powerDraw */
    } = graphics
    temperatureGpu && (temperatureGpu = temperatureGpu + "℃")
    // powerDraw && (powerDraw = powerDraw + "W")
    return {
      ...Circle(utilizationGpu / 100),
      inner: Math.round(utilizationGpu) + "%",
      title: "GPU",
      info: [
        `${(memoryUsed / 1024).toFixed(2)} GB / ${(memoryTotal / 1024).toFixed(2)} GB`,
        `${vendor} ${temperatureGpu}`
      ]
    }
  } catch (e) {
    logger.warn(`${Log_Prefix}[State] 获取GPU失败`)
    return false
  }
}
