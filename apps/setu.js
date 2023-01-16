import plugin from '../../../lib/plugins/plugin.js'
import { Config } from '../components/index.js'
import { setu, common } from '../model/index.js'
import { NewConfig } from './set.js'
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
          reg: `^#(撤回间隔|群(c|C)(d|D))(${NumReg})$`,
          fnc: 'setGroupRecallAndCD',
          event: 'message.group',
          permission: 'master'
        },
        {
          reg: '^#(开启|关闭)(私聊)?涩涩$',
          fnc: 'setsese',
          permission: 'master'
        },
        {
          reg: `^#?(c|C)(d|D)(${NumReg})(s|秒)?$`,
          fnc: 'atSetCd',
          event: 'message.group',
          permission: 'master'
        },
        {
          reg: setcdReg,//设置cd
          fnc: 'setCd',
          permission: 'master'
        }
      ]
    })
  }

  async seturd(e) {
    if (!Config.getGroup(e.group_id).sesepro && !e.isMaster) return e.reply(SWITCH_ERROR)

    let iscd = setu.getremainingCd(e)

    if (iscd) return e.reply(` ${setu.CDMsg}你的CD还有${iscd}`, false, { at: true })

    let num = seturdReg.exec(e.msg)

    num = num[3] ? common.translateChinaNum(num[3]) : 1

    if (num > 20) {
      return e.reply("❎ 最大张数不能大于20张")
    } else if (num > 6) {
      e.reply("你先等等，你冲的有点多~")
    } else {
      e.reply(setu.startMsg)
    }

    let res = await setu.setuapi(e, setu.getR18(e.group_id), num)

    if (!res) return false

    setu.sendMsgOrSetCd(e, res)
  }

  //tag搜图
  async setutag(e) {
    if (!Config.getGroup(e.group_id).sesepro && !e.isMaster) return e.reply(SWITCH_ERROR)

    let iscd = setu.getremainingCd(e)

    if (iscd) return e.reply(` ${setu.CDMsg}你的CD还有${iscd}`, false, { at: true })

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
      e.reply(setu.startMsg)
    }

    if (!tag) return e.reply("tag为空！！！", false, { at: true })

    tag = tag.split(" ")

    if (tag.length > 3) return e.reply("tag最多只能指定三个哦~", false, { at: true })

    tag = tag.map((item) => `&tag=${item}`).join("")

    //接口
    let res = await setu.setuapi(e, setu.getR18(e.group_id), num, tag)

    if (!res) return false;

    //发送消息
    setu.sendMsgOrSetCd(e, res)
  }

  //设置群撤回间隔和cd
  async setGroupRecallAndCD(e) {
    let num = e.msg.replace(/#|撤回间隔|群cd/gi, "").trim()
    num = common.translateChinaNum(num)
    let type = /撤回间隔/.test(e.msg)
    setu.setGroupRecallTimeAndCd(e.group_id, num, type)
    new NewConfig().View_Settings(e)
  }

  //开启r18
  async setsese(e) {
    let isopen = /开启/.test(e.msg) ? true : false
    setu.setR18(e.group_id, isopen)
    new NewConfig().View_Settings(e)
  }

  //艾特设置cd
  async atSetCd(e) {
    let qq = e.message.find(item => item.type == 'at')?.qq

    if (!qq) return false;

    let cd = e.msg.match(new RegExp(NumReg))

    if (!cd) return e.reply("❎ CD为空，请检查", true);

    cd = common.translateChinaNum(cd[0])

    setu.setUserCd(e, qq, cd)
  }

  //指令设置
  async setCd(e) {
    let cdreg = setcdReg.exec(e.msg);
    let qq = cdreg[1]
    let cd = common.translateChinaNum(cdreg[2])
    setu.setUserCd(e, qq, cd)
  }
}
