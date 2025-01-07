import { common, Pixiv } from "./index.js"
import { Plugin_Path, Config, YamlReader, Log_Prefix } from "#yenai.components"
import _ from "lodash"
import { setuMsg } from "../constants/msg.js"
import request from "../lib/request/request.js"
import formatDuration from "../tools/formatDuration.js"
export default new class setu {
  constructor() {
    this.cfgPath = `${Plugin_Path}/config/config/setu.yaml`
    // 默认配置
    this.def = Config.setu.defSet
    // 存cd的变量
    this.temp = {}
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
    userId = +userId
    groupId = +groupId
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
    let data = Config.setu
    let CD = groupId ? data[groupId]?.cd : data.friendSet[userId]
    if (CD !== undefined) return CD
    return this.def.cd // 默认300
  }

  /**
   * 获取r18
   * @param {number} groupID 群号不传为私聊
   * @returns {string}  0或1
   */
  getR18(groupID) {
    let data = Config.setu
    let R18 = groupID ? data[groupID]?.r18 : data.friendSet.r18
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
    let data = Config.setu
    let recalltime = data[groupId]?.recall
    if (recalltime !== undefined) return recalltime
    return this.def.recall // 默认120
  }

  /**
   * 设置群cd和撤回时间
   * @param {number} groupId 群号
   * @param {number} num 设置时间
   * @param {'recall'|'cd'} type 设置的类型 recall-撤回时间 cd-群cd
   */
  setGroupRecallTimeAndCd(groupId, num, type = "cd") {
    let y = new YamlReader(this.cfgPath)
    const comment = type === "cd" ? "群cd" : "撤回时间"
    y.set(`${YamlReader.CONFIG_INTEGER_KEY + groupId}.${type}`, +num, comment)
  }

  /**
   * 设置CD
   * @param {string} qq 设置的qq
   * @param {string} cd 设置的cd
   */
  setUserCd(qq, cd) {
    let y = new YamlReader(this.cfgPath)
    y.set(`friendSet.${qq}`, +cd)
    delete this.temp[qq]
  }

  /**
   * 设置r18
   * @param {string | number} groupID 群聊id为假时设置私聊
   * @param {boolean} isopen 开启或关闭
   */
  setR18(groupID, isopen) {
    let y = new YamlReader(this.cfgPath)
    if (groupID) {
      y.set(`${YamlReader.CONFIG_INTEGER_KEY + groupID}.r18`, isopen ? 1 : 0)
    } else {
      y.set("friendSet.r18", isopen ? 1 : 0)
    }
    logger.mark(`${Log_Prefix}[setu][${groupID ? "群聊" : "私聊"}]已${isopen ? "开启" : "关闭"}${groupID ?? "私聊"}的涩涩模式`)
    return true
  }

  /**
   * 获取现有设置
   * @param {*} e oicq
   * @returns {*}
   */
  getSeSeConfig(e) {
    let set = structuredClone(this.def)
    set.cd = this.getCfgCd(e.user_id, e.group_id)
    set.r18 = this.getR18(e.group_id)
    set.recall = this.getRecallTime(e.group_id)
    if (!e.isGroup) delete set.recall
    return set
  }
}()
