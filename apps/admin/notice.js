import { Config, YamlReader } from "#yenai.components"
import { common } from "#yenai.model"
import { getStatus, checkNumberValue, sendImg } from "./_utils.js"
import _ from "lodash"

const NoticeCfgTypeMap = {
  好友消息: "privateMessage",
  群消息: "groupMessage",
  群临时消息: "grouptemporaryMessage",
  群撤回: "groupRecall",
  好友撤回: "PrivateRecall",
  // 申请通知
  好友申请: "friendRequest",
  群邀请: "groupInviteRequest",
  加群申请: "addGroupApplication",
  // 信息变动
  群管理变动: "groupAdminChange",
  // 列表变动
  好友列表变动: "friendNumberChange",
  群聊列表变动: "groupNumberChange",
  群成员变动: "groupMemberNumberChange",
  // 其他通知
  禁言: "botBeenBanned",
  删除缓存时间: {
    type: "number",
    key: "msgSaveDeltime",
    limit: ">120",
    toString() {
      return this.key
    }
  },
  全部通知: "notificationsAll"
}
const invertByNoticeCfgTypeMap = _.invert(NoticeCfgTypeMap)
/** 支持群单独设置的项 */
const groupAloneKeys = [ "群消息", "群临时消息", "群撤回", "群管理变动", "群聊列表变动", "群成员变动", "加群申请", "禁言" ]
/** 支持Bot单独设置的项 */
const botAloneKeys = [ "好友消息", "好友撤回", "好友申请", "好友列表变动", "群邀请" ]
const noticeCfgReg = new RegExp(`^#椰奶通知设置(${Object.keys(NoticeCfgTypeMap).join("|")})(群单独|bot单独|bot群单独|单独)?(开启|关闭|取消|(\\d+)秒?)$`)
export class Admin_Notice extends plugin {
  constructor() {
    super({
      name: "椰奶配置-通知",
      event: "message",
      priority: 100,
      rule: [
        {
          reg: noticeCfgReg,
          fnc: "noticeSet"
        },
        {
          reg: "^#椰奶通知设置$",
          fnc: "sendImg"
        },
        {
          reg: "^#椰奶(启用|禁用)全部通知$",
          fnc: "setAllNotice"
        }
      ]
    })
  }

  async noticeSet(e) {
    if (!common.checkPermission(e, "master")) return
    let regRet = noticeCfgReg.exec(e.msg)
    const rawKey = regRet[1]
    let value = regRet[3]
    let alone = regRet[2]
    const aloneFunMap = {
      群单独: this.groupAloneSet,
      bot单独: this.botAloneSet,
      bot群单独: this.botAndGroupAloneSet
    }
    let key = NoticeCfgTypeMap[rawKey]
    if (typeof key == "object" && key.type == "number") {
      if (!regRet[4]) return
      value = checkNumberValue(+regRet[4])
    } else if (value == "取消") {
      value = "_delete_"
    } else {
      value = value == "开启"
    }
    key = key.toString()
    if (alone) {
      if (alone === "单独") {
        if (e.isGroup) {
          alone = "群单独"
        } else {
          alone = "bot单独"
        }
      }
      const fun = aloneFunMap[alone]
      const res = fun.call(this, key, value, rawKey)
      if (!res) return
    } else {
      this.setDefault(key, value)
    }
    this.sendImg(e, "notice")
  }

  async setAllNotice(e) {
    if (!common.checkPermission(e, "master")) return
    let yes = /启用/.test(e.msg)
    const exclude = [ "msgSaveDeltime", "notificationsAll" ]
    for (let i in invertByNoticeCfgTypeMap) {
      if (exclude.includes(i)) continue
      Config.modify("notice", `default.${i}`, yes)
    }
    this.sendImg(e, "notice")
  }

  async sendImg(e) {
    let data = this.getNoticeSetData(e)
    return sendImg(e, data)
  }

  setDefault(key, value) {
    return Config.modify("notice", `default.${key}`, value)
  }

  groupAloneSet(key, value, rawKey) {
    if (!groupAloneKeys.includes(rawKey)) {
      this.e.reply("❎ 该设置项不支持群单独设置")
      return false
    }
    return this.modifyCfg("notice", `${YamlReader.CONFIG_INTEGER_KEY + this.e.group_id}.${key}`, value, rawKey)
  }

  modifyCfg(name, key, value, comment) {
    if (value == "_delete_") {
      return Config.deleteKey(name, key)
    } else {
      return Config.modify(name, key, value, "config", false, comment)
    }
  }

  botAloneSet(key, value, rawKey) {
    if (!botAloneKeys.includes(rawKey)) {
      this.e.reply("❎ 该设置项不支持bot单独设置")
      return false
    }
    return this.modifyCfg("notice", `bot:${this.e.self_id}.${key}`, value, rawKey)
  }

  botAndGroupAloneSet(key, value, rawKey) {
    if (!groupAloneKeys.includes(rawKey)) {
      this.e.reply("❎ 该设置项不支持bot群单独设置")
      return false
    }
    return this.modifyCfg("notice", `bot:${this.e.self_id}:${this.e.group_id}.${key}`, value, rawKey)
  }

  getNoticeSetData(e) {
    const _cfg = Config.getDefOrConfig("notice").default
    const _c = Config.getConfig("notice")
    const groupAlone = _c[e.group_id]
    const botAlone = _c["bot:" + e.self_id]
    const botAndGtoupAlone = _c[`bot:${e.self_id}:${e.group_id}`]
    const map = {}
    const specialList = []
    const getAloneType = (obj, type) => {
      if (_.isEmpty(obj)) return
      map[type] = []
      specialList.push(type)
      for (let k in obj) {
        const key = invertByNoticeCfgTypeMap[k]
        if (!key) continue
        map[type].push({
          key,
          value: getStatus(obj[k])
        })
      }
      if (!map[type]?.length) delete map[type]
    }
    getAloneType(botAlone, `Bot:${e.self_id} 单独配置`)
    getAloneType(groupAlone, `群:${e.group_id} 单独配置`)
    getAloneType(botAndGtoupAlone, `Bot:${e.self_id} & 群:${e.group_id} 单独配置`)
    let data = {}
    const special = [ "msgSaveDeltime" ]
    for (let key in _cfg) {
      if (special.includes(key)) {
        data[key] = getStatus(Number(_cfg[key]))
      } else {
        data[key] = getStatus(_cfg[key])
      }
    }
    return {
      specialList,
      list: {
        消息相关: [
          {
            key: "好友消息",
            value: data.privateMessage,
            hint: "#椰奶通知设置好友消息 + 开启/关闭",
            desc: "好友的消息转发给主人，包括戳一戳"
          },
          {
            key: "群消息",
            value: data.groupMessage,
            hint: "#椰奶通知设置群消息 + 开启/关闭",
            desc: "\"所有群聊\"的消息转发给主人"
          },
          {
            key: "群临时消息",
            value: data.grouptemporaryMessage,
            hint: "#椰奶通知设置群临时消息 + 开启/关闭",
            desc: "群聊临时消息"
          },
          {
            key: "群撤回",
            value: data.groupRecall,
            hint: "#椰奶通知设置群撤回 + 开启/关闭",
            desc: "群撤回监听"
          },
          {
            key: "好友撤回",
            value: data.PrivateRecall,
            hint: "#椰奶通知设置好友撤回 + 开启/关闭"
          }
        ],
        申请通知: [
          {
            key: "好友申请",
            value: data.friendRequest,
            hint: "#椰奶通知设置好友申请 + 开启/关闭",
            desc: "可以同意或拒绝"
          },
          {
            key: "加群申请",
            value: data.addGroupApplication,
            hint: "#椰奶通知设置加群申请 + 开启/关闭",
            desc: "加群申请通知"
          },
          {
            key: "群聊邀请",
            value: data.groupInviteRequest,
            hint: "#椰奶通知设置群邀请 + 开启/关闭"
          }
        ],
        列表变动: [
          {
            key: "好友列表变动",
            value: data.friendNumberChange,
            hint: "#椰奶通知设置好友列表变动 + 开启/关闭",
            desc: "好友的增加或减少发送给主人"
          },
          {
            key: "群聊列表变动",
            value: data.groupNumberChange,
            hint: "#椰奶通知设置群聊列表变动 + 开启/关闭",
            desc: "群聊的增加或减少发送给主人"
          },
          {
            key: "群成员变动",
            value: data.groupMemberNumberChange,
            hint: "#椰奶通知设置群成员变动 + 开启/关闭",
            desc: "群成员的增加或减少发送给主人"
          },
          {
            key: "群管理变动",
            value: data.groupAdminChange,
            hint: "#椰奶通知设置群管理变动 + 开启/关闭"
          }
        ],
        其他通知: [
          {
            key: "Bot被禁言",
            value: data.botBeenBanned,
            hint: "#椰奶通知设置禁言 + 开启/关闭"
          }
        ],
        系统设置: [
          {
            key: "通知全部主人",
            value: data.notificationsAll,
            hint: "#椰奶通知设置全部通知 + 开启/关闭",
            desc: "将通知发送给设置的全部主人，关闭则发给第一个主人"
          },
          {
            key: "删除缓存时间",
            value: data.msgSaveDeltime,
            hint: "#椰奶设置删除缓存时间 + 时间(秒)",
            desc: "不建议设置太久"
          }
        ],
        ...map
      }
    }
  }
}
