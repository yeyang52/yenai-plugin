import fetch from "node-fetch"
import { Cfg } from './index.js';
import lodash from 'lodash'
import moment from 'moment'
import { segment } from "oicq";
/**QQ接口 */
export default new class assistant {
    /**
     * @description: 取说说列表
     * @param {*} e oicq
     * @param {Number} pos 偏移量
     * @param {Number} num 数量
     * @return {Object} QQ空间数据
     */
    async getQzone(e, pos = 0, num = 20) {
        let url = `https://user.qzone.qq.com/proxy/domain/taotao.qq.com/cgi-bin/emotion_cgi_msglist_v6?uin=${Bot.uin}&ftype=0&sort=0&pos=${pos}&num=${num}&replynum=100&g_tk=${Bot.bkn}&code_version=1&format=json&need_private_comment=1`
        let list = await fetch(url, {
            headers: {
                "Cookie": Bot.cookies["qzone.qq.com"],
            }
        }).then(res => res.json()).catch(err => console.log(err))

        if (!list) {
            e.reply("❎ 取说说列表失败")
            return false;
        } else if (!list.msglist) {
            e.reply(`❎ 未获取到说说列表`)
            return false;
        } else {
            return list
        }
    }

    /** 删除说说 */
    async delQzone(e) {
        let pos = e.msg.match(/\d+/)
        //获取说说列表
        let list = await this.getQzone(e, pos - 1, 1)

        if (!list) return false;

        //要删除的说说
        let domain = list.msglist[0]

        let url = `https://user.qzone.qq.com/proxy/domain/taotao.qzone.qq.com/cgi-bin/emotion_cgi_delete_v6?&g_tk=${Bot.bkn}`
        //发送请求
        let result = await fetch(url, {
            method: 'POST',
            body: `hostuin=${Bot.uin}&tid=${domain.tid}&t1_source=${domain.t1_source}&code_version=1&format=json`,
            headers: {
                "Cookie": Bot.cookies["qzone.qq.com"],
            }
        }).then(res => res.json()).catch(err => console.log(err))
        if (!result) return e.reply(`❎ 接口请求失败`)
        logger.debug(`[椰奶删除说说]`, result)
        if (result.subcode == 0) {
            e.reply(`✅ 删除说说成功：\n ${pos}.${lodash.truncate(domain.content, { "length": 15 })} \n - [${domain.secret ? "私密" : "公开"}] | ${moment(domain.created_time * 1000).format("MM/DD HH:mm")} | ${domain.commentlist?.length || 0} 条评论`)
        } else {
            e.reply(`❎ 未知错误` + JSON.parse(result))
        }
    }

    /**发送说说 */
    async setQzone(e) {
        let con = e.msg.replace(/#|发说说/g, "").trim()
        let ck = Cfg.getck('qzone.qq.com')

        let url;
        let result
        if (e.img) {
            url = `http://xiaobai.klizi.cn/API/qqgn/ss_sendimg.php?uin=${Bot.uin}&skey=${ck.skey}&pskey=${ck.p_skey}&url=${e.img[0]}&msg=${con}`
            result = await fetch(url).then(res => res.json()).catch(err => console.log(err))
        } else {
            url = `https://user.qzone.qq.com/proxy/domain/taotao.qzone.qq.com/cgi-bin/emotion_cgi_publish_v6?&g_tk=${Bot.bkn}`
            result = await fetch(url, {
                method: 'POST',
                body: `syn_tweet_verson=1&paramstr=1&con=${con}&feedversion=1&ver=1&ugc_right=1&to_sign=1&hostuin=${Bot.uin}&code_version=1&format=json`,
                headers: {
                    "Cookie": Bot.cookies["qzone.qq.com"],
                }
            }).then(res => res.json()).catch(err => console.log(err))
        }

        if (!result) return e.reply("接口失效")

        if (result.code != 0) return e.reply(`❎ 说说发表失败\n错误信息:${result.message}`)
        
        let msg = [`✅ 说说发表成功，内容：\n`, lodash.truncate(result.content, { "length": 15 })]
        if (result.pic) {
            msg.push(segment.image(result.pic[0].url1))
        }
        msg.push(`\n- [${result.secret ? "私密" : "公开"}] | ${moment(result.t1_ntime * 1000).format("MM/DD HH:mm")}`)
        e.reply(msg)
    }

    /**群星级 */
    async getGroup_xj(e) {
        let ck = Cfg.getck("qqweb.qq.com")

        let url = `http://xiaobai.klizi.cn/API/qqgn/qun_xj.php?data=&uin=${Bot.uin}&skey=${ck.skey}&pskey=${ck.p_skey}&group=${e.group_id}`

        let result = await fetch(url).then(res => res.json()).catch(err => console.log(err))

        if (!result) return e.reply("❎ 接口失效")

        let str = "⭐"
        str = str.repeat(result.uiGroupLevel)
        e.reply([
            `群名：${result.group_name}\n`,
            `群号：${result.group_uin}\n`,
            `群星级：${str}`
        ])
    }

}