import { Config } from "../../components/index.js"
import _ from "lodash"
import { si, initDependence } from "./utils.js"

export default new class monitor {
  constructor() {
    // 网络
    this._network = null
    // 读写速率
    this._fsStats = null
    // 记录60条数据一分钟记录一次
    this.chartData = {
      network: {
        // 上行
        upload: [],
        // 下行
        download: []
      },
      fsStats: {
        // 读
        readSpeed: [],
        // 写
        writeSpeed: []
      },
      // cpu
      cpu: [],
      // 内存
      ram: []
    }
    this.valueObject = {
      networkStats: "rx_sec,tx_sec,iface",
      currentLoad: "currentLoad",
      mem: "active",
      fsStats: "wx_sec,rx_sec"
    }
    this.chartDataKey = "yenai:state:chartData"

    this.init()
  }

  set network(value) {
    if (_.isNumber(value[0]?.tx_sec) && _.isNumber(value[0]?.rx_sec)) {
      this._network = value
      this._addData(this.chartData.network.upload, [ Date.now(), value[0].tx_sec ])
      this._addData(this.chartData.network.download, [ Date.now(), value[0].rx_sec ])
    }
  }

  get network() {
    return this._network
  }

  set fsStats(value) {
    if (_.isNumber(value?.wx_sec) && _.isNumber(value?.rx_sec)) {
      this._fsStats = value
      this._addData(this.chartData.fsStats.writeSpeed, [ Date.now(), value.wx_sec ])
      this._addData(this.chartData.fsStats.readSpeed, [ Date.now(), value.rx_sec ])
    }
  }

  get fsStats() {
    return this._fsStats
  }

  async init() {
    if (!await initDependence()) return
    await this.getRedisChartData()
    // 给有问题的用户关闭定时器
    if (!Config.state.statusTask) return

    if (Config.state.statusPowerShellStart) si.powerShellStart()
    // 初始化数据
    this.getData()
    // 网速
    const Timer = setInterval(async() => {
      let data = await this.getData()
      if (_.isEmpty(data)) clearInterval(Timer)
    }, 60000)
  }

  async getData() {
    const data = await si.get(this.valueObject)
    _.forIn(data, (value, key) => {
      if (_.isEmpty(value)) {
        logger.debug(`获取${key}数据失败，停止获取对应数据`)
        delete this.valueObject[key]
      }
    })
    const {
      fsStats,
      networkStats,
      mem: { active },
      currentLoad: { currentLoad }
    } = data
    this.fsStats = fsStats
    this.network = networkStats
    if (_.isNumber(active)) {
      this._addData(this.chartData.ram, [ Date.now(), active ])
    }
    if (_.isNumber(currentLoad)) {
      this._addData(this.chartData.cpu, [ Date.now(), currentLoad ])
    }
    this.setRedisChartData()
    return data
  }

  async getRedisChartData() {
    let data = await redis.get(this.chartDataKey)
    if (data) {
      this.chartData = JSON.parse(data)
      return true
    }
    return false
  }

  async setRedisChartData() {
    try {
      await redis.set(this.chartDataKey, JSON.stringify(this.chartData), { EX: 86400 })
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * 向数组中添加数据，如果数组长度超过允许的最大值，则删除最早添加的数据
   * @param {Array} arr - 要添加数据的数组
   * @param {*} data - 要添加的新数据
   * @param {number} [maxLen] - 数组允许的最大长度，默认值为60
   * @returns {void}
   */
  _addData(arr, data, maxLen = 60) {
    if (data === null || data === undefined) return
    // 如果数组长度超过允许的最大值，删除第一个元素
    if (arr.length >= maxLen) {
      _.pullAt(arr, 0)
    }
    // 添加新数据
    arr.push(data)
  }
}()
