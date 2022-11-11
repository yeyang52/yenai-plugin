import { segment } from "oicq";
import fetch from 'node-fetch'
import fs from 'fs'
import Cfg from './Config.js';
import lodash from "lodash";

const sendMsgs = [
    "给大佬递图",
    "这是你的🐍图",
    "你是大色批",
    "看！要色图的色批出现了！",
    "？",
    "喏，图",
    "给给给个🐍图",
    "色图有我好冲吗？",
    "呐呐呐，欧尼酱别看色图了呐",
    "有什么好色图有给发出来让大伙看看！",
    "没有，有也不给（骗你的～）",
    "天天色图色图的，今天就把你变成色图！",
    "咱没有色图（骗你的～）",
    "哈？你的脑子一天都在想些什么呢，咱才没有这种东西啦。",
    "呀！不要啊！等一...下~",
    "呜...不要啦！太色了咱~",
    "不要这样子啦(*/ω＼*)",
    "Hen....Hentai！。",
    "讨....讨厌了（脸红）",
    "你想...想做什么///",
    "啊.....你...你要干什么？！走开.....走开啦大hentai！一巴掌拍飞！(╯‵□′)╯︵┻━┻",
    "变态baka死宅？",
    "已经可以了，现在很多死宅也都没你这么恶心了",
    "噫…你这个死变态想干嘛！居然想叫咱做这种事，死宅真恶心！快离我远点，我怕你污染到周围空气了（嫌弃脸）",
    "这么喜欢色图呢？不如来点岛风色图？",
    "hso！",
    "这么喜欢看色图哦？变态？",
    "eee，死肥宅不要啦！恶心心！",
]

export default new class setu {
    constructor() {
        //配置文件夹
        this.path_folder = "./plugins/yenai-plugin/config/setu"
        //群配置路径
        this.path = "./plugins/yenai-plugin/config/setu/setu.json"
        //私聊配置
        this.path_s = "./plugins/yenai-plugin/config/setu/setu_s.json"
        this.apicfg = "./plugins/yenai-plugin/config/setu/api.json"
        //默认配置
        this.def = {
            r18: 0,
            recall: 30,
            cd: 300,
        }
        //存cd的变量
        this.temp = {};
        //初始化
        this.init()
    }
    async init() {
        if (!fs.existsSync(this.path_folder)) {
            fs.mkdirSync(this.path_folder)
        }
    }

    /**
     * @description: 请求api
     * @param {String} r18 是否r18 0或1
     * @param {Number} num 数量
     * @param {String} tag 关键词
     * @return {Object}
     */
    async setuapi(r18, num = 1, tag = "") {
        let api = "https://api.lolicon.app/setu/v2";
        if (fs.existsSync(this.apicfg)) {
            let apicfg = await Cfg.getread(this.apicfg)
            if (apicfg.api) api = apicfg.api
        }
        let size = "original"
        let proxy = await redis.get(`yenai:proxy`)
        if (num > 6) {
            size = "regular"
        }
        let url = `${api}?r18=${r18}&num=${num}${tag}&proxy=${proxy}&size=${size}`;
        let result = await fetch(url).then(res => res.json()).catch(err => console.log(err))
        if (!result) return false;
        return result.data
    }


    /**
     * @description: 发送消息和写入cd
     * @param {*} e oicq
     * @param {Array} img 消息数组
     * @return {Boolean}
     */
    async sendMsg(e, img) {
        //风控消息
        let isfk = `呃....被风控了，感觉不太妙呢~给你个链接冲吧~\nhttps://pixiv.re/${img[0].pid}.jpg`
        //默认CD
        let cd = this.def.cd
        //获取当前时间
        let present = parseInt(new Date().getTime() / 1000)
        //消息
        let msg = [];
        for (let i of img) {
            let { pid, title, tags, author, r18, urls } = i
            msg.push([
                `${lodash.sample(sendMsgs)}\n`,
                `标题：${title}\n`,
                `画师：${author}\n`,
                `pid：${pid}\n`,
                `r18：${r18}\n`,
                `tag：${lodash.truncate(tags.join(","))}\n`,
                segment.image(urls.original || urls.regular || urls.small),
            ])
        }
        //发送消息
        let res = Cfg.getCDsendMsg(e, msg, false, false)

        if (e.isGroup) {
            let groupCD = {};
            //获取CD
            if (fs.existsSync(this.path)) {
                groupCD = await Cfg.getread(this.path)
                if (groupCD[e.group_id]) cd = groupCD[e.group_id].cd
            }

            if (res) {
                if (!e.isMaster) {
                    if (cd != 0) {
                        this.temp[e.user_id + e.group_id] = present + cd
                        setTimeout(() => {
                            delete this.temp[e.user_id + e.group_id];
                        }, cd * 1000);
                    }
                }
            } else {
                e.reply(isfk)
                logger.error("[椰奶]Bot被风控，发送被风控消息")
            }
        } else {
            //私聊
            if (fs.existsSync(this.path_s)) {
                let friendCD = await Cfg.getread(this.path_s)
                if (friendCD[e.user_id]) cd = friendCD[e.user_id]
            }
            if (res) {
                if (!e.isMaster) {
                    if (cd != 0) {
                        this.temp[e.user_id] = present + cd
                        setTimeout(() => {
                            delete this.temp[e.user_id];
                        }, cd * 1000);
                    }
                }
            } else {
                e.reply(isfk)
                logger.error("[椰奶]Bot被风控，发送被风控消息")
            }
        }
    }

    //CD
    async getcd(e) {
        //获取现在的时间并转换为秒
        let present = parseInt(new Date().getTime() / 1000)

        if (e.isGroup) {

            if (this.temp[e.user_id + e.group_id]) {

                let over = (this.temp[e.user_id + e.group_id] - present)

                if (over > 0) {
                    return Secondformat(over)
                } else return false

            } else return false

        } else {
            if (this.temp[e.user_id]) {

                let over = (this.temp[e.user_id] - present)

                if (over > 0) {
                    return Secondformat(over)
                } else return false

            } else return false
        }
    }

    /**
     * @description: 获取r18
     * @param {*} e oicq
     * @return {String}  0或1
     */
    async getr18(e) {
        let cfgs
        if (e.isGroup) {
            //获取配置
            if (fs.existsSync(this.path)) {
                cfgs = await Cfg.getread(this.path)
            } else return this.def.r18

            if (cfgs[e.group_id]) {
                return cfgs[e.group_id].r18
            } else {
                return this.def.r18
            }
        } else {
            if (fs.existsSync(this.path_s)) {
                cfgs = await Cfg.getread(this.path_s)
            } else return this.def.r18

            if (cfgs.friendr18) {
                return cfgs.friendr18
            } else {
                return this.def.r18
            }

        }
    }
    /**
     * @description: 设置撤回间隔
     * @param {*} e oicq
     * @param {Number} recall 撤回时间
     * @return {Boolean}
     */
    async getsetgroup(e, num, yes = true) {
        let res = {};

        if (fs.existsSync(this.path)) {
            res = await Cfg.getread(this.path)
        }

        if (!res[e.group_id]) res[e.group_id] = this.def

        if (yes) {
            res[e.group_id].recall = Number(num)
        } else {
            res[e.group_id].cd = Number(num)
        }

        if (await Cfg.getwrite(this.path, res)) {
            return true
        } else {
            return false
        }
    }
    /**
     * @description: 设置CD
     * @param {*} e oicq
     * @param {String} qq 设置的qq
     * @param {String} cd 设置的cd
     */
    async setcd(e, qq, cd) {
        let res = {};
        if (fs.existsSync(this.path_s)) {
            res = await Cfg.getread(this.path_s)
        }
        res[qq] = Number(cd)
        if (await Cfg.getwrite(this.path_s, res)) {
            e.reply(`✅ 设置用户${qq}的cd成功，cd时间为${cd}秒`)
            delete this.temp[qq]
            return true
        } else {
            e.reply(`❎ 设置失败`)
            return false
        }
    }
    /**
     * @description: 设置r18
     * @param {*} e oicq
     * @param {Boolean} yes 开启或关闭
     * @param {Boolean} group 设置群聊还是私聊
     */
    async setr18(e, yes, group) {
        let res = {};
        if (group) {
            if (fs.existsSync(this.path)) {
                res = await Cfg.getread(this.path)
            }

            if (!res[e.group_id]) res[e.group_id] = this.def


            res[e.group_id].r18 = yes ? 1 : 0

            if (await Cfg.getwrite(this.path, res)) {
                e.reply(`✅ 已${yes ? "开启" : "关闭"}${e.group_id}的涩涩模式~`)
                return true
            } else {
                e.reply(`❎ 设置失败`)
                return false
            }
        } else {
            if (fs.existsSync(this.path_s)) {
                res = await Cfg.getread(this.path_s)
            }

            res.friendr18 = yes ? 1 : 0

            if (await Cfg.getwrite(this.path_s, res)) {
                e.reply(`✅ 已${yes ? "开启" : "关闭"}私聊涩涩功能~`)
                return true
            } else {
                e.reply(`❎ 设置失败`)
                return false
            }
        }

    }

}
/**
 * @description: 格式化秒
 * @param {Number} value 秒
 * @return {String} 
 */
function Secondformat(value) {
    let time = Cfg.getsecond(value)

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