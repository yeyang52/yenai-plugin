import { Version } from "../components/index.js"
import { puppeteer } from "../model/index.js"

export class NewVersion extends plugin {
  constructor() {
    super({
      name: "椰奶版本信息",
      event: "message",
      priority: 400,
      rule: [
        {
          reg: "^#?椰奶(插件)?版本$",
          fnc: "plugin_version"
        }
      ]
    })
  }

  async plugin_version(e) {
    return await puppeteer.render(
      "help/version-info",
      {
        currentVersion: Version.ver,
        changelogs: Version.logs
      },
      { e, scale: 2 }
    )
  }
}
