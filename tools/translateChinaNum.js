/**
 * 使用JS将数字从汉字形式转化为阿拉伯形式
 * @param {string} s_123
 * @returns {number}
 */
export default function translateChinaNum(s_123) {
  if (!s_123 && s_123 != 0) return s_123
  // 如果是纯数字直接返回
  if (/^\d+$/.test(s_123)) return Number(s_123)
  // 字典
  let map = new Map()
  map.set("一", 1)
  map.set("壹", 1) // 特殊
  map.set("二", 2)
  map.set("两", 2) // 特殊
  map.set("三", 3)
  map.set("四", 4)
  map.set("五", 5)
  map.set("六", 6)
  map.set("七", 7)
  map.set("八", 8)
  map.set("九", 9)
  // 按照亿、万为分割将字符串划分为三部分
  let split = ""
  split = s_123.split("亿")
  let s_1_23 = split.length > 1 ? split : [ "", s_123 ]
  let s_23 = s_1_23[1]
  let s_1 = s_1_23[0]
  split = s_23.split("万")
  let s_2_3 = split.length > 1 ? split : [ "", s_23 ]
  let s_2 = s_2_3[0]
  let s_3 = s_2_3[1]
  let arr = [ s_1, s_2, s_3 ]

  // ------------- 对各个部分处理 -------------
  arr = arr.map(item => {
    let result = ""
    result = item.replace("零", "")
    // [ "一百三十二", "四千五百", "三千二百一十三" ] ==>
    let reg = new RegExp(`[${Array.from(map.keys()).join("")}]`, "g")
    result = result.replace(reg, substring => {
      return map.get(substring)
    })
    // [ "1百3十2", "4千5百", "3千2百1十3" ] ==> ["0132", "4500", "3213"]
    let temp
    temp = /\d(?=千)/.exec(result)
    let num1 = temp ? temp[0] : "0"
    temp = /\d(?=百)/.exec(result)
    let num2 = temp ? temp[0] : "0"
    temp = /\d?(?=十)/.exec(result)
    let num3
    if (temp === null) { // 说明没十：一百零二
      num3 = "0"
    } else if (temp[0] === "") { // 说明十被简写了：十一
      num3 = "1"
    } else { // 正常情况：一百一十一
      num3 = temp[0]
    }
    temp = /\d$/.exec(result)
    let num4 = temp ? temp[0] : "0"
    return num1 + num2 + num3 + num4
  })
  // 借助parseInt自动去零
  return parseInt(arr.join(""))
}
