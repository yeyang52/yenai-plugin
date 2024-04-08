/* eslint-disable no-undef */
echarts.registerTheme("westeros", chartData.echarts_theme)
const chart = echarts.init(document.getElementById("Chart"), "westeros", {
  renderer: "svg"
})
const backdrop = chartData.backdrop
// 背景api
if (backdrop) {
  let container = document.getElementById("container")
  const img = new Image()
  let timer = setTimeout(function() {
    img.src = ""
    console.log("图像加载超时")
  }, 5000)
  img.onload = function() {
    clearTimeout(timer)
    container.style.backgroundImage = "url(" + backdrop + ")"
  }
  img.onerror = function() {
    clearTimeout(timer)
    console.log("图像加载出错")
  }
  img.src = backdrop
}
const by = (value) => {
  value = value?.value ?? value
  let units = [ "B", "KB", "MB", "GB", "TB" ] // 定义单位数组
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex++
  }
  return value.toFixed(0) + units[unitIndex] // 返回带有动态单位标签的字符串
}
let option = {
  animation: false,
  textStyle: {
    fontFamily: "FZB, Number, \"汉仪文黑-65W\", YS, PingFangSC-Medium, \"PingFang SC\""
  },
  title: {
    text: "Chart"
  },
  legend: {},
  grid: {
    left: "1%",
    right: "1.5%",
    bottom: "0",
    containLabel: true
  },
  xAxis: [
    {
      type: "time"
    }
  ],
  yAxis: [
    {
      type: "value",
      axisLabel: {
        formatter: by
      }
    }
  ],
  series: [
    {
      name: "上行",
      type: "line",
      // areaStyle: {},
      showSymbol: false,
      markPoint: {
        data: [ { type: "max", name: "Max", label: { formatter: by } } ]
      },
      data: chartData.network.upload
    },
    {
      name: "下行",
      type: "line",
      // areaStyle: {},
      showSymbol: false,
      markPoint: {
        data: [ { type: "max", name: "Max", label: { formatter: by } } ]
      },
      data: chartData.network.download
    },
    {
      name: "读",
      type: "line",
      // areaStyle: {},
      showSymbol: false,
      markPoint: {
        data: [ { type: "max", name: "Max", label: { formatter: by } } ]
      },
      data: chartData.fsStats.readSpeed
    },
    {
      name: "写",
      type: "line",
      // areaStyle: {},
      showSymbol: false,
      markPoint: {
        data: [ { type: "max", name: "Max", label: { formatter: by } } ]
      },
      data: chartData.fsStats.writeSpeed
    }
  ]
}
option.legend.data = option.series
  .filter(item => item.data.length !== 0)
  .map(item => item.name)
if (option.legend.data.length === 0) {
  const element = document.querySelector(".box[data-boxInfo=图表]")
  element.remove()
} else {
  chart.setOption(option)
}
