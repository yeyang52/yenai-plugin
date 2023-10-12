import _ from 'lodash'
import moment from 'moment'
import { Config } from '../../components/index.js'
import { common, GroupAdmin as Ga, puppeteer, QQApi, GroupBannedWords } from '../../model/index.js'
import cronValidate from '../../tools/cronValidate.js'
import { Time_unit } from '../../constants/other.js'
// API请求错误文案
const API_ERROR = '❎ 出错辣，请稍后重试'
// 正则
const Numreg = '[零一壹二两三四五六七八九十百千万亿\\d]+'
const TimeUnitReg = Object.keys(Time_unit).join('|')

/** 清理多久没发言的人正则 */
const noactivereg = new RegExp(`^#(查看|清理|确认清理|获取)(${Numreg})个?(${TimeUnitReg})没发言的人(第(${Numreg})页)?$`)
/** 我要自闭正则 */
const Autisticreg = new RegExp(`^#?我要(自闭|禅定)(${Numreg})?个?(${TimeUnitReg})?$`, 'i')
// 获取定时任务
const redisTask = await Ga.getRedisMuteTask() || false
export class GroupAdmin extends plugin {
  constructor () {
    super({
      name: '椰奶群管',
      event: 'message.group',
      priority: 500,
      rule: [
        {
          reg: `^#禁言\\s?((\\d+)\\s)?(${Numreg})?(${TimeUnitReg})?$`,
          fnc: 'muteMember'
        },
        {
          reg: '^#解禁(\\d+)?$',
          fnc: 'noMuteMember'
        },
        {
          reg: '^#全体(禁言|解禁)$',
          fnc: 'muteAll'
        },
        {
          reg: '^#踢(\\d+)?$',
          fnc: 'kickMember'
        },
        {
          reg: '^#(设置|取消)管理(\\d+)?$',
          fnc: 'SetAdmin'
        },
        {
          reg: '^#(允许|禁止|开启|关闭)匿名$',
          fnc: 'AllowAnony'
        },
        {
          reg: '^#发群公告',
          fnc: 'AddAnnounce'
        },
        {
          reg: '^#删群公告(\\d+)$',
          fnc: 'DelAnnounce'
        },
        {
          reg: '^#查群公告$',
          fnc: 'GetAnnounce'
        },
        {
          reg: '^#修改头衔',
          fnc: 'adminsetTitle'
        },
        {
          reg: '^#申请头衔',
          fnc: 'SetGroupSpecialTitle'
        },
        {
          reg: '^#(查)?(幸运)?字符(列表)?$',
          fnc: 'qun_luckylist'
        },
        {
          reg: '^#抽(幸运)?字符$',
          fnc: 'qun_lucky'
        },
        {
          reg: '^#替换(幸运)?字符(\\d+)$',
          fnc: 'qun_luckyuse'
        },
        {
          reg: '^#(开启|关闭)(幸运)?字符$',
          fnc: 'qun_luckyset'
        },
        {
          reg: '^#(获取|查看)?禁言列表$',
          fnc: 'Mutelist'
        },
        {
          reg: '^#解除全部禁言$',
          fnc: 'relieveAllMute'
        },
        {
          reg: `^#(查看|(确认)?清理)从未发言过?的人(第(${Numreg})页)?$`,
          fnc: 'neverspeak'
        },
        {
          reg: `^#(查看|获取)?(不活跃|潜水)排行榜(${Numreg})?$`,
          fnc: 'RankingList'
        },
        {
          reg: `^#(查看|获取)?最近的?入群(情况|记录)(${Numreg})?$`,
          fnc: 'RankingList'
        },
        {
          reg: noactivereg, // 清理多久没发言的人
          fnc: 'noactive'
        },
        {
          reg: '^#发通知',
          fnc: 'Send_notice'
        },
        {
          reg: '^#(设置)?定时(禁言|解禁)(.*)$|^#定时禁言任务$|^#取消定时(禁言|解禁)$',
          fnc: 'timeMute'
        },
        {
          reg: '^#(查看|获取)?群?发言(榜单|排行)((7|七)天)?',
          fnc: 'SpeakRank'
        },
        {
          reg: '^#?(谁|哪个吊毛|哪个屌毛|哪个叼毛)是龙王$',
          fnc: 'dragonKing'
        },
        {
          reg: '^#群星级$',
          fnc: 'Group_xj'
        },
        {
          reg: '^#群数据((7|七)天)?$',
          fnc: 'groupData'
        },
        {
          reg: '^#今日打卡$',
          fnc: 'DaySigned'
        },
        {
          reg: Autisticreg, // 我要自闭
          fnc: 'Autistic'
        },
        {
          reg: '^#((今|昨|前|明|后)天|\\d{4}-\\d{1,2}-\\d{1,2})谁生日$',
          fnc: 'groupBirthday'
        },
        {
          reg: '^#?(开启|关闭)加群通知$',
          fnc: 'handleGroupAdd'
        },
        {
          reg: '^#?(加|设|移)精$',
          fnc: 'essenceMessage'
        }
      ]
    })
    this.task = redisTask
  }

  get Bot () {
    return this.e.bot ?? Bot
  }

  /** 禁言 */
  async muteMember (e) {
    if (!(this.e.isMaster || this.e.user_id == 1509293009 || this.e.user_id == 2536554304)) { return true }
    let qq = e.message.find(item => item.type == 'at')?.qq
    let reg = `#禁言\\s?((\\d+)\\s)?(${Numreg})?(${TimeUnitReg})?`
    let regRet = e.msg.match(new RegExp(reg))
    const time = common.translateChinaNum(regRet[3])
    new Ga(e).muteMember(
      e.group_id, qq ?? regRet[2], e.user_id, time, regRet[4]
    ).then(res => e.reply(res))
      .catch(err => common.handleException(e, err))
  }

  /** 解禁 */
  async noMuteMember (e) {
    if (!(this.e.isMaster || this.e.user_id == 1509293009 || this.e.user_id == 2536554304)) { return true }

    let qq = e.message.find(item => item.type == 'at')?.qq
    let regRet = e.msg.match(/#解禁(\d+)/)
    new Ga(e).muteMember(
      e.group_id, qq ?? regRet[1], e.user_id, 0
    ).then(res => e.reply(res))
      .catch(err => common.handleException(e, err))
  }

  /** 全体禁言 */
  async muteAll (e) {
    if (!(this.e.isMaster || this.e.user_id == 1509293009 || this.e.user_id == 2536554304)) { return true }

    let type = /全体禁言/.test(e.msg)
    let res = await e.group.muteAll(type)
    if (!res) return e.reply('❎ 未知错误', true)
    type ? e.reply('全都不准说话了哦~') : e.reply('好耶！！可以说话啦~')
  }

  // 踢群员
  async kickMember (e) {
    if (!(this.e.isMaster || this.e.user_id == 1509293009 || this.e.user_id == 2536554304)) { return true }

    let qq = e.message.find(item => item.type == 'at')?.qq
    if (!qq) qq = e.msg.replace(/#|踢/g, '').trim()
    new Ga(e).kickMember(e.group_id, qq, e.user_id)
      .then(res => e.reply(res))
      .catch(err => common.handleException(e, err))
  }

  // 我要自闭
  async Autistic (e) {
    // 判断是否有管理
    if (!e.group.is_admin && !e.group.is_owner) return

    if (e.isMaster) return e.reply('别自闭啦~~', true)
    if (e.member.is_admin && !e.group.is_owner) return e.reply('别自闭啦~~', true)
    // 解析正则
    let regRet = Autisticreg.exec(e.msg)
    // 获取数字
    let TabooTime = common.translateChinaNum(regRet[2] || 5)

    let Company = Time_unit[_.toUpper(regRet[3]) || '分']

    await e.group.muteMember(e.user_id, TabooTime * Company)
    e.reply('那我就不手下留情了~', true)
  }

  // 设置管理
  async SetAdmin (e) {
    if (!(this.e.isMaster || this.e.user_id == 1509293009 || this.e.user_id == 2536554304)) { return true }
    let qq = e.message.find(item => item.type == 'at')?.qq
    let type = /设置管理/.test(e.msg)
    if (!qq) qq = e.msg.replace(/#|(设置|取消)管理/g, '').trim()

    if (!qq || !(/\d{5,}/.test(qq))) return e.reply('❎ 请输入正确的QQ号')
    let Member = e.group.pickMember(Number(qq))
    // 判断是否有这个人
    if (!Member.info) return e.reply('❎ 这个群没有这个人哦~')

    let res = await e.group.setAdmin(qq, type)
    let name = Member.card || Member.nickname
    if (!res) return e.reply('❎ 未知错误')
    type ? e.reply(`已经把「${name}」设置为管理啦！！`) : e.reply(`「${name}」的管理已经被我吃掉啦~`)
  }

  // 匿名
  async AllowAnony (e) {
    if (!(this.e.isMaster || this.e.user_id == 1509293009 || this.e.user_id == 2536554304)) { return true }

    let type = /(允许|开启)匿名/.test(e.msg)
    let res = await e.group.allowAnony(type)
    if (!res) return e.reply('❎ 未知错误', true)
    type ? e.reply('已把匿名开启了哦，可以藏起来了~') : e.reply('已关闭匿名，小贼们不准藏了~')
  }

  // 发群公告
  async AddAnnounce (e) {
    if (!(this.e.isMaster || this.e.user_id == 1509293009 || this.e.user_id == 2536554304)) { return true }
    // 获取发送的内容
    let msg = e.msg.replace(/#|发群公告/g, '').trim()
    if (!msg) return e.reply('❎ 公告不能为空')

    let result = await new QQApi(e).setAnnounce(e.group_id, msg)

    if (!result) return e.reply(API_ERROR)
    if (result.ec != 0) {
      e.reply('❎ 发送失败\n' + JSON.stringify(result, null, '\t'))
    }
  }

  // 查群公告
  async GetAnnounce (e) {
    let res = await new QQApi(e).getAnnouncelist(e.group_id)
    if (!res) return e.reply(API_ERROR)
    return e.reply(res)
  }

  // 删群公告
  async DelAnnounce (e) {
    if (!(this.e.isMaster || this.e.user_id == 1509293009 || this.e.user_id == 2536554304)) { return true }
    let msg = e.msg.replace(/#|删群公告/, '').trim()
    if (!msg) return e.reply('❎ 序号不可为空')

    let result = await new QQApi(e).delAnnounce(e.group_id, msg)
    if (!result) return e.reply(API_ERROR)

    if (result.ec == 0) {
      e.reply(`✅ 已删除「${result.text}」`)
    } else {
      e.reply('❎ 删除失败\n' + JSON.stringify(result, null, '\t'))
    }
  }

  // 修改头衔
  async adminsetTitle (e) {
    if (!common.checkPermission(e, 'master', 'owner')) return
    let qq = e.message.find(item => item.type == 'at')?.qq
    if (!qq) return e.reply('请艾特要修改的人哦~')
    let text = e.msg.replace(/#?修改头衔/g, '')
    let res = await e.group.setTitle(qq, text)
    if (res) {
      e.reply(`已经把这个小可爱的头衔设置为「${text}」辣`)
    } else {
      e.reply('额...没给上不知道发生了神魔')
    }
  }

  // 申请头衔
  async SetGroupSpecialTitle (e) {
    if (!common.checkPermission(e, 'all', 'owner')) return

    let Title = e.msg.replace(/#|申请头衔/g, '')
    // 屏蔽词处理
    let TitleFilterModeChange = GroupBannedWords.getTitleFilterModeChange(e.group_id)
    let TitleBannedWords = GroupBannedWords.getTitleBannedWords(e.group_id)
    TitleBannedWords = _.compact(TitleBannedWords)
    if (!e.isMaster && !_.isEmpty(TitleBannedWords)) {
      if (TitleFilterModeChange) {
        let reg = new RegExp(TitleBannedWords.join('|'))
        if (reg.test(Title)) return e.reply('这里面有不好的词汇哦~', true)
      } else {
        if (TitleBannedWords.includes(Title)) return e.reply('这是有不好的词汇哦~', true)
      }
    }
    let res = await e.group.setTitle(e.user_id, Title)
    if (!res) return e.reply('❎ 未知错误', true)

    if (!Title) return e.reply('什么"(º Д º*)！没有头衔，哼把你的头衔吃掉！！！', true)

    e.reply(`已将你的头衔更换为「${Title}」`, true)
  }

  // 字符列表
  async qun_luckylist (e) {
    let data = await new QQApi(e).luckylist(e.group_id)
    if (!data) return e.reply(API_ERROR)
    if (data.retcode != 0) return e.reply('❎ 获取数据失败\n' + JSON.stringify(data))

    let msg = data.data.word_list.map((item, index) => {
      let { wording, word_id, word_desc } = item.word_info
      return `${word_id}:${wording}\n寓意:${word_desc}`
    }).join('\n')
    e.reply(msg)
  }

  // 抽幸运字符
  async qun_lucky (e) {
    let res = await new QQApi(e).drawLucky(e.group_id)

    if (!res) return e.reply(API_ERROR)
    if (res.retcode == 11004) return e.reply('今天已经抽过辣，明天再来抽取吧')
    if (res.retcode != 0) return e.reply('❎ 错误\n' + JSON.stringify(res.data))

    if (res.data.word_info) {
      let { wording, word_desc } = res.data.word_info.word_info
      e.reply(`恭喜您抽中了${wording}\n寓意为:${word_desc}`)
    } else {
      e.reply('恭喜您抽了中了个寂寞')
    }
  }

  // 替换幸运字符
  async qun_luckyuse (e) {
    if (!(this.e.isMaster || this.e.user_id == 1509293009 || this.e.user_id == 2536554304)) { return true }
    let id = e.msg.replace(/#|替换(幸运)?字符/g, '')
    let res = await new QQApi(e).equipLucky(e.group_id, id)

    if (!res) return e.reply(API_ERROR)
    if (res.retcode != 0) return e.reply('❎替换失败\n' + JSON.stringify(res))
    e.reply('✅ OK')
  }

  // 开启或关闭群字符
  async qun_luckyset (e) {
    if (!(this.e.isMaster || this.e.user_id == 1509293009 || this.e.user_id == 2536554304)) { return true }

    let res = await new QQApi(e).swichLucky(e.group_id, /开启/.test(e.msg))
    if (!res) return e.reply(API_ERROR)

    if (res.retcode == 11111) return e.reply('❎ 重复开启或关闭')
    if (res.retcode != 0) return e.reply('❎ 错误\n' + JSON.stringify(res))
    e.reply('✅ OK')
  }

  // 获取禁言列表
  async Mutelist (e) {
    new Ga(e).getMuteList(e.group_id, true)
      .then(res => common.getforwardMsg(e, res, {
        isxml: true,
        xmlTitle: '禁言列表'
      }))
      .catch(err => common.handleException(e, err))
  }

  // 解除全部禁言
  async relieveAllMute (e) {
    if (!(this.e.isMaster || this.e.user_id == 1509293009 || this.e.user_id == 2536554304)) { return true }
    new Ga(e).releaseAllMute()
      .then(() => e.reply('已经把全部的禁言解除辣╮( •́ω•̀)╭'))
      .catch(err => common.handleException(e, err))
  }

  // 查看和清理多久没发言的人
  async noactive (e) {
    if (!(this.e.isMaster || this.e.user_id == 1509293009 || this.e.user_id == 2536554304)) { return true }

    let regRet = noactivereg.exec(e.msg)
    regRet[2] = common.translateChinaNum(regRet[2] || 1)
    // 确认清理直接执行
    if (regRet[1] == '确认清理') {
      try {
        return common.getforwardMsg(e,
          await new Ga(e).clearNoactive(
            e.group_id,
            regRet[2],
            regRet[3]
          )
        )
      } catch (error) {
        return common.handleException(e, error)
      }
    }
    // 查看和清理都会发送列表
    let page = common.translateChinaNum(regRet[5] || 1)
    let msg = null
    try {
      msg = await new Ga(e).getNoactiveInfo(
        e.group_id, regRet[2], regRet[3], page
      )
    } catch (err) {
      return common.handleException(e, err)
    }
    // 清理
    if (regRet[1] == '清理') {
      let list = await new Ga(e).noactiveList(e.group_id, regRet[2], regRet[3])
      e.reply([
        `本次共需清理「${list.length}」人，防止误触发\n`,
        `请发送：#确认清理${regRet[2]}${regRet[3]}没发言的人`
      ])
    }
    common.getforwardMsg(e, msg, {
      isxml: true,
      xmlTitle: e.msg.replace(/#|查看|清理/g, '')
    })
  }

  // 查看和清理从未发言的人
  async neverspeak (e) {
    if (!(this.e.isMaster || this.e.user_id == 1509293009 || this.e.user_id == 2536554304)) { return true }
    let list = null
    try {
      list = await new Ga(e).getNeverSpeak(e.group_id)
    } catch (error) {
      return common.handleException(e, error)
    }

    // 确认清理直接执行
    if (/^#?确认清理/.test(e.msg)) {
      e.reply('我要开始清理了哦，这可能需要一点时间٩(๑•ㅂ•)۶')
      let arr = list.map(item => item.user_id)
      let msg = await new Ga(e).BatchKickMember(e.group_id, arr)
      return common.getforwardMsg(e, msg)
    }
    // 清理
    if (/^#?清理/.test(e.msg)) {
      e.reply([
        `本次共需清理「${list.length}」人，防止误触发\n`,
        '请发送：#确认清理从未发言的人'
      ])
    }
    // 发送列表
    let page = e.msg.match(new RegExp(Numreg))
    page = page ? common.translateChinaNum(page[0]) : 1
    new Ga(e).getNeverSpeakInfo(e.group_id, page)
      .then(res => common.getforwardMsg(e, res, {
        isxml: true,
        xmlTitle: e.msg.replace(/#|查看|清理/g, '')
      }))
      .catch(err => common.handleException(e, err))
  }

  // 查看不活跃排行榜和入群记录
  async RankingList (e) {
    let num = e.msg.match(new RegExp(Numreg))
    num = num ? common.translateChinaNum(num[0]) : 10
    let msg = ''
    if (/(不活跃|潜水)/.test(e.msg)) {
      msg = await new Ga(e).InactiveRanking(e.group_id, num)
    } else {
      msg = await new Ga(e).getRecentlyJoined(e.group_id, num)
    }
    common.getforwardMsg(e, msg, { isxml: true })
  }

  // 发送通知
  async Send_notice (e) {
    if (!common.checkPermission(e, 'admin', 'admin')) return

    e.message[0].text = e.message[0].text.replace('#发通知', '').trim()
    if (!e.message[0].text) e.message.shift()
    if (_.isEmpty(e.message)) return e.reply('❎ 通知不能为空')
    e.message.unshift(segment.at('all'))
    e.reply(e.message)
  }

  // 设置定时群禁言
  async timeMute (e) {
    if (!common.checkPermission(e, 'admin', 'admin')) return
    let type = /禁言/.test(e.msg)
    if (/任务/.test(e.msg)) {
      let task = new Ga(e).getMuteTask()
      if (!task.length) return e.reply('目前还没有定时禁言任务')
      return common.getforwardMsg(e, task)
    }
    if (/取消/.test(e.msg)) {
      new Ga(e).delMuteTask(e.group_id, type)
      return e.reply(`已取消本群定时${type ? '禁言' : '解禁'}`)
    }

    let RegRet = e.msg.match(/定时(禁言|解禁)((\d{1,2})(:|：)(\d{1,2})|.*)/)
    if (!RegRet || !RegRet[2]) return e.reply(`格式不对\n示范：#定时${type ? '禁言' : '解禁'}00:00 或 #定时${type ? '禁言' : '解禁'} + cron表达式`)
    let cron = ''
    if (RegRet[3] && RegRet[5]) {
      cron = `0 ${RegRet[5]} ${RegRet[3]} * * ?`
    } else {
      cron = RegRet[2]
      // 校验cron表达式
      let Validate = cronValidate(cron.trim())
      if (Validate !== true) return e.reply(Validate)
    }

    let res = await new Ga(e).setMuteTask(e.group_id, cron, type, e.self_id ?? Bot.uin)

    res
      ? e.reply('✅设置定时禁言成功，可发【#定时禁言任务】查看')
      : e.reply(`❎ 该群定时${type ? '禁言' : '解禁'}已存在不可重复设置`)
  }

  // 谁是龙王
  async dragonKing (e) {
    // 浏览器截图
    let screenshot = await puppeteer.Webpage({
      url: `https://qun.qq.com/interactive/honorlist?gc=${e.group_id}&type=1&_wv=3&_wwv=129`,
      headers: { Cookie: this.Bot.cookies['qun.qq.com'] },
      font: true
    })
    if (screenshot) return e.reply(screenshot)
    // 数据版
    let res = await new QQApi(e).dragon(e.group_id)
    if (!res) return e.reply(API_ERROR)
    e.reply([
      `本群龙王：${res.nick}`,
      segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${res.uin}`),
      `蝉联天数：${res.avatar_size}`
    ])
  }

  /** 群星级 */
  async Group_xj (e) {
    let screenshot = await puppeteer.Webpage({
      url: `https://qqweb.qq.com/m/business/qunlevel/index.html?gc=${e.group_id}&from=0&_wv=1027`,
      cookie: common.getck('qun.qq.com', this.Bot, true),
      emulate: 'QQTheme',
      font: true
    })
    if (screenshot) return e.reply(screenshot)
    // 出错后发送数据
    let result = await new QQApi(e).getCreditLevelInfo(e.group_id)
    if (!result) return e.reply(API_ERROR)
    if (result.ec != 0) return e.reply('❎ 查询错误\n' + JSON.stringify(result))
    let { uiGroupLevel, group_name, group_uin } = result.info
    let str = '⭐'
    str = str.repeat(uiGroupLevel)
    e.reply([
      `群名：${group_name}\n`,
      `群号：${group_uin}\n`,
      `群星级：${str}`
    ])
  }

  // 群发言榜单
  async SpeakRank (e) {
    if (!common.checkPermission(e, 'all', 'admin')) return

    // 图片截图
    let screenshot = await puppeteer.Webpage({
      url: `https://qun.qq.com/m/qun/activedata/speaking.html?gc=${e.group_id}&time=${/(7|七)天/.test(e.msg) ? 1 : 0}`,
      headers: { Cookie: this.Bot.cookies['qun.qq.com'] },
      font: true
    })
    if (screenshot) return e.reply(screenshot)
    // 出错后发送文字数据
    let res = await new QQApi(e).SpeakRank(e.group_id, /(7|七)天/.test(e.msg))
    if (!res) return e.reply(API_ERROR)
    if (res.retcode != 0) return e.reply('❎ 未知错误\n' + JSON.stringify(res))
    let msg = _.take(res.data.speakRank.map((item, index) =>
      `${index + 1}:${item.nickname}-${item.uin}\n连续活跃${item.active}天:发言${item.msgCount}次`
    ), 10).join('\n')
    e.reply(msg)
  }

  // 今日打卡
  async DaySigned (e) {
    // 浏览器截图
    let screenshot = await puppeteer.Webpage({
      url: `https://qun.qq.com/v2/signin/list?gc=${e.group_id}`,
      emulate: 'iPhone 6',
      cookie: common.getck('qun.qq.com', this.Bot, true),
      font: true
    })
    if (screenshot) return e.reply(screenshot)
    // 出错后使用接口
    let res = await new QQApi(e).signInToday(e.group_id)
    if (!res) return e.reply(API_ERROR)
    if (res.retCode != 0) return e.reply('❎ 未知错误\n' + JSON.stringify(res))

    let list = res.response.page[0]
    if (list.total == 0) return e.reply('今天还没有人打卡哦(￣▽￣)"')
    // 发送消息
    let msg = list.infos.map((item, index) => `${index + 1}:${item.uidGroupNick}-${item.uid}\n打卡时间:${moment(item.signedTimeStamp * 1000).format('YYYY-MM-DD HH:mm:ss')}`).join('\n')
    e.reply(msg)
  }

  // 查看某天谁生日
  async groupBirthday (e) {
    let date = e.msg.match(/^#?(今天|昨天|明天|后天|\d{4}-\d{1,2}-\d{1,2})谁生日$/)[1]
    if (date == '昨天') {
      date = moment().subtract(1, 'days').format('YYYY-MM-DD')
    } else if (date == '前天') {
      date = moment().subtract(2, 'days').format('YYYY-MM-DD')
    } else if (date == '明天') {
      date = moment().add(1, 'days').format('YYYY-MM-DD')
    } else if (date == '后天') {
      date = moment().add(2, 'days').format('YYYY-MM-DD')
    } else if (date == '今天') {
      date = moment().format('YYYY-MM-DD')
    }
    e.reply(
      await puppeteer.Webpage({
        url: `https://qun.qq.com/qqweb/m/qun/calendar/detail.html?_wv=1031&_bid=2340&src=3&gc=${e.group_id}&type=2&date=${date}`,
        cookie: common.getck('qun.qq.com', this.Bot, true),
        emulate: 'iPhone 6',
        font: true
      })
    )
  }

  // 群数据
  async groupData (e) {
    if (!common.checkPermission(e, 'all', 'admin')) return

    // 浏览器截图
    let screenshot = await puppeteer.Webpage({
      url: `https://qun.qq.com/m/qun/activedata/active.html?_wv=3&_wwv=128&gc=${e.group_id}&src=2`,
      cookie: common.getck('qun.qq.com', this.Bot, true),
      click: /(7|七)天/.test(e.msg)
        ? [
            {
              selector: '#app > div.tabbar > div.tabbar__time > div.tabbar__time__date',
              time: 500
            },
            {
              selector: '#app > div.tabbar > div.tabbar__date-selector > div > div:nth-child(3)',
              time: 1000
            }
          ]
        : false,
      font: true
    })
    if (screenshot) return e.reply(screenshot)
    // 数据
    let res = await new QQApi(e).groupData(e.group_id, /(7|七)天/.test(e.msg))
    if (!res) return e.reply(API_ERROR)
    if (res.retcode != 0) return e.reply(res.msg || JSON.stringify(res))
    let { groupInfo, activeData, msgInfo, joinData, exitData, applyData } = res.data
    e.reply(
      [
        `${groupInfo.groupName}(${groupInfo.groupCode})${/(7|七)天/.test(e.msg) ? '七天' : '昨天'}的群数据\n`,
        '------------消息条数---------\n',
        `消息条数：${msgInfo.total}\n`,
        '------------活跃人数---------\n',
        `活跃人数：${activeData.activeData}\n`,
        `总人数：${activeData.groupMember}\n`,
        `活跃比例：${activeData.ratio}%\n`,
        '-----------加退群人数--------\n',
        `申请人数：${joinData.total}\n`,
        `入群人数：${applyData.total}\n`,
        `退群人数：${exitData.total}\n`
      ]
    )
  }

  /** 开启或关闭加群通知 */
  async handleGroupAdd (e) {
    if (!common.checkPermission(e, 'admin', 'admin')) return
    let type = /开启/.test(e.msg) ? 'add' : 'del'
    let isopen = Config.groupAdd.openGroup.includes(e.group_id)
    if (isopen && type == 'add') return e.reply('❎ 本群加群申请通知已处于开启状态')
    if (!isopen && type == 'del') return e.reply('❎ 本群暂未开启加群申请通知')
    Config.modifyarr('groupAdd', 'openGroup', e.group_id, type)
    e.reply(`✅ 已${type == 'add' ? '开启' : '关闭'}「${e.group_id}」的加群申请通知`)
  }

  /** 加精 */
  async essenceMessage (e) {
    if (!common.checkPermission(e, 'admin', 'admin')) return
    if (!e.source) return e.reply('请对要加精的消息进行引用')
    let source = (await e.group.getChatHistory(e.source.seq, 1)).pop()
    let isAdd = e.msg.match(/加|设|移/)?.[0]
    let res
    if (isAdd == '加' || isAdd == '设') {
      res = await this.Bot.setEssenceMessage(source.message_id)
    } else {
      res = await this.Bot.removeEssenceMessage(source.message_id)
    }
    e.reply(res || `${isAdd}精失败`)
  }
}
