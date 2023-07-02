import plugin from '../../../lib/plugins/plugin.js'
import fs from 'fs'
import _ from 'lodash'
import { Data } from '../components/index.js'
import { puppeteer } from '../model/index.js'
const helpType = {
  群管: 'gpAdmin',
  涩涩: 'sese'
}
const helpReg = new RegExp(
  `^#?椰奶(插件)?(${Object.keys(helpType).join('|')})?(帮助|菜单|功能)$`
)
export class YenaiHelp extends plugin {
  constructor () {
    super({
      name: '椰奶帮助',
      event: 'message',
      priority: 2000,
      rule: [
        {
          reg: helpReg,
          fnc: 'message'
        }
      ]
    })
  }

  async message () {
    return await help(this.e)
  }
}

async function help (e) {
  let custom = {}
  // let help = {}
  const special = e.msg.match(helpReg)[2]

  let diyCfg, sysCfg
  if (special) {
    let gpAdminHelp = await Data.importCfg(helpType[special])
    diyCfg = gpAdminHelp.diyCfg
    sysCfg = gpAdminHelp.sysCfg
  } else {
    let indexHelp = await Data.importCfg('help')
    diyCfg = indexHelp.diyCfg
    sysCfg = indexHelp.sysCfg
  }

  // custom = help

  let helpConfig = _.defaults(diyCfg.helpCfg || {}, custom.helpCfg, sysCfg.helpCfg)
  let helpList = diyCfg.helpList || custom.helpList || sysCfg.helpList
  let helpGroup = []

  _.forEach(helpList, (group) => {
    if (group.auth && group.auth === 'master' && !e.isMaster) {
      return true
    }

    _.forEach(group.list, (help) => {
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
  return await puppeteer.render('help/index', {
    helpCfg: helpConfig,
    helpGroup,
    bg: await rodom(),
    colCount: 3,
    element: 'default'
  }, {
    e,
    scale: 1.2
  })
}

const rodom = async function () {
  let image = fs.readdirSync('./plugins/yenai-plugin/resources/help/imgs/')
  let list_img = []
  for (let val of image) {
    list_img.push(val)
  }
  let imgs = list_img.length == 1 ? list_img[0] : list_img[_.random(0, list_img.length - 1)]
  return imgs
}
