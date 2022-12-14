import YAML from 'yaml'
import chokidar from 'chokidar'
import fs from 'node:fs'
import YamlReader from '../model/YamlReader.js'
import cfg from '../../../lib/config/config.js'

const Path = process.cwd();
const Plugin_Name = 'yenai-plugin'
const Plugin_Path = `${Path}/plugins/${Plugin_Name}`;
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
    const files = fs.readdirSync(pathDef).filter(file => file.endsWith('.yaml'))
    for (let file of files) {
      if (!fs.existsSync(`${path}${file}`)) {
        fs.copyFileSync(`${pathDef}${file}`, `${path}${file}`)
      }
    }
  }

  /** 群配置 */
  getGroup(groupId = '') {
    let config = this.getConfig('whole')
    let group = this.getConfig("group")
    let defCfg = this.getdefSet('whole')

    if (group[groupId]) {
      return { ...defCfg, ...config, ...group[groupId] }
    }
    return { ...defCfg, ...config }
  }
  /**主人QQ */
  get masterQQ() {
    return cfg.masterQQ
  }
  //获取全局设置
  get Notice() {
    return this.getNotice()
  }
  //进群验证配置
  get verifycfg() {
    return this.getverifycfg();
  }
  //头衔屏蔽词
  get NoTitle() {
    return this.getNoTitle();
  }
  //头衔屏蔽词
  getNoTitle() { 
    let config = this.getConfig("Shielding_words")
    let def = this.getdefSet("Shielding_words")
    return { ...def, ...config }
  }
  //进群验证
  getverifycfg() {
    let config = this.getConfig("groupverify")
    let def = this.getdefSet("groupverify")
    return { ...def, ...config }
  }

  /** 通知配置 */
  getNotice() {
    let def = this.getdefSet('whole')
    let config = this.getConfig('whole')
    return { ...def, ...config }
  }

  /** 默认配置 */
  getdefSet(name) {
    return this.getYaml('default_config', name)
  }

  /** 用户配置 */
  getConfig(name) {
    return this.getYaml('config', name)
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
      fs.readFileSync(file, 'utf8')
    )

    this.watch(file, name, type)

    return this.config[key]
  }

  /** 监听配置文件 */
  watch(file, name, type = 'default_config') {
    let key = `${type}.${name}`

    if (this.watcher[key]) return

    const watcher = chokidar.watch(file)
    watcher.on('change', path => {
      delete this.config[key]
      if (typeof Bot == 'undefined') return
      logger.mark(`[椰奶修改配置文件][${type}][${name}]`)
      if (this[`change_${name}`]) {
        this[`change_${name}`]()
      }
    })

    this.watcher[key] = watcher
  }

  /**
   * @description: 修改设置
   * @param {String} name 文件名
   * @param {String} key 修改的key值
   * @param {*} value 修改的value值
   * @return {Boolean} 返回是否成功写入
   */
  modify(name, key, value) {
    let path = `${Plugin_Path}/config/config/${name}.yaml`
    new YamlReader(path).set(key, value)
    delete this.config[`config.${name}`]
  }

}
export default new Config()