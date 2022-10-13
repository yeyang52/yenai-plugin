import plugin from '../../../lib/plugins/plugin.js'
import { segment } from 'oicq'
import cfg from '../../../lib/config/config.js'
import xcfg from '../model/Config.js'



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

                    logger.mark("[椰奶]新增群聊")

                    msg = [
                        segment.image(
                            `https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/100`
                        ),
                        '[通知 - 新增群聊]\n',
                        `新增群号：${e.group_id}`
                    ]
                } else {
                    if (!await redis.get(`yenai:notice:groupMemberNumberChange`)) return

                    logger.mark("[椰奶]新增群员")

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

                    logger.mark("[椰奶]群聊被解散")

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

                    logger.mark("[椰奶]机器人被踢")

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

                    logger.mark("[椰奶]机器人退群")

                    msg = [
                        segment.image(
                            `https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/100`
                        ),
                        '[通知 - 机器人退群]\n',
                        `退出群号：${e.group_id}`
                    ]
                } else if (e.operator_id === e.user_id) {
                    if (!await redis.get(`yenai:notice:groupMemberNumberChange`)) return

                    logger.mark("[椰奶]群员退群")

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

                    logger.mark("[椰奶]群员被踢")

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

                e.set ? logger.mark("[椰奶]机器人被设置管理") : logger.mark("[椰奶]机器人被取消管理")
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

                    e.set ? logger.mark("[椰奶]新增群管理员") : logger.mark("[椰奶]取消群管理员")

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
                    logger.mark("[椰奶]机器人被解除禁言")
                    msg = [
                        segment.image(
                            `https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/100`
                        ),
                        '[通知 - 机器人被解除禁言]\n',
                        `处理人QQ：${e.operator_id}\n`,
                        `处理群号：${e.group_id}`
                    ]
                } else if (e.user_id === cfg.qq) {

                    logger.mark("[椰奶]机器人被禁言")

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

                logger.mark("[椰奶]群聊转让")

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
                    forwardMsg = await Bot.pickFriend(cfg.masterQQ[0]).makeForwardMsg([
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
                isManage ? logger.mark("[椰奶]群聊管理撤回") : logger.mark("[椰奶]群聊撤回")
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
        await xcfg.getSend(msg)
        if (forwardMsg) {
            await xcfg.getSend(forwardMsg)
        }
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
    let time = xcfg.getsecond(value)

    let { second, minute, hour, day } = time
    // 处理返回消息
    let result = ''
    if (second != 0) {
        result = parseInt(second) + '秒'
    }
    if (minute > 0) {
        result = parseInt(minute) + '分' + result
    }
    if (hour > 0) {
        result = parseInt(hour) + '小时' + result
    }
    if (day > 0) {
        result = parseInt(day) + '天' + result
    }
    return result
}