import plugin from '../../../lib/plugins/plugin.js'
import os from 'os';
import { render, Config } from '../components/index.js'
import { CPU, Cfg, common } from '../model/index.js'
import fs from 'fs'
import moment from 'moment';
import si from 'systeminformation'
import child_process from 'child_process'
import lodash from 'lodash'
let interval = false;
export class example extends plugin {
  constructor() {
    super({
      name: '状态',
      event: 'message',
      priority: 50,
      rule: [
        {
          reg: '^#?(椰奶)?状态(pro)?$',
          fnc: 'state'
        }
      ]

    })
  }

  async execSync(cmd) {
    return new Promise((resolve, reject) => {
      child_process.exec(cmd, (error, stdout, stderr) => {
        resolve({ error, stdout, stderr })
      })
    })
  }

  async state(e) {
    if (!/椰奶/.test(e.msg) && !Config.Notice.state) {
      return false;
    }
    //防止多次触发
    if (interval) { return } else interval = true;
    //现在的时间戳(秒)
    let present_time = new Date().getTime() / 1000
    //系统
    let osinfo = await si.osInfo();
    //可视化数据
    let visualData = [
      //CPU板块
      await CPU.getCpuInfo(osinfo),
      //内存板块
      await CPU.getMemUsage(),
      //GPU板块
      await CPU.getGPU(),
      //Node板块
      await CPU.getNodeInfo()
    ]
    logger.debug(visualData)
    visualData = lodash.compact(visualData)
    //FastFetch
    let FastFetch = ""
    if (/pro/.test(e.msg)) {
      let ret = await this.execSync(`bash plugins/yenai-plugin/resources/state/state.sh`)
      if (ret.error) return e.reply(`❎ 请检查是否使用git bash启动Yunzai-bot\n错误信息：${ret.stderr}`)
      FastFetch = ret.stdout.trim()
    }
    //渲染数据
    let data = {
      //头像
      portrait: `https://q1.qlogo.cn/g?b=qq&s=0&nk=${Bot.uin}`,
      //运行时间
      runTime: Formatting(present_time - Bot.stat.start_time, true),
      //日历
      calendar: moment().format("YYYY-MM-DD HH:mm:ss"),
      //昵称
      nickname: Bot.nickname,
      //系统运行时间
      systime: Formatting(os.uptime(), true),
      //收
      recv: Bot.statistics.recv_msg_cnt,
      //发
      sent: await redis.get(`Yz:count:sendMsg:total`) || 0,
      //nodejs版本
      nodeversion: process.version,
      //群数
      group_quantity: Array.from(Bot.gl.values()).length,
      //好友数
      friend_quantity: Array.from(Bot.fl.values()).length,
      //登陆设备
      platform: common.platform[Bot.config.platform],
      //在线状态
      status: common.status[Bot.status],
      // 取插件
      plugin: textFile(),
      //硬盘内存
      HardDisk: await CPU.getfsSize(),
      //硬盘速率
      fsStats: CPU.DiskSpeed,
      //网络
      network: CPU.getnetwork,
      //FastFetch
      FastFetch,
      //可视化数据
      visualData,
      //系统信息
      osinfo,
    }
    //渲染图片
    await render('state/state', {
      ...data,
    }, {
      e,
      scale: 2.0
    })
    interval = false;
  }


}

/**
 * @description: 格式化时间
 * @param {Number} time 秒数
 * @param {boolean} yes  是否补零
 * @return {String} 天:?时:分:秒
 */
function Formatting(time, repair) {
  let times = Cfg.getsecond(time, repair)

  let { second, minute, hour, day } = times

  if (day > 0) {
    return day + "天 " + hour + ":" + minute + ":" + second
  } else {
    return hour + ":" + minute + ":" + second
  }

}



/**
 * @description: 取插件包
 * @return {*} 插件包数量
 */
function textFile() {
  let str = "./plugins"
  let arr = fs.readdirSync(str);
  let plugin = [];
  arr.forEach((val) => {
    let ph = fs.statSync(str + '/' + val);
    if (ph.isDirectory()) {
      plugin.push(val)
    }
  })
  let del = ['example', 'genshin', 'other', 'system']

  for (let i of del) {
    try {
      plugin.splice([plugin.indexOf(i)], 1)
    } catch (e) {
      console.log(e);
    }
  }

  return {
    plugins: plugin?.length || 0,
    js: fs.readdirSync("./plugins/example")?.length || 0
  }
}