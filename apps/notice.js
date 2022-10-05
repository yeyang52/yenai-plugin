import plugin from '../../../lib/plugins/plugin.js'
import { segment } from 'oicq'
import cfg from '../../../lib/config/config.js'
import common from '../../../lib/common/common.js'
import xcfg from "../model/Config"

let config = {}

const ROLE_MAP = {
    admin: '群管理',
    owner: '群主',
    member: '群员'
}

/** 好友通知 */
export class Friends extends plugin {
    constructor() {
        super({
            name: '好友通知',
            dsc: '好友通知',
            event: 'notice.friend',
            priority: 5000
        })
        this.configpath = './plugins/yenai-plugin/config/config.json'
    }

    async init() {
        config = await xcfg.getread(this.configpath)
    }

    async accept(e) {
        let msg
        let forwardMsg
        switch (e.sub_type) {
            case 'increase': {
                if (!config.friendNumberChange) return
                msg = [
                    segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${e.user_id}`),
                    '[通知 - 新增好友]\n',
                    `好友QQ：${e.user_id}\n`,
                    `好友昵称：${e.nickname}`
                ]
                break
            }
            case 'decrease': {
                if (!config.friendNumberChange) return
                msg = [
                    segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${e.user_id}`),
                    '[通知 - 好友减少]\n',
                    `好友QQ：${e.user_id}\n`,
                    `好友昵称：${e.nickname}`
                ]
                break
            }
            case 'recall': {
                if (!config.PrivateRecall) return

                if (e.user_id == cfg.qq) return

                if (cfg.masterQQ.includes(e.user_id)) return

                // 读取
                let res = JSON.parse(
                    await redis.get(`notice:messagePrivate:${e.message_id}`)
                )
                // 无数据 return
                if (!res) return
                // 撤回为闪照处理
                if (res[0].type === 'flash') {
                    let url = res[0].url
                    res = ['[闪照]\n', '撤回闪照：', segment.image(url)]
                } else if (res[0].type === 'record') {
                    // 语音
                    forwardMsg = segment.record(res[0].url)
                    res = '[语音]'
                } else if (res[0].type === 'video') {
                    // 视频
                    forwardMsg = segment.video(res[0].file)
                    res = '[视频]'
                } else if (res[0].type === 'xml') {
                    // 合并消息
                    forwardMsg = res
                    res = '[合并消息]'
                }
                // 消息
                msg = [
                    segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${e.user_id}`),
                    '[消息 - 好友撤回消息]\n',
                    `好友QQ：${e.user_id}\n`,
                    `撤回时间：${formatDate(e.time)}\n`,
                    '撤回消息：',
                    ...res
                ]
                break
            }
            case 'poke': {
                if (!config.privateMessage) return
                msg = [
                    segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${e.user_id}`),
                    '[消息 - 戳一戳]\n',
                    `来源QQ：${e.user_id}`
                ]
                break
            }
            default:
                return
        }
        await getSend(msg)
        if (forwardMsg) {
            await getSend(forwardMsg)
        }
    }
}

/** 群通知 */
export class newgroups extends plugin {
    constructor() {
        super({
            name: '群通知',
            dsc: '群通知',
            event: 'notice.group'
        })
    }

    async accept(e) {
        let msg
        let forwardMsg
        switch (e.sub_type) {
            case 'increase': {
                if (e.user_id === cfg.qq) {
                    if (!config.groupNumberChange) return
                    msg = [
                        segment.image(
                            `https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/100`
                        ),
                        '[通知 - 新增群聊]\n',
                        `新增群号：${e.group_id}`
                    ]
                } else {
                    if (!config.groupMemberNumberChange) return
                    msg = [
                        segment.image(
                            `https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/100`
                        ),
                        '[通知 - 新增群员]\n',
                        `群号：${e.group_id}\n`,
                        `新成员QQ：${e.user_id}\n`,
                        `新成员昵称：${e.nickname}`
                    ]
                }
                break
            }
            case 'decrease': {
                if (e.dismiss) {
                    if (!config.groupNumberChange) return
                    msg = [
                        segment.image(
                            `https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/100`
                        ),
                        '[通知 - 群聊被解散]\n',
                        `操作人QQ：${e.operator_id}\n`,
                        `解散群号：${e.group_id}`
                    ]
                } else if (e.user_id === cfg.qq && e.operator_id !== cfg.qq) {
                    if (!config.groupNumberChange) return
                    msg = [
                        segment.image(
                            `https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/100`
                        ),
                        '[通知 - 机器人被踢]\n',
                        `操作人QQ：${e.operator_id}\n`,
                        `被踢群号：${e.group_id}`
                    ]
                } else if (e.user_id === cfg.qq && e.operator_id === cfg.qq) {
                    if (!config.groupNumberChange) return
                    msg = [
                        segment.image(
                            `https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/100`
                        ),
                        '[通知 - 机器人退群]\n',
                        `退出群号：${e.group_id}`
                    ]
                } else if (e.operator_id === e.user_id) {
                    if (!config.groupMemberNumberChange) return
                    msg = [
                        segment.image(
                            `https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/100`
                        ),
                        '[通知 - 群员退群]\n',
                        `退群人QQ：${e.user_id}\n`,
                        `退群人昵称：${e.member === null || e.member === void 0
                            ? void 0
                            : e.member.nickname
                        }\n`,
                        `退群人群名片：${e.member === null || e.member === void 0 ? void 0 : e.member.card
                        }\n`,
                        `退出群号：${e.group_id}`
                    ]
                } else if (e.operator_id !== e.user_id) {
                    if (!config.groupMemberNumberChange) return
                    msg = [
                        segment.image(
                            `https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/100`
                        ),
                        '[通知 - 群员被踢]\n',
                        `操作人QQ：${e.operator_id}\n`,
                        `被踢人QQ：${e.user_id}\n`,
                        `被踢人昵称：${e.member === null || e.member === void 0
                            ? void 0
                            : e.member.nickname
                        }\n`,
                        `被踢人群名片：${e.member === null || e.member === void 0 ? void 0 : e.member.card
                        }\n`,
                        `被踢群号：${e.group_id}`
                    ]
                }
                break
            }
            // 群管理变动
            case 'admin': {
                if (!config.groupAdminChange) return
                if (e.user_id === cfg.qq) {
                    msg = [
                        segment.image(
                            `https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/100`
                        ),
                        e.set
                            ? '[通知 - 机器人被设置管理]:\n'
                            : '[通知 - 机器人被取消管理]:\n',
                        `被操作群号：${e.group_id}`
                    ]
                } else {
                    msg = [
                        segment.image(
                            `https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/100`
                        ),
                        e.set ? '[通知 - 新增群管理员]:\n' : '[通知 - 取消群管理员]:\n',
                        `被操作QQ：${e.user_id}\n`,
                        `被操作群号：${e.group_id}`
                    ]
                }
                break
            }
            // 禁言 (这里仅处理机器人被禁言)
            case 'ban': {
                let Forbiddentime = getsecond(e.duration)

                if (!config.botBeenBanned) return
                if (e.user_id != cfg.qq) return
                if (e.duration == 0) {
                    msg = [
                        segment.image(
                            `https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/100`
                        ),
                        '[通知 - 机器人被解除禁言]\n',
                        `处理人QQ：${e.operator_id}\n`,
                        `处理群号：${e.group_id}`
                    ]
                } else if (e.user_id === cfg.qq) {
                    msg = [
                        segment.image(
                            `https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/100`
                        ),
                        '[通知 - 机器人被禁言]\n',
                        `禁言人QQ：${e.operator_id}\n`,
                        `禁言群号：${e.group_id}\n`,
                        `禁言时长：${Forbiddentime}`
                    ]
                }
                break
            }
            // 群转让
            case 'transfer': {
                if (!config.groupNumberChange) return
                msg = [
                    segment.image(
                        `https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/100`
                    ),
                    '[通知 - 群聊转让]\n',
                    `转让群号：${e.group_id}\n`,
                    `旧群主：${e.operator_id}\n`,
                    `新群主：${e.user_id}`
                ]
                break
            }
            // 群撤回
            case 'recall': {
                // 开启或关闭
                if (!config.groupRecall) return
                // 是否为机器人撤回
                if (e.user_id == cfg.qq) return
                // 是否为主人撤回
                if (cfg.masterQQ.includes(e.user_id)) return
                // 读取
                let res = JSON.parse(
                    await redis.get(`notice:messageGroup:${e.message_id}`)
                )
                // 无数据 return出去
                if (!res) return
                // 不同消息处理
                let special = ''
                if (res[0].type === 'flash') {
                    // 闪照处理
                    forwardMsg = await e.group.makeForwardMsg([
                        {
                            message: segment.image(res[0].url),
                            nickname: e.group.pickMember(e.user_id).card,
                            user_id: e.user_id
                        }
                    ])
                    special = '[闪照]'
                } else if (res[0].type === 'record') {
                    // 语音
                    forwardMsg = segment.record(res[0].url)
                    special = '[语音]'
                } else if (res[0].type === 'video') {
                    // 视频
                    forwardMsg = segment.video(res[0].file)
                    special = '[视频]'
                } else if (res[0].type === 'xml') {
                    // 合并消息
                    forwardMsg = res
                    special = '[合并消息]'
                } else {
                    // 正常处理
                    forwardMsg = await e.group.makeForwardMsg([
                        {
                            message: res,
                            nickname: e.group.pickMember(e.user_id).card,
                            user_id: e.user_id
                        }
                    ])
                }
                // 判断是否管理撤回
                let isManage = ''
                if (e.operator_id != e.user_id) {
                    isManage = `撤回管理：${e.group.pickMember(e.operator_id).card}(${e.operator_id
                        })\n`
                }
                // 发送的消息
                msg = [
                    segment.image(
                        `https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/100`
                    ),
                    `[通知 - 群聊${isManage ? '管理' : ''}撤回]\n`,
                    `撤回群名：${e.group_name}\n`,
                    `撤回群号：${e.group_id}\n`,
                    isManage,
                    `${isManage ? '被撤回人' : '撤回人员'}：${e.group.pickMember(e.user_id).card
                    }(${e.user_id})\n`,
                    `撤回时间：${formatDate(e.time)}`,
                    special ? `\n特殊消息：${special}` : ''
                ]
                break
            }
            default:
                return
        }
        await getSend(msg)
        if (forwardMsg) {
            await getSend(forwardMsg)
        }
    }
}

/** 好友申请 */
export class application extends plugin {
    constructor() {
        super({
            name: '好友申请',
            dsc: '好友申请',
            event: 'request.friend'
        })
    }

    async accept(e) {
        if (!config.friendRequest) return
        let msg = [
            segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${e.user_id}`),
            '[通知 - 添加好友申请]\n',
            `申请人QQ：${e.user_id}\n`,
            `申请人昵称：${e.nickname}\n`,
            `申请来源：${e.source || '未知'}\n`,
            `附加信息：${e.comment || '无附加信息'}\n`
        ]
        if (cfg.other.autoFriend == 1) {
            msg.push('已自动同意该好友申请')
        } else {
            msg.push(
                `-------------\n可回复：同意申请${e.user_id} \n或引用该消息回复"同意"或"拒绝"`
            )
        }
        await getSend(msg)
    }
}

/** 群邀请 */
export class invitation extends plugin {
    constructor() {
        super({
            name: '群邀请',
            dsc: '群邀请',
            event: 'request.group.invite'
        })
    }

    async accept(e) {
        let msg = ''
        if (!config.groupInviteRequest) return

        if (cfg.masterQQ.includes(e.user_id)) return

        msg = [
            segment.image(`https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/0`),
            '[通知 - 邀请机器人进群]\n',
            `目标群号：${e.group_id}\n`,
            `目标群名：${e.group_name}\n`,
            `邀请人QQ：${e.user_id}\n`,
            `邀请人昵称：${e.nickname}\n`,
            `邀请人群身份：${ROLE_MAP[e.role]}\n`,
            `邀请码：${e.seq}\n`
        ]
        if (cfg.other.autoQuit <= 0) {
            msg.push('----------------\n可引用该消息回复"同意"或"拒绝"')
        } else {
            msg.push('已自动处理该邀请')
        }
        await getSend(msg)
    }
}
/** 消息 */
export class anotice extends plugin {
    constructor() {
        super({
            name: '消息',
            dsc: '闪照等消息',
            event: 'message',
            rule: [
                {
                    /** 命令正则匹配 */
                    reg: '^#?同意申请.*$',
                    /** 执行方法 */
                    fnc: 'agree'
                },
                {
                    /** 命令正则匹配 */
                    reg: '^#?(同意|拒绝)$',
                    /** 执行方法 */
                    fnc: 'agrees'
                },
                {
                    /** 命令正则匹配 */
                    reg: '^#?回复.*$',
                    /** 执行方法 */
                    fnc: 'Replys'
                }
            ]
        })
    }

    async accept(e) {
        // 判断是否为机器人消息
        if (e.user_id == cfg.qq) return
        // 判断是否主人消息
        if (cfg.masterQQ.includes(e.user_id)) return

        // 判断群聊还是私聊
        if (e.isGroup) {
            // 关闭撤回停止存储
            if (config.groupRecall) {
                // 写入
                await redis.set(
                    `notice:messageGroup:${e.message_id}`,
                    JSON.stringify(e.message),
                    { EX: config.deltime }
                )
            }
        } else if (e.isPrivate) {
            // 关闭撤回停止存储
            if (config.PrivateRecall) {
                // 写入
                await redis.set(
                    `notice:messagePrivate:${e.message_id}`,
                    JSON.stringify(e.message),
                    { EX: config.deltime }
                )
            }
        }

        // 消息通知
        let msg = ''
        let forwardMsg
        if (
            e.message[0].type == 'flash' &&
            e.message_type === 'group' &&
            config.flashPhoto
        ) {
            msg = [
                segment.image(`https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/100`),
                '[消息 - 闪照消息]\n',
                `发送人QQ：${e.user_id}\n`,
                `发送人昵称：${e.sender.nickname}\n`,
                `来源群号：${e.group_id}\n`,
                `来源群名：${e.group_name}\n`,
                `闪照链接:${e.message[0].url}`
            ]
        } else if (
            e.message[0].type == 'flash' &&
            e.message_type === 'discuss' &&
            config.flashPhoto
        ) {
            msg = [
                segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${e.user_id}`),
                '[消息 - 闪照消息]\n',
                `发送人QQ：${e.user_id}\n`,
                `发送人昵称：${e.sender.nickname}\n`,
                `讨论组号：${e.discuss_id}\n`,
                `讨论组名：${e.discuss_name}\n`,
                `闪照链接:${e.message[0].url}`
            ]
        } else if (
            e.message[0].type == 'flash' &&
            e.message_type === 'private' &&
            config.flashPhoto
        ) {
            msg = [
                segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${e.user_id}`),
                '[消息 - 闪照消息]\n',
                `发送人QQ：${e.user_id}\n`,
                `发送人昵称：${e.sender.nickname}\n`,
                `闪照链接:${e.message[0].url}`
            ]
        } else if (e.message_type === 'private' && e.sub_type === 'friend') {
            if (!config.privateMessage) return

            let res = e.message
            // 特殊消息处理
            let arr = this.getSpecial(e.message)
            if (arr) {
                forwardMsg = arr.msg
                res = arr.type
            }

            msg = [
                segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${e.user_id}`),
                '[消息 - 好友消息]\n',
                `好友QQ：${e.user_id}\n`,
                `好友昵称：${e.sender.nickname}\n`,
                '消息内容：',
                ...res
            ]
            // 添加提示消息
            let key = `tz:privateMessage:${e.user_id}`
            if (!(await redis.get(key))) {
                await redis.set(key, '1', { EX: 600 })
                msg.push(
                    '\n-------------\n',
                    '引用该消息：回复 <内容>\n',
                    `或发送:回复 ${e.user_id} <内容>`
                )
            }
        } else if (e.message_type === 'private' && e.sub_type === 'group') {
            if (!config.grouptemporaryMessage) return
            // 特殊消息处理
            let res = e.message
            let arr = this.getSpecial(e.message)
            if (arr) {
                forwardMsg = arr.msg
                res = arr.type
            }
            // 发送的消息
            msg = [
                segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${e.user_id}`),
                '[消息 - 群临时消息]\n',
                `来源群号：${e.sender.group_id}\n`,
                `发送人QQ：${e.user_id}\n`,
                '消息内容：',
                ...res
            ]
        } else if (e.message_type === 'group') {
            if (!config.groupMessage) return
            // 特殊消息处理
            let res = e.message
            let arr = this.getSpecial(e.message)
            if (arr) {
                forwardMsg = arr.msg
                res = arr.type
            }

            msg = [
                segment.image(`https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/100`),
                '[消息 - 群聊消息]\n',
                `来源群号：${e.group_id}\n`,
                `来源群名：${e.group_name}\n`,
                `发送人QQ：${e.user_id}\n`,
                `发送人昵称：${e.sender.nickname}\n`,
                '消息内容：',
                ...res
            ]
        } else if (e.message_type === 'discuss') {
            if (!config.groupMessage) return
            msg = [
                segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${e.user_id}`),
                '[消息 - 群聊消息]\n',
                `来源讨论组号：${e.discuss_id}\n`,
                `来源讨论组名：${e.discuss_name}\n`,
                `发送人QQ：${e.user_id}\n`,
                `发送人昵称：${e.sender.nickname}\n`,
                `消息内容：${e.raw_message}`
            ]
        }
        // 发送消息
        await getSend(msg)
        if (forwardMsg) {
            await getSend(forwardMsg)
        }
    }

    // 特殊消息处理
    getSpecial(msg) {
        let res = msg
        if (res[0].type === 'record') {
            // 语音
            return {
                msg: segment.record(res[0].url),
                type: '[语音]'
            }
        } else if (res[0].type === 'video') {
            // 视频
            return {
                msg: segment.video(res[0].file),
                type: '[视频]'
            }
        } else if (res[0].type === 'xml') {
            // 合并消息
            return {
                msg: res,
                type: '[合并消息]'
            }
        } else return false
    }

    /** 同意好友申请 */
    async agree(e) {
        if (!e.isMaster) return

        let qq = e.message[0].text.replace(/#|同意申请/g, '').trim()
        if (e.message[1]) {
            qq = e.message[1].qq
        } else {
            qq = qq.match(/[1-9]\d*/g)
        }

        if (!qq) {
            e.reply('❎ 请输入正确的QQ号')
            return false
        }
        await Bot.pickFriend(qq)
            .setFriendReq()
            .then(() => e.reply(`✅ 已同意${qq}的好友申请`))
            .catch((err) => console.log(err))
    }

    /** 引用同意好友申请和群邀请 */
    async agrees(e) {
        if (!e.isMaster) return
        if (!e.source) return
        if (!e.isPrivate) return
        let yes = true
        if (/拒绝/.test(e.msg)) {
            yes = false
        }
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
            Bot.pickFriend(qq)
                .setFriendReq('', yes)
                .then(() => e.reply(`✅ 已${yes ? '同意' : '拒绝'}${qq}的好友申请`))
                .catch(() => e.reply('❎ 请检查是否已同意该申请'))
        } else if (
            /目标群号/.test(res[1]) &&
            /邀请人QQ/.test(res[3]) &&
            /邀请码/.test(res[6])
        ) {
            // 这里借鉴了一下p佬的进群同意，p佬我的超人！！！
            let groupid = res[1].match(/[1-9]\d*/g)
            if (Bot.fl.get(Number(groupid))) { return e.reply('❎ 已经同意过该申请了哦~') }

            let qq = res[3].match(/[1-9]\d*/g)
            let seq = res[6].match(/[1-9]\d*/g)
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
        let qq;
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
                return e.reply('❎ 群临时消息无法回复，请添加好友')
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

        if (!/^\d+$/.test(qq)) return e.reply('❎ QQ号不正确，人家做不到的啦>_<~')

        if (!Bot.fl.get(Number(qq))) return e.reply('❎ 好友列表查无此人')

        if (!e.message[0].text) e.message.shift()

        if (e.message.length === 0) return e.reply('❎ 消息不能为空')

        Bot.pickFriend(qq)
            .sendMsg(e.message)
            .then(() => { e.reply('✅ 已把消息发给它了哦~') })
            .catch((err) => e.reply(`❎ 发送失败\n错误信息为:${err.message}`))
    }
}


/** 发消息 */
async function getSend(msg) {
    if (config.notificationsAll) {
        // 发送全部管理
        for (let index of cfg.masterQQ) {
            await common.relpyPrivate(index, msg)
        }
    } else {
        // 发给第一个管理
        await common.relpyPrivate(cfg.masterQQ[0], msg)
        await common.sleep(200)
    }
}

/** 时间转换 */
function formatDate(time) {
    let now = new Date(parseFloat(time) * 1000)
    // 月
    let month = now.getMonth() + 1
    // 日
    let date = now.getDate()
    // 补0
    if (month >= 1 && month <= 9) month = '0' + month
    if (date >= 0 && date <= 9) date = '0' + date
    // 时
    let hour = now.getHours()
    // 分
    let minute = now.getMinutes()
    // 补0
    if (hour >= 1 && hour <= 9) hour = '0' + hour
    if (minute >= 0 && minute <= 9) minute = '0' + minute
    return `${month}-${date} ${hour}:${minute} `
}

// 秒转换
function getsecond(value) {
    let secondTime = parseInt(value) // 秒
    let minuteTime = 0 // 分
    let hourTime = 0 // 小时
    if (secondTime > 60) {
        // 如果秒数大于60，将秒数转换成整数
        // 获取分钟，除以60取整数，得到整数分钟
        minuteTime = parseInt(secondTime / 60)
        // 获取秒数，秒数取佘，得到整数秒数
        secondTime = parseInt(secondTime % 60)
        // 如果分钟大于60，将分钟转换成小时
        if (minuteTime > 60) {
            // 获取小时，获取分钟除以60，得到整数小时
            hourTime = parseInt(minuteTime / 60)
            // 获取小时后取佘的分，获取分钟除以60取佘的分
            minuteTime = parseInt(minuteTime % 60)
        }
    }
    // 处理返回消息
    let result = ''
    if (secondTime != 0) {
        result = parseInt(secondTime) + '秒'
    }
    if (minuteTime > 0) {
        result = parseInt(minuteTime) + '分' + result
    }
    if (hourTime > 0) {
        result = parseInt(hourTime) + '小时' + result
    }
    return result
}