import common from '../../../lib/common/common.js'
import Config from '../components/Config.js'
import child_process from 'child_process'
import setu from './setu.js'

export default new class newCommon {
  /**
     * @description: 延时函数
     * @param {*} ms 时间(毫秒)
     */
  sleep (ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /** 发消息 */
  async sendMasterMsg (msg) {
    if (Config.Notice.notificationsAll) {
      // 发送全部管理
      for (let index of Config.masterQQ) {
        await common.relpyPrivate(index, msg)
        await this.sleep(5000)
      }
    } else {
      // 发给第一个管理
      await common.relpyPrivate(Config.masterQQ[0], msg)
    }
  }

  /**
     * @description: 秒转换返回对象
     * @param {Number} time  秒数
     * @param {boolean} repair  是否需要补零
     * @return {object} 包含天，时，分，秒
     */
  getsecond (time, repair) {
    let second = parseInt(time)
    let minute = 0
    let hour = 0
    let day = 0
    if (second > 60) {
      minute = parseInt(second / 60)
      second = parseInt(second % 60)
    }
    if (minute > 60) {
      hour = parseInt(minute / 60)
      minute = parseInt(minute % 60)
    }
    if (hour > 23) {
      day = parseInt(hour / 24)
      hour = parseInt(hour % 24)
    }
    if (repair) {
      hour = hour < 10 ? '0' + hour : hour
      minute = minute < 10 ? '0' + minute : minute
      second = second < 10 ? '0' + second : second
    }
    return {
      day,
      hour,
      minute,
      second
    }
  }

  /**
     * @description: //发送转发消息
     * @param {*} e oicq
     * @param {Array} message 发送的消息
     * @param {Object} data 发送的消息
     * @param {Number} data.recallMsg  撤回时间
     * @param {Boolean} data.isBot 转发信息是否以bot信息发送
     * @param {String} data.fkmsg 风控消息不传则默认消息
     * @param {Boolean} data.isxml 是否处理卡片
     * @return {Object} 消息是否发送成功的对象
     */
  async getforwardMsg (e, message, { recallMsg = 0, isBot = true, fkmsg = '', isxml = false } = {}) {
    let forwardMsg = []
    for (let i of message) {
      forwardMsg.push(
        {
          message: i,
          nickname: isBot ? Bot.nickname : e.sender.card || e.sender.nickname,
          user_id: isBot ? Bot.uin : e.sender.user_id
        }
      )
    }
    // 发送
    if (e.isGroup) {
      forwardMsg = await e.group.makeForwardMsg(forwardMsg)
    } else {
      forwardMsg = await e.friend.makeForwardMsg(forwardMsg)
    }
    if (isxml) {
      // 处理转发卡片
      forwardMsg.data = forwardMsg.data
        .replace('<?xml version="1.0" encoding="utf-8"?>', '<?xml version="1.0" encoding="utf-8" ?>')
        .replace(/\n/g, '')
        .replace(/<title color="#777777" size="26">(.+?)<\/title>/g, '___')
        .replace(/___+/, '<title color="#777777" size="26">涩批(//// ^ ////)</title>')
    }
    // 发送消息
    let res = await e.reply(forwardMsg, false, { recallMsg })
    if (!res) await e.reply(fkmsg || '消息发送失败，可能被风控')
    return res
  }

  /**
     * @description: 发送普通消息并根据指定时间撤回群消息
     * @param {*} e oicq
     * @param {*} msg 消息
     * @param {Number} time 撤回时间
     * @param {Boolean} fkmsg 风控消息
     * @return {*}
     */
  async recallsendMsg (e, msg, time = setu.getRecallTime(e.group_id), fkmsg = '') {
    // 发送消息
    let res = await e.reply(msg, false, { recallMsg: time })
    if (!res) await e.reply(fkmsg || '消息发送失败，可能被风控')
    return res
  }

  /**
     * @description: 获取配置的撤回时间发送转发消息
     * @param {*} e oicq
     * @param {Array} msg 发送的消息
     * @param {String} fkmsg  风控消息
     * @return {Object} 消息是否发送成功的对象
     */
  async getRecallsendMsg (e, msg, fkmsg = '') {
    let recalltime = setu.getRecallTime(e.group_id)
    return await this.getforwardMsg(e, msg, {
      recallMsg: recalltime,
      isBot: false,
      fkmsg,
      isxml: true
    })
  }

  /**
     * @description: 取cookie
     * @param {String} data 如：qun.qq.com
     * @return {Object}
     */
  getck (data, transformation) {
    let cookie = Bot.cookies[data]
    let ck = cookie.replace(/=/g, '":"').replace(/;/g, '","').replace(/ /g, '').trim()
    ck = ck.substring(0, ck.length - 2)
    ck = JSON.parse('{"'.concat(ck).concat('}'))
    if (transformation) {
      let arr = []
      for (let i in ck) {
        arr.push({
          name: i,
          value: ck[i],
          domain: data,
          path: '/',
          expires: Date.now() + 3600 * 1000
        })
      }
      return arr
    } else return ck
  }

  /** 默认秒转换格式 */
  getsecondformat (value) {
    let time = this.getsecond(value)

    let { second, minute, hour, day } = time
    // 处理返回消息
    let result = ''
    if (second != 0) {
      result = parseInt(second) + '秒'
    }
    if (minute > 0) {
      result = parseInt(minute) + '分' + result
    }
    if (hour > 0) {
      result = parseInt(hour) + '小时' + result
    }
    if (day > 0) {
      result = parseInt(day) + '天' + result
    }
    return result
  }

  /**
     * @description: 使用JS将数字从汉字形式转化为阿拉伯形式
     * @param {string} s_123
     * @return {number}
     */
  translateChinaNum (s_123) {
    if (!s_123 && s_123 != 0) return s_123
    // 如果是纯数字直接返回
    if (/^\d+$/.test(s_123)) return Number(s_123)
    // 字典
    let map = new Map()
    map.set('一', 1)
    map.set('壹', 1) // 特殊
    map.set('二', 2)
    map.set('两', 2) // 特殊
    map.set('三', 3)
    map.set('四', 4)
    map.set('五', 5)
    map.set('六', 6)
    map.set('七', 7)
    map.set('八', 8)
    map.set('九', 9)
    // 按照亿、万为分割将字符串划分为三部分
    let split = ''
    split = s_123.split('亿')
    let s_1_23 = split.length > 1 ? split : ['', s_123]
    let s_23 = s_1_23[1]
    let s_1 = s_1_23[0]
    split = s_23.split('万')
    let s_2_3 = split.length > 1 ? split : ['', s_23]
    let s_2 = s_2_3[0]
    let s_3 = s_2_3[1]
    let arr = [s_1, s_2, s_3]

    // -------------------------------------------------- 对各个部分处理 --------------------------------------------------
    arr = arr.map(item => {
      let result = ''
      result = item.replace('零', '')
      // [ '一百三十二', '四千五百', '三千二百一十三' ] ==>
      let reg = new RegExp(`[${Array.from(map.keys()).join('')}]`, 'g')
      result = result.replace(reg, substring => {
        return map.get(substring)
      })
      // [ '1百3十2', '4千5百', '3千2百1十3' ] ==> ['0132', '4500', '3213']
      let temp
      temp = /\d(?=千)/.exec(result)
      let num1 = temp ? temp[0] : '0'
      temp = /\d(?=百)/.exec(result)
      let num2 = temp ? temp[0] : '0'
      temp = /\d?(?=十)/.exec(result)
      let num3
      if (temp === null) { // 说明没十：一百零二
        num3 = '0'
      } else if (temp[0] === '') { // 说明十被简写了：十一
        num3 = '1'
      } else { // 正常情况：一百一十一
        num3 = temp[0]
      }
      temp = /\d$/.exec(result)
      let num4 = temp ? temp[0] : '0'
      return num1 + num2 + num3 + num4
    })
    // 借助parseInt自动去零
    return parseInt(arr.join(''))
  }

  /**
     * @description: Promise执行exec
     * @param {String} cmd
     * @return {*}
     */
  async execSync (cmd) {
    return new Promise((resolve, reject) => {
      child_process.exec(cmd, (error, stdout, stderr) => {
        resolve({ error, stdout, stderr })
      })
    })
  }

  // 时间单位
  get Time_unit () {
    return {
      毫秒: 0.001,
      秒: 1,
      S: 1,
      SECOND: 1,
      分: 60,
      分钟: 60,
      M: 60,
      MIN: 60,
      MINUTE: 60,
      时: 3600,
      小时: 3600,
      H: 3600,
      HOUR: 3600,
      天: 86400,
      日: 86400,
      D: 86400,
      DAY: 86400,
      周: 604800,
      W: 604800,
      WEEK: 604800,
      月: 2592000,
      MONTH: 2592000,
      年: 31536000,
      Y: 31536000,
      YEAR: 31536000
    }
  }

  /** 登录设备 */
  get platform () {
    return {
      1: '安卓手机',
      2: 'aPad',
      3: '安卓手表',
      4: 'MacOS',
      5: 'iPad'
    }
  }

  /** 在线状态 */
  get status () {
    return {
      31: '离开',
      50: '忙碌',
      70: '请勿打扰',
      41: '隐身',
      11: '我在线上',
      60: 'Q我吧'
    }
  }

  // 权限
  get ROLE_MAP () {
    return {
      admin: '群管理',
      owner: '群主',
      member: '群员'
    }
  }
}()
