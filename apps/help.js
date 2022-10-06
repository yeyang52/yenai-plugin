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
                    reg: '^#?通知帮助$',
                    fnc: 'help'
                },
                {
                    reg: '^#?助手帮助$',
                    fnc: 'helps'
                },
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
    async helps(e) {
        let msg = [
            segment.image("https://api.ixiaowai.cn/api/api.php"),
            "小助手 by 超市椰羊 \n",
            "--------------------\n",
            "#发群聊 <群号> <内容> \n",
            "#发好友 <QQ> <内容> \n",
            "#改头像 <图片> \n",
            "#改状态 <状态> \n",
            "#改昵称 <昵称> \n",
            "#改签名 <签名> \n",
            "#改性别 <性别> \n",
            "#改群名片 <名片> \n",
            "#改群昵称 <昵称> \n",
            "#改群头像 <图片> \n",
            "#删好友 <QQ> \n",
            "#退群 <群号> \n",
            "#获取群列表\n",
            "#获取好友列表\n",
            "#取说说列表 <页数> \n",
            "#发说说 <内容> \n",
            "#删说说 <序号>\n",
            "#清空说说\n",
            "#清空留言\n",
            "#取直链 <图片>\n",
            "#取face <face表情>",
            "#查Q绑 <QQ>"
        ]
        e.reply(msg);
    }

}