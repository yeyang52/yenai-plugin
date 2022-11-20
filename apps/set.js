import plugin from '../../../lib/plugins/plugin.js'
import fs from "fs";
import lodash from "lodash";
import { Config, render } from '../components/index.js'
import { YamlReader } from '../model/index.js';
const configs = {
    "好友消息": "privateMessage",
    "群消息": "groupMessage",
    "群临时消息": "grouptemporaryMessage",
    "群撤回": "groupRecall",
    "好友撤回": "PrivateRecall",
    // 申请通知
    "好友申请": "friendRequest",
    "群邀请": "groupInviteRequest",
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
    "陌生人点赞":"Strangers_love"
}

let rediskey = `yenai:proxy`
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
                    fnc: 'Config_manage'
                },
                {
                    reg: deltimereg,
                    fnc: 'Config_deltime'
                },
                {
                    reg: '^#椰奶设置$',
                    fnc: 'yenaiset'
                },
                {
                    reg: '^#椰奶(启用|禁用)全部通知$',
                    fnc: 'SetAll'
                },
                {
                    reg: '^#椰奶更换代理[1234]$',
                    fnc: 'proxy'
                },
                {
                    reg: '^#(增加|减少|查看)头衔屏蔽词.*$',
                    fnc: 'NoTitle'
                },
                {
                    reg: '^#切换头衔屏蔽词匹配(模式)?$',
                    fnc: 'NoTitlepattern'
                }
            ]
        })
        this.NoTitlepath = './plugins/yenai-plugin/config/config/Shielding_words.yaml'
    }

    //初始化
    async init() {
        if (!await redis.get(rediskey)) {
            await redis.set(rediskey, "i.pixiv.re")
        }
    }

    // 更改配置
    async Config_manage(e) {
        if (!e.isMaster) return
        // 解析消息
        let regRet = managereg.exec(e.msg)
        let index = regRet[1]
        let yes = regRet[2] == "开启" ? true : false
        // 处理
        Config.modify("whole", configs[index], yes)
        //单独处理
        if (index == "涩涩pro" && yes) {
            Config.modify("whole", "sese", yes)
        }
        if (index == "涩涩" && !yes) {
            Config.modify("whole", "sesepro", yes)
        }
        this.yenaiset(e)
        return true;
    }

    // 设置删除缓存时间
    async Config_deltime(e) {
        if (!e.isMaster) return

        let time = deltimereg.exec(e.msg)[1]

        if (time < 120) return e.reply('❎ 时间不能小于两分钟')

        Config.modify("whole", `deltime`, Number(time[0]))

        this.yenaiset(e)

        return true;
    }
    //修改设置
    async SetAll(e) {
        if (!e.isMaster) return
        let yes = false;
        if (/启用/.test(e.msg)) {
            yes = true;
        }
        let no = ["sese", "deltime", "notificationsAll", "state", "sesepro"]

        if (yes) {
            for (let i in configs) {
                if (no.includes(configs[i])) continue
                Config.modify("whole", configs[i], yes)
            }
        } else {
            for (let i in configs) {
                if (no.includes(configs[i])) continue
                Config.modify("whole", configs[i], yes)
            }
        }
        this.yenaiset(e)
        return true;
    }
    //渲染发送图片
    async yenaiset(e) {
        if (!e.isMaster) return

        let config = await Config.Notice

        let cfg = {
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
            //删除缓存时间
            deltime: Number(config.deltime),
            //默认状态
            state: getStatus(config.state),

            bg: await rodom(), //获取底图
        }
        //渲染图像
        return await render("admin/index", {
            ...cfg,
        }, {
            e,
            scale: 2.0
        });
    }

    //更换代理
    async proxy(e) {
        if (/1/.test(e.msg)) {
            await redis.set(rediskey, "i.pixiv.re")
                .then(() => e.reply("✅ 已经切换代理为1"))
                .catch(err => console.log(err))
        } else if (/2/.test(e.msg)) {
            await redis.set(rediskey, "proxy.pixivel.moe")
                .then(() => e.reply("✅ 已经切换代理为2"))
                .catch(err => console.log(err))
        } else if (/3/.test(e.msg)) {
            await redis.set(rediskey, "px2.rainchan.win")
                .then(() => e.reply("✅ 已经切换代理为3"))
                .catch(err => console.log(err))
        } else if (/4/.test(e.msg)) {
            await redis.set(rediskey, "sex.nyan.xyz")
                .then(() => e.reply("✅ 已经切换代理为4"))
                .catch(err => console.log(err))
        }
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
    //修改匹配模式
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

