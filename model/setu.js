import { common, Pixiv } from "./index.js"
import { Data, Plugin_Path, Config } from "../components/index.js"
import _ from "lodash"
import { setuMsg } from "../constants/msg.js"
import request from "../lib/request/request.js"
import formatDuration from "../tools/formatDuration.js"
export default new class setu {
  constructor() {
    this.root = `${Plugin_Path}/config/setu`
    // 默认配置
    this.def = Config.setu.defSet
    // 存cd的变量
    this.temp = {}
    // 初始化
    this.init()
  }

  async init() {
    Data.createDir("config/setu")
  }

  /** 开始执行文案 */
  get startMsg() {
    return _.sample(setuMsg.start)
  }

  /** CD中文案 */
  get CDMsg() {
    return _.sample(setuMsg.cd)
  }

  /** 发送图片文案 */
  get sendMsgs() {
    return _.sample(setuMsg.send)
  }

  /**
   * 请求api
   * @param {string} r18 是否r18 0或1
   * @param {number} num 数量
   * @param {string} tag 关键词
   * @returns {object}
   */
  async setuApi(r18, num = 1, tag = []) {
    let api = "https://api.lolicon.app/setu/v2"
    const { imgSize, excludeAI } = Config.setu
    const size = imgSize[_.max(Object.keys(imgSize).filter(item => num > item))] || "original"
    let parans = {
      r18,
      num,
      tag,
      proxy: Pixiv.proxy,
      size,
      excludeAI
    }
    let result = await request.post(api, { data: parans }).then(res => res.json())
    if (_.isEmpty(result.data)) throw new ReplyError("没有找到相关的tag")
    // 消息
    return await Promise.all(result.data.map(async item => {
      let { pid, title, tags, author, r18, urls, aiType } = item
      return [
        `${this.sendMsgs}\n`,
        `标题：${title}\n`,
        `画师：${author}\n`,
        `Pid：${pid}\n`,
        `R18：${r18}\n`,
        `AI：${aiType ? (aiType == 2 ? "是" : "否") : "未知"}\n`,
        `tag：${_.truncate(tags.join(","))}\n`,
        await Pixiv._requestPixivImg(urls?.original || urls?.regular || urls?.small)
      ]
    }))
  }

  /**
   * 发送消息和写入cd
   * @param {*} e oicq
   * @param {Array} msg 消息数组
   * @returns {boolean}
   */
  async sendMsgOrSetCd(e, msg) {
    // 发送消息
    let res = await common.recallSendForwardMsg(e, msg, false)
    if (!res) return false
    // 设置CD
    if (!e.isMaster) this.setCdTime(e.user_id, e.group_id)
  }

  /**
   * 设置cd
   * @param {number} userId QQ号
   * @param {number} groupId 群号不传为私聊CD
   * @param {number} cd cd时间
   * @returns {*}
   */
  setCdTime(userId, groupId, cd = this.getCfgCd(userId, groupId)) {
    let present = parseInt(Date.now() / 1000)
    userId = userId - 0
    groupId = groupId - 0
    if (!cd) return false
    if (groupId) {
      this.temp[userId + groupId] = present + cd
      setTimeout(() => {
        delete this.temp[userId + groupId]
      }, cd * 1000)
    } else {
      this.temp[userId] = present + cd
      setTimeout(() => {
        delete this.temp[userId]
      }, cd * 1000)
    }
    return true
  }

  /**
   * 获取剩余CD时间
   * @param {number} userId QQ号
   * @param {number} groupId 群号不传则为私聊CD
   * @returns {string} 格式化后的时间
   */
  getRemainingCd(userId, groupId) {
    userId = userId - 0
    groupId = groupId - 0
    // 获取现在的时间并转换为秒
    let present = parseInt(new Date().getTime() / 1000)
    let over = 0
    if (groupId) {
      if (!this.temp[userId + groupId]) return false
      over = (this.temp[userId + groupId] - present)
    } else {
      if (!this.temp[userId]) return false
      over = (this.temp[userId] - present)
    }
    if (over <= 0) return false
    return formatDuration(over, "default", false)
  }

  /**
   * 获取配置cd
   * @param {number} userId QQ号
   * @param {number} groupId 传群号为群聊配置
   * @returns {*}
   */
  getCfgCd(userId, groupId) {
    let data = Data.readJSON(`setu${groupId ? "" : "_s"}.json`, this.root)
    let CD = groupId ? data[groupId]?.cd : data[userId]
    if (CD !== undefined) return CD
    return this.def.cd // 默认300
  }

  /**
   * 获取r18
   * @param {number} groupID 群号不传为私聊
   * @returns {string}  0或1
   */
  getR18(groupID) {
    let data = Data.readJSON(`setu${groupID ? "" : "_s"}.json`, this.root)
    let R18 = groupID ? data[groupID]?.r18 : data.r18
    if (R18 !== undefined) return R18
    return this.def.r18
  }

  /**
   * 获取群的撤回时间
   * @param groupId
   * @returns {number}
   */
  getRecallTime(groupId) {
    if (!groupId) return 0
    let data = Data.readJSON("setu.json", this.root)
    let recalltime = data[groupId]?.recall
    if (recalltime !== undefined) return recalltime
    return this.def.recall // 默认120
  }

  /**
   * 设置群cd和撤回时间
   * @param {number} groupId 群号
   * @param {number} num 设置时间
   * @param {boolean} type 为true设置撤回时间反之设置CD
   * @returns {boolean}
   */
  setGroupRecallTimeAndCd(groupId, num, type) {
    let data = Data.readJSON("setu.json", this.root)

    if (!data[groupId]) data[groupId] = _.cloneDeep(this.def)

    type ? data[groupId].recall = Number(num) : data[groupId].cd = Number(num)

    return Data.writeJSON("setu.json", data, this.root)
  }

  /**
   * 设置CD
   * @param {*} e oicq
   * @param {string} qq 设置的qq
   * @param {string} cd 设置的cd
   */
  setUserCd(e, qq, cd) {
    let data = Data.readJSON("setu_s.json", this.root)

    data[qq] = Number(cd)
    if (Data.writeJSON("setu_s.json", data, this.root)) {
      e.reply(`✅ 设置用户${qq}的cd成功，cd时间为${cd}秒`)
      delete this.temp[qq]
      return true
    } else {
      e.reply("❎ 设置失败")
      return false
    }
  }

  /**
   * 设置r18
   * @param {string | number} groupID 群聊id为假时设置私聊
   * @param {boolean} isopen 开启或关闭
   */
  setR18(groupID, isopen) {
    let data = Data.readJSON(`setu${groupID ? "" : "_s"}.json`, this.root)
    if (groupID) {
      if (!data[groupID]) data[groupID] = _.cloneDeep(this.def)
      data[groupID].r18 = isopen ? 1 : 0
    } else {
      data.r18 = isopen ? 1 : 0
    }
    if (Data.writeJSON(`setu${groupID ? "" : "_s"}.json`, data, this.root)) {
      logger.mark(`[Yenai-Plugin][R18][${groupID ? "群聊" : "私聊"}]已${isopen ? "开启" : "关闭"}${groupID}的涩涩模式`)
      return true
    } else {
      logger.mark(`[Yenai-Plugin][R18][${groupID ? "群聊" : "私聊"}]设置失败`)
      return false
    }
  }

  /**
   * 获取现有设置
   * @param {*} e oicq
   * @returns {*}
   */
  getSeSeConfig(e) {
    let set = _.cloneDeep(this.def)
    set.cd = this.getCfgCd(e.user_id, e.group_id)
    set.r18 = this.getR18(e.group_id)
    set.recall = this.getRecallTime(e.group_id)
    if (!e.isGroup) delete set.recall
    return set
  }
}()
