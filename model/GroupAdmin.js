import _ from 'lodash'
import moment from 'moment'
import loader from '../../../lib/plugins/loader.js'
import { Config } from '../components/index.js'
import { common, QQApi } from './index.js'

// 无管理文案
const ROLE_ERROR = '我连管理员都木有，这种事怎么可能做到的辣！！！'
export default new class {
  constructor () {
    this.MuteTaskKey = 'yenai:MuteTasks'
  }

  async _getMemberMap (groupId, iskey = false) {
    let Map = await Bot.pickGroup(groupId - 0).getMemberMap(true)
    return Array.from(iskey ? Map.keys() : Map.values())
  }

  /**
     * @description: 获取禁言中的人数组
     * @param {Number} groupId 群号
     * @return {Promise}
     */
  async getMuteList (groupId, info = false) {
    let list = await this._getMemberMap(groupId, true)
    let groupObj = Bot.pickGroup(groupId - 0)
    let mutelist = list.filter(item => groupObj.pickMember(item).mute_left != 0)
    if (_.isEmpty(mutelist)) return false
    if (!info) return mutelist
    return mutelist.map(item => {
      let Member = groupObj.pickMember(item)
      let { info } = Member
      return [
        segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${info.user_id}`),
        `\n昵称：${info.card || info.nickname}\n`,
        `QQ：${info.user_id}\n`,
        `群身份：${common.ROLE_MAP[info.role]}\n`,
        `禁言剩余时间：${common.getsecondformat(Member.mute_left)}`
      ]
    })
  }

  /**
     * @description: 解除全部禁言
     * @param {Number} groupId 群号
     * @return {*}
     */
  async releaseAllMute (groupId) {
    let mutelist = await this.getMuteList(groupId)
    if (!mutelist) return false
    return Promise.all(mutelist.map(item => Bot.pickGroup(groupId - 0).muteMember(item, 0)))
  }

  /**
     * @description: 返回多少时间没发言的人信息
     * @param {Number} groupId 群号
     * @param {Number} times 时间数
     * @param {String} unit 单位 (天)
     * @param {Number} page 页数
     * @return {Promise<String[]>}
     */
  async getNoactiveInfo (groupId, times, unit, page = 1) {
    let list = await this.noactiveList(groupId, times, unit)
    if (!list) return { error: `暂时没有${times}${unit}没发言的淫哦╮( •́ω•̀ )╭` }
    list.sort((a, b) => a.last_sent_time - b.last_sent_time)
    let msg = list.map(item =>
      [
        segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${item.user_id}`),
        `\nQQ：${item.user_id}\n`,
        `昵称：${item.card || item.nickname}\n`,
        `最后发言时间：${moment(item.last_sent_time * 1000).format('YYYY-MM-DD HH:mm:ss')}`
      ]
    )
    let pageChunk = _.chunk(msg, 30)
    if (page > pageChunk.length) return { error: '哪有那么多人辣o(´^｀)o' }

    let msgs = pageChunk[page - 1]
    msgs.unshift(`当前为第${page}页，共${pageChunk.length}页，本页共${msgs.length}人，总共${msg.length}人`)
    msgs.unshift(`以下为${times}${unit}没发言过的坏淫`)
    if (page < pageChunk.length) {
      msgs.splice(2, 0, `可用 "#查看${times}${unit}没发言过的人第${page + 1}页" 翻页`)
    }
    return msgs
  }

  /**
     * @description: 清理多久没发言的人
     * @param {Number} groupId 群号
     * @param {Number} times 时间数
     * @param {String} unit 单位 (天)
     * @return {Promise<Boolean>}
     */
  async clearNoactive (groupId, times, unit) {
    let list = await this.noactiveList(groupId, times, unit)
    if (!list) return false
    list = list.map(item => item.user_id)
    return this.BatchKickMember(groupId, list)
  }

  /**
     * @description: 返回多少时间没发言的人列表
     * @param {Number} groupId 群号
     * @param {Number} times 时间数
     * @param {String} unit 单位 (天)
     * @return {Promise<Number[]>}
     */
  async noactiveList (groupId, times = 1, unit = '月') {
    let nowtime = parseInt(Date.now() / 1000)
    let timeUnit = common.Time_unit[unit]

    let time = nowtime - times * timeUnit
    let list = await this._getMemberMap(groupId)

    list = list.filter(item => item.last_sent_time < time && item.role == 'member' && item.user_id != Bot.uin)
    if (_.isEmpty(list)) return false
    return list
  }

  /**
     * @description: 返回从未发言的人
     * @param {Number} geoupId 群号
     * @return {Promise<Number[]>}
     */
  async getNeverSpeak (groupId) {
    let list = await this._getMemberMap(groupId)
    list = list.filter(item => item.join_time == item.last_sent_time && item.role == 'member' && item.user_id != Bot.uin)
    if (_.isEmpty(list)) return false
    return list
  }

  /**
     * @description: 返回从未发言的人信息
     * @param {Number} geoupId 群号
     * @return {Promse<String[]>}
     */
  async getNeverSpeakInfo (groupId, page = 1) {
    let list = await this.getNeverSpeak(groupId)
    if (!list) return { error: '咋群全是好淫哦~全都发过言辣٩(๑•̀ω•́๑)۶' }
    list.sort((a, b) => a.join_time - b.join_time)
    let msg = list.map(item => {
      return [segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${item.user_id}`),
      `\nQQ：${item.user_id}\n`,
      `昵称：${item.card || item.nickname}\n`,
      `进群时间：${moment(item.join_time * 1000).format('YYYY-MM-DD HH:mm:ss')}`
      ]
    })
    let pageChunk = _.chunk(msg, 30)
    if (page > pageChunk.length) return { error: '哪有那么多人辣o(´^｀)o' }

    let msgs = pageChunk[page - 1]
    msgs.unshift(`当前为第${page}页，共${pageChunk.length}页，本页共${msgs.length}人，总共${msg.length}人`)
    msgs.unshift('以下为进群后从未发言过的坏淫')
    if (page < pageChunk.length) {
      msgs.splice(2, 0, `可用 "#查看从未发言过的人第${page + 1}页" 翻页`)
    }
    return msgs
  }

  /**
     * @description: 批量踢出群成员
     * @param {Number} geoupId 群号
     * @param {Array} arr 要提出成员的数组
     * @return {Object} 成功和失败的列表
     */
  async BatchKickMember (groupId, arr) {
    let res = await QQApi.deleteGroupMember(groupId, arr)
    let msg = [
      '以下为每次清理的结果'
    ]
    res.forEach(item => {
      if (item.ec != 0) {
        msg.push(`错误：${JSON.stringify(res)}`)
      } else {
        msg.push('成功清理如下人员\n}' + res.ul.map((item, index) =>
      `${index + 1}、${item}`
        ).join('\n'))
      }
    })
    return msg
  }

  /**
     * @description: 返回不活跃排行榜
     * @param {Number} geoupId 群号
     * @param {Number} num 榜单数量
     * @return {Promse<String[]>}
     */
  async InactiveRanking (groupId, num) {
    let list = await this._getMemberMap(groupId)
    list.sort((a, b) => {
      return a.last_sent_time - b.last_sent_time
    })
    let msg = list.slice(0, num)
    msg = msg.map((item, index) => {
      return [`第${index + 1}名：\n`,
        segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${item.user_id}`),
      `\nQQ：${item.user_id}\n`,
      `昵称：${item.card || item.nickname}\n`,
      `最后发言时间：${moment(item.last_sent_time * 1000).format('YYYY-MM-DD HH:mm:ss')}`
      ]
    })
    msg.unshift(`不活跃排行榜top1 - top${num}`)
    return msg
  }

  /**
     * @description: 获取最近加群情况
     * @param {Number} geoupId 群号
     * @param {Number} num 获取的数量
     * @return {Promse<String[]>}
     */
  async getRecentlyJoined (groupId, num) {
    let list = await this._getMemberMap(groupId)
    list.sort((a, b) => {
      return b.join_time - a.join_time
    })
    let msg = list.slice(0, num)
    msg = msg.map((item) => {
      return [
        segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${item.user_id}`),
        `\nQQ：${item.user_id}\n`,
        `昵称：${item.card || item.nickname}\n`,
        `入群时间：${moment(item.join_time * 1000).format('YYYY-MM-DD HH:mm:ss')}\n`,
        `最后发言时间：${moment(item.last_sent_time * 1000).format('YYYY-MM-DD HH:mm:ss')}`
      ]
    })
    msg.unshift(`最近的${num}条入群记录`)
    return msg
  }

  /**
     * @description: 设置群定时禁言
     * @param {Number} group 群号
     * @param {String} cron cron 表达式
     * @param {Boolean} type true为禁言false为解禁
     */
  async setMuteTask (group, cron, type) {
    let name = `椰奶群定时${type ? '禁言' : '解禁'}${group}`
    if (loader.task.find(item => item.name == name)) return false
    let redisTask = JSON.parse(await redis.get(this.MuteTaskKey)) || []
    let task = {
      cron,
      name,
      fnc: () => {
        Bot.pickGroup(Number(group)).muteAll(type)
      }
    }
    loader.task.push(_.cloneDeep(task))
    loader.creatTask()
    redisTask.push({ cron, group, type })
    redis.set(this.MuteTaskKey, JSON.stringify(redisTask))
    return true
  }

  /**
     * @description: 返回redis储存定时任务
     * @return {Promise<object>} 定时任务数组
     */
  async getRedisMuteTask () {
    return JSON.parse(await redis.get(this.MuteTaskKey))?.map(item => {
      return {
        cron: item.cron,
        name: `椰奶群定时${item.type ? '禁言' : '解禁'}${item.group}`,
        fnc: () => {
          Bot.pickGroup(Number(item.group)).muteAll(item.type)
        }
      }
    })
  }

  /**
     * @description: 删除定时任务
     * @param {Number} group
     * @param {Boolean} type true为禁言false为解禁
     * @return {Boolean}
     */
  async delMuteTask (group, type) {
    let redisTask = JSON.parse(await redis.get(this.MuteTaskKey)) || []
    loader.task = loader.task.filter(item => item.name !== `椰奶群定时${type ? '禁言' : '解禁'}${group}`)
    redisTask = redisTask.filter(item => item.group !== group && item.type !== type)
    redis.set(this.MuteTaskKey, JSON.stringify(redisTask))
    return true
  }

  /**
     * @description: 获取定时任务
     */
  getMuteTask () {
    let RegEx = /椰奶群定时(禁言|解禁)(\d+)/
    let taskList = _.cloneDeep(loader.task)
    let MuteList = taskList.filter(item => /椰奶群定时禁言\d+/.test(item.name))
    let noMuteList = taskList.filter(item => /椰奶群定时解禁\d+/.test(item.name))
    noMuteList.forEach(noitem => {
      let index = MuteList.findIndex(item => noitem.name.match(RegEx)[2] == item.name.match(RegEx)[2])
      if (index !== -1) {
        MuteList[index].nocron = noitem.cron
      } else {
        noitem.nocron = noitem.cron
        delete noitem.cron
        MuteList.push(noitem)
      }
    })
    return MuteList.map(item => {
      let analysis = item.name.match(RegEx)
      return [
        segment.image(`https://p.qlogo.cn/gh/${analysis[2]}/${analysis[2]}/100`),
        `\n群号：${analysis[2]}`,
        item.cron ? `\n禁言时间：'${item.cron}'` : '',
        item.nocron ? `\n解禁时间：'${item.nocron}'` : ''
      ]
    })
  }

  /**
   * @description: 禁言某人
   * @param {Number} groupId 群号
   * @param {Number} userId 被禁言人QQ
   * @param {Number} executor 执行人QQ
   * @param {Number} time 时间倍数 0为解禁
   * @param {String} unit 时间单位
   * @return {Promise<String>} 回复消息
   */
  async muteMember (groupId, userId, executor, time = 5, unit = '分') {
    unit = common.Time_unit[unit.toUpperCase()] ?? (/^\d+$/.test(unit) ? unit : 60)
    let group = null
    try { group = Bot.pickGroup(Number(groupId), true) } catch (err) { return err.message }
    // 判断是否有管理
    if (!group.is_admin && !group.is_owner) return ROLE_ERROR
    if (!(/\d{5,}/.test(userId))) return '❎ 请输入正确的QQ号'
    // 判断是否为主人
    if (Config.masterQQ?.includes(Number(userId)) && time != 0) return '居然调戏主人！！！哼，坏蛋(ﾉ｀⊿´)ﾉ'

    let Memberinfo = group.pickMember(Number(userId)).info
    // 判断是否有这个人
    if (!Memberinfo) return '❎ 这个群没有这个人哦~'

    // 特殊处理
    if (Memberinfo.role === 'owner') return '调戏群主拖出去枪毙5分钟(。>︿<)_θ'

    let user = group.pickMember(Number(executor))
    let isMaster = Config.masterQQ?.includes(executor)

    if (Memberinfo.role === 'admin') {
      if (!group.is_owner) return '人家又不是群主这种事做不到的辣！'
      if (!isMaster && !user.member.is_owner) return '这个淫系管理员辣，只有主淫和群主才可以干ta'
    }

    await group.muteMember(userId, time * unit)
    return time == 0 ? `✅ 已把「${Memberinfo.card || Memberinfo.nickname}」从小黑屋揪了出来(｡>∀<｡)` : `已把「${Memberinfo.card || Memberinfo.nickname}」扔进了小黑屋( ･_･)ﾉ⌒●~*`
  }

  /**
   * @description: 踢群成员
   * @param {Number} groupId 群号
   * @param {Number} userId 被踢人
   * @param {Number} executor 执行人
   * @return {Promise<String>}
   */
  async kickMember (groupId, userId, executor) {
    let group = null
    try { group = Bot.pickGroup(Number(groupId), true) } catch (err) { return err.message }

    if (!userId || !(/^\d+$/.test(userId))) return '❎ 请输入正确的QQ号'
    if (!groupId || !(/^\d+$/.test(groupId))) return '❎ 请输入正确的群号'
    // 判断是否为主人
    if (Config.masterQQ?.includes(Number(userId))) return '居然调戏主人！！！哼，坏蛋(ﾉ｀⊿´)ﾉ'

    let Memberinfo = group?.pickMember(Number(userId)).info
    // 判断是否有这个人
    if (!Memberinfo) return '❎ 这个群没有这个人哦~'
    if (Memberinfo.role === 'owner') return '调戏群主拖出去枪毙5分钟(。>︿<)_θ'
    let isMaster = Config.masterQQ?.includes(executor)
    let user = group.pickMember(Number(executor))
    if (Memberinfo.role === 'admin') {
      if (!group.is_owner) return '人家又不是群主这种事做不到的辣！'
      if (!isMaster && !user.is_owner) return '这个淫系管理员辣，只有主淫和群主才可以干ta'
    }
    let res = await group.kickMember(Number(userId))
    return res ? '已把这个坏淫踢掉惹！！！' : '额...踢出失败哩，可能这个淫比较腻害>_<'
  }
}()
