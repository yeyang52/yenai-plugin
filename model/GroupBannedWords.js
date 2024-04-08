import _ from "lodash"
import moment from "moment"
import { Data, Plugin_Path } from "../components/index.js"

export default new class {
  constructor() {
    this.root = `${Plugin_Path}/config/group`
    this.penaltyTypeMap = {
      1: "踢",
      2: "禁",
      3: "撤",
      4: "踢撤",
      5: "禁撤"
    }
    this.matchTypeMap = {
      1: "精确",
      2: "模糊",
      3: "正则"
    }
    this.dataCach = new Map()
    this.muteTimeCach = new Map()
    this.groupTitleCach = new Map()
  }

  addBannedWords(
    groupId, words, matchType = "精确", penaltyType = "禁", addedBy
  ) {
    let data = Data.readJSON(`${groupId}.json`, this.root)
    if (!data.bannedWords) data.bannedWords = {}
    if (data.bannedWords[words]) throw new ReplyError(`❎ 违禁词${words}已存在`)
    // 翻转对象
    let matchTypeMapMirr = _.invert(this.matchTypeMap)
    let penaltyTypeMapMirr = _.invert(this.penaltyTypeMap)
    data.bannedWords[words] = {
      matchType: Number(matchTypeMapMirr[matchType]),
      penaltyType: Number(penaltyTypeMapMirr[penaltyType]),
      date: moment().format("MMM Do YY"),
      addedBy
    }
    Data.writeJSON(`${groupId}.json`, data, this.root)
    this.dataCach.delete(groupId)
    return {
      words: this.keyWordTran(words),
      matchType,
      penaltyType
    }
  }

  delBannedWords(groupId, words) {
    let data = Data.readJSON(`${groupId}.json`, this.root)
    if (!data.bannedWords[words]) throw new ReplyError(`❎ 违禁词${words}不存在`)
    delete data.bannedWords[words]
    this.dataCach.delete(groupId)
    Data.writeJSON(`${groupId}.json`, data, this.root)
    return this.keyWordTran(words)
  }

  queryBannedWords(groupId, words) {
    let data = Data.readJSON(`${groupId}.json`, this.root)
    if (!data.bannedWords[words]) throw new ReplyError(`❎ 违禁词${words}不存在`)
    let { matchType, penaltyType } = data.bannedWords[words]
    return {
      ...data.bannedWords[words],
      words: this.keyWordTran(words),
      matchType: this.matchTypeMap[matchType],
      penaltyType: this.penaltyTypeMap[penaltyType]
    }
  }

  setMuteTime(groupId, time) {
    let data = Data.readJSON(`${groupId}.json`, this.root)
    data.muteTime = Number(time)
    Data.writeJSON(`${groupId}.json`, data, this.root)
    this.muteTimeCach.delete(groupId)
    return true
  }

  getMuteTime(groupId) {
    if (this.muteTimeCach.get(groupId)) return this.muteTimeCach.get(groupId)
    let data = Data.readJSON(`${groupId}.json`, this.root)
    this.muteTimeCach.set(groupId, data.muteTime ?? 300)
    return data.muteTime ?? 300
  }

  /**
   * 关键词转换成可发送消息
   * @param msg
   */
  async keyWordTran(msg) {
    return msg
  }

  /**
   * 初始化已添加内容
   * @param groupId
   */
  initTextArr(groupId) {
    if (this.dataCach.get(groupId)) return this.dataCach.get(groupId)
    const escapeRegExp = (string) => {
      return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    }

    try {
      const data = Data.readJSON(`${groupId}.json`, this.root)?.bannedWords
      const _data = new Map()
      for (const item in data) {
        data[item].rawItem = item
        if (data[item].matchType == 2) {
          _data.set(new RegExp(escapeRegExp(item)), data[item])
        } else if (data[item].matchType == 3) {
          _data.set(global.eval(item), data[item])
        } else {
          _data.set(new RegExp(`^${escapeRegExp(item)}$`), data[item])
        }
      }
      this.dataCach.set(groupId, _data)
      return _data
    } catch (error) {
      logger.error(error)
      logger.error(`json格式错误：${this.root}/${groupId}.json`)
      delete this.dataCach[groupId]
      return false
    }
  }

  setTitleFilterModeChange(groupId) {
    let data = Data.readJSON(`${groupId}.json`, this.root)
    data.TitleFilterModeChange = data.TitleFilterModeChange ? 0 : 1
    Data.writeJSON(`${groupId}.json`, data, this.root)
    return data.TitleFilterModeChange
  }

  getTitleFilterModeChange(groupId) {
    let data = Data.readJSON(`${groupId}.json`, this.root)
    return data.TitleFilterModeChange ?? 0
  }

  addTitleBannedWords(groupId, arr) {
    let data = Data.readJSON(`${groupId}.json`, this.root)
    if (!data.TitleBannedWords)data.TitleBannedWords = []
    data.TitleBannedWords.push(...arr)
    Data.writeJSON(`${groupId}.json`, data, this.root)
    this.groupTitleCach.delete(groupId)
  }

  getTitleBannedWords(groupId) {
    if (this.groupTitleCach.get(groupId)) return this.groupTitleCach.get(groupId)
    let data = Data.readJSON(`${groupId}.json`, this.root).TitleBannedWords ?? []
    this.groupTitleCach.set(groupId, data)
    return data
  }

  delTitleBannedWords(groupId, arr) {
    let data = Data.readJSON(`${groupId}.json`, this.root)
    data.TitleBannedWords = _.differenceBy(data.TitleBannedWords, arr)
    Data.writeJSON(`${groupId}.json`, data, this.root)
    this.groupTitleCach.delete(groupId)
  }
}