import plugin from '../../../lib/plugins/plugin.js'
import { segment } from 'oicq'
import cfg from '../../../lib/config/config.js'
import xcfg from '../model/Config.js'


/** 消息 */
let config = {}
export class anotice extends plugin {
    constructor() {
        super({
            name: '消息',
            dsc: '闪照等消息',
            event: 'message',
        })
    }
    async init() {
        config = {
            deltime: Number(await redis.get(`yenai:notice:deltime`)),
            groupRecall: await redis.get(`yenai:notice:groupRecall`),
            PrivateRecall: await redis.get(`yenai:notice:PrivateRecall`),
        }
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
        await xcfg.getSend(msg)
        if (forwardMsg) {
            await xcfg.getSend(forwardMsg)
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
