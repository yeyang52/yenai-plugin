import plugin from '../../../lib/plugins/plugin.js'
import { Config } from '../components/index.js'
import { setu, common } from '../model/index.js'
import { Admin } from './admin.js'

const SWITCH_ERROR = '主人没有开放这个功能哦(＊／ω＼＊)'

const NumReg = '[一壹二两三四五六七八九十百千万亿\\d]+'
export class SeSe extends plugin {
  constructor () {
    super({
      name: '椰奶setu',
      event: 'message',
      priority: 500,
      rule: [
        {
          reg: '^#椰奶tag(.*)$',
          fnc: 'setuTag'
        },
        {
          reg: `^#(setu|无内鬼)\\s?((${NumReg})张)?$`, // 无内鬼
          fnc: 'setuRandom'
        },
        {
          reg: `^#(撤回间隔|群(c|C)(d|D))(${NumReg})(s|秒)?$`,
          fnc: 'setGroupRecallAndCD',
          event: 'message.group',
          permission: 'master'
        },
        {
          reg: '^#(开启|关闭)(私聊)?涩涩$',
          fnc: 'setSeSe',
          permission: 'master'
        },
        {
          reg: `^#?设置cd\\s?((\\d+)\\s)?(${NumReg})(s|秒)?$`, // 设置cd
          fnc: 'setCd',
          permission: 'master'
        }
      ]
    })
  }

  async setuRandom (e) {
    if (!await this.Authentication(e)) return

    const cdTime = setu.getRemainingCd(e.user_id, e.group_id)

    if (cdTime) return e.reply(` ${setu.CDMsg}你的CD还有${cdTime}`, false, { at: true })

    let num = e.msg.match(new RegExp(NumReg))

    num = num ? common.translateChinaNum(num[0]) : 1

    if (num > 20) {
      return e.reply('❎ 最大张数不能大于20张')
    } else if (num > 6) {
      e.reply('你先等等，你冲的有点多~')
    }
    // 开始执行
    e.reply(setu.startMsg)

    await setu.setuApi(setu.getR18(e.group_id), num)
      .then(res => setu.sendMsgOrSetCd(e, res))
      .catch(err => e.reply(err.message))
  }

  // tag搜图
  async setuTag (e) {
    if (!await this.Authentication(e)) return

    let cdTime = setu.getRemainingCd(e.user_id, e.group_id)
    if (cdTime) return e.reply(` ${setu.CDMsg}你的CD还有${cdTime}`, false, { at: true })

    let tag = e.msg.replace(/#|椰奶tag/g, '').trim()
    let num = e.msg.match(new RegExp(`(${NumReg})张`))
    if (!num) {
      num = 1
    } else {
      tag = tag.replace(num[0], '').trim()
      num = common.translateChinaNum(num[1])
    }

    if (num > 20) {
      return e.reply('❎ 最大张数不能大于20张')
    } else if (num > 6) {
      e.reply('你先等等，你冲的有点多~')
    } else {
      e.reply(setu.startMsg)
    }

    if (!tag) return e.reply('tag为空！！！', false, { at: true })
    tag = tag.split(' ')?.map(item => item.split('|'))
    if (tag.length > 3) return e.reply('tag最多只能指定三个哦~', false, { at: true })

    await setu.setuApi(setu.getR18(e.group_id), num, tag)
      .then(res => setu.sendMsgOrSetCd(e, res))
      .catch(err => e.reply(err.message))
  }

  async Authentication (e) {
    if (e.isMaster) return true
    if (!Config.setu.allowPM && !e.isGroup) {
      e.reply('主人已禁用私聊该功能')
      return false
    }
    if (!Config.getGroup(e.group_id).sesepro) {
      e.reply(SWITCH_ERROR)
      return false
    }
    if (!await common.limit(e.user_id, 'setu', Config.setu.limit)) {
      e.reply('[setu]您已达今日次数上限', true, { at: true })
      return false
    }
    return true
  }

  // 设置群撤回间隔和cd
  async setGroupRecallAndCD (e) {
    let num = e.msg.match(new RegExp(NumReg))
    num = common.translateChinaNum(num[0])
    let type = /撤回间隔/.test(e.msg)
    setu.setGroupRecallTimeAndCd(e.group_id, num, type)
    new Admin().SeSe_Settings(e)
  }

  // 开启r18
  async setSeSe (e) {
    let isopen = !!/开启/.test(e.msg)
    setu.setR18(e.group_id, isopen)
    new Admin().SeSe_Settings(e)
  }

  // 指令设置
  async setCd (e) {
    let reg = `^#?设置cd\\s?((\\d+)\\s)?(${NumReg})(s|秒)?$`
    let regRet = e.msg.match(new RegExp(reg))
    let qq = e.message.find(item => item.type == 'at')?.qq ?? regRet[2]
    let cd = common.translateChinaNum(regRet[3])
    if (!qq) return e.reply('❎ 请输入要设置QQ', true)
    if (!cd) return e.reply('❎ CD为空，请检查', true)
    setu.setUserCd(e, qq ?? regRet[2], cd)
  }
}
