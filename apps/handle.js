import plugin from '../../../lib/plugins/plugin.js'
import lodash from 'lodash'
import common from '../../../lib/common/common.js'
import { segment } from 'oicq'
import Cfg from '../model/Config.js';
import moment from 'moment';
export class anotice extends plugin {
    constructor() {
        super({
            name: '申请处理',
            event: 'message',
            priority: 500,
            rule: [
                {
                    reg: '^#?(同意|拒绝)申请.*$',
                    fnc: 'agree'
                },
                {
                    reg: '^#?(同意|拒绝)$',
                    fnc: 'agrees'
                },
                {
                    reg: '^#?回复.*$',
                    fnc: 'Replys'
                },
                {
                    reg: '^#(同意|拒绝)全部好友申请$',
                    fnc: 'agreesAll'
                },
                {
                    reg: '^#?(加为|添加)好友$',
                    fnc: 'addFriend'
                },
                {
                    reg: '^#查看好友申请$',
                    fnc: 'agreesAll'
                },
                {
                    reg: '^#(同意|拒绝|查看)(全部)?加群申请.*$',
                    fnc: 'GroupAdd'
                },
            ]
        })
    }

    /** 同意好友申请 */
    async agree(e) {
        if (!e.isMaster) return
        let yes = /同意/.test(e.msg) ? true : false
        let qq = e.message[0].text.replace(/#|(同意|拒绝)申请/g, '').trim()
        if (e.message[1]) {
            qq = e.message[1].qq
        } else {
            qq = qq.match(/[1-9]\d*/g)
        }

        if (!qq) {
            e.reply('❎ 请输入正确的QQ号')
            return false
        }
        logger.mark(`[椰奶]${yes ? '同意' : '拒绝'}好友申请`)
        await Bot.pickFriend(qq)
            .setFriendReq('', yes)
            .then(() => e.reply(`✅ 已${yes ? '同意' : '拒绝'}${qq}的好友申请`))
            .catch((err) => console.log(err))
    }

    /**同意拒绝全部好友申请 */
    async agreesAll(e) {
        if (!e.isMaster) return

        let yes = /同意/.test(e.msg) ? true : false

        let FriendAdd = (await Bot.getSystemMsg())
            .filter(item => item.request_type == "friend" && item.sub_type == "add")

        if (lodash.isEmpty(FriendAdd)) return e.reply("暂无好友申请(。-ω-)zzz", true)

        if (/查看好友申请/.test(e.msg)) {
            FriendAdd = FriendAdd.map((item) => {
                return [
                    segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${item.user_id}`),
                    `申请人QQ：${item.user_id}\n`,
                    `申请人昵称：${item.nickname}\n`,
                    `申请来源：${item.source || '未知'}\n`,
                    `申请时间：${moment(item.time * 1000).format(`YYYY-MM-DD HH:mm:ss`)}\n`,
                    `附加信息：${item.comment || '无附加信息'}`
                ]
            })
            let msg = [
                `现有未处理的好友申请如下，共${FriendAdd.length}条`,
                `可用"同意申请xxx"或"拒绝申请xxx"`,
                ...FriendAdd
            ];
            return Cfg.getforwardMsg(e, msg)
        }
        for (let i of FriendAdd) {
            logger.mark(`[椰奶]${yes ? '同意' : '拒绝'}${i.user_id}的好友申请`)
            await Bot.pickFriend(i.user_id)
                .setFriendReq(i.seq, yes)
                .then(() => e.reply(`✅ 已${yes ? '同意' : '拒绝'}${i.user_id}的好友申请`))
                .catch((err) => console.log(err))
            await common.sleep(200)
        }
    }
    /** 引用同意好友申请和群邀请 */
    async agrees(e) {
        if (!e.isMaster) return
        if (!e.source) return
        if (!e.isPrivate) return
        let yes = /同意/.test(e.msg) ? true : false
        let source = (await e.friend.getChatHistory(e.source.time, 1)).pop()

        let res
        try {
            res = source.raw_message.split('\n')
        } catch {
            e.reply('❎ 消息可能已过期')
            return false
        }
        if (/申请人QQ/.test(res[1]) && /好友申请/.test(res[0])) {
            let qq = res[1].match(/[1-9]\d*/g)
            if (Bot.fl.get(Number(qq))) return e.reply('❎ 已经同意过该申请了哦~')

            logger.mark(`[椰奶]${yes ? '同意' : '拒绝'}好友申请`)

            await Bot.pickFriend(qq)
                .setFriendReq('', yes)
                .then(() => e.reply(`✅ 已${yes ? '同意' : '拒绝'}${qq}的好友申请`))
                .catch(() => e.reply('❎ 请检查是否已同意该申请'))
        } else if (
            /目标群号/.test(res[1]) &&
            /邀请人QQ/.test(res[3]) &&
            /邀请码/.test(res[6])
        ) {
            let groupid = res[1].match(/[1-9]\d*/g)
            if (Bot.fl.get(Number(groupid))) { return e.reply('❎ 已经同意过该申请了哦~') }

            let qq = res[3].match(/[1-9]\d*/g)
            let seq = res[6].match(/[1-9]\d*/g)

            logger.mark(`[椰奶]${yes ? '同意' : '拒绝'}群邀请`)

            Bot.pickUser(qq)
                .setGroupInvite(groupid, seq, yes)
                .then(() => e.reply(`✅ 已${yes ? '同意' : '拒绝'}${qq}的群邀请`))
                .catch(() => e.reply('❎ 请检查是否已同意该邀请'))
        } else {
            e.reply('❎ 请检查是否引用正确')
        }
    }

    // 回复好友消息
    async Replys(e) {
        if (!e.isMaster) return
        if (!e.isPrivate) return
        let qq = '';
        let group = '';
        let msgs = e.message[0].text.split(' ')
        if (e.source) {
            let source = (await e.friend.getChatHistory(e.source.time, 1)).pop();
            let res;
            try {
                res = source.raw_message.split('\n')
            } catch {
                return e.reply('❎ 消息可能已过期')
            }
            if (/好友消息/.test(res[0]) && /好友QQ/.test(res[1])) {
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
            logger.mark(`[椰奶]回复临时消息`)
            return Bot.sendTempMsg(group, qq, e.message)
                .then(() => { e.reply('✅ 已把消息发给它了哦~') })
                .catch((err) => e.reply(`❎ 发送失败\n错误信息为:${err.message}`))
        }

        if (!/^\d+$/.test(qq)) return e.reply('❎ QQ号不正确，人家做不到的啦>_<~')

        if (!Bot.fl.get(Number(qq))) return e.reply('❎ 好友列表查无此人')

        logger.mark(`[椰奶]回复好友消息`)

        Bot.pickFriend(qq)
            .sendMsg(e.message)
            .then(() => { e.reply('✅ 已把消息发给它了哦~') })
            .catch((err) => e.reply(`❎ 发送失败\n错误信息为:${err.message}`))
    }

    //加群员为好友
    async addFriend(e) {
        if (!e.isMaster) return
        if (!e.source) return
        if (!e.isPrivate) return
        let source = (await e.friend.getChatHistory(e.source.time, 1)).pop()
        let msg = source.raw_message.split('\n')
        if (!/临时消息/.test(msg[0]) || !/来源群号/.test(msg[1]) || !/发送人QQ/.test(msg[2])) return
        let group = msg[1].match(/\d+/g)
        let qq = msg[2].match(/\d+/g)
        if (Bot.fl.get(Number(qq))) return e.reply('❎ 已经有这个人的好友了哦~')
        if (!Bot.gl.get(Number(group))) { return e.reply('❎ 群聊列表查无此群') }
        logger.mark(`[椰奶]主动添加好友`)
        Bot.addFriend(group, qq)
            .then(() => e.reply(`✅ 已向${qq}发送了好友请求`))
            .catch(() => e.reply("❎ 发送请求失败"))
    }
    //入群请求
    async GroupAdd(e) {
        let SystemMsg = (await Bot.getSystemMsg())
            .filter(item => item.request_type == "group" && item.sub_type == "add" && item.group_id == e.group_id)
        if (lodash.isEmpty(SystemMsg)) return e.reply("暂无加群申请(。-ω-)zzz", true)
        //查看
        if (/查看/.test(e.msg)) {
            SystemMsg = SystemMsg.map(item => {
                return [
                    segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${item.user_id}`),
                    `\n申请QQ：${item.user_id}\n`,
                    `申请昵称：${item.nickname}\n`,
                    item.tips ? `Tips：${item.tips}\n` : "",
                    `附加消息：${item.comment}`
                ]
            })
            let msg = [
                `现有未处理的加群申请如下，总共${SystemMsg.length}条`,
                `可使用 "#(同意|拒绝)加群申请xxx" 或 "#(同意|拒绝)全部加群申请"`,
                ...SystemMsg
            ]
            return Cfg.getforwardMsg(e, msg)
        }
        if (!e.isMaster && !e.member.is_owner && !e.member.is_admin) {
            return e.reply("❎ 该命令仅限管理员可用", true);
        }
        let yes = /同意/.test(e.msg) ? true : false
        let success = [], fail = [], risk = []
        if (/全部/.test(e.msg)) {
            for (let i of SystemMsg) {
                if (/风险/.test(i.tips)) {
                    risk.push(i.user_id)
                } else {
                    if (await i.approve(yes)) {
                        success.push(i.user_id)
                    } else {
                        fail.push(i.user_id)
                    }
                }
                await Cfg.sleep(200)
            }
            let msg = [
                `本次共处理${SystemMsg.length}条申请，成功${success.length}，失败${fail.length}，风险${risk.length}`
            ]
            if (!lodash.isEmpty(success)) {
                msg.push([
                    `以下为成功的名单：\n`,
                    success.join("\n")
                ])
            }
            if (!lodash.isEmpty(fail)) {
                msg.push([
                    `以下为失败的名单：\n`,
                    fail.join("\n")
                ])
            }
            if (!lodash.isEmpty(risk)) {
                msg.push([
                    `以下为风险账号名单：\n`,
                    risk.join("\n")
                ])
            }
            Cfg.getforwardMsg(e, msg)
        } else {
            let qq = e.msg.replace(/#(同意|拒绝)加群申请/g, "").trim()
            let obj = SystemMsg.filter(item => item.user_id == qq)
            if (lodash.isEmpty(obj)) return e.reply("呜呜呜，没找到这个淫的加群申请(つд⊂)")

            if (/风险/.test(obj[0].tips)) return e.reply(`该账号为风险账号请手动处理哦ಠ~ಠ`)

            if (await obj[0].approve(yes)) {
                e.reply(`已${yes ? '同意' : '拒绝'}${obj.user_id}的加群申请辣٩(๑^o^๑)۶`)
            } else {
                e.reply(`处理失败辣(இωஇ)`)
            }
        }
    }
}