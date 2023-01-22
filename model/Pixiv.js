import fetch from "node-fetch";
import lodash from "lodash";
import { segment } from "oicq";
import moment from "moment";

/**API请求错误文案 */
const API_ERROR = "❎ 出错辣，请稍后重试"
export default new class Pixiv {
    constructor() {
        this.proxy = `yenai:proxy`
        this.ranktype = {
            "日": {
                type: "day",
                quantity: 500,
                r18: 100,
            },
            "周": {
                type: "week",
                quantity: 500,
                r18: 100,
            },
            "月": {
                type: "month",
                quantity: 500
            },
            // "AI": {
            //     type: "day_ai",
            //     quantity: 50,
            //     r18: 50,
            // },
            "男性向": {
                type: "day_male",
                quantity: 500,
                r18: 300,
            },
            "女性向": {
                type: "day_female",
                quantity: 500,
                r18: 300,
            },
            // "漫画日": {
            //     type: "day_manga",
            //     quantity: 500,
            //     r18: 100,
            // },
            // "漫画周": {
            //     type: "week_manga",
            //     quantity: 500,
            //     r18: 100,
            // },
            // "漫画月": {
            //     type: "month_manga",
            //     quantity: 500
            // },
            // "漫画新秀周": {
            //     type: "week_rookie_manga",
            //     quantity: 500
            // },
            "新人": {
                type: "week_rookie",
                quantity: 500
            },
            "原创": {
                type: "week_original",
                quantity: 500
            },

        }
        this.domain = 'http://api.liaobiao.top'
    }
    /**
     * @description: 获取插画信息
     * @param {String} ids 插画ID
     * @return {Object}
     */
    async Worker(ids, filter = false) {

        let api = `${this.domain}/api/pixiv/illust?id=${ids}`
        let res = await fetch(api).then(res => res.json()).catch(err => console.log(err))
        if (!res) return { error: API_ERROR };

        if (res.error) {
            return { error: res.error?.user_message || "无法获取数据" };
        }
        let proxy = await redis.get(this.proxy)
        let illust = this.format(res.illust, proxy)
        let { id, title, user, tags, total_bookmarks, total_view, url, create_date, x_restrict, illust_ai_type } = illust
        let msg = [
            `标题：${title}\n`,
            `画师：${user.name}\n`,
            `PID：${id}\n`,
            `UID：${user.id}\n`,
            `点赞：${total_bookmarks}\n`,
            `访问：${total_view}\n`,
            `isAI：${illust_ai_type == 2 ? true : false}\n`,
            `发布：${moment(create_date).format("YYYY-MM-DD HH:mm:ss")}\n`,
            `Tag：${tags.join("，")}\n`,
            `直链：https://pixiv.re/${id}.jpg\n`,
            `传送门：https://www.pixiv.net/artworks/${id}`
        ]
        if (filter && x_restrict) {
            let linkmsg = [
                `该作品不适合所有年龄段，请自行使用链接查看：`,

            ]
            if (url.length > 1) {
                linkmsg.push(...url.map((item, index) => `\nhttps://pixiv.re/${id}-${index + 1}.jpg`))
            } else {
                linkmsg.push(`\nhttps://pixiv.re/${id}.jpg`)
            }
            return { error: linkmsg };
        }

        let img = url.map(item => segment.image(item))
        return { msg, img }
    }
    //榜单类型
    get RankReg() {
        return this.ranktype
    }

    /**
     * @description: 获取Pixiv榜单
     * @param {Number} page 页数
     * @param {Date} date 时间YYYY-MM-DD
     * @param {String} mode 榜单类型
     * @param {Boolean} r18 是否为R18榜单 
     * @return {Array} 
     */
    async Rank(page = 1, date = '', mode = "周", r18 = false) {

        //转为大写
        mode = lodash.toUpper(mode)
        //排行榜类型
        let type = this.ranktype[mode].type
        //总张数
        let pageSizeAll = this.ranktype[mode].quantity
        //r18处理
        if (r18) {
            if (!this.ranktype[mode].r18) return { error: "该排行没有不适合所有年龄段的分类哦~" }
            type = type + "_r18";
            pageSizeAll = this.ranktype[mode].r18
        }
        //总页数
        let pageAll = Math.ceil(pageSizeAll / 30)
        if (page > pageAll) {
            return { error: "哪有那么多图片给你辣(•̀へ •́ ╮ )" }
        }
        if (!date) date = moment().subtract(moment().hour() >= 12 ? 1 : 2, "days").format("YYYY-MM-DD")

        let parame = `mode=${type}&page=${page}&date=${date}`
        //请求api   
        let api = `${this.domain}/api/pixiv/rank?${parame}`
        let res = await fetch(api).then(res => res.json()).catch(err => console.log(err))

        if (!res || res.error || lodash.isEmpty(res.illusts)) {
            logger.mark(`[椰奶Pixiv][排行榜]使用备用接口`)
            res = await fetch(`https://api.imki.moe/api/pixiv/rank?${parame}`).then(res => res.json())
                .catch(err => console.log(err))
        };
        if (!res) return { error: API_ERROR }
        if (res.error) return { error: res.error.message }
        if (lodash.isEmpty(res.illusts)) return { error: "暂无数据，请等待榜单更新哦(。-ω-)zzz" }

        let proxy = await redis.get(this.proxy)

        let illusts = res.illusts.map((item, index) => {
            let list = this.format(item, proxy)
            let { id, title, user, tags, total_bookmarks, image_urls } = list
            return [
                `标题：${title}\n`,
                `画师：${user.name}\n`,
                `PID：${id}\n`,
                `UID：${user.id}\n`,
                `点赞：${total_bookmarks}\n`,
                `排名：${(page - 1) * 30 + (index + 1)}\n`,
                `Tag：${lodash.truncate(tags)}\n`,
                segment.image(image_urls.large)
            ]
        })
        let formatDate = res.next_url.match(/date=(\d{4}-\d{1,2}-\d{1,2})/)[1]
        formatDate = moment(formatDate, "YYYY-MM-DD").format("YYYY年MM月DD日")
        if (/周/.test(mode)) {
            formatDate = `${moment(formatDate, "YYYY年MM月DD日").subtract(6, "days").format("YYYY年MM月DD日")} ~ ${formatDate}`
        } else if (/月/.test(mode)) {
            formatDate = `${moment(formatDate, "YYYY年MM月DD日").subtract(29, "days").format("YYYY年MM月DD日")} ~ ${formatDate}`
        }
        let list = [
            `${formatDate}的${mode}${r18 ? "R18" : ""}榜`,
            `当前为第${page}页，共${pageAll}页，本页共${illusts.length}张，总共${pageSizeAll}张`,
        ];
        if (page < pageAll) {
            list.push(`可使用 "#看看${date ? `${formatDate}的` : ""}${mode}${r18 ? "R18" : ""}榜第${page - 0 + 1}页" 翻页`)
        }

        list.push(...illusts)
        return list
    }
    /**
     * @description: 根据关键词搜图
     * @param {String} tag 关键词
     * @param {String} page 页数
     * @return {Array}
     */
    async searchTags(tag, page = 1) {
        let api = `https://www.vilipix.com/api/v1/picture/public?limit=30&tags=${tag}&sort=new&offset=${(page - 1) * 30}`
        let res = await fetch(api).then(res => res.json()).catch(err => console.log(err))
        if (!res) return { error: API_ERROR }
        if (res.data.count == 0) {
            return { error: "呜呜呜，人家没有找到相关的插画(ó﹏ò｡)" };
        }

        let pageall = Math.ceil(res.data.count / 30)

        if (page > pageall) {
            return { error: "啊啊啊，淫家给不了你那么多辣d(ŐдŐ๑)" };
        }

        let list = [
            `当前为第${page}页，共${pageall}页，本页共${res.data.rows.length}张，总共${res.data.count}张`
        ];
        if (page < pageall) {
            list.push(`可使用 "#tag搜图${tag}第${page - 0 + 1}页" 翻页`)
        }
        res.data.rows.sort((a, b) => b.like_total - a.like_total)
        for (let i of res.data.rows) {
            let { picture_id, title, regular_url, tags } = i
            list.push([
                `标题：${title}\n`,
                `PID：${picture_id}\n`,
                `Tag：${lodash.truncate(tags)}\n`,
                segment.image(regular_url)
            ])
        }
        return list
    }
    /**
     * @description: tag搜图pro
     * @param {String} tag 关键词
     * @param {String} page 页数
     * @return {*}
     */
    async searchTagspro(tag, page = 1, isfilter = true) {
        let api = `${this.domain}/api/pixiv/search?word=${tag}&page=${page}&order=popular_desc`
        let res = await fetch(api).then(res => res.json()).catch(err => console.log(err))
        if (!res) return { error: API_ERROR }
        if (res.error) return { error: res.message }
        if (lodash.isEmpty(res.illusts)) return { error: "宝~没有数据了哦(๑＞︶＜)و" };

        let proxy = await redis.get(this.proxy)
        let illusts = [];
        let filter = 0
        let NowNum = res.illusts.length
        for (let i of res.illusts) {
            let { id, title, user, tags, total_bookmarks, image_urls, x_restrict } = this.format(i, proxy)
            if (isfilter && x_restrict) {
                filter++
                continue
            }
            illusts.push([
                `标题：${title}\n`,
                `画师：${user.name}\n`,
                `PID：${id}\n`,
                `UID：${user.id}\n`,
                `点赞：${total_bookmarks}\n`,
                `Tag：${lodash.truncate(tags)}\n`,
                segment.image(image_urls.large)
            ])
        }
        if (lodash.isEmpty(illusts)) return { error: "该页全为涩涩内容已全部过滤(#／。＼#)" }

        return [
            `本页共${NowNum}张${filter ? `，过滤${filter}张` : ""}\n可尝试使用 "#tagpro搜图${tag}第${page - 0 + 1}页" 翻页\n无数据则代表无下一页`,
            ...illusts
        ];
    }






    /**
     * @description: 获取热门tag
     * @return {Array}
     */
    async gettrend_tags() {
        let api = `${this.domain}/api/pixiv/tags`

        let res = await fetch(api).then(res => res.json()).catch(err => console.log(err))
        if (!res) return { error: API_ERROR }
        if (!res.trend_tags) return { error: "呜呜呜，没有获取到数据(๑ १д१)" }

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
     * @param {Number|String} keyword 用户uid或名称
     * @param {Number|String} page 页数
     * @return {Array}
     */
    async public(keyword, page = 1, isfilter = true) {
        //关键词搜索
        if (!/^\d+$/.test(keyword)) {
            let wordapi = `https://www.vilipix.com/api/v1/search/user?type=author&keyword=${keyword}&limit=1&offset=0`
            let wordlist = await fetch(wordapi).then(res => res.json()).catch(err => console.log(err))
            if (!wordlist) return { error: API_ERROR }

            if (lodash.isEmpty(wordlist.data?.rows)) return { error: "呜呜呜，人家没有找到这个淫d(ŐдŐ๑)" };

            keyword = wordlist.data.rows[0].user.id
        }
        let proxy = await redis.get(this.proxy)
        // let userapi = `https://api.obfs.dev/api/pixiv/member?id=${keyword}`
        // let user = await fetch(userapi).then(res => res.json()).catch(err => console.log(err))
        // if (!user) return { error: API_ERROR }

        // if (user.error) return { error: user.error.message };

        // let { id, name, comment, profile_image_urls } = user.user
        // let { total_follow_users, total_illust_bookmarks_public, total_illusts } = user.profile
        // let list = [[
        //     segment.image(profile_image_urls.medium.replace("i.pximg.net", proxy)),
        //     `\nuid：${id}\n`,
        //     `画师：${name}\n`,
        //     `作品：${total_illusts}\n`,
        //     `关注：${total_follow_users}\n`,
        //     `收藏：${total_illust_bookmarks_public}\n`,
        //     `介绍：${lodash.truncate(comment)}`
        // ]]
        //作品
        let api = `${this.domain}/api/pixiv/member_illust?id=${keyword}&page=${page}`
        let res = await fetch(api).then(res => res.json()).catch(err => console.log(err))
        if (!res) return { error: API_ERROR };
        if (res.error) return { error: res.error.message };
        //没有作品直接返回信息
        if (lodash.isEmpty(res.illusts)) return { error: page >= 2 ? "这一页没有作品辣（＞人＜；）" : "Σ(っ °Д °;)っ这个淫居然没有作品" }

        // let illustsall = Math.ceil(total_illusts / 30)

        // if (page > illustsall) return { error: "这个淫已经没有涩图给你辣(oＡo川)" }

        let illusts = [];
        let filter = 0
        let NowNum = res.illusts.length
        for (let i of res.illusts) {
            let { id: pid, title, tags, total_bookmarks, total_view, url, x_restrict } = this.format(i, proxy)
            if (isfilter && x_restrict) {
                filter++
                continue
            }
            illusts.push([
                `标题：${title}\n`,
                `PID：${pid}\n`,
                `点赞：${total_bookmarks}\n`,
                `访问：${total_view}\n`,
                `Tag：${lodash.truncate(tags)}\n`,
                segment.image(url[0]),
            ])
        }
        if (lodash.isEmpty(illusts)) return { error: "该页全为涩涩内容已全部过滤(#／。＼#)" }
        let { id: uid, name, profile_image_urls } = res.user
        // list.push(`当前为第${page}页，共${illustsall}页\n本页共${NowNum}张，${filter ? `过滤${filter}张，` : ""}总共${total_illusts}张`)
        // if (page < illustsall) {
        //     list.push(`可使用 "#uid搜图${keyword}第${page - 0 + 1}页" 翻页`)
        // }
        // list.push(...illusts)
        return [
            [
                segment.image(profile_image_urls.medium.replace("i.pximg.net", proxy)),
                `\nUid：${uid}\n`,
                `画师：${name}\n`,
            ],
            `本页共${NowNum}张${filter ? `，过滤${filter}张` : ""}\n可尝试使用 "#uid搜图${keyword}第${page - 0 + 1}页" 翻页\n无数据则代表无下一页`,
            ...illusts
        ];
    }
    /**
     * @description: 随机图片
     * @return {Array} 
     */
    async getrandomimg(num) {
        let api = `https://www.vilipix.com/api/v1/picture/public?limit=${num}&offset=${lodash.random(1500)}&sort=hot&type=0`
        let res = await fetch(api).then(res => res.json()).catch(err => console.log(err))
        if (!res) return { error: API_ERROR }
        if (!res.data || !res.data.rows) return { error: "呜呜呜，没拿到瑟瑟的图片(˃ ⌑ ˂ഃ )" };

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
     * @description: 相关作品
     * @param {String} pid
     * @return {*} 
     */
    async getrelated_works(pid, isfilter = true) {
        let api = `${this.domain}/api/pixiv/related?id=${pid}`
        let res = await fetch(api).then(res => res.json()).catch(err => console.log(err))
        if (!res) return { error: API_ERROR }
        if (res.error) return { error: res.error.user_message };
        if (lodash.isEmpty(res.illusts)) return { error: "呃...没有数据(•ิ_•ิ)" };

        let proxy = await redis.get(this.proxy)
        let illusts = [];
        let filter = 0
        for (let i of res.illusts) {
            let { id, title, user, tags, total_bookmarks, image_urls, x_restrict } = this.format(i, proxy)
            if (isfilter && x_restrict) {
                filter++
                continue
            }
            illusts.push([
                `标题：${title}\n`,
                `画师：${user.name}\n`,
                `PID：${id}\n`,
                `UID：${user.id}\n`,
                `点赞：${total_bookmarks}\n`,
                `Tag：${lodash.truncate(tags)}\n`,
                segment.image(image_urls.large)
            ])
        }
        if (lodash.isEmpty(illusts)) return { error: "啊啊啊！！！居然全是瑟瑟哒不给你看(＊／ω＼＊)" };

        return [
            `Pid:${pid}的相关作品，共${res.illusts.length}张${filter ? `，过滤${filter}张` : ""}`,
            ...illusts
        ]
    }
    /**p站单图*/
    async getPximg(type) {
        let url = "https://ovooa.com/API/Pximg/"
        if (type) {
            url = "https://xiaobapi.top/api/xb/api/setu.php"
        }
        let res = await fetch(url).then(res => res.json()).catch(err => console.log(err))
        if (!res) return { error: API_ERROR };
        let { pid, uid, title, author, tags, urls, r18 } = res.data[0] || res.data
        let msg = [
            `Pid: ${pid}\n`,
            `Uid: ${uid}\n`,
            r18 ? `R18: ${r18}\n` : "",
            `标题：${title}\n`,
            `画师：${author}\n`,
            `Tag：${tags.join("，")}\n`,
            segment.image(urls.original.replace('i.der.ink', await redis.get(`yenai:proxy`)))
        ]
        return msg
    }






    /**
     * @description: 格式化
     * @param {Object} illusts 处理对象
     * @param {Object} proxy 代理
     * @return {Object}
     */
    format(illusts, proxy) {
        let url = []
        let { id, title, tags, total_bookmarks, total_view, meta_single_page, meta_pages, user, image_urls, x_restrict, create_date, illust_ai_type, visible } = illusts;
        tags = lodash.uniq(lodash.compact(lodash.flattenDeep(tags?.map(item => Object.values(item)))))
        if (!lodash.isEmpty(meta_single_page)) {
            url.push(meta_single_page.original_image_url.replace("i.pximg.net", proxy))
        } else {
            url = meta_pages.map(item => item.image_urls.original.replace("i.pximg.net", proxy));
        }
        image_urls = lodash.mapValues(image_urls, (item) => item.replace("i.pximg.net", proxy))

        return {
            title,              //标题
            id,                 //pid
            total_bookmarks,    //点赞
            total_view,         //访问量
            tags,               //标签
            url,                //图片链接
            user,               //作者信息
            image_urls,         //单张图片
            x_restrict,         //是否为全年龄
            create_date,        //发布时间
            illust_ai_type,     //是否为AI作品
            visible             //是否为可见作品
        }
    }
}