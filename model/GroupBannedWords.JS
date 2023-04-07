import { Data, Plugin_Path } from '../components/index.js'
import _ from 'lodash'
export default new class {
  constructor () {
    this.root = `${Plugin_Path}/config/group`
  }

  addBannedWords (groupId, words) {
    let data = Data.readJSON(`${groupId}.json`, this.root)
    if (!data.bannedWords)data.bannedWords = []
    if (Array.isArray(words)) words = [words]
    let uniqWords = _.uniq(words)
    data.bannedWords.push(...words)
    Data.writeJSON(`${groupId}.json`, data, this.root)
    return uniqWords
  }
}()
