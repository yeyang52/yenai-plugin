import plugin from '../../../lib/plugins/plugin.js'
import { segment } from 'oicq'
import lodash from 'lodash'
import { Config } from '../components/index.js'
import { GroupAdmin as gd, common, QQInterface, puppeteer, CronValidate } from '../model/index.js'
import moment from 'moment'


//API请求错误文案
const API_ERROR = "❎ 出错辣，请稍后重试"
//无管理文案
const ROLE_ERROR = "做不到，怎么想我都做不到吧ヽ(≧Д≦)ノ"
//权限不足文案
const Permission_ERROR = "❎ 该命令仅限管理员可用"
//正则
const Numreg = "[一壹二两三四五六七八九十百千万亿\\d]+"
const TimeUnitReg = Object.keys(common.Time_unit).join("|")
const noactivereg = new RegExp(`^#(查看|清理|确认清理|获取)(${Numreg})个?(${TimeUnitReg})没发言的人(第(${Numreg})页)?$`)
const Autisticreg = new RegExp(`^#?我要(自闭|禅定)(${Numreg})?个?(${TimeUnitReg})?$`, "i")
//获取定时任务
const redisTask = await gd.getRedisMuteTask() || false;
export class Basics extends plugin {
    constructor() {
        super({
            name: '椰奶基础群管',
            event: 'message.group',
            priority: 500,
            rule: [
                {
                    reg: '^#禁言.*$',
                    fnc: 'Taboo',
                },
                {
                    reg: '^#解禁(\\d+)?$',
                    fnc: 'Relieve',
                },
                {
                    reg: '^#全体(禁言|解禁)$',
                    fnc: 'TabooAll',
                },
                {
                    reg: '^#踢(\\d+)?$',
                    fnc: 'Kick',
                },
                {
                    reg: '^#(设置|取消)管理(\\d+)?$',
                    fnc: 'SetAdmin',
                },
                {
                    reg: '^#(允许|禁止|开启|关闭)匿名$',
                    fnc: 'AllowAnony',
                },
                {
                    reg: '^#发群公告.*$',
                    fnc: 'AddAnnounce',
                },
                {
                    reg: '^#删群公告(\\d+)$',
                    fnc: 'DelAnnounce',
                },
                {
                    reg: '^#查群公告$',
                    fnc: 'GetAnnounce',
                },
                {
                    reg: '^#修改头衔.*$',
                    fnc: 'adminsetTitle',
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
                    fnc: 'qun_luckyuse',
                },
                {
                    reg: '^#(开启|关闭)(幸运)?字符$',
                    fnc: 'qun_luckyset',
                },
                {
                    reg: '^#(获取|查看)?禁言列表$',
                    fnc: 'Mutelist',
                },
                {
                    reg: '^#解除全部禁言$',
                    fnc: 'relieveAllMute',
                },
                {
                    reg: `^#(查看|(确认)?清理)从未发言过?的人(第(${Numreg})页)?$`,
                    fnc: 'neverspeak',
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
                    reg: noactivereg,//清理多久没发言的人
                    fnc: 'noactive',
                },
                {
                    reg: `^#发通知.*$`,
                    fnc: 'Send_notice',
                },
                {
                    reg: `^#(设置)?定时(禁言|解禁)(.*)$|^#定时禁言任务$|^#取消定时(禁言|解禁)$`,
                    fnc: 'timeMute',
                },
                {
                    reg: `^#(查看|获取)?群?发言(榜单|排行)((7|七)天)?`,
                    fnc: 'SpeakRank'
                },
                {
                    reg: "^#?(谁|哪个吊毛|哪个屌毛|哪个叼毛)是龙王$",
                    fnc: 'dragonKing'
                },
                {
                    reg: '^#群星级$',
                    fnc: 'Group_xj'
                },
                {
                    reg: '^#群数据((7|七)天)?$',
                    fnc: 'groupData'
                },
                {
                    reg: '^#今日打卡$',
                    fnc: 'DaySigned'
                },
                {
                    reg: Autisticreg,//我要自闭
                    fnc: 'Autistic'
                },
                {
                    reg: '^#((今|昨|前|明|后)天|\\d{4}-\\d{1,2}-\\d{1,2})谁生日$',
                    fnc: 'groupBirthday'
                }
            ]
        })
        this.task = redisTask
    }

    /**禁言 */
    async Taboo(e) {
        //判断权限
        if (!e.member.is_admin && !e.member.is_owner && !e.isMaster) return e.reply(Permission_ERROR)
        //判断是否有管理
        if (!e.group.is_admin && !e.group.is_owner) return e.reply(ROLE_ERROR, true);

        let qq = e.message.find(item => item.type == 'at')?.qq
        let TabooTime = 5;
        let Company = 300;
        //判断有无@
        if (!qq) {
            let regRet = e.msg.match(new RegExp(`#禁言\\s?(\\d+)\\s(${Numreg})?(${TimeUnitReg})?`));
            if (!regRet) return e.reply("❎ 请检查指令格式是否正确");
            //处理消息
            if (!regRet[1]) return e.reply("❎ 未取得QQ号请检查指令格式");
            qq = regRet[1]
            // 获取数字
            TabooTime = common.translateChinaNum(regRet[2] || 5)
            //获取单位
            Company = common.Time_unit[lodash.toUpper(regRet[3]) || "分"]

        } else {
            TabooTime = common.translateChinaNum(e.msg.match(new RegExp(Numreg)) || 5)
            Company = common.Time_unit[lodash.toUpper(e.msg.match(new RegExp(TimeUnitReg))) || "分"]
        }
        if (!(/\d{5,}/.test(qq))) return e.reply("❎ 请输入正确的QQ号");
        //判断是否为主人
        if (Config.masterQQ?.includes(Number(qq))) {
            e.reply("居然调戏主人！！！哼，坏蛋(ﾉ｀⊿´)ﾉ");
            return e.group.muteMember(e.user_id, 300);
        }
        let Memberinfo = e.group.pickMember(Number(qq)).info
        //判断是否有这个人
        if (!Memberinfo) return e.reply("❎ 这个群没有这个人哦~", true)
        //特殊处理
        if (Memberinfo.role === 'owner') {
            e.reply("调戏群主拖出去枪毙5分钟(。>︿<)_θ", true)
            return e.group.muteMember(e.user_id, 300);
        }
        if (Memberinfo.role === 'admin') {
            if (!e.group.is_owner) return e.reply("人家又不是群主这种事做不到的辣！", true)
            if (!e.isMaster && !e.member.is_owner) return e.reply("这个淫系管理员辣，只有主淫和群主才可以干ta", true)
        }
        console.log(qq, TabooTime * Company);
        await e.group.muteMember(qq, TabooTime * Company);
        e.reply(`已把「${Memberinfo.card || Memberinfo.nickname}」扔进了小黑屋( ･_･)ﾉ⌒●~*`, true);
        return true;
    }
    /**解禁 */
    async Relieve(e) {
        //判断权限
        if (!e.member.is_admin && !e.member.is_owner && !e.isMaster) return e.reply(Permission_ERROR)
        //判断是否有管理
        if (!e.group.is_admin && !e.group.is_owner) return e.reply(ROLE_ERROR, true);

        let qq = e.message.find(item => item.type == "at")?.qq
        if (!qq) qq = e.msg.replace(/#|解禁/g, "").trim();

        if (!qq || !(/\d{5,}/.test(qq))) return e.reply("❎ 请输入正确的QQ号");

        let Member = e.group.pickMember(Number(qq))
        //判断是否有这个人
        if (!Member.info) return e.reply("❎ 这个群没有这个人哦~");

        await e.group.muteMember(qq, 0)
        e.reply(`已把「${Member.card || Member.nickname}」从小黑屋揪了出来(｡>∀<｡)`, true);
    }
    /**全体禁言 */
    async TabooAll(e) {
        //判断权限
        if (!e.member.is_admin && !e.member.is_owner && !e.isMaster) return e.reply(Permission_ERROR)
        //判断是否有管理
        if (!e.group.is_admin && !e.group.is_owner) return e.reply(ROLE_ERROR, true);

        let type = /全体禁言/.test(e.msg)
        let res = await e.group.muteAll(type)
        if (!res) return e.reply("❎ 未知错误", true)
        type ? e.reply("全都不准说话了哦~") : e.reply("好耶！！可以说话啦~")
    }
    //踢群员
    async Kick(e) {
        //判断权限
        if (!e.member.is_admin && !e.member.is_owner && !e.isMaster) return e.reply(Permission_ERROR)
        // 判断是否有管理
        if (!e.group.is_admin && !e.group.is_owner) return e.reply(ROLE_ERROR, true);

        let qq = e.message.find(item => item.type == "at")?.qq
        if (!qq) qq = e.msg.replace(/#|踢/g, "").trim()

        if (!qq || !(/\d{5,}/.test(qq))) return e.reply("❎ 请输入正确的QQ号");
        //判断是否为主人
        if (Config.masterQQ?.includes(Number(qq))) {
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
        res ? e.reply("已把这个坏淫踢掉惹！！！", true) : e.reply("额...踢出失败哩，可能这个淫比较腻害>_<", true)
    }

    //我要自闭
    async Autistic(e) {
        //判断是否有管理
        if (!e.group.is_admin && !e.group.is_owner) return

        if (e.isMaster) return e.reply("别自闭啦~~", true)
        if (e.member.is_admin && !e.group.is_owner) return e.reply("别自闭啦~~", true)
        //解析正则
        let regRet = Autisticreg.exec(e.msg)
        // 获取数字
        let TabooTime = common.translateChinaNum(regRet[2] || 5)

        let Company = common.Time_unit[lodash.toUpper(regRet[3]) || "分"]

        await e.group.muteMember(e.user_id, TabooTime * Company);
        e.reply(`那我就不手下留情了~`, true);
    }

    //设置管理
    async SetAdmin(e) {
        //判断权限
        if (!e.isMaster) return e.reply(Permission_ERROR)
        if (!e.group.is_owner) return e.reply(ROLE_ERROR, true)

        let qq = e.message.find(item => item.type == "at")?.qq
        let type = /设置管理/.test(e.msg)
        if (!qq) qq = e.msg.replace(/#|(设置|取消)管理/g, "").trim();

        if (!qq || !(/\d{5,}/.test(qq))) return e.reply("❎ 请输入正确的QQ号");
        let Member = e.group.pickMember(Number(qq))
        //判断是否有这个人
        if (!Member.info) return e.reply("❎ 这个群没有这个人哦~");

        let res = await e.group.setAdmin(qq, type)
        let name = Member.card || Member.nickname
        if (!res) return e.reply(`❎ 未知错误`)
        type ? e.reply(`已经把「${name}」设置为管理啦！！`) : e.reply(`「${name}」的管理已经被我吃掉啦~`)
    }

    //匿名
    async AllowAnony(e) {
        //判断权限
        if (!e.member.is_admin && !e.member.is_owner && !e.isMaster) return e.reply(Permission_ERROR)
        //判断是否有管理
        if (!e.group.is_admin && !e.group.is_owner) return e.reply(ROLE_ERROR, true);

        let type = /(允许|开启)匿名/.test(e.msg)
        let res = await e.group.allowAnony(type)
        if (!res) return e.reply("❎ 未知错误", true)
        type ? e.reply("已把匿名开启了哦，可以藏起来了~") : e.reply("已关闭匿名，小贼们不准藏了~")
    }

    //发群公告
    async AddAnnounce(e) {
        //判断权限
        if (!e.member.is_admin && !e.member.is_owner && !e.isMaster) return e.reply(Permission_ERROR)
        //判断是否有管理
        if (!e.group.is_admin && !e.group.is_owner) {
            return e.reply(ROLE_ERROR, true);
        }
        //获取发送的内容
        let msg = e.msg.replace(/#|发群公告/g, "").trim()
        if (!msg) return e.reply("❎ 公告不能为空");

        let result = await QQInterface.setAnnounce(e.group_id, msg)

        if (!result) return e.reply(API_ERROR);
        if (result.ec != 0) {
            e.reply("❎ 发送失败\n" + JSON.stringify(result, null, '\t'))
        }
    }
    //查群公告
    async GetAnnounce(e) {
        let res = await QQInterface.getAnnouncelist(e.group_id)
        if (!res) return e.reply(API_ERROR);
        return e.reply(res)
    }
    //删群公告
    async DelAnnounce(e) {
        //判断权限
        if (!e.member.is_admin && !e.member.is_owner && !e.isMaster) return e.reply(Permission_ERROR)
        //判断是否有管理
        if (!e.group.is_admin && !e.group.is_owner) {
            return e.reply(ROLE_ERROR, true);
        }
        let msg = e.msg.replace(/#|删群公告/, "").trim()
        if (!msg) return e.reply(`❎ 序号不可为空`)

        let result = await QQInterface.delAnnounce(e.group_id, msg)
        if (!result) return e.reply(API_ERROR);

        if (result.ec == 0) {
            e.reply(`✅ 已删除「${result.text}」`)
        } else {
            e.reply("❎ 删除失败\n" + JSON.stringify(result, null, '\t'))
        }

    }

    //修改头衔
    async adminsetTitle(e) {
        if (!e.isMaster) return e.reply(Permission_ERROR)

        if (e.message.length < 2) return

        if (e.message[1].type != 'at') return

        if (!e.group.is_owner) return e.reply(ROLE_ERROR, true)

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
        if (!e.group.is_owner) return false;

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
        if (!res) return e.reply('❎ 未知错误', true)

        if (!Title) return e.reply(`什么"(º Д º*)！没有头衔，哼把你的头衔吃掉！！！`, true)

        e.reply(lodash.sample(msgs), true)
    }

    //字符列表
    async qun_luckylist(e) {
        let data = await QQInterface.luckylist(e.group_id)
        if (!data) return e.reply(API_ERROR)
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

        if (!res) return e.reply(API_ERROR)
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
        if (!e.member.is_admin && !e.member.is_owner && !e.isMaster) return e.reply(Permission_ERROR)
        //判断是否有管理
        if (!e.group.is_admin && !e.group.is_owner) {
            return e.reply(ROLE_ERROR, true);
        }
        let id = e.msg.replace(/#|替换(幸运)?字符/g, "");
        let res = await QQInterface.equipLucky(e.group_id, id)

        if (!res) return e.reply(API_ERROR)
        if (res.retcode != 0) return e.reply('❎替换失败\n' + JSON.stringify(res));
        e.reply('✅ OK')
    }

    //开启或关闭群字符
    async qun_luckyset(e) {
        if (!e.member.is_admin && !e.member.is_owner && !e.isMaster) return e.reply(Permission_ERROR)

        let res = await QQInterface.swichLucky(e.group_id, /开启/.test(e.msg))
        if (!res) return e.reply(API_ERROR)

        if (res.retcode == 11111) return e.reply("❎ 重复开启或关闭")
        if (res.retcode != 0) return e.reply('❎ 错误\n' + JSON.stringify(res));
        e.reply('✅ OK')
    }

    //获取禁言列表
    async Mutelist(e) {
        let mutelist = await gd.getMuteList(e.group_id)
        if (!mutelist) return e.reply("还没有人被禁言欸(O∆O)")
        let msg = [];
        for (let i of mutelist) {
            let Member = e.group.pickMember(i)
            let { info } = Member
            msg.push([
                segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${info.user_id}`),
                `\n昵称：${info.card || info.nickname}\n`,
                `QQ：${info.user_id}\n`,
                `群身份：${common.ROLE_MAP[info.role]}\n`,
                `禁言剩余时间：${common.getsecondformat(Member.mute_left)}`
            ])
        }
        common.getforwardMsg(e, msg)
    }

    //解除全部禁言
    async relieveAllMute(e) {
        if (!e.member.is_admin && !e.member.is_owner && !e.isMaster) return e.reply(Permission_ERROR)
        //判断是否有管理
        if (!e.group.is_admin && !e.group.is_owner) return e.reply(ROLE_ERROR, true);
        let res = await gd.releaseAllMute(e.group_id)
        e.reply(res ? "已经把全部的禁言解除辣╮( •́ω•̀ )╭" : "都没有人被禁言我怎么解的辣＼(`Δ’)／")
    }

    //查看和清理多久没发言的人
    async noactive(e) {
        if (!e.member.is_admin && !e.member.is_owner && !e.isMaster) return e.reply(Permission_ERROR)
        let Reg = noactivereg.exec(e.msg)
        Reg[2] = common.translateChinaNum(Reg[2] || 1)
        //确认清理直接执行
        if (Reg[1] == "确认清理") {
            if (!e.group.is_admin && !e.group.is_owner) return e.reply(ROLE_ERROR, true);
            let msg = gd.clearNoactive(e.group_id, Reg[2], Reg[3])
            return common.getforwardMsg(e, msg)
        }
        //查看和清理都会发送列表
        let page = common.translateChinaNum(Reg[5] || 1)
        let msg = await gd.getNoactiveInfo(e.group_id, Reg[2], Reg[3], page)
        if (msg?.error) return e.reply(msg.error)
        //清理
        if (Reg[1] == "清理") {
            if (!e.group.is_admin && !e.group.is_owner) return e.reply(ROLE_ERROR, true);
            let list = await gd.noactiveList(e.group_id, Reg[2], Reg[3])
            e.reply(`本此共需清理「${list.length}」人，防止误触发\n请发送：#确认清理${Reg[2]}${Reg[3]}没发言的人`)
        }
        common.getforwardMsg(e, msg)
    }

    //查看和清理从未发言的人
    async neverspeak(e) {
        if (!e.member.is_admin && !e.member.is_owner && !e.isMaster) return e.reply(Permission_ERROR)
        let list = await gd.getNeverSpeak(e.group_id)
        if (!list) return e.reply(`咋群全是好淫哦~全都发过言辣٩(๑•̀ω•́๑)۶`)
        //确认清理直接执行
        if (/^#?确认清理/.test(e.msg)) {
            if (!e.group.is_admin && !e.group.is_owner) return e.reply(ROLE_ERROR, true);
            e.reply("我要开始清理了哦，这可能需要一点时间٩(๑•ㅂ•)۶")
            let msg = await gd.BatchKickMember(e.group_id, list.map(item => item.user_id))
            return common.getforwardMsg(e, msg)
        }
        //清理
        if (/^#?清理/.test(e.msg)) {
            if (!e.group.is_admin && !e.group.is_owner) {
                return e.reply(ROLE_ERROR, true);
            }
            e.reply(`本此共需清理「${list.length}」人，防止误触发\n请发送：#确认清理从未发言的人`)
        }
        //发送列表
        let page = e.msg.match(new RegExp(Numreg))
        page = page ? common.translateChinaNum(page[0]) : 1
        let listInfo = await gd.getNeverSpeakInfo(e.group_id, page)
        if (listInfo.error) return e.reply(listInfo.error);
        common.getforwardMsg(e, listInfo)
    }

    //查看不活跃排行榜和入群记录
    async RankingList(e) {
        let num = e.msg.match(new RegExp(Numreg))
        num = num ? common.translateChinaNum(num[0]) : 10
        let msg = '';
        if (/(不活跃|潜水)/.test(e.msg)) {
            msg = await gd.InactiveRanking(e.group_id, num)
        } else {
            msg = await gd.getRecentlyJoined(e.group_id, num)
        }
        common.getforwardMsg(e, msg)
    }
    //发送通知
    async Send_notice(e) {
        if (!e.member.is_admin && !e.member.is_owner && !e.isMaster) return e.reply(Permission_ERROR)
        if (!e.group.is_admin && !e.group.is_owner) return e.reply(ROLE_ERROR, true);

        e.message[0].text = e.message[0].text.replace("#发通知", "").trim()
        if (!e.message[0].text) e.message.shift()
        if (lodash.isEmpty(e.message)) return e.reply("❎ 通知不能为空")
        e.message.unshift(segment.at("all"))
        e.reply(e.message)
    }


    //设置定时群禁言
    async timeMute(e) {
        if (!e.member.is_admin && !e.member.is_owner && !e.isMaster) return e.reply(Permission_ERROR)
        let type = /禁言/.test(e.msg)
        if (/任务/.test(e.msg)) {
            let task = gd.getMuteTask()
            if (!task.length) return e.reply('目前还没有定时禁言任务')
            return common.getforwardMsg(e, task)
        }
        if (/取消/.test(e.msg)) {
            gd.delMuteTask(e.group_id, type)
            return e.reply(`已取消本群定时${type ? "禁言" : "解禁"}`)
        }
        if (!e.group.is_admin && !e.group.is_owner) return e.reply(ROLE_ERROR, true);

        let RegRet = e.msg.match(/定时(禁言|解禁)((\d{1,2})(:|：)(\d{1,2})|.*)/)
        console.log(RegRet);
        if (!RegRet || !RegRet[2]) return e.reply(`格式不对\n示范：#定时${type ? "禁言" : "解禁"}00:00 或 #定时${type ? "禁言" : "解禁"} + cron表达式`)
        let cron = ''
        if (RegRet[3] && RegRet[5]) {
            cron = `0 ${RegRet[5]} ${RegRet[3]} * * ?`
        } else {
            cron = RegRet[2]
            //校验cron表达式
            let Validate = CronValidate(cron.trim())
            if (Validate !== true) return e.reply(Validate)
        }

        let res = await gd.setMuteTask(e.group_id, cron, type)

        res ?
            e.reply(`✅设置定时禁言成功，可发【#定时禁言任务】查看`) :
            e.reply(`❎ 该群定时${type ? "禁言" : "解禁"}已存在不可重复设置`)

    }

    //谁是龙王
    async dragonKing(e) {
        //浏览器截图
        let screenshot = await puppeteer.Webpage({
            url: `https://qun.qq.com/interactive/honorlist?gc=${e.group_id}&type=1&_wv=3&_wwv=129`,
            headers: { "Cookie": Bot.cookies['qun.qq.com'] },
            font: true
        })
        if (screenshot) return e.reply(screenshot)
        //数据版
        let res = await QQInterface.dragon(e.group_id)
        if (!res) return e.reply(API_ERROR)
        e.reply([
            `本群龙王：${res.nick}`,
            segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${res.uin}`),
            `蝉联天数：${res.avatar_size}`,
        ]);
    }

    /**群星级 */
    async Group_xj(e) {
        let screenshot = await puppeteer.Webpage({
            url: `https://qqweb.qq.com/m/business/qunlevel/index.html?gc=${e.group_id}&from=0&_wv=1027`,
            cookie: common.getck('qqweb.qq.com', true),
            emulate: "QQTheme",
            font: true,
        })
        if (screenshot) return e.reply(screenshot)
        //出错后发送数据
        let result = await QQInterface.getCreditLevelInfo(e.group_id)
        if (!result) return e.reply(API_ERROR)
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
        if (!e.group.is_admin && !e.group.is_owner) return e.reply(ROLE_ERROR, true);

        //图片截图
        let screenshot = await puppeteer.Webpage({
            url: `https://qun.qq.com/m/qun/activedata/speaking.html?gc=${e.group_id}&time=${/(7|七)天/.test(e.msg) ? 1 : 0}`,
            headers: { "Cookie": Bot.cookies['qun.qq.com'] },
            font: true
        })
        if (screenshot) return e.reply(screenshot)
        //出错后发送文字数据
        let res = await QQInterface.SpeakRank(e.group_id, /(7|七)天/.test(e.msg))
        if (!res) return e.reply(API_ERROR)
        if (res.retcode != 0) return e.reply("❎ 未知错误\n" + JSON.stringify(res))
        let msg = lodash.take(res.data.speakRank.map((item, index) =>
            `${index + 1}:${item.nickname}-${item.uin}\n连续活跃${item.active}天:发言${item.msgCount}次`
        ), 10).join("\n");
        e.reply(msg)
    }

    //今日打卡
    async DaySigned(e) {
        //浏览器截图
        let screenshot = await puppeteer.Webpage({
            url: `https://qun.qq.com/v2/signin/list?gc=${e.group_id}`,
            emulate: "iPhone 6",
            cookie: common.getck('qun.qq.com', true),
            font: true
        })
        if (screenshot) return e.reply(screenshot)
        //出错后使用接口
        let res = await QQInterface.signInToday(e.group_id)
        if (!res) return e.reply(API_ERROR)
        if (res.retCode != 0) return e.reply("❎ 未知错误\n" + JSON.stringify(res));

        let list = res.response.page[0]
        if (list.total == 0) return e.reply("今天还没有人打卡哦(￣▽￣)\"")
        //发送消息
        let msg = list.infos.map((item, index) => `${index + 1}:${item.uidGroupNick}-${item.uid}\n打卡时间:${moment(item.signedTimeStamp * 1000).format("YYYY-MM-DD HH:mm:ss")}`).join("\n");
        e.reply(msg)
    }

    //查看某天谁生日
    async groupBirthday(e) {
        let date = e.msg.match(/^#?(今天|昨天|明天|后天|\d{4}-\d{1,2}-\d{1,2})谁生日$/)[1]
        if (date == '昨天') {
            date = moment().subtract(1, 'days').format("YYYY-MM-DD");
        } else if (date == '前天') {
            date = moment().subtract(2, 'days').format("YYYY-MM-DD");
        } else if (date == '明天') {
            date = moment().add(1, 'days').format("YYYY-MM-DD");
        } else if (date == '后天') {
            date = moment().add(2, 'days').format("YYYY-MM-DD");
        } else if (date == '今天') {
            date = moment().format("YYYY-MM-DD");
        }
        e.reply(
            await puppeteer.Webpage({
                url: `https://qun.qq.com/qqweb/m/qun/calendar/detail.html?_wv=1031&_bid=2340&src=3&gc=${e.group_id}&type=2&date=${date}`,
                cookie: common.getck('qun.qq.com', true),
                emulate: "iPhone 6",
                font: true
            })
        )
    }

    //群数据
    async groupData(e) {
        if (!e.group.is_admin && !e.group.is_owner) return e.reply(ROLE_ERROR, true);

        //浏览器截图
        let screenshot = await puppeteer.Webpage({
            url: `https://qun.qq.com/m/qun/activedata/active.html?_wv=3&_wwv=128&gc=${e.group_id}&src=2`,
            cookie: common.getck('qun.qq.com', true),
            click: /(7|七)天/.test(e.msg) ? [
                {
                    selector: "#app > div.tabbar > div.tabbar__time > div.tabbar__time__date",
                    time: 500,
                },
                {
                    selector: "#app > div.tabbar > div.tabbar__date-selector > div > div:nth-child(3)",
                    time: 1000,
                }
            ] : false,
            font: true
        })
        if (screenshot) return e.reply(screenshot)
        //数据
        let res = await QQInterface.groupData(e.group_id, /(7|七)天/.test(e.msg))
        if (!res) return e.reply(API_ERROR)
        if (res.retcode != 0) return e.reply(res.msg || JSON.stringify(res))
        let { groupInfo, activeData, msgInfo, joinData, exitData, applyData } = res.data
        e.reply(
            [
                `${groupInfo.groupName}(${groupInfo.groupCode})${/(7|七)天/.test(e.msg) ? "七天" : "昨天"}的群数据\n`,
                `------------消息条数---------\n`,
                `消息条数：${msgInfo.total}\n`,
                `------------活跃人数---------\n`,
                `活跃人数：${activeData.activeData}\n`,
                `总人数：${activeData.groupMember}\n`,
                `活跃比例：${activeData.ratio}%\n`,
                `-----------加退群人数--------\n`,
                `申请人数：${joinData.total}\n`,
                `入群人数：${applyData.total}\n`,
                `退群人数：${exitData.total}\n`,
            ]
        )
    }

}
