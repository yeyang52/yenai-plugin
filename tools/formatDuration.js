/**
 * 格式化持续时间。
 * @param {number} time - 要格式化的时间（以秒为单位）。
 * @param {'default' | string | Function} format - 指定的格式，可以是字符串或函数。
 *     - 如果为字符串，可以包含占位符（例如"dd"表示天数，"hh"表示小时，"mm"表示分钟，"ss"表示秒），这些占位符将被实际的时间值替换。
 *     - 如果为函数，可以自定义处理时间对象并返回格式化结果。
 * @param {boolean} [repair] - 修复小时、分钟和秒的显示格式的可选参数。如果设置为true，并且小时、分钟或秒小于10，则在值前面添加零。
 * @returns {string | object} - 格式化后的持续时间。
 *     - 如果format为"default"，返回一个字符串，表示格式化后的持续时间。字符串包含天数、小时、分钟和秒的信息，根据时间值的大小，只包含大于零的部分。
 *     - 如果format为字符串，根据指定的格式进行替换后返回格式化后的字符串。
 *     - 如果format为函数，将时间对象作为参数传递给该函数，并返回函数处理后的结果。
 *     - 如果format既不是"default"、字符串，也不是函数，则返回包含天、小时、分钟和秒的时间对象。
 * @example
 * // 使用默认格式
 * const result = formatDuration(3665, 'default');
 * // 输出: "1小时1分5秒"
 * @example
 * // 使用自定义格式
 * const result = formatDuration(3665, 'hh:mm:ss');
 * // 输出: "01:01:05"
 * @example
 * // 使用自定义处理函数
 * const customFormat = (time) => `${time.hour}h ${time.minute}m ${time.second}s`;
 * const result = formatDuration(3665, customFormat);
 * // 输出: "1h 1m 5s"
 */
export default function formatDuration(time, format, repair = true) {
  const timeObj = computeTimeObject(time, repair)
  if (typeof format === "function") {
    return format(timeObj)
  }

  if (format === "default") {
    return formatDefault(timeObj)
  }

  if (typeof format === "string") {
    return formatTemplate(format, timeObj)
  }

  return timeObj
}
// 默认格式化逻辑拆分到单独的函数，提高代码可维护性
function formatDefault(timeObj) {
  const { day, hour, minute, second } = timeObj
  let result = ""

  if (day > 0) {
    result += `${day}天`
  }
  if (hour > 0) {
    result += `${hour}小时`
  }
  if (minute > 0) {
    result += `${minute}分`
  }
  if (second > 0) {
    result += `${second}秒`
  }

  return result
}

// 字符串模板格式化逻辑拆分到单独的函数
function formatTemplate(format, timeObj) {
  const replaceRegexes = [
    { pattern: /dd/g, value: timeObj.day },
    { pattern: /hh/g, value: timeObj.hour },
    { pattern: /mm/g, value: timeObj.minute },
    { pattern: /ss/g, value: timeObj.second }
  ]

  // 优化字符串替换逻辑
  for (const { pattern, value } of replaceRegexes) {
    format = format.replace(pattern, value)
  }

  return format
}

/**
 * 计算并返回表示时间的对象。
 * @param {number} time - 要计算的时间（以秒为单位）。
 * @param {boolean} [repair] - 修复小时、分钟和秒的显示格式的可选参数。如果设置为true，并且小时、分钟或秒小于10，则在值前面添加零。
 * @returns {{day: string, hour: string, minute: string, second: string}} - 包含天、小时、分钟和秒的时间对象。
 */
function computeTimeObject(time, repair = true) {
  const second = parseInt(time % 60)
  const minute = parseInt((time / 60) % 60)
  const hour = parseInt((time / (60 * 60)) % 24)
  const day = parseInt(time / (24 * 60 * 60))

  return {
    day,
    hour: repair && hour < 10 ? `0${hour}` : hour,
    minute: repair && minute < 10 ? `0${minute}` : minute,
    second: repair && second < 10 ? `0${second}` : second
  }
}
