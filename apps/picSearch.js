import { PicSearch, common } from '../model/index.js'
import { Config } from '../components/index.js'
export class newPicSearch extends plugin {
  constructor () {
    super({
      name: '椰奶图片搜索',
      event: 'message',
      priority: 2000,
      rule: [
        {
          reg: '^#?(椰奶)?(以图)?搜图.*$',
          fnc: 'search'
        },
        {
          reg: /^#?SauceNAOapiKey.*$/i,
          fnc: 'UploadSauceNAOKey'
        }
      ]
    })
  }

  async search (e) {
    if (!e.img) return e.reply('请将图片与消息一起发送')
    let res = await PicSearch.SauceNAO(e.img[0])
    if (res.error) return e.reply(res.error)
    // if (!res.error && res.isTooLow) {
    //   return res.length > 1 ? common.recallsendMsg(e, res, true) : common.getRecallsendMsg(e, res)
    // }
    // e.reply(`SauceNAO 相似度 ${res.maxSimilarity}% 过低，自动使用 Ascii2D 进行搜索`)
    return res.message.length == 1 ? common.recallsendMsg(e, res.message[0], true) : common.getRecallsendMsg(e, res.message)
  }

  async UploadSauceNAOKey (e) {
    if (!e.isMaster) return false
    if (e.isGroup) return e.reply('请私聊进行添加')
    let apiKey = e.msg.replace(/#?SauceNAOapiKey/i, '').trim()
    if (!apiKey) return e.reply('❎ 请发送正确的apikey')
    Config.modify('picSearch', 'SauceNAOApiKey', apiKey)
    e.reply('OK')
  }
}
