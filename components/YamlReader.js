import fs from "fs"
import YAML from "yaml"
import _ from "lodash"
import chokidar from "chokidar"
// import Constant from '../server/constant/Constant.js'

export default class YamlReader {
  // 配置文件数字key
  static CONFIG_INTEGER_KEY = "INTEGER__"
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
    this.data = fs.readFileSync(this.yamlPath, "utf8")
    // parseDocument 将会保留注释
    this.document = YAML.parseDocument(this.data)
    if (this.isWatch && !this.watcher) {
      // eslint-disable-next-line import/no-named-as-default-member
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
  set(keyPath, value, comment = null) {
    keyPath = this.mapParentKeys(keyPath.split("."))
    if (!comment || this.get(keyPath) !== undefined) {
      this.document.setIn(keyPath, value)
    } else {
      this.document.addIn(keyPath, value)
    }

    if (comment) {
      let seq = this.document.getIn(keyPath, true)
      if (!seq.comment) seq.comment = comment
    }
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

  /**
   * 设置 document 的数据并保存（递归式）
   * @param data 要写入的数据
   */
  setData(data) {
    this.setDataRecursion(data, [])
    this.save()
  }

  /**
   * 递归式设置数据，但不保存
   * @param data
   * @param parentKeys
   */
  setDataRecursion(data, parentKeys) {
    if (Array.isArray(data)) {
      this.document.setIn(this.mapParentKeys(parentKeys), data)
    } else if (typeof data === "object" && data !== null) {
      for (const [ key, value ] of Object.entries(data)) {
        this.setDataRecursion(value, parentKeys.concat([ key ]))
      }
    } else {
      parentKeys = this.mapParentKeys(parentKeys)
      this.document.setIn(parentKeys, data)
    }
  }

  // 将数字key转为number类型，防止出现引号
  mapParentKeys(parentKeys) {
    return parentKeys.map((k) => {
      if (k.startsWith(YamlReader.CONFIG_INTEGER_KEY)) {
        const numericValue = Number(k.replace(YamlReader.CONFIG_INTEGER_KEY, ""))
        if (!isNaN(numericValue)) {
          return numericValue
        }
      }
      return k
    })
  }

  // 彻底删除某个key
  deleteKey(keyPath) {
    let keys = keyPath.split(".")
    keys = this.mapParentKeys(keys)
    this.document.deleteIn(keys)
    this.save()
  }

  save() {
    const yaml = this.document.toString()
    // 数据不变不写💩
    if (yaml === this.data) return
    this.isSave = true
    fs.writeFileSync(this.yamlPath, yaml, "utf8")
  }
}
