import _ from 'lodash'
import { createRequire } from 'module'
import moment from 'moment'
import os from 'os'
import plugin from '../../../lib/plugins/plugin.js'
import { Config, Version, Plugin_Name } from '../components/index.js'
import { status } from '../constants/other.js'
import { State, common, puppeteer } from '../model/index.js'
const require = createRequire(import.meta.url)

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
    let { psTestSites, psTestTimeout, backdrop } = Config.state
    State.chartData.backdrop = backdrop
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
    const defaultAvatar = `../../../../../plugins/${Plugin_Name}/resources/state/img/default_avatar.jpg`
    // 发
    const sent = await redis.get('Yz:count:sendMsg:total') || 0
    // 图片
    const screenshot = await redis.get('Yz:count:screenshot:total') || 0
    // 机器人名称
    const BotName = Version.name
    // 系统运行时间
    const systime = common.formatTime(os.uptime(), 'dd天hh小时mm分', false)
    // 日历
    const calendar = moment().format('YYYY-MM-DD HH:mm:ss')
    // nodejs版本
    const nodeVersion = process.version
    let BotStatus = ""
    for (const i of e.msg.includes('pro') && Array.isArray(Bot.uin) ? Bot.uin : (Bot?.adapter?.[Bot?.uin] ? Bot.adapter : [e.self_id])) {
      const bot = Bot[i]
      if (!bot?.uin) continue
      // 头像
      const avatar = bot.avatar || (Number(bot.uin) ? `https://q1.qlogo.cn/g?b=qq&s=0&nk=${bot.uin}` : defaultAvatar)
      // 昵称
      const nickname = bot.nickname || "未知"
      // 在线状态
      const onlineStatus = status[bot.status] || "在线"
      // 登录平台版本
      const platform = bot.apk ? `${bot.apk.display} v${bot.apk.version}` : bot.version.version || "未知"
      // 收
      const recv = bot.stat?.recv_msg_cnt || "未知"
      // 好友数
      const friendQuantity = Array.from(bot.fl.values()).length
      // 群数
      const groupQuantity = Array.from(bot.gl.values()).length
      // 运行时间
      const runTime = common.formatTime(Date.now() / 1000 - bot.stat?.start_time, 'dd天hh小时mm分', false)
      // Bot版本
      const botVersion = bot.version ? `${bot.version.name}(${bot.version.id})${bot.apk ? ` ${bot.version.version}` : ""}` : `ICQQ(QQ) v${require('icqq/package.json').version}`
      BotStatus += `<div class="box">
    <div class="tb">
        <div class="avatar">
            <img src="${avatar}"
                onerror="this.src= '${defaultAvatar}'; this.onerror = null;">
        </div>
        <div class="header">
            <h1>${nickname}</h1>
            <hr noshade>
            <p>${onlineStatus}(${platform}) | 收${recv} | 发${sent} | 图片${screenshot} | 好友${friendQuantity} |
                群${groupQuantity}
            </p>
            <p>${BotName} 已运行 ${runTime} | 系统运行 ${systime}</p>
            <p>${calendar} | Nodejs ${nodeVersion} | ${botVersion}</p>
        </div>
    </div>
</div>
`
    }
    // 渲染数据
    let data = {
      BotStatus,
      chartData: JSON.stringify(common.checkIfEmpty(State.chartData, ['echarts_theme', 'cpu', 'ram']) ? undefined : State.chartData),
      // 硬盘内存
      HardDisk,
      // FastFetch
      FastFetch,
      // 硬盘速率
      fsStats: State.DiskSpeed,
      // 可视化数据
      visualData,
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
