import plugin from '../../../lib/plugins/plugin.js'
import { createRequire } from "module"

/**
 * 全局
 */
const require = createRequire(import.meta.url)
const { exec } = require("child_process")
const _path = process.cwd()
let timer
/**
 * 管理员
 */
export class admin extends plugin {
    constructor() {
        super({
            name: "管理|更新插件",
            dsc: "管理和更新代码",
            event: "message",
            priority: 400,
            rule: [
                {
                    reg: "^#椰奶(插件)?(强制)?更新",
                    fnc: "checkout",
                }
            ],
        });
        this.key = "yenai:restart";
    }


    async init() {
        let restart = await redis.get(this.key);
        if (restart) {
            restart = JSON.parse(restart);
            if (restart.isGroup) {
                Bot.pickGroup(restart.id).sendMsg("重启成功，新版椰奶插件已经生效");
            } else {
                Bot.pickUser(restart.id).sendMsg("重启成功，新版椰奶插件已经生效");
            }
            redis.del(this.key);
        }
    }


    async checkout() {
        if (!this.e.isMaster) {
            return;
        }
        let e = this.e;
        const isForce = this.e.msg.includes("强制");
        let command = "git  pull";
        if (isForce) {
            command = "git fetch --all && git reset --hard master && git  pull";
            e.reply("正在执行强制更新操作，请稍等");
        } else {
            e.reply("正在执行更新操作，请稍等");
        }
        const that = this;
        exec(
            command,
            { cwd: `${_path}/plugins/yenai-plugin/` },
            function (error, stdout, stderr) {
                if (/(Already up[ -]to[ -]date|已经是最新的)/.test(stdout)) {
                    e.reply("目前已经是最新版椰奶插件了~");
                    return;
                }
                if (error) {
                    e.reply(
                        "椰奶插件更新失败！\nError code: " +
                        error.code +
                        "\n" +
                        error.stack +
                        "\n 请稍后重试。"
                    );
                    return;
                }
                e.reply("椰奶插件更新成功，正在尝试重新启动Yunzai以应用更新...");
                timer && clearTimeout(timer);
                timer = setTimeout(async () => {
                    try {
                        let data = JSON.stringify({
                            isGroup: !!that.e.isGroup,
                            id: that.e.isGroup ? that.e.group_id : that.e.user_id,
                        });
                        await redis.set(that.key, data, { EX: 120 });
                        let cm = "npm run start";
                        if (process.argv[1].includes("pm2")) {
                            cm = "npm run restart";
                        } else {
                            e.reply("当前为前台运行，重启将转为后台...");
                        }

                        exec(cm, (error, stdout, stderr) => {
                            if (error) {
                                redis.del(that.key);
                                e.reply(
                                    "自动重启失败，请手动重启以应用新版椰奶插件。\nError code: " +
                                    error.code +
                                    "\n" +
                                    error.stack +
                                    "\n"
                                );
                                logger.error(`重启失败\n${error.stack}`);
                            } else if (stdout) {
                                logger.mark("重启成功，运行已转为后台");
                                logger.mark("查看日志请用命令：npm run log");
                                logger.mark("停止后台运行命令：npm stop");
                                process.exit();
                            }
                        });
                    } catch (error) {
                        redis.del(this.key);
                        let err = error.stack ?? error;
                        e.reply("重启云崽操作失败！\n" + err);
                    }
                }, 1000);
            }
        );
        return true;
    }
}


