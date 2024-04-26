/* eslint-disable no-undef */
const chartBoxElement = document.querySelector(".box[data-boxInfo=图表]")
if (chartData) {
// 图表
  echarts.registerTheme("westeros", chartCfg.echarts_theme)
  const chart = echarts.init(document.getElementById("Chart"), "westeros", {
    renderer: "svg"
  })
  const by = (value) => {
    value = value?.value ?? value
    let units = [ "B", "KB", "MB", "GB", "TB" ] // 定义单位数组
    let unitIndex = 0
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024
      unitIndex++
    }
    return value.toFixed(1) + units[unitIndex] // 返回带有动态单位标签的字符串
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
    chartBoxElement.remove()
  } else {
    chart.setOption(option)
  }
} else {
  chartBoxElement.remove()
}
