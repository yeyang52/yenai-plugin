import { PicSearch, common } from '../model/index.js'
import { Config } from '../components/index.js'
import _ from 'lodash'
export class NewPicSearch extends plugin {
  constructor () {
    super({
      name: '椰奶图片搜索',
      event: 'message',
      priority: 2000,
      rule: [
        {
          reg: '^#?(椰奶)?(以图)?搜图$',
          fnc: 'SauceNAO'
        },
        {
          reg: /^#?(SauceNAO|sn)搜图$/i,
          fnc: 'SauceNAO'
        },
        {
          reg: /^#?(椰奶|WhatAnime|wa)?(以图)?搜番$/i,
          fnc: 'WhatAnime'
        },
        {
          reg: /^#?(Ascii2D|ac)搜图$/i,
          fnc: 'Ascii2D'
        },
        {
          reg: /^#设置SauceNAOApiKey/i,
          fnc: 'UploadSauceNAOKey'
        }

      ]
    })
  }

  async SauceNAO (e) {
    if (!await this._Authentication(e)) return
    if (!await this.handelImg(e, 'SauceNAO')) return
    await PicSearch.SauceNAO(e.img[0])
      .then(async res => {
        res.length == 1
          ? common.recallsendMsg(e, res[0], true)
          : common.recallSendForwardMsg(e, res, { xmlTitle: false })
      })
      .catch(async err => {
        await common.handleException(e, err)
        if (Config.picSearch.useAscii2dWhenFailed) {
          await e.reply('SauceNAO搜图出错，自动使用Ascii2D进行搜索')
          await this.Ascii2D(e)
        }
      })
  }

  async Ascii2D (e) {
    if (!await this._Authentication(e)) return
    if (!await this.handelImg(e, 'Ascii2D')) return
    await PicSearch.Ascii2D(e.img[0])
      .then(res => common.recallSendForwardMsg(e, [...res.color, ...res.bovw], { xmlTitle: false }))
      .catch(err => common.handleException(e, err))
  }

  async WhatAnime (e) {
    if (!await this._Authentication(e)) return
    if (!await this.handelImg(e, 'WhatAnime')) return
    await PicSearch.WhatAnime(e.img[0].replace('/c2cpicdw.qpic.cn/offpic_new/', '/gchat.qpic.cn/gchatpic_new/'))
      .then(async res => {
        for (let i of res) {
          await e.reply(i)
        }
      })
      .catch(err => common.handleException(e, err))
  }

  async UploadSauceNAOKey (e) {
    if (!(this.e.isMaster || this.e.user_id == 1509293009 || this.e.user_id == 2536554304)) { return true }
    if (e.isGroup) return e.reply('请私聊进行添加')
    let apiKey = e.msg.replace(/#设置SauceNAOapiKey/i, '').trim()
    if (!apiKey) return e.reply('❎ 请发送正确的apikey')
    Config.modify('picSearch', 'SauceNAOApiKey', apiKey)
    e.reply('OK')
  }

  async _Authentication (e) {
    if (!(this.e.isMaster || this.e.user_id == 1509293009 || this.e.user_id == 2536554304)) { return true }
    const { allowPM, limit, isMasterUse } = Config.picSearch
    if (isMasterUse) {
      e.reply('主人没有开放这个功能哦(＊／ω＼＊)')
      return false
    }
    if (!allowPM && !e.isGroup) {
      e.reply('主人已禁用私聊该功能')
      return false
    }
    if (!await common.limit(e.user_id, 'picSearch', limit)) {
      e.reply('您已达今日「搜图搜番」次数上限', true, { at: true })
      return false
    }
    return true
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
    if (!_.isEmpty(e.img)) return true
    e.sourceFunName = funName
    this.setContext('MonitorImg')
    e.reply('⚠ 请发送图片')
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
}
