import _ from "lodash"
import { status } from "../constants/other.js"
import { common, QQApi } from "../model/index.js"
import { sleep } from "../tools/index.js"
import { API_ERROR } from "../constants/errorMsg.js"

// 命令正则

let friendTypeReg = /^#更改好友申请方式([0123])((.*)\s(.*))?$/

export class Assistant extends plugin {
  constructor() {
    super({
      name: "椰奶小助手",
      event: "message",
      priority: 2000,
      rule: [
        {
          reg: "^#改头像",
          fnc: "SetAvatar"
        },
        {
          reg: "^#改昵称",
          fnc: "SetNickname"
        },
        {
          reg: "^#改签名",
          fnc: "SetSignature"
        },
        {
          reg: "^#改状态",
          fnc: "SetOnlineStatus"
        },
        {
          reg: "^#退群",
          fnc: "QuitGroup"
        },
        {
          reg: "^#删好友",
          fnc: "DeleteFriend"
        },
        {
          reg: "^#改性别",
          fnc: "SetGender"
        },
        {
          reg: "^#取直链",
          fnc: "ImageLink"
        },
        {
          reg: "^#取face",
          fnc: "Face"
        },
        {
          reg: "^#改群名片",
          fnc: "SetGroupCard"
        },
        {
          reg: "^#改群头像",
          fnc: "SetGroupAvatar"
        },
        {
          reg: "^#改群昵称",
          fnc: "SetGroupName"
        },
        {
          reg: "^#(获取)?(群|好友)列表$",
          fnc: "GlOrFl"
        },
        {
          reg: "^#(开启|关闭)戳一戳$",
          fnc: "Cyc"
        },
        {
          reg: "^#?撤回$",
          fnc: "RecallMsgown"
        },
        {
          reg: "^#(开启|关闭)好友添加$",
          fnc: "FriendSwitch"
        },
        {
          reg: friendTypeReg, // 更改好友申请方式
          fnc: "FriendType"
        },
        {
          reg: "#设置机型.*",
          fnc: "setModel"
        },
        {
          reg: "^#?(查?看|取)头像",
          fnc: "LookAvatar"
        }
      ]
    })
  }

  get Bot() {
    return this.e.bot ?? Bot
  }

  /**
   * 改头像
   * @param e
   */
  async SetAvatar(e) {
    if (!common.checkPermission(e, "master")) return
    if (!e.img) {
      this.setContext("_avatarContext")
      e.reply("⚠ 请发送图片")
      return
    }

    await this.Bot.setAvatar(e.img[0])
      .then(() => e.reply("✅ 头像修改成功"))
      .catch((err) => {
        e.reply("❎ 头像修改失败")
        logger.error(err)
      })
  }

  async _avatarContext() {
    let img = this.e.img
    if (/取消/.test(this.e.msg)) {
      this.finish("_avatarContext")
      await this.reply("✅ 已取消")
      return
    }
    if (!img) {
      this.setContext("_avatarContext")
      await this.reply("⚠ 请发送图片或取消")
      return
    }
    await (this.e.bot ?? Bot).setAvatar(img[0])
      .then(() => this.e.reply("✅ 头像修改成功"))
      .catch((err) => {
        this.e.reply("❎ 头像修改失败")
        logger.error(err)
      })

    this.finish("_avatarContext")
  }

  /**
   * 改昵称
   * @param e
   */
  async SetNickname(e) {
    if (!common.checkPermission(e, "master")) return
    let name = e.msg.replace(/#|改昵称/g, "").trim()

    await this.Bot.setNickname(name)
      .then(() => e.reply("✅ 昵称修改成功"))
      .catch((err) => {
        e.reply("❎ 昵称修改失败")
        logger.error(err)
      })
  }

  /**
   * 改群名片
   * @param e
   */
  async SetGroupCard(e) {
    if (!common.checkPermission(e, "master")) return
    let group = ""
    let card = ""

    if (e.isPrivate) {
      let msg = e.msg.split(" ")

      group = msg[1].match(/[1-9]\d*/g)

      card = msg.slice(2).join(" ")

      if (!group) return e.reply("❎ 群号不能为空")

      if (!this.Bot.gl.get(Number(msg[1]))) return e.reply("❎ 群聊列表查无此群")
    } else {
      group = e.group_id
      card = e.msg.replace(/#|改群名片/g, "").trim()
    }

    if (!card) {
      return e.reply("❎ 名片不能为空")
    }
    this.Bot.pickGroup(group).setCard(this.Bot.uin, card)
      .then(() => e.reply("✅ 群名片修改成功"))
      .catch(err => {
        e.reply("✅ 群名片修改失败")
        logger.error(err)
      })
  }

  /**
   * 改群头像
   * @param e
   */
  async SetGroupAvatar(e) {
    if (e.isPrivate) {
      if (!e.isMaster) return logger.mark(`${e.logFnc}不为主人`)
      e.group_id = e.msg.replace(/#|改群头像/g, "").trim()

      if (!e.group_id) return e.reply("❎ 群号不能为空")

      if (!(/^\d+$/.test(e.group_id))) return e.reply("❎ 您的群号不合法")

      if (!this.Bot.gl.get(Number(e.group_id))) return e.reply("❎ 群聊列表查无此群")
      e.group_id = Number(e.group_id)
    } else if (!e.member.is_admin && !e.member.is_owner && !e.isMaster) {
      return logger.mark(`${e.logFnc}该群员权限不足`)
    }
    let groupObj = this.Bot.pickGroup(e.group_id)
    if (!groupObj.is_admin && !groupObj.is_owner) {
      return e.reply("❎ 没有管理员人家做不到啦~>_<")
    }
    if (!e.img) {
      this.setContext("_GroupAvatarContext")
      e.reply("⚠ 请发送图片")
      return
    }

    this.Bot.pickGroup(e.group_id).setAvatar(e.img[0])
      .then(() => e.reply("✅ 群头像修改成功"))
      .catch((err) => {
        e.reply("✅ 群头像修改失败")
        logger.error(err)
      })
  }

  _GroupAvatarContext(e) {
    let img = this.e.img
    if (/取消/.test(this.e.msg)) {
      this.finish("_GroupAvatarContext")
      this.e.reply("✅ 已取消")
      return
    }
    if (!img) {
      this.setContext("_GroupAvatarContext")
      this.e.reply("⚠ 请发送图片或取消")
      return
    }
    this.Bot.pickGroup(e.group_id).setAvatar(this.e.img[0])
      .then(() => this.e.reply("✅ 群头像修改成功"))
      .catch((err) => {
        this.e.reply("✅ 群头像修改失败")
        logger.error(err)
      })

    this.finish("_GroupAvatarContext")
  }

  /**
   * 改群昵称
   * @param e
   */
  async SetGroupName(e) {
    if (!common.checkPermission(e, "admin", "admin")) return
    let group = ""
    let card = ""

    if (e.isPrivate) {
      if (!e.isMaster) return

      let msg = e.msg.split(" ")
      group = msg[1].match(/[1-9]\d*/g)
      card = msg.slice(2).join(" ")

      if (!group) return e.reply("❎ 群号不能为空")
      if (!this.Bot.gl.get(Number(msg[1]))) return e.reply("❎ 群聊列表查无此群")
    } else {
      if (!e.member.is_admin && !e.member.is_owner && !e.isMaster) return logger.mark(`${e.logFnc}该群员权限不足`)
      group = e.group_id
      card = e.msg.replace(/#|改群昵称/g, "").trim()
    }

    if (!card) return e.reply("❎ 昵称不能为空")

    group = Number(group)

    if (this.Bot.pickGroup(group).is_admin || this.Bot.pickGroup(group).is_owner) {
      this.Bot.pickGroup(group).setName(card)
        .then(() => e.reply("✅ 群昵称修改成功"))
        .catch(err => {
          e.reply("✅ 群昵称修改失败")
          logger.error(err)
        })
    } else {
      return e.reply("❎ 没有管理员人家做不到啦~>_<")
    }
  }

  /**
   * 改签名
   * @param e
   */
  async SetSignature(e) {
    if (!common.checkPermission(e, "master")) return
    let signs = e.msg.replace(/#|改签名/g, "").trim()
    await this.Bot.setSignature(signs)
      .then(() => e.reply("✅ 签名修改成功"))
      .catch((err) => {
        e.reply("❎ 签名修改失败")
        logger.error(err)
      })
  }

  /**
   * 改状态
   * @param e
   */
  async SetOnlineStatus(e) {
    if (!common.checkPermission(e, "master")) return
    let signs = e.msg.replace(/#|改状态/g, "").trim()

    if (!signs) return e.reply("❎ 状态不为空，可选值：我在线上，离开，隐身，忙碌，Q我吧，请勿打扰")

    let statusMirr = _.invert(status)
    if (!(signs in statusMirr)) return e.reply("❎ 可选值：我在线上，离开，隐身，忙碌，Q我吧，请勿打扰")

    await this.Bot.setOnlineStatus(statusMirr[signs])
      .then(() => e.reply(`✅ 现在的在线状态为【${status[this.Bot.status]}】`))
      .catch(err => {
        e.reply("❎ 在线状态修改失败")
        logger.error(err)
      })
    return true
  }

  /**
   * 退群
   * @param e
   */
  async QuitGroup(e) {
    if (!common.checkPermission(e, "master")) return
    let quits = e.msg.replace(/#|退群/g, "").trim()

    if (!quits) return e.reply("❎ 群号不能为空")

    if (!/^\d+$/.test(quits)) return e.reply("❎ 群号不合法")

    if (!this.Bot.gl.get(Number(quits))) return e.reply("❎ 群聊列表查无此群")

    if (quits == e.group_id) {
      e.reply("✅ 3秒后退出本群聊")
      await sleep(3000)
    }

    await this.Bot.pickGroup(quits).quit()
      .then(() => e.reply("✅ 已退出群聊"))
      .catch((err) => {
        e.reply("❎ 退出失败")
        logger.error(err)
      })
  }

  /**
   * 删好友
   * @param e
   */
  async DeleteFriend(e) {
    if (!common.checkPermission(e, "master")) return
    let quits = e.msg.replace(/#|删好友/g, "").trim()

    if (e.message[1]) {
      quits = e.message[1].qq
    } else {
      quits = quits.match(/[1-9]\d*/g)
    }
    if (!quits) return e.reply("❎ 请输入正确的QQ号")

    if (!this.Bot.fl.get(Number(quits))) return e.reply("❎ 好友列表查无此人")

    await this.Bot.pickFriend(quits).delete()
      .then(() => e.reply("✅ 已删除好友"))
      .catch((err) => {
        e.reply("❎ 删除失败")
        logger.error(err)
      })
  }

  /**
   * 改性别
   * @param e
   */
  async SetGender(e) {
    if (!common.checkPermission(e, "master")) return
    let sex = e.msg.replace(/#|改性别/g, "").trim()

    if (!sex) return e.reply("❎ 性别不能为空 可选值：男，女，无\n（改为无，为无性别）")

    let res = {
      无: 0,
      男: 1,
      女: 2
    }
    if (!(sex in res)) return e.reply("❎ 可选值：男，女，无(改为无，为无性别)")

    await this.Bot.setGender(res[sex])
      .then(() => e.reply("✅ 已修改性别"))
      .catch((err) => {
        e.reply("❎ 修改失败")
        logger.error(err)
      })
  }

  /**
   * 取直链
   * @param e
   */
  async ImageLink(e) {
    let img = []
    if (e.source) {
      let source
      if (e.isGroup) {
        source = (await e.group.getChatHistory(e.source.seq, 1)).pop()
      } else {
        source = (await e.friend.getChatHistory(e.source.time, 1)).pop()
      }
      for (let i of source.message) {
        if (i.type == "image") {
          img.push(i.url)
        }
      }
    } else {
      img = e.img
    }

    if (_.isEmpty(img)) {
      this.setContext("_ImageLinkContext")
      await this.reply("⚠ 请发送图片")
      return
    }
    await e.reply(`✅ 检测到${img.length}张图片`)
    if (img.length >= 2) {
      // 大于两张图片以转发消息发送
      let msg = []
      for (let i of img) {
        msg.push([ segment.image(i), "直链:", i ])
      }
      common.getforwardMsg(e, msg)
    } else {
      await e.reply([ segment.image(img[0]), "直链:", img[0] ])
    }
    return true
  }

  async _ImageLinkContext() {
    let img = this.e.img
    if (this.e.msg === "取消") {
      this.finish("_ImageLinkContext")
      await this.reply("✅ 已取消")
      return
    }
    if (!img) {
      this.setContext("_ImageLinkContext")
      await this.reply("⚠ 请发送图片或取消")
      return
    }
    await this.e.reply(img[0])
    this.finish("_ImageLinkContext")
  }

  /**
   * 取Face表情
   * @param e
   */
  async Face(e) {
    let face = []
    for (let m of e.message) {
      if (m.type === "face") {
        let s = false
        for (let i of face) { if (i.id === m.id) s = true }
        if (!s) face.push(m)
      }
    }
    if (face.length === 0) return e.reply("❎ 表情参数不可为空", true)

    let res = face.map(function(item) {
      return [
        "表情：",
        item,
        `\nid：${item.id}`,
        `\n描述：${item.text}`
      ]
    })

    if (res.length >= 2) {
      common.getforwardMsg(e, res)
    } else {
      e.reply(res[0])
    }
  }

  // 获取群|好友列表
  async GlOrFl(e) {
    if (!common.checkPermission(e, "master")) return
    let msg = []
    if (/群列表/.test(e.msg)) {
      // 获取群列表并转换为数组
      let listMap = Array.from(this.Bot.gl.values())
      msg = [
        `群列表如下，共${listMap.length}个群`,
        listMap.map((item, index) => `${index + 1}、${item.group_name}(${item.group_id})`).join("\n"),
        "可使用 #退群123456789 来退出某群",
        "可使用 #发群列表 <序号> <消息> 来快速发送消息，多个群聊请用 \",\" 分隔 不能大于3 容易寄"
      ]
    } else {
      // 获取好友列表并转换为数组
      let listMap = Array.from(this.Bot.fl.values())
      msg = [
        `好友列表如下，共${listMap.length}个好友`,
        listMap.map((item, index) => `${index + 1}、${item.nickname}(${item.user_id})`).join("\n"),
        "可使用 #删好友123456789 来删除某人"
      ]
    }

    common.getforwardMsg(e, msg)
  }

  // 引用撤回
  async RecallMsgown(e) {
    if (!e.source) return false
    let source
    if (e.isGroup) {
      source = (await e.group.getChatHistory(e.source.seq, 1)).pop()
    } else {
      source = (await e.friend.getChatHistory(e.source.time, 1)).pop()
    }
    let target = e.isGroup ? e.group : e.friend

    if (e.isGroup) {
      // 群聊判断权限
      if (!common.checkPermission(e, "all", "admin")) {
        return logger.warn(`${e.logFnc}该群员权限不足`)
      }
    } else {
      // 私聊判断是否为Bot消息
      if (source.sender.user_id != this.Bot.uin) {
        return logger.warn(`${e.logFnc}引用不是Bot消息`)
      }
    }
    if (source.message[0].type === "file" && e.isGroup) {
      // 删除文件
      logger.info(`${e.logFnc}执行删除文件`)
      await this.Bot.acquireGfs(e.group_id).rm(source.message[0].fid)
    } else {
      // 撤回消息
      logger.info(`${e.logFnc}执行撤回消息`)
      await target.recallMsg(source.message_id)
    }
    await sleep(300)
    let recallcheck = await this.Bot.getMsg(source.message_id)
    if (recallcheck && recallcheck.message_id == source.message_id) {
      let msg
      if (e.isGroup) {
        if (!e.group.is_admin && !e.group.is_owner) {
          msg = "人家连管理员都木有，怎么撤回两分钟前的消息或别人的消息辣o(´^｀)o"
        } else {
          msg = "干不赢这个淫的辣（｀Δ´）ゞ"
        }
      } else {
        msg = "过了两分钟，吃不掉辣(o｀ε´o)"
      }
      return e.reply(msg, true, { recallMsg: 5 })
    }
    if (e.isGroup) await e.recall()
  }

  // 开关好友添加
  async FriendSwitch(e) {
    if (!common.checkPermission(e, "master")) return
    let res = await new QQApi(e).addFriendSwitch(/开启/.test(e.msg) ? 1 : 2)
    if (!res) return e.reply(API_ERROR)
    e.reply(res.ActionStatus)
  }

  // 好友申请方式
  async FriendType(e) {
    if (!common.checkPermission(e, "master")) return
    let regRet = friendTypeReg.exec(e.msg)
    if (regRet[1] == 0) return e.reply("1为允许所有人，2为需要验证，3为问答正确问答(需填问题和答案，格式为：#更改好友申请方式3 问题 答案)")
    // 单独处理
    if ((!regRet[3] || !regRet[4]) && regRet[1] == 3) return e.reply("❎ 请正确输入问题和答案！")

    let res = await new QQApi(e).setFriendType(regRet[1], regRet[3], regRet[4])
    if (!res) return e.reply(API_ERROR)
    if (res.ec != 0) return e.reply("❎ 修改失败\n" + JSON.stringify(res))
    e.reply(res.msg)
  }

  /**
   * 开关戳一戳
   * @param e
   */
  async Cyc(e) {
    if (!common.checkPermission(e, "master")) return
    let result = await new QQApi(e).setcyc(/开启/.test(e.msg) ? 0 : 1)
    if (!result) return e.reply(API_ERROR)

    if (result.ret != 0) return e.reply("❎ 未知错误\n" + JSON.stringify(result))
    e.reply(`✅ 已${/开启/.test(e.msg) ? "开启" : "关闭"}戳一戳功能`)
  }

  async setModel(e) {
    if (!common.checkPermission(e, "master")) return
    let model = e.msg.replace(/#|设置机型/g, "")
    let res = await new QQApi(e).setModel(model).catch(err => logger.error(err))
    e.reply(_.get(res, [ "13031", "data", "rsp", "iRet" ]) == 0 ? "设置成功" : "设置失败")
  }

  // 查看头像
  async LookAvatar() {
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
