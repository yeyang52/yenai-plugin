import { Circle } from "./utils.js"
import { si, initDependence } from "./DependencyChecker.js"

let isGPU = false;

(async function initGetIsGPU() {
  if (!await initDependence()) return
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
      logger.warn("[Yenai-plugin][state]状态GPU数据异常：\n", controllers)
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
          `${vendor} ${temperatureGpu}`,
          `总共 ${(memoryTotal / 1024).toFixed(2)}G`,
          `已用 ${(memoryUsed / 1024).toFixed(2)}G`
      ]
    }
  } catch (e) {
    logger.warn("[Yenai-Plugin][State] 获取GPU失败")
    return false
  }
}
