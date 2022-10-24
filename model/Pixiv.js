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
        let res = await fetch(api).then(res => res.json()).catch(err => console.log(err))

        if (!res) {
            this.e.reply("接口失效辣！！！")
            return false
        };
        if (res.error) {
            this.e.reply("口字很拉跨，请稍后重试>_<")
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
        let res = await fetch(api).then(res => res.json()).catch(err => console.log(err))
        if (!res) {
            this.e.reply("接口失效辣！！！")
            return false
        };
        if (!res.data) {
            this.e.reply("可能没有榜单哦~")
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
        let res = await fetch(api).then(res => res.json()).catch(err => console.log(err))
        if (!res) {
            this.e.reply("接口失效辣！！！")
            return false
        };
        if (res.data.count == 0) {
            this.e.reply("呜呜呜，人家没有找到相关的插画>_<")
            return false;
        }

        let pageall = Math.ceil(res.data.count / 30)

        if (page > pageall) {
            this.e.reply(["你他喵的觉得这河里吗！！！", segment.face(215)])
            return false
        }

        let list = [
            `共找到${res.data.count}张插画`,
            `当前为第${page}页，共${pageall}页`
        ];
        for (let i of res.data.rows) {
            let { picture_id, title, regular_url, tags } = i
            list.push([
                `标题：${title}\n`,
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

        let res = await fetch(api).then(res => res.json()).catch(err => console.log(err))

        if (!res) {
            this.e.reply("口子太拉，多半是寄了>_<")
            return false
        }
        if (!res.trend_tags) {
            this.e.reply("呜呜呜，没有获取到数据>_<")
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
}