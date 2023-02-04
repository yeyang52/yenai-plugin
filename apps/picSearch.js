import { PicSearch, common } from '../model/index.js'

export class newPicSearch extends plugin {
  constructor () {
    super({
      name: '椰奶图片搜索',
      event: 'message',
      priority: 2000,
      rule: [
        {
          reg: '^#?(椰奶)?搜图.*$',
          fnc: 'search'
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
}
