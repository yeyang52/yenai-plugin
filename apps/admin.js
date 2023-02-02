import plugin from '../../../lib/plugins/plugin.js'
import { update } from '../../other/update.js'
import { Version, Plugin_Name } from '../components/index.js'
import { puppeteer } from '../model/index.js'
export class Admin extends plugin {
  constructor () {
    super({
      name: '椰奶版本信息',
      event: 'message',
      priority: 400,
      rule: [
        {
          reg: '^#?椰奶(插件)?版本$',
          fnc: 'plugin_version'
        },
        {
          reg: '^#?椰奶(插件)?更新日志$',
          fnc: 'update_log'
        }
      ]
    })
    this.key = 'yenai:restart'
  }

  async plugin_version () {
    return versionInfo(this.e)
  }

  async update_log () {
    // eslint-disable-next-line new-cap
    let Update_Plugin = new update()
    Update_Plugin.e = this.e
    Update_Plugin.reply = this.reply

    if (Update_Plugin.getPlugin(Plugin_Name)) {
      this.e.reply(await Update_Plugin.getLog(Plugin_Name))
    }
    return true
  }
}

async function versionInfo (e) {
  return await puppeteer.render(
    'help/version-info',
    {
      currentVersion: Version.ver,
      changelogs: Version.logs,
      elem: 'cryo'
    },
    { e, scale: 2 }
  )
}
