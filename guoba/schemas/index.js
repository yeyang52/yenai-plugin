import { Config, YamlReader, Plugin_Path } from "../../components/index.js"
import _ from "lodash"
import notice from "./notice.js"
import thumbUp from "./thumbUp.js"
import state from "./state.js"
import bika from "./bika.js"
import pixiv from "./pixiv.js"
import picSearch from "./picSearch.js"
import proxy from "./proxy.js"
import other from "./other.js"
import groupAdmin from "./groupAdmin.js"
export const schemas = [
  ...notice,
  ...state,
  ...thumbUp,
  ...groupAdmin,
  ...proxy,
  ...bika,
  ...pixiv,
  ...picSearch,
  ...other
]

export function getConfigData() {
  const { groupAlone, botAlone, botAndGroupAlone } = parseNoticeAlone()
  return {
    notice: {
      default: Config.getNotice(),
      groupAlone,
      botAlone,
      botAndGroupAlone
    },
    pixiv: Config.pixiv,
    bika: Config.bika,
    picSearch: Config.picSearch,
    other: Config.other,
    state: Config.state,
    proxy: Config.proxy,
    thumbUp: Config.thumbUp,
    groupAdmin: parseGroupAdmin()
  }
}
function parseNoticeAlone() {
  const cfg = Config.getConfig("notice")
  const data = {
    groupAlone: [],
    botAlone: [],
    botAndGroupAlone: []
  }
  for (let key in cfg) {
    if (key == "default") continue
    const d = cfg[key]
    if (/bot:(.*):(.*)/.test(key)) {
      const reg = /bot:(.*):(.*)/.exec(key)
      d.bot_id = reg[1]
      d.group_id = reg[2]
      data.botAndGroupAlone.push(d)
    } else if (/bot:(.*)/.test(key)) {
      const reg = /bot:(.*)/.exec(key)
      d.bot_id = reg[1]
      data.botAlone.push(d)
    } else {
      d.group_id = key
      data.groupAlone.push(d)
    }
  }
  return data
}
const parseGroupAdmin = () => {
  const cfg = { ...Config.groupAdmin }
  cfg.groupVerify.SuccessMsgs = Object.entries(cfg.groupVerify.SuccessMsgs)
    .map(([ groupId, msg ]) => ({ groupId, msg }))
  return cfg
}

export function setConfigData(data, { Result }) {
  data = preprocessData(data)
  const dataMap = convertToNestedObject(data)
  for (let key in dataMap) {
    const path = `${Plugin_Path}/config/config/${key}.yaml`
    const y = new YamlReader(path)
    y.setData(dataMap[key])
    if (key == "notice") {
      removeExcessAlone(y, dataMap.notice)
    }
    if (key == "groupAdmin") {
      removeExcessAlone(y, dataMap.groupAdmin, "groupVerify.SuccessMsgs")
    }
  }
  return Result.ok({}, "保存成功辣ε(*´･ω･)з")
}

function removeExcessAlone(yamlReader, newData, path = "") {
  const get = data => path ? _.get(data, path) : data
  const existingData = get(yamlReader.jsonData)
  const existingKeys = Object.keys(existingData)
  const newKeys = Object.keys(get(newData)).map(key => key.replace(YamlReader.CONFIG_INTEGER_KEY, ""))
  existingKeys.filter(key => !newKeys.includes(key)).forEach(key => {
    if (/^\d+$/.test(key)) {
      key = YamlReader.CONFIG_INTEGER_KEY + key
    }
    console.log(path ? `${path}.` : "" + key)
    yamlReader.deleteKey((path ? `${path}.` : "") + key)
  })
}

function convertToNestedObject(data) {
  const result = {}

  for (const key in data) {
    if (Object.hasOwn(data, key)) {
      const keys = key.split(".")
      let obj = result

      keys.forEach((k, index) => {
        if (index === keys.length - 1) {
          obj[k] = data[key]
        } else {
          obj[k] = obj[k] || {}
          obj = obj[k]
        }
      })
    }
  }

  return result
}

function preprocessData(data) {
  const SuccessMsgs = data["groupAdmin.groupVerify.SuccessMsgs"]
  if (SuccessMsgs?.length) {
    data["groupAdmin.groupVerify.SuccessMsgs"] = SuccessMsgs.reduce((r, i) => {
      r[YamlReader.CONFIG_INTEGER_KEY + i.groupId] = i.msg
      return r
    }, {})
  }
  const noticeGroupAlone = data["notice.groupAlone"]
  if (noticeGroupAlone?.length) {
    noticeGroupAlone.forEach(e => {
      const group_id = YamlReader.CONFIG_INTEGER_KEY + e.group_id
      delete e.group_id
      data[`notice.${group_id}`] = e
    })
  }
  const noticeBotAlone = data["notice.botAlone"]
  if (noticeBotAlone?.length) {
    noticeBotAlone.forEach(e => {
      const bot_id = e.bot_id
      delete e.bot_id
      data[`notice.bot:${bot_id}`] = e
    })
  }
  const noticeBotAndGroupAlone = data["notice.botAndGroupAlone"]
  if (noticeBotAndGroupAlone?.length) {
    noticeBotAndGroupAlone.forEach(e => {
      const bot_id = e.bot_id
      const group_id = e.group_id
      delete e.bot_id
      delete e.group_id
      data[`notice.bot:${bot_id}:${group_id}`] = e
    })
  }
  delete data["notice.groupAlone"]
  delete data["notice.botAlone"]
  delete data["notice.botAndGroupAlone"]
  return data
}
