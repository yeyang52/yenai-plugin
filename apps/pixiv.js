import plugin from '../../../lib/plugins/plugin.js'
import { segment } from "oicq";
import Pixiv from '../model/Pixiv.js'
import Config from '../model/Config.js';
import moment from 'moment';
import fs from 'fs'

let type = {
    "日": "day",
    "周": "week",
    "月": "month",
    "男性向": 'male',
    "女性向": 'female',
}

let listreg = new RegExp(`^#?看看(${Object.keys(type).join("|")})榜\\s?(第(\\d+)页)?$`)

export class example extends plugin {
    constructor() {
        super({
            name: 'pixiv',
            event: 'message',
            priority: 500,
            rule: [
                {
                    reg: '^(p|P)(i|I)(d|D)搜图(\\d+)$',
                    fnc: 'saucenaoPid'
                },
                {
                    reg: listreg,
                    fnc: 'pixivList'
                }
            ]
        })
        this.path = "./plugins/yenai-plugin/config/setu/setu.json"
    }

    //pid搜图
    async saucenaoPid(e) {
        let pids = e.msg.replace(/#|(p|P)(i|I)(d|D)搜图/g, "").trim()
        let res = await Pixiv.Worker(pids)

        if (!res) return e.reply("可能接口失效或无该Pid信息")

        let { title, pid, uresname, uresid, tags, url } = res
        let msg = [
            `标题：${title}\n`,
            `插画ID：${pid}\n`,
            `画师：${uresname}\n`,
            `画师ID：${uresid}\n`,
            `tag：${tags.join(",")}\n`,
            `直链：https://pixiv.re/${pid}.jpg`,
        ]
        await e.reply(msg)

        let img = [];
        for (let i of url) {
            img.push(segment.image(i))
        }

        if (!await this.getsendMsg(e, img)) e.reply("消息发送失败，可能被风控")

        return true;
    }

    //p站排行榜
    async pixivList(e) {

        let regRet = listreg.exec(e.msg)

        let mode = `${type[regRet[1]]}`;

        let date = moment().subtract(2, "days").format("YYYY-MM-DD")

        let page = regRet[3] ? regRet[3] : "1"

        let res = await Pixiv.Rank(page, date, mode)

        if (!res) return e.reply("可能接口失效或无榜单信息")

        if (!await this.getsendMsg(e, res)) e.reply("消息发送失败，可能被风控")

        return true;
    }
    /**
     * @description: 
     * @param {*} e oicq
     * @param {Array} msg 发送的消息
     * @return {Boolean}
     */
    async getsendMsg(e, msg) {
        //获取CD
        let cfgs = {}
        let time = 120
        if (fs.existsSync(this.path)) {
            cfgs = await Config.getread(this.path)
        }

        if (cfgs[e.group_id]) {
            time = cfgs[e.group_id].recall
        }
        let res = await Config.getforwardMsg(msg, e, time)
        if (!res) return false;
        return true;
    }
}

