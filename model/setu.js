import { segment } from "oicq";
import fetch from 'node-fetch'
import fs from 'fs'
import { common } from './index.js';
import lodash from "lodash";

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
    async setuapi(e, r18, num = 1, tag = "") {
        let api = "https://api.lolicon.app/setu/v2";
        if (fs.existsSync(this.apicfg)) {
            let apicfg = common.getJson(this.apicfg)
            if (apicfg.api) api = apicfg.api
        }
        let size = "original"
        let proxy = await redis.get(`yenai:proxy`)
        if (num > 6) {
            size = "regular"
        }
        let url = `${api}?r18=${r18}&num=${num}${tag}&proxy=${proxy}&size=${size}`;
        let result = await fetch(url).then(res => res.json()).catch(err => console.log(err))
        if (!result) {
            logger.warn("[椰奶setu]使用备用接口")
            let apiReserve = `https://sex.nyan.xyz/api/v2/?r18=${r18}&num=${num}${tag}`;
            result = await fetch(apiReserve).then(res => res.json()).catch(err => console.log(err))
            if (!result) {
                e.reply("❎ 接口失效")
                return false;
            }
        }
        if (lodash.isEmpty(result.data)) {
            e.reply("没有找到相关的tag", false, { at: true })
            return false;
        }
        //消息
        let msg = result.data.map(item => {
            let { pid, title, tags, author, r18, urls, url } = item
            return [
                `${this.sendMsgs}\n`,
                `标题：${title}\n`,
                `画师：${author}\n`,
                `pid：${pid}\n`,
                r18 !== undefined ? `r18：${r18}\n` : "",
                `tag：${lodash.truncate(tags.join(","))}\n`,
                segment.image(url || urls?.original || urls?.regular || urls?.small),
            ]
        })
        return msg
    }


    /**
     * @description: 发送消息和写入cd
     * @param {*} e oicq
     * @param {Array} img 消息数组
     * @return {Boolean}
     */
    async sendMsg(e, msg) {
        //默认CD
        let cd = this.def.cd
        //获取当前时间
        let present = parseInt(new Date().getTime() / 1000)

        //发送消息
        let res = await common.getRecallsendMsg(e, msg, false)
        if (e.isGroup) {
            //获取CD
            if (fs.existsSync(this.path)) {
                let groupCD = common.getJson(this.path)
                if (groupCD[e.group_id]) cd = groupCD[e.group_id].cd
            }
            if (!e.isMaster && res) {
                if (cd != 0) {
                    this.temp[e.user_id + e.group_id] = present + cd
                    setTimeout(() => {
                        delete this.temp[e.user_id + e.group_id];
                    }, cd * 1000);
                }
            }

        } else {
            //私聊
            if (fs.existsSync(this.path_s)) {
                let friendCD = common.getJson(this.path_s)
                if (friendCD[e.user_id]) cd = friendCD[e.user_id]
            }
            if (!e.isMaster && res) {
                if (cd != 0) {
                    this.temp[e.user_id] = present + cd
                    setTimeout(() => {
                        delete this.temp[e.user_id];
                    }, cd * 1000);
                }
            }
        }
    }

    //CD
    getcd(e) {
        //获取现在的时间并转换为秒
        let present = parseInt(new Date().getTime() / 1000)

        if (e.isGroup) {

            if (this.temp[e.user_id + e.group_id]) {

                let over = (this.temp[e.user_id + e.group_id] - present)

                if (over > 0) {
                    return this.Secondformat(over)
                } else return false

            } else return false

        } else {
            if (this.temp[e.user_id]) {

                let over = (this.temp[e.user_id] - present)

                if (over > 0) {
                    return this.Secondformat(over)
                } else return false

            } else return false
        }
    }

    /**
     * @description: 获取r18
     * @param {*} e oicq
     * @return {String}  0或1
     */
    getR18(e) {
        let cfgs
        if (e.isGroup) {
            //获取配置
            if (fs.existsSync(this.path)) {
                cfgs = common.getJson(this.path)
                if (cfgs[e.group_id]) {
                    return cfgs[e.group_id].r18
                }
            }
        } else {
            if (fs.existsSync(this.path_s)) {
                cfgs = common.getJson(this.path_s)
                if (cfgs.friendr18 !== undefined) {
                    return cfgs.friendr18
                }
            }
        }
        return this.def.r18
    }
    /**
     * @description: 设置群cd和撤回时间
     * @param {*} e 
     * @param {Number} num
     * @param {Boolean} yes 为true设置撤回时间反之设置CD
     * @return {*}
     */
    setGroupRecallTimeAndCd(e, num, yes = true) {
        let res = {};

        if (fs.existsSync(this.path)) res = common.getJson(this.path)

        if (!res[e.group_id]) res[e.group_id] = lodash.cloneDeep(this.def)

        yes ? res[e.group_id].recall = Number(num) : res[e.group_id].cd = Number(num)

        return common.setJson(this.path, res) ? true : false
    }
    /**
     * @description: 设置CD
     * @param {*} e oicq
     * @param {String} qq 设置的qq
     * @param {String} cd 设置的cd
     */
    setUserCd(e, qq, cd) {
        let res = {};
        if (fs.existsSync(this.path_s)) {
            res = common.getJson(this.path_s)
        }
        res[qq] = Number(cd)
        if (common.setJson(this.path_s, res)) {
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
    setR18(e, yes, group) {
        let res = {};
        if (group) {
            if (fs.existsSync(this.path)) {
                res = common.getJson(this.path)
            }

            if (!res[e.group_id]) res[e.group_id] = lodash.cloneDeep(this.def)


            res[e.group_id].r18 = yes ? 1 : 0

            if (common.setJson(this.path, res)) {
                e.reply(`✅ 已${yes ? "开启" : "关闭"}${e.group_id}的涩涩模式~`)
                return true
            } else {
                e.reply(`❎ 设置失败`)
                return false
            }
        } else {
            if (fs.existsSync(this.path_s)) {
                res = common.getJson(this.path_s)
            }

            res.friendr18 = yes ? 1 : 0

            if (common.setJson(this.path_s, res)) {
                e.reply(`✅ 已${yes ? "开启" : "关闭"}私聊涩涩功能~`)
                return true
            } else {
                e.reply(`❎ 设置失败`)
                return false
            }
        }

    }
    /**
     * @description: 获取现有设置
     * @param {*} e oicq
     * @return {*}
     */
    getSeSeConfig(e) {
        let set = lodash.cloneDeep(this.def)
        if (e.isGroup) {
            //获取群聊单独cd
            if (fs.existsSync(this.path)) {
                let groupCD = common.getJson(this.path)
                if (groupCD[e.group_id]) set.cd = groupCD[e.group_id].cd
            }
            set.recall = common.getRecallTime(e.group_id)
        } else {
            //获取私聊单独cd
            if (fs.existsSync(this.path_s)) {
                let friendCD = common.getJson(this.path_s)
                if (friendCD[e.user_id]) set.cd = friendCD[e.user_id]
            }
            delete set.recall
        }
        set.r18 = this.getR18(e)
        return set
    }
    /**
    * @description: 格式化秒
    * @param {Number} value 秒
    * @return {String} 
    */
    Secondformat(value) {
        let time = common.getsecond(value)

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

    get startMsg() {
        return lodash.sample([
            "正在给你找setu了，你先等等再冲~",
            "你先别急，正在找了~",
            "马上去给你找涩图，你先憋一会~",
            "奴家马上去给你找瑟瑟的图片~"
        ])
    }

    get CDMsg() {
        return lodash.sample([
            "你这么喜欢色图，还不快点冲！",
            "你的色图不出来了！",
            "注意身体，色图看多了对身体不太好",
            "憋住，不准冲！",
            "憋再冲了！",
            "呃...好像冲了好多次...感觉不太好呢...",
            "憋冲了！你已经冲不出来了！",
            "你急啥呢？",
            "你是被下半身控制了大脑吗？"
        ])
    }

    get sendMsgs() {
        return lodash.sample([
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
        ])
    }

}
