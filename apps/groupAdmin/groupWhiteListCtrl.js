import { common } from "../../model/index.js"
import { Config, Log_Prefix } from "../../components/index.js"

export class GroupWhiteListCtrl extends plugin {
  constructor() {
    super({
      name: "椰奶群管-黑白名单",
      event: "message.group",
      priority: 500,
      rule: [
        {
          reg: "^#?群管(加|删)(白|黑)(名单)?",
          fnc: "addList"
        },
        {
          reg: "^#?(开启|关闭)白名单(自动)?解禁",
          fnc: "noBan"
        }
      ]
    })
  }

  accept(e) {
    if (!common.checkPermission(e, "all", "admin", { isReply: false })) return
    if (Config.groupAdmin.blackQQ.includes(e.user_id)) {
      e.group.kickMember(e.user_id)
    }
  }

  /**
   * 加黑白名单
   * @param e
   * @param custom
   * @param operation
   * @param model
   */
  async addList(e, custom, operation, model) {
    if (!common.checkPermission(e, "admin", "admin")) return

    operation ||= /加/.test(e.msg) ? "add" : "del"
    model ||= /黑/.test(e.msg) ? "blackQQ" : "whiteQQ"
    let type = model === "blackQQ" ? "黑" : "白"
    let qq = custom || e.at || (e.msg.match(/\d+/)?.[0] || "")
    qq = Number(qq) || String(qq)

    if (!qq) return this.reply(`❎ 请艾特或输入需要加${type}的QQ`)

    const list = Config.groupAdmin[model]
    const isWhite = list.includes(qq)

    if (isWhite && operation === "add") return this.reply(`❎ 此人已在群管${type}名单内`)
    if (!isWhite && operation === "del") return this.reply(`❎ 此人未在群管${type}名单中`)

    Config.modifyArr("groupAdmin", model, qq, operation)
    this.reply(`✅ 已${operation === "add" ? "加入" : "删除"}${qq}到群管${type}名单`)
  }

  /**
   * 开关白名单自动解禁
   */
  async noBan() {
    if (!common.checkPermission(this.e, "master")) return
    let type = !!/开启/.test(this.e.msg)

    const { noBan } = Config.groupAdmin
    if (noBan && type) return this.reply("❎ 白名单自动解禁已处于开启状态")
    if (!noBan && !type) return this.reply("❎ 白名单自动解禁已处于关闭状态")

    Config.modify("groupAdmin", "noBan", type)
    this.reply(`✅ 已${type ? "开启" : "关闭"}白名单自动解禁`)
  }
}

Bot.on("notice.group.ban", async(e) => {
  const bot = e.bot ?? Bot
  /** 处理白名单禁言 */
  const { groupAdmin } = Config
  const isMaster = Config.masterQQ?.includes(e.operator_id) || e.operator_id === bot.uin
  const isWhiteUser = groupAdmin.whiteQQ.includes(e.user_id)

  if (
    isWhiteUser &&
        !isMaster &&
        groupAdmin.noBan &&
        (e.group.is_admin || e.group.is_owner) &&
        e.duration !== 0
  ) {
    await e.group.muteMember(e.user_id, 0)
    e.reply("已解除白名单用户的禁言")
  }
})

Bot.on("request.group.add", async(e) => {
  if (!common.checkPermission(e, "all", "admin", { isReply: false })) return
  if (Config.groupAdmin.blackQQ.includes(e.user_id)) {
    e.approve(false)
    logger.info(`${Log_Prefix} 已拒绝黑马单${e.user_id}的入群申请`)
  }
})

Bot.on("notice.group.increase", async(e) => {
  if (!common.checkPermission(e, "all", "admin", { isReply: false })) return
  if (Config.groupAdmin.blackQQ.includes(e.user_id)) {
    logger.info(`${Log_Prefix} 检测到黑马单${e.user_id}加入${e.group_id}，已踢出`)
    e.group.kickMember(e.user_id)
    e.reply(`⚠ 检测到黑马单${e.user_id}入群，已自动踢出`)
  }
})
