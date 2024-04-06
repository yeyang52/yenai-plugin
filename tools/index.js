import cronValidate from "./cronValidate.js"
import formatDuration from "./formatDuration.js"
import sagiri from "./sagiri.js"
import translateChinaNum from "./translateChinaNum.js"
import uploadRecord from "./uploadRecord.js"
import child_process from "child_process"

/**
 * 延时函数
 * @param {*} ms 时间(毫秒)
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Promise执行exec
 * @param {string} cmd
 * @returns {*}
 */
async function execSync(cmd) {
  return new Promise((resolve, reject) => {
    child_process.exec(cmd, (error, stdout, stderr) => {
      resolve({ error, stdout, stderr })
    })
  })
}

export { cronValidate, formatDuration, sagiri, translateChinaNum, uploadRecord, sleep, execSync }
