import plugin from '../../../lib/plugins/plugin.js'
import fs from 'fs'
import _ from 'lodash'
import { Config } from '../components/index.js'
import { setu, puppeteer } from '../model/index.js'
const cfgType = {
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

  全部通知: 'notificationsAll',
  删除缓存: 'deltime',
  涩涩: 'sese',
  状态: 'state',
  涩涩pro: 'sesepro',
  陌生人点赞: 'Strangers_love',
  // 给有问题的用户关闭定时器
  状态任务: 'statusTask',

  代理: 'switchProxy'
}

let managereg = new RegExp(`^#椰奶设置(${Object.keys(cfgType).join('|')})(开启|关闭)$`)
export class Setting extends plugin {
  constructor () {
    super({
      name: '椰奶配置',
      event: 'message',
      priority: 100,
      rule: [
        {
          reg: managereg,
          fnc: 'ConfigManage',
          permission: 'master'
        },
        {
          reg: '^#椰奶设置(删除缓存时间|渲染精度)(\\d+)秒?$',
          fnc: 'ConfigNumber',
          permission: 'master'
        },
        {
          reg: '^#椰奶设置$',
          fnc: 'index_Settings',
          permission: 'master'
        },
        {
          reg: '^#椰奶(sese|涩涩)设置$',
          fnc: 'SeSe_Settings',
          permission: 'master'
        },
        {
          reg: '^#椰奶(启用|禁用)全部通知$',
          fnc: 'SetAll',
          permission: 'master'
        },
        {
          reg: '^#(增加|减少|查看)头衔屏蔽词.*$',
          fnc: 'NoTitle',
          permission: 'master'
        },
        {
          reg: '^#切换头衔屏蔽词匹配(模式)?$',
          fnc: 'NoTitlepattern',
          permission: 'master'
        }
      ]
    })
  }

  // 更改配置
  async ConfigManage (e) {
    // 解析消息
    let regRet = managereg.exec(e.msg)
    let index = regRet[1]
    let yes = regRet[2] == '开启'

    // 单独处理
    if (index == '涩涩pro' && yes) Config.modify('whole', 'sese', yes)

    if (index == '涩涩' && !yes) Config.modify('whole', 'sesepro', yes)
    // 特殊处理
    if (index == '代理') {
      Config.modify('proxy', 'switchProxy', yes)
    } else {
      Config.modify('whole', cfgType[index], yes)
    }

    if (index == '涩涩' || index == '涩涩pro' || index == '代理') {
      return this.SeSe_Settings(e)
    }
    // 处理

    this.index_Settings(e)
    return true
  }

  // 设置删除缓存时间
  async ConfigNumber (e) {
    let number = e.msg.match(/\d+/)
    number = Number(number[0])
    let type = ''
    if (/渲染精度/.test(e.msg)) {
      if (number < 50) number = 50
      if (number > 200) number = 200
      type = 'renderScale'
    } else {
      if (number < 120) number = 120
      type = 'deltime'
    }
    Config.modify('whole', type, number)

    this.index_Settings(e)
  }

  // 修改全部设置
  async SetAll (e) {
    let yes = /启用/.test(e.msg)
    // 设置的任务
    let type = [
      'privateMessage',
      'groupMessage',
      'grouptemporaryMessage',
      'groupRecall',
      'PrivateRecall',
      'friendRequest',
      'groupInviteRequest',
      'addGroupApplication',
      'groupAdminChange',
      'friendNumberChange',
      'groupNumberChange',
      'groupMemberNumberChange',
      'flashPhoto',
      'botBeenBanned'
    ]

    for (let i in cfgType) {
      if (!type.includes(cfgType[i])) continue
      Config.modify('whole', cfgType[i], yes)
    }

    this.index_Settings(e)
    return true
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
    let { proxy, pixiv, bika, Notice: { sese, sesepro } } = Config
    let data = {
      sese: getStatus(sese),
      sesepro: getStatus(sesepro),
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
  async NoTitle (e) {
    let data = Config.groupTitle.Shielding_words
    if (/查看/.test(e.msg)) {
      return e.reply(`现有的头衔屏蔽词如下：${data.join('\n')}`)
    }
    let msg = e.msg.replace(/#|(增加|减少)头衔屏蔽词/g, '').trim().split(',')
    let type = /增加/.test(e.msg)
    let no = []; let yes = []
    for (let i of msg) {
      if (data.includes(i)) {
        no.push(i)
      } else {
        yes.push(i)
      }
    }
    no = _.compact(_.uniq(no))
    yes = _.compact(_.uniq(yes))
    if (type) {
      if (!_.isEmpty(yes)) {
        for (let i of yes) {
          Config.modifyarr('groupTitle', 'Shielding_words', i, 'add')
        }
        e.reply(`✅ 成功添加：${yes.join(',')}`)
      }
      if (!_.isEmpty(no)) {
        e.reply(`❎ 以下词已存在：${no.join(',')}`)
      }
    } else {
      if (!_.isEmpty(no)) {
        for (let i of no) {
          Config.modifyarr('groupTitle', 'Shielding_words', i, 'del')
        }
        e.reply(`✅ 成功删除：${no.join(',')}`)
      }
      if (!_.isEmpty(yes)) {
        e.reply(`❎ 以下词未在屏蔽词中：${yes.join(',')}`)
      }
    }
  }

  // 修改头衔匹配模式
  async NoTitlepattern (e) {
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
