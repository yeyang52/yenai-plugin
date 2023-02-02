import fetch from 'node-fetch'
import lodash from 'lodash'
import { Pixiv } from './index.js'
/** API请求错误文案 */
const API_ERROR = '❎ 出错辣，请稍后重试'
export default new (class {
  constructor () {
    this.domain = 'http://api.liaobiao.top/api/bika'
    this.imgproxy = null
    this.imageQuality = 'medium'
    this.hearder = {
      headers: {
        'x-image-quality': this.imageQuality,
        'user-agent': 'Yenai-Plugin-bika'
      }
    }
    this.init()
  }

  async init () {
    if (!await redis.get('yenai:bika:directConnection')) {
      this.imgproxy = 'https://p.sesepic.top/static/'
    } else {
      this.imgproxy = false
    }
    this.imageQuality = await redis.get('yenai:bika:imageQuality') ?? 'medium'
  }

  /**
   * @description: 搜索关键词
   * @param {String} keyword 关键词
   * @param {Number} page 页数
   * @param {'dd'|'da'|'ld'|'vd'} sort dd : 最新发布 da : 最早发布 ld : 最多喜欢 vd : 最多浏览
   * @param {String} type 搜索类型
   * @return {Array}
   */
  async search (keyword, page = 1, type = 'advanced', sort = 'ld') {
    let types = [
      {
        alias: ['关键词', 'advanced', '高级'],
        url: `${this.domain}/advanced_search?keyword=${keyword}&page=${page}&sort=${sort}`
      },
      {
        alias: ['类别', 'category'],
        url: `${this.domain}/category_list?category=${keyword}&page=${page}&sort=${sort}`
      },
      {
        alias: ['作者', 'author'],
        url: `${this.domain}/author_list?author=${keyword}&page=${page}&sort=${sort}`
      }
    ]
    type = types.find(item => item.alias.includes(type))
    let res = await fetch(type.url, this.hearder)
      .then((res) => res.json())
      .catch((err) => console.log(err))
    if (!res) return { error: API_ERROR }
    let { docs, total, page: pg, pages } = res.data.comics
    if (total == 0) return { error: `未找到作品，换个${type.alias[0]}试试吧` }
    return [
      `共找到${total}个关于「${keyword}」${type.alias[0]}的作品`,
      `当前为第${pg}页，共${pages}页`,
      ...await Promise.all(docs.map(async (item) => {
        let { title, tags, categories, author, description = '未知', likesCount, thumb, _id, finished } = item
        return [
          `id：${_id}\n`,
          `标题：${title}\n`,
          `作者：${author}\n`,
          `描述：${lodash.truncate(description)}\n`,
          `分类：${categories.join('，')}\n`,
          `喜欢：${likesCount}\n`,
          `完结：${finished}\n`,
          tags ? `tag：${lodash.truncate(tags.join(','))}\n` : '',
          await Pixiv.proxyFetchImg((this.imgproxy ?? `${thumb.fileServer}/static/`) + thumb.path)
        ]
      }))
    ]
  }

  /**
   * @description:漫画页面
   * @param {String} id 作品id
   * @param {Number} page 页数
   * @param {*} order ...
   * @return {*}
   */
  async comicPage (id, page = 1, order = 1) {
    let res = await fetch(`${this.domain}/comic_page?id=${id}&page=${page}&order=${order}`, this.hearder)
      .then((res) => res.json())
      .catch((err) => console.log(err))
    if (!res) return { error: API_ERROR }
    if (res.error) return { error: res.message }
    let { docs, total, page: pg, pages } = res.data.pages
    let { _id, title } = res.data.ep
    return [
      `id: ${_id}， ${title}`,
      `共${total}张，当前为第${pg}页，共${pages}页，当前为第${order}话`,
      ...await Promise.all(docs.map(async item => await Pixiv.proxyFetchImg((this.imgproxy ?? `${item.media.fileServer}/static/`) + item.media.path)))
    ]
  }

  /** 类别列表 */
  async categories () {
    let key = 'yenai:bika:categories'
    let res = JSON.parse(await redis.get(key))
    if (!res) {
      res = await fetch(`${this.domain}/categories`, this.hearder)
        .then((res) => res.json())
        .catch((err) => console.log(err))
      if (!res) return { error: API_ERROR }
      if (res.error) return { error: res.message }
      res = res.data.categories.filter(item => !item.isWeb)
      await redis.set(key, JSON.stringify(res), { EX: 43200 })
    }
    return await Promise.all(res.map(async item => {
      let { title, thumb, description = '未知' } = item
      let { fileServer, path } = thumb
      fileServer = /static/.test(fileServer) ? fileServer : fileServer + '/static/'
      return [
        `category: ${title}\n`,
        `描述:${description}\n`,
        await Pixiv.proxyFetchImg((/storage(-b|1).picacomic.com/.test(fileServer) && this.imgproxy ? this.imgproxy : fileServer) + path)
      ]
    }))
  }

  async comicDetail (id) {
    let res = await fetch(`${this.domain}/comic_detail?id=${id}`, this.hearder)
      .then((res) => res.json())
      .catch((err) => console.log(err))
    if (!res) return { error: API_ERROR }
    if (res.error) return { error: res.message }
    let {
      _id, title, description, author, chineseTeam, categories, tags, pagesCount, epsCount, finished, totalLikes, totalViews, totalComments, thumb
    } = res.data.comic
    return [
      `id: ${_id}\n`,
      `title：${title}\n`,
      `描述：${lodash.truncate(description)}\n`,
      `作者：${author}\n`,
      `汉化：${chineseTeam}\n`,
      `页数：${pagesCount}\n`,
      `话数：${epsCount}\n`,
      `完结：${finished}\n`,
      `喜欢：${totalLikes}\n`,
      `浏览量：${totalViews}\n`,
      `评论量：${totalComments}\n`,
      `分类：${categories.join('，')}\n`,
      `tag：${tags.join('，')}`,
      await Pixiv.proxyFetchImg((this.imgproxy ?? `${thumb.fileServer}/static/`) + thumb.path)
    ]
  }
})()
