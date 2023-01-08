import plugin from '../../../lib/plugins/plugin.js'
import lodash from "lodash";
import { Config } from '../components/index.js'
import { setu, common } from '../model/index.js'

const SWITCH_ERROR = "主人没有开放这个功能哦(＊／ω＼＊)"

let NumReg = "[一壹二两三四五六七八九十百千万亿\\d]+"
let seturdReg = new RegExp(`^#(setu|无内鬼)\\s?((${NumReg})张)?$`)
let setcdReg = new RegExp(`^#?设置cd\\s?(\\d+)\\s(${NumReg})(s|秒)?$`, "i");
export class sese extends plugin {
  constructor() {
    super({
      name: '椰奶setu',
      event: 'message',
      priority: 500,
      rule: [
        {
          reg: '^#椰奶tag(.*)$',
          fnc: 'setutag'
        },
        {
          reg: seturdReg,//无内鬼
          fnc: 'seturd'
        },
        {
          reg: `^#撤回间隔(${NumReg})$`,
          fnc: 'setrecall',
          event: 'message.group',
          permission: 'master'
        },
        {
          reg: `^#群(c|C)(d|D)(${NumReg})$`,
          fnc: 'groupcd',
          event: 'message.group',
          permission: 'master'
        },
        {
          reg: '^#(开启|关闭)(私聊)?涩涩$',
          fnc: 'setsese',
          permission: 'master'
        },
        {
          reg: `(c|C)(d|D)(${NumReg})(s|秒)?$`,
          fnc: 'atcd',
          event: 'message.group',
          permission: 'master'
        },
        {
          reg: setcdReg,
          fnc: 'instsetcd',
          permission: 'master'
        }
      ]
    })
    this.startMsg = setu.startMsg
    this.CDMsg = setu.CDMsg
  }

  async seturd(e) {
    if (!e.isMaster) {
      if (!Config.getGroup(e.group_id).sesepro) return e.reply(SWITCH_ERROR)
    }

    let cds = await setu.getcd(e)

    if (cds) return e.reply(` ${lodash.sample(this.CDMsg)}你的CD还有${cds}`, false, { at: true })

    let num = seturdReg.exec(e.msg)

    num = num[3] ? common.translateChinaNum(num[3]) : 1

    if (num > 20) {
      return e.reply("❎ 最大张数不能大于20张")
    } else if (num > 6) {
      e.reply("你先等等，你冲的有点多~")
    } else {
      e.reply(lodash.sample(this.startMsg))
    }

    let r18 = await setu.getr18(e)

    let res = await setu.setuapi(e, r18, num)

    if (!res) return false

    setu.sendMsg(e, res)
  }

  //tag搜图
  async setutag(e) {
    if (!e.isMaster) {
      if (!Config.getGroup(e.group_id).sesepro) return e.reply(SWITCH_ERROR)
    }

    let cds = await setu.getcd(e)

    if (cds) return e.reply(` ${lodash.sample(this.CDMsg)}你的CD还有${cds}`, false, { at: true })

    let tag = e.msg.replace(/#|椰奶tag/g, "").trim()

    let num = e.msg.match(new RegExp(`(${NumReg})张`))

    if (!num) {
      num = 1
    } else {
      tag = tag.replace(num[0], "").trim()
      num = common.translateChinaNum(num[1])
    }

    if (num > 20) {
      return e.reply("❎ 最大张数不能大于20张")
    } else if (num > 6) {
      e.reply("你先等等，你冲的有点多~")
    } else {
      e.reply(lodash.sample(this.startMsg))
    }

    if (!tag) return e.reply("tag为空！！！", false, { at: true })

    tag = tag.split(" ")

    if (tag.length > 3) return e.reply("tag最多只能指定三个哦~", false, { at: true })

    tag = tag.map((item) => `&tag=${item}`).join("")

    let r18 = await setu.getr18(e)
    //接口
    let res = await setu.setuapi(e, r18, num, tag)

    if (!res) return false;

    //发送消息
    setu.sendMsg(e, res)
  }

  //设置群撤回间隔
  async setrecall(e) {
    let recall = e.msg.replace(/#|撤回间隔/g, "").trim()

    recall = common.translateChinaNum(recall)

    let res = await setu.getsetgroup(e, recall)

    if (res) {
      e.reply(`✅ 设置群${e.group_id}撤回间隔${recall}s成功`)
    } else {
      e.reply(`❎ 设置失败`)
    }

  }

  //群CD
  async groupcd(e) {
    let cd = e.msg.replace(/#|群cd/gi, "").trim()

    cd = common.translateChinaNum(cd)

    let res = await setu.getsetgroup(e, cd, false)

    if (res) {
      e.reply(`✅ 设置群${e.group_id}CD成功，CD为${cd}s`)
    } else {
      e.reply(`❎ 设置失败`)
    }
  }

  //开启r18
  async setsese(e) {
    let yes = /开启/.test(e.msg) ? true : false

    if (/私聊/.test(e.msg) || !e.isGroup) {
      setu.setr18(e, yes, false)
    } else {
      setu.setr18(e, yes, true)
    }
  }

  //艾特设置cd
  async atcd(e) {
    if (e.message[0].type != "at") return false;

    let cd = e.msg.match(new RegExp(NumReg))

    if (!cd) return e.reply("❎ CD为空，请检查", true);

    cd = common.translateChinaNum(cd[0])

    let qq = e.message[0].qq

    setu.setcd(e, qq, cd)
  }

  //指令设置
  async instsetcd(e) {
    let cdreg = setcdReg.exec(e.msg);
    let qq = cdreg[1]
    let cd = common.translateChinaNum(cdreg[2])
    setu.setcd(e, qq, cd)
  }
}
