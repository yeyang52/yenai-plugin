import _ from "lodash"

/**
 * 向数组中添加数据，如果数组长度超过允许的最大值，则删除最早添加的数据
 * @param {Array} arr - 要添加数据的数组
 * @param {*} data - 要添加的新数据
 * @param {number} [maxLen] - 数组允许的最大长度，默认值为60
 * @returns {void}
 */
export function addData (arr, data, maxLen = 60) {
  if (data === null || data === undefined) return
  // 如果数组长度超过允许的最大值，删除第一个元素
  if (arr.length >= maxLen) {
    _.pullAt(arr, 0)
  }
  // 添加新数据
  arr.push(data)
}

/**
 * 将文件大小从字节转化为可读性更好的格式，例如B、KB、MB、GB、TB。
 * @param {number} size - 带转化的字节数。
 * @param {boolean} [isByte] - 如果为 true，则最终的文件大小显示保留 B 的后缀.
 * @param {boolean} [isSuffix] - 如果为 true，则在所得到的大小后面加上 kb、mb、gb、tb 等后缀.
 * @returns {string} 文件大小格式转换后的字符串.
 */
export function getFileSize (size, isByte = true, isSuffix = true) { // 把字节转换成正常文件大小
  if (size == null || size == undefined) return 0
  let num = 1024.00 // byte
  if (isByte && size < num) {
    return size.toFixed(2) + "B"
  }
  if (size < Math.pow(num, 2)) {
    return (size / num).toFixed(2) + `K${isSuffix ? "b" : ""}`
  } // kb
  if (size < Math.pow(num, 3)) {
    return (size / Math.pow(num, 2)).toFixed(2) + `M${isSuffix ? "b" : ""}`
  } // M
  if (size < Math.pow(num, 4)) {
    return (size / Math.pow(num, 3)).toFixed(2) + "G"
  } // G
  return (size / Math.pow(num, 4)).toFixed(2) + "T" // T
}

/**
 *  圆形进度条渲染
 * @param {number} res 百分比小数
 * @returns {*} css样式
 */
export function Circle (res) {
  let perimeter = 3.14 * 77
  let per = perimeter - (perimeter * res * 100) / 100
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
