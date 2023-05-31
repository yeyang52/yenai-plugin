import plugin from '../../../lib/plugins/plugin.js'
import os from 'os'
import { Config } from '../components/index.js'
import { State, common, puppeteer } from '../model/index.js'
import { platform, status } from '../constants/other.js'
import moment from 'moment'
import _ from 'lodash'

let interval = false
export class NewState extends plugin {
  constructor () {
    super({
      name: '椰奶状态',
      event: 'message',
      priority: 50,
      rule: [
        {
          reg: '^#?(椰奶)?(状态|监控)(pro)?$',
          fnc: 'state'
        }
      ]

    })
  }

  get Bot () {
    return this.e.bot ?? Bot
  }

  async state (e) {
    if (e.msg.includes('监控')) {
      return await puppeteer.render('state/monitor', {
        chartData: JSON.stringify(State.chartData)
      }, {
        e,
        scale: 1.4
      })
    }

    if (!/椰奶/.test(e.msg) && !Config.whole.state) return false

    if (!State.si) return e.reply('❎ 没有检测到systeminformation依赖，请运行："pnpm add systeminformation -w"进行安装')

    // 防止多次触发
    if (interval) { return false } else interval = true
    // 系统
    let FastFetch; let HardDisk
    let otherInfo = []
    // 其他信息
    otherInfo.push({
      first: '系统',
      tail: State.osInfo?.distro
    })
    // 网络
    otherInfo.push(State.getnetwork)
    // 插件数量
    otherInfo.push(State.getPluginNum)
    let promiseTaskList = [
      State.getFastFetch(e).then(res => { FastFetch = res }),
      State.getFsSize().then(res => { HardDisk = res })
    ]

    // 网络测试
    let psTest = []
    let { psTestSites, psTestTimeout } = Config.state
    psTestSites && promiseTaskList.push(...psTestSites?.map(i => State.getNetworkLatency(i.url, psTestTimeout).then(res => psTest.push({
      first: i.name,
      tail: res
    }))))
    // 执行promise任务
    await Promise.all(promiseTaskList)
    // 可视化数据
    let visualData = _.compact(await Promise.all([
      // CPU板块
      State.getCpuInfo(),
      // 内存板块
      State.getMemUsage(),
      // GPU板块
      State.getGPU(),
      // Node板块
      State.getNodeInfo()
    ]))
    // 渲染数据
    let data = {
      chartData: JSON.stringify(common.checkIfEmpty(State.chartData, ['echarts_theme', 'cpu', 'ram']) ? undefined : State.chartData),
      // 头像
      portrait: e.bot?.avatar ?? `https://q1.qlogo.cn/g?b=qq&s=0&nk=${this.Bot.uin}`,
      // 运行时间
      runTime: common.formatTime(Date.now() / 1000 - this.Bot.stat.start_time, 'dd天hh小时mm分', false),
      // 日历
      calendar: moment().format('YYYY-MM-DD HH:mm:ss'),
      // 昵称
      nickname: this.Bot.nickname,
      // 系统运行时间
      systime: common.formatTime(os.uptime(), 'dd天hh小时mm分', false),
      // 收
      recv: this.Bot.stat.recv_msg_cnt,
      // 发
      sent: await redis.get('Yz:count:sendMsg:total') || 0,
      // 图片
      screenshot: await redis.get('Yz:count:screenshot:total') || 0,
      // nodejs版本
      nodeVersion: process.version,
      // 群数
      groupQuantity: Array.from(this.Bot.gl.values()).length,
      // 好友数
      friendQuantity: Array.from(this.Bot.fl.values()).length,
      // 登陆设备
      platform: platform[this.Bot.config?.platform],
      // 在线状态
      status: status[this.Bot.status],
      // 硬盘内存
      HardDisk,
      // FastFetch
      FastFetch,
      // 硬盘速率
      fsStats: State.DiskSpeed,
      // 可视化数据
      visualData,
      // 系统平台
      osPlatform: State.osInfo?.platform,
      // 其他数据
      otherInfo: _.compact(otherInfo),
      psTest: _.isEmpty(psTest) ? false : psTest
    }

    // 渲染图片
    await puppeteer.render('state/state', {
      ...data
    }, {
      e,
      scale: 1.4
    })

    interval = false
  }
}
