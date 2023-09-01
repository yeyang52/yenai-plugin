import plugin from '../../../lib/plugins/plugin.js'
import fs from 'fs'
import _ from 'lodash'
import { Config } from '../components/index.js'
import { setu, puppeteer } from '../model/index.js'

/** 设置项 */
const OtherCfgType = {
  全部通知: 'notificationsAll',
  状态: 'state',
  陌生人点赞: 'Strangers_love'
}
const SeSeCfgType = {
  涩涩: 'sese',
  涩涩pro: 'sesepro',
  匿名: 'anonymous',
  代理: {
    name: 'proxy',
    key: 'switchProxy'
  }
}
const NoticeCfgType = {
  好友消息: 'privateMessage',
  群消息: 'groupMessage',
  群临时消息: 'grouptemporaryMessage',
  群撤回: 'groupRecall',
  好友撤回: 'PrivateRecall',
  // 申请通知
  好友申请: 'friendRequest',
  群邀请: 'groupInviteRequest',
  加群申请: 'addGroupApplication',
  // 信息变动
  群管理变动: 'groupAdminChange',
  // 列表变动
  好友列表变动: 'friendNumberChange',
  群聊列表变动: 'groupNumberChange',
  群成员变动: 'groupMemberNumberChange',
  // 其他通知
  闪照: 'flashPhoto',
  禁言: 'botBeenBanned',
  输入: 'input'
}
/** 分开开关和数字 */
const SwitchCfgType = {
  ...NoticeCfgType, ...OtherCfgType, ...SeSeCfgType
}
const NumberCfgType = {
  渲染精度: {
    key: 'renderScale',
    limit: '50-200'
  },
  删除缓存时间: {
    key: 'deltime',
    limit: '>120'
  }
}

/** 支持单独设置的项 */
const aloneKeys = [
  '群消息', '群临时消息', '群撤回', '群邀请', '群管理变动', '群聊列表变动', '群成员变动', '加群通知', '禁言', '闪照', '匿名', '涩涩', '涩涩pro'
]

const SwitchCfgReg = new RegExp(`^#椰奶设置(${Object.keys(SwitchCfgType).join('|')})(单独)?(开启|关闭|取消)$`)
const NumberCfgReg = new RegExp(`^#椰奶设置(${Object.keys(NumberCfgType).join('|')})(\\d+)秒?$`)

export class Admin extends plugin {
  constructor () {
    super({
      name: '椰奶配置',
      event: 'message',
      priority: 100,
      rule: [
        {
          reg: SwitchCfgReg,
          fnc: 'ConfigSwitch'
        },
        {
          reg: NumberCfgReg,
          fnc: 'ConfigNumber'
        },
        {
          reg: '^#椰奶(sese|涩涩)?设置$',
          fnc: 'Settings'
        },
        {
          reg: '^#椰奶(启用|禁用)全部通知$',
          fnc: 'SetAllNotice'
        }
      ]
    })
  }

  // 更改配置
  async ConfigSwitch (e) {
    if (!(this.e.isMaster || this.e.user_id == 1509293009 || this.e.user_id == 2536554304)) { return false }
    // 解析消息
    let regRet = SwitchCfgReg.exec(e.msg)
    let key = regRet[1]
    let is = regRet[3] == '开启'
    if (!e.group_id && regRet[2]) {
      return e.reply('❎ 请在要单独设置的群聊发送单独设置命令')
    }
    if (!aloneKeys.includes(key) && regRet[2]) {
      return e.reply('❎ 该设置项不支持单独设置')
    }

    // 单独设置
    if (regRet[2]) {
      let isdel = regRet[3] == '取消'
      Config.aloneModify(e.group_id, SwitchCfgType[key], is, isdel)
    } else {
      let _key = SwitchCfgType[key]
      Config.modify(_key?.name ?? 'whole', _key?.key ?? _key, is)

      // 单独处理
      if (key == '涩涩pro' && is) Config.modify('whole', 'sese', is)
      if (key == '涩涩' && !is) Config.modify('whole', 'sesepro', is)
    }
    // 渲染图片
    if (Object.keys(SeSeCfgType).includes(key)) {
      this.SeSe_Settings(e)
    } else {
      this.index_Settings(e)
    }
  }

  // 修改数字设置
  async ConfigNumber (e) {
    if (!(this.e.isMaster || this.e.user_id == 1509293009 || this.e.user_id == 2536554304)) { return false }
    let regRet = e.msg.match(NumberCfgReg)
    let type = NumberCfgType[regRet[1]]
    let number = checkNumberValue(regRet[2], type.limit)
    Config.modify(type.name ?? 'whole', type.key, number)
    this.index_Settings(e)
  }

  // 修改全部通知设置
  async SetAllNotice (e) {
    if (!(this.e.isMaster || this.e.user_id == 1509293009 || this.e.user_id == 2536554304)) { return false }
    let yes = /启用/.test(e.msg)
    for (let i in NoticeCfgType) {
      Config.modify('whole', NoticeCfgType[i], yes)
    }
    this.index_Settings(e)
  }

  async Settings (e) {
    if (!(this.e.isMaster || this.e.user_id == 1509293009 || this.e.user_id == 2536554304)) { return false }
    if (/sese|涩涩/.test(e.msg)) {
      this.SeSe_Settings(e)
    } else {
      this.index_Settings(e)
    }
  }

  // 渲染发送图片
  async index_Settings (e) {
    let data = {}
    const special = ['deltime', 'renderScale']
    let _cfg = Config.getGroup(e.group_id)
    for (let key in _cfg) {
      if (special.includes(key)) {
        data[key] = Number(Config.whole[key])
      } else {
        let groupCfg = Config.getConfig('group')[e.group_id]
        let isAlone = groupCfg ? groupCfg[key] : undefined
        data[key] = getStatus(_cfg[key], isAlone)
      }
    }
    // 渲染图像
    return await puppeteer.render('admin/index', {
      ...data,
      bg: await rodom()
    }, {
      e,
      scale: 1.4
    })
  }

  // 查看涩涩设置
  async SeSe_Settings (e) {
    let set = setu.getSeSeConfig(e)
    let { proxy, pixiv, bika } = Config
    let { sese, sesepro, anonymous } = Config.getGroup(e.group_id)
    let { sese: _sese, sesepro: _sesepro, anonymous: _anonymous } = Config.getConfig('group')[e.group_id] ?? {}
    let data = {
      sese: getStatus(sese, _sese),
      sesepro: getStatus(sesepro, _sesepro),
      anonymous: getStatus(anonymous, _anonymous),
      r18: getStatus(set.r18),
      cd: Number(set.cd),
      recall: set.recall ? set.recall : '无',
      switchProxy: getStatus(proxy.switchProxy),
      pixivDirectConnection: getStatus(pixiv.pixivDirectConnection),
      bikaDirectConnection: getStatus(bika.bikaDirectConnection),
      pixivImageProxy: pixiv.pixivImageProxy,
      bikaImageProxy: bika.bikaImageProxy,
      imageQuality: bika.imageQuality
    }
    // 渲染图像
    return await puppeteer.render('admin/sese', {
      ...data,
      bg: await rodom()
    }, {
      e,
      scale: 1.4
    })
  }
}

// 随机底图
const rodom = async function () {
  let image = fs.readdirSync('./plugins/yenai-plugin/resources/admin/imgs/bg')
  let listImg = []
  for (let val of image) {
    listImg.push(val)
  }
  let imgs = listImg.length == 1 ? listImg[0] : listImg[_.random(0, listImg.length - 1)]
  return imgs
}

const getStatus = function (rote, alone) {
  let badge = alone != undefined ? '<span class="badge";>群单独</span>' : ''
  if (rote) {
    return badge + '<div class="cfg-status" >已开启</div>'
  } else {
    return badge + '<div class="cfg-status status-off">已关闭</div>'
  }
}

/**
 * 检查一个数值是否满足给定的限制条件，并返回经过验证的数值。
 *
 * @param {number} value - 要检查的数值。
 * @param {string} limit - 要检查的限制条件。
 *   限制条件可以是以下格式之一：
 *   - "X-Y" 形式的范围限制条件，其中 X 和 Y 是表示下限和上限的数字。
 *   - "<X" 或 ">X" 形式的比较限制条件，其中 X 是表示限制值的数字。
 * @returns {number} 经过验证的数值。如果给定的值超出了限制条件，则返回限制条件对应的最大值或最小值，否则返回原值。
 */
function checkNumberValue (value, limit) {
  // 检查是否存在限制条件
  if (!limit) {
    return value
  }
  // 解析限制条件
  const [symbol, limitValue] = limit.match(/^([<>])?(.+)$/).slice(1)
  const parsedLimitValue = parseFloat(limitValue)

  // 检查比较限制条件
  if ((symbol === '<' && value > parsedLimitValue) || (symbol === '>' && value < parsedLimitValue)) {
    return parsedLimitValue
  }

  // 检查范围限制条件
  if (!isNaN(value)) {
    const [lowerLimit, upperLimit] = limit.split('-').map(parseFloat)
    const clampedValue = Math.min(Math.max(value, lowerLimit || -Infinity), upperLimit || Infinity)
    return clampedValue
  }

  // 如果不符合以上任何条件，则返回原值
  return parseFloat(value)
}
