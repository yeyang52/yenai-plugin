import { Config } from "../../components/index.js"
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
  const { groupAlone, botAlone, botAndGroupAlone } = getNoticeAlone()
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
    groupAdmin: getGroupAdmin()
  }
}
const getNoticeAlone = () => {
  const cfg = Config.getConfig("notice")
  const data = {
    groupAlone: [],
    botAlone: [],
    botAndGroupAlone: []
  }
  for (let i in cfg) {
    if (i == "default") continue
    const d = cfg[i]
    if (/bot:(.*):(.*)/.test(i)) {
      const reg = /bot:(.*):(.*)/.exec(i)
      d.bot_id = reg[1]
      d.group_id = reg[2]
      data.botAndGroupAlone.push(d)
    } else if (/bot:(.*)/.test(i)) {
      const reg = /bot:(.*)/.exec(i)
      d.bot_id = reg[1]
      data.botAlone.push(d)
    } else {
      d.group_id = i
      data.groupAlone.push(d)
    }
  }
  return data
}
const getGroupAdmin = () => {
  const cfg = { ...Config.groupAdmin }
  const r = []
  for (let i in cfg.groupVerify.SuccessMsgs) {
    r.push({
      groupId: i,
      msg: cfg.groupVerify.SuccessMsgs[i]
    })
  }
  cfg.groupVerify.SuccessMsgs = r
  return cfg
}
export function setConfigData(data, { Result }) {
  data = handleData(data)
  for (let key in data) {
    Config.modify(...key.split(/\.(.+)/, 2), data[key])
  }
  logger.debug(data)
  return Result.ok({}, "保存成功辣ε(*´･ω･)з")
}

const handleData = (data) => {
  const SuccessMsgs = data["groupAdmin.groupVerify.SuccessMsgs"]
  if (SuccessMsgs?.length) {
    data["groupAdmin.groupVerify.SuccessMsgs"] = SuccessMsgs.reduce((r, i) => {
      r[i.groupId] = i.msg
      return r
    }, {})
  }
  const noticeGroupAlone = data["notice.groupAlone"]
  if (noticeGroupAlone?.length) {
    noticeGroupAlone.forEach(e => {
      const group_id = e.group_id
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
