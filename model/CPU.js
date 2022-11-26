///CPU利用率
import os from 'os';
import child_process from 'child_process'
import si from 'systeminformation'
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

class OSUtils {
  constructor() {
    this.cpuUsageMSDefault = 1000; // CPU 利用率默认时间段
  }

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
    await si.networkStats()
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
  /**字节转换 */
  getfilesize(size) {//把字节转换成正常文件大小
    if (!size) return "";
    var num = 1024.00; //byte
    if (size < num)
      return size + "B";
    if (size < Math.pow(num, 2))
      return (size / num).toFixed(2) + "Kb"; //kb
    if (size < Math.pow(num, 3))
      return (size / Math.pow(num, 2)).toFixed(2) + "Mb"; //M
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
  //win获取硬盘
  getHardDisk() {
    let stdout = child_process.execSync('wmic logicaldisk get Caption,FreeSpace,Size,VolumeSerialNumber,Description  /format:list')
    stdout = stdout.toString("utf8")
    let aDrives = [];
    var aLines = stdout.split('\r\r\n');
    var bNew = false;
    var sCaption = '', sDescription = '', sFreeSpace = '', sSize = '', sVolume = '';
    for (var i = 0; i < aLines.length; i++) {
      if (aLines[i] != '') {
        var aTokens = aLines[i].split('=');
        switch (aTokens[0]) {
          case 'Caption':
            sCaption = aTokens[1];
            bNew = true;
            break;
          case 'Description':
            sDescription = aTokens[1];
            break;
          case 'FreeSpace':
            sFreeSpace = aTokens[1];
            break;
          case 'Size':
            sSize = aTokens[1];
            break;
          case 'VolumeSerialNumber':
            sVolume = aTokens[1];
            break;
        }

      } else {
        // Empty line 
        // If we get an empty line and bNew is true then we have retrieved
        // all information for one drive, add to array and reset variables
        if (bNew) {
          sSize = parseFloat(sSize);
          if (isNaN(sSize)) {
            sSize = 0;
          }
          sFreeSpace = parseFloat(sFreeSpace);
          if (isNaN(sFreeSpace)) {
            sFreeSpace = 0;
          }

          var sUsed = (sSize - sFreeSpace);
          var sPercent = '0%';
          if (sSize != '' && parseFloat(sSize) > 0) {
            sPercent = Math.round((parseFloat(sUsed) / parseFloat(sSize)) * 100) + '%';
          }
          aDrives[aDrives.length] = {
            filesystem: sDescription,
            blocks: sSize,
            used: sUsed,
            available: sFreeSpace,
            capacity: sPercent,
            mounted: sCaption
          };
          bNew = false;
          sCaption = ''; sDescription = ''; sFreeSpace = ''; sSize = ''; sVolume = '';
        }

      }
    }
    return aDrives;

  }
}
export default new OSUtils();