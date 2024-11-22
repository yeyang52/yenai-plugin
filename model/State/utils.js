/**
 * 将字节大小转换成易读的文件大小格式
 * @param {number} size - 要转换的字节大小
 * @param {object} options - 转换选项
 * @param {number} options.decimalPlaces - 小数点保留位数，默认为2
 * @param {boolean} options.showByte - 是否在大小小于1KB时显示字节单位B，默认为true
 * @param {boolean} options.showSuffix - 是否在单位后面显示缩写，默认为true
 * @returns {string} 转换后的文件大小字符串
 */
export function getFileSize(size, { decimalPlaces = 2, showByte = true, showSuffix = true } = {}) {
  // 检查 size 是否为 null 或 undefined
  if (size === null || size === undefined) return 0 + "B"

  // 检查 decimalPlaces 是否为整数
  if (typeof decimalPlaces !== "number" || !Number.isInteger(decimalPlaces)) {
    throw new Error("decimalPlaces 必须是一个整数")
  }

  const units = [ "B", "K", "M", "G", "T" ]
  const powers = [ 0, 1, 2, 3, 4 ]
  const num = 1024.00 // byte

  // 提前计算 powers of 1024
  const precalculated = powers.map(power => Math.pow(num, power))

  let unitIndex = 0
  while (size >= precalculated[unitIndex + 1] && unitIndex < precalculated.length - 1) {
    unitIndex++
  }

  // 使用一个函数来构建返回的字符串
  const buildSizeString = (value, unit, _showSuffix = showSuffix) => {
    const suffix = ` ${unit}${_showSuffix ? "B" : ""}`
    return value.toFixed(decimalPlaces) + suffix
  }

  if (showByte && size < num) {
    return buildSizeString(size, "B", false)
  }

  return buildSizeString(size / precalculated[unitIndex], units[unitIndex])
}

/**
 *  圆形进度条渲染
 * @param {number} res 百分比小数
 * @returns {{per:number,color:string}} per - stroke-dashoffset属性 color - 进度条颜色
 */
export function Circle(res) {
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

export async function createAbortCont(timeoutMs) {
  let AbortController

  try {
    AbortController = globalThis.AbortController || (await import("abort-controller")).AbortController
  } catch (error) {
    logger.error("无法加载AbortController:", error)
    throw new Error("网络请求控制器加载失败")
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    controller.abort()
  }, timeoutMs)

  // 可选：返回一个清理函数，以便在不需要超时时清除定时器
  return {
    controller,
    clearTimeout: () => {
      clearTimeout(timeoutId)
    }
  }
}
