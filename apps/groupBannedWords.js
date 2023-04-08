import { common, GroupBannedWords } from '../model/index.js'
import _ from 'lodash'

export class NewGroupBannedWords extends plugin {
  constructor () {
    super({
      name: '椰奶群违禁词',
      event: 'message.group',
      priority: 500,
      rule: [
        {
          reg: '^#?新增(模糊|精确)?(踢|禁|撤|踢撤|禁撤)?违禁词.*$',
          fnc: 'add'
        },
        {
          reg: '^#?删除违禁词.*$',
          fnc: 'del'
        },
        {
          reg: '^#?查看违禁词.*$',
          fnc: 'query'
        },
        {
          reg: '',
          fnc: 'monitor',
          log: false
        },
        {
          reg: '^#?违禁词列表$',
          fnc: 'list'
        },
        {
          reg: '^#?设置违禁词禁言时间(\\d+)$',
          fnc: 'muteTime'
        },
        {
          reg: '^#(增加|减少|查看)头衔屏蔽词.*$',
          fnc: 'ProhibitedTitle'
        },
        {
          reg: '^#切换头衔屏蔽词匹配(模式)?$',
          fnc: 'ProhibitedTitlePattern'
        }
      ]

    })
  }

  async monitor (e) {
    if (!e.message || e.isMaster || e.member.is_owner || e.member.is_admin) {
      return false
    }
    const groupBannedWords = GroupBannedWords.initTextArr(e.group_id)
    if (_.isEmpty(groupBannedWords)) {
      return false
    }
    const KeyWord = e.toString()
      .replace(/#|＃/g, '')
      .replace(`{at:${Bot.uin}}`, '')
      .trim()
    const trimmedKeyWord = this.trimAlias(KeyWord)
    const matchingWord = Object.keys(groupBannedWords).find((word) =>
      _.includes(trimmedKeyWord, word)
    )
    if (!matchingWord) return false

    const type = groupBannedWords[matchingWord]
    const isAccurateModeOK = type.matchType == 1 && trimmedKeyWord === matchingWord
    const isVagueModeOK = type.matchType == 2 && _.includes(trimmedKeyWord, matchingWord)
    const isOK = isAccurateModeOK || isVagueModeOK
    const punishments = {
      '1': async () => await e.member.kick(),
      '2': async () => await e.member.mute(GroupBannedWords.getMuteTime(e.group_id)),
      '3': async () => await e.recall(),
      '4': async () => {
        await e.member.kick()
        await e.recall()
      },
      '5': async () => {
        await e.member.mute(GroupBannedWords.getMuteTime(e.group_id))
        await e.recall()
      }
    }
    if (isOK && punishments[type.penaltyType]) {
      await punishments[type.penaltyType]()
      const keyWordTran = await GroupBannedWords.keyWordTran(matchingWord)
      const senderCard = e.sender.card || e.sender.nickname
      common.sendMasterMsg([
        `触发违禁词：${keyWordTran}\n`,
        `触发者：${senderCard}(${e.user_id})\n`,
        `触发群：${e.group_name}(${e.group_id})\n`,
        `执行：${GroupBannedWords.penaltyTypeMap[type.penaltyType]}`
      ])
    }
  }

  async add (e) {
    if (!common.Authentication(e, 'admin', 'admin')) return false
    let word = this.trimAlias(e.toString())
    word = word.match(/^#?新增(模糊|精确)?(踢|禁|撤|踢撤|禁撤)?违禁词(.*)$/)
    if (!word[3]) return e.reply('需要添加的屏蔽词为空')
    try {
      let res = GroupBannedWords.addBannedWords(
        e.group_id, word[3].trim(), word[1], word[2]
      )
      e.reply([
        '✅ 成功添加违禁词\n',
        '违禁词：',
        await res.words,
        `\n匹配模式：${res.matchType}\n`,
        `处理方式：${res.penaltyType}`
      ])
    } catch (error) {
      e.reply(error.message)
    }
  }

  async del (e) {
    if (!common.Authentication(e, 'admin', 'admin')) return false
    let word = this.trimAlias(e.toString())
    word = word.replace(/#?删除违禁词/, '').trim()
    if (!word) return e.reply('需要删除的屏蔽词为空')
    try {
      let msg = await GroupBannedWords.delBannedWords(e.group_id, word)
      e.reply(['✅ 成功删除：', msg])
    } catch (error) {
      e.reply(error.message)
    }
  }

  async query (e) {
    let word = this.trimAlias(e.toString())
    word = word.replace(/#?查看违禁词/, '').trim()
    if (!word) return e.reply('需要查询的屏蔽词为空')
    try {
      let res = GroupBannedWords.queryBannedWords(e.group_id, word)
      e.reply([
        '✅ 查询违禁词\n',
        '违禁词：',
        await res.words,
        `\n匹配模式：${res.matchType}\n`,
        `处理方式：${res.penaltyType}`
      ])
    } catch (error) {
      e.reply(error.message)
    }
  }

  async list (e) {
    const groupBannedWords = GroupBannedWords.initTextArr(e.group_id)
    let msg = []
    for (let i in groupBannedWords) {
      let { matchType, penaltyType } = groupBannedWords[i]
      msg.push([
        '违禁词：',
        await GroupBannedWords.keyWordTran(i),
        `\n匹配模式：${GroupBannedWords.matchTypeMap[matchType]}\n`,
        `处理方式：${GroupBannedWords.penaltyTypeMap[penaltyType]}`
      ])
    }
    common.getforwardMsg(e, msg)
  }

  async muteTime (e) {
    let time = e.msg.match(/\d+/)[0]
    GroupBannedWords.setMuteTime(e.group_id, time)
    e.reply(`✅ 群${e.group_id}违禁词禁言时间已设置为${time}s`)
  }

  /** 过滤别名 */
  trimAlias (msg) {
    let groupCfg = this.e.runtime.cfg.getGroup(this.group_id)
    let alias = groupCfg.botAlias
    if (!Array.isArray(alias)) {
      alias = [alias]
    }
    for (let name of alias) {
      if (msg.startsWith(name)) {
        msg = _.trimStart(msg, name).trim()
      }
    }

    return msg
  }

  // 增删查头衔屏蔽词
  async ProhibitedTitle (e) {
  // 获取现有的头衔屏蔽词
    let shieldingWords = GroupBannedWords.getTitleBannedWords(e.group_id)
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
        GroupBannedWords.addTitleBannedWords(e.group_id, newWords)
        e.reply(`✅ 成功添加：${newWords.join(',')}`)
      }
      // 提示已有的屏蔽词
      if (!_.isEmpty(existingWords)) {
        e.reply(`❎ 以下词已存在：${existingWords.join(',')}`)
      }
    } else {
    // 删除已有的屏蔽词
      if (!_.isEmpty(existingWords)) {
        GroupBannedWords.delTitleBannedWords(e.group_id, existingWords)
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
    if (!common.Authentication(e, 'admin', 'admin')) return false
    let res = GroupBannedWords.setTitleFilterModeChange(e.group_id)
    e.reply(`✅ 已修改匹配模式为${res ? '精确' : '模糊'}匹配`)
  }
}
