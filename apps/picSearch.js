import { common, PicSearch } from '../model/index.js'
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
    let msg = await PicSearch.SauceNAO(e.img[0])
    common.getforwardMsg(e, msg)
  }
}
