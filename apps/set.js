import plugin from '../../../lib/plugins/plugin.js'
import fs from "fs";
import lodash from "lodash";
import { Config } from '../components/index.js'
import { YamlReader, setu, puppeteer } from '../model/index.js';
const configs = {
    "好友消息": "privateMessage",
    "群消息": "groupMessage",
    "群临时消息": "grouptemporaryMessage",
    "群撤回": "groupRecall",
    "好友撤回": "PrivateRecall",
    // 申请通知
    "好友申请": "friendRequest",
    "群邀请": "groupInviteRequest",
    "加群申请": 'addGroupApplication',
    // 信息变动
    "群管理变动": "groupAdminChange",
    // 列表变动
    "好友列表变动": "friendNumberChange",
    "群聊列表变动": "groupNumberChange",
    "群成员变动": "groupMemberNumberChange",
    // 其他通知
    "闪照": "flashPhoto",
    "禁言": "botBeenBanned",

    "全部通知": "notificationsAll",
    "删除缓存": "deltime",
    "涩涩": "sese",
    "状态": "state",
    "涩涩pro": "sesepro",
    "陌生人点赞": "Strangers_love",
    //给有问题的用户关闭定时器
    "状态任务": "statusTask"
}

let deltimereg = new RegExp('^#椰奶设置删除缓存时间(\\d+)秒?$')
let managereg = new RegExp(`^#椰奶设置(${Object.keys(configs).join("|")})(开启|关闭)$`)
export class NewConfig extends plugin {
    constructor() {
        super({
            name: '椰奶配置',
            event: 'message',
            priority: 100,
            rule: [
                {
                    reg: managereg,
                    fnc: 'Config_manage',
                    permission: 'master'
                },
                {
                    reg: deltimereg,
                    fnc: 'Config_deltime',
                    permission: 'master'
                },
                {
                    reg: '^#椰奶设置$',
                    fnc: 'yenaiset',
                    permission: 'master'
                },
                {
                    reg: '^#椰奶(启用|禁用)全部通知$',
                    fnc: 'SetAll',
                    permission: 'master'
                },
                {
                    reg: '^#椰奶更换代理[1234]$',
                    fnc: 'proxy',
                    permission: 'master'
                },
                {
                    reg: '^#(增加|减少|查看)头衔屏蔽词.*$',
                    fnc: 'NoTitle',
                    permission: 'master'
                },
                {
                    reg: '^#切换头衔屏蔽词匹配(模式)?$',
                    fnc: 'NoTitlepattern',
                    permission: 'master'
                },
                {
                    reg: '^#查看(sese|涩涩)设置$',
                    fnc: 'View_Settings',
                    permission: 'master'
                }
            ]
        })
        this.NoTitlepath = './plugins/yenai-plugin/config/config/Shielding_words.yaml'
        this.rediskey = `yenai:proxy`
    }

    //初始化
    async init() {
        if (!await redis.get(this.rediskey)) {
            await redis.set(this.rediskey, "i.pixiv.re")
        }
    }

    // 更改配置
    async Config_manage(e) {
        // 解析消息
        let regRet = managereg.exec(e.msg)
        let index = regRet[1]
        let yes = regRet[2] == "开启" ? true : false
        // 处理
        Config.modify("whole", configs[index], yes)
        //单独处理
        if (index == "涩涩pro" && yes) Config.modify("whole", "sese", yes)

        if (index == "涩涩" && !yes) Config.modify("whole", "sesepro", yes)

        if (index == "涩涩" || index == "涩涩pro") return this.View_Settings(e)
        this.yenaiset(e)
        return true;
    }

    // 设置删除缓存时间
    async Config_deltime(e) {
        let time = deltimereg.exec(e.msg)[1]

        if (time < 120) return e.reply('❎ 时间不能小于两分钟')

        Config.modify("whole", `deltime`, Number(time[0]))

        this.yenaiset(e)

        return true;
    }
    //修改全部设置
    async SetAll(e) {
        let yes = /启用/.test(e.msg);
        //设置的任务
        let type = [
            "privateMessage",
            "groupMessage",
            "grouptemporaryMessage",
            "groupRecall",
            "PrivateRecall",
            "friendRequest",
            "groupInviteRequest",
            'addGroupApplication',
            "groupAdminChange",
            "friendNumberChange",
            "groupNumberChange",
            "groupMemberNumberChange",
            "flashPhoto",
            "botBeenBanned",
        ]

        for (let i in configs) {
            if (!type.includes(configs[i])) continue
            Config.modify("whole", configs[i], yes)
        }

        this.yenaiset(e)
        return true;
    }
    //渲染发送图片
    async yenaiset(e) {

        let config = await Config.Notice
        let data = {
            //好友消息
            privateMessage: getStatus(config.privateMessage),
            //群消息
            groupMessage: getStatus(config.groupMessage),
            //群临时消息
            grouptemporaryMessage: getStatus(config.grouptemporaryMessage),
            //群撤回
            groupRecall: getStatus(config.groupRecall),
            //好友撤回
            PrivateRecall: getStatus(config.PrivateRecall),
            //好友申请
            friendRequest: getStatus(config.friendRequest),
            //群邀请
            groupInviteRequest: getStatus(config.groupInviteRequest),
            //加群申请
            addGroupApplication: getStatus(config.addGroupApplication),
            //群管理变动
            groupAdminChange: getStatus(config.groupAdminChange),
            //好友列表变动
            friendNumberChange: getStatus(config.friendNumberChange),
            //群聊列表变动
            groupNumberChange: getStatus(config.groupNumberChange),
            //群成员变动
            groupMemberNumberChange: getStatus(config.groupMemberNumberChange),
            //闪照
            flashPhoto: getStatus(config.flashPhoto),
            //禁言
            botBeenBanned: getStatus(config.botBeenBanned),
            //全部通知
            notificationsAll: getStatus(config.notificationsAll),
            //陌生人点赞
            Strangers_love: getStatus(config.Strangers_love),
            //删除缓存时间
            deltime: Number(config.deltime),
            //默认状态
            state: getStatus(config.state),
            //状态任务定时器
            statusTask: getStatus(config.statusTask),

            bg: await rodom(), //获取底图
        }
        //渲染图像
        return await puppeteer.render("admin/index", {
            ...data,
        }, {
            e,
            scale: 2.0
        });
    }

    //更换代理
    async proxy(e) {
        let type = e.msg.match(/\d/) - 1
        let proxy = [
            "i.pixiv.re",
            "proxy.pixivel.moe",
            "px2.rainchan.win",
            "sex.nyan.xyz"
        ]
        logger.mark(`[椰奶proxy]切换为${proxy[type]}`)
        await redis.set(this.rediskey, proxy[type])
            .then(() => e.reply(`✅ 已经切换代理为「${proxy[type]}」`))
            .catch(err => console.log(err))
    }
    //查看涩涩设置
    async View_Settings(e) {
        let set = setu.getSeSeConfig(e)
        let data = Config.Notice
        e.reply([
            e.group_id ? `群${e.group_id}涩涩设置：\n` : `私聊涩涩设置：\n`,
            `sese：${data.sese ? "✅" : "❎"}\n`,
            `sesepro：${data.sesepro ? "✅" : "❎"}\n`,
            `R17.9 + 0.1：${set.r18 ? "✅" : "❎"}\n`,
            `CD：${set.cd}s`,
            set.recall ? `\n撤回：${set.recall}s` : ""
        ])
    }

    //增删查头衔屏蔽词
    async NoTitle(e) {
        let getdata = new YamlReader(this.NoTitlepath)
        let data = getdata.jsonData.Shielding_words
        if (/查看/.test(e.msg)) {
            return e.reply(`现有的头衔屏蔽词如下：${data.join("\n")}`)
        }
        let msg = e.msg.replace(/#|(增加|减少)头衔屏蔽词/g, "").trim().split(",")
        let type = /增加/.test(e.msg) ? true : false
        let no = [], yes = []
        for (let i of msg) {
            if (data.includes(i)) {
                no.push(i)
            } else {
                yes.push(i)
            }
        }
        no = lodash.compact(lodash.uniq(no))
        yes = lodash.compact(lodash.uniq(yes))
        if (type) {
            if (!lodash.isEmpty(yes)) {
                for (let i of yes) {
                    getdata.addIn("Shielding_words", i)
                }
                e.reply(`✅ 成功添加：${yes.join(",")}`)
            }
            if (!lodash.isEmpty(no)) {
                e.reply(`❎ 以下词已存在：${no.join(",")}`)
            }
        } else {
            if (!lodash.isEmpty(no)) {
                for (let i of no) {
                    let index = data.indexOf(i)
                    getdata.delete("Shielding_words." + index)
                }
                e.reply(`✅ 成功删除：${no.join(",")}`)
            }
            if (!lodash.isEmpty(yes)) {
                e.reply(`❎ 以下词未在屏蔽词中：${yes.join(",")}`)
            }
        }
    }
    //修改头衔匹配模式
    async NoTitlepattern(e) {
        let getdata = new YamlReader(this.NoTitlepath)
        let data = getdata.jsonData.Match_pattern
        if (data) {
            getdata.set("Match_pattern", 0)
            e.reply("✅ 已修改匹配模式为精确匹配")
        } else {
            getdata.set("Match_pattern", 1)
            e.reply("✅ 已修改匹配模式为模糊匹配")
        }
    }
}

//随机底图
const rodom = async function () {
    var image = fs.readdirSync(`./plugins/yenai-plugin/resources/admin/imgs/bg`);
    var list_img = [];
    for (let val of image) {
        list_img.push(val)
    }
    var imgs = list_img.length == 1 ? list_img[0] : list_img[lodash.random(0, list_img.length - 1)];
    return imgs;
}

const getStatus = function (rote) {
    if (rote) {
        return `<div class="cfg-status" >已开启</div>`;
    } else {
        return `<div class="cfg-status status-off">已关闭</div>`;
    }

}

