import { common, GroupBannedWords as groupBannedWords } from "../../model/index.js"
import { Config } from "../../components/index.js"
import _ from "lodash"

export class GroupBannedWords extends plugin {
  constructor() {
    super({
      name: "椰奶群管-违禁词",
      event: "message.group",
      priority: 1,
      rule: [
        {
          reg: "^#?新增(模糊|精确|正则)?(踢|禁|撤|踢撤|禁撤)?违禁词",
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
        }
      ]

    })
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
    const KeyWord = e.raw_message.trim()
    const trimmedKeyWord = this.#trimAlias(KeyWord)
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
      2: () => this.#mute(muteTime),
      3: () => e.recall(),
      4: () => {
        e.member.kick()
        e.recall()
      },
      5: () => {
        this.#mute(muteTime)
        e.recall()
      }
    }
    const groupPenaltyAction = {
      1: "踢出群聊",
      2: `禁言${muteTime}秒`,
      3: "撤回消息",
      4: "踢出群聊并撤回消息",
      5: `禁言${muteTime}秒并撤回消息`
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
   * 禁言
   * @param time
   */
  #mute(time) {
    const e = this.e
    e.member.mute(time)
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
    let word = this.#trimAlias(e.raw_message)
    word = word.match(/^#?新增(模糊|精确|正则)?(踢|禁|撤|踢撤|禁撤)?违禁词(.*)$/)
    if (!word[3]) return e.reply("需要添加的屏蔽词为空")
    // 校验正则
    if (word[1] === "正则") {
      try {
        global.eval(word[3])
      } catch {
        return e.reply("正则表达式错误")
      }
    }
    try {
      let res = groupBannedWords.addBannedWords(
        e.group_id, word[3].trim(), word[1], word[2], e.user_id
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
    let word = this.#trimAlias(e.raw_message)
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
    let word = this.#trimAlias(e.raw_message)
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
        `\n匹配模式：${bannedWords.matchTypeMap[matchType]}\n`,
        `处理方式：${bannedWords.penaltyTypeMap[penaltyType]}\n`,
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
