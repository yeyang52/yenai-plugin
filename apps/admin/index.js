import { Config } from "../../components/index.js"
import { common } from "../../model/index.js"
import { getStatus, checkNumberValue, sendImg } from "./_utils.js"

const indexCfgTypeMap = {
  状态: {
    file: "state",
    key: "defaultState",
    type: "boolean"
  },
  陌生人点赞: "thumbUp.strangeThumbUp",
  渲染精度: {
    type: "number",
    key: "renderScale",
    limit: "50-200"
  }
}
const indexCfgReg = new RegExp(`^#椰奶设置(${Object.keys(indexCfgTypeMap).join("|")})(开启|关闭|(\\d+)秒)$`)

export class Admin_Index extends plugin {
  constructor() {
    super({
      name: "椰奶配置-index",
      event: "message",
      priority: 100,
      rule: [
        {
          reg: indexCfgReg,
          fnc: "indexSet"
        },
        {
          reg: "^#椰奶设置$",
          fnc: "sendImg"
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

  async sendImg(e) {
    let data = this.getIndexSetData()
    return sendImg(e, data)
  }

  getIndexSetData() {
    return {
      label: "#椰奶设置",
      list: {
        系统设置: [
          {
            key: "陌生人点赞",
            value: getStatus(Config.other.thumbUp.strangeThumbUp),
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
}
