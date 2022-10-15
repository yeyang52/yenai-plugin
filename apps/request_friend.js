import plugin from '../../../lib/plugins/plugin.js'
import { segment } from 'oicq'
import cfg from '../../../lib/config/config.js'
import xcfg from '../model/Config.js'

/** 好友申请 */
export class application extends plugin {
    constructor() {
        super({
            name: '好友申请',
            event: 'request.friend',
            priority: 2000,
        })
    }

    async accept(e) {
        if (!await redis.get(`yenai:notice:friendRequest`)) return
        logger.mark("[椰奶]好友申请")
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
        await xcfg.getSend(msg)
    }
}