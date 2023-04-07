import { common, GroupBannedWords } from '../model/index.js'

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
        }
      ]

    })
  }

  async add (e) {
    if (!common.Authentication(e, 'admin', 'admin')) return false
    let word = e.toString().match(/^#?新增(模糊|精确)?(踢|禁|撤|踢撤|禁撤)?违禁词(.*)$/)
    if (!word[3]) return e.reply('需要添加的屏蔽词为空')
    let res = GroupBannedWords.addBannedWords(e.group_id, word[3], word[1], word[2])
    e.reply(
      [
        '✅ 成功添加违禁词\n',
        `违禁词：${res.words}\n`,
        `匹配模式：${res.matchType}\n`,
        `处理方式：${res.penaltyType}`
      ]
    )
  }

  async del (e) {
    if (!common.Authentication(e, 'admin', 'admin')) return false
    let word = e.toString().replace(/#?删除违禁词/)
    if (!word) return e.reply('需要删除的屏蔽词为空')
  }

  async query (e) {

  }
}
