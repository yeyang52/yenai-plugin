import _ from "lodash"
import { Config } from "../../components/index.js"
import { Time_unit } from "../../constants/other.js"
import { GroupAdmin as Ga, GroupBannedWords, common } from "../../model/index.js"
import { cronValidate, translateChinaNum } from "../../tools/index.js"
import { GroupWhiteListCtrl } from "./groupWhiteListCtrl.js"

const Numreg = "[零一壹二两三四五六七八九十百千万亿\\d]+"
const TimeUnitReg = Object.keys(Time_unit).join("|")

/** 清理多久没发言的人正则 */
const noactivereg = new RegExp(`^#(查看|清理|获取)(${Numreg})个?(${TimeUnitReg})没发言的人(第(${Numreg})页)?$`)
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
          reg: "^#踢黑?(\\d+)?$",
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
          reg: `^#(查看|清理)从未发言过?的人(第(${Numreg})页)?$`,
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

  async muteMember(e) {
    if (!common.checkPermission(e, "admin", "admin")) return true
    let qq = e.message.filter(item => item.type == "at").map(item => item.qq)
    if (qq.length < 2) qq = qq[0] || e.msg.match(/#禁言\s?(\d+)/)?.[1]
    const time = translateChinaNum(e.msg.match(new RegExp(Numreg))?.[0])
    try {
      const res = await new Ga(e).muteMember(
        e.group_id,
        qq,
        e.user_id,
        time,
        e.msg.match(new RegExp(TimeUnitReg))?.[0]
      )
      e.reply(res)
    } catch (err) {
      common.handleException(e, err)
    }
  }

  async noMuteMember(e) {
    if (!common.checkPermission(e, "admin", "admin")) return true
    let qq = e.message.filter(item => item.type == "at").map(item => item.qq)
    if (qq.length < 2) qq = qq[0] || e.msg.match(/#解禁(\d+)/)?.[1]
    try {
      const res = await new Ga(e).muteMember(e.group_id, qq, e.user_id, 0)
      e.reply(res)
    } catch (err) {
      common.handleException(e, err)
    }
  }

  async muteAll(e) {
    if (!common.checkPermission(e, "admin", "admin")) return true
    const type = /全(体|员)禁言/.test(e.msg)
    const res = await e.group.muteAll(type)
    e.reply(res ? `✅ 已${type ? "开启" : "关闭"}全体禁言` : "❎ 未知错误", true)
  }

  async kickMember(e) {
    if (!common.checkPermission(e, "admin", "admin")) return true
    let qq = e.message.filter(item => item.type == "at").map(item => item.qq)
    if (qq.length < 2) qq = qq[0] || e.msg.replace(/#|踢黑?/g, "").trim()
    if (/黑/.test(e.msg)) {
      const _qq = []
      if (Array.isArray(qq)) {
        _qq.push(...qq)
      } else {
        _qq.push(qq)
      }
      for await (let id of _qq) {
        new GroupWhiteListCtrl().addList(e, id, "add", "blackQQ")
      }
    }
    try {
      const res = await new Ga(e).kickMember(e.group_id, qq, e.user_id)
      e.reply(res)
    } catch (err) {
      common.handleException(e, err)
    }
  }

  async SetAdmin(e) {
    if (!common.checkPermission(e, "master", "owner")) return
    let qq = e.message.filter(item => item.type == "at").map(item => item.qq)
    if (qq.length < 1) qq = [ e.msg.replace(/#|(设置|取消)管理/g, "").trim() ]
    if (!qq || !(/\d{5,}/.test(qq))) return e.reply("❎ 请输入正确的QQ号")
    try {
      let add = /设置管理/.test(e.msg)
      let names = []
      for (let id of qq) {
        const Member = e.group.pickMember(Number(id) || id, true)
        const Memberinfo = Member?.info || await Member?.getInfo?.()
        await e.group.setAdmin(id, add)
        const name = Memberinfo.card || Memberinfo.nickname || (Number(id) || id)
        names.push(name)
      }
      e.reply(add ? `✅ 已经把「${names.join("，")}」设置为管理啦！！` : `✅ 已取消「${names.join("，")}」的管理啦！！`)
    } catch {
      e.reply("❎ 这个群没有这个人哦~")
    }
  }

  async adminsetTitle(e) {
    if (!common.checkPermission(e, "master", "owner")) return
    const qq = e.message.find(item => item.type == "at")?.qq
    if (!qq) return e.reply("请艾特要修改的人哦~")
    const text = e.msg.replace(/#?(修改|设置)头衔/g, "")
    const res = await e.group.setTitle(qq, text)
    if (res) {
      const Member = e.group.pickMember(Number(qq) || qq)
      const name = Member.card || Member.nickname
      e.reply(`✅ 已经将「${name}」的头衔设置为「${text}」`)
    } else {
      e.reply("❎ 未知错误")
    }
  }

  async SetGroupSpecialTitle(e) {
    if (!common.checkPermission(e, "all", "owner")) return
    const Title = e.msg.replace(/#(申请|我要)头衔/g, "")
    const TitleFilterModeChange = GroupBannedWords.getTitleFilterModeChange(e.group_id)
    const TitleBannedWords = _.compact(GroupBannedWords.getTitleBannedWords(e.group_id))
    if (!e.isMaster && !_.isEmpty(TitleBannedWords)) {
      const reg = new RegExp(TitleBannedWords.join("|"))
      if (TitleFilterModeChange ? reg.test(Title) : TitleBannedWords.includes(Title)) {
        return e.reply("❎ 包含违禁词", true)
      }
    }
    const res = await e.group.setTitle(e.user_id, Title)
    e.reply(res ? `✅ 已将你的头衔更换为「${Title}」` : "❎ 未知错误", true)
  }

  async Mutelist(e) {
    try {
      const res = await new Ga(e).getMuteList(e.group_id, true)
      common.getforwardMsg(e, res, { isxml: true, xmlTitle: "禁言列表" })
    } catch (err) {
      common.handleException(e, err)
    }
  }

  async relieveAllMute(e) {
    if (!common.checkPermission(e, "admin", "admin")) return true
    try {
      await new Ga(e).releaseAllMute()
      e.reply("✅ 已将全部禁言解除")
    } catch (err) {
      common.handleException(e, err)
    }
  }

  async noactive(e) {
    const role = e.msg.includes("查看") ? "all" : "admin"
    if (!common.checkPermission(e, "admin", role)) return true
    const regRet = noactivereg.exec(e.msg)
    regRet[2] = translateChinaNum(regRet[2] || 1)
    try {
      if (regRet[1] === "清理") {
        const list = await new Ga(e).noactiveList(e.group_id, regRet[2], regRet[3])
        e._regRet = regRet
        e._list = list
        this.setContext("startNoactive")
        e.reply([ `⚠ 本次共需清理「${list.length}」人\n`, "请发送：\"#确认清理\" 开始清理" ])
      }
      const page = translateChinaNum(regRet[5] || 1)
      const msg = await new Ga(e).getNoactiveInfo(e.group_id, regRet[2], regRet[3], page)
      common.getforwardMsg(e, msg, { isxml: true, xmlTitle: e.msg.replace(/#|查看|清理/g, "") })
    } catch (err) {
      common.handleException(e, err)
    }
  }

  async startNoactive(_e) {
    const e = this.e
    if (/^#?确认清理$/.test(e.msg)) {
      try {
        const msg = await new Ga(e).clearNoactive(e.group_id, _e._regRet[2], _e._regRet[3], _e._list)
        common.getforwardMsg(e, msg)
      } catch (error) {
        common.handleException(e, error)
      }
    } else {
      e.reply("❎ 已取消")
    }
    this.finish("startNoactive")
  }

  async neverspeak(e) {
    const role = e.msg.includes("查看") ? "all" : "admin"
    if (!common.checkPermission(e, "admin", role)) return true
    try {
      const list = await new Ga(e).getNeverSpeak(e.group_id)
      if (/^#?清理/.test(e.msg)) {
        this.setContext("startNeverspeak")
        e._list = list
        e.reply([ `⚠ 本次共需清理「${list.length}」人，防止误触发\n`, "请发送：\"#确认清理\" 开始清理" ])
      } else {
        const page = translateChinaNum(e.msg.match(new RegExp(Numreg))?.[0] || 1)
        const res = await new Ga(e).getNeverSpeakInfo(e.group_id, page, list)
        common.getforwardMsg(e, res, { isxml: true, xmlTitle: e.msg.replace(/#|查看|清理/g, "") })
      }
    } catch (err) {
      common.handleException(e, err)
    }
  }

  async startNeverspeak(_e) {
    const e = this.e
    if (/^#?确认清理$/.test(e.msg)) {
      e.reply("⚠ 开始清理，这可能需要一点时间")
      const arr = _e._list.map(item => item.user_id)
      const msg = await new Ga(e).BatchKickMember(e.group_id, arr)
      common.getforwardMsg(e, msg)
    } else {
      e.reply("❎ 已取消")
    }
    this.finish("startNeverspeak")
  }

  async RankingList(e) {
    const num = translateChinaNum(e.msg.match(new RegExp(Numreg))?.[0] || 10)
    const msg = /不活跃|潜水/.test(e.msg)
      ? await new Ga(e).InactiveRanking(e.group_id, num)
      : await new Ga(e).getRecentlyJoined(e.group_id, num)
    common.getforwardMsg(e, msg, { isxml: true })
  }

  async Send_notice(e) {
    if (!common.checkPermission(e, "admin", "admin")) return
    e.message[0].text = e.message[0].text.replace("#发通知", "").trim()
    if (!e.message[0].text) e.message.shift()
    if (_.isEmpty(e.message)) return e.reply("❎ 通知不能为空")
    e.message.unshift(segment.at("all"))
    e.reply(e.message)
  }

  async timeMute(e) {
    if (!common.checkPermission(e, "admin", "admin")) return
    const type = /禁言/.test(e.msg)
    if (/任务/.test(e.msg)) {
      const task = new Ga(e).getMuteTask()
      if (!task.length) return e.reply("目前还没有定时禁言任务")
      return common.getforwardMsg(e, task)
    }
    if (/取消/.test(e.msg)) {
      await new Ga(e).delMuteTask(e.group_id, type)
      return e.reply(`已取消本群定时${type ? "禁言" : "解禁"}`)
    }
    const RegRet = e.msg.match(/定时(禁言|解禁)((\d{1,2})(:|：)(\d{1,2})|.*)/)
    if (!RegRet || !RegRet[2]) return e.reply(`格式不对\n示范：#定时${type ? "禁言" : "解禁"}00:00 或 #定时${type ? "禁言" : "解禁"} + cron表达式`)
    const cron = RegRet[3] && RegRet[5] ? `0 ${RegRet[5]} ${RegRet[3]} * * ?` : RegRet[2]
    const Validate = cronValidate(cron.trim())
    if (Validate !== true) return e.reply(Validate)
    const res = await new Ga(e).setMuteTask(e.group_id, cron, type, e.self_id ?? Bot.uin)
    e.reply(res ? "✅设置定时禁言成功，可发【#定时禁言任务】查看" : `❎ 该群定时${type ? "禁言" : "解禁"}已存在不可重复设置`)
  }

  async handleGroupAdd(e) {
    if (!common.checkPermission(e, "admin", "admin")) return
    const type = /开启/.test(e.msg) ? "add" : "del"
    const isopen = Config.groupAdmin.groupAddNotice.openGroup.includes(e.group_id)
    if (isopen && type === "add") return e.reply("❎ 本群加群申请通知已处于开启状态")
    if (!isopen && type === "del") return e.reply("❎ 本群暂未开启加群申请通知")
    Config.modifyArr("groupAdmin", "groupAddNotice.openGroup", e.group_id, type)
    e.reply(`✅ 已${type === "add" ? "开启" : "关闭"}「${e.group_id}」的加群申请通知`)
  }

  async essenceMessage(e) {
    if (!common.checkPermission(e, "admin", "admin")) return
    const source = await common.takeSourceMsg(e)
    if (!source) return e.reply("请对要加精的消息进行引用")
    const isAdd = e.msg.match(/加|设|移/)?.[0]
    try {
      const res = isAdd === "加" || isAdd === "设"
        ? await this.Bot.setEssenceMessage(source.message_id)
        : await this.Bot.removeEssenceMessage(source.message_id)
      e.reply(res || `${isAdd}精失败`)
    } catch (error) {
      if (error.message.includes("is not a function")) {
        e.reply("❎ 该协议端未获取到加精函数")
      } else {
        common.handleException(e, error)
      }
    }
  }

  async Autistic(e) {
    if (!e.group.is_admin && !e.group.is_owner) return
    if (e.isMaster || (e.member.is_admin && !e.group.is_owner)) return e.reply("别自闭啦~~", true)
    const regRet = Autisticreg.exec(e.msg)
    const TabooTime = translateChinaNum(regRet[2] || 5)
    const Company = Time_unit[_.toUpper(regRet[3]) || "分"]
    await e.group.muteMember(e.user_id, TabooTime * Company)
    e.reply("那我就不手下留情了~", true)
  }
}
