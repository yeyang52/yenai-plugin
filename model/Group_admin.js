import fetch from "node-fetch";
import Cfg from './Config.js';

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
}

export default new Group_admin();