import plugin from '../../../lib/plugins/plugin.js'
import os from 'os';
import { Version, render, Config } from '../components/index.js'
import { CPU, Cfg } from '../model/index.js'
import fs from 'fs'
import moment from 'moment';
import si from 'systeminformation'
export class example extends plugin {
  constructor() {
    super({
      name: '状态',
      event: 'message',
      priority: 50,
      rule: [
        {
          reg: '^#?(椰奶)?状态$',
          fnc: 'state'
        }
      ]

    })
  }
  async init() {
    si.networkStats()
  }

  async state(e) {
    if (!/椰奶/.test(e.msg) && !Config.Notice.state) {
      return false;
    }
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
    let node = Circle(nodeoccupy.occupy)
    let [node_leftCircle, node_rightCircle] = node
    //cpu
    let cpu = Circle(cpu_info)
    let [cpu_leftCircle, cpu_rightCircle] = cpu
    //ram
    let ram = Circle(MemUsage)
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
    try {
      for (let i of await si.fsSize()) {
        if (i.mount == '挂载点') continue;
        if (i.size == 0 && i.used == 0 && i.available == 0) continue;
        if (osinfo.arch.includes("arm") && i.mount != '/' && !/darwin/i.test(osinfo.platform)) continue;
        HardDisk += "<li><div class='word'>" + i.mount + "</div><div class='progress'>" + "<div class='word'>" + CPU.getfilesize(i.used) + " / " + CPU.getfilesize(i.size) + "</div><div class='current' style=width:" + Math.round(i.use) + '%' + "></div></div><div>" + Math.round(i.use) + '%' + "</div></li>"
      }
    } catch {
      console.error("无法获取硬盘");
    }
    //网络
    let network = (await si.networkStats())[0]
    network.rx_sec = CPU.getfilesize(network.rx_sec, false)
    network.tx_sec = CPU.getfilesize(network.tx_sec, false)
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
      network,
    }
    //渲染图片
    await render('state/state', {
      ...data,
    }, {
      e,
      scale: 2.0
    })
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
 * @description: 圆形进度条渲染
 * @param {Number} res 百分比小数
 * @return {*} css样式
 */
function Circle(res) {
  let num = (res * 360).toFixed(0)
  let leftCircle = `style=transform:rotate(-180deg)`;
  let rightCircle;
  if (num > 180) {
    leftCircle = `style=transform:rotate(${num}deg)`
  } else {
    rightCircle = `style=transform:rotate(-${180 - num}deg)`;
  }
  return [leftCircle, rightCircle]
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