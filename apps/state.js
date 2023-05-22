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
    let osinfo = await State.si.osInfo()
    // 可视化数据
    let visualData = _.compact([
      // CPU板块
      await State.getCpuInfo(osinfo.arch),
      // 内存板块
      await State.getMemUsage(),
      // GPU板块
      await State.getGPU(),
      // Node板块
      await State.getNodeInfo()
    ])
    // 渲染数据
    let data = {
      chartData: JSON.stringify(common.checkIfEmpty(State.chartData, 'echarts_theme') ? undefined : State.chartData),
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
      nodeversion: process.version,
      // 群数
      group_quantity: Array.from(this.Bot.gl.values()).length,
      // 好友数
      friend_quantity: Array.from(this.Bot.fl.values()).length,
      // 登陆设备
      platform: platform[this.Bot.config?.platform],
      // 在线状态
      status: status[this.Bot.status],
      // 硬盘内存
      HardDisk: await State.getFsSize(),
      // FastFetch
      FastFetch: await State.getFastFetch(e),
      // 取插件
      plugin: State.numberOfPlugIns,
      // 硬盘速率
      fsStats: State.DiskSpeed,
      // 网络
      network: State.getnetwork,
      // 可视化数据
      visualData,
      // 系统信息
      osinfo
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
