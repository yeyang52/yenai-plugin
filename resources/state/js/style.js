/* eslint-disable no-undef */

const {
  BotNameColor, highColor, mediumColor,
  lowColor, backdrop, backdropDefault, BotNameColorGradient
} = Config
// 背景api
if (backdrop) {
  let container = document.getElementById("container")
  const img = new Image()
  let timer = setTimeout(function() {
    img.src = ""
  }, 5000)
  img.onload = function() {
    clearTimeout(timer)
    container.style.backgroundImage = "url(" + backdrop + ")"
  }
  img.onerror = function() {
    container.style.backgroundImage = `url(${_res_path}/state/img/${backdropDefault})`
    clearTimeout(timer)
  }
  img.src = backdrop
}
const BotNameElement = document.querySelector(".header h1")
// 修改BotNameColor
if (BotNameColorGradient && BotNameColorGradient !== "none") {
  BotNameElement.style.backgroundImage = `linear-gradient(${BotNameColorGradient})`
} else if (BotNameColor && BotNameColor !== "none") {
  BotNameElement.style.backgroundColor = BotNameColor
  BotNameElement.style.backgroundImage = "none"
}
const documentElement = document.documentElement
documentElement.style.setProperty("--high-color", highColor)
documentElement.style.setProperty("--medium-color", mediumColor)
documentElement.style.setProperty("--low-color", lowColor)
