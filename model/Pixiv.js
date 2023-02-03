import fetch from 'node-fetch'
import lodash from 'lodash'
import { segment } from 'oicq'
import moment from 'moment'
import { common } from './index.js'
import { Data } from '../components/index.js'
/** API请求错误文案 */
const API_ERROR = '❎ 出错辣，请稍后重试'

export default new class Pixiv {
  constructor () {
    this._proxy = 'i.pixiv.re'
    this.ranktype = Data.readJSON('data/pixiv/rankType.json')
    this.domain = 'http://api.liaobiao.top/api/pixiv'
    this.init()
  }

  async init () {
    this._proxy = await redis.get('yenai:proxy')
    if (!this.proxy) {
      await redis.set('yenai:proxy', 'i.pixiv.re')
      this._proxy = 'i.pixiv.re'
    }
  }

  get headers () {
    if (this.proxy == 'i.pximg.net') {
      return {
        Host: 'i.pximg.net',
        Referer: 'https://www.pixiv.net/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36 Edg/108.0.1462.46'
      }
    } else {
      return undefined
    }
  }

  get proxy () {
    return this._proxy
  }

  set proxy (value) {
    redis.set('yenai:proxy', value)
    this._proxy = value
  }

  /**
     * @description: 获取插画信息
     * @param {String} ids 插画ID
     * @return {Object}
     */
  async illust (ids, filter = false) {
    let api = `${this.domain}/illust?id=${ids}`
    let res = await fetch(api).then(res => res.json()).catch(err => console.log(err))
    if (!res) return { error: API_ERROR }

    if (res.error) {
      return { error: res.error?.user_message || '无法获取数据' }
    }
    let illust = this.format(res.illust)
    let { id, title, user, tags, total_bookmarks, total_view, url, create_date, x_restrict, illust_ai_type } = illust
    let msg = [
      `标题：${title}\n`,
      `画师：${user.name}\n`,
      `PID：${id}\n`,
      `UID：${user.id}\n`,
      `点赞：${total_bookmarks}\n`,
      `访问：${total_view}\n`,
      `isAI：${illust_ai_type == 2}\n`,
      `发布：${moment(create_date).format('YYYY-MM-DD HH:mm:ss')}\n`,
      `Tag：${tags.join('，')}\n`,
      `直链：https://pixiv.re/${id}.jpg\n`,
      `传送门：https://www.pixiv.net/artworks/${id}`
    ]
    if (filter && x_restrict) {
      let linkmsg = [
        '该作品不适合所有年龄段，请自行使用链接查看：'

      ]
      if (url.length > 1) {
        linkmsg.push(...url.map((item, index) => `\nhttps://pixiv.re/${id}-${index + 1}.jpg`))
      } else {
        linkmsg.push(`\nhttps://pixiv.re/${id}.jpg`)
      }
      return { error: linkmsg }
    }
    let img = await Promise.all(url.map(async item => await this.requestPixivImg(item)))
    return { msg, img }
  }

  /**
     * @description: 获取Pixiv榜单
     * @param {Number} page 页数
     * @param {Date} date 时间YYYY-MM-DD
     * @param {String} mode 榜单类型
     * @param {Boolean} r18 是否为R18榜单
     * @return {Array}
     */
  async Rank (page = 1, date = '', mode = '周', r18 = false) {
    // 转为大写
    mode = lodash.toUpper(mode)
    // 排行榜类型
    let type = this.ranktype[mode].type
    // 总张数
    let pageSizeAll = this.ranktype[mode].total
    // r18处理
    if (r18) {
      let R18 = this.ranktype[mode].r18
      if (!R18) return { error: '该排行没有不适合所有年龄段的分类哦~' }
      type = R18.type
      pageSizeAll = R18.total
    }
    // 总页数
    let pageAll = Math.ceil(pageSizeAll / 30)
    if (page > pageAll) {
      return { error: '哪有那么多图片给你辣(•̀へ •́ ╮ )' }
    }
    if (!date) date = moment().subtract(moment().utcOffset(9).hour() >= 12 ? 1 : 2, 'days').format('YYYY-MM-DD')

    let parame = `mode=${type}&page=${page}&date=${date}`
    // 请求api
    let api = `${this.domain}/rank?${parame}`
    let res = await fetch(api).then(res => res.json()).catch(err => console.log(err))

    if (!res || res.error || lodash.isEmpty(res.illusts)) {
      logger.mark('[椰奶Pixiv][排行榜]使用备用接口')
      res = await fetch(`https://api.obfs.dev/api/pixiv/rank?${parame}`).then(res => res.json())
        .catch(err => console.log(err))
    };
    if (!res) return { error: API_ERROR }
    if (res.error) return { error: res.error.message }
    if (lodash.isEmpty(res.illusts)) return { error: '暂无数据，请等待榜单更新哦(。-ω-)zzz' }

    let illusts = await Promise.all(res.illusts.map(async (item, index) => {
      let list = this.format(item)
      let { id, title, user, tags, total_bookmarks, image_urls } = list
      return [
        `标题：${title}\n`,
        `画师：${user.name}\n`,
        `PID：${id}\n`,
        `UID：${user.id}\n`,
        `点赞：${total_bookmarks}\n`,
        `排名：${(page - 1) * 30 + (index + 1)}\n`,
        `Tag：${lodash.truncate(tags)}\n`,
        await this.requestPixivImg(image_urls.large)
      ]
    }))
    let formatDate = res.next_url.match(/date=(\d{4}-\d{1,2}-\d{1,2})/)[1]
    formatDate = moment(formatDate, 'YYYY-MM-DD').format('YYYY年MM月DD日')
    if (/周/.test(mode)) {
      formatDate = `${moment(formatDate, 'YYYY年MM月DD日').subtract(6, 'days').format('YYYY年MM月DD日')} ~ ${formatDate}`
    } else if (/月/.test(mode)) {
      formatDate = `${moment(formatDate, 'YYYY年MM月DD日').subtract(29, 'days').format('YYYY年MM月DD日')} ~ ${formatDate}`
    }
    let list = [
      `${formatDate}的${mode}${r18 ? 'R18' : ''}榜`,
      `当前为第${page}页，共${pageAll}页，本页共${illusts.length}张，总共${pageSizeAll}张`
    ]
    if (page < pageAll) {
      list.push(`可使用 "#看看${date ? `${formatDate}的` : ''}${mode}${r18 ? 'R18' : ''}榜第${page - 0 + 1}页" 翻页`)
    }

    list.push(...illusts)
    return list
  }

  /**
     * @description: 根据关键词搜图
     * @param {String} tag 关键词
     * @param {String} page 页数
     * @return {Array}
     */
  async searchTags (tag, page = 1) {
    let api = `https://www.vilipix.com/api/v1/picture/public?limit=30&tags=${tag}&sort=new&offset=${(page - 1) * 30}`
    let res = await fetch(api).then(res => res.json()).catch(err => console.log(err))
    if (!res) return { error: API_ERROR }
    if (res.data.count == 0) {
      return { error: '呜呜呜，人家没有找到相关的插画(ó﹏ò｡)' }
    }

    let pageall = Math.ceil(res.data.count / 30)

    if (page > pageall) {
      return { error: '啊啊啊，淫家给不了你那么多辣d(ŐдŐ๑)' }
    }

    let list = [
      `当前为第${page}页，共${pageall}页，本页共${res.data.rows.length}张，总共${res.data.count}张`
    ]
    if (page < pageall) {
      list.push(`可使用 "#tag搜图${tag}第${page - 0 + 1}页" 翻页`)
    }
    res.data.rows.sort((a, b) => b.like_total - a.like_total)
    for (let i of res.data.rows) {
      let { picture_id, title, original_url, tags } = i
      list.push([
        `标题：${title}\n`,
        `PID：${picture_id}\n`,
        `Tag：${lodash.truncate(tags)}\n`,
        segment.image(original_url)
      ])
    }
    return list
  }

  /**
     * @description: tag搜图pro
     * @param {String} tag 关键词
     * @param {String} page 页数
     * @return {*}
     */
  async searchTagspro (tag, page = 1, isfilter = true) {
    let api = `${this.domain}/search?word=${tag}&page=${page}&order=popular_desc`
    let res = await fetch(api).then(res => res.json()).catch(err => console.log(err))
    if (!res) return { error: API_ERROR }
    if (res.error) return { error: res.error.message }
    if (lodash.isEmpty(res.illusts)) return { error: '宝~没有数据了哦(๑＞︶＜)و' }

    let illusts = []
    let filter = 0
    let NowNum = res.illusts.length
    for (let i of res.illusts) {
      let { id, title, user, tags, total_bookmarks, image_urls, x_restrict } = this.format(i)
      if (isfilter && x_restrict) {
        filter++
        continue
      }
      illusts.push([
        `标题：${title}\n`,
        `画师：${user.name}\n`,
        `PID：${id}\n`,
        `UID：${user.id}\n`,
        `点赞：${total_bookmarks}\n`,
        `Tag：${lodash.truncate(tags)}\n`,
        await this.requestPixivImg(image_urls.large)
      ])
    }
    if (lodash.isEmpty(illusts)) return { error: '该页全为涩涩内容已全部过滤(#／。＼#)' }

    return [
      `本页共${NowNum}张${filter ? `，过滤${filter}张` : ''}\n可尝试使用 "#tagpro搜图${tag}第${page - 0 + 1}页" 翻页\n无数据则代表无下一页`,
      ...illusts
    ]
  }

  /**
     * @description: 获取热门tag
     * @return {Array}
     */
  async PopularTags () {
    let api = `${this.domain}/tags`

    let res = await fetch(api).then(res => res.json()).catch(err => console.log(err))
    if (!res) return { error: API_ERROR }
    if (!res.trend_tags) return { error: '呜呜呜，没有获取到数据(๑ १д१)' }

    let list = []
    for (let i of res.trend_tags) {
      let { tag, translated_name } = i
      let url = i.illust.image_urls.large.replace('i.pximg.net', this.proxy)
      list.push(
        [
          `Tag：${tag}\n`,
          `Translated：${translated_name}\n`,
          `Pid：${i.illust.id}\n`,
          await this.requestPixivImg(url)
        ]
      )
    }
    return list
  }

  /**
     * @description: 搜索用户插画
     * @param {Number|String} keyword 用户uid或名称
     * @param {Number|String} page 页数
     * @param {Boolean} isfilter 是否过滤敏感内容
     * @return {Array}
     */
  async userIllust (keyword, page = 1, isfilter = true) {
    // 关键词搜索
    if (!/^\d+$/.test(keyword)) {
      let wordapi = `${this.domain}/search_user?word=${keyword}`
      let wordlist = await fetch(wordapi).then(res => res.json()).catch(err => console.log(err))
      if (!wordlist) return { error: API_ERROR }

      if (lodash.isEmpty(wordlist.user_previews)) return { error: '呜呜呜，人家没有找到这个淫d(ŐдŐ๑)' }

      keyword = wordlist.user_previews[0].user.id
    }
    // 作品
    let api = `${this.domain}/member_illust?id=${keyword}&page=${page}`
    let res = await fetch(api).then(res => res.json()).catch(err => console.log(err))
    if (!res) return { error: API_ERROR }
    if (res.error) return { error: res.error.message }
    // 没有作品直接返回信息
    if (lodash.isEmpty(res.illusts)) return { error: page >= 2 ? '这一页没有作品辣（＞人＜；）' : 'Σ(っ °Д °;)っ这个淫居然没有作品' }

    let illusts = []
    let filter = 0
    let NowNum = res.illusts.length
    for (let i of res.illusts) {
      let { id: pid, title, tags, total_bookmarks, total_view, url, x_restrict } = this.format(i)
      if (isfilter && x_restrict) {
        filter++
        continue
      }
      illusts.push([
        `标题：${title}\n`,
        `PID：${pid}\n`,
        `点赞：${total_bookmarks}\n`,
        `访问：${total_view}\n`,
        `Tag：${lodash.truncate(tags)}\n`,
        segment.image(url[0], undefined, undefined, this.headers)
      ])
    }
    if (lodash.isEmpty(illusts)) return { error: '该页全为涩涩内容已全部过滤(#／。＼#)' }
    let { id: uid, name, profile_image_urls } = res.user
    let url = profile_image_urls.medium.replace('i.pximg.net', this.proxy)
    return [
      [
        await this.requestPixivImg(url),
        `\nUid：${uid}\n`,
        `画师：${name}\n`
      ],
      `本页共${NowNum}张${filter ? `，过滤${filter}张` : ''}\n可尝试使用 "#uid搜图${keyword}第${page - 0 + 1}页" 翻页\n无数据则代表无下一页`,
      ...illusts
    ]
  }

  /**
   * @description:搜索用户
   * @param {String} word 用户name
   * @param {Number} page 页数
   * @param {Boolean} isfilter 是否过滤敏感内容
   * @return {Array} 可直接发送的消息数组
   */
  async searchUser (word, page = 1, isfilter = true) {
    let api = `${this.domain}/search_user?word=${word}&page=${page}&size=10`
    let user = await fetch(api).then(res => res.json()).catch(err => console.log(err))
    if (!user) return { error: API_ERROR }
    if (user.error) return { error: user.error.message }
    if (lodash.isEmpty(user.user_previews)) return { error: '呜呜呜，人家没有找到这个淫d(ŐдŐ๑)' }

    let msg = await Promise.all(user.user_previews.slice(0, 10).map(async (item, index) => {
      let { id, name, profile_image_urls } = item.user
      let ret = [
        `${(page - 1) * 10 + index + 1}、`,
        await this.requestPixivImg(profile_image_urls),
        `\nid: ${id}\n`,
        `name: ${name}\n`,
        '作品:\n'
      ]
      for (let i of item.illusts) {
        let { image_urls, x_restrict } = this.format(i)
        if (isfilter && x_restrict) continue
        ret.push(await this.requestPixivImg(image_urls.square_medium))
      }
      return ret
    }))
    if (msg.length == 30)msg.unshift(`可尝试使用 "#user搜索${word}第${page + 1}页" 翻页`)
    msg.unshift(`当前为第${page}页，已${isfilter ? '开启' : '关闭'}过滤`)
    return msg
  }

  /**
     * @description: 随机图片
     * @return {Array}
     */
  async randomImg (limit) {
    let api = `https://www.vilipix.com/api/v1/picture/recommand?limit=${limit}&offset=${lodash.random(1, 700)}`
    let res = await fetch(api).then(res => res.json()).catch(err => console.log(err))
    if (!res) return { error: API_ERROR }
    if (!res.data || !res.data.rows) return { error: '呜呜呜，没拿到瑟瑟的图片(˃ ⌑ ˂ഃ )' }

    let list = []
    for (let i of res.data.rows) {
      let { picture_id, title, regular_url, tags, like_total } = i
      list.push([
        `标题：${title}\n`,
        `点赞: ${like_total}\n`,
        `插画ID：${picture_id}\n`,
        `Tag：${lodash.truncate(tags)}\n`,
        await this.requestPixivImg(regular_url)
      ])
    }
    return list
  }

  /**
     * @description: 相关作品
     * @param {String} pid
     * @return {*}
     */
  async related (pid, isfilter = true) {
    let api = `${this.domain}/related?id=${pid}`
    let res = await fetch(api).then(res => res.json()).catch(err => console.log(err))
    if (!res) return { error: API_ERROR }
    if (res.error) return { error: res.error.user_message }
    if (lodash.isEmpty(res.illusts)) return { error: '呃...没有数据(•ิ_•ิ)' }

    let illusts = []
    let filter = 0
    for (let i of res.illusts) {
      let { id, title, user, tags, total_bookmarks, image_urls, x_restrict } = this.format(i)
      if (isfilter && x_restrict) {
        filter++
        continue
      }
      illusts.push([
        `标题：${title}\n`,
        `画师：${user.name}\n`,
        `PID：${id}\n`,
        `UID：${user.id}\n`,
        `点赞：${total_bookmarks}\n`,
        `Tag：${lodash.truncate(tags)}\n`,
        await this.requestPixivImg(image_urls.large)
      ])
    }
    if (lodash.isEmpty(illusts)) return { error: '啊啊啊！！！居然全是瑟瑟哒不给你看(＊／ω＼＊)' }

    return [
      `Pid:${pid}的相关作品，共${res.illusts.length}张${filter ? `，过滤${filter}张` : ''}`,
      ...illusts
    ]
  }

  /** p站单图 */
  async pximg (type) {
    let url = 'https://ovooa.com/API/Pximg/'
    if (type) {
      url = 'https://xiaobapi.top/api/xb/api/setu.php'
    }
    let res = await fetch(url).then(res => res.json()).catch(err => console.log(err))
    if (!res) return { error: API_ERROR }
    let { pid, uid, title, author, tags, urls, r18 } = res.data[0] || res.data
    urls = urls.original.replace(/i.der.ink|i.pixiv.re/, this.proxy)
    let msg = [
      `Pid: ${pid}\n`,
      `Uid: ${uid}\n`,
      r18 ? `R18: ${r18}\n` : '',
      `标题：${title}\n`,
      `画师：${author}\n`,
      `Tag：${tags.join('，')}\n`,
      await this.requestPixivImg(urls)
    ]
    return msg
  }

  /**
   * @description: 请求p站图片
   * @param {String} url
   */
  async requestPixivImg (url) {
    url = url.replace('i.pximg.net', this.proxy)
    return common.proxyRequestImg(url, { headers: this.headers })
  }

  /** 开始执行文案 */
  get startMsg () {
    return lodash.sample([
      '你先别急，正在给你搜了(。-ω-)zzz',
      '你先别急，马上去给你找哦ε(*´･ω･)з',
      '你先别急，正在给你搜了(。-ω-)zzz',
      '你先别急，马上去给你找哦ε(*´･ω･)з'
    ])
  }

  /**
     * @description: 格式化
     * @param {Object} illusts 处理对象
     * @return {Object}
     * title  标题
     * id  pid
     * total_bookmarks  点赞
     * total_view  访问量
     * tags  标签
     * url  图片链接
     * user  作者信息
     * image_urls  单张图片
     * x_restrict  是否为全年龄
     * create_date  发布时间
     * illust_ai_type  是否为AI作品
     * visible  是否为可见作品
     */
  format (illusts) {
    let url = []
    let { tags, meta_single_page, meta_pages } = illusts
    tags = lodash.uniq(lodash.compact(lodash.flattenDeep(tags?.map(item => Object.values(item)))))
    if (!lodash.isEmpty(meta_single_page)) {
      url.push(meta_single_page.original_image_url)
    } else {
      url = meta_pages.map(item => item.image_urls.original)
    }
    return {
      ...illusts,
      tags,
      url
    }
  }
}()
