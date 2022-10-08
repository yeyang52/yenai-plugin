import plugin from '../../../lib/plugins/plugin.js'
import { segment } from 'oicq'
import cfg from '../../../lib/config/config.js'
import xcfg from '../model/Config.js'

const ROLE_MAP = {
    admin: '群管理',
    owner: '群主',
    member: '群员'
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
        logger.info("[椰奶]邀请机器人进群")
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
        await xcfg.getSend(msg)
    }
}