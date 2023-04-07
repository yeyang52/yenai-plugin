import _ from 'lodash'
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
  }

  addBannedWords (
    groupId, words, matchType = '精确', penaltyType = '禁'
  ) {
    let data = Data.readJSON(`${groupId}.json`, this.root)
    if (!data.bannedWords) data.bannedWords = {}
    if (data.bannedWords[words]) throw Error(`❎ 违禁词${words}已存在`)
    // 翻转对象
    let matchTypeMapMirr = _.invert(this.matchTypeMap)
    let penaltyTypeMapMirr = _.invert(this.penaltyTypeMap)
    data.bannedWords[words] = {
      matchType: matchTypeMapMirr[matchType],
      penaltyType: penaltyTypeMapMirr[penaltyType]
    }
    Data.writeJSON(`${groupId}.json`, data, this.root)
    return {
      words,
      matchType,
      penaltyType
    }
  }

  delBannedWords (groupId, words) {
    let data = Data.readJSON(`${groupId}.json`, this.root)
    if (!data.bannedWords[words]) throw Error(`❎ 违禁词${words}不存在`)
    delete data.bannedWords[words]
    Data.writeJSON(`${groupId}.json`, data, this.root)
    return '✅ 成功删除' + words
  }

  queryBannedWords (groupId, words) {
    let data = Data.readJSON(`${groupId}.json`, this.root)
    if (!data.bannedWords[words]) throw Error(`❎ 违禁词${words}不存在`)
    let { matchType, penaltyType } = data.bannedWords[words]
    return {
      words,
      matchType: this.matchTypeMap[matchType],
      penaltyType: this.penaltyTypeMap[penaltyType]
    }
  }
}()
