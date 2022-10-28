import fetch from "node-fetch";
import lodash from "lodash";
import { segment } from "oicq";

export default class Pixiv {
    constructor(e = {}) {
        this.e = e
    }
    /**
     * @description: 获取插画信息
     * @param {String} ids 插画ID
     * @return {Object}
     */
    async Worker(ids) {
        let api = `https://api.imki.moe/api/pixiv/illust?id=${ids}`
        let res = await this.getfetch(api)

        if (!res) return false
        if (res.error) {
            this.e.reply("口字很拉跨，请稍后重试(。-ω-)zzz")
            this.e.reply(`先用直链解决一下：https://pixiv.re/${ids}.jpg`)
            return false;
        }
        res = res.illust
        let tags = lodash.truncate(lodash.flattenDeep(res?.tags.map(item => Object.values(item)))) || ""
        let caption = res.caption.replace(/<.*>/g, "").trim()
        let { id: pid, title, meta_single_page, meta_pages, user, } = res
        let url = []
        let proxy = await redis.get(`yenai:proxy`)
        if (!lodash.isEmpty(meta_single_page)) {
            url.push(meta_single_page.original_image_url.replace("i.pximg.net", proxy))
        } else {
            url = meta_pages.map(item => item.image_urls.original.replace("i.pximg.net", proxy));
        }
        return {
            pid,
            title,
            url,
            uresid: user.id,
            uresname: user.name,
            tags,
            caption
        }
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
        if (!res.data) {
            this.e.reply("暂无数据，请稍后重试哦(。-ω-)zzz")
            return false
        };
        let list = [
            `${date}的${type[mode]}`,
            `当前为第${page}页`
        ];
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
            `共找到${res.data.count}张插画`,
            `当前为第${page}页，共${pageall}页`
        ];
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
        let api = "https://api.imki.moe/api/pixiv/tags"

        let res = await this.getfetch(api)

        if (!res) return false
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
        let userapi = `https://www.vilipix.com/api/v1/search/user?type=author&keyword=${keyword}&limit=30&offset=0`
        let user = await this.getfetch(userapi)
        if (!user) return false
        if (user.data.count == 0) {
            this.e.reply("呜呜呜，人家没有找到这个淫d(ŐдŐ๑)")
            return false;
        }
        let { user_id: uid, nick_name, avatar, desc } = user.data.rows[0]
        let api = `https://www.vilipix.com/api/v1/picture/public?sort=new&type=0&author_user_id=${uid}&limit=30&offset=${(page - 1) * 30}`
        let res = await this.getfetch(api)
        if (!res) return false
        if (res.data.count == 0) {
            this.e.reply("Σ(っ °Д °;)っ这个淫居然没有插画")
            return false;
        }
        let pageall = Math.ceil(res.data.count / 30)
        if (page > pageall) {
            this.e.reply("这个淫已经没有涩图给你辣(oＡo川)")
            return false
        }
        let list = [
            [
                segment.image(avatar),
                `\nuid：${uid}\n`,
                `画师：${nick_name}\n`,
                `介绍：${lodash.truncate(desc)}`
            ],
            `共找到${res.data.count}张插画`,
            `当前为第${page}页，共${pageall}页`
        ]
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
     * @description: 随机图片
     * @return {Array} 
     */
    async getrandomimg() {
        let api = `https://www.vilipix.com/api/v1/picture/public?limit=18&offset=${lodash.random(1000)}&sort=hot&type=0`
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