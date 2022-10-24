import plugin from '../../../lib/plugins/plugin.js'
import { segment } from "oicq";
import Pixiv from '../model/Pixiv.js'
import Cfg from '../model/Config.js';
import moment from 'moment';
import { Config } from '../components/index.js'

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
let uidreg = new RegExp('^#?uid搜图(.*)$', "i")

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
                    reg: '^#?查看热门(t|T)(a|A)(g|G)$',
                    fnc: 'trend_tags'
                },
                {
                    reg: uidreg,
                    fnc: 'saucenaoUid'
                },
            ]
        })
    }

    //pid搜图
    async saucenaoPid(e) {
        if (!e.isMaster) {
            if (!Config.Notice.sese) return
        }
        let regRet = pidreg.exec(e.msg)

        let res = await new Pixiv(e).Worker(regRet[1])

        if (!res) return;

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

        Cfg.getCDsendMsg(e, img, false)

        return true;
    }

    //p站排行榜
    async pixivList(e) {
        if (!e.isMaster) {
            if (!Config.Notice.sese) return
        }
        let regRet = listreg.exec(e.msg)

        let mode = `${type[regRet[1]]}`;

        let day = /漫画/.test(e.msg) ? 3 : 2

        let date = moment().subtract(day, "days").format("YYYY-MM-DD")

        let page = regRet[3] || "1"

        let res = await new Pixiv(e).Rank(page, date, mode)

        if (!res) return

        Cfg.getCDsendMsg(e, res, false)

        return true;
    }

    /**关键词搜图 */
    async Tags(e) {
        if (!e.isMaster) {
            if (!Config.Notice.sese) return
        }
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

        let res = await new Pixiv(e).searchTags(tag, page)

        if (!res) return

        Cfg.getCDsendMsg(e, res, false)

        return true;
    }

    /**获取热门tag */
    async trend_tags(e) {
        if (!e.isMaster) {
            if (!Config.Notice.sese) return
        }

        let res = await new Pixiv(e).gettrend_tags()

        if (!res) return

        Cfg.getCDsendMsg(e, res, false)
    }

    /**以uid搜图**/
    async saucenaoUid(e) {
        if (!e.isMaster) {
            if (!Config.Notice.sese) return
        }
        let regRet = uidreg.exec(e.msg)

        let key = regRet[1]

        let pagereg = new RegExp("第(\\d+)页")

        let page = pagereg.exec(e.msg)

        if (page) {
            key = key.replace(page[0], "")
            page = page[1]
        } else {
            page = "1"
        }

        let res = await new Pixiv(e).public(key, page)

        if (!res) return

        Cfg.getCDsendMsg(e, res, false)
    }
}

