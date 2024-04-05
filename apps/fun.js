import _ from "lodash"
import { Config } from "../components/index.js"
import { heisiType, pandadiuType, xiurenTypeId } from "../constants/fun.js"
import { common, funApi, uploadRecord } from "../model/index.js"

/** 开始执行文案 */
const START_EXECUTION = "椰奶产出中......"

const picApis = Config.getConfig("picApi")
/** 解析匹配模式 */
const picApiKeys = []

_.forIn(picApis, (values, key) => {
  let mode = values.mode !== undefined ? values.mode : picApis.mode
  key = key.split("|").map(item => mode ? "^" + item + "$" : item).join("|")
  picApiKeys.push(key)
})

export class Fun extends plugin {
  constructor (e) {
    super({
      name: "椰奶娱乐",
      event: "message",
      priority: 500,
      rule: [
        {
          reg: "^#唱歌$",
          fnc: "Sing"
        },
        {
          reg: "^#支付宝到账",
          fnc: "ZFB"
        },
        {
          reg: "^#(([\u4e00-\u9fa5]{2,6})-)?([\u4e00-\u9fa5]{2,6})?翻译(.*)$",
          fnc: "youdao"
        },
        {
          reg: "github.com/[a-zA-Z0-9-]{1,39}/[a-zA-Z0-9_-]{1,100}",
          fnc: "GH"
        },
        {
          reg: "^#?coser$",
          fnc: "coser"
        },
        {
          reg: `^#(${Object.keys(pandadiuType).join("|")})?acg`,
          fnc: "acg"
        },
        {
          reg: `^#来点(${Object.keys(xiurenTypeId).join("|")})$`,
          fnc: "xiuren"
        },
        {
          reg: "^#?(查?看|取)头像",
          fnc: "LookAvatar"
        }
      ]
    })
  }

  /**
   * 随机唱鸭
   * @param e
   */
  async Sing (e) {
    let data = await funApi.randomSinging()
    if (data.error) return e.reply(data.error)
    await e.reply(await uploadRecord(data.audioUrl, 0, false))
    await e.reply(data.lyrics)
  }

  /**
   * 支付宝语音
   * @param e
   */
  async ZFB (e) {
    let amount = parseFloat(e.msg.replace(/#|支付宝到账|元|圆/g, "").trim())

    if (!/^\d+(\.\d{1,2})?$/.test(amount)) return e.reply("你觉得这河里吗！！", true)

    if (!(amount >= 0.01 && amount <= 999999999999.99)) {
      return e.reply("数字大小超出限制，支持范围为0.01~999999999999.99")
    }
    e.reply([ segment.record(`https://mm.cqu.cc/share/zhifubaodaozhang/mp3/${amount}.mp3`) ])
  }

  /**
   * 有道翻译
   * @param e
   */
  async youdao (e) {
    const msg = e.msg.match(/#(([\u4e00-\u9fa5]{2,6})-)?([\u4e00-\u9fa5]{2,6})?翻译(.*)/)
    // 如果是在群聊中回复，则获取上一条消息作为翻译内容
    if (e.source) {
      const source = e.isGroup
        ? (await e.group.getChatHistory(e.source.seq, 1)).pop()
        : (await e.friend.getChatHistory(e.source.time, 1)).pop()

      msg[4] = source.message
        .filter(item => item.type === "text")
        .map(item => item.text).join("")
    }
    const results = await funApi.youdao(msg[4], msg[3], msg[2])
    e.reply(results, true)
  }

  // github
  async GH (e) {
    const api = "https://opengraph.githubassets.com"

    let reg = /github.com\/[a-zA-Z0-9-]{1,39}\/[a-zA-Z0-9_-]{1,100}(?:\/(?:pull|issues)\/\d+)?/
    const isMatched = e.msg.match(reg)

    const id = "Yenai"
    if (isMatched) {
      // const res = isMatched[0].split('/')
      let path = isMatched[0].replace("github.com/", "")
      e.reply(segment.image(`${api}/${id}/${path}`))
      // const [user, repo] = [res[1], res[2].split('#')[0]]
      // e.reply(segment.image(`${api}/${id}/${user}/${repo}`))
    }
  }

  // coser
  async coser (e) {
    if (!common.checkSeSePermission(e)) return false

    e.reply(START_EXECUTION)
    await funApi.coser()
      .then(res => common.recallSendForwardMsg(e, res))
      .catch(err => common.handleException(e, err))
  }

  // cos/acg搜索
  async acg (e) {
    if (!common.checkSeSePermission(e)) return false
    e.reply(START_EXECUTION)
    const reg = new RegExp(`^#(${Object.keys(pandadiuType).join("|")})?acg(.*)$`)
    const type = e.msg.match(reg)
    await funApi.pandadiu(type[1], type[2])
      .then(res => common.recallSendForwardMsg(e, res))
      .catch(err => common.handleException(e, err))
  }

  // 黑丝
  async heisiwu (e) {
    if (!common.checkSeSePermission(e, "sesepro")) return false

    e.reply(START_EXECUTION)
    // 获取类型
    const { type, page } = heisiType[e.msg.match(/#?来点(.*)/)[1]]
    await funApi.heisiwu(type, page)
      .then(res => common.recallSendForwardMsg(e, _.take(res, 20)))
      .catch(err => common.handleException(e, err))
  }

  // 萌堆
  async mengdui (e) {
    if (!common.checkSeSePermission(e, "sesepro")) return false
    // 开始执行
    e.reply(START_EXECUTION)
    let regRet = e.msg.match(/#?来点神秘图(s)?(.*)/)
    await funApi.mengdui(regRet[2], regRet[1])
      .then(res => common.recallSendForwardMsg(e, res))
      .catch(err => common.handleException(e, err))
  }

  async xiuren (e) {
    if (!common.checkSeSePermission(e, "pro")) return false
    // 开始执行
    e.reply(START_EXECUTION)
    await funApi.xiuren(e.msg.replace(/#?来点/, ""))
      .then(res => common.recallSendForwardMsg(e, res))
      .catch(err => common.handleException(e, err))
  }

  // 查看头像
  async LookAvatar () {
    const id = this.e.msg.replace(/^#?((查?看头像)|取头像)/, "").trim() || this.e.at ||
      this.e.message.find(item => item.type == "at")?.qq || this.e.user_id
    try {
      let url = await this.e.group?.pickMember(id)?.getAvatarUrl()
      if (!url) url = await this.e.bot.pickFriend(id).getAvatarUrl()
      const msgTest = this.e.msg.includes("取头像")
      if (url) return await this.e.reply(msgTest ? `${url}` : segment.image(url))
    } catch (error) {
      logger.error("获取头像错误", error)
    }
    await this.reply("❎ 获取头像错误", true)
    return false
  }
}
