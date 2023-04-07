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
    return '✅ 成功删除' + words
  }

  queryBannedWords (groupId, words) {
    let data = Data.readJSON(`${groupId}.json`, this.root)
    if (!data.bannedWords[words]) throw Error(`❎ 违禁词${words}不存在`)
    let { matchType, penaltyType } = data.bannedWords[words]
    return {
      words: this.keyWordTran(words),
      matchType: this.matchTypeMap[matchType],
      penaltyType: this.penaltyTypeMap[penaltyType]
    }
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
    if (this.dataCach[groupId]) return

    try {
      this.dataCach[groupId] = Data.readJSON(`${groupId}.json`, this.root)?.bannedWords
    } catch (error) {
      logger.error(`json格式错误：${this.root}/${groupId}.json`)
      delete this.dataCach[groupId]
      return false
    }
  }
}()
