/* eslint-disable no-undef */

const {
  BotNameColor, progressBarColor, redisInfoValColor, startColumn, botInfoColor
} = Config.style
// 修改BotNameColor
const botNameElements = document.querySelectorAll(".header h1")
botNameElements.forEach(BotNameElement => {
  const BotNameColorGradient = BotNameColor.match(/gradient:(.*)/)?.[1]
  if (BotNameColorGradient) {
    BotNameElement.style.backgroundImage = `linear-gradient(${BotNameColorGradient})`
    BotNameElement.style.color = "transparent"
    BotNameElement.style.backgroundClip = "text"
  } else {
    BotNameElement.style.color = BotNameColor
    BotNameElement.style.backgroundImage = "none"
  }
})
const { high, medium, low } = progressBarColor
// 进度条颜色
const documentElement = document.documentElement
documentElement.style.setProperty("--high-color", high)
documentElement.style.setProperty("--medium-color", medium)
if (low instanceof Array && low.length > 0) {
  documentElement.style.setProperty("--low-color", low[0])
} else {
  documentElement.style.setProperty("--low-color", low)
}

// 根据圆环数量调整宽度
const mainHardwareElement = document.querySelectorAll(".mainHardware li")
const containerElement = document.querySelector(".container")
let containerElementWidth = 750
if (mainHardwareElement.length === 5) {
  containerElementWidth += 50
}

// 多列布局
let columnCount = 1
const containerElementHeight = containerElement.offsetHeight
if (containerElementHeight > 4500) {
  columnCount = 4
} else if (containerElementHeight > 2900) {
  columnCount = 3
} else if (containerElementHeight > 1700) {
  columnCount = 2
}

if (columnCount >= 2 && startColumn) {
  containerElement.style.columnCount = columnCount
  containerElementWidth *= columnCount
  // 版权居中
  containerElement.style.paddingBottom = "70px"
  document.addEventListener("DOMContentLoaded", function() {
    const copyrightElement = document.querySelector(".copyright")
    copyrightElement.classList.add("abs")
  })
  document.querySelector(".box").style.marginTop = "0"
}
containerElement.style.width = containerElementWidth + "px"

// 自定义redis颜色
document.addEventListener("DOMContentLoaded", function() {
  const redisValElement = document.querySelectorAll(".redisBox .number")
  redisValElement.forEach(element => {
    element.style.color = redisInfoValColor ?? "#485ab6"
  })
})
// 硬盘统一宽度
const hardDiskLieElements = document.querySelectorAll(".HardDisk_li .mount")
let maxWidth = -Infinity
if (hardDiskLieElements.length >= 2) {
  hardDiskLieElements.forEach(item => {
    const width = item.offsetWidth
    if (width > maxWidth) maxWidth = width
  })
  hardDiskLieElements.forEach(item => {
    item.style.width = maxWidth + 0.3 + "px"
  })
}
document.querySelectorAll(".botVersion").forEach((element, key) => {
  element.style.background = botInfoColor.botVersion
})
document.querySelectorAll(".platform").forEach((element, key) => {
  element.style.background = botInfoColor.platform
})
document.querySelectorAll(".contacts").forEach((element, key) => {
  element.style.background = botInfoColor.contacts[key % botInfoColor.contacts.length]
})
