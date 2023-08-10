import child_process from 'child_process'
import common from '../../../../lib/common/common.js'
import Config from '../../components/Config.js'
import setu from '../../model/setu.js'
import moment from 'moment'
import _ from 'lodash'

// 涩涩未开启文案
const SWITCH_ERROR = '主人没有开放这个功能哦(＊／ω＼＊)'

export default new class {
  /**
     * @description: 延时函数
     * @param {*} ms 时间(毫秒)
     */
  sleep (ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * 判断用户权限
   * @param {*} e - 接收到的事件对象
   * @param {'master'|'admin'|'owner'|'all'} [permission='all'] - 命令所需的权限
   * @param {'admin'|'owner'|'all'} [role='all'] - 用户的权限
   * @return {boolean} - 是否具有权限
   */
  checkPermission (e, permission = 'all', role = 'all') {
    if (role == 'owner' && !e.group.is_owner) {
      e.reply('我连群主都木有，这种事怎么可能做到的辣！！！', true)
      return false
    } else if (role == 'admin' && !e.group.is_admin && !e.group.is_owner) {
      e.reply('我连管理员都木有，这种事怎么可能做到的辣！！！', true)
      return false
    }
    // 判断权限
    if (e.isMaster) return true
    if (permission == 'master' && !e.isMaster) {
      e.reply('❎ 该命令仅限主人可用', true)
      return false
    } else if (permission == 'owner' && !e.member.is_owner) {
      e.reply('❎ 该命令仅限群主可用', true)
      return false
    } else if (permission == 'admin' && !e.member.is_admin && !e.member.is_owner) {
      e.reply('❎ 该命令仅限管理可用')
      return false
    }
    return true
  }

  /**
   * @description: 判断涩涩权限
   * @param {object} e oicq事件对象
   * @param {'sesse'|'sesepro'} type 权限类型
   * @return {boolean}
   */
  checkSeSePermission (e, type = 'sese') {
    if (e.isMaster) return true
    const { sese, sesepro } = Config.getGroup(e.group_id)
    if (type == 'sese' && !sese && !sesepro) {
      e.reply(SWITCH_ERROR)
      return false
    }
    if (type == 'sesepro' && !sesepro) {
      e.reply(SWITCH_ERROR)
      return false
    }
    return true
  }

  /** 给主人发消息 */
  async sendMasterMsg (msg) {
    if (Config.whole.notificationsAll) {
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
   * 格式化时间
   * @param {number} time - 时间戳，以秒为单位
   * @param {string|function} format - 时间格式，'default'为默认格式，'dd'表示天数，'hh'表示小时数，'mm'表示分钟数，'ss'表示秒数，也可以传入自定义函数
   * @param {boolean} [repair=true] - 是否在小时数、分钟数、秒数小于10时补0
   * @returns {(string|object)} 根据format参数返回相应的时间格式字符串或者时间对象{day, hour, minute, second}
   */
  formatTime (time, format, repair = true) {
    const second = parseInt(time % 60)
    const minute = parseInt((time / 60) % 60)
    const hour = parseInt((time / (60 * 60)) % 24)
    const day = parseInt(time / (24 * 60 * 60))
    const timeObj = {
      day,
      hour: repair && hour < 10 ? `0${hour}` : hour,
      minute: repair && minute < 10 ? `0${minute}` : minute,
      second: repair && second < 10 ? `0${second}` : second
    }
    if (format == 'default') {
      let result = ''

      if (day > 0) {
        result += `${day}天`
      }
      if (hour > 0) {
        result += `${timeObj.hour}小时`
      }
      if (minute > 0) {
        result += `${timeObj.minute}分`
      }
      if (second > 0) {
        result += `${timeObj.second}秒`
      }
      return result
    }

    if (typeof format === 'string') {
      format = format
        .replace(/dd/g, day)
        .replace(/hh/g, timeObj.hour)
        .replace(/mm/g, timeObj.minute)
        .replace(/ss/g, timeObj.second)

      return format
    }

    if (typeof format === 'function') {
      return format(timeObj)
    }

    return timeObj
  }

  /**
   * 发送转发消息
   * @async
   * @param {object} e - 发送消息的目标对象
   * @param {array<any[]>} message - 发送的消息数组，数组每一项为转发消息的一条消息
   * @param {object} [options] - 发送消息的配置项
   * @param {number} [options.recallMsg=0] - 撤回时间，单位秒，默认为0表示不撤回
   * @param {object} [options.info] - 转发发送人信息
   * @param {string} [options.info.nickname] - 转发人昵称
   * @param {number} [options.info.user_id] - 转发人QQ
   * @param {string|array} [options.fkmsg] - 风控消息，不传则默认消息
   * @param {Boolean} [options.isxml] - 处理卡片
   * @param {Boolean} [options.xmlTitle] - XML 标题
   * @param {Boolean} [options.oneMsg] - 用于只有一条消息，不用再转成二维数组
   * @param {Boolean|import('icqq').Anonymous} [options.anony] - 匿名消息，若为true则发送匿名消息
   * @param {Boolean} [options.shouldSendMsg=true] - 是否直接发送消息，true为直接发送，否则返回需要发送的消息
   * @returns {Promise<import('icqq').MessageRet|import('icqq').XmlElem|import('icqq').JsonElem>} 消息发送结果的Promise对象
   */
  async getforwardMsg (e, message, {
    recallMsg = 0,
    info,
    fkmsg,
    isxml,
    xmlTitle,
    oneMsg,
    anony,
    shouldSendMsg = true
  } = {}) {
    let forwardMsg = []
    if (_.isEmpty(message)) throw Error('[Yenai-Plugin][sendforwardMsg][Error]发送的转发消息不能为空')
    let add = (msg) => forwardMsg.push(
      {
        message: msg,
        nickname: info?.nickname ?? (e.bot ?? Bot).nickname,
        user_id: info?.user_id ?? (e.bot ?? Bot).uin
      }
    )
    oneMsg ? add(message) : message.forEach(item => add(item))
    // 发送
    if (e.isGroup) {
      forwardMsg = await e.group.makeForwardMsg(forwardMsg)
    } else {
      forwardMsg = await e.friend.makeForwardMsg(forwardMsg)
    }

    if (isxml && typeof (forwardMsg.data) !== 'object') {
      // 处理转发卡片
      forwardMsg.data = forwardMsg.data.replace('<?xml version="1.0" encoding="utf-8"?>', '<?xml version="1.0" encoding="utf-8" ?>')
    }

    if (xmlTitle) {
      if (typeof (forwardMsg.data) === 'object') {
        let detail = forwardMsg.data?.meta?.detail
        if (detail) {
          detail.news = [{ text: xmlTitle }]
        }
      } else {
        forwardMsg.data = forwardMsg.data
          .replace(/\n/g, '')
          .replace(/<title color="#777777" size="26">(.+?)<\/title>/g, '___')
          .replace(/___+/, `<title color="#777777" size="26">${xmlTitle}</title>`)
      }
    }
    if (shouldSendMsg) {
      let msgRes = await this.reply(e, forwardMsg, false, {
        anony,
        fkmsg,
        recallMsg
      })
      return msgRes
    } else {
      return forwardMsg
    }
  }

  /**
    * 发送消息
    *
    * @async
    * @param {*} e oicq 事件对象
    * @param {Array|String} msg 消息内容
    * @param {Boolean} quote 是否引用回复
    * @param {Object} data 其他参数
    * @param {Number} data.recallMsg 撤回时间
    * @param {Boolean} data.fkmsg 风控消息
    * @param {Boolean | import('icqq').Anonymous} data.anony 匿名消息
    * @param {Boolean | Number} data.at 是否艾特该成员
    * @returns {Promise<import('icqq').MessageRet>} 返回发送消息后的结果对象
    */
  async reply (e, msg, quote, {
    recallMsg = 0,
    fkmsg = '',
    at = false,
    anony
  } = {}) {
    if (at && e.isGroup) {
      let text = ''
      if (e?.sender?.card) {
        text = _.truncate(e.sender.card, { length: 10 })
      }
      if (at === true) {
        at = Number(e.user_id)
      } else if (!isNaN(at)) {
        let info = e.group.pickMember(at).info
        text = info?.card ?? info?.nickname
        text = _.truncate(text, { length: 10 })
      }

      if (Array.isArray(msg)) {
        msg = [segment.at(at, text), ...msg]
      } else {
        msg = [segment.at(at, text), msg]
      }
    }

    let msgRes = null
    // 发送消息
    if (e.isGroup) {
      // 判断是否开启匿名
      if (anony) {
        let getAnonyInfo = await e.group.getAnonyInfo()
        if (!getAnonyInfo.enable) {
          e.reply('[警告]该群未开启匿名，请启用匿名再使用匿名功能')
          anony = false
        }
      }
      msgRes = await e.group.sendMsg(msg, quote ? e : undefined, anony)
    } else {
      msgRes = await e.reply(msg, quote)
      if (!msgRes) await e.reply(fkmsg || '消息发送失败，可能被风控')
    }
    if (recallMsg > 0 && msgRes?.message_id) {
      if (e.isGroup) {
        setTimeout(() => e.group.recallMsg(msgRes.message_id), recallMsg * 1000)
      } else if (e.friend) {
        setTimeout(() => e.friend.recallMsg(msgRes.message_id), recallMsg * 1000)
      }
    }
    return msgRes
  }

  /**
   * @description: 获取配置的撤回事件和匿名发送普通消息
   * @param {*} e oicq
   * @param {Array|String} msg 消息
   * @param {Boolean} quote 是否引用回复
   * @param {Object} data 其他参数
   * @param {Number} data.recallMsg 撤回时间
   * @param {Boolean} data.fkmsg 风控消息
   * @param {Boolean | import('icqq').Anonymous} data.anony 匿名消息
   * @return {Promise<import('icqq').MessageRet>}
   */
  async recallsendMsg (e, msg, quote, data = {}) {
    let recallMsg = setu.getRecallTime(e.group_id)
    let anony = Config.getGroup(e.group_id).anonymous
    let msgRes = this.reply(e, msg, quote, {
      recallMsg,
      anony,
      ...data
    })
    return msgRes
  }

  /**
   * 转发消息并根据权限撤回
   * @async
   * @param {Object} e - 反馈的对象
   * @param {string|Object} msg - 要发送的消息字符串或对象
   * @param {Object} [data={}] - 附加的数据对象
   * @param {number} [data.recallMsg] - 消息撤回时间
   * @param {Object} [data.info] - 附加消息信息
   * @param {string} [data.info.nickname] - 用户昵称
   * @param {number} [data.info.user_id] - 用户ID
   * @param {boolean} [data.isxml=true] - 是否特殊处理转发消息
   * @param {string} [data.xmlTitle] - XML 标题
   * @param {Object} [data.anony] - 附加的匿名数据对象
   * @returns {Promise<any>} - Promise 对象，返回函数 `getforwardMsg()` 的返回值
   */
  async recallSendForwardMsg (e, msg, data = {}) {
    let recalltime = setu.getRecallTime(e.group_id)
    let anony = Config.whole.anonymous
    return await this.getforwardMsg(e, msg, {
      recallMsg: recalltime,
      info: {
        nickname: '🐔🏀',
        user_id: 2854196306
      },
      isxml: true,
      xmlTitle: e.logFnc + e.msg,
      anony,
      ...data
    })
  }

  /**
   * @description: 设置每日次数限制
   * @param {Number} userId QQ
   * @param {String} key
   * @param {Number} maxlimit 最大限制
   * @return {Prmoise<Boolean>}
   */
  async limit (userId, key, maxlimit) {
    if (maxlimit <= 0) return true
    let redisKey = `yenai:${key}:limit:${userId}`
    let nowNum = await redis.get(redisKey)
    if (nowNum > maxlimit) return false
    if (!nowNum) {
      await redis.set(redisKey, 1, { EX: moment().add(1, 'days').startOf('day').diff(undefined, 'second') })
    } else {
      await redis.incr(redisKey)
    }
    return true
  }

  /**
   * @description: 取cookie
   * @param {string} data 如：qun.qq.com
   * @param {object} [bot] Bot对象适配e.bot
   * @param {boolean} [transformation] 转换为Puppeteer浏览器使用的ck
   * @return {object}
   */
  getck (data, bot = Bot, transformation) {
    let cookie = bot.cookies[data]
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

  /**
   * 判断一个对象或数组中的所有值是否为空。
   *
   * @param {Object|Array} data - 需要检查的对象或数组。
   * @param {Array} omits - 需要忽略的属性列表。默认为空数组，表示不忽略任何属性。
   * @returns {boolean} - 如果对象或数组中的所有值都是空值，则返回 true；否则返回 false。
   */
  checkIfEmpty (data, omits) {
    const filteredData = _.omit(data, omits)
    return _.every(filteredData, (value) =>
      _.isPlainObject(value) ? this.checkIfEmpty(value) : _.isEmpty(value))
  }

  /**
   * 处理异常并返回错误消息。
   *
   * @param {object} e - 事件对象。
   * @param {Error} ErrorObj - 要检查的错误对象。
   * @param {Object} options - 可选参数。
   * @param {string} options.MsgTemplate - 错误消息的模板。
   * @return {Porimse<import('icqq').MessageRet>|false} 如果 ErrorObj 不是 Error 的实例，则返回 false；否则返回oicq消息返回值。
   */
  handleException (e, ErrorObj, { MsgTemplate } = {}) {
    if (!(ErrorObj instanceof Error)) return false
    let ErrMsg = ''
    if (ErrorObj.name == 'Error') {
      ErrMsg = ErrorObj.message
    } else {
      ErrMsg = ErrorObj.stack
      logger.error(ErrorObj)
    }
    ErrMsg = MsgTemplate ? MsgTemplate.replace('{error}', ErrMsg) : ErrMsg
    return e.reply(ErrMsg)
  }
}()
