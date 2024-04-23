import { QQApi, common } from "../../model/index.js"
import { API_ERROR } from "../../constants/errorMsg.js"

export class GroupAnnounce extends plugin {
  constructor() {
    super({
      name: "椰奶群管-群公告",
      event: "message.group",
      priority: 500,
      rule: [
        {
          reg: "^#发群公告",
          fnc: "AddAnnounce"
        },
        {
          reg: "^#删群公告(\\d+)$",
          fnc: "DelAnnounce"
        },
        {
          reg: "^#查群公告$",
          fnc: "GetAnnounce"
        }
      ]
    })
  }

  // 发群公告
  async AddAnnounce(e) {
    if (!common.checkPermission(e, "admin", "admin")) { return true }
    // 获取发送的内容
    let msg = e.msg.replace(/#|发群公告/g, "").trim()
    if (!msg) return e.reply("❎ 公告不能为空")

    let result = await new QQApi(e).setAnnounce(e.group_id, msg)

    if (!result) return e.reply(API_ERROR)
    if (result.ec != 0) {
      e.reply("❎ 发送失败\n" + JSON.stringify(result, null, "\t"))
    }
  }

  // 查群公告
  async GetAnnounce(e) {
    let res = await new QQApi(e).getAnnouncelist(e.group_id)
    if (!res) return e.reply(API_ERROR)
    return e.reply(res)
  }

  // 删群公告
  async DelAnnounce(e) {
    if (!common.checkPermission(e, "admin", "admin")) { return true }
    let msg = e.msg.replace(/#|删群公告/g, "").trim()
    if (!msg) return e.reply("❎ 序号不可为空")
    let result = await new QQApi(e).delAnnounce(e.group_id, msg)
    if (!result) return e.reply(API_ERROR)

    if (result.ec == 0) {
      e.reply(`✅ 已删除「${result.text}」`)
    } else {
      e.reply("❎ 删除失败\n" + JSON.stringify(result, null, "\t"))
    }
  }
}
