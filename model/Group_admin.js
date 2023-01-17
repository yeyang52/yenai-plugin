import { common } from './index.js';
import lodash from 'lodash';
import moment from 'moment'
import { segment } from 'oicq'
import loader from '../../../lib/plugins/loader.js'
class Group_admin {
    constructor() {
        this.MuteTaskKey = 'yenai:MuteTasks'
    }
    /**
     * @description: 获取禁言人数组
     * @param {*} e oicq
     * @return {Array}
     */
    async getMuteList(e) {
        let list = Array.from((await e.group.getMemberMap()).keys());
        let mutelist = list.filter(item => {
            let Member = e.group.pickMember(item)
            return Member.mute_left != 0
        })
        if (lodash.isEmpty(mutelist)) return false
        return mutelist
    }

    /**
     * @description: 返回多少时间没发言的人信息
     * @param {*} e oicq
     * @param {Number} times 时间数
     * @param {String} unit 单位 (天)
     * @param {Number} num 页数
     * @return {Array}
     */
    async getnoactive(e, times, unit, num = 1) {
        let list = await this.noactivelist(e, times, unit)
        if (!list) return false
        list.sort((a, b) => {
            return a.last_sent_time - b.last_sent_time
        })
        let msg = list.map(item => {
            return [segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${item.user_id}`),
            `\nQQ：${item.user_id}\n`,
            `昵称：${item.card || item.nickname}\n`,
            `最后发言时间：${moment(item.last_sent_time * 1000).format("YYYY-MM-DD HH:mm:ss")}`
            ]
        })
        let Page = lodash.chunk(msg, 30)
        if (num > Page.length) {
            e.reply("哪有那么多人辣o(´^｀)o")
            return false
        }
        let msgs = Page[num - 1]
        msgs.unshift(`当前为第${num}页，共${Page.length}页，本页共${msgs.length}人，总共${msg.length}人`)
        msgs.unshift(`以下为${times}${unit}没发言过的坏淫`)
        if (num < Page.length) {
            msgs.splice(2, 0, `可用 "#查看${times}${unit}没发言过的人第${num + 1}页" 翻页`)
        }
        return msgs
    }

    /**
     * @description: 清理多久没发言的人
     * @param {*} e oicq
     * @param {*} times 时间数
     * @param {*} unit 单位 (天)
     * @return {*}
     */
    async getclearnoactive(e, times, unit) {
        let list = await this.noactivelist(e, times, unit)
        if (!list) return false
        list = list.map(item => item.user_id)
        let msg = await this.getkickMember(e, list)
        common.getforwardMsg(e, msg)
        return true
    }

    /**
     * @description: 返回多少时间没发言的人信息
     * @param {*} e oicq
     * @param {Number} times 时间数
     * @param {String} unit 单位 (天)
     * @return {Array}
     */
    async noactivelist(e, times, unit) {
        let nowtime = parseInt(new Date().getTime() / 1000)
        let timeunit = 86400
        if (unit == "周") {
            timeunit = 604800
        } else if (unit == "月") {
            timeunit = 2592000
        } else if (unit == "年") {
            timeunit = 31536000
        }
        let time = nowtime - times * timeunit
        let list = Array.from((await e.group.getMemberMap()).values());

        list = list.filter(item => item.last_sent_time < time && item.role == "member" && item.user_id != Bot.uin)

        if (lodash.isEmpty(list)) {
            e.reply(`暂时没有${times}${unit}没发言的淫哦╮( •́ω•̀ )╭`)
            return false
        }
        return list
    }

    /**
     * @description: 返回从未发言的人
     * @param {*} e oicq
     * @return {Array}
     */
    async getneverspeak(e) {
        let list = Array.from((await e.group.getMemberMap()).values());
        list = list.filter(item => item.join_time == item.last_sent_time && item.role == "member" && item.user_id != Bot.uin)
        if (lodash.isEmpty(list)) {
            e.reply(`咋群全是好淫哦~全都发过言辣٩(๑•̀ω•́๑)۶`)
            return false
        }
        return list
    }
    /**
     * @description: 返回从未发言的人信息
     * @param {*} e oicq
     * @return {Array}
     */
    async getneverspeakinfo(e, num) {
        let list = await this.getneverspeak(e)
        if (!list) return false
        list.sort((a, b) => {
            return a.join_time - b.join_time
        })
        let msg = list.map(item => {
            return [segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${item.user_id}`),
            `\nQQ：${item.user_id}\n`,
            `昵称：${item.card || item.nickname}\n`,
            `进群时间：${moment(item.join_time * 1000).format("YYYY-MM-DD HH:mm:ss")}`
            ]
        })
        let Page = lodash.chunk(msg, 30)
        if (num > Page.length) {
            e.reply("哪有那么多人辣o(´^｀)o")
            return false
        }
        let msgs = Page[num - 1]
        msgs.unshift(`当前为第${num}页，共${Page.length}页，本页共${msgs.length}人，总共${msg.length}人`)
        msgs.unshift(`以下为进群后从未发言过的坏淫`)
        if (num < Page.length) {
            msgs.splice(2, 0, `可用 "#查看从未发言过的人第${num + 1}页" 翻页`)
        }
        return msgs
    }
    /**
     * @description: 批量踢出群成员
     * @param {*} e oicq
     * @param {*} arr 要提出成员的数组
     * @return {Object} 成功和失败的列表
     */
    async getkickMember(e, arr) {
        let success = [], fail = [];
        await e.reply("我要开始清理了哦，这可能需要一点时间٩(๑•ㅂ•)۶")
        for (let i of arr) {
            if (await e.group.kickMember(i)) {
                success.push(i)
            } else {
                fail.push(i)
            }
            await common.sleep(5000)
        }
        let msg = [
            [`本次共清理${arr.length}人\n`,
            `成功：${success.length}人\n`,
            `失败：${fail.length}人`]
        ]
        if (!lodash.isEmpty(success)) {
            success = success.map((item, index) => `\n${index + 1}、${item}`)
            success.unshift("以下为清理成功的人员")
            msg.push(success)
        }
        if (!lodash.isEmpty(fail)) {
            fail = fail.map((item, index) => `\n${index + 1}、${item}`)
            fail.unshift("以下为清理失败的人员")
            msg.push(fail)
        }
        return msg
    }
    /**
     * @description: 返回不活跃排行榜
     * @param {*} e oicq
     * @param {Number} num 榜单数量
     * @return {Array}
     */
    async InactiveRanking(e, num) {
        let list = Array.from((await e.group.getMemberMap()).values());
        list.sort((a, b) => {
            return a.last_sent_time - b.last_sent_time
        })
        let msg = list.slice(0, num)
        msg = msg.map((item, index) => {
            return [`第${index + 1}名：\n`,
            segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${item.user_id}`),
            `\nQQ：${item.user_id}\n`,
            `昵称：${item.card || item.nickname}\n`,
            `最后发言时间：${moment(item.last_sent_time * 1000).format("YYYY-MM-DD HH:mm:ss")}`
            ]
        })
        msg.unshift(`不活跃排行榜top1 - top${num}`)
        return msg
    }
    /**
     * @description: 获取最近加群情况
     * @param {*} e oicq
     * @param {Number} num 获取的数量
     * @return {Array} 
     */
    async getRecentlyJoined(e, num) {
        let list = Array.from((await e.group.getMemberMap()).values());
        list.sort((a, b) => {
            return b.join_time - a.join_time
        })
        let msg = list.slice(0, num)
        msg = msg.map((item) => {
            return [
                segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${item.user_id}`),
                `\nQQ：${item.user_id}\n`,
                `昵称：${item.card || item.nickname}\n`,
                `入群时间：${moment(item.join_time * 1000).format("YYYY-MM-DD HH:mm:ss")}\n`,
                `最后发言时间：${moment(item.last_sent_time * 1000).format("YYYY-MM-DD HH:mm:ss")}`
            ]
        })
        msg.unshift(`最近的${num}条入群记录`)
        return msg
    }
    /**
     * @description: 设置群定时禁言
     * @param {Number} group 群号
     * @param {String} cron cron 表达式
     * @param {true|false} type true为禁言false为解禁
     */
    async setMuteTask(group, cron, type) {
        let name = `椰奶群定时${type ? '禁言' : "解禁"}${group}`
        if (loader.task.find(item => item.name == name)) return false;
        let redisTask = JSON.parse(await redis.get(this.MuteTaskKey)) || []
        let task = {
            cron: cron,
            name,
            fnc: () => {
                Bot.pickGroup(Number(group)).muteAll(type)
            },
        }
        loader.task.push(lodash.cloneDeep(task))
        loader.creatTask()
        redisTask.push({ cron, group, type })
        redis.set(this.MuteTaskKey, JSON.stringify(redisTask))
        return true;
    }

    /**
     * @description: 返回redis储存定时任务
     * @return {Array} 定时任务数组
     */
    async getRedisMuteTask() {
        return JSON.parse(await redis.get(this.MuteTaskKey))?.map(item => {
            return {
                cron: item.cron,
                name: `椰奶群定时${item.type ? '禁言' : "解禁"}${item.group}`,
                fnc: () => {
                    Bot.pickGroup(Number(item.group)).muteAll(item.type)
                }
            }
        })
    }

    /**
     * @description: 删除定时任务
     * @param {Number} group
     * @param {true|false} type true为禁言false为解禁
     * @return {*}
     */
    async delMuteTask(group, type) {
        let redisTask = JSON.parse(await redis.get(this.MuteTaskKey)) || []
        loader.task = loader.task.filter(item => item.name !== `椰奶群定时${type ? '禁言' : "解禁"}${group}`)
        redisTask = redisTask.filter(item => item.group !== group && item.type !== type)
        redis.set(this.MuteTaskKey, JSON.stringify(redisTask))
        return true
    }

    /**
     * @description: 获取定时任务
     */
    getMuteTask() {
        let RegEx = /椰奶群定时(禁言|解禁)(\d+)/
        let taskList = lodash.cloneDeep(loader.task)
        let MuteList = taskList.filter(item => /椰奶群定时禁言\d+/.test(item.name))
        let noMuteList = taskList.filter(item => /椰奶群定时解禁\d+/.test(item.name))
        noMuteList.forEach(noitem => {
            let index = MuteList.findIndex(item => noitem.name.match(RegEx)[2] == item.name.match(RegEx)[2])
            if (index !== -1) {
                MuteList[index].nocron = noitem.cron
            } else {
                noitem.nocron = noitem.cron
                delete noitem.cron
                MuteList.push(noitem)
            }
        })
        return MuteList.map(item => {
            let analysis = item.name.match(RegEx)
            return [
                segment.image(`https://p.qlogo.cn/gh/${analysis[2]}/${analysis[2]}/100`),
                `\n群号：${analysis[2]}`,
                item.cron ? `\n禁言时间：'${item.cron}'` : "",
                item.nocron ? `\n解禁时间：'${item.nocron}'` : "",
            ]
        })
    }
}

export default new Group_admin();