import _ from "lodash"
import { Config } from "../../components/index.js"
import { Time_unit } from "../../constants/other.js"
import { GroupAdmin as Ga, GroupBannedWords, common } from "../../model/index.js"
import { cronValidate, translateChinaNum } from "../../tools/index.js"

/** 正则 */
const Numreg = "[零一壹二两三四五六七八九十百千万亿\\d]+"
const TimeUnitReg = Object.keys(Time_unit).join("|")

/** 清理多久没发言的人正则 */
const noactivereg = new RegExp(`^#(查看|清理|确认清理|获取)(${Numreg})个?(${TimeUnitReg})没发言的人(第(${Numreg})页)?$`)
/** 我要自闭正则 */
const Autisticreg = new RegExp(`^#?我要(自闭|禅定)(${Numreg})?个?(${TimeUnitReg})?$`, "i")
Ga.loadRedisMuteTask()
export class GroupAdmin extends plugin {
  constructor() {
    super({
      name: "椰奶群管-基础",
      event: "message.group",
      priority: 500,
      rule: [
        {
          reg: `^#禁言\\s?((\\d+)\\s)?(${Numreg})?(${TimeUnitReg})?$`,
          fnc: "muteMember"
        },
        {
          reg: "^#解禁(\\d+)?$",
          fnc: "noMuteMember"
        },
        {
          reg: "^#全(体|员)(禁言|解禁)$",
          fnc: "muteAll"
        },
        {
          reg: "^#踢(\\d+)?$",
          fnc: "kickMember"
        },
        {
          reg: "^#(设置|取消)管理(\\d+)?$",
          fnc: "SetAdmin"
        },
        {
          reg: "^#(修改|设置)头衔",
          fnc: "adminsetTitle"
        },
        {
          reg: "^#(申请|我要)头衔",
          fnc: "SetGroupSpecialTitle"
        },
        {
          reg: "^#(获取|查看)?禁言列表$",
          fnc: "Mutelist"
        },
        {
          reg: "^#解除全部禁言$",
          fnc: "relieveAllMute"
        },
        {
          reg: `^#(查看|(确认)?清理)从未发言过?的人(第(${Numreg})页)?$`,
          fnc: "neverspeak"
        },
        {
          reg: `^#(查看|获取)?(不活跃|潜水)排行榜(${Numreg})?$`,
          fnc: "RankingList"
        },
        {
          reg: `^#(查看|获取)?最近的?入群(情况|记录)(${Numreg})?$`,
          fnc: "RankingList"
        },
        {
          reg: noactivereg, // 清理多久没发言的人
          fnc: "noactive"
        },
        {
          reg: "^#发通知",
          fnc: "Send_notice"
        },
        {
          reg: "^#(设置)?定时(禁言|解禁)(.*)$|^#定时禁言任务$|^#取消定时(禁言|解禁)$",
          fnc: "timeMute"
        },
        {
          reg: "^#(查看|获取)?群?发言(榜单|排行)((7|七)天)?",
          fnc: "SpeakRank"
        },
        {
          reg: "^#?(开启|关闭)加群通知$",
          fnc: "handleGroupAdd"
        },
        {
          reg: "^#?(加|设|移)精$",
          fnc: "essenceMessage"
        },
        {
          reg: Autisticreg, // 我要自闭
          fnc: "Autistic"
        }
      ]
    })
  }

  get Bot() {
    return this.e.bot ?? Bot
  }

  /**
   * 禁言
   * @param e
   */
  async muteMember(e) {
    if (!common.checkPermission(e, "admin", "admin")) { return true }
    let qq = e.message.find(item => item.type == "at")?.qq
    let reg = `#禁言\\s?((\\d+)\\s${qq ? "" : "?"})?(${Numreg})?(${TimeUnitReg})?`
    let regRet = e.msg.match(new RegExp(reg))
    const time = translateChinaNum(regRet[3])
    new Ga(e).muteMember(
      e.group_id, qq ?? regRet[2], e.user_id, time, regRet[4]
    ).then(res => e.reply(res))
      .catch(err => common.handleException(e, err))
  }

  /**
   * 解禁
   * @param e
   */
  async noMuteMember(e) {
    if (!common.checkPermission(e, "admin", "admin")) { return true }
    let qq = e.message.find(item => item.type == "at")?.qq
    let regRet = e.msg.match(/#解禁(\d+)/)
    new Ga(e).muteMember(
      e.group_id, qq ?? regRet[1], e.user_id, 0
    ).then(res => e.reply(res))
      .catch(err => common.handleException(e, err))
  }

  /**
   * 全体禁言
   * @param e
   */
  async muteAll(e) {
    if (!common.checkPermission(e, "admin", "admin")) { return true }
    let type = /全(体|员)禁言/.test(e.msg)
    let res = await e.group.muteAll(type)
    if (!res) return e.reply("❎ 未知错误", true)
    e.reply(`✅ 已${type ? "开启" : "关闭"}全体禁言`)
  }

  /**
   * 踢群员
   * @param e
   */
  async kickMember(e) {
    if (!common.checkPermission(e, "admin", "admin")) { return true }
    let qq = e.message.find(item => item.type == "at")?.qq
    if (!qq) qq = e.msg.replace(/#|踢/g, "").trim()
    new Ga(e).kickMember(e.group_id, qq, e.user_id)
      .then(res => e.reply(res))
      .catch(err => common.handleException(e, err))
  }

  /**
   * 设置管理
   * @param e
   */
  async SetAdmin(e) {
    if (!common.checkPermission(e, "master", "owner")) return
    let qq = e.message.find(item => item.type == "at")?.qq
    const type = /设置管理/.test(e.msg)
    if (!qq) qq = e.msg.replace(/#|(设置|取消)管理/g, "").trim()
    if (!qq || !(/\d{5,}/.test(qq))) return e.reply("❎ 请输入正确的QQ号")
    let Member
    try {
      Member = e.group.pickMember(Number(qq) || qq, true)
    } catch {
      return e.reply("❎ 这个群没有这个人哦~")
    }
    const Memberinfo = Member?.info || await Member?.getInfo?.()
    const res = await e.group.setAdmin(qq, type)
    const name = Memberinfo.card || Memberinfo.nickname || (Number(qq) || qq)
    if (!res) return e.reply("❎ 未知错误")
    type ? e.reply(`✅ 已经把「${name}」设置为管理啦！！`) : e.reply(`✅ 已取消「${name}」的管理`)
  }

  /**
   * 设置头衔
   * @param e
   */
  async adminsetTitle(e) {
    if (!common.checkPermission(e, "master", "owner")) return
    let qq = e.message.find(item => item.type == "at")?.qq
    if (!qq) return e.reply("请艾特要修改的人哦~")
    let text = e.msg.replace(/#?(修改|设置)头衔/g, "")
    let res = await e.group.setTitle(qq, text)
    if (res) {
      let Member = e.group.pickMember(Number(qq) || qq)
      let name = Member.card || Member.nickname
      e.reply(`✅ 已经将「${name}」的头衔设置为「${text}」`)
    } else {
      e.reply("❎ 未知错误")
    }
  }

  /**
   * 申请头衔
   * @param e
   */
  async SetGroupSpecialTitle(e) {
    if (!common.checkPermission(e, "all", "owner")) return
    let Title = e.msg.replace(/#(申请|我要)头衔/g, "")
    // 屏蔽词处理
    let TitleFilterModeChange = GroupBannedWords.getTitleFilterModeChange(e.group_id)
    let TitleBannedWords = GroupBannedWords.getTitleBannedWords(e.group_id)
    TitleBannedWords = _.compact(TitleBannedWords)
    if (!e.isMaster && !_.isEmpty(TitleBannedWords)) {
      if (TitleFilterModeChange) {
        let reg = new RegExp(TitleBannedWords.join("|"))
        if (reg.test(Title)) return e.reply("❎ 包含违禁词", true)
      } else {
        if (TitleBannedWords.includes(Title)) return e.reply("❎ 包含违禁词", true)
      }
    }
    let res = await e.group.setTitle(e.user_id, Title)
    if (!res) return e.reply("❎ 未知错误", true)

    if (!Title) return e.reply("❎ 什么\"(º Д º*)！没有头衔，哼把你的头衔吃掉！！！", true)

    e.reply(`✅ 已将你的头衔更换为「${Title}」`, true)
  }

  /**
   * 获取禁言列表
   * @param e
   */
  async Mutelist(e) {
    new Ga(e).getMuteList(e.group_id, true)
      .then(res => common.getforwardMsg(e, res, {
        isxml: true,
        xmlTitle: "禁言列表"
      }))
      .catch(err => common.handleException(e, err))
  }

  /**
   * 解除全部禁言
   * @param e
   */
  async relieveAllMute(e) {
    if (!common.checkPermission(e, "admin", "admin")) { return true }
    new Ga(e).releaseAllMute()
      .then(() => e.reply("✅ 已将全部禁言解除"))
      .catch(err => common.handleException(e, err))
  }

  /**
   * 查看和清理多久没发言的人
   * @param e
   */
  async noactive(e) {
    if (!common.checkPermission(e, "admin", "admin")) { return true }

    let regRet = noactivereg.exec(e.msg)
    regRet[2] = translateChinaNum(regRet[2] || 1)
    // 确认清理直接执行
    if (regRet[1] == "确认清理") {
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
    let page = translateChinaNum(regRet[5] || 1)
    let msg = null
    try {
      msg = await new Ga(e).getNoactiveInfo(
        e.group_id, regRet[2], regRet[3], page
      )
    } catch (err) {
      return common.handleException(e, err)
    }
    // 清理
    if (regRet[1] == "清理") {
      let list = await new Ga(e).noactiveList(e.group_id, regRet[2], regRet[3])
      e.reply([
        `⚠ 本次共需清理「${list.length}」人，防止误触发\n`,
        `请发送：#确认清理${regRet[2]}${regRet[3]}没发言的人`
      ])
    }
    common.getforwardMsg(e, msg, {
      isxml: true,
      xmlTitle: e.msg.replace(/#|查看|清理/g, "")
    })
  }

  /**
   * 查看和清理从未发言的人
   * @param e
   */
  async neverspeak(e) {
    if (!common.checkPermission(e, "admin", "admin")) { return true }
    let list = null
    try {
      list = await new Ga(e).getNeverSpeak(e.group_id)
    } catch (error) {
      return common.handleException(e, error)
    }

    // 确认清理直接执行
    if (/^#?确认清理/.test(e.msg)) {
      e.reply("⚠ 开始清理，这可能需要一点时间")
      let arr = list.map(item => item.user_id)
      let msg = await new Ga(e).BatchKickMember(e.group_id, arr)
      return common.getforwardMsg(e, msg)
    }
    // 清理
    if (/^#?清理/.test(e.msg)) {
      e.reply([
        `⚠ 本次共需清理「${list.length}」人，防止误触发\n`,
        "请发送：#确认清理从未发言的人"
      ])
    }
    // 发送列表
    let page = e.msg.match(new RegExp(Numreg))
    page = page ? translateChinaNum(page[0]) : 1
    new Ga(e).getNeverSpeakInfo(e.group_id, page)
      .then(res => common.getforwardMsg(e, res, {
        isxml: true,
        xmlTitle: e.msg.replace(/#|查看|清理/g, "")
      }))
      .catch(err => common.handleException(e, err))
  }

  /**
   * 查看不活跃排行榜和入群记录
   * @param e
   */
  async RankingList(e) {
    let num = e.msg.match(new RegExp(Numreg))
    num = num ? translateChinaNum(num[0]) : 10
    let msg = ""
    if (/(不活跃|潜水)/.test(e.msg)) {
      msg = await new Ga(e).InactiveRanking(e.group_id, num)
    } else {
      msg = await new Ga(e).getRecentlyJoined(e.group_id, num)
    }
    common.getforwardMsg(e, msg, { isxml: true })
  }

  /**
   * 发送通知
   * @param e
   */
  async Send_notice(e) {
    if (!common.checkPermission(e, "admin", "admin")) return

    e.message[0].text = e.message[0].text.replace("#发通知", "").trim()
    if (!e.message[0].text) e.message.shift()
    if (_.isEmpty(e.message)) return e.reply("❎ 通知不能为空")
    e.message.unshift(segment.at("all"))
    e.reply(e.message)
  }

  /**
   * 设置定时群禁言
   * @param e
   */
  async timeMute(e) {
    if (!common.checkPermission(e, "admin", "admin")) return
    let type = /禁言/.test(e.msg)
    if (/任务/.test(e.msg)) {
      let task = new Ga(e).getMuteTask()
      if (!task.length) return e.reply("目前还没有定时禁言任务")
      return common.getforwardMsg(e, task)
    }
    if (/取消/.test(e.msg)) {
      new Ga(e).delMuteTask(e.group_id, type)
      return e.reply(`已取消本群定时${type ? "禁言" : "解禁"}`)
    }

    let RegRet = e.msg.match(/定时(禁言|解禁)((\d{1,2})(:|：)(\d{1,2})|.*)/)
    if (!RegRet || !RegRet[2]) return e.reply(`格式不对\n示范：#定时${type ? "禁言" : "解禁"}00:00 或 #定时${type ? "禁言" : "解禁"} + cron表达式`)
    let cron = ""
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
      ? e.reply("✅设置定时禁言成功，可发【#定时禁言任务】查看")
      : e.reply(`❎ 该群定时${type ? "禁言" : "解禁"}已存在不可重复设置`)
  }

  /**
   * 开启或关闭加群通知
   * @param e
   */
  async handleGroupAdd(e) {
    if (!common.checkPermission(e, "admin", "admin")) return
    let type = /开启/.test(e.msg) ? "add" : "del"
    let isopen = Config.groupAdd.openGroup.includes(e.group_id)
    if (isopen && type == "add") return e.reply("❎ 本群加群申请通知已处于开启状态")
    if (!isopen && type == "del") return e.reply("❎ 本群暂未开启加群申请通知")
    Config.modifyarr("groupAdd", "openGroup", e.group_id, type)
    e.reply(`✅ 已${type == "add" ? "开启" : "关闭"}「${e.group_id}」的加群申请通知`)
  }

  /**
   * 加精
   * @param e
   */
  async essenceMessage(e) {
    if (!common.checkPermission(e, "admin", "admin")) return
    const source = await common.takeSourceMsg(e)
    if (!source) return e.reply("请对要加精的消息进行引用")
    let isAdd = e.msg.match(/加|设|移/)?.[0]
    let res
    if (isAdd == "加" || isAdd == "设") {
      res = await this.Bot.setEssenceMessage(source.message_id)
    } else {
      res = await this.Bot.removeEssenceMessage(source.message_id)
    }
    e.reply(res || `${isAdd}精失败`)
  }

  /**
   * 我要自闭
   * @param e
   */
  async Autistic(e) {
    // 判断是否有管理
    if (!e.group.is_admin && !e.group.is_owner) return
    if (e.isMaster) return e.reply("别自闭啦~~", true)
    if (e.member.is_admin && !e.group.is_owner) return e.reply("别自闭啦~~", true)
    // 解析正则
    let regRet = Autisticreg.exec(e.msg)
    // 获取数字
    let TabooTime = translateChinaNum(regRet[2] || 5)

    let Company = Time_unit[_.toUpper(regRet[3]) || "分"]

    await e.group.muteMember(e.user_id, TabooTime * Company)
    e.reply("那我就不手下留情了~", true)
  }
}
