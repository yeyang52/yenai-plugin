import fetch from 'node-fetch'
import Cfg from './Config.js'
import { segment } from "oicq";

class amuse {
    /**
     * @description: 搜番
     * @param {String} url 图片链接
     * @param {*} e oicq
     * @return {Array} 
     */
    async gettracemoe(url, e) {
        let api = `https://api.trace.moe/search?url=${url}&anilistInfo=true&cutBorders=true`
        let res = await fetch(api).then(res => res.json()).catch(err => console.log(err))
        if (!res) {
            e.reply("接口失效辣！！！")
            return false
        };
        if (res.error) {
            e.reply(res.error)
            return false
        }
        let list = [];
        for (let i of res.result) {
            let { anilist, image, from, similarity, episode } = i
            let { synonyms } = anilist
            let find = synonyms.findIndex((item) => /[\u4E00-\u9FFF]+/.test(item));
            if (find == -1) find = 1
            let { minute, second } = Cfg.getsecond(from)
            list.push([
                `${similarity > 0.8 ? "我有把握是这个！" : "大概是这个？"}\n`,
                `番剧名：${synonyms[find]}\n`,
                `话数：${episode}\n`,
                `时间：${minute} : ${second}\n`,
                segment.image(image),
            ])
        }

        return list
    }
}

export default new amuse();