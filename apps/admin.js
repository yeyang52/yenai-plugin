import plugin from '../../../lib/plugins/plugin.js'
import fs from 'fs'
import _ from 'lodash'
import { Config } from '../components/index.js'
import { setu, puppeteer } from '../model/index.js'
const OtherCfgType = {
  全部通知: 'notificationsAll',
  状态: 'state',
  陌生人点赞: 'Strangers_love',
  // 给有问题的用户关闭定时器
  状态任务: 'statusTask'
}
const SeSeCfgType = {
  涩涩: 'sese',
  涩涩pro: 'sesepro',
  匿名: 'anonymous',
  代理: 'switchProxy'
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
const SwitchCfgType = { ...NoticeCfgType, ...OtherCfgType, ...SeSeCfgType }
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

const SwitchCfgReg = new RegExp(`^#椰奶设置(${Object.keys(SwitchCfgType).join('|')})(单独)?(开启|关闭)$`)

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
          fnc: 'ConfigSwitch',
          permission: 'master'
        },
        {
          reg: NumberCfgReg,
          fnc: 'ConfigNumber',
          permission: 'master'
        },
        {
          reg: '^#椰奶(sese|涩涩)?设置$',
          fnc: 'Settings',
          permission: 'master'
        },
        {
          reg: '^#椰奶(启用|禁用)全部通知$',
          fnc: 'SetAllNotice',
          permission: 'master'
        },
        {
          reg: '^#(增加|减少|查看)头衔屏蔽词.*$',
          fnc: 'ProhibitedTitle',
          permission: 'master'
        },
        {
          reg: '^#切换头衔屏蔽词匹配(模式)?$',
          fnc: 'ProhibitedTitlePattern',
          permission: 'master'
        }
      ]
    })
  }

  // 更改配置
  async ConfigSwitch (e) {
    // 解析消息
    let regRet = SwitchCfgReg.exec(e.msg)
    let index = regRet[1]
    let yes = regRet[3] == '开启'

    // 单独处理
    if (index == '涩涩pro' && yes) Config.modify('whole', 'sese', yes)

    if (index == '涩涩' && !yes) Config.modify('whole', 'sesepro', yes)

    if (regRet[2]) {
      if (!e.group_id) return e.reply('❎ 请在要单独设置的群聊发送单独设置命令')
      Config.aloneModify(e.group_id, SwitchCfgType[index], yes)
      return e.reply('✅')
    }
    // 特殊处理
    if (index == '代理') {
      Config.modify('proxy', 'switchProxy', yes)
    } else {
      Config.modify('whole', SwitchCfgType[index], yes)
    }
    if (Object.keys(SeSeCfgType).includes(index)) {
      return this.SeSe_Settings(e)
    }
    // 渲染图片
    this.index_Settings(e)
  }

  // 修改数字设置
  async ConfigNumber (e) {
    let regRet = e.msg.match(NumberCfgReg)
    let type = NumberCfgType[regRet[1]]
    let number = checkNumberValue(regRet[2], type.limit)
    Config.modify(type.name ?? 'whole', type.key, number)
    this.index_Settings(e)
  }

  // 修改全部通知设置
  async SetAllNotice (e) {
    let yes = /启用/.test(e.msg)
    for (let i in NoticeCfgType) {
      Config.modify('whole', NoticeCfgType[i], yes)
    }
    this.index_Settings(e)
  }

  async Settings (e) {
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
    for (let key in Config.Notice) {
      if (special.includes(key)) {
        data[key] = Number(Config.Notice[key])
      } else {
        data[key] = getStatus(Config.Notice[key])
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
    let data = {
      sese: getStatus(sese),
      sesepro: getStatus(sesepro),
      anonymous: getStatus(anonymous),
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

  // 增删查头衔屏蔽词
  async ProhibitedTitle (e) {
  // 获取现有的头衔屏蔽词
    let shieldingWords = Config.groupTitle.Shielding_words
    // 判断是否需要查看头衔屏蔽词
    if (/查看/.test(e.msg)) {
    // 返回已有的头衔屏蔽词列表
      return e.reply(`现有的头衔屏蔽词如下：${shieldingWords.join('\n')}`)
    }

    // 获取用户输入的要增加或删除的屏蔽词
    let message = e.msg.replace(/#|(增加|减少)头衔屏蔽词/g, '').trim().split(',')
    // 判断用户是要增加还是删除屏蔽词
    let isAddition = /增加/.test(e.msg)
    let existingWords = []
    let newWords = []

    // 遍历用户输入的屏蔽词，区分已有和新的屏蔽词
    for (let word of message) {
      if (shieldingWords.includes(word)) {
        existingWords.push(word)
      } else {
        newWords.push(word)
      }
    }

    // 去重
    existingWords = _.compact(_.uniq(existingWords))
    newWords = _.compact(_.uniq(newWords))

    // 判断是要增加还是删除屏蔽词
    if (isAddition) {
    // 添加新的屏蔽词
      if (!_.isEmpty(newWords)) {
        for (let word of newWords) {
          Config.modifyarr('groupTitle', 'Shielding_words', word, 'add')
        }
        e.reply(`✅ 成功添加：${newWords.join(',')}`)
      }
      // 提示已有的屏蔽词
      if (!_.isEmpty(existingWords)) {
        e.reply(`❎ 以下词已存在：${existingWords.join(',')}`)
      }
    } else {
    // 删除已有的屏蔽词
      if (!_.isEmpty(existingWords)) {
        for (let word of existingWords) {
          Config.modifyarr('groupTitle', 'Shielding_words', word, 'del')
        }
        e.reply(`✅ 成功删除：${existingWords.join(',')}`)
      }
      // 提示不在屏蔽词中的词
      if (!_.isEmpty(newWords)) {
        e.reply(`❎ 以下词未在屏蔽词中：${newWords.join(',')}`)
      }
    }
  }

  // 修改头衔匹配模式
  async ProhibitedTitlePattern (e) {
    let data = Config.groupTitle.Match_pattern ? 0 : 1
    Config.modify('groupTitle', 'Match_pattern', data)
    e.reply(`✅ 已修改匹配模式为${data ? '精确' : '模糊'}匹配`)
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

const getStatus = function (rote) {
  if (rote) {
    return '<div class="cfg-status" >已开启</div>'
  } else {
    return '<div class="cfg-status status-off">已关闭</div>'
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
