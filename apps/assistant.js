import plugin from '../../../lib/plugins/plugin.js';
import { segment } from "oicq";
import fetch from 'node-fetch';
import { Cfg, QQInterface } from '../model/index.js';
import lodash from 'lodash'
import moment from 'moment'

let Qzonedetermine = false;
let groupPhotoid = '';
let FriendsReg = new RegExp("#发好友\\s?(\\d+)\\s?(.*)")
let GroupmsgReg = new RegExp("#发群聊\\s?(\\d+)\\s?(.*)")
let GrouplistmsgReg = new RegExp("#发群列表\\s?(\\d+(,\\d+){0,})\\s?(.*)")
let friend_typeReg = new RegExp('^#更改好友申请方式([0123])((.*)\\s(.*))?$')
export class example extends plugin {
  constructor() {
    super({
      name: '小助手',
      event: 'message',
      priority: 2000,
      rule: [
        {
          reg: '^#改头像.*$',
          fnc: 'Photo'
        },
        {
          reg: '^#改昵称.*$',
          fnc: 'Myname'
        },
        {
          reg: '^#改签名.*$',
          fnc: 'Sign'
        },
        {
          reg: '^#改状态.*$',
          fnc: 'State'
        },
        {
          reg: FriendsReg,
          fnc: 'Friends'
        },
        {
          reg: GroupmsgReg,
          fnc: 'Groupmsg'
        },
        {
          reg: GrouplistmsgReg,
          fnc: 'Grouplistmsg'
        },

        {
          reg: '^#退群.*$',
          fnc: 'Quit'
        },
        {
          reg: '^#删好友.*$',
          fnc: 'Deletes'
        },
        {
          reg: '^#改性别.*$',
          fnc: 'Sex'
        },
        {
          reg: '^#取直链.*$',
          fnc: 'Pictures'
        },
        {
          reg: '^#取face.*$',
          fnc: 'Face'
        },
        {
          reg: '^#获?取说说列表(\\d+)?$',
          fnc: 'Qzonelist'
        },
        {
          reg: '^#删说说(\\d+)$',
          fnc: 'Qzonedel'
        },
        {
          reg: '^#发说说.*$',
          fnc: 'Qzonesay'
        },
        {
          reg: '^#(清空说说|清空留言)$',
          fnc: 'QzoneEmpty'
        },
        {
          reg: '^#改群名片.*$',
          fnc: 'MyGroupname'
        },
        {
          reg: '^#改群头像.*$',
          fnc: 'GroupPhoto'
        },
        {
          reg: '^#改群昵称.*$',
          fnc: 'Groupname'
        },
        {
          reg: '^#获取(群|好友)列表$',
          fnc: 'Grouplist'
        },
        {
          reg: '^#群星级$',
          fnc: 'Group_xj'
        },
        {
          reg: '^#(开启|关闭)戳一戳$',
          fnc: 'cyc'
        },
        {
          reg: '^#?撤回$',
          fnc: 'recallMsgown'
        },
        {
          reg: '^#(开启|关闭)好友添加$',
          fnc: 'friend_switch'
        },
        {
          reg: friend_typeReg,
          fnc: 'friend_type'
        },
      ]
    })

  }
  /**改头像*/
  async Photo(e) {
    if (!e.isMaster) return;

    if (!e.img) {
      this.setContext('Photos')
      e.reply("✅ 请发送图片");
      return;
    }

    await Bot.setAvatar(e.img[0])
      .then(() => { e.reply("✅ 头像修改成功") })
      .catch((err) => {
        e.reply("❎ 头像修改失败");
        console.log(err);
      })

  }
  async Photos() {
    let img = this.e.img
    if (this.e.msg === "取消") {
      this.finish('Photos')
      await this.reply('✅ 已取消')
      return;
    }
    if (!img) {
      this.setContext('Photos')
      await this.reply('❎ 请发送图片或取消')
      return;
    }
    await Bot.setAvatar(img[0])
      .then(() => this.e.reply("✅ 头像修改成功"))
      .catch((err) => {
        this.e.reply("❎ 头像修改失败");
        console.log(err)
      })

    this.finish('Photos')
  }

  /** 改昵称*/
  async Myname(e) {
    if (!e.isMaster) return;

    let name = e.msg.replace(/#|改昵称/g, "").trim()

    await Bot.setNickname(name)
      .then(() => e.reply("✅ 昵称修改成功"))
      .catch((err) => {
        e.reply("❎ 昵称修改失败");
        console.log(err);
      })
  }

  /** 改群名片 */
  async MyGroupname(e) {
    if (!e.isMaster) return;


    let group = '';
    let card = '';

    if (e.isPrivate) {
      let msg = e.msg.split(" ")

      group = msg[1].match(/[1-9]\d*/g);

      card = msg.slice(2).join(" ");

      if (!group) return e.reply("❎ 群号不能为空");

      if (!Bot.gl.get(Number(msg[1]))) return e.reply("❎ 群聊列表查无此群");

    } else {
      group = e.group_id;
      card = e.msg.replace(/#|改群名片/g, "").trim()
    }

    if (!card) return e.reply("❎ 名片不能为空");

    Bot.pickGroup(group).setCard(Bot.uin, card)
      .then(() => e.reply("✅ 群名片修改成功"))
      .catch(err => {
        e.reply("✅ 群名片修改失败")
        console.log(err);
      })
  }

  /**改群头像 */
  async GroupPhoto(e) {
    if (e.isPrivate) {
      if (!e.isMaster) return;

      groupPhotoid = e.msg.replace(/#|改群头像/g, "").trim()

      if (!groupPhotoid) return e.reply("❎ 群号不能为空");

      if (!(/^\d+$/.test(groupPhotoid))) return e.reply("❎ 您的群号不合法");

      if (!Bot.gl.get(Number(groupPhotoid))) return e.reply("❎ 群聊列表查无此群");
    } else {
      //判断身份
      if (e.member.is_admin || e.member.is_owner || e.isMaster) {
        groupPhotoid = e.group_id
      } else {
        return e.reply(["哼~你不是管理员人家不听你的", segment.face(231)])
      }
    }
    groupPhotoid = Number(groupPhotoid);

    if (Bot.pickGroup(groupPhotoid).is_admin || Bot.pickGroup(groupPhotoid).is_owner) {
      if (!e.img) {
        this.setContext('picture')
        e.reply("✅ 请发送图片");
        return;
      }

      Bot.pickGroup(groupPhotoid).setAvatar(e.img[0])
        .then(() => e.reply("✅ 群头像修改成功"))
        .catch((err) => {
          e.reply("✅ 群头像修改失败")
          console.log(err);
        })
    } else {
      return e.reply("❎ 没有管理员人家做不到啦~>_<");
    }
  }

  picture() {
    let img = this.e.img
    if (this.e.msg === "取消") {
      this.finish('picture')
      this.e.reply('✅ 已取消')
      return;
    }
    if (!img) {
      this.setContext('picture')
      this.e.reply('❎ 请发送图片或取消')
      return;
    }
    Bot.pickGroup(groupPhotoid).setAvatar(this.e.img[0])
      .then(() => this.e.reply("✅ 群头像修改成功"))
      .catch((err) => {
        this.e.reply("✅ 群头像修改失败")
        console.log(err);
      })

    this.finish('picture')
  }

  /**改群昵称 */
  async Groupname(e) {
    let group = '';
    let card = '';

    if (e.isPrivate) {
      if (!e.isMaster) return;

      let msg = e.msg.split(" ")

      group = msg[1].match(/[1-9]\d*/g);

      card = msg.slice(2).join(" ");

      if (!group) return e.reply("❎ 群号不能为空");

      if (!Bot.gl.get(Number(msg[1]))) return e.reply("❎ 群聊列表查无此群");

    } else {
      if (e.member.is_admin || e.member.is_owner || e.isMaster) {
        group = e.group_id
        card = e.msg.replace(/#|改群昵称/g, "").trim()
      } else {
        return e.reply(["哼~你不是管理员人家不听你的", segment.face(231)])
      }
    }

    if (!card) return e.reply("❎ 昵称不能为空");

    group = Number(group);

    if (Bot.pickGroup(group).is_admin || Bot.pickGroup(group).is_owner) {
      Bot.pickGroup(group).setName(card)
        .then(() => e.reply("✅ 群昵称修改成功"))
        .catch(err => {
          e.reply("✅ 群昵称修改失败")
          console.log(err);
        })
    } else {
      return e.reply("❎ 没有管理员人家做不到啦~>_<");
    }
  }

  /** 改签名*/
  async Sign(e) {
    if (!e.isMaster) return;

    let signs = e.msg.replace(/#|改签名/g, "").trim()
    await Bot.setSignature(signs)
      .then(() => e.reply("✅ 签名修改成功"))
      .catch((err) => {
        e.reply("❎ 签名修改失败");
        console.log(err)
      })
  }

  /** 改状态*/
  async State(e) {
    if (!e.isMaster) return;

    let signs = e.msg.replace(/#|改状态/g, "").trim()

    if (!signs) return e.reply("❎ 状态不为空，可选值：我在线上，离开，隐身，忙碌，Q我吧，请勿打扰");

    let res = {
      "离开": 31,
      "忙碌": 50,
      "隐身": 41,
      "Q我吧": 60,
      "请勿打扰": 70,
      "我在线上": 11,
    }

    let status = {};
    for (let k in res) {
      status[res[k]] = k;
    }

    if (!(signs in res)) return e.reply("❎ 可选值：我在线上，离开，隐身，忙碌，Q我吧，请勿打扰")

    await Bot.setOnlineStatus(res[signs])
      .then(() => e.reply("✅ 在线状态修改成功"))
      .then(() => e.reply(`✅ 现在的在线状态为【${status[Bot.status]}】`))
      .catch(err => {
        e.reply("❎ 在线状态修改失败");
        console.log(err);
      })
    return true;
  }

  /** 发好友*/
  async Friends(e) {
    if (!e.isMaster) return;
    let regRet = FriendsReg.exec(e.msg)
    let qq = regRet[1]
    e.message[0].text = regRet[2]
    if (!/^\d+$/.test(qq)) return e.reply("❎ QQ号不正确，人家做不到的啦>_<~");

    if (!Bot.fl.get(Number(qq))) return e.reply("❎ 好友列表查无此人");

    if (!e.message[0].text) e.message.shift()

    if (e.message.length === 0) return e.reply("❎ 消息不能为空");

    await Bot.pickFriend(qq).sendMsg(e.message)
      .then(() => e.reply("✅ 私聊消息已送达"))
      .catch(err => e.reply(`❎ 发送失败\n错误信息为:${err.message}`))

  }

  /** 发群聊*/
  async Groupmsg(e) {
    if (!e.isMaster) return;

    let regRet = GroupmsgReg.exec(e.msg)

    let gpid = regRet[1]

    e.message[0].text = regRet[2]

    if (!e.message[0].text) e.message.shift()

    if (e.message.length === 0) return e.reply("❎ 消息不能为空");

    if (!/^\d+$/.test(gpid)) return e.reply("❎ 您输入的群号不合法");

    if (!Bot.gl.get(Number(gpid))) return e.reply("❎ 群聊列表查无此群");

    await Bot.pickGroup(gpid).sendMsg(e.message)
      .then(() => e.reply("✅ 群聊消息已送达"))
      .catch((err) => e.reply(`❎ 发送失败\n错误信息为:${err.message}`))
  }

  //发送群列表
  async Grouplistmsg(e) {
    if (!e.isMaster) return;
    //获取参数
    let regRet = GrouplistmsgReg.exec(e.msg)
    let gpid = regRet[1]
    e.message[0].text = regRet[3]

    if (!e.message[0].text) e.message.shift()

    if (e.message.length === 0) return e.reply("❎ 消息不能为空");

    let groupidList = [];
    let sendList = [];

    //获取群列表
    let listMap = Array.from(Bot.gl.values());

    listMap.forEach((item) => {
      groupidList.push(item.group_id);
    })

    let groupids = gpid.split(",");
    console.log(groupidList.length);
    if (!groupids.every(item => item <= groupidList.length)) return e.reply("❎ 序号超过合法值！！！")

    groupids.forEach((item) => {
      sendList.push(groupidList[Number(item) - 1]);
    })


    if (sendList.length > 3) return e.reply("❎ 不能同时发太多群聊，号寄概率增加！！！")

    if (sendList.length === 1) {
      await Bot.pickGroup(sendList[0]).sendMsg(e.message)
        .then(() => e.reply("✅ " + sendList[0] + " 群聊消息已送达"))
        .catch((err) => e.reply(`❎ ${sendList[0]} 发送失败\n错误信息为:${err.message}`))
    } else {
      e.reply("发送多个群聊，将每5秒发送一条消息！")
      for (let i of sendList) {
        await Bot.pickGroup(i).sendMsg(e.message)
          .then(() => e.reply("✅ " + i + " 群聊消息已送达"))
          .catch((err) => e.reply(`❎ ${i} 发送失败\n错误信息为:${err.message}`))
        await Cfg.sleep(5000)
      }
    }
    return false;

  }


  /**退群 */
  async Quit(e) {
    if (!e.isMaster) return;

    let quits = e.msg.replace(/#|退群/g, "").trim()

    if (!quits) return e.reply("❎ 群号不能为空");

    if (!/^\d+$/.test(quits)) return e.reply("❎ 群号不合法");

    if (!Bot.gl.get(Number(quits))) return e.reply("❎ 群聊列表查无此群")

    await Bot.pickGroup(quits).quit()
      .then(() => e.reply(`✅ 已退出群聊`))
      .catch((err) => {
        e.reply("❎ 退出失败");
        console.log(err)
      })
  }

  /**删好友 */
  async Deletes(e) {
    if (!e.isMaster) return

    let quits = e.msg.replace(/#|删好友/g, "").trim()

    if (e.message[1]) {
      quits = e.message[1].qq
    } else {
      quits = quits.match(/[1-9]\d*/g)
    }
    if (!quits) return e.reply("❎ 请输入正确的QQ号")

    if (!Bot.fl.get(Number(quits))) return e.reply("❎ 好友列表查无此人");

    await Bot.pickFriend(quits).delete()
      .then(() => e.reply(`✅ 已删除好友`))
      .catch((err) => {
        e.reply("❎ 删除失败");
        console.log(err);
      })
  }

  /**改性别 */
  async Sex(e) {
    if (!e.isMaster) return;

    let sex = e.msg.replace(/#|改性别/g, "").trim();

    if (!sex) return e.reply("❎ 性别不能为空 可选值：男，女，无\n（改为无，为无性别）");

    let res = {
      "无": 0,
      "男": 1,
      "女": 2,
    }
    if (!(sex in res)) return e.reply("❎ 可选值：男，女，无(改为无，为无性别)");

    await Bot.setGender(res[sex])
      .then(() => e.reply(`✅ 已修改性别`))
      .catch((err) => {
        e.reply("❎ 修改失败");
        console.log(err);
      })
  }

  /**取直链 */
  async Pictures(e) {
    let img = []
    if (e.source) {
      let source;
      if (e.isGroup) {
        source = (await e.group.getChatHistory(e.source.seq, 1)).pop();
      } else {
        source = (await e.friend.getChatHistory(e.source.time, 1)).pop();
      }
      for (let i of source.message) {
        if (i.type == 'image') {
          img.push(i.url)
        }
      }
    } else {
      img = e.img
    }

    if (lodash.isEmpty(img)) {
      this.setContext('imgs')
      await this.reply('✅ 请发送图片')
      return;
    }
    await e.reply(`✅ 检测到${img.length}张图片`)
    if (img.length >= 2) {
      //大于两张图片以转发消息发送
      let msg = []
      for (let i of img) {
        msg.push([segment.image(i), "直链:", i])
      }
      Cfg.getforwardMsg(e, msg)
    } else {
      await e.reply([segment.image(img[0]), "直链:", img[0]])
    }
    return true;
  }
  async imgs() {
    let img = this.e.img
    if (this.e.msg === "取消") {
      this.finish('imgs')
      await this.reply('✅ 已取消')
      return;
    }
    if (!img) {
      this.setContext('imgs')
      await this.reply('❎ 请发送图片或取消')
      return;
    }
    await this.e.reply(img[0])
    this.finish('imgs')
  }

  /** 取Face表情 */
  async Face(e) {
    let face = [];
    for (let m of e.message) {
      if (m.type === "face") {
        let s = false;
        for (let i of face) { if (i.id === m.id) s = true }
        if (!s) face.push(m)
      }
    }
    if (face.length === 0) return e.reply("❎ 表情参数不可为空", true);

    let res = face.map(function (item) {
      return [
        `表情：`,
        item,
        `\nid：${item.id}`,
        `\n描述：${item.text}`
      ]
    })

    if (res.length >= 2) {
      Cfg.getforwardMsg(e, res)
    } else {
      await e.reply(res[0])
    }
    return true;
  }

  /**QQ空间 说说列表*/
  async Qzonelist(e) {
    if (!e.isMaster) return;

    let page = e.msg.replace(/#|取说说列表/g, "").trim()
    if (!page) {
      page = 0
    } else {
      page = page - 1
    }

    //获取说说列表
    let list = await QQInterface.getQzone(e, page * 5, 5)
    if (!list) return
    let msg = [
      "✅ 获取成功，说说列表如下:\n",
      ...list.msglist.map((item, index) =>
        `${page * 5 + index + 1}.${lodash.truncate(item.content, { "length": 15 })}\n- [${item.secret ? "私密" : "公开"}] | ${moment(item.created_time * 1000).format("MM/DD HH:mm")} | ${item.commentlist?.length || 0}条评论\n`
      ),
      `页数：[${page + 1}/${Math.ceil(list.total / 5)}]`
    ]
    e.reply(msg)
  }

  /** 删除说说 */
  async Qzonedel(e) {
    if (!e.isMaster) return;
    QQInterface.delQzone(e)
  }

  /** 发说说 */
  async Qzonesay(e) {
    if (!e.isMaster) return;
    QQInterface.setQzone(e)
  }

  /** 清空说说和留言*/
  async QzoneEmpty(e) {
    if (!e.isMaster) return;

    if (/清空说说/.test(e.msg)) {
      this.setContext('QzonedelAll')
      e.reply("✳️ 即将删除全部说说请发送：\n" + "------确认清空或取消------");
      Qzonedetermine = true;
    } else if (/清空留言/.test(e.msg)) {
      this.setContext('QzonedelAll')
      e.reply("✳️ 即将删除全部留言请发送：\n" + "------确认清空或取消------");
      Qzonedetermine = false;
    }
  }
  async QzonedelAll() {
    let msg = this.e.msg
    if (/#?确认清空/.test(msg)) {
      this.finish('QzonedelAll')
      let ck = Cfg.getck('qzone.qq.com')
      let url
      if (Qzonedetermine) {
        url = `https://xiaobai.klizi.cn/API/qqgn/ss_empty.php?data=&uin=${Bot.uin}&skey=${ck.skey}&pskey=${ck.p_skey}`
      } else {
        url = `https://xiaobai.klizi.cn/API/qqgn/qzone_emptymsgb.php?data=&uin=${Bot.uin}&skey=${ck.skey}&pskey=${ck.p_skey}`
      }

      let result = await fetch(url).then(res => res.text()).catch(err => console.log(err))
      this.e.reply(`✅ ${result}`)
      return true;

    } else if (/#?取消/.test(msg)) {
      this.finish('QzonedelAll')
      this.e.reply("✅ 已取消")
      return false;
    } else {
      this.setContext('QzonedelAll')
      this.e.reply("❎ 请输入:确认清空或取消")
      return false;
    }
  }

  //获取群|好友列表
  async Grouplist(e) {
    if (!e.isMaster) return;

    let listMap;
    let message = [];
    let list = []
    let yes = false
    if (/群列表/.test(e.msg)) {
      //获取群列表并转换为数组
      listMap = Array.from(Bot.gl.values())
      //添加有几个群
      message.push(`群列表如下，共${listMap.length}个群`)
      //遍历添加
      listMap.forEach((item, index) => {
        list.push(`${index + 1}、${item.group_name}(${item.group_id})\n`)
      })
      yes = true
    } else if (/好友列表/.test(e.msg)) {
      //获取好友列表并转换为数组
      listMap = Array.from(Bot.fl.values())
      //添加有多少个好友
      message.push(`好友列表如下，共${listMap.length}个好友`)
      //遍历添加
      listMap.forEach((item, index) => {
        list.push(`${index + 1}、${item.nickname}(${item.user_id})\n`)
      })
    }

    //去除最后一个的换行符
    list[list.length - 1] = list[list.length - 1].replace(/\n/, "")
    message.push(list)
    if (yes) {
      message.push("可使用 #退群123456789 来退出某群")
      message.push("可使用 #发群列表 <序号> <消息> 来快速发送消息")
      message.push(`多个群聊请用 "," 分隔 不能大于3 容易寄`)
    } else {
      message.push("可使用 #删好友123456789 来删除某人")
    }

    Cfg.getforwardMsg(e, message)

    return true

  }
  /**群星级 */
  async Group_xj(e) {
    if (e.isPrivate) return e.reply("请在群聊使用哦~")

    if (!e.isMaster && !e.member.is_owner && !e.member.is_admin) return;

    QQInterface.getGroup_xj(e)
  }

  /**戳一戳 */
  async cyc(e) {
    if (!e.isMaster) return;

    let yes = 1;
    if (/开启/.test(e.msg)) yes = 0;
    let ck = Cfg.getck("vip.qq.com")
    let url = `http://xiaobai.klizi.cn/API/qqgn/qun_cyc.php?uin=${Bot.uin}&skey=${ck.skey}&pskey=${ck.p_skey}&switch=${yes}`

    let result = await fetch(url).then(res => res.json()).catch(err => console.log(err))

    if (!result) return e.reply("❎ 接口失效")

    e.reply(`✅ 已${yes ? '关闭' : '开启'}戳一戳功能`)

  }
  //引用撤回
  async recallMsgown(e) {
    if (!e.source) return
    let source;
    if (e.isGroup) {
      source = (await e.group.getChatHistory(e.source.seq, 1)).pop();
    } else {
      source = (await e.friend.getChatHistory(e.source.time, 1)).pop();
    }
    let target = e.isGroup ? e.group : e.friend

    if (source.sender.user_id != Bot.uin) {
      if (e.isGroup) {
        //群聊判断权限
        if (!e.isMaster && !e.member.is_owner && !e.member.is_admin) {
          return logger.warn("[椰奶撤回]群聊权限不足")
        }
      } else {
        //私聊判断是否为Bot消息
        return logger.warn("[椰奶撤回]引用不是Bot消息")
      }
    }
    logger.info("[椰奶撤回]执行撤回")
    //撤回消息
    await target.recallMsg(source.message_id);

    await Cfg.sleep(300);
    let recallcheck = await Bot.getMsg(source.message_id)
    if (recallcheck && recallcheck.message_id == source.message_id) {
      let msg;
      if (e.isGroup) {
        if (!e.group.is_admin && !e.group.is_owner) {
          msg = "人家连管理员都木有，怎么撤回两分钟前的消息或别人的消息辣o(´^｀)o"
        } else {
          msg = "干不赢这个淫的辣（｀Δ´）ゞ"
        }
      } else {
        msg = "过了两分钟，吃不掉辣(o｀ε´o)"
      }
      return e.reply(msg, true, { recallMsg: 5 });
    }
    if (e.isGroup) await e.recall();
  }
  //开关好友添加
  async friend_switch(e) {
    if (!e.isMaster) return
    let ck = Cfg.getck("ti.qq.com")
    let api = `http://xiaobai.klizi.cn/API/qqgn/friend_switch.php?uin=${Bot.uin}&skey=${ck.skey}&pskey=${ck.p_skey}&type=${/开启/.test(e.msg) ? 1 : 2}`
    let res = await fetch(api).then(res => res.json()).catch(err => console.log(err))
    if (!res) return e.reply("接口失效辣(๑ŐдŐ)b")
    e.reply(res.ActionStatus)
  }
  //好友申请方式
  async friend_type(e) {
    if (!e.isMaster) return
    let regRet = friend_typeReg.exec(e.msg)
    let ck = Cfg.getck("ti.qq.com")
    if (regRet[1] == 0) return e.reply("1为允许所有人，2为需要验证，3为问答正确问答(需填参数question,answer)")
    //单独处理
    let isproblem = '';
    if (regRet[1] == 3) {
      if (!regRet[3] && !regRet[4]) return e.reply("❎ 请正确输入问题和答案！")
      isproblem = `&question=${regRet[3]}&answer=${regRet[4]}`
    }
    let api = `http://xiaobai.klizi.cn/API/qqgn/friend_type.php?uin=${Bot.uin}&skey=${ck.skey}&pskey=${ck.p_skey}&type=${regRet[1]}${isproblem}`
    let res = await fetch(api).then(res => res.json()).catch(err => console.log(err))
    if (!res) return e.reply("接口失效辣(๑ŐдŐ)b")
    e.reply(res.msg)
  }

}
