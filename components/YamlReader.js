import fs from "fs"
import YAML from "yaml"
import _ from "lodash"
import chokidar from "chokidar"
// import Constant from '../server/constant/Constant.js'

export default class YamlReader {
  /**
   * 读写yaml文件
   * @param yamlPath yaml文件绝对路径
   * @param isWatch 是否监听文件变化
   */
  constructor(yamlPath, isWatch = false) {
    this.yamlPath = yamlPath
    this.isWatch = isWatch
    this.initYaml()
  }

  initYaml() {
    // parseDocument 将会保留注释
    this.document = YAML.parseDocument(fs.readFileSync(this.yamlPath, "utf8"))
    if (this.isWatch && !this.watcher) {
      this.watcher = chokidar.watch(this.yamlPath).on("change", () => {
        if (this.isSave) {
          this.isSave = false
          return
        }
        this.initYaml()
      })
    }
  }

  /** 返回读取的对象 */
  get jsonData() {
    if (!this.document) {
      return null
    }
    return this.document.toJSON()
  }

  /* 检查集合是否包含key的值 */
  has(keyPath) {
    return this.document.hasIn(keyPath.split("."))
  }

  /* 返回key的值 */
  get(keyPath) {
    return _.get(this.jsonData, keyPath)
  }

  /* 修改某个key的值 */
  set(keyPath, value) {
    this.document.setIn([ keyPath ], value)
    this.save()
  }

  /* 删除数组数据 */
  delete(keyPath) {
    this.document.deleteIn(keyPath.split("."))
    this.save()
  }

  // 数组添加数据
  addIn(keyPath, value) {
    this.document.addIn(keyPath.split("."), value)
    this.save()
  }

  // 彻底删除某个key
  deleteKey(keyPath) {
    let keys = keyPath.split(".")
    keys = this.mapParentKeys(keys)
    this.document.deleteIn(keys)
    this.save()
  }

  save() {
    this.isSave = true
    let yaml = this.document.toString()
    fs.writeFileSync(this.yamlPath, yaml, "utf8")
  }
}
