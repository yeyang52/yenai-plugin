import plugin from '../../../lib/plugins/plugin.js'
import os from 'os';
import { Version, render, Config } from '../components/index.js'
import { CPU, Cfg } from '../model/index.js'
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
    this.isGPU = false
  }
  async init() {
    si.networkStats()
    if ((await si.graphics()).controllers.find(item => item.memoryUsed && item.memoryFree && item.utilizationGpu)) {
      this.isGPU = true
    }
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
    //头像
    let portrait = `https://q1.qlogo.cn/g?b=qq&s=0&nk=${Bot.uin}`
    //cpu使用率
    let cpu_info = await CPU.getCPUUsage()
    //内存使用率
    let MemUsage = (1 - os.freemem() / os.totalmem()).toFixed(2)
    //空闲内存
    let freemem = CPU.getfilesize(os.freemem())
    //总共内存
    let totalmem = CPU.getfilesize(os.totalmem())
    //使用内存
    let Usingmemory = CPU.getfilesize((os.totalmem() - os.freemem()))
    //nodejs占用
    let nodeoccupy = CPU.getmemory();
    let node = CPU.Circle(nodeoccupy.occupy)
    let [node_leftCircle, node_rightCircle] = node
    //cpu
    let cpu = CPU.Circle(cpu_info)
    let [cpu_leftCircle, cpu_rightCircle] = cpu
    //ram
    let ram = CPU.Circle(MemUsage)
    let [ram_leftCircle, ram_rightCircle] = ram
    //最大mhz
    // let maxspeed = CPU.getmaxspeed()
    let maxspeed = await si.cpuCurrentSpeed()
    //核心
    let hx = os.cpus()
    //cpu制造者
    let cpumodel = hx[0]?.model.slice(0, hx[0]?.model.indexOf(" ")) || ""
    //群数
    let group_quantity = Array.from(Bot.gl.values()).length
    //好友数
    let friend_quantity = Array.from(Bot.fl.values()).length
    //登录设备
    let platform = {
      "1": "安卓手机",
      "2": "aPad",
      "3": "安卓手表",
      "4": "MacOS",
      "5": "iPad"
    }
    //在线状态
    let status = {
      "31": "离开",
      "50": "忙碌",
      "70": "请勿打扰",
      "41": "隐身",
      "11": "我在线上",
      "60": "Q我吧",
    };
    //系统
    let osinfo = await si.osInfo()
    //硬盘内存
    let HardDisk = '';
    let fsSize = lodash.uniqWith(await si.fsSize(), (a, b) => a.used === b.used && a.size === b.size && a.use === b.use && a.available === b.available)
    for (let i of fsSize) {
      if (!i.size || !i.used || !i.available || !i.use) continue;
      if (/docker/.test(i.mount)) continue;
      if (osinfo.arch.includes("arm") && i.mount != '/' && !/darwin/i.test(osinfo.platform)) continue;
      let color = '#90ee90'
      if (i.use > 90) {
        color = '#d73403'
      } else if (i.use > 80) {
        color = '#ffa500'
      }
      HardDisk +=
        `<li class='HardDisk_li'>
        <div class='word mount'>${i.mount}</div>
        <div class='progress'>
          <div class='word'>${CPU.getfilesize(i.used)} / ${CPU.getfilesize(i.size)}</div>
          <div class='current' style=width:${Math.ceil(i.use)}%;background:${color}></div>
        </div>
        <div class='percentage'>${Math.ceil(i.use)}%</div>
      </li>`
    }
    if (HardDisk) HardDisk = `<div class="box memory"><ul>${HardDisk}</ul></div>`
    //网络
    let network = (await si.networkStats())[0]
    network.rx_sec = CPU.getfilesize(network.rx_sec, false)
    network.tx_sec = CPU.getfilesize(network.tx_sec, false)
    let networkhtml = '';
    if (network.rx_sec && network.tx_sec) {
      networkhtml =
        `<div class="speed">
        <p>${network.iface}</p>
        <p>↑${network.tx_sec}/s ↓${network.rx_sec}/s</p>
      </div>`
    }
    let GPU = ''
    //GPU
    try {
      if (await redis.get('yenai:isGPU') == '1') {
        GPU = await CPU.getGPU()
      }
    } catch (err) {
      console.log(err);
    }
    //FastFetch
    let FastFetch = ""
    if (/pro/.test(e.msg)) {
      let ret = await this.execSync(`bash plugins/yenai-plugin/resources/state/state.sh`)
      if (!ret.error) {
        FastFetch = ret.stdout.trim()
      }
    }
    //渲染数据
    let data = {
      //路径
      tplFile: `./plugins/yenai-plugin/resources/state/state.html`,
      //头像
      portrait,
      //运行时间
      runTime: Formatting(present_time - Bot.stat.start_time, true),
      //版本
      version: Version.ver,
      //日历
      calendar: moment().format("YYYY-MM-DD HH:mm:ss"),
      //地址
      dz: process.cwd(),
      //昵称
      nickname: Bot.nickname,
      //系统运行时间
      systime: Formatting(os.uptime(), true),
      //收
      recv: Bot.statistics.recv_msg_cnt,
      //发
      sent: await redis.get(`Yz:count:sendMsg:total`) || 0,
      //cpu占比
      cpu_leftCircle,
      cpu_rightCircle,
      cpu_info: parseInt(cpu_info * 100) + "%",
      //核心
      hx: hx.length + "核",
      cpumodel,
      // cpudata: await si.cpu(),
      //最大MHZ
      maxspeed,
      //系统
      osinfo,
      //内存使用率
      ram_leftCircle,
      ram_rightCircle,
      MemUsage: parseInt(MemUsage * 100) + "%",
      //总共内存
      totalmem,
      //空闲内存
      freemem,
      //已用内存
      Usingmemory,
      //nodejs版本
      nodeversion: process.version,
      //nodejs占用
      node_leftCircle,
      node_rightCircle,
      nodeoccupy,
      node_info: parseInt(nodeoccupy.occupy * 100) + "%",
      //群数
      group_quantity,
      //好友数
      friend_quantity,
      //登陆设备
      platform: platform[Bot.config.platform],
      //在线状态
      status: status[Bot.status],
      // 取插件包
      takeplugin: textFile() || 0,
      //取插件
      takejs: fs.readdirSync("./plugins/example")?.length || 0,
      //内存
      HardDisk,
      //网络
      networkhtml,
      //FastFetch
      FastFetch,
      //GPU
      GPU
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
  arr.forEach((val, idx) => {
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

  return plugin?.length;
}