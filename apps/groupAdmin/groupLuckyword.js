import { QQApi, common } from "../../model/index.js"
// API请求错误文案
const API_ERROR = "❎ 出错辣，请稍后重试"
export class GroupLuckyword extends plugin {
  constructor() {
    super({
      name: "椰奶群管-幸运字符",
      event: "message.group",
      priority: 500,
      rule: [
        {
          reg: "^#(查)?(幸运)?字符(列表)?$",
          fnc: "qun_luckylist"
        },
        {
          reg: "^#抽(幸运)?字符$",
          fnc: "qun_lucky"
        },
        {
          reg: "^#替换(幸运)?字符(\\d+)$",
          fnc: "qun_luckyuse"
        },
        {
          reg: "^#(开启|关闭)(幸运)?字符$",
          fnc: "qun_luckyset"
        }
      ]
    })
  }

  // 字符列表
  async qun_luckylist(e) {
    let data = await new QQApi(e).luckylist(e.group_id)
    if (!data) return e.reply(API_ERROR)
    if (data.retcode != 0) return e.reply("❎ 获取数据失败\n" + JSON.stringify(data))

    let msg = data.data.word_list.map((item, index) => {
      let { wording, word_id, word_desc } = item.word_info
      return `${word_id}:${wording}\n寓意:${word_desc}`
    }).join("\n")
    e.reply(msg)
  }

  // 抽幸运字符
  async qun_lucky(e) {
    let res = await new QQApi(e).drawLucky(e.group_id)

    if (!res) return e.reply(API_ERROR)
    if (res.retcode == 11004) return e.reply("❎ 今天已经抽过了，明天再来抽取吧")
    if (res.retcode != 0) return e.reply("❎ 错误\n" + JSON.stringify(res.data))

    if (res.data.word_info) {
      let { wording, word_desc } = res.data.word_info.word_info
      e.reply(`恭喜您抽中了${wording}\n寓意为:${word_desc}`)
    } else {
      e.reply("恭喜您抽了中了个寂寞")
    }
  }

  // 替换幸运字符
  async qun_luckyuse(e) {
    if (!common.checkPermission(e, "admin", "admin")) { return true }
    let id = e.msg.replace(/#|替换(幸运)?字符/g, "")
    let res = await new QQApi(e).equipLucky(e.group_id, id)

    if (!res) return e.reply(API_ERROR)
    if (res.retcode != 0) return e.reply("❎替换失败\n" + JSON.stringify(res))
    e.reply("✅ OK")
  }

  // 开启或关闭群字符
  async qun_luckyset(e) {
    if (!common.checkPermission(e, "admin", "admin")) { return true }

    let res = await new QQApi(e).swichLucky(e.group_id, /开启/.test(e.msg))
    if (!res) return e.reply(API_ERROR)

    if (res.retcode == 11111) return e.reply("❎ 重复开启或关闭")
    if (res.retcode != 0) return e.reply("❎ 错误\n" + JSON.stringify(res))
    e.reply("✅ OK")
  }
}
