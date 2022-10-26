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
        //列表
        let api = `http://xiaobai.klizi.cn/API/qqgn/qun_luckylist.php?data=&skey=${ck.skey}&pskey=${ck.p_skey}&uin=${Bot.uin}&group=${e.group_id}`
        if (n) {
            //抽取
            api = `http://xiaobai.klizi.cn/API/qqgn/qun_lucky.php?data=&skey=${ck.skey}&pskey=${ck.p_skey}&uin=${Bot.uin}&group=${e.group_id}`
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
}

export default new Group_admin();