import { common } from '../../model/index.js'
import { Config } from '../../components/index.js'

Bot.on?.('internal.input', async (e) => {
  if (!Config.whole.input) return false
  // 判断是否主人消息
  if (Config.masterQQ.includes(e.user_id)) return false
  let msg = [
    segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${e.user_id}`),
    `[事件(${e.self_id}) - 对方${e.end ? '输入完毕' : '正在输入'}]\n`,
    `好友账号：${e.user_id}`
  ]
  await common.sendMasterMsg(msg)
})
