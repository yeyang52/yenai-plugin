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
    /**秒转换*/
    getsecond(value) {
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

    /**以Bot发送转发消息 */
    async getforwardMsg(message, e) {
        //制作转发消息
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
        e.reply(forwardMsg)

    }
}


export default new Config();