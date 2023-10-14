import plugin from '../../../lib/plugins/plugin.js'
import _ from 'lodash'
import { puppeteer, funApi } from '../model/index.js'
import { SEARCH_MAP } from '../constants/search.js'
import common from '../lib/common/common.js'
const searchReg = new RegExp(`^#?(${_.keys(SEARCH_MAP).join('|')})搜索(.*)`)

export class NewSearch extends plugin {
  constructor () {
    super({
      name: '椰奶搜索',
      event: 'message',
      priority: 500,
      rule: [
        {
          reg: searchReg,
          fnc: 'search'
        },
        {
          reg: '^#?搜索菜单$',
          fnc: 'help'
        },
        {
          reg: '^#bgg搜索',
          fnc: 'bggSearch'
        },
        {
          reg: '^#bgg排行$',
          fnc: 'bggRank'
        }
      ]

    })
  }

  async help (e) {
    const searchs = Object.keys(SEARCH_MAP)
    const menu = '当前支持的搜索引擎：\n'
    const tip = '\n格式：<搜索引擎> + 搜索 + <关键词>\n比如：萌娘百科搜索可莉'
    return e.reply(menu + searchs.join('、') + tip)
  }

  async search (e) {
    let regRet = searchReg.exec(e.msg)
    if (/(lp|ip)|(i|p|l)(地址|查询)/ig.test(regRet[2])) return e.reply('(;｀O´)o警告！！触发屏蔽词！！！', true)
    let url = SEARCH_MAP[regRet[1]] + encodeURIComponent(regRet[2])
    e.reply([await puppeteer.Webpage({ url }), url])
  }

  async bggSearch (e) {
    let keyword = e.msg.replace(/#?bgg搜索/, '')
    funApi.bgg(keyword)
      .then(res => e.reply(res))
      .catch(err => common.handleException(e, err))
  }

  async bggRank (e) {
    let url = 'https://boardgamegeek.com/browse/boardgame'
    e.reply([await puppeteer.Webpage({ url }), url])
  }
}
