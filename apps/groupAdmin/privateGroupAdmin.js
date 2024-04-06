import { GroupAdmin as Ga, common } from "../../model/index.js"
import { Time_unit } from "../../constants/other.js"
import translateChinaNum from "../../tools/translateChinaNum.js"
// 正则
const Numreg = "[一壹二两三四五六七八九十百千万亿\\d]+"
const TimeUnitReg = Object.keys(Time_unit).join("|")
const muteMemberReg = new RegExp(`^#禁言\\s?(\\d+)\\s(\\d+)\\s(${Numreg})?(${TimeUnitReg})?$`)
export class PrivateGroupAdmin extends plugin {
  constructor() {
    super({
      name: "椰奶私聊群管",
      event: "message.private",
      priority: 500,
      rule: [
        {
          reg: muteMemberReg,
          fnc: "muteMember"
        },
        {
          reg: "^#解禁\\s?(\\d+)\\s(\\d+)$",
          fnc: "noMuteMember"
        },
        {
          reg: "^#全体(禁言|解禁)(\\d+)$",
          fnc: "muteAll"
        },
        {
          reg: "^#踢\\s?(\\d+)\\s(\\d+)$",
          fnc: "kickMember"
        }
      ]
    })
  }

  async muteMember(e) {
    let regRet = e.msg.match(muteMemberReg)
    let groupObj = e.bot.pickGroup(Number(regRet[1]))
    if (!common.checkPermission(e, "master", "admin", { groupObj })) return
    const time = translateChinaNum(regRet[3])
    await new Ga(e).muteMember(regRet[1], regRet[2], e.user_id, time, regRet[4])
      .then(res => e.reply(res))
      .catch(err => common.handleException(e, err))
  }

  async noMuteMember(e) {
    let regRet = e.msg.match(/^#解禁\s?(\d+)\s(\d+)$/)
    let groupObj = e.bot.pickGroup(Number(regRet[1]))
    if (!common.checkPermission(e, "master", "admin", { groupObj })) return

    await new Ga(e).muteMember(regRet[1], regRet[2], e.user_id, 0)
      .then(res => e.reply(res))
      .catch(err => common.handleException(e, err))
  }

  async muteAll(e) {
    let regRet = e.msg.match(/全体(禁言|解禁)(\d+)/)
    let groupObj = (e.bot ?? Bot).pickGroup(Number(regRet[2]))
    if (!common.checkPermission(e, "master", "admin", { groupObj })) return

    groupObj.muteAll(regRet[1] == "禁言")
    e.reply(`✅ 已将群「${groupObj.name}(${groupObj.group_id})」${regRet[1] == "禁言" ? "开启" : "解除"}全体禁言`)
  }

  async kickMember(e) {
    let regRet = e.msg.match(/#踢\s?(\d+)\s(\d+)$/)
    let groupObj = (e.bot ?? Bot).pickGroup(Number(regRet[1]))
    if (!common.checkPermission(e, "master", "admin", { groupObj })) return
    let res = await new Ga(e).kickMember(regRet[1], regRet[2], e.user_id)
    e.reply(res)
  }
}
