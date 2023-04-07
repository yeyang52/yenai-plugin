// import _ from 'lodash'
import { Data, Plugin_Path } from '../components/index.js'
export default new class {
  constructor () {
    this.root = `${Plugin_Path}/config/group`
    this.penaltyTypeMap = {
      踢: 1,
      禁: 2,
      撤: 3,
      踢撤: 4,
      禁撤: 5
    }
    this.matchTypeMap = {
      精确: 1,
      模糊: 2
    }
  }

  addBannedWords (
    groupId, words, matchType = '精确', penaltyType = '禁'
  ) {
    let data = Data.readJSON(`${groupId}.json`, this.root)
    if (!data.bannedWords) data.bannedWords = {}
    data.bannedWords[words] = {
      matchType: this.matchTypeMap[matchType],
      penaltyType: this.penaltyTypeMap[penaltyType]
    }
    Data.writeJSON(`${groupId}.json`, data, this.root)
    return {
      words,
      matchType,
      penaltyType
    }
  }

  delBannedWords (groupId, words) {

  }
}()
