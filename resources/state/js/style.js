/* eslint-disable no-undef */

const {
  BotNameColor, progressBarColor, redisInfoValColor
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
documentElement.style.setProperty("--low-color", low)

// 根据圆环数量调整宽度
const mainHardwareElement = document.querySelectorAll(".mainHardware li")
const containerElement = document.querySelector(".container")
let containerElementWidth = 650
let columnCount = 1
if (mainHardwareElement.length === 4) {
  containerElementWidth = 700
} else if (mainHardwareElement.length === 5) {
  containerElementWidth = 750
}
const containerElementHeight = containerElement.offsetHeight

if (containerElementHeight > 1200) {
  columnCount = 2
}
if (containerElementHeight > 2400) {
  columnCount = 3
}

if (columnCount >= 2) {
  containerElement.style.columnCount = columnCount
  containerElementWidth *= columnCount
  containerElement.style.paddingBottom = "70px"
}
containerElement.style.width = containerElementWidth + "px"

document.addEventListener("DOMContentLoaded", function() {
  const redisValElement = document.querySelectorAll(".redisBox .number")
  redisValElement.forEach(element => {
    element.style.color = redisInfoValColor ?? "#485ab6"
  })

  if (columnCount >= 2) {
    const copyrightElement = document.querySelector(".copyright")
    copyrightElement.classList.add("abs")
  }
})

const hardDiskLieElements = document.querySelectorAll(".HardDisk_li .mount")
let maxWidth = -Infinity
hardDiskLieElements.forEach(item => {
  const width = item.offsetWidth
  if (width > maxWidth) maxWidth = width
})

// 再统一设置所有元素宽度为最大宽度
hardDiskLieElements.forEach(item => {
  item.style.width = maxWidth + "px"
})
