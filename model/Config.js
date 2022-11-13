import plugin from '../../../lib/plugins/plugin.js'
import { segment } from 'oicq'
import cfg from '../../../lib/config/config.js'
import common from '../../../lib/common/common.js'
import fs from 'fs'

class Config {

    /**
     * @description: 延时函数
     * @param {*} ms 时间(毫秒)
     */
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }
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

    /** 写入json文件 */
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
     * @param {*} e oicq
     * @param {Array} message 发送的消息
     * @param {Number} time  撤回时间
     * @param {Boolean} isBot 转发信息是否以bot信息发送
     * @param {Boolean} isfk 是否发送默认风控消息
     * @return {Boolean}
     */
    async getforwardMsg(e, message, time = 0, isBot = true, isfk = true) {
        let forwardMsg = []
        for (let i of message) {
            forwardMsg.push(
                {
                    message: i,
                    nickname: isBot ? Bot.nickname : e.sender.card || e.sender.nickname,
                    user_id: isBot ? Bot.uin : e.sender.user_id
                }
            )
        }
        //发送
        if (e.isGroup) {
            forwardMsg = await e.group.makeForwardMsg(forwardMsg)
        } else {
            forwardMsg = await e.friend.makeForwardMsg(forwardMsg)
        }
        //处理转发卡片
        forwardMsg.data = forwardMsg.data.replace(/\n/g, '')
        let replace = forwardMsg.data.match(new RegExp(`<title color="#777777" size="26">(.+?)<\/title>`))
        forwardMsg.data = forwardMsg.data.replace(replace[1], "涩批(//// ^ ////)")

        //发送消息
        let res = await e.reply(forwardMsg, false, { recallMsg: time })
        if (!res) {
            if (isfk) {
                await e.reply("消息发送失败，可能被风控")
            }
            return false
        }
        return true;
    }


    /**
     * @description: 发送消息并根据指定时间撤回群消息
     * @param {*} e oicq
     * @param {*} msg 消息
     * @param {Number} time 撤回时间
     * @param {Boolean} isfk 是否发送默认风控消息
     * @return {*}
     */
    async recallsendMsg(e, msg, time = 0, isfk = true) {
        time = time || await this.recalltime(e)

        //发送消息
        let res = await e.reply(msg, false, { recallMsg: time })
        if (!res) {
            if (isfk) {
                await e.reply("消息发送失败，可能被风控")
            }
            return false
        }
        return true;
    }

    /**
     * @description: 获取配置的cd发送消息
     * @param {*} e oicq
     * @param {Array} msg 发送的消息
     * @param {Boolean} isBot 转发信息是否以bot信息发送
     * @param {Boolean} isfk  是否发送默认风控消息
     * @return {Boolean}
     */
    async getCDsendMsg(e, msg, isBot = true, isfk = true) {
        let time = await this.recalltime(e)

        let res = await this.getforwardMsg(e, msg, time, isBot, isfk)

        if (!res) return false;

        return true;
    }

    /**
     * @description: 获取群的撤回时间
     * @param {*} e oicq
     * @return {Number} 
     */
    async recalltime(e) {
        if (!e.isGroup) return 0;
        let path = "./plugins/yenai-plugin/config/setu/setu.json"
        //获取撤回时间
        let cfgs = {};
        let time = 120;
        if (fs.existsSync(path)) {
            cfgs = await this.getread(path)
        }

        if (cfgs[e.group_id]) {
            time = cfgs[e.group_id].recall
        }
        return time
    }

    /**
     * @description: 取cookie
     * @param {String} data 如：qun.qq.com
     * @return {Object} 
     */
    getck(data) {
        let cookie = Bot.cookies[data]
        let ck = cookie.replace(/=/g, `":"`).replace(/;/g, `","`).replace(/ /g, "").trim()
        ck = ck.substring(0, ck.length - 2)
        ck = `{"`.concat(ck).concat("}")
        return JSON.parse(ck)
    }

    // 秒转换
    getsecondformat(value) {
        let time = this.getsecond(value)

        let { second, minute, hour, day } = time
        // 处理返回消息
        let result = ''
        if (second != 0) {
            result = parseInt(second) + '秒'
        }
        if (minute > 0) {
            result = parseInt(minute) + '分' + result
        }
        if (hour > 0) {
            result = parseInt(hour) + '小时' + result
        }
        if (day > 0) {
            result = parseInt(day) + '天' + result
        }
        return result
    }

    /** 将数组进行分页，返回新的分页数组
      * @param {Object} pageSize 每页大小
      * @param {Object} arr 数组
    */
    returnAllPageFunc(pageSize, arr) {
        let pageNum = 1
        let pageObj = {
            pageNum: 1,
            list: []
        }
        let pageResult = []

        let newArr = JSON.parse(JSON.stringify(arr))
        let totalPage = newArr.length ? Math.ceil(arr.length / pageSize) : 0 // 计算总页数

        for (let i = 1; i <= totalPage; i++) {
            if (totalPage == 1) {
                pageNum += 1
                pageObj.list = newArr.splice(0, arr.length)
            } else if (i <= totalPage) {
                pageNum += 1
                pageObj.list = newArr.splice(0, pageSize)
            } else {
                pageObj.list = newArr.splice(0, arr.length % pageSize)
            }
            pageResult.push(pageObj)
            pageObj = {
                pageNum: pageNum,
                list: []
            }
        }
        return pageResult
    }
}


export default new Config();