import { puppeteer } from "../../model/index.js"
import fs from "fs"
import _ from "lodash"
export const getStatus = function(rote, badge) {
  let _badge = ""
  if (badge) {
    _badge = `<span class="badge">${badge}</span>`
  }
  if (typeof rote === "number") {
    return `<div class="cfg-status">${rote}</div>`
  }
  if (rote) {
    return _badge + "<div class=\"cfg-status\" >已开启</div>"
  } else {
    return _badge + "<div class=\"cfg-status status-off\">已关闭</div>"
  }
}

/**
 * 检查一个数值是否满足给定的限制条件，并返回经过验证的数值。
 * @param {number} value - 要检查的数值。
 * @param {string} limit - 要检查的限制条件。
 *   限制条件可以是以下格式之一：
 *   - "X-Y" 形式的范围限制条件，其中 X 和 Y 是表示下限和上限的数字。
 *   - "<X" 或 ">X" 形式的比较限制条件，其中 X 是表示限制值的数字。
 * @returns {number} 经过验证的数值。如果给定的值超出了限制条件，则返回限制条件对应的最大值或最小值，否则返回原值。
 */
export function checkNumberValue(value, limit) {
  // 检查是否存在限制条件
  if (!limit) {
    return value
  }
  // 解析限制条件
  const [ symbol, limitValue ] = limit.match(/^([<>])?(.+)$/).slice(1)
  const parsedLimitValue = parseFloat(limitValue)

  // 检查比较限制条件
  if ((symbol === "<" && value > parsedLimitValue) || (symbol === ">" && value < parsedLimitValue)) {
    return parsedLimitValue
  }

  // 检查范围限制条件
  if (!isNaN(value)) {
    const [ lowerLimit, upperLimit ] = limit.split("-").map(parseFloat)
    const clampedValue = Math.min(Math.max(value, lowerLimit || -Infinity), upperLimit || Infinity)
    return clampedValue
  }

  // 如果不符合以上任何条件，则返回原值
  return parseFloat(value)
}

export async function sendImg(e, data) {
  return await puppeteer.render("admin/index", {
    ...data,
    bg: await rodom()
  }, {
    e,
    scale: 1.4
  })
}

const rodom = async function() {
  let image = fs.readdirSync("./plugins/yenai-plugin/resources/admin/imgs/bg")
  let listImg = []
  for (let val of image) {
    listImg.push(val)
  }
  let imgs = listImg.length == 1 ? listImg[0] : listImg[_.random(0, listImg.length - 1)]
  return imgs
}
