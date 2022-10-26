import plugin from '../../../lib/plugins/plugin.js'
import fetch from 'node-fetch'
import Cfg from '../model/Config.js';
import { Config } from '../components/index.js'
import admin from '../model/Group_admin.js';

export class Basics extends plugin {
    constructor() {
        super({
            name: '基础群管',
            event: 'message.group',
            priority: 500,
            rule: [
                {
                    reg: '^#群管帮助$',
                    fnc: 'help'
                },
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
                    reg: '^#?我要(自闭|禅定).*$',
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
                    fnc: 'Announce'
                },
                {
                    reg: '^#查群公告$',
                    fnc: 'DelAnnounce'
                },
                {
                    reg: '^#删群公告.*$',
                    fnc: 'DelAnnounce'
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

            ]
        })
    }
    async help(e) {
        if (!e.isMaster && !e.member.is_owner && !e.member.is_admin) return
        let msg = [[
            "#禁言 <@QQ> <时间> \n",
            "#解禁 <@QQ> \n",
            "#全体禁言 \n",
            "#全体解禁 \n",
            "#允许匿名 \n",
            "#禁止匿名 \n",
            "#踢 <@QQ> \n",
            "#我要自闭 <时间> \n",
            "#设置管理 <@QQ> \n",
            "#取消管理 <@QQ> \n",
            "#发群公告 <内容> \n",
            "#查群公告 \n",
            "#删群公告 <序号> \n",
            "#申请头衔 <头衔>\n",
            "#修改头衔 <@QQ> <头衔>\n",
            "#幸运字符列表\n",
            "#抽幸运字符\n",
            "#替换幸运字符+(id)\n",
            "#开启|关闭幸运字符\n",
            "Tip:@群员可以用QQ号代替"
        ]]
        Cfg.getforwardMsg(e, msg)
    }
    /**禁言 */
    async Taboo(e) {

        //判断是否有管理
        if (!e.group.is_admin && !e.group.is_owner) {
            return e.reply("做不到，怎么想我都做不到吧！！！", true);
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
        //判断是否有这个人
        let memberMap = await e.group.getMemberMap();
        memberMap = Array.from(memberMap.keys());
        if (!memberMap.includes(Number(qq))) return e.reply("❎ 这个群没有这个人哦~");
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
        e.reply(`已把${e.group.pickMember(qq).card}扔进了小黑屋~`);
        return true;

    }
    /**解禁 */
    async Relieve(e) {
        //判断是否有管理
        if (!e.group.is_admin && !e.group.is_owner) {
            return e.reply("做不到，怎么想我都做不到吧！！！", true);
        }

        if (!e.isMaster && !e.member.is_owner && !e.member.is_admin) {
            return e.reply("❎ 该命令仅限管理员可用", true);
        }

        let qq = e.message[0].text.replace(/#|解禁/g, "").trim();

        if (e.message[1]) {
            qq = e.message[1].qq;
        } else {
            qq = qq.match(/[1-9]\d*/g);
        }

        if (!(/\d{5,}/.test(qq))) return e.reply("❎ 请输入正确的QQ号");
        //判断是否有这个人
        let memberMap = await e.group.getMemberMap();
        memberMap = Array.from(memberMap.keys());
        if (!memberMap.includes(Number(qq))) return e.reply("❎ 这个群没有这个人哦~");


        await e.group.muteMember(qq, 0)
        e.reply(`轻轻的把${e.group.pickMember(qq).card}从小黑屋揪了出来~`);
        return true;

    }
    /**全体禁言 */
    async TabooAll(e) {
        //判断是否有管理
        if (!e.group.is_admin && !e.group.is_owner) {
            return e.reply("做不到，怎么想我都做不到吧！！！", true);
        }
        if (!e.isMaster && !e.member.is_owner && !e.member.is_admin) {
            return e.reply("❎ 该命令仅限管理员可用", true);
        }

        let res = false;
        if (/全体禁言/.test(e.msg)) res = true;


        await e.group.muteAll(res)
        if (res) {
            e.reply("全都不准说话了哦~")
        } else {
            e.reply("好耶！！可以说话啦~")
        }
        return true
    }
    //踢群员 防止误触发必须加#号
    async Kick(e) {
        //判断是否有管理
        if (!e.group.is_admin && !e.group.is_owner) {
            return e.reply("做不到，怎么想我都做不到吧！！！", true);
        }
        if (!e.isMaster && !e.member.is_owner && !e.member.is_admin) {
            return e.reply("❎ 该命令仅限管理员可用", true);
        }
        let qq = e.message[0].text.replace(/#|踢/g, "").trim()

        if (e.message[1]) {
            qq = e.message[1].qq
        } else {
            qq = qq.match(/[1-9]\d*/g)
        }
        if (!(/\d{5,}/.test(qq))) return e.reply("❎ 请输入正确的QQ号");
        //判断是否有这个人
        let memberMap = await e.group.getMemberMap()
        memberMap = Array.from(memberMap.keys())
        if (!memberMap.includes(Number(qq))) return e.reply("❎ 这个群没有这个人哦~")


        await e.group.kickMember(qq)
        e.reply("已把这个坏淫踢掉惹！！！")
        return true

    }

    //我要自闭
    async Autistic(e) {
        //判断是否有管理
        if (!e.group.is_admin && !e.group.is_owner) return

        if (e.member.is_admin || e.member.is_owner || e.isMaster)
            return e.reply("别自闭啦~~", true)

        let msg = e.msg.replace(/#|我要自闭|禅定/g, "").trim()

        let TabooTime = msg.match(/[1-9]\d*/g);

        let Company = msg.match(/(天|时|分)/g);
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

        if (e.message[1]) {
            qq = e.message[1].qq;
        } else {
            qq = qq.match(/[1-9]\d*/g);
        }

        if (!(/\d{5,}/.test(qq))) return e.reply("❎ 请输入正确的QQ号");
        //判断是否有这个人
        let memberMap = await e.group.getMemberMap();
        memberMap = Array.from(memberMap.keys());
        if (!memberMap.includes(Number(qq))) return e.reply("❎ 这个群没有这个人哦~");

        await e.group.setAdmin(qq, yes)
        if (yes) {
            e.reply(`已经把${e.group.pickMember(qq).card}设置为管理啦！！`)
        } else {
            e.reply(`${e.group.pickMember(qq).card}的管理已经被我吃掉啦~`)
        }
    }

    //匿名
    async AllowAnony(e) {

        if (!e.isMaster && !e.member.is_owner && !e.member.is_admin) {
            return e.reply("❎ 该命令仅限管理员可用", true);
        }
        //判断是否有管理
        if (!e.group.is_admin && !e.group.is_owner) {
            return e.reply("做不到，怎么想我都做不到吧！！！", true);
        }
        let yes = false
        if (/(允许|开启)匿名/.test(e.msg)) {
            yes = true
        }

        await e.group.allowAnony(yes)
        if (yes) {
            e.reply("已把匿名开启了哦，可以藏起来了~")
        } else {
            e.reply("已关闭匿名，小贼们不准藏了~")
        }
        return true;
    }

    //发群公告
    async Announce(e) {

        if (!e.isMaster && !e.member.is_owner && !e.member.is_admin) {
            return e.reply("❎ 该命令仅限管理员可用", true);
        }
        //判断是否有管理
        if (!e.group.is_admin && !e.group.is_owner) {
            return e.reply("做不到，怎么想我都做不到吧！！！", true);
        }
        let msg = e.msg.replace(/#|发群公告/g, "").trim()

        if (!msg) return e.reply("❎ 公告不能为空");

        let ck = Cfg.getck("qun.qq.com")

        let url = `http://xiaobai.klizi.cn/API/qqgn/gg_send.php?data=&skey=${ck.skey}&pskey=${ck.p_skey}&uin=${Bot.uin}&group=${e.group_id}&text=${msg}`

        let result = await fetch(url).then(res => res.json()).catch(err => console.log(err))
        if (!result) return e.reply("❎ 接口出错")

        if (result.ec == 0) {
            e.reply("✅ 已发送群公告，群员们要好好看哦~")
        } else {
            e.reply("❎ 发送失败")
        }
        return true;

    }

    //查群公告+删群公告
    async DelAnnounce(e) {
        if (!e.isMaster && !e.member.is_owner && !e.member.is_admin) {
            return e.reply("❎ 该命令仅限管理员可用", true);
        }

        if (/查群公告/.test(e.msg)) {
            let res = await admin.getAnnouncelist(e)
            if (!res) return;
            await e.reply(res)
            return;
        }

        let msg = e.msg.replace(/#|删群公告/, "").trim()

        if (!msg) return e.reply(`❎ 序号不可为空`)

        msg = msg.match(/\d/)

        if (!msg) return e.reply(`❎ 请检查序号是否正确`)

        let ck = Cfg.getck("qun.qq.com")

        let list = await admin.getAnnouncelist(e, msg)

        if (!list) return;

        let url = `http://xiaobai.klizi.cn/API/qqgn/gg_delete.php?data=&skey=${ck.skey}&pskey=${ck.p_skey}&uin=${Bot.uin}&group=${e.group_id}&fid=${list.fid}`

        let result = await fetch(url).then(res => res.json())
            .catch(err => console.log(err))

        if (!result) return e.reply("接口失效辣！！！")
        if (result.ec == 0) {
            e.reply("✅ 已删除这个公告哦~")
        } else {
            e.reply("❎ 删除失败")
        }

    }

    //修改头衔
    async adminsetTitle(e) {
        if (e.message[1].type != 'at') return

        if (!e.group.is_owner) return e.reply("做不到，怎么想我都做不到吧！！！", true)

        if (!e.isMaster) {
            return e.reply("❎ 该命令仅限主人可用", true);
        }

        await e.group.setTitle(e.message[1].qq, e.message[2].text)

        e.reply(`已经把这个小可爱的头衔设置为${e.message[2].text}辣`)
    }
    //申请头衔
    async SetGroupSpecialTitle(e) {
        if (!e.group.is_owner) return e.reply("做不到，怎么想我都做不到吧！！！", true)

        let Title = e.msg.replace(/#|申请头衔/g, "")

        await e.group.setTitle(e.user_id, Title)

        e.reply(`嗯！不戳的头衔哦~`, true)
    }

    //字符列表
    async qun_luckylist(e) {
        e.reply(await admin.getqun_lucky(e))
    }
    //抽幸运字符
    async qun_lucky(e) {
        e.reply(await admin.getqun_lucky(e, true))
    }
    //替换幸运字符
    async qun_luckyuse(e) {
        //判断是否有管理
        if (!e.group.is_admin && !e.group.is_owner) {
            return e.reply("做不到，怎么想我都做不到吧！！！", true);
        }
        let id = e.msg.replace(/#|替换(幸运)?字符/g, "");
        e.reply(await admin.getqun_luckyuse(e, id))
    }
    //开启或关闭群字符
    async qun_luckyset(e) {
        if (!e.isMaster && !e.member.is_owner && !e.member.is_admin) {
            return e.reply("❎ 该命令仅限管理员可用", true);
        }
        let type = 1;
        if (/关闭/.test(e.msg)) {
            type = 2;
        }
        e.reply(await admin.setluckyuse(e, type), true)
    }

    //今日打卡
    async DaySigned(e) {
        e.reply(await admin.getSigned(e))
    }

}