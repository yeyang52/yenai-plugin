import plugin from '../../../lib/plugins/plugin.js'
import fs from 'fs'
import lodash from 'lodash'
import { Common, Data } from '../components/index.js'

export class yenai_help extends plugin {
  constructor() {
    super({
      name: '椰奶帮助',
      event: 'message',
      priority: 2000,
      rule: [
        {
          reg: '^#?椰奶(插件)?(群管)?(帮助|菜单|功能)$',
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

  if (/群管/.test(e.msg)) {
    diyCfg = await (await Data.importCfg('groupadmin')).diyCfg
    sysCfg = await (await Data.importCfg('groupadmin')).sysCfg
  }

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
  let bg = await rodom()
  let colCount = 3;
  return await Common.render('help/index', {
    helpCfg: helpConfig,
    helpGroup,
    bg,
    colCount,
    element: 'default'
  }, {
    e,
    scale: 2.0
  })
}

const rodom = async function () {
  var image = fs.readdirSync(`./plugins/yenai-plugin/resources/help/imgs/`);
  var list_img = [];
  for (let val of image) {
    list_img.push(val)
  }
  var imgs = list_img.length == 1 ? list_img[0] : list_img[lodash.random(0, list_img.length - 1)];
  return imgs;
}