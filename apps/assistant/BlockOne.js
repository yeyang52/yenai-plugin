import { Config, Version, YamlReader } from "../../components/index.js"
import { common } from "../../model/index.js"

export class BlockOne extends plugin {
  constructor() {
    super({
      name: "椰奶助手-拉黑白名单",
      event: "message",
      priority: 500,
      rule: [
        {
          reg: "^#拉[黑白](群聊?)?",
          fnc: "BlockOne"
        },
        {
          reg: "^#(取消|(删|移)除)拉[黑白](群聊?)?",
          fnc: "CancelBlockOne"
        }
      ]
    })
    this.configPath = "config/config/other.yaml"
    this.type = ""
  }

  async BlockOne(e) {
    if (!common.checkPermission(e, "master")) return
    this._getType("拉")
    this._getBlackResult(/^#拉[黑白](群聊?)?/)
    const { masterQQ } = Config
    if (!this.blackResult || (this.name == "拉黑" && common.getPermission(new Proxy({
      get isMaster() {
        return masterQQ.includes(this.user_id) || masterQQ.includes(String(this.user_id))
      },
      user_id: this.blackResult
    }, {
      get: (target, prop, receiver) => target[prop] ?? e[prop]
    }), "master") === true)) {
      return this.e.reply(`❎ ${this.name}失败，没有键入用户或群号`)
    }
    try {
      const yaml = new YamlReader(this.configPath)
      const data = yaml.get(this.type)
      if (!data?.includes?.(this.blackResult)) {
        if (!data || !Array.isArray(data)) {
          yaml.set(this.type, [ this.blackResult ])
        } else {
          yaml.addIn(this.type, this.blackResult)
        }
        await this.e.reply(`✅ 已把这个坏淫${this.name}掉惹！！！`)
      } else {
        await this.e.reply(`❎ 已把这个坏淫${this.name}过辣`)
      }
    } catch (error) {
      await this.e.reply(`❎ 额...${this.name}失败哩，可能这个淫比较腻害>_<`)
      logger.error(error)
    }
  }

  async CancelBlockOne(e) {
    if (!common.checkPermission(e, "master")) return
    this._getType("取消拉")
    this._getBlackResult(/^#(取消|(删|移)除)拉[黑白](群聊?)?/)

    if (!this.blackResult) { return this.e.reply(`❎ ${this.name}失败，没有键入用户或群号`) }
    try {
      const yaml = new YamlReader(this.configPath)
      const data = yaml.get(this.type)
      if (Array.isArray(data) && data.includes(this.blackResult)) {
        const item = data.indexOf(this.blackResult)
        yaml.delete(`${this.type}.${item}`)
        await this.e.reply(`✅ 已把这个坏淫${this.name}掉惹！！！`)
      } else {
        await this.e.reply(`❎ ${this.name}失败，找不到辣>_<`)
      }
    } catch (error) {
      await this.e.reply(`❎ 额...${this.name}失败哩，可能这个淫比较腻害>_<`)
      logger.error(error)
    }
  }

  _getBlackResult(reg) {
    if (this.e.at) {
      this.blackResult = this.e.at
    } else {
      if (Version.name == "TRSS-Yunzai") {
        /** TRSS-Yunzai匹配所有字符 */
        const blackId = this.e.msg.replace(reg, "").trim()
        this.blackResult = Number(blackId) || String(blackId)
      } else {
        const match = this.e.msg.match(/\d+/)
        if (match?.[0]) { this.blackResult = Number(match[0]) || String(match[0]) }
      }
    }
  }

  _getType(name) {
    this.name = name
    if (/^#(取消|(删|移)除)?拉白(群聊?)?/.test(this.e.msg)) {
      this.type += "white"
      this.name += "白"
    } else {
      this.type += "black"
      this.name += "黑"
    }
    if (/^#(取消|(删|移)除)?拉[黑白](群聊?)/.test(this.e.msg)) {
      this.type += "Group"
      this.name += "群"
    } else {
      this.type += Version.name == "TRSS-Yunzai" ? "User" : "QQ"
    }
  }
}
