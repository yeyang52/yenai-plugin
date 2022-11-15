import plugin from '../../../lib/plugins/plugin.js'
import Pixiv from '../model/Pixiv.js'
import Cfg from '../model/Config.js';
import moment from 'moment';
import { Config } from '../components/index.js'
import common from '../model/common.js'
//类型
let ranktype = new Pixiv().RankReg
let Numreg = "[一壹二两三四五六七八九十百千万亿\\d]+"
//正则
let listreg = new RegExp(`^#?看看((\\d{4}-\\d{1,2}-\\d{1,2})的)?(${Object.keys(ranktype).join("|")})(r18)?榜\\s?(第(${Numreg})页)?$`, "i")
let tagreg = new RegExp('^#?tag搜图(.*)$', "i")
let pidreg = new RegExp('^#?pid搜图\\s?(\\d+)$', "i")
let uidreg = new RegExp('^#?uid搜图(.*)$', "i")
let randomimgreg = new RegExp(`^#?来(${Numreg})?张(好(康|看)(的|哒)|hkd|涩图)$`)

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
                    reg: '^#?(查看|获取)?热门(t|T)(a|A)(g|G)$',
                    fnc: 'trend_tags'
                },
                {
                    reg: uidreg,
                    fnc: 'saucenaoUid'
                },
                {
                    reg: randomimgreg,
                    fnc: 'randomimg'
                }
            ]
        })
    }

    //pid搜图
    async saucenaoPid(e) {
        if (!e.isMaster) {
            if (!Config.Notice.sese) return
        }

        await e.reply("你先别急，正在给你搜了(。-ω-)zzz")

        let regRet = pidreg.exec(e.msg)

        let res = await new Pixiv(e).Worker(regRet[1])

        if (!res) return;

        let { msg, img } = res

        await e.reply(msg)

        img.length == 1 || /R-18/.test(msg[4]) ? Cfg.recallsendMsg(e, img) : Cfg.getCDsendMsg(e, img, false)

        return true;
    }

    //p站排行榜
    async pixivList(e) {
        if (!e.isMaster) {
            if (!Config.Notice.sese) return
        }
        await e.reply("你先别急，马上去给你找哦ε(*´･ω･)з")

        let regRet = listreg.exec(e.msg)

        let day = moment().hour() >= 12 ? 1 : 2

        let date = moment().subtract(day, "days").format("YYYY-MM-DD")

        if (regRet[2]) date = regRet[2]

        let page = common.translateChinaNum(regRet[6] || "1")

        let res = await new Pixiv(e).Rank(page, date, regRet[3], !!regRet[5], !!regRet[2])

        if (!res) return

        Cfg.getCDsendMsg(e, res, false)

        return true;
    }

    /**关键词搜图 */
    async Tags(e) {
        if (!e.isMaster) {
            if (!Config.Notice.sese) return
        }

        await e.reply("你先别急，正在给你搜了(。-ω-)zzz")

        let regRet = tagreg.exec(e.msg)

        let tag = regRet[1]

        let pagereg = new RegExp(`第(${Numreg})页`)

        let page = pagereg.exec(e.msg)

        if (page) {
            tag = tag.replace(page[0], "")
            page = common.translateChinaNum(page[1])
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
        await e.reply("你先别急，马上去给你找哦ε(*´･ω･)з")

        let res = await new Pixiv(e).gettrend_tags()

        if (!res) return

        Cfg.getCDsendMsg(e, res, false)
    }

    /**以uid搜图**/
    async saucenaoUid(e) {
        if (!e.isMaster) {
            if (!Config.Notice.sese) return
        }
        await e.reply("你先别急，正在给你搜了(。-ω-)zzz")

        let regRet = uidreg.exec(e.msg)

        let key = regRet[1]

        let pagereg = new RegExp(`第(${Numreg})页`)

        let page = pagereg.exec(e.msg)

        if (page) {
            key = key.replace(page[0], "")
            page = page[1]
        } else {
            page = "1"
        }
        page = common.translateChinaNum(page)

        let res = await new Pixiv(e).public(key, page)

        if (!res) return

        Cfg.getCDsendMsg(e, res, false)
    }

    //随机原创插画
    async randomimg(e) {
        if (!e.isMaster) {
            if (!Config.Notice.sese) return
        }
        await e.reply("你先别急，马上去给你找哦ε(*´･ω･)з")

        let regRet = randomimgreg.exec(e.msg)

        let num = regRet[1] || 1
        if (num > 50) {
            e.reply("你要的太多辣，奴家只给你一张辣(•́へ•́ ╬)")
            num = 1
        }
        num = common.translateChinaNum(num)
        let res = await new Pixiv(e).getrandomimg(num);

        if (!res) return

        Cfg.getCDsendMsg(e, res, false)
    }
}
