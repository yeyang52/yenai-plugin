import _ from "lodash"
import si from "systeminformation"
import { Config, Log_Prefix } from "../../components/index.js"
import { getDiskIo, getNetIo } from "./FastFetch.js"
const CHART_DATA_KEY = "yenai:state:chartData"
const DEFAULT_INTERVAL = 60 * 1000
const DEFAULT_SAVE_DATA_NUMBER = 60

export default new class monitor {
  constructor() {
    this.checkDataNum = 0
    this.checkNetIoDataNum = 0
    this.network = null
    this.disksIO = null
    this.chartData = {
      network: {
        upload: [], // 上行
        download: [] // 下行
      },
      disksIO: {
        readSpeed: [], // 读
        writeSpeed: [] // 写
      },
      cpu: [], // cpu
      ram: [] // 内存
    }
    this.valueObject = {
      networkStats: "rx_sec,tx_sec,iface,rx_bytes,tx_bytes",
      currentLoad: "currentLoad",
      mem: "active",
      disksIO: "wIO_sec,rIO_sec,tIO_sec"
    }

    this.config = Config.state.monitor
    this.getDataInterval = this.config.getDataInterval ?? DEFAULT_INTERVAL
    this.saveDataNumber = this.config.saveDataNumber ?? DEFAULT_SAVE_DATA_NUMBER
    this.init()
  }

  async init() {
    await this.getRedisChartData()
    if (!this.config?.open) return

    if (this.config?.statusPowerShellStart) si.powerShellStart()
    const cb = (data) => this.handleData(data)
    this.timer = si.observe(this.valueObject, this.getDataInterval, cb)
  }

  handleData(data) {
    this.checkData(data)

    const now = Date.now()

    const {
      disksIO = {},
      networkStats = [],
      mem: { active } = {},
      currentLoad: { currentLoad } = {}
    } = data

    const addDataIfNumber = (chart, value) => {
      if (_.isNumber(value)) {
        this._addData(chart, [ now, value ])
      }
    }

    addDataIfNumber(this.chartData.ram, active)
    addDataIfNumber(this.chartData.cpu, currentLoad)

    if (_.isNumber(disksIO?.wIO_sec) && _.isNumber(disksIO?.rIO_sec)) {
      disksIO.wIO_sec *= 1024
      disksIO.rIO_sec *= 1024
      disksIO.name = "Disk IO"
      this.disksIO = [ disksIO ]
      addDataIfNumber(this.chartData.disksIO.writeSpeed, disksIO.wIO_sec)
      addDataIfNumber(this.chartData.disksIO.readSpeed, disksIO.rIO_sec)
    }

    if (networkStats.length > 0 && _.isNumber(networkStats[0]?.tx_sec) && _.isNumber(networkStats[0]?.rx_sec)) {
      this.network = networkStats
      addDataIfNumber(this.chartData.network.upload, networkStats[0].tx_sec)
      addDataIfNumber(this.chartData.network.download, networkStats[0].rx_sec)
    }

    this.setRedisChartData()
    return data
  }

  checkData(data) {
    if (this.checkDataNum <= 5) {
      if (_.isEmpty(data)) clearInterval(this.timer)
      _.forIn(data, (value, key) => {
        if (_.isEmpty(value)) {
          if (key === "disksIO") {
            logger.debug(`${Log_Prefix}[Monitor][DisksIO]获取${key}数据失败，尝试使用FastFetch获取DiskIO数据`)
            this.fastfetchGetDiskIo()
          } else {
            logger.debug(`${Log_Prefix}[Monitor]获取${key}数据失败，停止获取对应数据`)
          }
          delete this.valueObject[key]
        } else if (key === "networkStats") {
          if (!this.checkNetIoData(value)) {
            logger.debug(`${Log_Prefix}[Monitor][Network]获取${key}数据失败，尝试使用FastFetch获取NetworkIO数据`)
            this.fastfetchGetNetIo()
            delete this.valueObject[key]
          }
        }
      })
      this.checkDataNum++
    }
  }

  _isValidNetIoData(value) {
    return _.isArray(value) && value.length > 0 && _.isNumber(value[0]?.rx_sec) && _.isNumber(value[0]?.tx_sec)
  }

  checkNetIoData(value) {
    if (this._isValidNetIoData(value)) {
      return true
    }

    this.checkNetIoDataNum++
    return this.checkNetIoDataNum < 3
  }

  async _startFastFetchTimer(fetcher, onSuccess, logLabel) {
    const initialData = await fetcher()
    if (!_.isArray(initialData) || !initialData.length) return false
    onSuccess(initialData)

    let errorNum = 0
    let busy = false
    const timer = setInterval(async() => {
      if (busy) return
      busy = true
      try {
        const data = await fetcher()
        if (_.isArray(data) && data.length) {
          onSuccess(data)
        } else {
          logger.debug(`${Log_Prefix}[Monitor][FastFetch][${logLabel}]第${errorNum + 1}次使用FastFetch获取${logLabel}数据无效：`, data)
          errorNum++
        }
      } catch (err) {
        logger.debug(`${Log_Prefix}[Monitor][FastFetch][${logLabel}]第${errorNum + 1}次使用FastFetch获取${logLabel}数据失败：`, err)
        errorNum++
      } finally {
        busy = false
        if (errorNum >= 3) {
          logger.debug(`${Log_Prefix}[Monitor][FastFetch][${logLabel}]尝试使用FastFetch获取${logLabel}数据失败超过3次，停止尝试`)
          clearInterval(timer)
        }
      }
    }, this.getDataInterval)
    return timer
  }

  async fastfetchGetNetIo() {
    return this._startFastFetchTimer(
      getNetIo,
      (data) => {
        this.network = data
        const { rx_sec, tx_sec } = data[0]
        if (_.isNumber(rx_sec) && _.isNumber(tx_sec)) {
          this._addData(this.chartData.network.download, [ Date.now(), rx_sec ])
          this._addData(this.chartData.network.upload, [ Date.now(), tx_sec ])
        }
      },
      "NetIo"
    )
  }

  async fastfetchGetDiskIo() {
    return this._startFastFetchTimer(
      getDiskIo,
      (data) => {
        this.disksIO = data
        const { bytesRead, bytesWritten } = data[0]
        if (_.isNumber(bytesRead) && _.isNumber(bytesWritten)) {
          this._addData(this.chartData.disksIO.writeSpeed, [ Date.now(), bytesWritten ])
          this._addData(this.chartData.disksIO.readSpeed, [ Date.now(), bytesRead ])
        }
      },
      "DisksIO"
    )
  }

  async getRedisChartData() {
    if (!this.config.openRedisSaveData) return false
    let data = await redis.get(CHART_DATA_KEY)
    if (data) {
      _.merge(this.chartData, JSON.parse(data))
      return true
    }
    return false
  }

  async setRedisChartData() {
    if (!this.config.openRedisSaveData) return false
    try {
      await redis.set(CHART_DATA_KEY, JSON.stringify(this.chartData), { EX: 60 * 60 * 12 })
    } catch (error) {
      logger.error(`${Log_Prefix}[Monitor] 存储监控信息出错，错误信息，如一直报错可进入配置文件将 ${logger.red("state.yaml > monitor.openRedisSaveData")} 设置为false即可消除报错`, error)
    }
  }

  /**
   * 向数组中添加数据，如果数组长度超过允许的最大值，则删除最早添加的数据
   * @param {Array} arr - 要添加数据的数组
   * @param {*} data - 要添加的新数据
   * @param {number} [maxLen] - 数组允许的最大长度，默认值为60
   * @returns {void}
   */
  _addData(arr, data, maxLen = this.saveDataNumber) {
    if (data === null || data === undefined) return
    // 如果数组长度超过允许的最大值，删除第一个元素
    if (arr.length >= maxLen) {
      _.pullAt(arr, 0)
    }
    // 添加新数据
    arr.push(data)
  }
}()
