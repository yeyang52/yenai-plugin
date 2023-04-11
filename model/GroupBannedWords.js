import _ from 'lodash'
import moment from 'moment'
import { Data, Plugin_Path } from '../components/index.js'

export default new class {
  constructor () {
    this.root = `${Plugin_Path}/config/group`
    this.penaltyTypeMap = {
      1: '踢',
      2: '禁',
      3: '撤',
      4: '踢撤',
      5: '禁撤'
    }
    this.matchTypeMap = {
      1: '精确',
      2: '模糊'
    }
    this.dataCach = {}
    this.muteTimeCach = {}
    this.groupTitleCach = {}
  }

  addBannedWords (
    groupId, words, matchType = '精确', penaltyType = '禁', addedBy
  ) {
    let data = Data.readJSON(`${groupId}.json`, this.root)
    if (!data.bannedWords) data.bannedWords = {}
    if (data.bannedWords[words]) throw Error(`❎ 违禁词${words}已存在`)
    // 翻转对象
    let matchTypeMapMirr = _.invert(this.matchTypeMap)
    let penaltyTypeMapMirr = _.invert(this.penaltyTypeMap)
    data.bannedWords[words] = {
      matchType: Number(matchTypeMapMirr[matchType]),
      penaltyType: Number(penaltyTypeMapMirr[penaltyType]),
      date: moment().format('MMM Do YY'),
      addedBy
    }
    Data.writeJSON(`${groupId}.json`, data, this.root)
    delete this.dataCach[groupId]
    return {
      words: this.keyWordTran(words),
      matchType,
      penaltyType
    }
  }

  delBannedWords (groupId, words) {
    let data = Data.readJSON(`${groupId}.json`, this.root)
    if (!data.bannedWords[words]) throw Error(`❎ 违禁词${words}不存在`)
    delete data.bannedWords[words]
    delete this.dataCach[groupId]
    Data.writeJSON(`${groupId}.json`, data, this.root)
    return this.keyWordTran(words)
  }

  queryBannedWords (groupId, words) {
    let data = Data.readJSON(`${groupId}.json`, this.root)
    if (!data.bannedWords[words]) throw Error(`❎ 违禁词${words}不存在`)
    let { matchType, penaltyType } = data.bannedWords[words]
    return {
      ...data.bannedWords[words],
      words: this.keyWordTran(words),
      matchType: this.matchTypeMap[matchType],
      penaltyType: this.penaltyTypeMap[penaltyType]
    }
  }

  setMuteTime (groupId, time) {
    let data = Data.readJSON(`${groupId}.json`, this.root)
    data.muteTime = Number(time)
    Data.writeJSON(`${groupId}.json`, data, this.root)
    delete this.muteTimeCach[groupId]
    return true
  }

  getMuteTime (groupId) {
    if (this.muteTimeCach[groupId]) return this.muteTimeCach[groupId]
    let data = Data.readJSON(`${groupId}.json`, this.root)
    this.muteTimeCach[groupId] = data.muteTime ?? 300
    return this.muteTimeCach[groupId]
  }

  /** 关键词转换成可发送消息 */
  async keyWordTran (msg) {
    /** 图片 */
    if (msg.includes('{image')) {
      let tmp = msg.split('{image')
      if (tmp.length > 2) return false

      let md5 = tmp[1].replace(/}|_|:/g, '')

      msg = segment.image(`http://gchat.qpic.cn/gchatpic_new/0/0-0-${md5}/0`)
      msg.asface = true
    } else if (msg.includes('{at:')) {
      let tmp = msg.match(/{at:(.+?)}/g)

      for (let qq of tmp) {
        qq = qq.match(/[1-9][0-9]{4,14}/g)[0]
        let member = await Bot.getGroupMemberInfo(this.group_id, Number(qq)).catch(() => { })
        let name = member?.card ?? member?.nickname
        if (!name) continue
        msg = msg.replace(`{at:${qq}}`, `@${name}`)
      }
    } else if (msg.includes('{face')) {
      let tmp = msg.match(/{face(:|_)(.+?)}/g)
      if (!tmp) return msg
      msg = []
      for (let face of tmp) {
        let id = face.match(/\d+/g)
        msg.push(segment.face(id))
      }
    }

    return msg
  }

  /** 初始化已添加内容 */
  initTextArr (groupId) {
    if (this.dataCach[groupId]) return this.dataCach[groupId]

    try {
      const data = Data.readJSON(`${groupId}.json`, this.root)?.bannedWords
      this.dataCach[groupId] = {}
      this.dataCach[groupId].data = data
      this.dataCach[groupId].reg = []
      for (const item in data) {
        if (data[item].matchType == 2) {
          this.dataCach[groupId].reg.push(item)
        } else {
          this.dataCach[groupId].reg.push(`^${item}$`)
        }
      }
      return this.dataCach[groupId]
    } catch (error) {
      logger.error(error)
      logger.error(`json格式错误：${this.root}/${groupId}.json`)
      delete this.dataCach[groupId]
      return false
    }
  }

  setTitleFilterModeChange (groupId) {
    let data = Data.readJSON(`${groupId}.json`, this.root)
    data.TitleFilterModeChange = data.TitleFilterModeChange ? 0 : 1
    Data.writeJSON(`${groupId}.json`, data, this.root)
    return data.TitleFilterModeChange
  }

  getTitleFilterModeChange (groupId) {
    let data = Data.readJSON(`${groupId}.json`, this.root)
    return data.TitleFilterModeChange ?? 0
  }

  addTitleBannedWords (groupId, arr) {
    let data = Data.readJSON(`${groupId}.json`, this.root)
    if (!data.TitleBannedWords)data.TitleBannedWords = []
    data.TitleBannedWords.push(...arr)
    Data.writeJSON(`${groupId}.json`, data, this.root)
    delete this.groupTitleCach[groupId]
  }

  getTitleBannedWords (groupId) {
    if (this.groupTitleCach[groupId]) return this.groupTitleCach[groupId]
    let data = Data.readJSON(`${groupId}.json`, this.root).TitleBannedWords ?? []
    this.groupTitleCach[groupId] = data
    return data
  }

  delTitleBannedWords (groupId, arr) {
    let data = Data.readJSON(`${groupId}.json`, this.root)
    data.TitleBannedWords = _.differenceBy(data.TitleBannedWords, arr)
    Data.writeJSON(`${groupId}.json`, data, this.root)
    delete this.groupTitleCach[groupId]
  }
}()
