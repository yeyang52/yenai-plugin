import plugin from '../../../lib/plugins/plugin.js'
import { segment } from 'oicq'
import cfg from '../../../lib/config/config.js'
import common from '../../../lib/common/common.js'


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
    }

    async accept(e) {
        let msg
        let forwardMsg
        switch (e.sub_type) {
            case 'increase': {
                if (!await redis.get(`yenai:notice:friendNumberChange`)) return
                msg = [
                    segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${e.user_id}`),
                    '[通知 - 新增好友]\n',
                    `好友QQ：${e.user_id}\n`,
                    `好友昵称：${e.nickname}`
                ]
                break
            }
            case 'decrease': {
                if (!await redis.get(`yenai:notice:friendNumberChange`)) return
                msg = [
                    segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${e.user_id}`),
                    '[通知 - 好友减少]\n',
                    `好友QQ：${e.user_id}\n`,
                    `好友昵称：${e.nickname}`
                ]
                break
            }
            case 'recall': {
                if (!await redis.get(`yenai:notice:PrivateRecall`)) return

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
                if (!await redis.get(`yenai:notice:privateMessage`)) return
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
                    if (!await redis.get(`yenai:notice:groupNumberChange`)) return
                    msg = [
                        segment.image(
                            `https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/100`
                        ),
                        '[通知 - 新增群聊]\n',
                        `新增群号：${e.group_id}`
                    ]
                } else {
                    if (!await redis.get(`yenai:notice:groupMemberNumberChange`)) return
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
                    if (!await redis.get(`yenai:notice:groupNumberChange`)) return
                    msg = [
                        segment.image(
                            `https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/100`
                        ),
                        '[通知 - 群聊被解散]\n',
                        `操作人QQ：${e.operator_id}\n`,
                        `解散群号：${e.group_id}`
                    ]
                } else if (e.user_id === cfg.qq && e.operator_id !== cfg.qq) {
                    if (!await redis.get(`yenai:notice:groupNumberChange`)) return
                    msg = [
                        segment.image(
                            `https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/100`
                        ),
                        '[通知 - 机器人被踢]\n',
                        `操作人QQ：${e.operator_id}\n`,
                        `被踢群号：${e.group_id}`
                    ]
                } else if (e.user_id === cfg.qq && e.operator_id === cfg.qq) {
                    if (!await redis.get(`yenai:notice:groupNumberChange`)) return

                    msg = [
                        segment.image(
                            `https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/100`
                        ),
                        '[通知 - 机器人退群]\n',
                        `退出群号：${e.group_id}`
                    ]
                } else if (e.operator_id === e.user_id) {
                    if (!await redis.get(`yenai:notice:groupMemberNumberChange`)) return

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
                    if (!await redis.get(`yenai:notice:groupMemberNumberChange`)) return

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
                if (!await redis.get(`yenai:notice:groupAdminChange`)) return

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

                if (!await redis.get(`yenai:notice:botBeenBanned`)) return

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
                if (!await redis.get(`yenai:notice:groupNumberChange`)) return
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
                if (!await redis.get(`yenai:notice:groupRecall`)) return
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
        if (!await redis.get(`yenai:notice:friendRequest`)) return
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
        if (!await redis.get(`yenai:notice:groupInviteRequest`)) return

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
let deltime
export class anotice extends plugin {
    constructor() {
        super({
            name: '消息',
            dsc: '闪照等消息',
            event: 'message',
        })
    }
    async init() {
        deltime = await redis.get(`yenai:notice:deltime`)
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
                    { EX: deltime }
                )
            }
        } else if (e.isPrivate) {
            // 关闭撤回停止存储
            if (config.PrivateRecall) {
                // 写入
                await redis.set(
                    `notice:messagePrivate:${e.message_id}`,
                    JSON.stringify(e.message),
                    { EX: deltime }
                )
            }
        }

        // 消息通知
        let msg = ''
        let forwardMsg
        if (
            e.message[0].type == 'flash' &&
            e.message_type === 'group' &&
            await redis.get(`yenai:notice:flashPhoto`)
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
            await redis.get(`yenai:notice:flashPhoto`)
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
            await redis.get(`yenai:notice:flashPhoto`)
        ) {
            msg = [
                segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${e.user_id}`),
                '[消息 - 闪照消息]\n',
                `发送人QQ：${e.user_id}\n`,
                `发送人昵称：${e.sender.nickname}\n`,
                `闪照链接:${e.message[0].url}`
            ]
        } else if (e.message_type === 'private' && e.sub_type === 'friend') {
            if (!await redis.get(`yenai:notice:privateMessage`)) return

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
            if (!await redis.get(`yenai:notice:grouptemporaryMessage`)) return
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
            if (!await redis.get(`yenai:notice:groupMessage`)) return
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
            if (!await redis.get(`yenai:notice:groupMessage`)) return
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