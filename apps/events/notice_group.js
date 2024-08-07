import { common } from "../../model/index.js"
import { Config } from "../../components/index.js"
import moment from "moment"
import formatDuration from "../../tools/formatDuration.js"

Bot.on?.("notice.group", async(e) => {
  const bot = e.bot ?? Bot
  let msg
  let forwardMsg
  switch (e.sub_type) {
    case "increase": {
      if (e.user_id === bot.uin) {
        if (!Config.getAlone(e.self_id, e.group_id).groupNumberChange) return false

        logger.info("[Yenai-Plugin]新增群聊")

        msg = [
          segment.image(`https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/100`),
          `[通知(${e.self_id}) - 新增群聊]\n`,
            `新增群号：${e.group_id}`
        ]
      } else {
        if (!Config.getAlone(e.self_id, e.group_id).groupMemberNumberChange) return false

        logger.info("[Yenai-Plugin]新增群员")

        msg = [
          segment.image(`https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/100`),
          `[通知(${e.self_id}) - 新增群员]\n`,
            `群号：${e.group_id}\n`,
            `新成员账号：${e.user_id}\n`,
            `新成员昵称：${e.nickname}`
        ]
      }
      break
    }
    case "decrease": {
      if (e.dismiss) {
        if (!Config.getAlone(e.self_id, e.group_id).groupNumberChange) return false

        logger.info("[Yenai-Plugin]群聊被解散")

        msg = [
          segment.image(
              `https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/100`
          ),
          `[通知(${e.self_id}) - 群聊被解散]\n`,
            `操作人账号：${e.operator_id}\n`,
            `解散群号：${e.group_id}`
        ]
      } else if (
        e.user_id === bot.uin &&
        e.operator_id !== bot.uin
      ) {
        if (!Config.getAlone(e.self_id, e.group_id).groupNumberChange) return false

        logger.info("[Yenai-Plugin]机器人被踢")

        msg = [
          segment.image(
              `https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/100`
          ),
          `[通知(${e.self_id}) - 机器人被踢]\n`,
            `操作人账号：${e.operator_id}\n`,
            `被踢群号：${e.group_id}`
        ]
      } else if (
        e.user_id === bot.uin &&
        e.operator_id === bot.uin
      ) {
        if (!Config.getAlone(e.self_id, e.group_id).groupNumberChange) return false

        logger.info("[Yenai-Plugin]机器人退群")

        msg = [
          segment.image(
              `https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/100`
          ),
          `[通知(${e.self_id}) - 机器人退群]\n`,
            `退出群号：${e.group_id}`
        ]
      } else if (e.operator_id === e.user_id) {
        if (!Config.getAlone(e.self_id, e.group_id).groupMemberNumberChange) return false

        logger.info("[Yenai-Plugin]群员退群")

        msg = [
          segment.image(
              `https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/100`
          ),
          `[通知(${e.self_id}) - 群员退群]\n`,
            `退群人账号：${e.user_id}\n`,
            `退群人昵称：${e.member.nickname}\n`,
            `退群人群名片：${e.member.card}\n`,
            `退出群号：${e.group_id}`
        ]
      } else if (e.operator_id !== e.user_id) {
        if (!Config.getAlone(e.self_id, e.group_id).groupMemberNumberChange) return false

        logger.info("[Yenai-Plugin]群员被踢")

        msg = [
          segment.image(
              `https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/100`
          ),
          `[通知(${e.self_id}) - 群员被踢]\n`,
            `操作人账号：${e.operator_id}\n`,
            `被踢人账号：${e.user_id}\n`,
            `被踢人昵称：${e.member.nickname}\n`,
            `被踢人群名片：${e.member.card}\n`,
            `被踢群号：${e.group_id}`
        ]
      }
      break
    }
    // 群管理变动
    case "admin": {
      if (!Config.getAlone(e.self_id, e.group_id).groupAdminChange) return false

      e.set ? logger.info("[Yenai-Plugin]机器人被设置管理") : logger.info("[Yenai-Plugin]机器人被取消管理")
      if (e.user_id === bot.uin) {
        msg = [
          segment.image(
              `https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/100`
          ),
          e.set
            ? `[通知(${e.self_id}) - 机器人被设置管理]:\n`
            : `[通知(${e.self_id}) - 机器人被取消管理]:\n`,
            `被操作群号：${e.group_id}`
        ]
      } else {
        e.set ? logger.info("[Yenai-Plugin]新增群管理员") : logger.info("[Yenai-Plugin]取消群管理员")

        msg = [
          segment.image(
              `https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/100`
          ),
          e.set ? `[通知(${e.self_id}) - 新增群管理员]:\n` : `[通知(${e.self_id}) - 取消群管理员]:\n`,
            `被操作账号：${e.user_id}\n`,
            `被操作群号：${e.group_id}`
        ]
      }
      break
    }
    // 禁言
    case "ban": {
      const forbiddenTime = formatDuration(e.duration, "default")
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

      if (!Config.getAlone(e.self_id, e.group_id).botBeenBanned) return false

      if (e.user_id != bot.uin) return false

      if (e.duration == 0) {
        logger.info("[Yenai-Plugin]机器人被解除禁言")
        msg = [
          segment.image(
              `https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/100`
          ),
          `[通知(${e.self_id}) - 机器人被解除禁言]\n`,
            `处理人账号：${e.operator_id}\n`,
            `处理群号：${e.group_id}`
        ]
      } else if (e.user_id === bot.uin) {
        logger.info("[Yenai-Plugin]机器人被禁言")

        msg = [
          segment.image(
              `https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/100`
          ),
          `[通知(${e.self_id}) - 机器人被禁言]\n`,
            `禁言人账号：${e.operator_id}\n`,
            `禁言群号：${e.group_id}\n`,
            `禁言时长：${forbiddenTime}`
        ]
      }
      break
    }
    // 群转让
    case "transfer": {
      if (!Config.getAlone(e.self_id, e.group_id).groupNumberChange) return false

      logger.info("[Yenai-Plugin]群聊转让")

      msg = [
        segment.image(
            `https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/100`
        ),
        `[通知(${e.self_id}) - 群聊转让]\n`,
          `转让群号：${e.group_id}\n`,
          `旧群主：${e.operator_id}\n`,
          `新群主：${e.user_id}`
      ]
      break
    }
    // 群撤回
    case "recall": {
      // 开启或关闭
      if (!Config.getAlone(e.self_id, e.group_id).groupRecall) return false
      // 是否为机器人撤回
      if (e.user_id == bot.uin || e.operator_id == bot.uin) return false
      // 是否为主人撤回
      if (Config.masterQQ.includes(e.user_id)) return false
      // 读取
      const data = JSON.parse(await redis.get(`notice:messageGroup:${e.message_id}`))
      // 无数据 return出去
      if (!data) return false
      const { type, url, file } = data[0]
      const msgType = {
        flash: {
          msg: () => e.group.makeForwardMsg([
            {
              message: segment.image(url),
              nickname: e.group.pickMember(e.user_id).card,
              user_id: e.user_id
            }
          ]),
          type: "[闪照]"
        },
        record: {
          msg: () => segment.record(url),
          type: "[语音]"
        },
        video: {
          msg: () => segment.video(file),
          type: "[视频]"
        },
        xml: {
          msg: () => data,
          type: "[合并消息]"
        }
      }
      let special = ""

      if (msgType[type]) {
        forwardMsg = await msgType[type].msg()
        special = msgType[type].type
      } else {
        // 正常处理
        forwardMsg = await Bot.makeForwardMsg([
          {
            message: data,
            nickname: e.group.pickMember(e.user_id).card,
            user_id: e.user_id
          }
        ], true)
      }
      // 判断是否管理撤回
      let isManage = ""
      if (e.operator_id != e.user_id) {
        isManage = `撤回管理：${e.group.pickMember(e.operator_id).card}(${e.operator_id})\n`
      }
      isManage ? logger.info("[Yenai-Plugin]群聊管理撤回") : logger.info("[Yenai-Plugin]群聊撤回")
      // 发送的消息
      msg = [
        segment.image(`https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/100`),
          `[通知(${e.self_id}) - 群聊${isManage ? "管理" : ""}撤回]\n`,
          `撤回群名：${e.group_name}\n`,
          `撤回群号：${e.group_id}\n`,
          isManage,
          `${isManage ? "被撤回人" : "撤回人员"}：${e.group.pickMember(e.user_id).card
          }(${e.user_id})\n`,
          `撤回时间：${moment(e.time * 1000).format("MM-DD HH:mm:ss")}`,
          special ? `\n特殊消息：${special}` : ""
      ]
      break
    }
    default:
      return false
  }
  await common.sendMasterMsg(msg, bot.uin)
  if (forwardMsg) await common.sendMasterMsg(forwardMsg, bot.uin)
})
