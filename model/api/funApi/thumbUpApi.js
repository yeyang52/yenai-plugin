export default class ThumbUpApi {
  constructor(e) {
    this.e = e
    this.Bot = e.bot ?? Bot
  }

  /**
   * 陌生人点赞
   * @param {number} uid QQ号
   * @param {number} times 数量
   * @returns {object}
   */
  async thumbUp(uid, times = 1) {
    try {
      let core = this.Bot.icqq?.core
      // eslint-disable-next-line import/no-unresolved
      if (!core) core = (await import("icqq")).core
      if (times > 20) { times = 20 }
      let ReqFavorite
      if (this.Bot.fl.get(uid)) {
        ReqFavorite = core.jce.encodeStruct([
          core.jce.encodeNested([ this.Bot.uin, 1, this.Bot.sig.seq + 1, 1, 0, Buffer.from("0C180001060131160131", "hex") ]),
          uid, 0, 1, Number(times)
        ])
      } else {
        ReqFavorite = core.jce.encodeStruct([
          core.jce.encodeNested([ this.Bot.uin, 1, this.Bot.sig.seq + 1, 1, 0, Buffer.from("0C180001060131160135", "hex") ]),
          uid, 0, 5, Number(times)
        ])
      }
      const body = core.jce.encodeWrapper({ ReqFavorite }, "VisitorSvc", "ReqFavorite", this.Bot.sig.seq + 1)
      const payload = await this.Bot.sendUni("VisitorSvc.ReqFavorite", body)
      let result = core.jce.decodeWrapper(payload)[0]
      return { code: result[3], msg: result[4] }
    } catch (error) {
      return this.origThumbUp(uid, times)
    }
  }

  async origThumbUp(uid, times) {
    const friend = this.Bot.pickFriend(uid)
    if (!friend?.thumbUp) throw new ReplyError("当前协议端不支持点赞，详情查看\nhttps://gitee.com/TimeRainStarSky/Yunzai")
    let res
    try {
      res = { ...await friend.thumbUp(times) }
    } catch (err) {
      if (err?.error) { res = { ...err.error } } else if (err?.stack) { res = { code: 1, msg: err.stack } } else { res = { ...err } }
    }
    if (res.retcode && !res.code) { res.code = res.retcode }
    if (res.message && !res.msg) { res.msg = res.message }
    return res
  }
}
