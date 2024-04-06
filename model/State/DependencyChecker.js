export let si = false
export let osInfo = null

export async function initDependence() {
  if (si) return si
  try {
    si = await import("systeminformation")
    osInfo = await si.osInfo()
    return si
  } catch (error) {
    if (error.stack?.includes("Cannot find package")) {
      logger.warn("--------椰奶依赖缺失--------")
      logger.warn(`yenai-plugin 缺少依赖将无法使用 ${logger.yellow("椰奶状态")}`)
      logger.warn(`如需使用请运行：${logger.red("pnpm add systeminformation -w")}`)
      logger.warn("---------------------------")
      logger.debug(decodeURI(error.stack))
    } else {
      logger.error(`椰奶载入依赖错误：${logger.red("systeminformation")}`)
      logger.error(decodeURI(error.stack))
    }
  }
}

await initDependence()
