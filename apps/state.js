import plugin from '../../../lib/plugins/plugin.js'
import { Config } from '../components/index.js'
import { puppeteer } from '../model/index.js'
import { getData, si } from '../model/State/index.js'
import Monitor from '../model/State/Monitor.js'
import { getCopyright } from '../model/State/OtherInfo.js'

let interval = false
export class NewState extends plugin {
  constructor () {
    super({
      name: '椰奶状态',
      event: 'message',
      priority: 50,
      rule: [
        {
          reg: '^#?(椰奶)?状态(pro)?$',
          fnc: 'state'
        }, {
          reg: '^#椰奶监控$',
          fnc: 'monitor'
        }
      ]

    })
  }

  async monitor (e) {
    await puppeteer.render('state/monitor', {
      chartData: JSON.stringify(Monitor.chartData)
    }, {
      e,
      scale: 1.4
    })
  }

  async state (e) {
    if (!/椰奶/.test(e.msg) && !Config.whole.state) return false

    if (!si) return e.reply('❎ 没有检测到systeminformation依赖，请运行："pnpm add systeminformation -w"进行安装')

    // 防止多次触发
    if (interval) { return false } else interval = true

    // 获取数据
    let data = await getData(e)

    // 渲染图片
    await puppeteer.render('state/state', {
      ...data,
      copyright: getCopyright()
    }, {
      e,
      scale: 1.4
    })

    interval = false
  }
}
