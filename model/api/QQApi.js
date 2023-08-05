import fetch from 'node-fetch'
import { common } from '../index.js'
import _ from 'lodash'
import moment from 'moment'
import request from '../../lib/request/request.js'
/** QQ接口 */
export default class {
  constructor (e) {
    this.e = e
    this.Bot = e.bot ?? Bot
    this.headers = {
      'Content-type': 'application/json;charset=UTF-8',
      'Cookie': this.Bot?.cookies?.['qun.qq.com'],
      'qname-service': '976321:131072',
      'qname-space': 'Production'
    }
  }

  getGtk (data) {
    let ck = common.getck(data, this.Bot)
    // eslint-disable-next-line no-var
    for (var e = ck.p_skey || '', n = 5381, r = 0, o = e.length; r < o; ++r) {
      n += (n << 5) + e.charAt(r).charCodeAt(0)
    }
    return 2147483647 & n
  }

  /**
     * @description: 取说说列表
     * @param {*} e oicq
     * @param {Number} num 数量
     * @param {Number} pos 偏移量
     * @return {Object} QQ空间数据
     */
  async getQzone (num = 20, pos = 0) {
    let url = `https://user.qzone.qq.com/proxy/domain/taotao.qq.com/cgi-bin/emotion_cgi_msglist_v6?uin=${this.Bot.uin}&ftype=0&sort=0&pos=${pos}&num=${num}&replynum=100&g_tk=${this.Bot.bkn}&code_version=1&format=json&need_private_comment=1`
    return await fetch(url, {
      headers: {
        Cookie: this.Bot.cookies['qzone.qq.com']
      }
    }).then(res => res.json()).catch(err => logger.error(err))
  }

  /**
     * @description: 删除说说
     * @param {String} tid tid参数
     * @param {String} t1_source t1_source参数
     */
  async delQzone (tid, t1_source) {
    let url = `https://user.qzone.qq.com/proxy/domain/taotao.qzone.qq.com/cgi-bin/emotion_cgi_delete_v6?&g_tk=${this.Bot.bkn}`
    // 发送请求
    return await fetch(url, {
      method: 'POST',
      body: `hostuin=${this.Bot.uin}&tid=${tid}&t1_source=${t1_source}&code_version=1&format=json`,
      headers: {
        Cookie: this.Bot.cookies['qzone.qq.com']
      }
    }).then(res => res.json()).catch(err => logger.error(err))
  }

  /** 删除全部说说 */
  async delQzoneAll () {
    let ck = common.getck('qzone.qq.com', this.Bot)
    return await fetch(`http://xiaobai.klizi.cn/API/qqgn/ss_empty.php?data=&uin=${this.Bot.uin}&skey=${ck.skey}&pskey=${ck.p_skey}`).then(res => res.text()).catch(err => logger.error(err))
    // let num = 0
    // while (true) {
    //   let list = await this.getQzone(40)
    //   if (list.total == 0) return num == 0 ? '❎ 说说列表空空' : '✅ 已清空全部说说'
    //   for (let item of list.msglist) {
    //     let res = await this.delQzone(item.tid, item.t1_source)
    //     if (res.code != 0) return `❎ 遇到错误 ${JSON.stringify(res)}`
    //   }
    //   num++
    // }
  }

  /** 发送说说 */
  async setQzone (con, img) {
    let ck = common.getck('qzone.qq.com', this.Bot)

    if (img) {
      let url = `http://xiaobai.klizi.cn/API/qqgn/ss_sendimg.php?uin=${this.Bot.uin}&skey=${ck.skey}&pskey=${ck.p_skey}&url=${img[0]}&msg=${con}`
      return await fetch(url).then(res => res.json()).catch(err => logger.error(err))
    } else {
      let url = `https://user.qzone.qq.com/proxy/domain/taotao.qzone.qq.com/cgi-bin/emotion_cgi_publish_v6?&g_tk=${this.Bot.bkn}`
      return await fetch(url, {
        method: 'POST',
        body: `syn_tweet_verson=1&paramstr=1&con=${con}&feedversion=1&ver=1&ugc_right=1&to_sign=1&hostuin=${this.Bot.uin}&code_version=1&format=json`,
        headers: {
          Cookie: this.Bot.cookies['qzone.qq.com']
        }
      }).then(res => res.json()).catch(err => logger.error(err))
    }
  }

  /**
     * @description: 获取留言
     * @param {Number} num 数量为0时返回为全部
     * @param {Number} start 偏移量/开始的位置
     * @return {*}
     */
  async getQzoneMsgb (num = 0, start = 0) {
    let url = `https://user.qzone.qq.com/proxy/domain/m.qzone.qq.com/cgi-bin/new/get_msgb?uin=${this.Bot.uin}&hostUin=${this.Bot.uin}&start=${start}&s=0.45779069937151884&format=json&num=${num}&inCharset=utf-8&outCharset=utf-8&g_tk=${this.Bot.bkn}`
    return await fetch(url, {
      headers: {
        cookie: this.Bot.cookies['qzone.qq.com']
      }
    }).then(res => res.json())
  }

  /**
     * @description: 删除留言
     * @param {*} id 留言id
     * @param {*} uinId
     * @return {*}
     */
  async delQzoneMsgb (id, uinId) {
    let delurl = `https://h5.qzone.qq.com/proxy/domain/m.qzone.qq.com/cgi-bin/new/del_msgb?&g_tk=${this.Bot.bkn}`
    return await fetch(delurl, {
      method: 'POST',
      headers: {
        Cookie: this.Bot.cookies['qzone.qq.com']
      },
      body: `hostUin=${this.Bot.uin}&idList=${id}&uinList=${uinId}&format=json&iNotice=1&inCharset=utf-8&outCharset=utf-8&ref=qzone&json=1&g_tk=${this.Bot.bkn}`
    }).then(res => res.json())
  }

  /** 删除全部留言 */
  async delQzoneMsgbAll () {
    let ck = common.getck('qzone.qq.com', this.Bot)
    return await fetch(`http://xiaobai.klizi.cn/API/qqgn/qzone_emptymsgb.php?data=&uin=${this.Bot.uin}&skey=${ck.skey}&pskey=${ck.p_skey}`).then(res => res.text()).catch(err => logger.error(err))
    // let num = 0
    // while (true) {
    //   let list = await this.getQzoneMsgb(40)
    //   if (list.code != 0) return `❎ 获取列表错误 ${JSON.stringify(list)}`
    //   if (list.data.total == 0) return num == 0 ? '❎ 留言列表空空' : '✅ 已清空全部留言'
    //   for (let item of list.data.commentList) {
    //     let res = await this.delQzoneMsgb(item.id, item.uin)
    //     if (res.code != 0) return `❎ 遇到错误 ${JSON.stringify(res)}`
    //   }
    //   num++
    // }
  }

  // ----------------------------------------------------公告---------------------------------------------
  /**
    * @description: 获取群公告
    * @param {String} group 群号
    * @param {String} item 序号
    * @return {Object}
    */
  async getAnnouncelist (group_id, s = 0) {
    let n = s ? 1 : 20
    let url = `https://web.qun.qq.com/cgi-bin/announce/get_t_list?bkn=${this.Bot.bkn}&qid=${group_id}&ft=23&s=${s - 1}&n=${n}`
    let res = await fetch(url, { headers: { Cookie: this.Bot.cookies['qun.qq.com'] } }).then(res => res.json()).catch(err => logger.error(err))
    if (!res) return false
    if (s) {
      return {
        text: res.feeds[0].msg.text,
        fid: res.feeds[0].fid
      }
    } else {
      return res.feeds.map((item, index) => `${index + 1}、${_.truncate(item.msg.text)}`).join('\n')
    }
  }

  /**
     * @description: 发送群公告
     * @param {Number} group_id 发送群号
     * @param {String} msg 发送内容
     */
  async setAnnounce (group_id, msg) {
    let url = `https://web.qun.qq.com/cgi-bin/announce/add_qun_notice?bkn=${this.Bot.bkn}`
    return await fetch(url, {
      method: 'POST',
      body: `qid=${group_id}&bkn=${this.Bot.bkn}&text=${msg}&pinned=0&type=1&settings={"is_show_edit_card":1,"tip_window_type":1,"confirm_required":1}`,
      headers: {
        Cookie: this.Bot.cookies['qun.qq.com']
      }
    }).then(res => res.json()).catch(err => logger.error(err))
  }

  /**
     * @description: 删群公告
     * @param {Number} group_id 群号
     * @param {Number} num 序号
     */
  async delAnnounce (group_id, num) {
    let fid = await this.getAnnouncelist(group_id, num)
    if (!fid) return false

    let url = `https://web.qun.qq.com/cgi-bin/announce/del_feed?bkn=${this.Bot.bkn}`
    let res = await fetch(url, {
      method: 'POST',
      body: `bkn=${this.Bot.bkn}&fid=${fid.fid}&qid=${group_id}`,
      headers: {
        Cookie: this.Bot.cookies['qun.qq.com']
      }
    }).then(res => res.json()).catch(err => logger.error(err))
    return {
      ...res,
      text: _.truncate(fid.text)
    }
  }

  /** 群星级 */
  async getCreditLevelInfo (group_id) {
    let url = `https://qqweb.qq.com/c/activedata/get_credit_level_info?bkn=${this.Bot.bkn}&uin=${this.Bot.uin}&gc=${group_id}`
    return await fetch(url, {
      headers: {
        'Cookie': this.Bot.cookies['qqweb.qq.com'],
        'Referer': `https://qqweb.qq.com/m/business/qunlevel/index.html?gc=${group_id}&from=0&_wv=1027`,
        'User-agent': 'Mozilla/5.0 (Linux; Android 12; M2012K11AC Build/SKQ1.220303.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/89.0.4389.72 MQQBrowser/6.2 TBS/046141 Mobile Safari/537.36 V1_AND_SQ_8.3.9_350_TIM_D QQ/3.5.0.3148 NetType/WIFI WebP/0.3.0 Pixel/1080 StatusBarHeight/81 SimpleUISwitch/0 QQTheme/1015712'
      }
    }).then(res => res.json()).catch(err => logger.error(err))
  }

  /** 查看本群龙王 */
  async dragon (group_id) {
    let url = `https://qun.qq.com/interactive/honorlist?gc=${group_id}&type=1&_wv=3&_wwv=129`
    let res = await fetch(url, { headers: { Cookie: this.Bot.cookies['qun.qq.com'] } })
      .then(res => res.text()).catch(err => logger.error(err))
    let data = res.match(/<script>window.__INITIAL_STATE__=(.*?)<\/script>/)
    if (!data) return false
    return JSON.parse(data[1])?.currentTalkative
  }

  /**
     * @description: 开关好友添加
     * @param {Number} type 1关闭2开启
     */
  async addFriendSwitch (type) {
    let url = `https://ti.qq.com/proxy/domain/oidb.tim.qq.com/v3/oidbinterface/oidb_0x587_75?sdkappid=39998&actype=2&bkn=${this.Bot.bkn}`
    return await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        uint32_allow: type
      }),
      headers: {
        'Cookie': this.Bot.cookies['ti.qq.com'],
        'Content-type': 'application/json'
      }
    }).then(res => res.json()).catch(err => logger.error(err))
  }

  /**
     * @description: 更改好友申请方式
     * @param {*} at 类型1
     * @param {*} q
     * @param {*} a
     * @return {*}
     */
  async setFriendType (at, q = '', a = '') {
    const type = {
      1: '0',
      2: '1',
      3: '3'
    }
    let url = 'https://ti.qq.com/cgi-node/friend-auth/set'
    return await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        req: `{"at": ${type[at]},"q": "${q}","a": "${a}","l": [],"viaphone": 0}`
      }),
      headers: {
        'Cookie': this.Bot.cookies['ti.qq.com'],
        'Content-type': 'application/json'
      }
    }).then(res => res.json()).catch(err => logger.error(err))
  }

  /**
     * @description: 设置戳一戳开关
     * @param {Number} is 0为开启1为关闭
     */
  async setcyc (is) {
    let url = `https://zb.vip.qq.com/srf/QC_UniBusinessLogicServer_UniBusinessLogicObj/uniSet?g_tk=${this.Bot.bkn}`
    return await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        stLogin: {
          iKeyType: 1,
          iOpplat: 2,
          lUin: this.Bot.uin,
          sClientIp: '',
          sClientVer: '8.9.10',
          sSKey: 'MGOy0oTuvl'
        },
        stUniBusinessItem: {
          appid: 46,
          itemid: 1
        },
        stNudge: {
          ischangeswitch: 1,
          isclose: is,
          ischangecustomtext: 1,
          customtext: ''
        }
      }
      ),
      headers: {
        'Cookie': this.Bot.cookies['vip.qq.com'],
        'Content-type': 'application/json'
      }
    }).then(res => res.json()).catch(err => logger.error(err))
  }

  /** 今日打卡 */
  async signInToday (groupId) {
    let body = JSON.stringify({
      dayYmd: moment().format('YYYYMMDD'),
      offset: 0,
      limit: 10,
      uid: String(this.Bot.uin),
      groupId: String(groupId)
    })
    let url = `https://qun.qq.com/v2/signin/trpc/GetDaySignedList?g_tk=${this.getGtk('qun.qq.com', this.Bot)}`
    return await fetch(url, {
      method: 'POST',
      headers: this.headers,
      body
    }).then(res => res.json()).catch(err => logger.error(err))
  }

  /**
     * @description: 群发言榜单
     * @param {Number} groupId 群号
     * @param {Strng} time true为7天false为昨天
     */
  async SpeakRank (groupId, time = false) {
    let url = `https://qun.qq.com/m/qun/activedata/proxy/domain/qun.qq.com/cgi-bin/manager/report/list?bkn=${this.Bot.bkn}&gc=${groupId}&type=0&start=0&time=${time ? 1 : 0}`
    return await fetch(url, {
      headers: this.headers
    }).then(res => res.json()).catch(err => logger.error(err))
  }

  /**
     * @description: 群数据
     * @param {String} groupId 群号
     * @param {Strng} time true为7天false为昨天
     */
  async groupData (groupId, time = false) {
    let url = `https://qun.qq.com/m/qun/activedata/proxy/domain/qun.qq.com/cgi-bin/manager/report/index?gc=${groupId}&time=${time ? 1 : 0}&bkn=${this.Bot.bkn}`
    return await fetch(url, {
      headers: this.headers
    }).then(res => res.json())
  }

  // ---------------------------------字符---------------------------------------------

  /**
     * @description: 字符列表
     * @return {*}
     */
  async luckylist (groupId, start = 0, limit = 10) {
    let body = JSON.stringify({
      group_code: groupId,
      start,
      limit,
      need_equip_info: true
    })
    let url = `https://qun.qq.com/v2/luckyword/proxy/domain/qun.qq.com/cgi-bin/group_lucky_word/word_list?bkn=${this.Bot.bkn}`
    return await fetch(url, {
      method: 'POST',
      headers: this.headers,
      body
    }).then(res => res.json()).catch(err => logger.error(err))
  }

  /**
     * @description: 更换字符
     * @param {String} group_id 群号
     * @param {String} id 字符id
     */
  async equipLucky (group_id, id) {
    let body = JSON.stringify({
      group_code: group_id,
      word_id: id
    })
    let url = `https://qun.qq.com/v2/luckyword/proxy/domain/qun.qq.com/cgi-bin/group_lucky_word/equip?bkn=${this.Bot.bkn}`
    return await fetch(url, {
      method: 'POST',
      headers: this.headers,
      body
    }).then(res => res.json()).catch(err => logger.error(err))
  }

  /**
     * @description: 抽取幸运字符
     * @param {String} group_id 群号
     * @return {*}
     */
  async drawLucky (group_id) {
    let body = JSON.stringify({
      group_code: group_id
    })
    let url = `https://qun.qq.com/v2/luckyword/proxy/domain/qun.qq.com/cgi-bin/group_lucky_word/draw_lottery?bkn=${this.Bot.bkn}`
    return await fetch(url, {
      method: 'POST',
      headers: this.headers,
      body
    }).then(res => res.json()).catch(err => logger.error(err))
  }

  /**
     * @description: 开关幸运字符
     * @param {Number} groupId 群号
     * @param {Boolean} type
     */
  async swichLucky (groupId, type) {
    let body = JSON.stringify({
      group_code: groupId,
      cmd: type ? 1 : 2
    })
    let url = `https://qun.qq.com/v2/luckyword/proxy/domain/qun.qq.com/cgi-bin/group_lucky_word/setting?bkn=${this.Bot.bkn}`
    return await fetch(url, {
      method: 'POST',
      headers: this.headers,
      body
    }).then(res => res.json()).catch(err => logger.error(err))
  }

  /**
     * @description: 陌生人点赞
     * @param {Number} uid QQ号
     * @param {Number} times 数量
     * @return {Object}
     */
  async thumbUp (uid, times = 1) {
    let core = this.Bot.core
    if (!core) try {
      core = (await import('icqq')).core
    } catch (error) {
      throw Error('非icqq无法进行点赞')
    }
    if (times > 20) { times = 20 }
    let ReqFavorite
    if (this.Bot.fl.get(uid)) {
      ReqFavorite = core.jce.encodeStruct([
        core.jce.encodeNested([
          this.Bot.uin, 1, this.Bot.sig.seq + 1, 1, 0, Buffer.from('0C180001060131160131', 'hex')
        ]),
        uid, 0, 1, Number(times)
      ])
    } else {
      ReqFavorite = core.jce.encodeStruct([
        core.jce.encodeNested([
          this.Bot.uin, 1, this.Bot.sig.seq + 1, 1, 0, Buffer.from('0C180001060131160135', 'hex')
        ]),
        uid, 0, 5, Number(times)
      ])
    }
    const body = core.jce.encodeWrapper({ ReqFavorite }, 'VisitorSvc', 'ReqFavorite', this.Bot.sig.seq + 1)
    const payload = await this.Bot.sendUni('VisitorSvc.ReqFavorite', body)
    let result = core.jce.decodeWrapper(payload)[0]
    return { code: result[3], msg: result[4] }
  }

  /**
   * @description: 批量踢人
   * @param {Array} member 要踢的人的数组
   * @param {Number} groupId 群号
   * @return {*}
   */
  async deleteGroupMember (groupId, member) {
    let res = []
    for (let item of _.chunk(member, 20)) {
      let data = {
        gc: groupId,
        ul: item.join('|'),
        flag: 0,
        bkn: this.Bot.bkn
      }
      let url = 'https://qun.qq.com/cgi-bin/qun_mgr/delete_group_member'
      res.push(await request.post(url, {
        headers: {
          'Cookie': this.Bot.cookies['qun.qq.com'],
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        data,
        statusCode: 'json'
      }))
      await common.sleep(5000)
    }
    return res
  }

  /**
   * 获取QQ等级信息
   *
   * @param {string|number} userId QQ号码
   * @returns {Promise<Object>} 包含QQ等级信息的Promise对象
   */
  async getQQLevel (userId) {
    const url = 'https://club.vip.qq.com/api/vip/getQQLevelInfo'
    const params = {
      requestBody: JSON.stringify({
        'sClientIp': '127.0.0.1',
        'sSessionKey': 'MfT8vw0UyE',
        'iKeyType': 1,
        'iAppId': 0,
        'iUin': userId
      }),
      g_tk: this.getGtk('vip.qq.com')
    }
    return request.get(url, {
      params,
      headers: {
        cookie: this.Bot.cookies['vip.qq.com']
      },
      statusCode: 'json'
    })
  }

  /**
   * 自定义机型
   * @param {string} modelName
   * @param {string} modelShow
   * @returns
   */
  async setModel (modelName) {
    const url = 'https://proxy.vip.qq.com/cgi-bin/srfentry.fcgi'
    const data = {
      '13031': {
        req: {
          lUin: this.Bot.uin,
          sModel: encodeURIComponent(modelName),
          iAppType: 0,
          sIMei: this.Bot.device.imei,
          bShowInfo: true,
          sModelShow: encodeURIComponent(modelName),
          bRecoverDefault: !modelName
        }
      }
    }
    const params = {
      ts: Date.now(),
      g_tk: this.getGtk('vip.qq.com'),
      data: JSON.stringify(data),
      daid: 18
    }
    return request.get(url, {
      params,
      headers: {
        cookie: this.Bot.cookies['vip.qq.com']
      },
      statusCode: 'json'
    })
  }
}
