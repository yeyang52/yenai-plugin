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
    let msg = await PicSearch.SauceNAO(e.img[0])
    common.getforwardMsg(e, msg)
  }
}
