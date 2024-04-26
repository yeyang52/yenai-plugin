import fs from "node:fs"
import yaml from "yaml"
import { Config, Version } from "../../components/index.js"
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
  }

  async BlockOne(e) {
    if (!common.checkPermission(e, "master")) return
    let type = ""
    let name = "拉"
    if (/^#拉白(群聊?)?/.test(this.e.msg)) {
      type += "white"
      name += "白"
    } else {
      type += "black"
      name += "黑"
    }
    if (/^#拉[黑白](群聊?)/.test(this.e.msg)) {
      type += "Group"
      name += "群"
    } else {
      type += Version.name == "TRSS-Yunzai" ? "User" : "QQ"
    }
    const configPath = "config/config/other.yaml"
    /** 判断at */
    if (this.e.at) {
      this.blackResult = this.e.at
    } else {
      if (Version.name == "TRSS-Yunzai") {
        /** TRSS-Yunzai匹配所有字符 */
        const blackId = this.e.msg.replace(/^#拉[黑白](群聊?)?/, "").trim()
        this.blackResult = Number(blackId) || String(blackId)
      } else {
        const match = this.e.msg.match(/\d+/)
        if (match?.[0]) { this.blackResult = Number(match[0]) || String(match[0]) }
      }
    }
    if (!this.blackResult || common.getPermission(new Proxy({
      get isMaster() { return Config.masterQQ.includes(this.user_id) || Config.masterQQ.includes(String(this.user_id)) },
      user_id: this.blackResult
    }, {
      get: (target, prop, receiver) => target[prop] ?? e[prop]
    }), "master") === true) { return this.e.reply(`❎ ${name}失败，没有键入用户或群号`) }
    try {
      const yamlContentBuffer = await fs.promises.readFile(configPath)
      const yamlContent = yamlContentBuffer.toString("utf-8")
      const data = yaml.parse(yamlContent)
      if (!Array.isArray(data[type])) { data[type] = [] }
      if (!data[type].includes(this.blackResult)) {
        data[type].push(this.blackResult)
        const updatedYaml = yaml.stringify(data, { quote: false })
        const resultYaml = updatedYaml.replace(/"/g, "")
        await fs.promises.writeFile(configPath, resultYaml, "utf-8")
        await this.e.reply(`✅ 已把这个坏淫${name}掉惹！！！`)
      } else {
        await this.e.reply(`❎ 已把这个坏淫${name}过辣`)
      }
    } catch (error) {
      await this.e.reply(`❎ 额...${name}失败哩，可能这个淫比较腻害>_<`)
      logger.error(error)
    }
  }

  async CancelBlockOne(e) {
    if (!common.checkPermission(e, "master")) return
    let type = ""
    let name = "取消拉"
    if (/^#(取消|删除|移除)(群聊?)?拉白(群聊?)?/.test(this.e.msg)) {
      type += "white"
      name += "白"
    } else {
      type += "black"
      name += "黑"
    }
    if (/^#(取消|删除|移除)拉[黑白](群聊?)/.test(this.e.msg)) {
      type += "Group"
      name += "群"
    } else {
      type += Version.name == "TRSS-Yunzai" ? "User" : "QQ"
    }
    const configPath = "config/config/other.yaml"
    if (this.e.at) {
      this.blackResult = this.e.at
    } else {
      if (Version.name == "TRSS-Yunzai") {
        const blackId = this.e.msg.replace(/^#(取消|(删|移)除)拉[黑白](群聊?)?/, "").trim()
        this.blackResult = Number(blackId) || String(blackId)
      } else {
        const match = this.e.msg.match(/\d+/)
        if (match?.[0]) { this.blackResult = Number(match[0]) || String(match[0]) }
      }
    }
    if (!this.blackResult) { return this.e.reply(`❎ ${name}失败，没有键入用户或群号`) }
    try {
      const yamlContentBuffer = await fs.promises.readFile(configPath)
      const yamlContent = yamlContentBuffer.toString("utf-8")
      const data = yaml.parse(yamlContent)
      if (Array.isArray(data[type]) && data[type].includes(this.blackResult)) {
        const itemToRemove = this.blackResult.toString()
        data[type] = data[type].filter(item => item.toString() !== itemToRemove)
        const updatedYaml = yaml.stringify(data)
        await fs.promises.writeFile(configPath, updatedYaml, "utf-8")
        await this.e.reply(`✅ 已把这个坏淫${name}掉惹！！！`)
      } else {
        await this.e.reply(`❎ ${name}失败，找不到辣>_<`)
      }
    } catch (error) {
      await this.e.reply(`❎ 额...${name}失败哩，可能这个淫比较腻害>_<`)
      logger.error(error)
    }
  }
}
