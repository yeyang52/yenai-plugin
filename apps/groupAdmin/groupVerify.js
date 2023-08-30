import { Config } from '../../components/index.js'
import { common, GroupAdmin as Ga } from '../../model/index.js'
import _ from 'lodash'
// 全局
let temp = {}
const ops = ['+', '-']
export class NewGroupVerify extends plugin {
  constructor () {
    super({
      name: '椰奶入群验证',
      dsc: '重新验证和绕过验证',
      event: 'message.group',
      priority: 5,
      rule: [
        {
          reg: '^#重新验证(\\d+|从未发言的人)?$',
          fnc: 'cmdReverify'
        },
        {
          reg: '^#绕过验证(\\d+)?$',
          fnc: 'cmdPass'
        },
        {
          reg: '^#(开启|关闭)验证$',
          fnc: 'handelverify'
        },
        {
          reg: '^#切换验证模式$',
          fnc: 'setmode'
        },
        {
          reg: '^#设置验证超时时间(\\d+)(s|秒)?$',
          fnc: 'setovertime'
        }
      ]
    })
    this.verifycfg = Config.groupverify
  }

  // 重新验证
  async cmdReverify (e) {
    if (!common.checkPermission(e, 'admin', 'admin')) return

    if (!this.verifycfg.openGroup.includes(e.group_id)) return e.reply('当前群未开启验证哦~', true)

    let qq = e.message.find(item => item.type == 'at')?.qq
    if (!qq) qq = e.msg.replace(/#|重新验证/g, '').trim()

    if (qq == '从未发言的人') return this.cmdReverifyNeverSpeak(e)

    if (!(/\d{5,}/.test(qq))) return e.reply('❎ 请输入正确的QQ号')
    qq = Number(qq)
    if (qq == (e.bot ?? Bot).uin) return

    if (Config.masterQQ.includes(qq)) return e.reply('❎ 该命令对机器人管理员无效')

    if (temp[qq + e.group_id]) return e.reply('❎ 目标群成员处于验证状态')

    await verify(qq, e.group_id, e)
  }

  // 绕过验证
  async cmdPass (e) {
    if (!common.checkPermission(e, 'admin', 'admin')) return

    if (!this.verifycfg.openGroup.includes(e.group_id)) return e.reply('当前群未开启验证哦~', true)

    let qq = e.message.find(item => item.type == 'at')?.qq
    if (!qq) qq = e.msg.replace(/#|绕过验证/g, '').trim()

    if (!(/\d{5,}/.test(qq))) return e.reply('❎ 请输入正确的QQ号')

    if (qq == (e.bot ?? Bot).uin) return
    qq = Number(qq)
    if (!temp[qq + e.group_id]) return e.reply('❎ 目标群成员当前无需验证')

    clearTimeout(temp[qq + e.group_id].kickTimer)

    clearTimeout(temp[qq + e.group_id].remindTimer)

    delete temp[qq + e.group_id]

    return await e.reply(this.verifycfg.SuccessMsgs[e.group_id] || this.verifycfg.SuccessMsgs[0] || '✅ 验证成功，欢迎入群')
  }

  async cmdReverifyNeverSpeak (e) {
    let list = null
    try {
      list = await new Ga(e).getNeverSpeak(e.group_id)
    } catch (error) {
      return common.handleException(e, error)
    }
    for (let item of list) {
      await verify(item.user_id, e.group_id, e)
      await common.sleep(2000)
    }
  }

  // 开启验证
  async handelverify (e) {
    if (!common.checkPermission(e, 'admin', 'admin')) return
    let type = /开启/.test(e.msg) ? 'add' : 'del'
    let isopen = this.verifycfg.openGroup.includes(e.group_id)
    if (isopen && type == 'add') return e.reply('❎ 本群验证已处于开启状态')
    if (!isopen && type == 'del') return e.reply('❎ 本群暂未开启验证')
    Config.modifyarr('groupverify', 'openGroup', e.group_id, type)
    e.reply(`✅ 已${type == 'add' ? '开启' : '关闭'}本群验证`)
  }

  // 切换验证模式
  async setmode (e) {
    if (!common.checkPermission(e, 'master')) return
    let value = this.verifycfg.mode == '模糊' ? '精确' : '模糊'
    Config.modify('groupverify', 'mode', value)
    e.reply(`✅ 已切换验证模式为${value}验证`)
  }

  // 设置验证超时时间
  async setovertime (e) {
    if (!common.checkPermission(e, 'master')) return
    let overtime = e.msg.match(/\d+/g)
    Config.modify('groupverify', 'time', Number(overtime))
    e.reply(`✅ 已将验证超时时间设置为${overtime}秒`)
    if (overtime < 60) {
      e.reply('建议至少一分钟(60秒)哦ε(*´･ω･)з')
    }
  }
}

// 进群监听
Bot.on?.('notice.group.increase', async (e) => {
  logger.mark(`[Yenai-Plugin][进群验证]收到${e.user_id}的进群事件`)
  let { openGroup, DelayTime } = Config.groupverify

  if (!openGroup.includes(e.group_id)) return
  if (!e.group.is_admin && !e.group.is_owner) return
  if (e.user_id == (e.bot ?? Bot).uin) return
  if (Config.masterQQ.includes(e.user_id)) return

  await common.sleep(DelayTime * 1000)
  await verify(e.user_id, e.group_id, e)
})

// 答案监听
Bot.on?.('message.group', async (e) => {
  let { openGroup, mode, SuccessMsgs } = Config.groupverify

  if (!openGroup.includes(e.group_id)) return

  if (!e.group.is_admin && !e.group.is_owner) return

  if (!temp[e.user_id + e.group_id]) return

  const { verifyCode, kickTimer, remindTimer } = temp[e.user_id + e.group_id]

  const { nums, operator } = temp[e.user_id + e.group_id]

  const isAccurateModeOK = mode === '精确' && e.raw_message == verifyCode

  const isVagueModeOK = mode === '模糊' && e.raw_message?.includes(verifyCode)

  const isOK = isAccurateModeOK || isVagueModeOK

  if (isOK) {
    delete temp[e.user_id + e.group_id]
    clearTimeout(kickTimer)
    clearTimeout(remindTimer)
    return await e.reply(SuccessMsgs[e.group_id] || SuccessMsgs[0] || '✅ 验证成功，欢迎入群')
  } else {
    temp[e.user_id + e.group_id].remainTimes -= 1

    const { remainTimes } = temp[e.user_id + e.group_id]

    if (remainTimes > 0) {
      await e.recall()

      const msg = `\n❎ 验证失败\n你还有「${remainTimes}」次机会\n请发送「${nums[0]} ${operator} ${nums[1]}」的运算结果`
      return await e.reply([segment.at(e.user_id), msg])
    }
    clearTimeout(kickTimer)
    clearTimeout(remindTimer)
    await e.reply([segment.at(e.user_id), '\n验证失败，请重新申请'])
    delete temp[e.user_id + e.group_id]
    return await e.group.kickMember(e.user_id)
  }
})

// 主动退群
Bot.on?.('notice.group.decrease', async (e) => {
  if (!e.group.is_admin && !e.group.is_owner) return

  if (!temp[e.user_id + e.group_id]) return

  clearTimeout(temp[e.user_id + e.group_id].kickTimer)

  clearTimeout(temp[e.user_id + e.group_id].remindTimer)

  delete temp[e.user_id + e.group_id]

  e.group.sendMsg(`「${e.user_id}」主动退群，验证流程结束`)
})

// 发送验证信息
async function verify (user_id, group_id, e) {
  if (!e.group.is_admin && !e.group.is_owner) return
  user_id = Number(user_id)
  group_id = Number(group_id)
  logger.mark(`[Yenai-Plugin][进群验证]进行${user_id}的验证`)

  const { times, range, time, remindAtLastMinute } = Config.groupverify
  const operator = ops[_.random(0, 1)]

  let [m, n] = [_.random(range.min, range.max), _.random(range.min, range.max)]
  while (m == n) {
    n = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min
  }

  [m, n] = [m >= n ? m : n, m >= n ? n : m]

  const verifyCode = String(operator === '-' ? m - n : m + n)
  logger.mark(`[Yenai-Plugin][进群验证]答案：${verifyCode}`)
  const kickTimer = setTimeout(async () => {
    e.reply([segment.at(user_id), '\n验证超时，移出群聊，请重新申请'])

    delete temp[user_id + group_id]

    clearTimeout(kickTimer)

    return await e.group.kickMember(user_id)
  }, time * 1000)

  const shouldRemind = remindAtLastMinute && time >= 120

  const remindTimer = setTimeout(async () => {
    if (shouldRemind && temp[user_id + group_id].remindTimer) {
      const msg = ` \n验证仅剩最后一分钟\n请发送「${m} ${operator} ${n}」的运算结果\n否则将会被移出群聊`

      await e.reply([segment.at(user_id), msg])
    }
    clearTimeout(remindTimer)
  }, Math.abs(time * 1000 - 60000))

  const msg = ` 欢迎！\n请在「${time}」秒内发送\n「${m} ${operator} ${n}」的运算结果\n否则将会被移出群聊`

  // 消息发送成功才写入
  if (await e.reply([segment.at(user_id), msg])) {
    temp[user_id + group_id] = {
      remainTimes: times,
      nums: [m, n],
      operator,
      verifyCode,
      kickTimer,
      remindTimer
    }
  }
}