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
    async getCreditLevelInfo(group_id) {
        let url = `https://qqweb.qq.com/c/activedata/get_credit_level_info?bkn=${Bot.bkn}&uin=${Bot.uin}&gc=${group_id}`
        return await fetch(url, {
            headers: {
                "Cookie": Bot.cookies["qqweb.qq.com"],
                "Referer": `https://qqweb.qq.com/m/business/qunlevel/index.html?gc=${group_id}&from=0&_wv=1027`,
                "User-agent": "Mozilla/5.0 (Linux; Android 12; M2012K11AC Build/SKQ1.220303.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/89.0.4389.72 MQQBrowser/6.2 TBS/046141 Mobile Safari/537.36 V1_AND_SQ_8.3.9_350_TIM_D QQ/3.5.0.3148 NetType/WIFI WebP/0.3.0 Pixel/1080 StatusBarHeight/81 SimpleUISwitch/0 QQTheme/1015712"
            }
        }).then(res => res.json()).catch(err => console.error(err))
    }

    /**查看本群龙王 */
    async dragon(group_id) {
        let url = `https://qun.qq.com/interactive/honorlist?gc=${group_id}&type=1&_wv=3&_wwv=129`
        let res = await fetch(url, { headers: { "Cookie": Bot.cookies["qun.qq.com"] } }).then(res => res.text())
        let name = res.match(/<span class="text">(.*?)<\/span>/)[1]
        let avatar = res.match(/<div class="avatar" style="background-image:url\((.*?)\);"><\/div>/)[1].replaceAll("amp;", "")
        let desc = res.match(/<div class="tag" style="display:(none)?;"><span>(.*?)<\/span><\/div>/)[2]
        return {
            name,
            avatar,
            desc
        }
    }

    /**
     * @description: 获取群公告
     * @param {String} group 群号
     * @param {String} item 序号
     * @return {Object}
     */
    async getAnnouncelist(group_id, s = 0) {
        let n = s ? 1 : 20;
        let url = `https://web.qun.qq.com/cgi-bin/announce/get_t_list?bkn=${Bot.bkn}&qid=${group_id}&ft=23&s=${s - 1}&n=${n}`
        let res = await fetch(url, { headers: { "Cookie": Bot.cookies["qun.qq.com"], } }).then(res => res.json()).catch(err => console.error(err))
        if (!res) return false;
        if (s) {
            return {
                text: res.feeds[0].msg.text,
                fid: res.feeds[0].fid
            }
        } else {
            return res.feeds.map((item, index) => `${index + 1}、${lodash.truncate(item.msg.text)}`).join('\n')
        }

    }
    /**
     * @description: 发送群公告
     * @param {Number} group_id 发送群号
     * @param {String} msg 发送内容
     */
    async setAnnounce(group_id, msg) {
        let url = `https://web.qun.qq.com/cgi-bin/announce/add_qun_notice?bkn=${Bot.bkn}`
        return await fetch(url, {
            method: 'POST',
            body: `qid=${group_id}&bkn=${Bot.bkn}&text=${msg}&pinned=0&type=1&settings={"is_show_edit_card":1,"tip_window_type":1,"confirm_required":1}`,
            headers: {
                "Cookie": Bot.cookies["qun.qq.com"],
            }
        }).then(res => res.json()).catch(err => console.error(err))
    }
    /**
     * @description: 删群公告
     * @param {Number} group_id 群号
     * @param {Number} num 序号
     */
    async delAnnounce(group_id, num) {
        let fid = await this.getAnnouncelist(group_id, num)
        if (!fid) return false;

        let url = `https://web.qun.qq.com/cgi-bin/announce/del_feed?bkn=${Bot.bkn}`
        let res = await fetch(url, {
            method: 'POST',
            body: `bkn=${Bot.bkn}&fid=${fid.fid}&qid=${group_id}`,
            headers: {
                "Cookie": Bot.cookies["qun.qq.com"],
            }
        }).then(res => res.json()).catch(err => console.error(err))
        return {
            ...res,
            text: lodash.truncate(fid.text)
        }
    }
    /**
     * @description: 开关好友添加
     * @param {Number} type 1关闭2开启
     */
    async addFriendSwitch(type) {
        let url = `https://ti.qq.com/proxy/domain/oidb.tim.qq.com/v3/oidbinterface/oidb_0x587_75?sdkappid=39998&actype=2&bkn=${Bot.bkn}`
        return await fetch(url, {
            method: "POST",
            body: JSON.stringify({
                "uint32_allow": type
            }),
            headers: {
                "Cookie": Bot.cookies["ti.qq.com"],
                "Content-type": "application/json",
            }
        }).then(res => res.json()).catch(err => console.error(err))
    }
    /**
     * @description: 更改好友申请方式
     * @param {*} at 类型1
     * @param {*} q
     * @param {*} a
     * @return {*}
     */
    async setFriendType(at, q = "", a = "") {
        const type = {
            '1': '0',
            '2': '1',
            '3': '3'
        }
        let url = `https://ti.qq.com/cgi-node/friend-auth/set`
        return await fetch(url, {
            method: "POST",
            body: JSON.stringify({
                "req": `{"at": ${type[at]},"q": "${q}","a": "${a}","l": [],"viaphone": 0}`
            }),
            headers: {
                "Cookie": Bot.cookies["ti.qq.com"],
                "Content-type": "application/json",
            }
        }).then(res => res.json()).catch(err => console.error(err))
    }
    /**
     * @description: 设置戳一戳开关
     * @param {Number} is 0为开启1为关闭
     */
    async setcyc(is) {
        let url = `https://zb.vip.qq.com/srf/QC_UniBusinessLogicServer_UniBusinessLogicObj/uniSet?g_tk=${Bot.bkn}`
        return await fetch(url, {
            method: "POST",
            body: JSON.stringify({
                "stLogin": {
                    "iKeyType": 1,
                    "iOpplat": 2,
                    "lUin": Bot.uin,
                    "sClientIp": "",
                    "sClientVer": "8.9.10",
                    "sSKey": "MGOy0oTuvl"
                },
                "stUniBusinessItem": {
                    "appid": 46,
                    "itemid": 1
                },
                "stNudge": {
                    "ischangeswitch": 1,
                    "isclose": is,
                    "ischangecustomtext": 1,
                    "customtext": ""
                }
            }
            ),
            headers: {
                "Cookie": Bot.cookies["vip.qq.com"],
                "Content-type": "application/json",
            }
        }).then(res => res.json()).catch(err => console.error(err))
    }
}