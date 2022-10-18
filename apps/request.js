import plugin from '../../../lib/plugins/plugin.js'
import { segment } from 'oicq'
import cfg from '../../../lib/config/config.js'
import xcfg from '../model/Config.js'
import { Config } from '../components/index.js'

const ROLE_MAP = {
    admin: '群管理',
    owner: '群主',
    member: '群员'
}

/** 群邀请 */
export class invitation extends plugin {
    constructor() {
        super({
            name: '群邀请和好友申请',
            event: 'request',
            priority: 2000,
        })
    }
}
//群邀请
Bot.on('request.group.invite', async (e) => {
    let msg = ''
    if (!Config.Notice.groupInviteRequest) return

    if (cfg.masterQQ.includes(e.user_id)) return
    logger.mark("[椰奶]邀请机器人进群")
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
})

//好友申请
Bot.on('request.friend', async (e) => {
    if (!Config.Notice.friendRequest) return
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
})