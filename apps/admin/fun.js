import { Config } from "../../components/index.js"
import { getStatus, sendImg } from "./_utils.js"
import { setu, common } from "#yenai.model"

const funCfgTypeMap = {
  sese: "other.sese",
  sesepro: "other.sesepro",
  涩涩: "other.sese",
  涩涩pro: "other.sesepro"
}

const funCfgReg = new RegExp(`^#椰奶娱乐设置(${Object.keys(funCfgTypeMap).join("|")})(开启|关闭|(\\d+)秒)$`)

export class Admin_Fun extends plugin {
  constructor() {
    super({
      name: "椰奶配置-index",
      event: "message",
      priority: 100,
      rule: [
        {
          reg: funCfgReg,
          fnc: "indexSet"
        },
        {
          reg: "^#椰奶娱乐设置$",
          fnc: "sendImg"
        }
      ]
    })
  }

  async indexSet(e) {
    if (!common.checkPermission(e, "master")) return
    let regRet = funCfgReg.exec(e.msg)
    const rawkey = regRet[1]
    let value = regRet[2] == "开启"
    let _key = funCfgTypeMap[rawkey]
    let [ file, ...key ] = _key.toString().split(".")
    key = key.join(".")

    Config.modify(file, key, value)
    this.sendImg(e)
  }

  async sendImg(e) {
    let data = this.getFunSetData(e)
    return sendImg(e, data)
  }

  getFunSetData(e) {
    const data = setu.getSeSeConfig(e)
    return {
      label: "#椰奶娱乐设置",
      list: {
        权限相关: [
          {
            key: "sese",
            value: getStatus(Config.other.sese),
            hint: "#椰奶娱乐设置sese + 开启/关闭"
          },
          {
            key: "sesepro",
            value: getStatus(Config.other.sesepro),
            hint: "#椰奶娱乐设置sesepro + 开启/关闭"
          }
        ],
        限制相关: [
          {
            key: "全年龄",
            value: getStatus(!!data.r18),
            hint: "#开启/关闭 涩涩",
            desc: "开启不适合所有年龄段设置"
          },
          {
            key: "CD",
            value: getStatus(data.cd),
            hint: "#群CD 30",
            desc: "当前单位全局CD时间"
          },
          {
            key: "撤回间隔",
            value: getStatus(data.recall ?? 0),
            hint: "#撤回间隔 30"
          }
        ],
        代理相关: [
          {
            key: "使用代理",
            value: getStatus(Config.proxy.switchProxy),
            hint: "#椰奶设置代理 + 开启/关闭",
            desc: "代理本插件绝大部分请求"
          },
          {
            key: "pixiv图片直连",
            value: getStatus(Config.pixiv.pixivDirectConnection),
            hint: "#pixiv 开启/关闭 直连",
            desc: "开启pixiv图片直接连接，不使用图片反代"
          },
          {
            key: "bika图片直连",
            value: getStatus(Config.bika.bikaDirectConnection),
            hint: "#pixiv 开启/关闭 直连",
            desc: "开启哔咔图片直接连接，不使用图片反代"
          },
          {
            key: "pixiv图片反代",
            value: getStatus(Config.pixiv.pixivImageProxy),
            hint: "#pixiv更换代理 i.pixiv.re",
            desc: "pixiv图片反向代理地址"
          },
          {
            key: "bika图片反代",
            value: getStatus(Config.bika.bikaImageProxy),
            hint: "暂无指令",
            desc: "bika图片反向代理地址"
          }
        ],
        其他设置: [
          {
            key: "哔咔图片质量",
            value: getStatus(Config.bika.imageQuality),
            hint: "#bika修改图片质量 原图",
            desc: "可选值：低质量，中等质量，高质量，原图"
          }
        ]
      }
    }
  }
}
