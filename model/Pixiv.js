import fetch from "node-fetch";
import lodash from "lodash";
import { segment } from "oicq";
import { Config } from '../components/index.js'
export default class Pixiv {
    constructor(e = {}) {
        this.e = e
        this.proxy = `yenai:proxy`
    }
    /**
     * @description: 获取插画信息
     * @param {String} ids 插画ID
     * @return {Object}
     */
    async Worker(ids) {
        let api = `https://api.moedog.org/pixiv/v2/?id=${ids}`
        let res = await this.getfetch(api)

        if (!res) {
            this.e.reply("尝试使用备用接口")
            api = `https://api.imki.moe/api/pixiv/illust?id=${ids}`
            res = await this.getfetch(api)
            if (!res) return false;
        }
        if (res.error) {
            this.e.reply(res.error.user_message || "无法获取数据")
            return false;
        }
        let { id, title, meta_single_page, meta_pages, user, tags, total_bookmarks, total_view } = res.illust
        tags = lodash.flattenDeep(tags?.map(item => Object.values(item))) || ""

        let url = []
        let proxy = await redis.get(this.proxy)
        if (!lodash.isEmpty(meta_single_page)) {
            url.push(meta_single_page.original_image_url.replace("i.pximg.net", proxy))
        } else {
            url = meta_pages.map(item => item.image_urls.original.replace("i.pximg.net", proxy));
        }
        let msg = [
            `标题：${title}\n`,
            `画师：${user.name}\n`,
            `PID：${id}\n`,
            `UID：${user.id}\n`,
            `点赞：${total_bookmarks}\n`,
            `访问：${total_view}\n`,
            `Tag：${tags}\n`,
            `直链：https://pixiv.re/${id}.jpg\n`,
            `传送门：https://www.pixiv.net/artworks/${id}`
        ]
        if (/R-18|18+/i.test(msg[6])) {
            if (!this.e.isMaster) {
                this.e.reply(`该作品为R-18类型请自行使用链接查看：\nhttps://pixiv.re/${id}.jpg`)
                if (!Config.Notice.sesepro) return false;
            }
        }
        let img = url.map(item => segment.image(item))
        return { msg, img }
    }
    /**
     * @description: 获取Pixiv榜单
     * @param {String} page 页数
     * @param {String} date 时间
     * @param {String} mode 榜单类型
     * @return {Array} 
     */
    async Rank(page, date, mode = "day") {
        let type = {
            "day": "日榜",
            "week": "周榜",
            "month": "月榜",
            'male': "男性向榜",
            'female': "女性向榜",
            "day_manga": "漫画日榜",
            "week_manga": "漫画周榜",
            "month_manga": "漫画月榜",
            "week_rookie_manga": "漫画新秀周榜",
        }
        let api = `https://api.bbmang.me/ranks?page=${page}&date=${date}&mode=${mode}&pageSize=30`
        let res = await this.getfetch(api)
        if (!res) return false
        if (page > 17) {
            this.e.reply("哪有那么多图片给你辣(•̀へ •́ ╮ )")
            return false
        }
        if (!res.data) {
            this.e.reply("暂无数据，请稍后重试哦(。-ω-)zzz")
            return false
        };
        let list = [
            `${date}的${type[mode]}`,
            `当前为第${page}页，共17页，本页共${res.data.length}张，总共500张`,
        ];
        if (page < 17) {
            list.push(`可使用 "#看看${type[mode]}第${page - 0 + 1}页" 翻页`)
        }
        for (let i of res.data) {
            let { title, id: pid } = i
            let { name: uresname, id: uresid } = i.artistPreView

            if (title == "wx" && uresname == "wx") continue

            let tags = i.tags ? lodash.truncate(i.tags.map((item) => item.name)) : ""
            let proxy = await redis.get(`yenai:proxy`)
            let url = i.imageUrls[0].large.replace("i.pximg.net", proxy)
            list.push([
                `标题：${title}\n`,
                `插画ID：${pid}\n`,
                `画师：${uresname}\n`,
                `画师ID：${uresid}\n`,
                `Tag：${tags}\n`,
                segment.image(url)
            ])
        }
        return list
    }
    /**
     * @description: 根据关键词搜图
     * @param {String} tag 关键词
     * @param {String} page 页数
     * @return {Array}
     */
    async searchTags(tag, page = "1") {
        let api = `https://www.vilipix.com/api/v1/picture/public?limit=30&tags=${tag}&sort=new&offset=${(page - 1) * 30}`
        let res = await this.getfetch(api)
        if (!res) return false
        if (res.data.count == 0) {
            this.e.reply("呜呜呜，人家没有找到相关的插画(ó﹏ò｡)")
            return false;
        }

        let pageall = Math.ceil(res.data.count / 30)

        if (page > pageall) {
            this.e.reply("啊啊啊，淫家给不了你那么多辣d(ŐдŐ๑)")
            return false
        }

        let list = [
            `当前为第${page}页，共${pageall}页，本页共${res.data.rows.length}张，总共${res.data.count}张`
        ];
        if (page < pageall) {
            list.push(`可使用 "#tag搜图${tag}第${page - 0 + 1}页" 翻页`)
        }
        for (let i of res.data.rows) {
            let { picture_id, title, regular_url, tags, like_total } = i
            list.push([
                `标题：${title}\n`,
                `点赞: ${like_total}\n`,
                `插画ID：${picture_id}\n`,
                `Tag：${lodash.truncate(tags)}\n`,
                segment.image(regular_url)
            ])
        }


        return list
    }

    /**
     * @description: 获取热门tag
     * @return {Array}
     */
    async gettrend_tags() {
        let api = "https://api.moedog.org/pixiv/v2/?type=tags"

        let res = await this.getfetch(api)

        if (!res) {
            this.e.reply("尝试使用备用接口")
            api = `https://api.imki.moe/api/pixiv/tags`
            res = await this.getfetch(api)
            if (!res) return false;
        }
        if (!res.trend_tags) {
            this.e.reply("呜呜呜，没有获取到数据(๑ १д१)")
            return false
        }
        let list = []
        let proxy = await redis.get(`yenai:proxy`)
        for (let i of res.trend_tags) {
            let { tag, translated_name } = i
            let url = i.illust.image_urls.large.replace("i.pximg.net", proxy)
            list.push(
                [
                    `Tag：${tag}\n`,
                    `Translated：${translated_name}\n`,
                    `Pid：${i.illust.id}\n`,
                    segment.image(url)
                ]
            )
        }
        return list

    }


    /**
     * @description: 用户uid搜图
     * @param {String} uid 用户uid
     * @param {String} page 页数
     * @return {Array}
     */
    async public(keyword, page = "1") {
        //关键词搜索
        if (!/^\d+$/.test(keyword)) {
            let wordapi = `https://api.moedog.org/pixiv/v2/?type=search_user&word=${keyword}`
            let wordlist = await this.getfetch(wordapi)
            if (!wordlist) return false
            if (lodash.isEmpty(wordlist.user_previews)) {
                this.e.reply("呜呜呜，人家没有找到这个淫d(ŐдŐ๑)")
                return false;
            }
            keyword = wordlist.user_previews[0].user.id
        }
        let proxy = await redis.get(this.proxy)
        // let userapi = `https://www.vilipix.com/api/v1/search/user?type=author&keyword=${keyword}&limit=30&offset=0`
        let userapi = `https://api.moedog.org/pixiv/v2/?type=member&id=${keyword}`
        let user = await this.getfetch(userapi)
        if (!user) return false

        if (user.error) {
            this.e.reply(user.error.user_message)
            return false;
        }

        let { id, name, comment, profile_image_urls } = user.user
        let { total_follow_users, total_illust_bookmarks_public, total_illusts } = user.profile
        let list = [[
            segment.image(profile_image_urls.medium.replace("i.pximg.net", proxy)),
            `\nuid：${id}\n`,
            `画师：${name}\n`,
            `作品：${total_illusts}\n`,
            `关注：${total_follow_users}\n`,
            `收藏：${total_illust_bookmarks_public}\n`,
            `介绍：${lodash.truncate(comment)}`
        ]]
        //作品
        let api = `https://api.moedog.org/pixiv/v2/?type=member_illust&id=${id}&page=${page}`
        let res = await this.getfetch(api)
        if (!res) return false;
        //没有作品直接返回信息
        if (lodash.isEmpty(res.illusts)) {
            list.push("Σ(っ °Д °;)っ这个淫居然没有作品")
            return list
        }
        let illustsall = Math.ceil(total_illusts / 30)

        if (page > illustsall) {
            this.e.reply("这个淫已经没有涩图给你辣(oＡo川)")
            return false
        }
        let illusts = res.illusts.map(item => {
            let url
            let { id, title, tags, total_bookmarks, total_view, meta_single_page, meta_pages } = item;
            tags = lodash.truncate(lodash.flattenDeep(tags?.map(item => Object.values(item))) || "")
            if (!lodash.isEmpty(meta_single_page)) {
                url = meta_single_page.original_image_url.replace("i.pximg.net", proxy)
            } else {
                url = meta_pages[0].image_urls.original.replace("i.pximg.net", proxy);
            }
            return [
                `标题：${title}\n`,
                `PID：${id}\n`,
                `点赞：${total_bookmarks}\n`,
                `访问：${total_view}\n`,
                `Tag：${tags}\n`,
                segment.image(url),
            ]
        })
        list.push(`当前为第${page}页，共${illustsall}页，本页共${illusts.length}张，总共${total_illusts}张`)
        if (page < illustsall) {
            list.push(`可使用 "#uid搜图${keyword}第${page - 0 + 1}页" 翻页`)
        }
        if (!this.e.isMaster) {
            if (!Config.Notice.sesepro) {
                let illustsfilter = illusts.filter(item => !/R-18|18\+/i.test(item[4]))
                if (illustsfilter.length != illusts.length) {
                    list.push("已自动过滤本页R-18内容")
                    illusts = illustsfilter
                }
            }
        }
        list.push(...illusts)

        // let api = `https://www.vilipix.com/api/v1/picture/public?sort=new&type=0&author_user_id=${user_id}&limit=30&offset=${(page - 1) * 30}`
        // let res = await this.getfetch(api)
        // if (!res) return false
        // if (res.data.count == 0) {
        //     this.e.reply("Σ(っ °Д °;)っ这个淫居然没有插画")
        //     return false;
        // }
        // let pageall = Math.ceil(res.data.count / 30)
        // if (page > pageall) {
        //     this.e.reply("这个淫已经没有涩图给你辣(oＡo川)")
        //     return false
        // }
        // list.push(`当前为第${page}页，共${pageall}页，本页共${res.data.rows.length}张，总共${res.data.count}张`)
        // if (page < pageall) {
        //     list.push(`可使用 "#uid搜图${keyword}第${page - 0 + 1}页" 翻页`)
        // }
        // for (let i of res.data.rows) {
        //     let { picture_id, title, regular_url, tags, like_total } = i
        //     list.push([
        //         `标题：${title}\n`,
        //         `点赞: ${like_total}\n`,
        //         `插画ID：${picture_id}\n`,
        //         `Tag：${lodash.truncate(tags)}\n`,
        //         segment.image(regular_url)
        //     ])
        // }
        return list
    }
    /**
     * @description: 随机图片
     * @return {Array} 
     */
    async getrandomimg(num) {
        let api = `https://www.vilipix.com/api/v1/picture/public?limit=${num}&offset=${lodash.random(1500)}&sort=hot&type=0`
        let res = await this.getfetch(api)
        if (!res) return false
        if (!res.data || !res.data.rows) {
            this.e.reply("呜呜呜，没拿到瑟瑟的图片(˃ ⌑ ˂ഃ )")
            return false;
        }
        let list = []
        for (let i of res.data.rows) {
            let { picture_id, title, regular_url, tags, like_total } = i
            list.push([
                `标题：${title}\n`,
                `点赞: ${like_total}\n`,
                `插画ID：${picture_id}\n`,
                `Tag：${lodash.truncate(tags)}\n`,
                segment.image(regular_url)
            ])
        }
        return list
    }

    /**
     * @description: 请求api
     * @param {String} url 链接
     * @return {Object}
     */
    async getfetch(url) {
        return await fetch(url).then(res => res.json()).catch(err => {
            this.e.reply("接口失效辣(๑ŐдŐ)b")
            console.log(err)
            return false;
        })
    }
}