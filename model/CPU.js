import os from 'os';
import si from 'systeminformation'
import lodash from 'lodash'
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
class OSUtils {
  constructor() {
    this.cpuUsageMSDefault = 1000; // CPU 利用率默认时间段
    this.isGPU = false;
    this.now_network = null;
    this.fsStats = null;
    this.init();
  }

  async init() {
    si.networkStats()
    setInterval(async () => {
      this.now_network = await si.networkStats()
      this.fsStats = await si.fsStats();
    }, 5000)
    if ((await si.graphics()).controllers.find(item => item.memoryUsed && item.memoryFree && item.utilizationGpu)) {
      this.isGPU = true
    }
  }




  /**---------------------------旧版代码------------------------------------------- */
  /**
  * 获取某时间段 CPU 利用率
  * @param { Number } Options.ms [时间段，默认是 1000ms，即 1 秒钟]
  * @returns { Promise }
  */
  async getCPUUsage(options) {
    const that = this;
    let cpuUsageMS = options * 1000;
    cpuUsageMS = cpuUsageMS || that.cpuUsageMSDefault;
    const t1 = that._getCPUInfo(); // t1 时间点 CPU 信息
    si.networkStats()
    await sleep(cpuUsageMS);

    const t2 = that._getCPUInfo(); // t2 时间点 CPU 信息
    const idle = t2.idle - t1.idle;
    const total = t2.total - t1.total;
    let usage = 1 - idle / total;

    return usage.toFixed(2)
  }

  //    * 获取 CPU 瞬时时间信息
  //    * @returns { Object } CPU 信息
  //    * user <number> CPU 在用户模式下花费的毫秒数。
  //    * nice <number> CPU 在良好模式下花费的毫秒数。
  //    * sys <number> CPU 在系统模式下花费的毫秒数。
  //    * idle <number> CPU 在空闲模式下花费的毫秒数。
  //    * irq <number> CPU 在中断请求模式下花费的毫秒数。

  _getCPUInfo() {
    const cpus = os.cpus();
    let user = 0, nice = 0, sys = 0, idle = 0, irq = 0, total = 0;

    for (let cpu in cpus) {
      const times = cpus[cpu].times;
      user += times.user;
      nice += times.nice;
      sys += times.sys;
      idle += times.idle;
      irq += times.irq;
    }

    total += user + nice + sys + idle + irq;

    return {
      user,
      sys,
      idle,
      total,
    }
  }

  //获取最大Mhz
  getmaxspeed() {

    let res = os.cpus()
    try {
      let max = res[0].speed
      for (let i of res) {
        if (i.speed > max) {
          i.speed > max
        }
      }
      return `最大${max}MHz`
    } catch {
      return `无法获取MHz`
    }

  }
  /**---------------------------------------------------------------------------------------- */





  /**字节转换 */
  getfilesize(size, isbtye = true, issuffix = true) {//把字节转换成正常文件大小
    if (!size) return "";
    var num = 1024.00; //byte
    if (isbtye) {
      if (size < num)
        return size.toFixed(2) + "B";
    }
    if (size < Math.pow(num, 2))
      return (size / num).toFixed(2) + `K${issuffix ? 'b' : ''}`; //kb
    if (size < Math.pow(num, 3))
      return (size / Math.pow(num, 2)).toFixed(2) + `M${issuffix ? 'b' : ''}`; //M
    if (size < Math.pow(num, 4))
      return (size / Math.pow(num, 3)).toFixed(2) + "G"; //G
    return (size / Math.pow(num, 4)).toFixed(2) + "T"; //T
  }

  /**获取nodejs内存情况 */
  getmemory() {
    let memory = process.memoryUsage()
    let rss = this.getfilesize(memory.rss);
    let heapTotal = this.getfilesize(memory.heapTotal);
    let heapUsed = this.getfilesize(memory.heapUsed);
    let occupy = (memory.rss / (os.totalmem() - os.freemem())).toFixed(2)
    return { rss, heapTotal, heapUsed, occupy }
  }

  /**
    * @description: 圆形进度条渲染
    * @param {Number} res 百分比小数
    * @return {*} css样式
  */
  Circle(res) {
    let num = (res * 360).toFixed(0)
    let color = '#90ee90'
    if (res >= 0.9) {
      color = '#d73403'
    } else if (res >= 0.8) {
      color = '#ffa500'
    }
    let leftCircle = `style=transform:rotate(-180deg);background:${color};`;
    let rightCircle = `style=background:${color};`
    if (num > 180) {
      leftCircle = `style=transform:rotate(${num}deg);background:${color};`
    } else {
      rightCircle = `style=transform:rotate(-${180 - num}deg);background:${color};`;
    }
    return [leftCircle, rightCircle]
  }

  /**获取GPU */
  async getGPU() {
    if (!this.isGPU) return ''
    try {
      let graphics = (await si.graphics()).controllers.find(item => item.memoryUsed && item.memoryFree && item.utilizationGpu)
      let { vendor, temperatureGpu, utilizationGpu, memoryTotal, memoryUsed, powerDraw } = graphics
      let GPUstyle = this.Circle(utilizationGpu / 100)
      temperatureGpu = temperatureGpu ? temperatureGpu + '℃' : ''
      powerDraw = powerDraw ? powerDraw + "W" : ""
      return `<li class="li">
            <div class="cpu">
                <div class="left">
                    <div class="left-circle" ${GPUstyle[0]}>
                    </div>
                </div>
                <div class="right">
                    <div class="right-circle" ${GPUstyle[1]}>
                    </div>
                </div>
                <div class="inner">
                    ${utilizationGpu}%
                </div>
            </div>
            <article>
                <p>GPU</p>
                <p>${vendor} ${temperatureGpu} ${powerDraw}</p>
                <p>总共 ${(memoryTotal / 1024).toFixed(2)}G</p>
                <p>已用 ${(memoryUsed / 1024).toFixed(2)}G</p>
            </article>
        </li>`
    } catch (e) {
      console.log(e);
      return ''
    }
  }

  /**
   * @description: 获取硬盘
   * @return {*}
   */
  async getfsSize(osinfo) {
    let HardDisk = ''
    let fsSize = lodash.uniqWith(await si.fsSize(), (a, b) => a.used === b.used && a.size === b.size && a.use === b.use && a.available === b.available)
    for (let i of fsSize) {
      if (!i.size || !i.used || !i.available || !i.use) continue;
      if (/docker/.test(i.mount)) continue;
      if (osinfo.arch.includes("arm") && i.mount != '/' && !/darwin/i.test(osinfo.platform)) continue;
      let color = '#90ee90'
      if (i.use >= 90) {
        color = '#d73403'
      } else if (i.use >= 70) {
        color = '#ffa500'
      }
      HardDisk +=
        `<li class='HardDisk_li'>
        <div class='word mount'>${i.mount}</div>
        <div class='progress'>
          <div class='word'>${this.getfilesize(i.used)} / ${this.getfilesize(i.size)}</div>
          <div class='current' style=width:${Math.ceil(i.use)}%;background:${color}></div>
        </div>
        <div class='percentage'>${Math.ceil(i.use)}%</div>
      </li>`
    }
    if (HardDisk) {
      //读取速率
      if (this.fsStats && this.fsStats.rx_sec && this.fsStats.wx_sec) {
        HardDisk += `<div class="speed">
        <p>传输速率</p>
        <p>读 ${this.getfilesize(this.fsStats.rx_sec, false, false)}/s 写 ${this.getfilesize(this.fsStats.wx_sec, false, false)}/s</p>
        </div>`
      }
      HardDisk = `<div class="box memory"><ul>${HardDisk}</ul></div>`
    }
    return HardDisk
  }

  /**
   * @description: 获取网速
   * @return {*}
   */
  async getnetwork() {
    try { var network = lodash.cloneDeep(this.now_network)[0] } catch { return '' }
    network.rx_sec = this.getfilesize(network.rx_sec, false, false)
    network.tx_sec = this.getfilesize(network.tx_sec, false, false)
    let networkhtml = '';
    if (network.rx_sec && network.tx_sec) {
      networkhtml =
        `<div class="speed">
        <p>${network.iface}</p>
        <p>↑${network.tx_sec}/s ↓${network.rx_sec}/s</p>
      </div>`
    }
    return networkhtml
  }
}
export default new OSUtils();