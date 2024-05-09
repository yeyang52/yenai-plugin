import plugin from "../../../lib/plugins/plugin.js"
import { Config } from "../components/index.js"
import Monitor from "../model/State/Monitor.js"
import { getBackground } from "../model/State/style.js"
import { getData } from "../model/State/index.js"
import { si, getChartCfg } from "../model/State/utils.js"
import { puppeteer } from "../model/index.js"

let interval = false
export class NewState extends plugin {
  constructor() {
    super({
      name: "椰奶状态",
      event: "message",
      priority: -1000,
      rule: [
        {
          reg: "^#?(椰奶)?状态(pro)?$",
          fnc: "state"
        }, {
          reg: "^#椰奶监控$",
          fnc: "monitor"
        }, {
          reg: "^#?原图$",
          fnc: "origImg"
        }
      ]

    })
    this.redisOrigImgKey = "yenai:state:origImg:"
  }

  async monitor(e) {
    await puppeteer.render("state/monitor", {
      chartData: JSON.stringify(Monitor.chartData),
      backdrop: await getBackground(),
      chartCfg: JSON.stringify(getChartCfg())
    }, {
      e,
      scale: 1.4
    })
  }

  async state(e) {
    if (!/椰奶/.test(e.msg) && !Config.whole.state) return false

    if (!si) return e.reply("❎ 没有检测到systeminformation依赖，请运行：\"pnpm add systeminformation -w\"进行安装")

    // 防止多次触发
    if (interval) { return false } else interval = true
    try {
      // 获取数据
      let data = await getData(e)

      // 渲染图片
      let retMsgId = await puppeteer.render("state/index", {
        ...data
      }, {
        e,
        scale: 1.4,
        retMsgId: true
      })
      console.log(retMsgId)
      if (retMsgId) {
        const redisData = data.style.backdrop
        redis.set(this.redisOrigImgKey + retMsgId.message_id, redisData, { EX: 86400 })
      }
    } catch (error) {
      logger.error(error)
      interval = false
    }

    interval = false
  }

  async origImg(e) {
    if (!e.source) return false
    let source
    if (e.isGroup) {
      source = (await e.group.getChatHistory(e.source.seq, 1)).pop()
    } else {
      source = (await e.friend.getChatHistory(e.source.time, 1)).pop()
    }
    const data = await redis.get(this.redisOrigImgKey + source.message_id)
    if (!data) return false
    let url = data
      .replace("data:image/jpeg;base64,", "base64://")
      .replace("../../../../../", "")
    e.reply(segment.image(url))
    return true
  }
}
