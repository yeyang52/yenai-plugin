import plugin from '../../../lib/plugins/plugin.js'
import { segment } from 'oicq'

export class Help extends plugin {
    constructor() {
        super({
            name: '帮助',
            dsc: '通知帮助',
            event: 'message',
            priority: 5000,
            rule: [
                {
                    /** 命令正则匹配 */
                    reg: '^#?通知帮助$',
                    /** 执行方法 */
                    fnc: 'help'
                }
            ]
        })
    }


    // 帮助
    async help() {
        let msg = [
            segment.image('https://api.ixiaowai.cn/api/api.php'),
            '通知帮助 by 超市椰羊\n',
            '---------------------\n',
            '#闪照通知 (开启|关闭)\n',
            '#禁言通知 (开启|关闭)\n',
            '#群撤回通知 (开启|关闭)\n',
            '#群消息通知 (开启|关闭)\n',
            '#群邀请通知 (开启|关闭)\n',
            '#好友撤回通知 (开启|关闭)\n',
            '#好友消息通知 (开启|关闭)\n',
            '#好友申请通知 (开启|关闭)\n',
            '#全部管理通知 (开启|关闭)\n',
            '#群临时消息通知 (开启|关闭)\n',
            '#群管理变动通知 (开启|关闭)\n',
            '#群成员变动通知 (开启|关闭)\n',
            '#好友列表变动通知 (开启|关闭)\n',
            '#群聊列表变动通知 (开启|关闭)\n',
            '#设置删除缓存时间 <时间>(s)\n',
            '#查看通知设置\n',
            '#刷新通知设置'
        ]
        this.e.reply(msg)
    }
}