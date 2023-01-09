import plugin from '../../../lib/plugins/plugin.js'
import moment from 'moment';
import { Config } from '../components/index.js'
import { Pixiv, common, setu } from '../model/index.js'

//文案
const SWITCH_ERROR = "主人没有开放这个功能哦(＊／ω＼＊)"
//类型
let rankType = new Pixiv().RankReg
let numReg = "[一壹二两三四五六七八九十百千万亿\\d]+"
//正则
let rankingrReg = new RegExp(`^#?看看((\\d{4}-\\d{1,2}-\\d{1,2})的)?(${Object.keys(rankType).join("|")})(r18)?榜\\s?(第(${numReg})页)?$`, "i")
let tagReg = new RegExp('^#?tag(pro)?搜图(.*)$', "i")
let pidReg = new RegExp('^#?pid搜图\\s?(\\d+)$', "i")
let uidReg = new RegExp('^#?uid搜图(.*)$', "i")
let randomImgReg = new RegExp(`^#?来(${numReg})?张(好(康|看)(的|哒)|hkd|涩图)$|#有内鬼$`)
let relatedReg = new RegExp(`^#?看?看?相关作品(\\d+)$`);
export class example extends plugin {
    constructor() {
        super({
            name: '椰奶pixiv',
            event: 'message',
            priority: 500,
            rule: [
                {
                    reg: pidReg,
                    fnc: 'saucenaoPid'
                },
                {
                    reg: rankingrReg,
                    fnc: 'pixivRanking'
                },
                {
                    reg: tagReg,
                    fnc: 'saucenaoTags'
                },
                {
                    reg: '^#?(查看|获取)?热门(t|T)(a|A)(g|G)$',
                    fnc: 'trendTags'
                },
                {
                    reg: uidReg,
                    fnc: 'saucenaoUid'
                },
                {
                    reg: randomImgReg,
                    fnc: 'randomImg'
                },
                {
                    reg: relatedReg,
                    fnc: 'relatedWorks'
                },
                {
                    reg: '^#?(P|p)ximg(pro)?$',
                    fnc: 'pximg'
                },
            ]
        })
    }

    //pid搜图
    async saucenaoPid(e) {
        let { sese, sesepro } = Config.getGroup(e.group_id)
        if (!sese && !sesepro && !e.isMaster) return e.reply(SWITCH_ERROR)

        await e.reply("你先别急，正在给你搜了(。-ω-)zzz")

        let regRet = pidReg.exec(e.msg)

        let res = await new Pixiv(e).Worker(regRet[1])

        if (!res) return;

        let { msg, img } = res

        await e.reply(msg)

        img.length == 1 || /R-18/.test(msg[4]) ? common.recallsendMsg(e, img) : common.getRecallsendMsg(e, img, false)

        return true;
    }

    //p站排行榜
    async pixivRanking(e) {
        let regRet = rankingrReg.exec(e.msg)
        let { sese, sesepro } = Config.getGroup(e.group_id)
        if ((!sese && !sesepro || regRet[4] && !setu.getR18(e)) && !e.isMaster) return e.reply(SWITCH_ERROR)


        await e.reply("你先别急，马上去给你找哦ε(*´･ω･)з")

        let day = moment().hour() >= 12 ? 1 : 2

        let date = moment().subtract(day, "days").format("YYYY-MM-DD")

        if (regRet[2]) date = regRet[2]

        let page = common.translateChinaNum(regRet[6] || "1")

        let res = await new Pixiv(e).Rank(page, date, regRet[3], !!regRet[4], regRet[2])

        if (!res) return

        common.getRecallsendMsg(e, res, false)

        return true;
    }

    /**关键词搜图 */
    async saucenaoTags(e) {
        let regRet = tagReg.exec(e.msg)

        let { sese, sesepro } = Config.getGroup(e.group_id)
        if ((!sese && !sesepro || sesepro && regRet[1]) && !e.isMaster) {
            return e.reply("主人没有开放这个功能哦(＊／ω＼＊)")
        }

        await e.reply("你先别急，正在给你搜了(。-ω-)zzz")

        let tag = regRet[2]

        let pagereg = new RegExp(`第(${numReg})页`)

        let page = pagereg.exec(e.msg)

        if (page) {
            tag = tag.replace(page[0], "")
            page = common.translateChinaNum(page[1])
        } else {
            page = "1"
        }
        let res = null;
        if (regRet[1]) {
            res = await new Pixiv(e).searchTagspro(tag, page)
        } else {
            res = await new Pixiv(e).searchTags(tag, page)
        }
        if (!res) return
        common.getRecallsendMsg(e, res, false)

        return true;
    }
    /**获取热门tag */
    async trendTags(e) {
        let { sese, sesepro } = Config.getGroup(e.group_id)
        if (!sese && !sesepro && !e.isMaster) return e.reply(SWITCH_ERROR)
        await e.reply("你先别急，马上去给你找哦ε(*´･ω･)з")

        let res = await new Pixiv(e).gettrend_tags()

        if (!res) return

        common.getRecallsendMsg(e, res, false)
    }

    /**以uid搜图**/
    async saucenaoUid(e) {
        let { sese, sesepro } = Config.getGroup(e.group_id)
        if (!sese && !sesepro && !e.isMaster) return e.reply(SWITCH_ERROR)
        await e.reply("你先别急，正在给你搜了(。-ω-)zzz")

        let regRet = uidReg.exec(e.msg)

        let key = regRet[1]

        let pagereg = new RegExp(`第(${numReg})页`)

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

        common.getRecallsendMsg(e, res, false)
    }

    //随机原创插画
    async randomImg(e) {
        let { sese, sesepro } = Config.getGroup(e.group_id)
        if (!sese && !sesepro && !e.isMaster) return e.reply(SWITCH_ERROR)
        await e.reply("你先别急，马上去给你找哦ε(*´･ω･)з")

        let regRet = randomImgReg.exec(e.msg)

        let num = regRet[1] || 1
        if (num > 50) {
            e.reply("你要的太多辣，奴家只给你一张辣(•́へ•́ ╬)")
            num = 1
        }
        num = common.translateChinaNum(num)
        let res = await new Pixiv(e).getrandomimg(num);

        if (!res) return

        common.getRecallsendMsg(e, res, false)
    }

    //相关作品
    async relatedWorks(e) {
        let { sese, sesepro } = Config.getGroup(e.group_id)
        if (!sese && !sesepro && !e.isMaster) return e.reply(SWITCH_ERROR)
        await e.reply("你先别急，马上去给你找哦ε(*´･ω･)з")
        let regRet = relatedReg.exec(e.msg)
        let msg = await new Pixiv(e).getrelated_works(regRet[1])
        if (!msg) return
        common.getRecallsendMsg(e, msg, false)
    }

    //p站单图
    async pximg(e) {
        let ispro = /pro/.test(e.msg)

        let { sese, sesepro } = Config.getGroup(e.group_id)
        if ((!sese && !sesepro || !sesepro && ispro) && !e.isMaster) return e.reply(SWITCH_ERROR)

        let msg = await new Pixiv(e).getPximg(ispro)
        ispro ? common.getRecallsendMsg(e, [msg], false) : common.recallsendMsg(e, msg)
    }
}
