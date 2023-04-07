import { common, GroupBannedWords } from '../model/index.js'

export class NewGroupBannedWords extends plugin {
  constructor () {
    super({
      name: '椰奶群屏蔽词',
      event: 'message.group',
      priority: 500,
      rule: [
        {
          reg: '^#?新增屏蔽词.*$',
          fnc: 'add'
        },
        {
          reg: '^#?删除屏蔽词.*$',
          fnc: 'del'
        },
        {
          reg: '^#?查看屏蔽词.*$',
          fnc: 'query'
        }
      ]

    })
  }

  async add (e) {
    if (!common.Authentication(e, 'admin', 'admin')) return false
    let words = e.msg.replace(/#?新增屏蔽词/, '')?.split(',')
    if (!words) return e.reply('需要添加的屏蔽词为空')
    GroupBannedWords.addBannedWords(e.group_id, words)
  }

  async del (e) {

  }

  async query (e) {

  }
}
