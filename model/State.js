import os from 'os'
import _ from 'lodash'
import fs from 'fs'
import { common } from './index.js'
import { Config, Data } from '../components/index.js'

export default new class OSUtils {
  constructor () {
    this.cpuUsageMSDefault = 1000 // CPU 利用率默认时间段
    this.isGPU = false
    this._now_network = null
    this._fsStats = null
    this.si = null
    this.chartData = {
      upload: [],
      download: [],
      readSpeed: [],
      writeSpeed: []
    }
    this.echarts_theme = null
    this.init()
  }

  async initDependence () {
    try {
      this.si = await import('systeminformation')
      return this.si
    } catch (error) {
      if (error.stack?.includes('Cannot find package')) {
        logger.warn('--------椰奶依赖缺失--------')
        logger.warn(`yenai-plugin 缺少依赖将无法使用 ${logger.yellow('椰奶状态')}`)
        logger.warn(`如需使用请运行：${logger.red('pnpm add systeminformation -w')}`)
        logger.warn('---------------------------')
        logger.debug(decodeURI(error.stack))
      } else {
        logger.error(`椰奶载入依赖错误：${logger.red('systeminformation')}`)
        logger.error(decodeURI(error.stack))
      }
    }
  }

  set now_network (value) {
    if (value[0].tx_sec == null || !value[0].rx_sec == null) return

    this._now_network = value
    this.chartData.upload.push([Date.now(), value[0].tx_sec])
    this.chartData.download.push([Date.now(), value[0].rx_sec])
    if (this.chartData.upload.length > 50) {
      this.chartData.upload.shift()
    }
    if (this.chartData.download.length > 50) {
      this.chartData.download.shift()
    }
  }

  get now_network () {
    return this._now_network
  }

  set fsStats (value) {
    if (value.rx_sec == null || value.wx_sec == null) return false
    this._fsStats = value
    this.chartData.writeSpeed.push([Date.now(), value.wx_sec])
    this.chartData.readSpeed.push([Date.now(), value.rx_sec])
    if (this.chartData.writeSpeed.length > 50) {
      this.chartData.writeSpeed.shift()
    }
    if (this.chartData.readSpeed.length > 50) {
      this.chartData.readSpeed.shift()
    }
  }

  get fsStats () {
    return this._fsStats
  }

  async init () {
    if (!await this.initDependence()) return
    // 初始化GPU获取
    if ((await this.si.graphics()).controllers.find(item => item.memoryUsed && item.memoryFree && item.utilizationGpu)) {
      this.isGPU = true
    }
    // 给有问题的用户关闭定时器
    if (!Config.Notice.statusTask) return
    // 网速
    let worktimer = setInterval(async () => {
      this.now_network = await this.si.networkStats()
    }, 5000)
    // 磁盘写入速度
    let fsStatstimer = setInterval(async () => {
      this.fsStats = await this.si.fsStats()
    }, 5000)
    // 一分钟后检测是否能获取不能则销毁定时器
    setTimeout(() => {
      if (!this.now_network) clearTimeout(worktimer)
      if (!this.fsStats) clearTimeout(fsStatstimer)
    }, 60000)
  }

  /** 字节转换 */
  getfilesize (size, isbtye = true, issuffix = true) { // 把字节转换成正常文件大小
    if (size == null || size == undefined) return 0
    let num = 1024.00 // byte
    if (isbtye) {
      if (size < num) { return size.toFixed(2) + 'B' }
    }
    if (size < Math.pow(num, 2)) { return (size / num).toFixed(2) + `K${issuffix ? 'b' : ''}` } // kb
    if (size < Math.pow(num, 3)) { return (size / Math.pow(num, 2)).toFixed(2) + `M${issuffix ? 'b' : ''}` } // M
    if (size < Math.pow(num, 4)) { return (size / Math.pow(num, 3)).toFixed(2) + 'G' } // G
    return (size / Math.pow(num, 4)).toFixed(2) + 'T' // T
  }

  /**
    * @description: 圆形进度条渲染
    * @param {Number} res 百分比小数
    * @return {*} css样式
  */
  Circle (res) {
    let num = (res * 360).toFixed(0)
    let color = '#90ee90'
    if (res >= 0.9) {
      color = '#d73403'
    } else if (res >= 0.8) {
      color = '#ffa500'
    }
    let leftCircle = `style="transform:rotate(-180deg);background:${color};"`
    let rightCircle = `style="transform:rotate(360deg);background:${color};"`
    if (num > 180) {
      leftCircle = `style="transform:rotate(${num}deg);background:${color};"`
    } else {
      rightCircle = `style="transform:rotate(-${180 - num}deg);background:${color};"`
    }
    return { leftCircle, rightCircle }
  }

  /** 获取nodejs内存情况 */
  getNodeInfo () {
    let memory = process.memoryUsage()
    // 总共
    let rss = this.getfilesize(memory.rss)
    // 堆
    let heapTotal = this.getfilesize(memory.heapTotal)
    // 栈
    let heapUsed = this.getfilesize(memory.heapUsed)
    // 占用率
    let occupy = (memory.rss / (os.totalmem() - os.freemem())).toFixed(2)
    return {
      ...this.Circle(occupy),
      inner: parseInt(occupy * 100) + '%',
      title: 'Node',
      info: [
        `总 ${rss}`,
        `堆 ${heapTotal}`,
        `栈 ${heapUsed}`
      ]
    }
  }

  /** 获取当前内存占用 */
  getMemUsage () {
    // 内存使用率
    let MemUsage = (1 - os.freemem() / os.totalmem()).toFixed(2)
    // 空闲内存
    let freemem = this.getfilesize(os.freemem())
    // 总共内存
    let totalmem = this.getfilesize(os.totalmem())
    // 使用内存
    let Usingmemory = this.getfilesize((os.totalmem() - os.freemem()))

    return {
      ...this.Circle(MemUsage),
      inner: parseInt(MemUsage * 100) + '%',
      title: 'RAM',
      info: [
        `总共 ${totalmem}`,
        `已用 ${Usingmemory}`,
        `空闲 ${freemem}`
      ]
    }
  }

  /** 获取CPU占用 */
  async getCpuInfo (arch) {
    // cpu使用率
    let cpu_info = (await this.si.currentLoad())?.currentLoad
    if (cpu_info == null || cpu_info == undefined) return false
    // 核心
    let hx = os.cpus()
    // cpu制造者
    let cpumodel = hx[0]?.model.slice(0, hx[0]?.model.indexOf(' ')) || ''
    // 最大MHZ
    let maxspeed = await this.si.cpuCurrentSpeed()

    return {
      ...this.Circle(cpu_info / 100),
      inner: parseInt(cpu_info) + '%',
      title: 'CPU',
      info: [
        `${cpumodel} ${hx.length}核 ${arch}`,
        `平均${maxspeed.avg}GHz`,
        `最大${maxspeed.max}GHz`
      ]

    }
  }

  /** 获取GPU占用 */
  async getGPU () {
    if (!this.isGPU) return false
    try {
      let graphics = (await this.si.graphics()).controllers.find(item => item.memoryUsed && item.memoryFree && item.utilizationGpu)
      let { vendor, temperatureGpu, utilizationGpu, memoryTotal, memoryUsed, powerDraw } = graphics
      temperatureGpu = temperatureGpu ? temperatureGpu + '℃' : ''
      powerDraw = powerDraw ? powerDraw + 'W' : ''
      return {
        ...this.Circle(utilizationGpu / 100),
        inner: parseInt(utilizationGpu) + '%',
        title: 'GPU',
        info: [
          `${vendor} ${temperatureGpu} ${powerDraw}`,
          `总共 ${(memoryTotal / 1024).toFixed(2)}G`,
          `已用 ${(memoryUsed / 1024).toFixed(2)}G`
        ]
      }
    } catch (e) {
      console.log(e)
      return false
    }
  }

  /**
   * @description: 获取硬盘
   * @return {*}
   */
  async getfsSize () {
    // 去重
    let HardDisk = _.uniqWith(await this.si.fsSize(),
      (a, b) => a.used === b.used && a.size === b.size && a.use === b.use && a.available === b.available)
    // 过滤
    HardDisk = HardDisk.filter(item => item.size && item.used && item.available && item.use)
    // 为空返回false
    if (_.isEmpty(HardDisk)) return false
    // 数值转换
    return HardDisk.map(item => {
      item.used = this.getfilesize(item.used)
      item.size = this.getfilesize(item.size)
      item.use = Math.ceil(item.use)
      item.color = '#90ee90'
      if (item.use >= 90) {
        item.color = '#d73403'
      } else if (item.use >= 70) {
        item.color = '#ffa500'
      }
      return item
    })
  }

  /** 获取FastFetch */
  async getFastFetch (e) {
    if (!/pro/.test(e.msg)) return ''
    let ret = await common.execSync('bash plugins/yenai-plugin/resources/state/state.sh')
    if (ret.error) {
      e.reply(`❎ 请检查是否使用git bash启动Yunzai-bot\n错误信息：${ret.stderr}`)
      return ''
    }
    return ret.stdout.trim()
  }

  // 获取读取速率
  get DiskSpeed () {
    if (!this.fsStats || this.fsStats.rx_sec == null || this.fsStats.wx_sec == null) return false
    return {
      rx_sec: this.getfilesize(this.fsStats.rx_sec, false, false),
      wx_sec: this.getfilesize(this.fsStats.wx_sec, false, false)
    }
  }

  /**
   * @description: 获取网速
   * @return {*}
   */
  get getnetwork () {
    let network = {}
    try { network = _.cloneDeep(this.now_network)[0] } catch { return false }
    if (network.rx_sec == null || network.tx_sec == null) return false
    network.rx_sec = this.getfilesize(network.rx_sec, false, false)
    network.tx_sec = this.getfilesize(network.tx_sec, false, false)
    return network
  }

  /**
 * @description: 取插件包
 * @return {*} 插件包数量
 */
  get numberOfPlugIns () {
    let str = './plugins'
    let arr = fs.readdirSync(str)
    let plugin = []
    arr.forEach((val) => {
      let ph = fs.statSync(str + '/' + val)
      if (ph.isDirectory()) {
        plugin.push(val)
      }
    })
    let del = ['example', 'genshin', 'other', 'system', 'bin']
    plugin = plugin.filter(item => !del.includes(item))

    return {
      plugins: plugin?.length || 0,
      js: fs.readdirSync('./plugins/example')?.filter(item => item.includes('.js'))?.length || 0
    }
  }

  /**
   * 生成网络图表的SVG字符串
   * @async
   * @function
   * @returns {Promise<string|boolean>} - 网络图表的SVG字符串或者false，如果未检测到echarts模块则返回false
   */
  async networkChart () {
    if (!this.now_network) return false
    let echarts = {}
    try {
      echarts = await import('echarts')
    } catch {
      logger.warn('[椰奶][状态网速]未检测到echarts模块无法显示图表')
      logger.warn(`如需使用请运行：${logger.red('pnpm add echarts -w')}`)
      return false
    }
    if (!this.echarts_theme) this.echarts_theme = Data.readJSON('tools/echarts/theme_westeros.json')
    echarts.registerTheme('westeros', this.echarts_theme)
    const chart = echarts.init(null, 'westeros', {
      renderer: 'svg',
      ssr: true,
      width: 508,
      height: 300
    })
    const by = (value) => {
      value = value?.value ?? value
      let units = ['B', 'KB', 'MB', 'GB', 'TB'] // 定义单位数组
      let unitIndex = 0
      while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024
        unitIndex++
      }
      return value.toFixed(0) + units[unitIndex] // 返回带有动态单位标签的字符串
    }
    chart.setOption({
      animation: false,
      textStyle: {
        fontFamily: 'Number, "汉仪文黑-65W", YS, PingFangSC-Medium, "PingFang SC", sans-serif'
      },
      title: {
        text: 'Chart'
      },
      legend: {
        data: ['上行', '下行', '读', '写']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'time'
        }
      ],
      yAxis: [
        {
          type: 'value',
          axisLabel: {
            formatter: by
          }
        }
      ],
      series: [
        {
          name: '上行',
          type: 'line',
          areaStyle: {},
          markPoint: {
            data: [
              { type: 'max', name: 'Max', label: { formatter: by } }
            ]
          },
          data: this.chartData.upload
        },
        {
          name: '下行',
          type: 'line',
          areaStyle: {},
          markPoint: {
            data: [
              { type: 'max', name: 'Max', label: { formatter: by } }
            ]
          },
          data: this.chartData.download
        },
        {
          name: '读',
          type: 'line',
          areaStyle: {},
          markPoint: {
            data: [
              { type: 'max', name: 'Max', label: { formatter: by } }
            ]
          },
          data: this.chartData.readSpeed
        },
        {
          name: '写',
          type: 'line',
          areaStyle: {},
          markPoint: {
            data: [
              { type: 'max', name: 'Max', label: { formatter: by } }
            ]
          },
          data: this.chartData.writeSpeed
        }
      ]
    })
    return chart.renderToSVGString()
  }
}()
