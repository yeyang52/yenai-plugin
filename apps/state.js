import plugin from '../../../lib/plugins/plugin.js'
import moment from 'moment';
import os from 'os';
import { Version, Common, Plugin_Name } from '../components/index.js'
import CPU from '../model/cpu.js';
export class example extends plugin {
  constructor() {
    super({
      name: '状态',
      dsc: '状态',
      event: 'message',
      priority: 5000,
      rule: [
        {
          reg: '^#?运行状态$',
          fnc: 'state'
        }
      ]

    })
  }


  async state(e) {
    this.date = moment().format('MMDD')
    this.key = 'Yz:count:'

    if (e.group_id) {
      this.key += `group:${e.group_id}:`
    }

    let portrait = `https://q1.qlogo.cn/g?b=qq&s=0&nk=${Bot.uin}`
    //cpu使用率
    let cpu_info = await CPU.getCPUUsage()
    //内存使用率
    let MemUsage = (1 - os.freemem() / os.totalmem()).toFixed(2)
    //空闲内存
    let freemem = CPU.getfilesize(os.freemem())

    //使用内存
    let Usingmemory = CPU.getfilesize((os.totalmem() - os.freemem()))

    //cpu
    let cpu = Circle(cpu_info)
    let [cpu_leftCircle, cpu_rightCircle] = cpu
    //ram
    let ram = Circle(MemUsage)
    let [ram_leftCircle, ram_rightCircle] = ram
    //最大mhz
    let maxspeed = CPU.getmaxspeed()
    //核心
    let hx = os.cpus().length + "核"
    let sent
    if (e.group_id) {
      sent = await redis.get(`${this.key}sendMsg:day:${this.date}`) || 0;
    } else {
      sent = await redis.get(`${this.key}sendMsg:total`) || 0;
    }
    //发送消息

    let data = {
      //路径
      tplFile: `./plugins/yenai-plugin/resources/state/state.html`,
      //头像
      portrait,
      //运行时间
      runTime: await this.statusTime(),
      //版本
      version: Version.ver,
      //地址
      dz: process.cwd(),
      //昵称
      nickname: Bot.nickname,
      //系统运行时间
      systime: Formatting(),
      //收
      recv: Bot.statistics.recv_msg_cnt,
      //发
      sent,
      //cpu占比
      cpu_leftCircle,
      cpu_rightCircle,
      cpu_info: cpu_info * 100 + "%",
      //核心
      hx,
      //最大MHZ
      maxspeed,
      //系统名
      hostname: os.type(),
      //内存使用率
      ram_leftCircle,
      ram_rightCircle,
      MemUsage: parseInt(MemUsage * 100) + "%",
      //空闲内存
      freemem,
      //已用内存
      Usingmemory,
      //nodejs运行时间
      uptime: getuptime(),
      //nodejs版本
      nodeversion: process.version,
      //网络
      // network: Object.keys(os.networkInterfaces())[0]
      //发送的图片
      // sentimg: await redis.get(`Yz:count:screenshot:day:${this.date}`) || 0
    }
    //渲染图片
    await Common.render('state/state', {
      ...data,
    }, {
      e,
      scale: 2.0
    })
  }

  async statusTime() {
    let runTime = moment().diff(moment.unix(Bot.stat.start_time), 'seconds')
    let Day = Math.floor(runTime / 3600 / 24)
    let Hour = Math.floor((runTime / 3600) % 24)
    let Min = Math.floor((runTime / 60) % 60)
    Day = Day < 10 ? "0" + Day : Day
    Hour = Hour < 10 ? "0" + Hour : Hour
    Min = Min < 10 ? "0" + Min : Min
    if (Day > 0) {
      runTime = `${Day}:${Hour}:${Min}`
    } else {
      runTime = `${Hour}:${Min}`
    }
    return runTime
  }
}

function Formatting() {
  let second = os.uptime()
  //  分
  let minute = 0
  //  小时
  let hour = 0
  //  天
  let day = 0
  //  如果秒数大于60，将秒数转换成整数
  if (second > 60) {
    //  获取分钟，除以60取整数，得到整数分钟
    minute = parseInt(second / 60)
    //  获取秒数，秒数取佘，得到整数秒数
    second = parseInt(second % 60)
    //  如果分钟大于60，将分钟转换成小时
  }
  if (minute > 60) {
    //  获取小时，获取分钟除以60，得到整数小时
    hour = parseInt(minute / 60)
    //  获取小时后取佘的分，获取分钟除以60取佘的分
    minute = parseInt(minute % 60)
    //  如果小时大于24，将小时转换成天
    if (hour > 23) {
      //  获取天数，获取小时除以24，得到整天数
      day = parseInt(hour / 24)
      //  获取天数后取余的小时，获取小时除以24取余的小时
      hour = parseInt(hour % 24)
    }
  }
  hour = hour < 10 ? "0" + hour : hour
  minute = minute < 10 ? "0" + minute : minute
  second = second < 10 ? "0" + second : second
  return day + "天 " + hour + ":" + minute + ":" + second

}

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
function getuptime() {
  let second = parseInt(process.uptime())
  let minute = 0
  let hour = 0
  if (second > 60) {
    minute = parseInt(second / 60)
    second = parseInt(second % 60)
  }
  if (minute > 60) {
    hour = parseInt(minute / 60)
    minute = parseInt(minute % 60)
  }
  hour = hour < 10 ? "0" + hour : hour
  minute = minute < 10 ? "0" + minute : minute
  second = second < 10 ? "0" + second : second
  return hour + ":" + minute + ":" + second

}
