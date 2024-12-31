import _ from "lodash"
import moment from "moment"
import { common, QQApi } from "../../model/index.js"
import { API_ERROR } from "../../constants/errorMsg.js"

export class Qzone extends plugin {
  constructor() {
    super({
      name: "椰奶助手-空间",
      event: "message",
      priority: 500,
      rule: [
        {
          reg: "^#获?取说说列表(\\d+)?$",
          fnc: "Qzonelist"
        },
        {
          reg: "^#删除?说说(\\d+)$",
          fnc: "Qzonedel"
        },
        {
          reg: "^#发说说",
          fnc: "Qzonesay"
        }
      ]
    })
  }

  /**
   * QQ空间 说说列表
   * @param e
   */
  async Qzonelist(e) {
    if (!common.checkPermission(e, "master")) return
    let page = e.msg.replace(/#|获?取说说列表/g, "").trim()
    if (!page) {
      page = 0
    } else {
      page = page - 1
    }

    // 获取说说列表
    let list = await new QQApi(e).getQzone(5, page * 5)

    if (!list) return e.reply(API_ERROR)
    if (list.total == 0) return e.reply("✅ 说说列表为空")

    let msg = [
      "✅ 获取成功，说说列表如下:\n",
      ...list.msglist.map((item, index) =>
        `${page * 5 + index + 1}.${_.truncate(item.content, { length: 15 })}\n- [${item.secret ? "私密" : "公开"}] | ${moment(item.created_time * 1000).format("MM/DD HH:mm")} | ${item.commentlist?.length || 0}条评论\n`
      ),
      `页数：[${page + 1}/${Math.ceil(list.total / 5)}]`
    ]
    e.reply(msg)
  }

  /**
   * 删除说说
   * @param e
   */
  async Qzonedel(e) {
    if (!common.checkPermission(e, "master")) return
    let pos = e.msg.match(/\d+/)
    // 获取说说列表
    let list = await new QQApi(e).getQzone(1, pos - 1)

    if (!list) return e.reply(API_ERROR)
    if (!list.msglist) return e.reply("❎ 未获取到该说说")

    // 要删除的说说
    let domain = list.msglist[0]
    // 请求接口
    let result = await new QQApi(e).delQzone(domain.tid, domain.t1_source)
    if (!result) return e.reply(API_ERROR)
    // debug
    logger.debug(e.logFnc, result)

    if (result.subcode != 0) e.reply("❎ 未知错误" + JSON.parse(result))
    // 发送结果
    e.reply(`✅ 删除说说成功：\n ${pos}.${_.truncate(domain.content, { length: 15 })} \n - [${domain.secret ? "私密" : "公开"}] | ${moment(domain.created_time * 1000).format("MM/DD HH:mm")} | ${domain.commentlist?.length || 0} 条评论`)
  }

  /**
   * 发说说
   * @param e
   */
  async Qzonesay(e) {
    if (!common.checkPermission(e, "master")) return
    let con = e.msg.replace(/#|发说说/g, "").trim()
    let result = await new QQApi(e).setQzone(con, e.img)
    if (!result) return e.reply(API_ERROR)

    if (result.code != 0) return e.reply(`❎ 说说发表失败\n${JSON.stringify(result)}`)

    let msg = [ "✅ 说说发表成功，内容：\n", _.truncate(result.content, { length: 15 }) ]
    if (result.pic) {
      msg.push(segment.image(result.pic[0].url1))
    }
    msg.push(`\n- [${result.secret ? "私密" : "公开"}] | ${moment(result.t1_ntime * 1000).format("MM/DD HH:mm")}`)
    e.reply(msg)
  }
}
