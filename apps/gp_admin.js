import plugin from '../../../lib/plugins/plugin.js'
import fetch from 'node-fetch'
import { segment } from 'oicq'
import lodash from 'lodash'
import { Config } from '../components/index.js'
import { Cfg, Gpadmin, common, QQInterface, Browser } from '../model/index.js'
import moment from 'moment'
const ROLE_MAP = {
    admin: '群管理',
    owner: '群主',
    member: '群员'
}
const Time_unit = common.Time_unit
let Numreg = "[一壹二两三四五六七八九十百千万亿\\d]+"
let noactivereg = new RegExp(`^#(查看|清理|确认清理|获取)(${Numreg})个?(年|月|周|天)没发言的人(第(${Numreg})页)?$`)
let Autisticreg = new RegExp(`^#?我要(自闭|禅定)(${Numreg})?个?(${Object.keys(Time_unit).join("|")})?$`, "i")
export class Basics extends plugin {
    constructor() {
        super({
            name: '椰奶基础群管',
            event: 'message.group',
            priority: 500,
            rule: [
                {
                    reg: '^#禁言.*$',
                    fnc: 'Taboo'
                },
                {
                    reg: '^#解禁.*$',
                    fnc: 'Relieve'
                },
                {
                    reg: '^#全体(禁言|解禁)$',
                    fnc: 'TabooAll'
                },
                {
                    reg: '^#踢(.*)$',
                    fnc: 'Kick'
                },
                {
                    reg: Autisticreg,
                    fnc: 'Autistic'
                },
                {
                    reg: '^#(设置|取消)管理.*$',
                    fnc: 'SetAdmin'
                },
                {
                    reg: '^#(允许|禁止|开启|关闭)匿名$',
                    fnc: 'AllowAnony'
                },
                {
                    reg: '^#发群公告.*$',
                    fnc: 'AddAnnounce'
                },
                {
                    reg: '^#删群公告(\\d+)$',
                    fnc: 'DelAnnounce'
                },
                {
                    reg: '^#查群公告$',
                    fnc: 'GetAnnounce'
                },
                {
                    reg: '^#修改头衔.*$',
                    fnc: 'adminsetTitle'
                },
                {
                    reg: '^#申请头衔.*$',
                    fnc: 'SetGroupSpecialTitle'
                },
                {
                    reg: '^#(查)?(幸运)?字符(列表)?$',
                    fnc: 'qun_luckylist'
                },
                {
                    reg: '^#抽(幸运)?字符$',
                    fnc: 'qun_lucky'
                },
                {
                    reg: '^#替换(幸运)?字符(\\d+)$',
                    fnc: 'qun_luckyuse'
                },
                {
                    reg: '^#(开启|关闭)(幸运)?字符$',
                    fnc: 'qun_luckyset'
                },
                {
                    reg: '^#今日打卡$',
                    fnc: 'DaySigned'
                },
                {
                    reg: '^#(获取|查看)?禁言列表$',
                    fnc: 'Mutelist'
                },
                {
                    reg: '^#解除全部禁言$',
                    fnc: 'relieveAllMute'
                },
                {
                    reg: noactivereg,
                    fnc: 'noactive'
                },
                {
                    reg: `^#(查看|(确认)?清理)从未发言过?的人(第(${Numreg})页)?$`,
                    fnc: 'neverspeak'
                },
                {
                    reg: `^#(查看|获取)?(不活跃|潜水)排行榜(${Numreg})?$`,
                    fnc: 'RankingList'
                },
                {
                    reg: `^#(查看|获取)?最近的?入群(情况|记录)(${Numreg})?$`,
                    fnc: 'RankingList'
                },
                {
                    reg: `^#发通知.*$`,
                    fnc: 'Send_notice'
                },
                {
                    reg: `^#(查看|获取)?群?发言榜单((7|七)天)?`,
                    fnc: 'SpeakRank'
                },
                {
                    reg: `(^#定时禁言(.*)解禁(.*)$)|(^#定时禁言任务$)|(^#取消定时禁言$)`,
                    fnc: 'timeMute'
                },
                {
                    reg: "^#?(谁|哪个吊毛|哪个屌毛|哪个叼毛)是龙王$",
                    fnc: 'dragonKing'
                },
                {
                    reg: '^#群星级$',
                    fnc: 'Group_xj'
                },

            ]
        })

        this.task = {
            cron: '0 0/1 * * * ?',
            name: '定时禁言',
            fnc: () => this.timeTaboo(),
        }
    }
    /**定时群禁言 */
    async timeTaboo() {
        let time = moment(new Date()).format('HH:mm')
        let task = await redis.keys('Yunzai:yenai:Taboo:*')
        if (!task.length) return
        for (let i of task) {
            let data = JSON.parse(await redis.get(i))
            if (data.muteTime == time) {
                await Bot.pickGroup(data.groupNumber).muteAll(true)
            } else if (data.remTime == time) {
                await Bot.pickGroup(data.groupNumber).muteAll(false)
            }
        }
    }
    /**禁言 */
    async Taboo(e) {

        //判断是否有管理
        if (!e.group.is_admin && !e.group.is_owner) {
            return e.reply("做不到，怎么想我都做不到吧ヽ(≧Д≦)ノ", true);
        }

        if (!e.isMaster && !e.member.is_owner && !e.member.is_admin) {
            return e.reply("❎ 该命令仅限管理员可用", true);
        }

        let qq;
        let TabooTime;
        let Company;
        //判断有无@
        if (e.message.length == 1) {
            //处理消息
            let msg = e.msg.split(" ");
            if (msg.length >= 4) return e.reply("❎ 指令有误请检查");
            //取qq号
            if (msg.length == 1) {
                qq = msg[0].match(/[1-9]\d*/g);
            } else if (msg.length == 2) {
                qq = msg[0].match(/[1-9]\d*/g);
                if (!qq) qq = msg[1].match(/[1-9]\d*/g);
            } else {
                qq = msg[1].match(/[1-9]\d*/g);
            }
            //取禁言时间如果没取到走默认时间
            if (msg[2]) {
                TabooTime = msg[2].match(/[1-9]\d*/g);
                Company = msg[2].match(/(天|时|分)/g);
            } else if (msg.length == 2 && qq) {
                TabooTime = msg[1].match(/[1-9]\d*/g);
                Company = msg[1].match(/(天|时|分)/g);
            }

        } else {
            //有艾特处理
            for (let i of e.message) {
                //取信息中艾特的QQ号
                if (i.type == "at") {
                    qq = i.qq;
                } else if (i.type == 'text') {
                    //取禁言时间
                    if (/\d/g.test(i.text)) {
                        TabooTime = i.text.match(/[1-9]\d*/g);
                        Company = i.text.match(/(天|时|分)/g);
                    }
                }
            }
        }

        if (!(/\d{5,}/.test(qq))) return e.reply("❎ 请输入正确的QQ号");
        //判断是否为主人
        if (Cfg.masterQQ?.includes(Number(qq))) {
            return e.reply("居然调戏主人！！！哼，坏蛋(ﾉ｀⊿´)ﾉ");
        }
        let Memberinfo = e.group.pickMember(Number(qq)).info
        //判断是否有这个人
        if (!Memberinfo) return e.reply("❎ 这个群没有这个人哦~", true)
        if (Memberinfo.role === 'owner') return e.reply("调戏群主拖出去枪毙5分钟(。>︿<)_θ", true)
        if (Memberinfo.role === 'admin') {
            if (!e.group.is_owner) return e.reply("人家又不是群主这种事做不到的辣！", true)
            if (!e.isMaster && !e.member.is_owner) return e.reply("这个淫系管理员辣，只有主淫和群主才可以干ta", true)
        }
        //如无时间默认禁言五分钟
        if (!TabooTime) TabooTime = 5;
        //默认单位为分
        if (/天/.test(Company)) {
            Company = 86400;
        } else if (/时/.test(Company)) {
            Company = 3600;
        } else {
            Company = 60;
        }

        await e.group.muteMember(qq, TabooTime * Company);
        e.reply(`已把「${Memberinfo.card || Memberinfo.nickname}」扔进了小黑屋( ･_･)ﾉ⌒●~*`, true);
        return true;

    }
    /**解禁 */
    async Relieve(e) {
        //判断是否有管理
        if (!e.group.is_admin && !e.group.is_owner) {
            return e.reply("做不到，怎么想我都做不到吧ヽ(≧Д≦)ノ", true);
        }

        if (!e.isMaster && !e.member.is_owner && !e.member.is_admin) {
            return e.reply("❎ 该命令仅限管理员可用", true);
        }

        let qq = e.msg.replace(/#|解禁/g, "").trim();

        if (e.message.length != 1) {
            qq = e.message.find(item => item.type == "at")?.qq
        } else {
            qq = qq.match(/[1-9]\d*/g);
        }

        if (!qq || !(/\d{5,}/.test(qq))) return e.reply("❎ 请输入正确的QQ号");
        let Member = e.group.pickMember(Number(qq))
        //判断是否有这个人
        if (!Member.info) return e.reply("❎ 这个群没有这个人哦~");


        await e.group.muteMember(qq, 0)
        e.reply(`已把「${Member.card || Member.nickname}」从小黑屋揪了出来(｡>∀<｡)`, true);
        return true;

    }
    /**全体禁言 */
    async TabooAll(e) {
        //判断是否有管理
        if (!e.group.is_admin && !e.group.is_owner) {
            return e.reply("做不到，怎么想我都做不到吧ヽ(≧Д≦)ノ", true);
        }
        if (!e.isMaster && !e.member.is_owner && !e.member.is_admin) {
            return e.reply("❎ 该命令仅限管理员可用", true);
        }

        let type = false;
        if (/全体禁言/.test(e.msg)) type = true;


        let res = await e.group.muteAll(type)
        if (res) {
            if (type) {
                e.reply("全都不准说话了哦~")
            } else {
                e.reply("好耶！！可以说话啦~")
            }
        } else {
            e.reply("❎ 未知错误", true)
        }
        return true
    }
    //踢群员
    async Kick(e) {
        // 判断是否有管理
        if (!e.group.is_admin && !e.group.is_owner) {
            return e.reply("做不到，怎么想我都做不到吧ヽ(≧Д≦)ノ", true);
        }
        if (!e.isMaster && !e.member.is_owner && !e.member.is_admin) {
            return e.reply("❎ 该命令仅限管理员可用", true);
        }
        let qq = e.msg.replace(/#|踢/g, "").trim()

        if (e.message.length != 1) {
            qq = e.message.find(item => item.type == "at")?.qq
        } else {
            qq = qq.match(/[1-9]\d*/g);
        }
        if (!qq || !(/\d{5,}/.test(qq))) return e.reply("❎ 请输入正确的QQ号");
        //判断是否为主人
        if (Cfg.masterQQ?.includes(Number(qq))) {
            return e.reply("居然调戏主人！！！哼，坏蛋(ﾉ｀⊿´)ﾉ");
        }
        let Memberinfo = e.group.pickMember(Number(qq)).info
        //判断是否有这个人
        if (!Memberinfo) return e.reply("❎ 这个群没有这个人哦~", true)
        if (Memberinfo.role === 'owner') return e.reply("调戏群主拖出去枪毙5分钟(。>︿<)_θ", true)
        if (Memberinfo.role === 'admin') {
            if (!e.group.is_owner) return e.reply("人家又不是群主这种事做不到的辣！", true)
            if (!e.isMaster && !e.member.is_owner) return e.reply("这个淫系管理员辣，只有主淫和群主才可以干ta", true)
        }
        let res = await e.group.kickMember(Number(qq))
        if (res) {
            e.reply("已把这个坏淫踢掉惹！！！", true)
        } else {
            e.reply("额...踢出失败哩，可能这个淫比较腻害>_<", true)
        }
        return true

    }

    //我要自闭
    async Autistic(e) {
        //判断是否有管理
        if (!e.group.is_admin && !e.group.is_owner) return

        if (e.member.is_admin || e.member.is_owner || e.isMaster)
            return e.reply("别自闭啦~~", true)
        //解析正则
        let regRet = Autisticreg.exec(e.msg)
        // 获取数字
        let TabooTime = common.translateChinaNum(regRet[2] || 5)

        let Company = Time_unit[lodash.toUpper(regRet[3]) || "分"]

        await e.group.muteMember(e.user_id, TabooTime * Company);
        e.reply(`那我就不手下留情了~`, true);
        return true;

    }

    //设置管理
    async SetAdmin(e) {

        if (!e.group.is_owner) return e.reply("呜呜呜，人家做不到>_<", true)

        if (!e.isMaster) return e.reply("❎ 该命令仅限主人可用", true);

        let qq
        let yes = false
        qq = e.msg.replace(/#|(设置|取消)管理/g, "").trim();
        if (/设置管理/.test(e.msg)) yes = true

        if (e.message.length != 1) {
            qq = e.message.find(item => item.type == "at")?.qq
        } else {
            qq = qq.match(/[1-9]\d*/g);
        }

        if (!qq || !(/\d{5,}/.test(qq))) return e.reply("❎ 请输入正确的QQ号");
        let Member = e.group.pickMember(Number(qq))
        //判断是否有这个人
        if (!Member.info) return e.reply("❎ 这个群没有这个人哦~");

        let res = await e.group.setAdmin(qq, yes)
        let name = Member.card || Member.nickname
        if (res) {
            if (yes) {
                e.reply(`已经把「${name}」设置为管理啦！！`)
            } else {
                e.reply(`「${name}」的管理已经被我吃掉啦~`)
            }
        } else {
            e.reply(`❎ 未知错误`)
        }
    }

    //匿名
    async AllowAnony(e) {

        if (!e.isMaster && !e.member.is_owner && !e.member.is_admin) {
            return e.reply("❎ 该命令仅限管理员可用", true);
        }
        //判断是否有管理
        if (!e.group.is_admin && !e.group.is_owner) {
            return e.reply("做不到，怎么想我都做不到吧ヽ(≧Д≦)ノ", true);
        }
        let yes = false
        if (/(允许|开启)匿名/.test(e.msg)) {
            yes = true
        }

        let res = await e.group.allowAnony(yes)
        if (res) {
            if (yes) {
                e.reply("已把匿名开启了哦，可以藏起来了~")
            } else {
                e.reply("已关闭匿名，小贼们不准藏了~")
            }
        } else {
            e.reply("❎ 未知错误", true)
        }
        return true;
    }

    //发群公告
    async AddAnnounce(e) {
        //判断是否有管理
        if (!e.group.is_admin && !e.group.is_owner) {
            return e.reply("做不到，怎么想我都做不到吧ヽ(≧Д≦)ノ", true);
        }
        //判断权限
        if (!e.isMaster && !e.member.is_owner && !e.member.is_admin) {
            return e.reply("❎ 该命令仅限管理员可用", true);
        }
        //获取发送的内容
        let msg = e.msg.replace(/#|发群公告/g, "").trim()
        if (!msg) return e.reply("❎ 公告不能为空");

        let result = await QQInterface.setAnnounce(e.group_id, msg)

        if (!result) return e.reply("❎ 出错辣，请稍后重试");
        if (result.ec != 0) {
            e.reply("❎ 发送失败\n" + JSON.stringify(result, null, '\t'))
        }
    }
    //查群公告
    async GetAnnounce(e) {
        if (!e.isMaster && !e.member.is_owner && !e.member.is_admin) {
            return e.reply("❎ 该命令仅限管理员可用", true);
        }
        let res = await QQInterface.getAnnouncelist(e.group_id)
        if (!res) return e.reply("❎ 出错辣，请稍后重试");
        return e.reply(res)
    }
    //删群公告
    async DelAnnounce(e) {
        if (!e.isMaster && !e.member.is_owner && !e.member.is_admin) {
            return e.reply("❎ 该命令仅限管理员可用", true);
        }

        let msg = e.msg.replace(/#|删群公告/, "").trim()
        if (!msg) return e.reply(`❎ 序号不可为空`)

        let result = await QQInterface.delAnnounce(e.group_id, msg)
        if (!result) return e.reply("❎ 出错辣，请稍后重试");

        if (result.ec == 0) {
            e.reply(`✅ 已删除「${result.text}」`)
        } else {
            e.reply("❎ 删除失败\n" + JSON.stringify(result, null, '\t'))
        }

    }

    //修改头衔
    async adminsetTitle(e) {
        if (e.message.length < 2) return

        if (e.message[1].type != 'at') return

        if (!e.group.is_owner) return e.reply("做不到，怎么想我都做不到吧ヽ(≧Д≦)ノ", true)

        if (!e.isMaster) {
            return e.reply("❎ 该命令仅限主人可用", true);
        }

        let res = await e.group.setTitle(e.message[1].qq, e.message[2].text)
        if (res) {
            e.reply(`已经把这个小可爱的头衔设置为「${e.message[2].text}」辣`)
        } else {
            e.reply(`额...没给上不知道发生了神魔`)
        }
    }

    //申请头衔
    async SetGroupSpecialTitle(e) {
        let msgs = [
            "换上辣(´•ω•̥`)",
            "嗯！不戳的头衔哦٩(๑•ㅂ•)۶",
            "给你换上了哦（*＾ワ＾*）",
            "又要换了吗，真是喜新厌旧呢( •̥́ ˍ •̀ू )",
            "啾咪٩(๑•̀ω•́๑)۶",
            "弃旧恋新了么笨蛋( 。ớ ₃ờ)ھ"
        ]
        if (!e.group.is_owner) return e.reply("做不到，怎么想我都做不到吧ヽ(≧Д≦)ノ", true)

        let Title = e.msg.replace(/#|申请头衔/g, "")
        //屏蔽词处理
        if (!e.isMaster) {
            let data = Config.NoTitle
            if (data.Match_pattern) {
                let reg = new RegExp(lodash.compact(data.Shielding_words).join("|"))
                if (reg.test(Title)) return e.reply("这里面有不好的词汇哦~", true)
            } else {
                if (data.Shielding_words.includes(Title)) return e.reply("这是有不好的词汇哦~", true)
            }
        }
        let res = await e.group.setTitle(e.user_id, Title)
        if (res) {
            if (!Title) {
                e.reply(`什么"(º Д º*)！没有头衔，哼把你的头衔吃掉！！！`, true)
            } else {
                e.reply(lodash.sample(msgs), true)
            }
        } else {
            e.reply('❎ 未知错误', true)
        }
    }

    //字符列表
    async qun_luckylist(e) {
        let data = await QQInterface.luckylist(e.group_id)
        if (!data) return e.reply('❎ 接口出现错误')
        if (data.retcode != 0) return e.reply('❎ 获取数据失败\n' + JSON.stringify(data))

        let msg = data.data.word_list.map((item, index) => {
            let { wording, word_id, word_desc } = item.word_info
            return `${index + 1}:${wording}-${word_id}\n寓意:${word_desc}`
        }).join("\n");
        e.reply(msg)
    }
    //抽幸运字符
    async qun_lucky(e) {
        let res = await QQInterface.drawLucky(e.group_id);

        if (!res) return e.reply('❎ 接口出现错误')
        if (res.retcode == 11004) return e.reply("今天已经抽过辣，明天再来抽取吧");
        if (res.retcode != 0) return e.reply('❎ 错误\n' + JSON.stringify(data))

        if (res.data.word_info) {
            let { wording, word_desc } = res.data.word_info.word_info
            e.reply(`恭喜您抽中了${wording}\n寓意为:${word_desc}`)
        } else {
            e.reply("恭喜您抽了中了个寂寞")
        }
    }
    //替换幸运字符
    async qun_luckyuse(e) {
        //判断是否有管理
        if (!e.group.is_admin && !e.group.is_owner) {
            return e.reply("做不到，怎么想我都做不到吧ヽ(≧Д≦)ノ", true);
        }
        let id = e.msg.replace(/#|替换(幸运)?字符/g, "");
        let res = await QQInterface.equipLucky(e.group_id, id)

        if (!res) return e.reply('❎ 接口出现错误')
        if (res.retcode != 0) return e.reply('❎替换失败\n' + JSON.stringify(res));
        e.reply('✅ OK')
    }

    //开启或关闭群字符
    async qun_luckyset(e) {
        if (!e.isMaster && !e.member.is_owner && !e.member.is_admin) {
            return e.reply("❎ 该命令仅限管理员可用", true);
        }
        let res = await QQInterface.swichLucky(e.group_id, /开启/.test(e.msg))
        if (!res) return e.reply('❎ 接口出现错误')

        if (res.retcode == 11111) return e.reply("❎ 重复开启或关闭")
        if (res.retcode != 0) return e.reply('❎ 错误\n' + JSON.stringify(res));
        e.reply('✅ OK')
    }

    //获取禁言列表
    async Mutelist(e) {
        if (!e.isMaster && !e.member.is_owner && !e.member.is_admin) {
            return e.reply("❎ 该命令仅限管理员可用", true);
        }
        let mutelist = await Gpadmin.getMuteList(e)
        if (!mutelist) return e.reply("还没有人被禁言欸(O∆O)")
        let msg = [];
        for (let i of mutelist) {
            let Member = e.group.pickMember(i)
            let { info } = Member
            msg.push([
                segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${info.user_id}`),
                `\n昵称：${info.card || info.nickname}\n`,
                `QQ：${info.user_id}\n`,
                `群身份：${ROLE_MAP[info.role]}\n`,
                `禁言剩余时间：${Cfg.getsecondformat(Member.mute_left)}`
            ])
        }
        Cfg.getforwardMsg(e, msg)
    }

    //解禁全部禁言
    async relieveAllMute(e) {
        //判断是否有管理
        if (!e.group.is_admin && !e.group.is_owner) {
            return e.reply("做不到，怎么想我都做不到吧ヽ(≧Д≦)ノ", true);
        }
        if (!e.isMaster && !e.member.is_owner && !e.member.is_admin) {
            return e.reply("❎ 该命令仅限管理员可用", true);
        }
        let mutelist = await Gpadmin.getMuteList(e)
        if (!mutelist) return e.reply("都没有人被禁言我怎么解的辣＼(`Δ’)／")
        for (let i of mutelist) {
            await e.group.muteMember(i, 0)
            await Cfg.sleep(2000)
        }
        e.reply("已经把全部的禁言解除辣╮( •́ω•̀ )╭")
    }

    //查看和清理多久没发言的人
    async noactive(e) {
        if (!e.isMaster && !e.member.is_owner) {
            return e.reply("❎ 该命令仅限群主和主人可用", true);
        }
        let Reg = noactivereg.exec(e.msg)
        Reg[2] = common.translateChinaNum(Reg[2] || 1)
        //确认清理直接执行
        if (Reg[1] == "确认清理") {
            if (!e.group.is_admin && !e.group.is_owner) {
                return e.reply("做不到，怎么想我都做不到吧ヽ(≧Д≦)ノ", true);
            }
            return Gpadmin.getclearnoactive(e, Reg[2], Reg[3])
        }
        //查看和清理都会发送列表
        let page = common.translateChinaNum(Reg[5] || 1)
        let msg = await Gpadmin.getnoactive(e, Reg[2], Reg[3], page)
        if (!msg) return
        //清理
        if (Reg[1] == "清理") {
            if (!e.group.is_admin && !e.group.is_owner) {
                return e.reply("做不到，怎么想我都做不到吧ヽ(≧Д≦)ノ", true);
            }
            let list = await Gpadmin.noactivelist(e, Reg[2], Reg[3])

            e.reply(`本此共需清理「${list.length}」人，防止误触发\n请发送：#确认清理${Reg[2]}${Reg[3]}没发言的人`)
        }
        Cfg.getforwardMsg(e, msg)
    }

    //查看和清理从未发言的人
    async neverspeak(e) {
        if (!e.isMaster && !e.member.is_owner) {
            return e.reply("❎ 该命令仅限群主和主人可用", true);
        }
        let list = await Gpadmin.getneverspeak(e)
        if (!list) return
        //确认清理直接执行
        if (/^#?确认清理/.test(e.msg)) {
            if (!e.group.is_admin && !e.group.is_owner) {
                return e.reply("做不到，怎么想我都做不到吧ヽ(≧Д≦)ノ", true);
            }
            let removelist = list.map(item => item.user_id)
            let msg = await Gpadmin.getkickMember(e, removelist)
            return Cfg.getforwardMsg(e, msg)
        }
        //清理
        if (/^#?清理/.test(e.msg)) {
            if (!e.group.is_admin && !e.group.is_owner) {
                return e.reply("做不到，怎么想我都做不到吧ヽ(≧Д≦)ノ", true);
            }
            e.reply(`本此共需清理「${list.length}」人，防止误触发\n请发送：#确认清理从未发言的人`)
        }
        //发送列表
        let num = e.msg.match(new RegExp(Numreg))
        num = num ? common.translateChinaNum(num[0]) : 1
        let listinfo = await Gpadmin.getneverspeakinfo(e, num)
        Cfg.getforwardMsg(e, listinfo)
    }

    //查看不活跃排行榜和入群记录
    async RankingList(e) {
        let num = e.msg.match(new RegExp(Numreg))
        num = num ? common.translateChinaNum(num[0]) : 10
        let msg = '';
        if (/(不活跃|潜水)/.test(e.msg)) {
            msg = await Gpadmin.InactiveRanking(e, num)
        } else {
            msg = await Gpadmin.getRecentlyJoined(e, num)
        }
        Cfg.getforwardMsg(e, msg)
    }
    //发送通知
    async Send_notice(e) {
        if (!e.group.is_admin && !e.group.is_owner) {
            return e.reply("做不到，怎么想我都做不到吧ヽ(≧Д≦)ノ", true);
        }
        if (!e.isMaster && !e.member.is_owner && !e.member.is_admin) {
            return e.reply("❎ 该命令仅限管理员可用", true);
        }
        e.message[0].text = e.message[0].text.replace("#发通知", "").trim()
        if (!e.message[0].text) e.message.shift()
        if (lodash.isEmpty(e.message)) return e.reply("❎ 通知不能为空")
        e.message.unshift(segment.at("all"))
        e.reply(e.message)
    }


    //设置定时群禁言
    async timeMute(e) {
        if (!e.isMaster) return false
        if (/任务/.test(e.msg)) {
            let task = await redis.keys('Yunzai:yenai:Taboo:*')
            if (!task.length) return e.reply('目前还没有定时禁言任务')
            let msglist = [`目前定时禁言任务有${task.length}个`]
            for (let i = 0; i < task.length; i++) {
                let data = JSON.parse(await redis.get(task[i]))
                msglist.push(`${i + 1}.\n群号:${data.groupNumber}\n禁言时间:${data.muteTime}\n解禁时间:${data.remTime}`)
            }
            Cfg.getforwardMsg(e, msglist)
            return true
        }
        if (/取消/.test(e.msg)) {
            let data = JSON.parse(await redis.get(`Yunzai:yenai:Taboo:${e.group_id}`))
            if (!data) return e.reply('这群目前没有定时禁言任务')
            await redis.del(`Yunzai:yenai:Taboo:${e.group_id}`)
            e.reply('此群定时禁言任务删除成功')
            return true
        }
        if (!e.group.is_admin && !e.group.is_owner) {
            return e.reply("做不到，怎么想我都做不到吧ヽ(≧Д≦)ノ", true);
        }
        try {
            var muteTime = e.msg.match(/禁言(\d+):(\d+)/)[0].replace(/禁言/g, '')
            var remTime = e.msg.match(/解禁(\d+):(\d+)/)[0].replace(/解禁/g, '')
            if (muteTime.length != 5 || remTime.length != 5) return e.reply('格式不对\n示范：#定时禁言00:00，解禁08:00')
        } catch (err) {
            logger.error(err)
            e.reply('格式不对\n示范：#定时禁言00:00，解禁08:00')
            return
        }

        if (muteTime == remTime) return e.reply('没事就吃溜溜梅')
        let data = {
            groupNumber: e.group_id,
            muteTime,
            remTime
        }
        await redis.set(`Yunzai:yenai:Taboo:${e.group_id}`, JSON.stringify(data))
        e.reply(`设置定时禁言成功，可发【#定时禁言任务】查看`)``
    }

    //谁是龙王
    async dragonKing(e) {
        //图片版
        let url = `https://qun.qq.com/interactive/honorlist?gc=${e.group_id}&type=1&_wv=3&_wwv=129`
        //数据版
        // let res = await QQInterface.dragon(e.group_id)
        e.reply([
            // `本群龙王：${res.name}`,
            // segment.image(res.avatar),
            // `蝉联天数：${res.desc}`,
            await Browser.Webpage(url, { "Cookie": Bot.cookies['qun.qq.com'] }, {
                width: 700,
                height: 700,
                deviceScaleFactor: 3
            }, true)
        ]);
    }

    /**群星级 */
    async Group_xj(e) {
        let result = await QQInterface.getCreditLevelInfo(e.group_id)
        if (!result) return e.reply("❎ 接口失效")
        if (result.ec != 0) return e.reply("❎ 查询错误\n" + JSON.stringify(result))
        let { uiGroupLevel, group_name, group_uin } = result.info
        let str = "⭐"
        str = str.repeat(uiGroupLevel)
        e.reply([
            `群名：${group_name}\n`,
            `群号：${group_uin}\n`,
            `群星级：${str}`
        ])
    }

    //群发言榜单
    async SpeakRank(e) {
        if (!e.group.is_admin && !e.group.is_owner) {
            return e.reply("做不到，怎么想我都做不到吧ヽ(≧Д≦)ノ", true);
        }
        //图片截图
        let url = `https://qun.qq.com/m/qun/activedata/speaking.html?gc=${e.group_id}&time=${/(7|七)天/.test(e.msg) ? 1 : 0}&_wv=3&&_wwv=128`
        //接口数据
        let res = await QQInterface.SpeakRank(e.group_id, /(7|七)天/.test(e.msg) ? 1 : 0)
        if (!res) return e.reply("接口失效辣！！！")
        if (res.retcode != 0) return e.reply("❎ 未知错误\n" + JSON.stringify(res))
        let msg = lodash.take(res.data.speakRank.map((item, index) =>
            `${index + 1}:${item.nickname}-${item.uin}\n连续活跃${item.active}天:发言${item.msgCount}次`
        ), 10).join("\n");
        e.reply([
            ...msg,
            await Browser.Webpage(url, {
                "Cookie":
                    Bot.cookies['qun.qq.com']
            }, {
                width: 700,
                height: 700,
                deviceScaleFactor: 3
            }, true)
        ])
    }

    //今日打卡
    async DaySigned(e) {
        let res = await QQInterface.signInToday(e.group_id)

        if (!res) return e.reply("❎ 出错辣，请稍后重试")
        if (res.retCode != 0) return e.reply("❎ 未知错误\n" + JSON.stringify(res));

        let list = res.response.page[0]
        if (list.total == 0) return e.reply("今天还没有人打卡哦(￣▽￣)\"")
        //发送消息
        let msg = list.infos.map((item, index) => `${index + 1}:${item.uidGroupNick}-${item.uid}\n打卡时间:${moment(item.signedTimeStamp * 1000).format("YYYY-MM-DD HH:mm:ss")}`).join("\n");
        e.reply(msg)
    }
}
