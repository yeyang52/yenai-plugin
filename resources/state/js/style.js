/* eslint-disable no-undef */

const {
  BotNameColor, progressBarColor
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
if (mainHardwareElement.length === 4) {
  containerElement.style.width = "700px"
} else if (mainHardwareElement.length === 5) {
  containerElement.style.width = "750px"
}
