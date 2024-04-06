import { update as Update } from "../../other/update.js"
export class YenaiUpdate extends plugin {
  constructor() {
    super({
      name: "椰奶更新插件",
      event: "message",
      priority: 1000,
      rule: [
        {
          reg: "^#*椰奶(插件)?(强制)?更新$",
          fnc: "update"
        }
      ]
    })
  }

  async update(e = this.e) {
    e.msg = `#${e.msg.includes("强制") ? "强制" : ""}更新yenai-plugin`
    const up = new Update(e)
    up.e = e
    return up.update()
  }
}
