import fetch from "node-fetch";
import Cfg from './Config.js';
import lodash from 'lodash';
import moment from 'moment'
import { segment } from 'oicq'

class Group_admin {
    constructor() {
        this.ck = Cfg.getck("qun.qq.com");
    }
    /**
     * @description: 获取群公告
     * @param {String} group 群号
     * @param {String} item 序号
     * @return {Object}
     */
    async getAnnouncelist(e, item = "") {
        let ck = this.ck
        let url = `http://xiaobai.klizi.cn/API/qqgn/qun_gg.php?data=&skey=${ck.skey}&pskey=${ck.p_skey}&uin=${Bot.uin}&group=${e.group_id}&n=${item}`

        let result = await fetch(url).then(res => res.text()).catch(err => console.log(err))

        if (!result) return false

        if (item) {
            return JSON.parse(result)
        } else {
            return result
        }

    }
    /**
     * @description: 幸运字符抽取和列表
     * @param {*} e oicq
     * @param {boolean} n true为抽取false为列表
     * @return {String} 
     */
    async getqun_lucky(e, n = false) {
        let ck = this.ck
        let key = `data=&skey=${ck.skey}&pskey=${ck.p_skey}&uin=${Bot.uin}&group=${e.group_id}`
        //列表
        let api = `http://xiaobai.klizi.cn/API/qqgn/qun_luckylist.php?${key}`
        if (n) {
            //抽取
            api = `http://xiaobai.klizi.cn/API/qqgn/qun_lucky.php?${key}`
        }
        let res = await fetch(api).then(res => res.text()).catch(err => console.log(err))
        if (!res) return "接口失效辣！！！"
        return res
    }
    /**
     * @description: 替换群字符
     * @param {*} e oicq
     * @param {String} id 字符id
     * @return {String}
     */
    async getqun_luckyuse(e, id) {
        let ck = this.ck
        let api = `http://xiaobai.klizi.cn/API/qqgn/qun_luckyuse.php?data=&uin=${Bot.uin}&skey=${ck.skey}&pskey=${ck.p_skey}&group=${e.group_id}&id=${id}`
        let res = await fetch(api).then(res => res.text()).catch(err => console.log(err))
        if (!res) return "接口失效辣！！！"
        return res
    }
    /**
     * @description: 开启或关闭群幸运字符
     * @param {*} e oicq
     * @param {String} type 1开启字符,2关闭字符
     * @return {String}
     */
    async setluckyuse(e, type) {
        let ck = this.ck
        let api = `http://xiaobai.klizi.cn/API/qqgn/qun_luckyset.php?uin=${Bot.uin}&skey=${ck.skey}&pskey=${ck.p_skey}&group=${e.group_id}&type=${type}`
        let res = await fetch(api).then(res => res.json()).catch(err => console.log(err))
        if (!res) return "接口失效辣！！！"
        let str = type == 1 ? "开启" : "关闭"
        if (res.retcode == 11111) {
            return `重复${str}`
        } else if (res.retcode == 0) {
            return `已${str}幸运字符`
        } else {
            return res.retmsg;
        }
    }

    /**
     * @description: 今日打卡
     * @param {*} e oicq
     * @return {String}
     */
    async getSigned(e) {
        let ck = this.ck
        let key = `data=&skey=${ck.skey}&pskey=${ck.p_skey}&uin=${Bot.uin}&group=${e.group_id}`
        let api = "http://xiaobai.klizi.cn/API/qqgn/GetDaySignedList.php?" + key
        let res = await fetch(api).then(res => res.text()).catch(err => console.log(err))
        if (!res) return "接口失效辣！！！"
        return res
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
        let msg = list.map(item => {
            return [segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${item.user_id}`),
            `\nQQ：${item.user_id}\n`,
            `昵称：${item.card || item.nickname}\n`,
            `最后发言时间：${moment(item.last_sent_time * 1000).format("YYYY-MM-DD HH:mm:ss")}`
            ]
        })
        let Page = Cfg.returnAllPageFunc(30, msg)
        if (num > Page.length) {
            e.reply("哪有那么多人辣o(´^｀)o")
            return false
        }
        let msgs = Page[num - 1]
        let res = msgs.list
        res.unshift(`当前为第${msgs.pageNum}页，共${Page.length}页，本页共${res.length}人，共${msg.length}人`)
        res.unshift(`以下为${times}${unit}没发言过的坏淫`)
        return res
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
        for (let i of list) {
            await e.group.kickMember(i).then(() => e.reply(`已将${i}移出群聊辣( ･_･)ﾉ⌒●~*`))
            await Cfg.sleep(200)
        }
        return e.reply(`已经将${times}${unit}没发言的淫全部移出群聊辣`)
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
        }
        let time = nowtime - times * timeunit
        let list = Array.from((await e.group.getMemberMap()).values());

        list = list.filter(item => item.last_sent_time < time)

        if (lodash.isEmpty(list)) {
            e.reply(`暂时没有${times}${unit}没发言的淫哦╮( •́ω•̀ )╭`)
            return false
        }
        return list
    }

}

export default new Group_admin();