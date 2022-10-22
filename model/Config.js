import plugin from '../../../lib/plugins/plugin.js'
import { segment } from 'oicq'
import cfg from '../../../lib/config/config.js'
import common from '../../../lib/common/common.js'
import fs from 'fs'

class Config {

    /** 读取文件 */
    async getread(path) {
        return await fs.promises
            .readFile(path, 'utf8')
            .then((data) => {
                return JSON.parse(data)
            })
            .catch((err) => {
                logger.error('读取失败')
                console.error(err)
                return false
            })
    }

    /** 写入文件 */
    async getwrite(path, cot = {}) {
        return await fs.promises
            .writeFile(path, JSON.stringify(cot, '', '\t'))
            .then(() => {
                return true
            })
            .catch((err) => {
                logger.error('写入失败')
                console.error(err)
                return false
            })
    }

    /** 发消息 */
    async getSend(msg) {
        if (await redis.del(`yenai:notice:notificationsAll`,)) {
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

    /**
     * @description: 秒转换
     * @param {Number} time  秒数
     * @param {boolean} repair  是否需要补零
     * @return {object} 包含天，时，分，秒
     */
    getsecond(time, repair) {
        let second = parseInt(time)
        let minute = 0
        let hour = 0
        let day = 0
        if (second > 60) {
            minute = parseInt(second / 60)
            second = parseInt(second % 60)
        }
        if (minute > 60) {
            hour = parseInt(minute / 60)
            minute = parseInt(minute % 60)
        }
        if (hour > 23) {
            day = parseInt(hour / 24)
            hour = parseInt(hour % 24)
        }
        if (repair) {
            hour = hour < 10 ? "0" + hour : hour
            minute = minute < 10 ? "0" + minute : minute
            second = second < 10 ? "0" + second : second
        }
        return {
            day,
            hour,
            minute,
            second
        }
    }

    /**
     * @description: //发送转发消息
     * @param {Array} message 发送的消息
     * @param {*} e oicq
     * @param {Number} time 撤回时间
     * @return {Boolean} 
     */
    async getforwardMsg(message, e, time = 0) {
        let forwardMsg = []
        for (let i of message) {
            forwardMsg.push(
                {
                    message: i,
                    nickname: Bot.nickname,
                    user_id: Bot.uin
                }
            )
        }
        //发送
        if (e.isGroup) {
            forwardMsg = await e.group.makeForwardMsg(forwardMsg)
        } else {
            forwardMsg = await e.friend.makeForwardMsg(forwardMsg)
        }

        //发送消息
        let res = await e.reply(forwardMsg)
        if (!res) {
            await e.reply("消息发送失败，可能被风控")
            return false
        }
        if (time > 0 && res && res.message_id && e.isGroup) {
            setTimeout(() => {
                e.group.recallMsg(res.message_id);
                logger.mark("[椰奶]执行撤回")
            }, time * 1000);
        }
        return true;
    }


    /**
     * @description: 获取配置的cd发送消息
     * @param {*} e oicq
     * @param {Array} msg 发送的消息
     * @return {Boolean}
     */
    async getCDsendMsg(e, msg) {
        let path = "./plugins/yenai-plugin/config/setu/setu.json"
        //获取CD
        let cfgs = {}
        let time = 120
        if (fs.existsSync(path)) {
            cfgs = await this.getread(path)
        }

        if (cfgs[e.group_id]) {
            time = cfgs[e.group_id].recall
        }
        let res = await this.getforwardMsg(msg, e, time)
        if (!res) return false;

        return true;
    }
}


export default new Config();