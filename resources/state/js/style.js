/* eslint-disable no-undef */

const {
  BotNameColor, BotNameColorGradient, highColor, mediumColor,
  lowColor
} = Config
// 修改BotNameColor
const botNameElements = document.querySelectorAll(".header h1")
botNameElements.forEach(BotNameElement => {
  if (BotNameColorGradient && BotNameColorGradient !== "none") {
    BotNameElement.style.backgroundImage = `linear-gradient(${BotNameColorGradient})`
    BotNameElement.style.color = "transparent"
    BotNameElement.style.backgroundClip = "text"
  } else if (BotNameColor && BotNameColor !== "none") {
    BotNameElement.style.color = BotNameColor
    BotNameElement.style.backgroundImage = "none"
  }
})
// 进度条颜色
const documentElement = document.documentElement
documentElement.style.setProperty("--high-color", highColor)
documentElement.style.setProperty("--medium-color", mediumColor)
documentElement.style.setProperty("--low-color", lowColor)

// 根据圆环数量调整宽度
const mainHardwareElement = document.querySelectorAll(".mainHardware li")
const containerElement = document.querySelector(".container")
if (mainHardwareElement.length === 4) {
  containerElement.style.width = "650px"
} else if (mainHardwareElement.length === 5) {
  containerElement.style.width = "750px"
}
