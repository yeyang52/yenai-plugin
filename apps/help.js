import plugin from '../../../lib/plugins/plugin.js'
import fs from 'fs'
import lodash from 'lodash'
import { segment } from "oicq";
import puppeteer from '../../../lib/puppeteer/puppeteer.js'
import cfg from '../../../lib/config/config.js'
import { Cfg, Common, Data, Version, Plugin_Name, Plugin_Path } from '../components/index.js'
import Theme from './help/theme.js'

export class yenai_help extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: '椰奶插件_帮助',
      /** 功能描述 */
      dsc: '',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 2000,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^#?椰奶(插件)?帮助$',
          /** 执行方法 */
          fnc: 'message'
        }
      ]
    });
  }

  async message() {
    return await help(this.e);
  }

}

async function help(e) {
  let custom = {}
  let help = {}

  let { diyCfg, sysCfg } = await Data.importCfg('help')

  custom = help

  let helpConfig = lodash.defaults(diyCfg.helpCfg || {}, custom.helpCfg, sysCfg.helpCfg)
  let helpList = diyCfg.helpList || custom.helpList || sysCfg.helpList
  let helpGroup = []

  lodash.forEach(helpList, (group) => {
    if (group.auth && group.auth === 'master' && !e.isMaster) {
      return true
    }

    lodash.forEach(group.list, (help) => {
      let icon = help.icon * 1
      if (!icon) {
        help.css = 'display:none'
      } else {
        let x = (icon - 1) % 10
        let y = (icon - x - 1) / 10
        help.css = `background-position:-${x * 50}px -${y * 50}px`
      }
    })

    helpGroup.push(group)
  })
  let themeData = await Theme.getThemeData(diyCfg.helpCfg || {}, sysCfg.helpCfg || {})

  return await Common.render('help/index', {
    helpCfg: helpConfig,
    helpGroup,
    ...themeData,
    element: 'default'
  }, { e, scale: 1.2 })
}