import plugin from '../../../lib/plugins/plugin.js'
import fetch from 'node-fetch'
import Cfg from '../model/Config.js';
import { Config } from '../components/index.js'

export class Basics extends plugin {
    constructor() {
        super({
            name: '基础群管',
            event: 'message',
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
                    reg: '^#?我要自闭.*$',
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
            ]
        })
        this.path = "./plugins/xiaoxue-plugin"
    }
    async help(e) {
        if (!e.isMaster && !e.member.is_owner && !e.member.is_admin) return
        let msg = [
            "#禁言 <@群员> <时间> \n",
            "#解禁 <@群员> \n",
            "#全体禁言 \n",
            "#全体解禁 \n",
            "#允许匿名 \n",
            "#禁止匿名 \n",
            "#踢 <@群员> \n",
            "#我要自闭 <时间> \n",
            "#设置管理 <@群员> \n",
            "#取消管理 <@群员> \n",
            "#发群公告 <内容> \n",
            "#查群公告 \n",
            "#删群公告 <序号> \n",
            "Tip:@群员可以用QQ号代替\n踢群员防止误触发必须加#"
        ]
        e.reply(msg)
    }
    /**禁言 */
    async Taboo(e) {
        if (!e.isGroup) return;

        //判断是否有管理
        if (!Bot.pickGroup(e.group_id).is_admin && !Bot.pickGroup(e.group_id).is_owner) {
            return e.reply("做不到，怎么想我都做不到吧！！！");
        }

        if (!e.isMaster && !e.member.is_owner && !e.member.is_admin) return e.reply("❎ 该命令仅限管理员可用", true);

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
        if (!e.isGroup) return;

        //判断是否有管理
        if (!Bot.pickGroup(e.group_id).is_admin && !Bot.pickGroup(e.group_id).is_owner) {
            return e.reply("做不到，怎么想我都做不到吧！！！");
        }

        if (!e.isMaster && !e.member.is_owner && !e.member.is_admin) return e.reply("❎ 该命令仅限管理员可用", true);

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
        if (!e.isGroup) return;
        //判断是否有管理
        if (!Bot.pickGroup(e.group_id).is_admin && !Bot.pickGroup(e.group_id).is_owner) {
            return e.reply("做不到，怎么想我都做不到吧！！！");
        }
        if (!e.isMaster && !e.member.is_owner && !e.member.is_admin) return e.reply("❎ 该命令仅限管理员可用", true);

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
        if (!e.isGroup) return
        //判断是否有管理
        if (!Bot.pickGroup(e.group_id).is_admin && !Bot.pickGroup(e.group_id).is_owner) {
            return e.reply("做不到，怎么想我都做不到吧！！！");
        }
        if (!e.isMaster && !e.member.is_owner && !e.member.is_admin) return e.reply("❎ 该命令仅限管理员可用", true);
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
        if (!e.isGroup) return
        //判断是否有管理
        if (!Bot.pickGroup(e.group_id).is_admin && !Bot.pickGroup(e.group_id).is_owner) return

        if (e.member.is_admin || e.member.is_owner || e.isMaster)
            return e.reply("别自闭啦~~", true)

        let msg = e.msg.replace(/#|我要自闭/g, "").trim()
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
        e.reply(`那我就不手下留情了~`);
        return true;

    }

    //设置管理
    async SetAdmin(e) {
        if (!Bot.pickGroup(e.group_id).is_owner) return e.reply("呜呜呜，人家做不到>_<")

        if (!e.isMaster) return e.reply("❎ 该命令仅限主人可用", true);

        if (!Bot.pickGroup(e.group_id).is_owner) return e.reply("做不到，怎么想我都做不到吧！！！");

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
        if (!e.isMaster && !e.member.is_owner && !e.member.is_admin) return e.reply("❎ 该命令仅限管理员可用", true);
        let yes = false
        if (/(允许|开启)匿名/.test(e.msg)) {
            yes = true
        }
        //判断是否有管理
        if (!Bot.pickGroup(e.group_id).is_admin && !Bot.pickGroup(e.group_id).is_owner) {
            return e.reply("做不到，怎么想我都做不到吧！！！");
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
        if (!e.isMaster && !e.member.is_owner && !e.member.is_admin) return e.reply("❎ 该命令仅限管理员可用", true);
        let msg = e.msg.replace(/#|发群公告/g, "").trim()

        if (!msg) return e.reply("❎ 公告不能为空");

        //判断是否有管理
        if (!Bot.pickGroup(e.group_id).is_admin && !Bot.pickGroup(e.group_id).is_owner) {
            return e.reply("做不到，怎么想我都做不到吧！！！");
        }
        let ck = Cfg.getck()
        let url = `http://xiaobai.klizi.cn/API/qqgn/gg_send.php?data=&skey=${ck.skey}&pskey=${ck.p_skey}&uin=${Bot.uin}&group=${e.group_id}&text=${msg}`
        console.log(url);
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
        if (!e.isMaster && !e.member.is_owner && !e.member.is_admin) return e.reply("❎ 该命令仅限管理员可用", true);

        if (/查群公告/.test(e.msg)) {
            let res = await this.getAnnouncelist(e.group_id)
            if (res) await e.reply(res)
            return;
        }
        if (!Bot.pickGroup(e.group_id).is_admin && !Bot.pickGroup(e.group_id).is_owner) {
            return e.reply("做不到，怎么想我都做不到吧！！！");
        }
        let msg = e.msg.replace(/#|删群公告/, "").trim()

        if (!msg) return e.reply(`❎ 序号不可为空`)

        msg = msg.match(/\d/)

        if (!msg) return e.reply(`❎ 请检查序号是否正确`)

        let ck = Cfg.getck()

        let list = await this.getAnnouncelist(e.group_id, msg)

        let url = `http://xiaobai.klizi.cn/API/qqgn/gg_delete.php?data=&skey=${ck.skey}&pskey=${ck.p_skey}&uin=${Bot.uin}&group=${e.group_id}&fid=${list.fid}`

        let result = await fetch(url).then(res => res.json())
            .catch(err => console.log(err))

        if (!result) return e.reply("❎ 接口出错")
        if (result.ec == 0) {
            e.reply("✅ 已删除这个公告哦~")
        } else {
            e.reply("❎ 删除失败")
        }

    }
    //获取群公告
    async getAnnouncelist(group, item = "") {

        let ck = Cfg.getck()

        let url = `http://xiaobai.klizi.cn/API/qqgn/qun_gg.php?data=&skey=${ck.skey}&pskey=${ck.p_skey}&uin=${Bot.uin}&group=${group}&n=${item}`

        let result = await fetch(url).then(res => res.text()).catch(err => console.log(err))

        if (!result) return false

        if (item) {
            return JSON.parse(result)
        } else {
            return result
        }

    }
}