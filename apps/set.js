import plugin from '../../../lib/plugins/plugin.js'
import xcfg from "../model/Config"

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
        this.path = './plugins/yenai-plugin/config'
        this.configpath = './plugins/yenai-plugin/config/config.json'
    }
    async init() {
        if (!fs.existsSync(this.path)) {
            fs.mkdirSync(this.path)
        }
        // 检测有无配置文件，没有就创建默认配置文件
        if (!fs.existsSync(this.configpath)) {
            let configs = {
                privateMessage: true, // 好友消息
                groupMessage: false, // 群|讨论组消息(不建议开启)
                grouptemporaryMessage: true, // 群临时消息
                groupRecall: true, // 群撤回
                PrivateRecall: true, // 好友撤回
                // 申请通知
                friendRequest: true, // 好友申请
                groupInviteRequest: true, // 群邀请
                // 信息变动
                groupAdminChange: true, // 群管理变动
                // 列表变动
                friendNumberChange: true, // 好友列表变动
                groupNumberChange: true, // 群聊列表变动
                groupMemberNumberChange: false, // 群成员变动
                // 其他通知
                flashPhoto: true, // 闪照
                botBeenBanned: true, // 机器人被禁言
                // 是否给全部管理发送通知(默认只通知第一个管理)
                notificationsAll: false,
                // 设置删除消息缓存的时间单位s(用于撤回监听)
                deltime: 600 // 不建议太大
            }
            await xcfg.getwrite(this.configpath, configs)
        }
    }

    // 更改配置
    async Config_manage(e) {
        if (!e.isMaster) return
        // 解析消息
        let index = e.msg.indexOf('通知')
        let option = e.msg.slice(0, index)
        option = option.replace(/#/, '').trim()
        // 开启还是关闭
        let yes = false
        if (/开启/.test(e.msg)) yes = true
        // 回复
        if (await getcfg(option, yes)) {
            e.reply(`✅ 已${yes ? '开启' : '关闭'}${option}通知`)
        }
    }

    // 设置删除缓存时间
    async Config_deltime(e) {
        if (!e.isMaster) return

        let time = e.msg.replace(/#|设置删除缓存时间/, '').trim()

        time = time.match(/\d*/g)

        if (!time) return e.reply('❎ 请输入正确的时间(单位s)')

        if (time < 120) return e.reply('❎ 时间不能小于两分钟')

        if (await getcfg('缓存时间', Number(time))) {
            e.reply(`✅ 已设置删除缓存时间为${getsecond(time)}`)
        }
    }

    async SeeConfig() {

        let config = await xcfg.getread(this.configpath)

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
/**更改配置 */
async function getcfg(key, value) {
    // 路径
    let path = './plugins/yenai-plugin/config/config.json'
    // 配置类
    const parameter = {
        好友消息: 'privateMessage',
        群消息: 'groupMessage',
        群临时消息: 'grouptemporaryMessage',
        群撤回: 'groupRecall',
        好友撤回: 'PrivateRecall',
        好友申请: 'friendRequest',
        群邀请: 'groupInviteRequest',
        群管理变动: 'groupAdminChange',
        好友列表变动: 'friendNumberChange',
        群聊列表变动: 'groupNumberChange',
        群成员变动: 'groupMemberNumberChange',
        闪照: 'flashPhoto',
        禁言: 'botBeenBanned',
        全部管理: 'notificationsAll',
        缓存时间: 'deltime'
    }
    // 判断是否有这一项类
    if (!parameter.hasOwnProperty(key)) return false
    // 读取配置
    let cfg = await xcfg.getread(path)
    // 更改配置
    cfg[parameter[key]] = value
    // 写入
    await xcfg.getwrite(path, cfg)

    return true
}
