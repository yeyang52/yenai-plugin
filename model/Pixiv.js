import fetch from "node-fetch";
import lodash from "lodash";
import { segment } from "oicq";

class Pixiv {
    /**
     * @description: 获取插画信息
     * @param {String} ids 插画ID
     * @return {Object}
     */    
    async Worker(ids) {
        let api = `https://api.imki.moe/api/pixiv/illust?id=${ids}`
        let res = await fetch(api).then(res => res.json()).catch(err => console.log(err))

        if (!res) return false;
        if (res.error) return false;
        res = res.illust
        let tags = lodash.flattenDeep(res.tags.map(item => Object.values(item)))
        let caption = res.caption.replace(/<.*>/g, "").trim()
        let { id: pid, title, meta_single_page, meta_pages, user, } = res
        let url = []
        if (!lodash.isEmpty(meta_single_page)) {
            url.push(meta_single_page.original_image_url.replace("i.pximg.net", "proxy.pixivel.moe"))
        } else {
            url = meta_pages.map(item => item.image_urls.original.replace("i.pximg.net", "proxy.pixivel.moe"));
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
        }
        let api = `https://api.bbmang.me/ranks?page=${page}&date=${date}&mode=${mode}&pageSize=30`
        let res = await fetch(api).then(res => res.json()).catch(err => console.log(err))
        if (!res) return false;
        if (!res.data) return false;
        let list = [
            `${date}的${type[mode]}`,
            `当前为第${page}页`
        ];
        for (let i of res.data) {
            let title = i.title;
            let pid = i.id;
            let uresname = i.artistPreView.name;
            let uresid = i.artistPreView.id;
            let tags = i.tags ? lodash.truncate(i.tags.map((item) => item.name).join(",")) : ""
            let url = i.imageUrls[0].large.replace("i.pximg.net", "proxy.pixivel.moe")
            list.push([
                `标题：${title}\n`,
                `插画ID：${pid}\n`,
                `画师：${uresname}\n`,
                `画师ID：${uresid}\n`,
                `tag：${tags}\n`,
                segment.image(url)
            ])
        }
        return list
    }

}


export default new Pixiv();