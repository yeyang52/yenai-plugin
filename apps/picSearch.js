import { PicSearch, common } from '../model/index.js'
import { Config } from '../components/index.js'
import lodash from 'lodash'
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
          reg: '^#?(椰奶)?(以图)?搜番.*$',
          fnc: 'WhatAnime'
        },
        {
          reg: /^#?SauceNAOapiKey.*$/i,
          fnc: 'UploadSauceNAOKey'
        },
        {
          reg: /^#?(Ascii2D|ac)搜图.*$/i,
          fnc: 'Ascii2D'
        },
        {
          reg: /^#?(SauceNAO|sn)搜图.*$/i,
          fnc: 'SauceNAO'
        }
      ]
    })
  }

  async search (e) {
    if (!await this.handelImg(e, 'SauceNAO')) return
    await this.SauceNAO(e)
  }

  async handelImg (e, funName) {
    if (e.source) {
      let source
      if (e.isGroup) {
        source = (await e.group.getChatHistory(e.source.seq, 1)).pop()
      } else {
        source = (await e.friend.getChatHistory(e.source.time, 1)).pop()
      }
      e.img = [source.message.find(item => item.type == 'image')?.url]
    }
    if (!lodash.isEmpty(e.img)) return true
    e.sourceFunName = funName
    this.setContext('MonitorImg')
    e.reply('✅ 请发送图片')
    return false
  }

  async MonitorImg () {
    if (!this.e.img) {
      this.e.reply('❎ 未检测到图片操作已取消')
    } else {
      this[this.getContext().MonitorImg.sourceFunName](this.e)
    }
    this.finish('MonitorImg')
  }

  async SauceNAO (e) {
    if (!await this.handelImg(e, 'SauceNAO')) return
    let res = await PicSearch.SauceNAO(e.img[0])
      .catch(err => {
        e.reply(err.message)
        e.reply('SauceNAO搜图出错，自动使用Ascii2D进行搜索')
        this.Ascii2D(e)
      })
    if (!res) return

    res.maxSimilarity > 80 ? common.recallsendMsg(e, res.message, true) : common.getRecallsendMsg(e, res.message)
    if (res.maxSimilarity < Config.picSearch.SauceNAOMinSim) {
      e.reply(`SauceNAO 相似度 ${res.maxSimilarity}% 过低，使用Ascii2D进行搜索`)
      await this.Ascii2D(e)
    }
  }

  async Ascii2D (e) {
    if (!await this.handelImg(e, 'Ascii2D')) return
    let res = await PicSearch.Ascii2D(e.img[0]).catch(err => {
      e.reply(err.message)
    })
    if (!res) return
    common.getRecallsendMsg(e, res.color, { isxml: false })
    common.getRecallsendMsg(e, res.bovw, { isxml: false })
  }

  async WhatAnime (e) {
    if (!await this.handelImg(e, 'WhatAnime')) return
    let res = await PicSearch.WhatAnime(e.img[0])
    if (res.error) return e.reply(res.error)
    for (let i of res) {
      await e.reply(i)
    }
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
