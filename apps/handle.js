import plugin from '../../../lib/plugins/plugin.js'
import _ from 'lodash'
import { common } from '../model/index.js'
import moment from 'moment'
const ROLE_MAP = {
  admin: '群管理',
  owner: '群主',
  member: '群员'
}
export class NewHandle extends plugin {
  constructor () {
    super({
      name: '椰奶申请处理',
      event: 'message',
      priority: 500,
      rule: [
        {
          reg: '^#?(同意|拒绝)$',
          fnc: 'Handle'
        },
        {
          reg: '^#?回复',
          fnc: 'Replys',
          event: 'message.private'
        },
        {
          reg: '^#?(同意|拒绝|查看)(全部)?好友申请(\\d+)?$',
          fnc: 'PrivateAdd'
        },
        {
          reg: '^#?(加为|添加)好友$',
          fnc: 'addFriend',
          event: 'message.private'
        },
        {
          reg: '^#?(同意|拒绝|查看)(全部)?(加|入)?群申请(\\d+)?$',
          fnc: 'GroupAdd',
          event: 'message.group'
        },
        {
          reg: '^#?(同意|拒绝|查看)(全部)?群邀请(\\d+)?$',
          fnc: 'GroupInvite'
        },
        {
          reg: '^#?查看全部请求$',
          fnc: 'SystemMsgAll'
        }
      ]
    })
  }

  /** 同意拒绝好友申请 */
  async PrivateAdd (e) {
    if (!e.isMaster) return false
    let yes = !!/同意/.test(e.msg)

    const systemMsg = (await (e.bot ?? Bot).getSystemMsg());
    const FriendAdd = systemMsg.filter(
      item => item.request_type == 'friend' &&
      (item.sub_type === 'add' || item.sub_type === 'single')
    );

    if (_.isEmpty(FriendAdd)) return e.reply('暂无好友申请(。-ω-)zzz', true)

    if (/查看好友申请/.test(e.msg)) {
      FriendAdd = FriendAdd.map((item) => {
        return [
          segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${item.user_id}`),
          `\n申请人QQ：${item.user_id}\n`,
          `申请人昵称：${item.nickname}\n`,
          `申请来源：${item.source || '未知'}\n`,
          `申请时间：${moment(item.time * 1000).format('YYYY-MM-DD HH:mm:ss')}\n`,
          `附加信息：${item.comment || '无附加信息'}`
        ]
      })
      let msg = [
        `现有未处理的好友申请如下，共${FriendAdd.length}条`,
        '可用"#同意好友申请<QQ>"或"#拒绝好友申请<QQ>"进行处理',
        ...FriendAdd
      ]
      return common.getforwardMsg(e, msg)
    } else if (/全部/.test(e.msg)) {
      // 同意全部好友申请
      await e.reply('好哒，我开始处理辣٩(๑•ㅂ•)۶')
      let success = []; let fail = []
      for (let i of FriendAdd) {
        logger.mark(`${e.logFnc}${yes ? '同意' : '拒绝'}${i.user_id}的好友申请`)
        let res = await i.approve(yes)
        if (res) {
          success.push(`${success.length + 1}、${i.user_id}`)
        } else {
          fail.push(`${fail.length + 1}、${i.user_id}`)
        }
        await common.sleep(2000)
      }
      let msg = [
        `本次共${yes ? '同意' : '拒绝'}${FriendAdd.length}条好友申请\n成功：${success.length}\n失败：${fail.length}`
      ]
      if (!_.isEmpty(success)) msg.push(['以下为成功的名单：\n', success.join('\n')])
      if (!_.isEmpty(fail)) msg.push(['以下为失败的名单：\n', fail.join('\n')])

      return common.getforwardMsg(e, msg)
    } else {
      // 处理单个好友申请
      let qq = e.msg.replace(/#|(同意|拒绝)好友申请/g, '').trim()
      if (!qq) return e.reply('❎ 请输入正确的QQ')

      let member = FriendAdd.find(item => item.user_id == qq)
      if (_.isEmpty(member)) return e.reply('❎ 没有找到这个人的好友申请')

      let result = member.approve(yes)
      if (result) {
        e.reply(`✅ 已${yes ? '同意' : '拒绝'}${member.nickname}(${qq})的好友申请`)
      } else {
        e.reply('❎ 未知错误')
      }
    }
  }

  /** 引用同意好友申请和群邀请 */
  async Handle (e) {
    if (!e.source) return false
    if (e.source.user_id != (e.bot ?? Bot).uin) return false
    let yes = !!/同意/.test(e.msg)
    let source
    if (e.isGroup) {
      source = (await e.group.getChatHistory(e.source.seq, 1)).pop()
    } else {
      source = (await e.friend.getChatHistory(e.source.time, 1)).pop()
    }
    if (!source) return e.reply('❎ 获取消息失败')
    let sourceMsg = source.raw_message?.split('\n')
    if (!sourceMsg) return e.reply('❎ 获取原消息失败，请使用"同意xxx"进行处理')
    if (e.isGroup) {
      if (!common.checkPermission(e, 'admin', 'admin')) return

      let source = (await e.group.getChatHistory(e.source.seq, 1)).pop()
      let yes = /同意/.test(e.msg)
      logger.mark(`${e.logFnc}${yes ? '同意' : '拒绝'}加群通知`)
      let userId = await redis.get(`yenai:groupAdd:${source.message_id}`)
      if (!userId) return e.reply('找不到原消息了，手动同意叭~')

      let member = (await (e.bot ?? Bot).getSystemMsg())
        .find(item => item.request_type == 'group' && item.sub_type == 'add' && item.group_id == e.group_id && item.user_id == userId)

      if (_.isEmpty(member)) return e.reply('呜呜呜，没找到这个淫的加群申请(つд⊂)')

      if (/风险/.test(member.tips)) return e.reply('该账号为风险账号请手动处理哦ಠ~ಠ')

      if (await member.approve(yes)) {
        e.reply(`已${yes ? '同意' : '拒绝'}${member.nickname}(${member.user_id})的加群申请辣٩(๑^o^๑)۶`)
      } else {
        e.reply('呜呜呜，处理失败辣(இωஇ)')
      }
      return true
    } else {
      if (!e.isMaster) return false
      if (/添加好友申请/.test(sourceMsg[0])) {
        let qq = sourceMsg[1].match(/[1-9]\d*/g)
        if ((e.bot ?? Bot).fl.get(Number(qq))) return e.reply('❎ 已经同意过该申请了哦~')

        logger.mark(`${e.logFnc}${yes ? '同意' : '拒绝'}好友申请`)

        await (e.bot ?? Bot).pickFriend(qq)
          .setFriendReq('', yes)
          .then(() => e.reply(`✅ 已${yes ? '同意' : '拒绝'}${qq}的好友申请`))
          .catch(() => e.reply('❎ 请检查是否已同意该申请'))
      } else if (/邀请机器人进群/.test(sourceMsg[0])) {
        let groupid = sourceMsg[1].match(/[1-9]\d*/g)
        if ((e.bot ?? Bot).fl.get(Number(groupid))) { return e.reply('❎ 已经同意过该申请了哦~') }

        let qq = sourceMsg[3].match(/[1-9]\d*/g)
        let seq = sourceMsg[6].match(/[1-9]\d*/g)

        logger.mark(`${e.logFnc}${yes ? '同意' : '拒绝'}群邀请`);

        (e.bot ?? Bot).pickUser(qq)
          .setGroupInvite(groupid, seq, yes)
          .then(() => e.reply(`✅ 已${yes ? '同意' : '拒绝'}${qq}的群邀请`))
          .catch(() => e.reply('❎ 请检查是否已同意该邀请'))
      } else if (/加群申请/.test(sourceMsg[0])) {
        let groupId = sourceMsg[1].match(/\d+/g)
        let qq = sourceMsg[3].match(/\d+/g)

        let member = (await (e.bot ?? Bot).getSystemMsg()).find(item => item.sub_type == 'add' && item.group_id == groupId && item.user_id == qq)
        if (_.isEmpty(member)) return e.reply('没有找到这个人的加群申请哦')

        let result = member.approve(yes)
        if (result) {
          e.reply(`已${yes ? '同意' : '拒绝'}${member.nickname}(${qq})的加群申请`)
        } else {
          e.reply('失败了，可能为风险账号请手动处理')
        }
      } else {
        return false
      }
    }
  }

  // 回复好友消息
  async Replys (e) {
    if (!e.isMaster) return false
    let qq = ''
    let group = ''
    let msgs = e.message[0].text.split(' ')
    if (e.source) {
      let source = (await e.friend.getChatHistory(e.source.time, 1)).pop()
      let res
      try {
        res = source.raw_message.split('\n')
      } catch {
        return e.reply('❎ 消息可能已过期')
      }
      if (/好友消息/.test(res[0]) && /好友账号/.test(res[1])) {
        qq = res[1].match(/[1-9]\d*/g)
      } else if (/群临时消息/.test(res[0])) {
        qq = res[2].match(/[1-9]\d*/g)
        group = res[1].match(/[1-9]\d*/g)
      } else {
        return e.reply('❎ 请检查是否引用正确')
      }
      e.message[0].text = e.message[0].text.replace(/#|回复/g, '').trim()
    } else {
      if (msgs.length == 1 && !/\d/.test(msgs[0])) {
        return e.reply('❎ QQ号不能为空')
      } else if (/\d/.test(msgs[0])) {
        qq = msgs[0].match(/[1-9]\d*/g)
        e.message[0].text = msgs.slice(1).join(' ')
      } else {
        qq = msgs[1]
        e.message[0].text = msgs.slice(2).join(' ')
      }
    }
    if (!e.message[0].text) e.message.shift()

    if (e.message.length === 0) return e.reply('❎ 消息不能为空')
    if (group) {
      logger.mark(`${e.logFnc}回复临时消息`)
      return (e.bot ?? Bot).sendTempMsg(group, qq, e.message)
        .then(() => { e.reply('✅ 已把消息发给它了哦~') })
        .catch((err) => common.handleException(e, err, { MsgTemplate: '❎ 发送失败\n错误信息为:{error}' }))
    }

    if (!/^\d+$/.test(qq)) return e.reply('❎ QQ号不正确，人家做不到的啦>_<~')

    if (!(e.bot ?? Bot).fl.get(Number(qq))) return e.reply('❎ 好友列表查无此人')

    logger.mark(`${e.logFnc}回复好友消息`);

    (e.bot ?? Bot).pickFriend(qq)
      .sendMsg(e.message)
      .then(() => { e.reply('✅ 已把消息发给它了哦~') })
      .catch((err) => common.handleException(e, err, { MsgTemplate: '❎ 发送失败\n错误信息为:{error}' }))
  }

  // 加群员为好友
  async addFriend (e) {
    if (!e.isMaster) return false
    if (!e.source) return false
    let source = (await e.friend.getChatHistory(e.source.time, 1)).pop()
    let msg = source.raw_message.split('\n')
    if (!/临时消息/.test(msg[0]) || !/来源群号/.test(msg[1]) || !/发送人QQ/.test(msg[2])) return false
    let group = msg[1].match(/\d+/g)
    let qq = msg[2].match(/\d+/g)
    if ((e.bot ?? Bot).fl.get(Number(qq))) return e.reply('❎ 已经有这个人的好友了哦~')
    if (!(e.bot ?? Bot).gl.get(Number(group))) { return e.reply('❎ 群聊列表查无此群') }
    logger.mark(`${e.logFnc}主动添加好友`);

    (e.bot ?? Bot).addFriend(group, qq)
      .then(() => e.reply(`✅ 已向${qq}发送了好友请求`))
      .catch(() => e.reply('❎ 发送请求失败'))
  }

  // 入群请求
  async GroupAdd (e) {
    let SystemMsg = (await (e.bot ?? Bot).getSystemMsg())
      .filter(item => item.request_type == 'group' && item.sub_type == 'add' && item.group_id == e.group_id)
    if (_.isEmpty(SystemMsg)) return e.reply('暂无加群申请(。-ω-)zzz', true)
    // 查看
    if (/查看/.test(e.msg)) {
      SystemMsg = SystemMsg.map(item => {
        return [
          segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${item.user_id}`),
          `\nQQ：${item.user_id}\n`,
          `昵称：${item.nickname}\n`,
          item.tips ? `Tips：${item.tips}\n` : '',
          `${item.comment}`
        ]
      })
      let msg = [
        `现有未处理的加群申请如下，总共${SystemMsg.length}条`,
        '可使用 "#(同意|拒绝)加群申请xxx"\n或 "#(同意|拒绝)全部加群申请"',
        ...SystemMsg
      ]
      return common.getforwardMsg(e, msg)
    }
    if (!common.checkPermission(e, 'admin', 'admin')) return
    let yes = /同意/.test(e.msg)

    if (/全部/.test(e.msg)) {
      e.reply('好哒，我开始处理辣٩(๑•ㅂ•)۶')
      let success = []; let fail = []; let risk = []
      for (let i of SystemMsg) {
        if (await i.approve(yes)) {
          success.push(`${success.length + 1}、${i.user_id}`)
        } else {
          if (/风险/.test(i.tips)) {
            risk.push(`${risk.length + 1}、${i.user_id}`)
          } else {
            fail.push(`${fail.length + 1}、${i.user_id}`)
          }
        }
        await common.sleep(1000)
      }
      let msg = [
        `本次共处理${SystemMsg.length}条群申请\n成功：${success.length}\n失败：${fail.length}\n风险：${risk.length}`
      ]
      if (!_.isEmpty(success)) msg.push(['以下为成功的名单：\n', success.join('\n')])
      if (!_.isEmpty(fail)) msg.push(['以下为失败的名单：\n', fail.join('\n')])
      if (!_.isEmpty(risk)) msg.push(['以下为风险账号名单：\n', risk.join('\n')])
      common.getforwardMsg(e, msg)
    } else {
      let qq = e.msg.replace(/#(同意|拒绝)(加|入)群申请/g, '').trim()

      if (!qq) return e.reply('QQ号呢，QQ号呢d(ŐдŐ๑)', true)

      let member = SystemMsg.find(item => item.user_id == qq)

      if (_.isEmpty(member)) return e.reply('呜呜呜，没找到这个淫的加群申请(つд⊂)')

      if (/风险/.test(member.tips)) return e.reply('该账号为风险账号请手动处理哦ಠ~ಠ')

      if (await member.approve(yes)) {
        e.reply(`已${yes ? '同意' : '拒绝'}${member.nickname}(${member.user_id})的加群申请辣٩(๑^o^๑)۶`)
      } else {
        e.reply('呜呜呜，处理失败辣(இωஇ)')
      }
    }
  }

  // 群邀请列表
  async GroupInvite (e) {
    if (!e.isMaster) return false
    let SystemMsg = (await (e.bot ?? Bot).getSystemMsg()).filter(item => item.request_type == 'group' && item.sub_type == 'invite')
    if (_.isEmpty(SystemMsg)) return e.reply('暂无群邀请哦(。-ω-)zzz', true)
    let yes = /同意/.test(e.msg)
    // 查看
    if (/查看/.test(e.msg)) {
      SystemMsg = SystemMsg.map(item => {
        return [
          segment.image(`https://p.qlogo.cn/gh/${item.group_id}/${item.group_id}/100`),
          `\n邀请群号：${item.group_id}\n`,
          `邀请群名：${item.group_name}\n`,
          `邀请人QQ：${item.user_id}\n`,
          `邀请人昵称：${item.nickname}\n`,
          `邀请人身份：${ROLE_MAP[item.role]}`
        ]
      })
      let msg = [
        `现有未处理的群邀请如下，总共${SystemMsg.length}条`,
        '可使用 "#(同意|拒绝)群邀请xxx"\n或 "#(同意|拒绝)全部群邀请"',
        ...SystemMsg
      ]
      return common.getforwardMsg(e, msg)
    } else if (/全部/.test(e.msg)) {
      e.reply('好哒，我开始处理辣٩(๑•ㅂ•)۶')
      let success = []; let fail = []
      for (let i of SystemMsg) {
        if (await i.approve(yes)) {
          success.push(`${success.length + 1}、${i.user_id}`)
        } else {
          fail.push(`${fail.length + 1}、${i.user_id}`)
        }
        await common.sleep(1000)
      }
      let msg = [`本次共处理${SystemMsg.length}条群邀请\n成功：${success.length}\n失败：${fail.length}`]
      if (!_.isEmpty(success)) msg.push(['以下为成功的名单：\n', success.join('\n')])
      if (!_.isEmpty(fail)) msg.push(['以下为失败的名单：\n', fail.join('\n')])
      common.getforwardMsg(e, msg)
    } else {
      let groupid = e.msg.replace(/#(同意|拒绝)群邀请/g, '').trim()

      if (!groupid) return e.reply('群号呢，群号呢d(ŐдŐ๑)', true)

      let Invite = SystemMsg.find(item => item.group_id == groupid)

      if (_.isEmpty(Invite)) return e.reply('欸，你似不似傻哪有这个群邀请(O∆O)')

      if (await Invite.approve(yes)) {
        e.reply(`已${yes ? '同意' : '拒绝'}${Invite.group_id}这个群邀请辣٩(๑^o^๑)۶`)
      } else {
        e.reply('呜呜呜，处理失败辣(இωஇ)')
      }
    }
  }

  // 全部请求
  async SystemMsgAll (e) {
    if (!e.isMaster) return false
    let SystemMsg = await (e.bot ?? Bot).getSystemMsg()
    let FriendAdd = []; let onewayFriend = []; let GroupAdd = []; let GroupInvite = []
    for (let i of SystemMsg) {
      if (i.request_type == 'friend') {
        if (i.sub_type == 'add') {
          FriendAdd.push(i)
        } else {
          onewayFriend.push(i)
        }
      } else {
        if (i.sub_type == 'add') {
          GroupAdd.push(i)
        } else {
          GroupInvite.push(i)
        }
      }
    }
    let msg = []
    if (!_.isEmpty(FriendAdd)) msg.push(`好友申请：${FriendAdd.length}条\n可使用"#查看好友申请" 查看详情`)
    if (!_.isEmpty(GroupInvite)) msg.push(`群邀请：${GroupInvite.length}条\n可使用"#查看群邀请" 查看详情`)
    if (!_.isEmpty(onewayFriend)) msg.push(`单向好友：${onewayFriend.length}条`)
    if (e.isGroup) {
      GroupAdd = GroupAdd.filter(item => item.group_id == e.group.id)
      if (!_.isEmpty(GroupAdd)) msg.push(`当前群申请：${GroupAdd.length}条`)
    }
    if (_.isEmpty(msg)) return e.reply('好耶！！一条请求都没有哦o( ❛ᴗ❛ )o', true)
    msg.unshift('以下为暂未处理的请求')
    common.getforwardMsg(e, msg)
  }
}
