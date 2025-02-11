import YAML from "yaml"
import chokidar from "chokidar"
import fs from "node:fs"
import YamlReader from "./YamlReader.js"
import cfg from "../../../lib/config/config.js"
import _ from "lodash"
import { Log_Prefix } from "#yenai.components"

const Path = process.cwd()
const Plugin_Name = "yenai-plugin"
const Plugin_Path = `${Path}/plugins/${Plugin_Name}`
class Config {
  constructor() {
    this.config = {}

    /** 监听文件 */
    this.watcher = { config: {}, defSet: {} }

    this.initCfg()
  }

  /** 初始化配置 */
  initCfg() {
    let path = `${Plugin_Path}/config/config/`
    let pathDef = `${Plugin_Path}/config/default_config/`
    const files = fs.readdirSync(pathDef).filter(file => file.endsWith(".yaml"))
    for (let file of files) {
      if (!fs.existsSync(`${path}${file}`)) {
        fs.copyFileSync(`${pathDef}${file}`, `${path}${file}`)
      } else {
        this.other.autoMaegeCfg && this.mergeCfg(`${path}${file}`, `${pathDef}${file}`, file)
      }
      this.watch(`${path}${file}`, file.replace(".yaml", ""), "config")
    }
  }

  async mergeCfg(cfgPath, defPath, name) {
    // 默认文件未变化不合并
    let defData = fs.readFileSync(defPath, "utf8")
    let redisData = await redis.get(`yenai:mergeCfg:${name}`)
    if (defData == redisData) return
    redis.set(`yenai:mergeCfg:${name}`, defData)

    const userDoc = YAML.parseDocument(fs.readFileSync(cfgPath, "utf8"))
    const defDoc = YAML.parseDocument(defData)
    let isUpdate = false
    const maege = (user, def) => {
      const existingKeys = new Map()
      for (const item of user) {
        existingKeys.set(item.key.value, item.value)
      }
      for (const item of def) {
        if (item?.key?.commentBefore?.includes?.("noMerge")) continue
        if (!existingKeys.has(item.key.value)) {
          logger.info(`${Log_Prefix}[合并配置][${name}][${item.key.value}]`)
          user.push(item)
          isUpdate = true
        } else if (YAML.isMap(item.value)) {
          const userV = existingKeys.get(item.key.value).items
          maege(userV, item.value.items)
        }
      }
    }
    maege(userDoc.contents.items, defDoc.contents.items)
    let yaml = userDoc.toString()
    isUpdate && fs.writeFileSync(cfgPath, yaml, "utf8")
  }

  getNotice(botId = "", groupId = "") {
    const config = this.getDefOrConfig("notice")
    const bot = `bot:${botId}`
    const botGroup = `bot:${botId}:${groupId}`
    return { ...config.default, ...config[groupId], ...config[bot], ...config[botGroup] }
  }

  /** 主人QQ */
  get masterQQ() {
    return cfg.masterQQ
  }

  get master() {
    return cfg.master
  }

  /** 获取其他设置 */
  get other() {
    return this.getDefOrConfig("other")
  }

  /** 获取点赞设置 */
  get thumbUp() {
    return this.getDefOrConfig("thumbUp")
  }

  /** 代理 */
  get proxy() {
    return this.getDefOrConfig("proxy")
  }

  /** pixiv */
  get pixiv() {
    return this.getDefOrConfig("pixiv")
  }

  /** 哔咔 */
  get bika() {
    return this.getDefOrConfig("bika")
  }

  /** 搜图 */
  get picSearch() {
    return this.getDefOrConfig("picSearch")
  }

  /** setu */
  get setu() {
    return this.getDefOrConfig("setu")
  }

  /** 状态 */
  get state() {
    return this.getDefOrConfig("state")
  }

  /** 群管 */
  get groupAdmin() {
    return this.getDefOrConfig("groupAdmin")
  }

  /**
   * 默认配置和用户配置
   * @param name
   */
  getDefOrConfig(name) {
    let def = this.getdefSet(name)
    let config = this.getConfig(name)
    function customizer(objValue, srcValue) {
      if (_.isArray(objValue)) {
        return srcValue
      }
    }
    return _.mergeWith({}, def, config, customizer)
  }

  /**
   * 默认配置
   * @param name
   */
  getdefSet(name) {
    return this.getYaml("default_config", name)
  }

  /**
   * 用户配置
   * @param name
   */
  getConfig(name) {
    return this.getYaml("config", name)
  }

  /**
   * 获取配置yaml
   * @param type 默认跑配置-defSet，用户配置-config
   * @param name 名称
   */
  getYaml(type, name) {
    let file = `${Plugin_Path}/config/${type}/${name}.yaml`
    let key = `${type}.${name}`

    if (this.config[key]) return this.config[key]

    this.config[key] = YAML.parse(
      fs.readFileSync(file, "utf8")
    )

    this.watch(file, name, type)

    return this.config[key]
  }

  /**
   * 监听配置文件
   * @param file
   * @param name
   * @param type
   */
  watch(file, name, type = "default_config") {
    let key = `${type}.${name}`

    if (this.watcher[key]) return

    // eslint-disable-next-line import/no-named-as-default-member
    const watcher = chokidar.watch(file)
    watcher.on("change", path => {
      delete this.config[key]
      if (typeof Bot == "undefined") return
      logger.mark(`${Log_Prefix}[修改配置文件][${type}][${name}]`)
      if (this[`change_${name}`]) {
        this[`change_${name}`]()
      }
    })

    this.watcher[key] = watcher
  }

  /**
   * 修改设置
   * @param {string} name 文件名
   * @param {string} key 修改的key值
   * @param {string | number} value 修改的value值
   * @param {'config'|'default_config'} type 配置文件或默认
   * @param {boolean} bot 是否修改Bot的配置
   * @param comment
   */
  modify(name, key, value, type = "config", bot = false, comment = null) {
    let path = `${bot ? Path : Plugin_Path}/config/${type}/${name}.yaml`
    new YamlReader(path).set(key, value, comment)
    delete this.config[`${type}.${name}`]
    return true
  }

  deleteKey(name, key, type = "config", bot = false) {
    let path = `${bot ? Path : Plugin_Path}/config/${type}/${name}.yaml`
    new YamlReader(path).deleteKey(key)
    delete this.config[`${type}.${name}`]
    return true
  }

  /**
   * 修改配置数组
   * @param {string} name 文件名
   * @param {string | number} key key值
   * @param {string | number} value value
   * @param {'add'|'del'} category 类别 add or del
   * @param {'config'|'default_config'} type 配置文件或默认
   * @param {boolean} bot  是否修改Bot的配置
   */
  modifyArr(name, key, value, category = "add", type = "config", bot = false) {
    let path = `${bot ? Path : Plugin_Path}/config/${type}/${name}.yaml`
    let yaml = new YamlReader(path)
    if (category == "add") {
      yaml.addIn(key, value)
    } else {
      let index = yaml.get(key).indexOf(value)
      yaml.delete(`${key}.${index}`)
    }
  }

  async change_pixiv() {
    let pixiv = (await import("../model/index.js")).Pixiv
    let PixivApi = (await import("../model/Pixiv/api.js")).default
    pixiv._PixivClient = new PixivApi(this.pixiv.refresh_token)
  }
}
export default new Config()
