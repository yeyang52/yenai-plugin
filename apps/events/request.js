import cfg from "../../../../lib/config/config.js"
import { common } from "../../model/index.js"
import { Config, Log_Prefix } from "../../components/index.js"
const ROLE_MAP = {
  admin: "群管理",
  owner: "群主",
  member: "群员"
}

Bot.on?.("request", async(e) => {
  let msg = ""
  const _cfg = Config.getNotice(e.self_id, e.group_id)
  switch (e.request_type) {
    case "group":
      switch (e.sub_type) {
        // 群邀请
        case "invite":
          if (!_cfg.groupInviteRequest) return false
          if (cfg.masterQQ.includes(e.user_id)) return false
          logger.info(`${Log_Prefix}邀请机器人进群`)
          msg = [
            segment.image(`https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/0`),
            `[通知(${e.self_id}) - 邀请机器人进群]\n`,
              `目标群号：${e.group_id}\n`,
              `目标群名：${e.group_name || "未知"}\n`,
              `邀请人账号：${e.user_id}\n`,
              `邀请人昵称：${e.nickname || "未知"}\n`,
              `邀请人群身份：${ROLE_MAP[e.role] || "未知"}\n`
          ]
          redis.set(`yenai:groupInvite:${e.group_id}_${e.user_id}`, JSON.stringify({
            user_id: e.user_id,
            group_id: e.group_id,
            flag: e.flag,
            sub_type: e.sub_type
          }), { EX: 3600 })
          if (cfg.other.autoQuit <= 0) {
            msg.push("----------------\n可引用该消息回复\"同意\"或\"拒绝\"")
          } else {
            msg.push("Tip：已被 Yunzai 自动处理")
          }
          break
        case "add":
          // 发送至群的通知
          if (Config.groupAdmin.groupAddNotice.openGroup.includes(e.group_id)) {
            let msg = [
              `${Config.groupAdmin.groupAddNotice.msg}\n`,
              segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${e.user_id}`),
              `QQ号：${e.user_id}\n`,
              `昵称：${e.nickname}\n`,
              `${e.comment}`
            ]
            if (e.inviter_id !== undefined) { msg.push(`邀请人：${e.inviter_id}`) }
            let sendmsg = await (e.bot ?? Bot).pickGroup(e.group_id).sendMsg(msg)
            await redis.set(`yenai:groupAdd:${sendmsg.message_id}`, e.user_id, { EX: 3600 })
          }
          if (!_cfg.addGroupApplication) return false
          logger.info(`${Log_Prefix}加群申请`)
          msg = [
            segment.image(`https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/0`),
            `[通知(${e.self_id}) - 加群申请]\n`,
              `群号：${e.group_id}\n`,
              `群名：${e.group_name}\n`,
              `账号：${e.user_id}\n`,
              `昵称：${e.nickname}`,
              e.tips ? `\nTip：${e.tips}` : "",
              `\n${e.comment}`
          ]
          break
      }
      break
    case "friend":
      if (!_cfg.friendRequest) return false
      logger.info(`${Log_Prefix}好友申请`)
      msg = [
        segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${e.user_id}`),
        `[通知(${e.self_id}) - 添加好友申请]\n`,
          `申请人账号：${e.user_id}\n`,
          `申请人昵称：${e.nickname || "未知"}\n`,
          `申请来源：${e.source || "未知"}\n`,
          `附加信息：${e.comment || "无附加信息"}\n`
      ]
      redis.set(`yenai:friendRequest:${e.user_id}`, JSON.stringify({
        user_id: e.user_id,
        flag: e.flag
      }), { EX: 3600 })
      if (cfg.other.autoFriend == 1) {
        msg.push("Tip：已被 Yunzai 自动处理")
      } else {
        msg.push(
            `-------------\n可回复：#同意好友申请${e.user_id} \n或引用该消息回复"同意"或"拒绝"`
        )
      }
      break
  }
  await common.sendMasterMsg(msg, (e.bot ?? Bot).uin)
})
