import { common, GroupBannedWords as groupBannedWords } from "../../model/index.js"
import { Config, Log_Prefix } from "../../components/index.js"
import _ from "lodash"
import { GroupWhiteListCtrl } from "./groupWhiteListCtrl.js"

export class GroupBannedWords extends plugin {
  constructor() {
    super({
      name: "椰奶群管-违禁词",
      event: "message.group",
      priority: 1,
      rule: [
        {
          reg: "^#?新增(模糊|精确|正则1|正则2|正则)?(踢|禁|撤|踢撤|禁撤|踢黑)?违禁词",
          fnc: "add"
        },
        {
          reg: "^#?删除违禁词",
          fnc: "del"
        },
        {
          reg: "^#?查看违禁词",
          fnc: "query"
        },
        {
          reg: "^#?违禁词列表(原始|raw)?$",
          fnc: "list"
        },
        {
          reg: "^#?设置违禁词禁言时间(\\d+)$",
          fnc: "muteTime"
        },
        {
          reg: "^#(增加|减少|查看)头衔屏蔽词",
          fnc: "ProhibitedTitle"
        },
        {
          reg: "^#切换头衔屏蔽词匹配(模式)?$",
          fnc: "ProhibitedTitlePattern"
        },
        {
          reg: "^#?违禁词帮助$",
          fnc: "help"
        }
      ]

    })
  }

  get message() {
    if (this.e.toString === Object.prototype.toString) {
      return this.e.raw_message.trim()
    } else {
      return this.e.toString().trim()
    }
  }

  async help(e) {
    const msg = [
      "该命令匹配正则：",
      "^#?新增(模糊|精确|正则1|正则2|正则)?(踢|禁|撤|踢撤|禁撤|踢黑)?违禁词",
      "-------------------",
      "支持的模式：模糊，精确，正则1，正则2",
      "支持的处理方式：踢，禁，撤，踢撤，禁撤，踢黑",
      "-------------------",
      "命令示例：",
      "\"#新增违禁词123\" --- 默认添加精确禁违禁词",
      "\"#新增正则1违禁词^123456$\" --- 该种方法需将\"\\\"转义，如：\\d+\\d+\\d+，默认添加正则为正则1",
      "\"#新增正则2违禁词/^123456$/\" --- 该种方法无需转义",
      "\"#新增模糊踢违禁词123\" --- 添加模糊匹配处理方法为踢出群聊的正则"
    ].join("\n")
    e.reply(msg)
  }

  async accept(e) {
    const isWhite = Config.groupAdmin.whiteQQ.includes(e.user_id)
    if (!e.message || e.isMaster || e.member?.is_owner || e.member?.is_admin || isWhite) {
      return false
    }
    const bannedWords = groupBannedWords.initTextArr(e.group_id)
    if (_.isEmpty(bannedWords)) {
      return false
    }
    
    const trimmedKeyWord = this.#trimAlias(this.message)
    let data = null
    for (const [ k, v ] of bannedWords) {
      if (k.test(trimmedKeyWord)) {
        data = v
        break
      }
    }
    if (!data) return false
    const muteTime = groupBannedWords.getMuteTime(e.group_id)
    const punishments = {
      1: () => e.member.kick(),
      2: () => e.member.mute(muteTime),
      3: () => e.recall(),
      4: () => {
        e.member.kick()
        e.recall()
      },
      5: () => {
        e.member.mute(muteTime)
        e.recall()
      },
      6: () => {
        new GroupWhiteListCtrl().addList(e, e.user_id, "add", "blackQQ")
        e.member.kick()
      }
    }
    const groupPenaltyAction = {
      1: "踢出群聊",
      2: `禁言${muteTime}秒`,
      3: "撤回消息",
      4: "踢出群聊并撤回消息",
      5: `禁言${muteTime}秒并撤回消息`,
      6: "踢出群聊并加入黑名单"
    }
    if (punishments[data.penaltyType]) {
      punishments[data.penaltyType]()
      const keyWordTran = await groupBannedWords.keyWordTran(data.rawItem)
      const senderCard = e.sender.card || e.sender.nickname
      const wordNum = keyWordTran.length - 2
      const replaceWord = "*".repeat(wordNum < 0 ? 0 : wordNum)
      const bannedWord = typeof keyWordTran == "string" && keyWordTran.substr(0, 2) + replaceWord
      e.reply([
        `触发违禁词：${bannedWord}\n`,
        `触发者：${senderCard}(${e.user_id})\n`,
        `执行：${groupPenaltyAction[data.penaltyType]}`
      ], false, { recallMsg: 30 })
      return "return"
    }
  }

  /**
   * 过滤别名
   * @param msg
   */
  #trimAlias(msg) {
    let groupCfg = this.e.runtime.cfg.getGroup(this.group_id)
    let alias = groupCfg.botAlias
    if (!Array.isArray(alias)) {
      alias = [ alias ]
    }
    for (let name of alias) {
      if (msg.startsWith(name)) {
        msg = _.trimStart(msg, name).trim()
      }
    }
    return msg
  }

  async add(e) {
    if (!common.checkPermission(e, "admin", "admin")) return false
    let word = this.#trimAlias(this.message)
    let [ , matchType, penaltyType, words ] = word.match(/#?新增(模糊|精确|正则1|正则2|正则)?(踢|禁|撤|踢撤|禁撤)?违禁词(.*)/)

    if (!words) return this.help(e)
    // 校验正则
    if (/正则(1|2)?/.test(matchType)) {
      try {
        if (matchType == "正则2") {
          global.eval(words)
        } else {
          words = new RegExp(words)
        }
      } catch (error) {
        logger.error(`${Log_Prefix} 违禁词正则错误`, error)
        let msg = [
          "❎ 正则表达式错误",
          "-------------------",
          "使用示例：",
          "#新增正则违禁词^123456$",
          "该种方法需将\"\\\"转义，如：\\d+\\d+\\d+",
          "-------------------",
          "#新增正则2违禁词/^123456$/",
          "改种方法无需转义，如：/^123456$/"
        ].join("\n")
        return e.reply(msg)
      }
    }
    try {
      let res = groupBannedWords.addBannedWords(
        e.group_id, words.trim(), matchType, penaltyType, e.user_id
      )
      e.reply([
        "✅ 成功添加屏蔽词\n",
        "屏蔽词：",
        await res.words,
        `\n匹配模式：${res.matchType}\n`,
        `处理方式：${res.penaltyType}`
      ])
    } catch (error) {
      common.handleException(e, error)
    }
  }

  async del(e) {
    if (!common.checkPermission(e, "admin", "admin")) return false
    let word = this.#trimAlias(this.message)
    word = word.replace(/#?删除违禁词/, "").trim()
    if (!word) return e.reply("需要删除的屏蔽词为空")
    try {
      let msg = await groupBannedWords.delBannedWords(e.group_id, word)
      e.reply([ "✅ 成功删除：", msg ])
    } catch (error) {
      common.handleException(e, error)
    }
  }

  async query(e) {
    let word = this.#trimAlias(this.message)
    word = word.replace(/#?查看违禁词/, "").trim()
    if (!word) return e.reply("需要查询的屏蔽词为空")
    try {
      const { words, matchType, penaltyType, addedBy, date } = groupBannedWords.queryBannedWords(e.group_id, word)
      e.reply([
        "✅ 查询屏蔽词\n",
        "屏蔽词：",
        await words,
        `\n匹配模式：${matchType}\n`,
        `处理方式：${penaltyType}\n`,
        `添加人：${addedBy ?? "未知"}\n`,
        `添加时间：${date ?? "未知"}`
      ])
    } catch (error) {
      common.handleException(e, error)
    }
  }

  async list(e) {
    const bannedWords = groupBannedWords.initTextArr(e.group_id)
    if (_.isEmpty(bannedWords)) {
      return e.reply("❎ 没有违禁词")
    }
    let isRaw = /(原始)|(raw)/.test(e.msg)
    const msg = []
    for (const [ , v ] of bannedWords) {
      const { matchType, penaltyType, addedBy, date, rawItem } = v
      msg.push([
        "屏蔽词：",
        isRaw ? rawItem : await groupBannedWords.keyWordTran(rawItem),
        `\n匹配模式：${groupBannedWords.matchTypeMap[matchType]}\n`,
        `处理方式：${groupBannedWords.penaltyTypeMap[penaltyType]}\n`,
        `添加人：${addedBy ?? "未知"}\n`,
        `添加时间：${date ?? "未知"}`
      ])
    }
    common.getforwardMsg(e, msg)
  }

  async muteTime(e) {
    if (!common.checkPermission(e, "admin", "admin")) return false
    let time = e.msg.match(/\d+/)[0]
    groupBannedWords.setMuteTime(e.group_id, time)
    e.reply(`✅ 群${e.group_id}违禁词禁言时间已设置为${time}s`)
  }

  // 增删查头衔屏蔽词
  async ProhibitedTitle(e) {
  // 获取现有的头衔屏蔽词
    let shieldingWords = groupBannedWords.getTitleBannedWords(e.group_id)
    // 判断是否需要查看头衔屏蔽词
    if (/查看/.test(e.msg)) {
    // 返回已有的头衔屏蔽词列表
      return e.reply(`现有的头衔屏蔽词如下：${shieldingWords.join("\n")}`)
    }
    if (!common.checkPermission(e, "admin", "admin")) return false
    // 获取用户输入的要增加或删除的屏蔽词
    let message = e.msg.replace(/#|(增加|减少)头衔屏蔽词/g, "").trim().split(",")
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
        groupBannedWords.addTitleBannedWords(e.group_id, newWords)
        e.reply(`✅ 成功添加：${newWords.join(",")}`)
      }
      // 提示已有的屏蔽词
      if (!_.isEmpty(existingWords)) {
        e.reply(`❎ 以下词已存在：${existingWords.join(",")}`)
      }
    } else {
    // 删除已有的屏蔽词
      if (!_.isEmpty(existingWords)) {
        groupBannedWords.delTitleBannedWords(e.group_id, existingWords)
        e.reply(`✅ 成功删除：${existingWords.join(",")}`)
      }
      // 提示不在屏蔽词中的词
      if (!_.isEmpty(newWords)) {
        e.reply(`❎ 以下词未在屏蔽词中：${newWords.join(",")}`)
      }
    }
  }

  // 修改头衔匹配模式
  async ProhibitedTitlePattern(e) {
    if (!common.checkPermission(e, "admin", "admin")) return false
    let res = groupBannedWords.setTitleFilterModeChange(e.group_id)
    e.reply(`✅ 已修改匹配模式为${res ? "精确" : "模糊"}匹配`)
  }
}
