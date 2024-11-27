import plugin from "../../../lib/plugins/plugin.js"
import fs from "fs"
import _ from "lodash"
import { Config } from "../components/index.js"
import { common, setu, puppeteer } from "../model/index.js"

const indexCfgTypeMap = {
  状态: {
    file: "state",
    key: "defaultState",
    type: "boolean"
  },
  陌生人点赞: "strangeThumbUp",
  渲染精度: {
    type: "number",
    key: "renderScale",
    limit: "50-200"
  }
}
// const SeSeCfgType = {
//   涩涩: "sese",
//   涩涩pro: "sesepro",
//   代理: {
//     name: "proxy",
//     key: "switchProxy"
//   }
// }
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
  输入: "input",
  删除缓存时间: {
    type: "number",
    key: "msgSaveDeltime",
    limit: ">120"
  },
  全部通知: "notificationsAll"
}

/** 支持群单独设置的项 */
const groupAloneKeys = [ "群消息", "群临时消息", "群撤回", "群管理变动", "群聊列表变动", "群成员变动", "加群通知", "禁言", "匿名" ]
/** 支持Bot单独设置的项 */
const botAloneKeys = [ "好友消息", "好友撤回", "好友申请", "好友列表变动", "输入", "群邀请" ]

const noticeCfgReg = new RegExp(`^#椰奶通知设置(${Object.keys(NoticeCfgTypeMap).join("|")})(群单独|bot单独|bot群单独)?(开启|关闭|取消|(\\d+)秒)$`)
const indexCfgReg = new RegExp(`^#椰奶设置(${Object.keys(indexCfgTypeMap).join("|")})(开启|关闭|(\\d+)秒)$`)

export class Admin extends plugin {
  constructor() {
    super({
      name: "椰奶配置",
      event: "message",
      priority: 100,
      rule: [
        {
          reg: indexCfgReg,
          fnc: "indexSet"
        },
        {
          reg: noticeCfgReg,
          fnc: "noticeSet"
        },
        {
          reg: "^#椰奶(通知)?设置$",
          fnc: "sendImg"
        },
        {
          reg: "^#椰奶(启用|禁用)全部通知$",
          fnc: "setAllNotice"
        }
      ]
    })
  }

  async indexSet(e) {
    if (!common.checkPermission(e, "master")) return
    let regRet = indexCfgReg.exec(e.msg)
    const rawkey = regRet[1]
    let value = regRet[2]
    let file = "other"
    let key = indexCfgTypeMap[rawkey]
    if (typeof key == "object") {
      key = key.key
      if (key.type === "number" && !regRet[3]) return
      if (key.file) file = key.file
      value = checkNumberValue(regRet[3])
    } else {
      if (!/(开启)|(关闭)/.test(value)) return
      value = value == "开启"
    }
    Config.modify(file, key, value)
    this.sendImg(e, "index")
  }

  async noticeSet(e) {
    if (!common.checkPermission(e, "master")) return
    let regRet = noticeCfgReg.exec(e.msg)
    const rawKey = regRet[1]
    let value = regRet[3]
    const alone = regRet[2]
    const aloneFunMap = {
      群单独: this.groupAloneSet,
      bot单独: this.botAloneSet,
      bot群单独: this.botAndGroupAloneSet
    }
    let key = NoticeCfgTypeMap[rawKey]
    if (typeof key == "object" && key.type == "number") {
      key = key.key
      if (!regRet[4]) return
      value = checkNumberValue(regRet[4])
    } else {
      if (!/(开启)|(关闭)/.test(value)) return
      value = value == "开启"
    }
    if (alone) {
      const fun = aloneFunMap[alone]
      const res = fun.call(this, key, value, rawKey)
      if (!res) return
    } else {
      this.setDefault(key, value)
    }
    this.sendImg(e, "notice")
  }

  setDefault(key, value) {
    return Config.modify("notice", `default.${key}`, value)
  }

  groupAloneSet(key, value, rawKey) {
    if (!groupAloneKeys.includes(rawKey)) {
      this.e.reply("❎ 该设置项不支持群单独设置")
      return false
    }
    return this.modifyCfg("notice", `${this.e.group_id}.${key}`, value, rawKey)
  }

  modifyCfg(name, key, value, comment) {
    return Config.modify(name, key, value, "config", false, comment)
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

  async sendImg(e, type = "index") {
    if (e.msg.includes("通知"))type = "notice"
    const data = this[`get${_.startCase(type)}SetData`](e)
    return await puppeteer.render("admin/index", {
      ...data,
      bg: await rodom()
    }, {
      e,
      scale: 1.4
    })
  }

  getIndexSetData(e) {
    return {
      label: "#椰奶设置",
      list: {
        系统设置: [
          {
            key: "陌生人点赞",
            value: getStatus(Config.other.strangeThumbUp),
            hint: "#椰奶设置陌生人点赞 + 开启/关闭",
            desc: "不活跃的号可能会点赞失败"
          },
          {
            key: "椰奶作为默认状态",
            value: getStatus(Config.state.defaultState),
            hint: "#椰奶设置状态 + 开启/关闭",
            desc: "开启后将使用椰奶版状态作为yunzai的默认状态"
          },
          {
            key: "渲染精度",
            value: getStatus(Config.other.renderScale),
            hint: "#椰奶设置渲染精度100",
            desc: "可选值50~200，建议100。设置高精度会提高图片的精细度，但因图片较大可能会影响渲染与发送速度"
          }
        ]
      }
    }
  }

  getNoticeSetData(e) {
    const _cfg = Config.getNotice(e.self_id, e.group_id)
    const _c = Config.getConfig("notice")
    const groupAlone = _c[e.group_id]
    const botAlone = _c["bot:" + e.self_id]
    const botAndGtoupAlone = _c[`bot:${e.self_id}:${e.group_id}`]
    const map = new Map()
    const getAloneType = (obj, type) => {
      if (!obj) return
      for (let k in obj) {
        map.set(k, type)
      }
    }
    getAloneType(botAlone, "bot单独")
    getAloneType(groupAlone, "群单独")
    getAloneType(botAndGtoupAlone, "bot群单独")
    let data = {}
    const special = [ "msgSaveDeltime" ]
    for (let key in _cfg) {
      if (special.includes(key)) {
        data[key] = getStatus(Number(_cfg[key]))
      } else {
        data[key] = getStatus(_cfg[key], map.get(key))
      }
    }
    return {
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
            key: "私聊输入",
            value: data.input,
            hint: "#椰奶通知设置输入 + 开启/关闭",
            desc: "对方正在输入事件"
          },
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
        ]
      }
    }
  }

  async setAllNotice(e) {
    if (!common.checkPermission(e, "master")) return
    let yes = /启用/.test(e.msg)
    for (let i in NoticeCfgTypeMap) {
      Config.modify("notice", `default.${NoticeCfgTypeMap[i]}`, yes)
    }
    this.sendImg(e, "notice")
  }

  // 查看涩涩设置
  async SeSe_Settings(e) {
    let set = setu.getSeSeConfig(e)
    let { proxy, pixiv, bika } = Config
    let { sese, sesepro } = Config.getNotice(e.self_id, e.group_id)
    let { sese: _sese, sesepro: _sesepro } = Config.getConfig("group")[e.group_id] ?? {}
    let data = {
      sese: getStatus(sese, _sese),
      sesepro: getStatus(sesepro, _sesepro),
      r18: getStatus(set.r18),
      cd: Number(set.cd),
      recall: set.recall ? set.recall : "无",
      switchProxy: getStatus(proxy.switchProxy),
      pixivDirectConnection: getStatus(pixiv.pixivDirectConnection),
      bikaDirectConnection: getStatus(bika.bikaDirectConnection),
      pixivImageProxy: pixiv.pixivImageProxy,
      bikaImageProxy: bika.bikaImageProxy,
      imageQuality: bika.imageQuality
    }
    // 渲染图像
    return await puppeteer.render("admin/sese", {
      ...data,
      bg: await rodom()
    }, {
      e,
      scale: 1.4
    })
  }
}

// 随机底图
const rodom = async function() {
  let image = fs.readdirSync("./plugins/yenai-plugin/resources/admin/imgs/bg")
  let listImg = []
  for (let val of image) {
    listImg.push(val)
  }
  let imgs = listImg.length == 1 ? listImg[0] : listImg[_.random(0, listImg.length - 1)]
  return imgs
}

const getStatus = function(rote, badge) {
  let _badge = ""
  if (badge) {
    _badge = `<span class="badge">${badge}</span>`
  }
  if (typeof rote === "number") {
    return `<div class="cfg-status">${rote}</div>`
  }
  if (rote) {
    return _badge + "<div class=\"cfg-status\" >已开启</div>"
  } else {
    return _badge + "<div class=\"cfg-status status-off\">已关闭</div>"
  }
}

/**
 * 检查一个数值是否满足给定的限制条件，并返回经过验证的数值。
 * @param {number} value - 要检查的数值。
 * @param {string} limit - 要检查的限制条件。
 *   限制条件可以是以下格式之一：
 *   - "X-Y" 形式的范围限制条件，其中 X 和 Y 是表示下限和上限的数字。
 *   - "<X" 或 ">X" 形式的比较限制条件，其中 X 是表示限制值的数字。
 * @returns {number} 经过验证的数值。如果给定的值超出了限制条件，则返回限制条件对应的最大值或最小值，否则返回原值。
 */
function checkNumberValue(value, limit) {
  // 检查是否存在限制条件
  if (!limit) {
    return value
  }
  // 解析限制条件
  const [ symbol, limitValue ] = limit.match(/^([<>])?(.+)$/).slice(1)
  const parsedLimitValue = parseFloat(limitValue)

  // 检查比较限制条件
  if ((symbol === "<" && value > parsedLimitValue) || (symbol === ">" && value < parsedLimitValue)) {
    return parsedLimitValue
  }

  // 检查范围限制条件
  if (!isNaN(value)) {
    const [ lowerLimit, upperLimit ] = limit.split("-").map(parseFloat)
    const clampedValue = Math.min(Math.max(value, lowerLimit || -Infinity), upperLimit || Infinity)
    return clampedValue
  }

  // 如果不符合以上任何条件，则返回原值
  return parseFloat(value)
}
