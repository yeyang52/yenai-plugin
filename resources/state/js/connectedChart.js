/* eslint-disable no-undef */

const chart = echarts.init(document.getElementById("connectedChart"), "westeros", {
  renderer: "svg"
})

let option = {
  animation: false,
  tooltip: { show: false },
  legend: { show: false },
  grid: { left: 0, right: 0, top: 0, bottom: 0 },
  xAxis: {
    type: "time",
    show: false,
    boundaryGap: false
  },
  yAxis: {
    type: "value",
    show: false,
    scale: true
  },
  series: [
    {
      type: "line",
      data: redisChartData,
      showSymbol: false,
      lineStyle: {
        width: 2,
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: "rgba(138, 97, 248, 0.9)" },
          { offset: 1, color: "rgba(138, 97, 248, 1)" }
        ]),
        shadowColor: "rgba(138, 97, 248, 0.7)",
        shadowBlur: 18,
        shadowOffsetY: 0
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: "rgba(138, 97, 248, 0.25)" },
          { offset: 1, color: "rgba(138, 97, 248, 0)" }
        ])
      },
      smooth: true
    }
  ]
}

chart.setOption(option)
