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
          log: true
        }
      ]

    })
  }

  async monitor (e) {
    if (!e.message) return false
    // if (e.isMaster || e.member.is_owner || e.member.is_admin) return false
    GroupBannedWords.initTextArr(e.group_id)
    let keyWord = e.toString()
      .replace(/#|＃/g, '')
      .replace(`{at:${Bot.uin}}`, '')
      .trim()

    keyWord = this.trimAlias(keyWord)
    console.log('消息词：', keyWord)
    console.log(GroupBannedWords.dataCach)
    let is = GroupBannedWords.dataCach[e.group_id]
    if (_.isEmpty(is)) return false
    let arr = Object.keys(is)

    const word = arr.find((word) => keyWord.includes(word))
    if (!word) return false
    let type = is[word]
    const isAccurateModeOK = type.matchType == 1 && keyWord == word

    const isVagueModeOK = type.matchType == 2 && keyWord.includes(word)
    const isOK = isAccurateModeOK || isVagueModeOK
    if (isOK) {
      if (type.penaltyType == 3 || type.penaltyType == 4 || type.penaltyType == 5) {
        await e.recall()
      }
      if (type.penaltyType == 1 || type.penaltyType == 4) {
        await e.member.kick()
      }
      if (type.penaltyType == 2 || type.penaltyType == 5) {
        await e.member.mute(3600)
      }
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
      let res = GroupBannedWords.delBannedWords(e.group_id, word)
      e.reply(res)
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
}
