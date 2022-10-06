import plugin from '../../../lib/plugins/plugin.js'

export class NewConfig extends plugin {
    constructor() {
        super({
            name: '修改配置',
            dsc: '配置文件',
            event: 'message',
            priority: 5000,
            rule: [
                {
                    /** 命令正则匹配 */
                    reg: '^#?(.*)通知(开启|关闭)$',
                    /** 执行方法 */
                    fnc: 'Config_manage'
                },
                {
                    /** 命令正则匹配 */
                    reg: '^#?设置删除缓存时间(.*)$',
                    /** 执行方法 */
                    fnc: 'Config_deltime'
                },
                {
                    /** 命令正则匹配 */
                    reg: '^#?通知设置$',
                    /** 执行方法 */
                    fnc: 'SeeConfig'
                },
            ]
        })
    }

    // 更改配置
    async Config_manage(e) {
        if (!e.isMaster) return
        // 解析消息
        let index = e.msg.indexOf('通知')
        let option = e.msg.slice(0, index)
        option = option.replace(/#/, '').trim()
        // 开启还是关闭
        let res
        if (/开启/.test(e.msg)) {
            // 回复
            res = await redis.set(`yenai:notice:${configs[option]}`, "1")
        } else {
            res = await redis.del(`yenai:notice:${configs[option]}`,)
        }


        if (res == "OK") {
            e.reply(`✅ 已${/开启/.test(e.msg) ? '开启' : '关闭'}${option}通知`)
        }
    }

    // 设置删除缓存时间
    async Config_deltime(e) {
        if (!e.isMaster) return

        let time = e.msg.replace(/#|设置删除缓存时间/, '').trim()

        time = time.match(/\d*/g)

        if (!time) return e.reply('❎ 请输入正确的时间(单位s)')

        if (time < 120) return e.reply('❎ 时间不能小于两分钟')

        let res = await redis.set(`yenai:notice:deltime`, String(time[0]))
        if (res == "OK") {
            e.reply(`✅ 已设置删除缓存时间为${getsecond(time)}`)
        }
    }

    async SeeConfig() {
        let config = {}
        for (let i in configs) {
            let res = await redis.get(`yenai:notice:${configs[i]}`)
            config[configs[i]] = res
        }
        console.log(config);
        let msg = [
            `闪照 ${config.flashPhoto ? '✅' : '❎'}\n`,
            `禁言 ${config.botBeenBanned ? '✅' : '❎'}\n`,
            `群消息 ${config.groupMessage ? '✅' : '❎'}\n`,
            `群撤回 ${config.groupRecall ? '✅' : '❎'}\n`,
            `群邀请 ${config.groupInviteRequest ? '✅' : '❎'}\n`,
            `好友消息 ${config.privateMessage ? '✅' : '❎'}\n`,
            `好友撤回 ${config.PrivateRecall ? '✅' : '❎'}\n`,
            `好友申请 ${config.friendRequest ? '✅' : '❎'}\n`,
            `群成员变动 ${config.groupMemberNumberChange ? '✅' : '❎'}\n`,
            `群管理变动 ${config.groupAdminChange ? '✅' : '❎'}\n`,
            `群临时消息 ${config.grouptemporaryMessage ? '✅' : '❎'}\n`,
            `好友列表变动 ${config.friendNumberChange ? '✅' : '❎'}\n`,
            `群聊列表变动 ${config.groupNumberChange ? '✅' : '❎'}\n`,
            `全部管理发送 ${config.notificationsAll ? '✅' : '❎'}\n`,
            `删除缓存时间：${config.deltime}`
        ]
        await this.e.reply(msg)
    }
}

const configs = {
    好友消息: "privateMessage",
    群消息: "groupMessage",
    群临时消息: "grouptemporaryMessage",
    群撤回: "groupRecall",
    好友撤回: "PrivateRecall",
    // 申请通知
    好友申请: "friendRequest",
    群邀请: "groupInviteRequest",
    // 信息变动
    群管理变动: "groupAdminChange",
    // 列表变动
    好友列表变动: "friendNumberChange",
    群聊列表变动: "groupNumberChange",
    群成员变动: "groupMemberNumberChange",
    // 其他通知
    闪照: "flashPhoto",
    禁言: "botBeenBanned",
    全部通知: "notificationsAll",
    删除缓存: "deltime"
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