import plugin from '../../../lib/plugins/plugin.js'
import { segment } from "oicq";
import Pixiv from '../model/Pixiv.js'
import Config from '../model/Config.js';
import moment from 'moment';
import fetch from "node-fetch";

let type = {
    "日": "day",
    "周": "week",
    "月": "month",
    "男性向": 'male',
    "女性向": 'female',
    "漫画日": "day_manga",
    "漫画周": "week_manga",
    "漫画月": "month_manga",
    "漫画新秀周": "week_rookie_manga",
}

let listreg = new RegExp(`^#?看看(${Object.keys(type).join("|")})榜\\s?(第(\\d+)页)?$`)
let tagreg = new RegExp('^#?tag搜图(.*)$', "i")
let pidreg = new RegExp('^#?pid搜图(\\d+)$', "i")

export class example extends plugin {
    constructor() {
        super({
            name: 'pixiv',
            event: 'message',
            priority: 500,
            rule: [
                {
                    reg: pidreg,
                    fnc: 'saucenaoPid'
                },
                {
                    reg: listreg,
                    fnc: 'pixivList'
                },
                {
                    reg: tagreg,
                    fnc: 'Tags'
                },
                {
                    reg: '^#?获取热门(t|T)(a|A)(g|G)$',
                    fnc: 'trend_tags'
                }
            ]
        })
    }

    //pid搜图
    async saucenaoPid(e) {
        let regRet = pidreg.exec(e.msg)

        let res = await Pixiv.Worker(regRet[1])

        if (!res) return e.reply("口字很拉跨，多半是寄寄寄")

        let { title, pid, uresname, uresid, tags, url } = res
        let msg = [
            `标题：${title}\n`,
            `插画ID：${pid}\n`,
            `画师：${uresname}\n`,
            `画师ID：${uresid}\n`,
            `Tag：${tags}\n`,
            `直链：https://pixiv.re/${pid}.jpg`,
        ]
        await e.reply(msg)

        let img = [];
        for (let i of url) {
            img.push(segment.image(i))
        }

        Config.getCDsendMsg(e, img)

        return true;
    }

    //p站排行榜
    async pixivList(e) {

        let regRet = listreg.exec(e.msg)

        let mode = `${type[regRet[1]]}`;

        let day = /漫画/.test(e.msg) ? 3 : 2

        let date = moment().subtract(day, "days").format("YYYY-MM-DD")

        let page = regRet[3] ? regRet[3] : "1"

        let res = await Pixiv.Rank(page, date, mode)

        if (!res) return e.reply("可能接口失效或无榜单信息")

        Config.getCDsendMsg(e, res)

        return true;
    }
    
    /**关键词搜图 */
    async Tags(e) {
        let regRet = tagreg.exec(e.msg)

        let tag = regRet[1]

        let pagereg = new RegExp("第(\\d+)页")

        let page = pagereg.exec(e.msg)

        if (page) {
            tag = tag.replace(page[0], "")
            page = page[1]
        } else {
            page = "1"
        }

        let res = await Pixiv.searchTags(tag, page)

        if (!res) return e.reply("接口失效")

        Config.getCDsendMsg(e, res)

        return true;
    }

    /**获取热门tag */ 
    async trend_tags(e) {
        let api = "https://api.imki.moe/api/pixiv/tags"
        let res = await fetch(api).then(res => res.json()).catch(err => console.log(err))
        if (!res) return false
        let tag = res.trend_tags.map(res => res.tag).join("，")
        let translated_tag = res.trend_tags.map(res => res.translated_name).join("，")
        let msg = [
            "现热门的Tag如下：\n",
            `tag：${tag}\n`,
            "--------------------\n",
            `翻译: ${translated_tag}`
        ]
        e.reply(msg)
    }

}

