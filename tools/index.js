import cronValidate from "./cronValidate.js"
import formatDuration from "./formatDuration.js"
import sagiri from "./sagiri.js"
import translateChinaNum from "./translateChinaNum.js"
import uploadRecord from "./uploadRecord.js"

/**
 * 延时函数
 * @param {*} ms 时间(毫秒)
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export { cronValidate, formatDuration, sagiri, translateChinaNum, uploadRecord, sleep }
