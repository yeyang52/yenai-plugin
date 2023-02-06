import lodash from 'lodash'
import request from '../lib/request/request.js'
import { Config } from '../components/index.js'

export default new (class {
  constructor () {
    this.domain = 'http://api.liaobiao.top/api/bika'
    this.hearder = {
      headers: {
        'x-image-quality': Config.bika.imageQuality,
        'User-Agent': 'Yenai-Plugin-bika'
      }
    }
  }

  get imgproxy () {
    return Config.bika.bikaDirectConnection ? undefined : `https://${Config.bika.bikaImageProxy}/`
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
    let res = await request.get(type.url, this.hearder)
      .then(res => res.json())
      .catch(err => {
        logger.error(err)
        throw Error(`bika search Error，reason：${err.message.match(/reason:(.*)/)[1]}`)
      })
    let { docs, total, page: pg, pages } = res.data.comics
    if (total == 0) throw Error(`未找到作品，换个${type.alias[0]}试试吧`)
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
          await this.requestBikaImg(thumb.fileServer, thumb.path)
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
    let res = await request.get(`${this.domain}/comic_page?id=${id}&page=${page}&order=${order}`, this.hearder)
      .then((res) => res.json())
      .catch(err => {
        logger.error(err)
        throw Error(`bika comicPage Error，reason：${err.message.match(/reason:(.*)/)[1]}`)
      })
    if (res.error) throw Error(res.message)
    let { docs, total, page: pg, pages } = res.data.pages
    let { _id, title } = res.data.ep
    return [
      `id: ${_id}， ${title}`,
      `共${total}张，当前为第${pg}页，共${pages}页，当前为第${order}话`,
      ...await Promise.all(docs.map(async item => await this.requestBikaImg(item.media.fileServer, item.media.path)))
    ]
  }

  /** 类别列表 */
  async categories () {
    let key = 'yenai:bika:categories'
    let res = JSON.parse(await redis.get(key))
    if (!res) {
      res = await request.get(`${this.domain}/categories`, this.hearder)
        .then((res) => res.json())
        .catch(err => {
          logger.error(err)
          throw Error(`bika categories Error，reason：${err.message.match(/reason:(.*)/)[1]}`)
        })
      if (res.error) throw Error(res.message)
      res = res.data.categories.filter(item => !item.isWeb)
      await redis.set(key, JSON.stringify(res), { EX: 43200 })
    }
    return await Promise.all(res.map(async item => {
      let { title, thumb, description = '未知' } = item
      return [
        `category: ${title}\n`,
        `描述:${description}\n`,
        await this.requestBikaImg(thumb.fileServer, thumb.path)
      ]
    }))
  }

  /**
   * @description: 作品详情
   * @param {String} id
   * @return {*}
   */
  async comicDetail (id) {
    let res = await request.get(`${this.domain}/comic_detail?id=${id}`, this.hearder)
      .then((res) => res.json())
      .catch(err => {
        logger.error(err)
        throw Error(`bika comicDetail Error，reason：${err.message.match(/reason:(.*)/)[1]}`)
      })
    if (res.error) throw Error(res.message)
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
      await this.requestBikaImg(thumb.fileServer, thumb.path)
    ]
  }

  async requestBikaImg (fileServer, path) {
    fileServer = /static/.test(fileServer) ? fileServer : fileServer + '/static/'
    let url = (/picacomic.com/.test(fileServer) && this.imgproxy ? this.imgproxy : fileServer) + path
    logger.debug(`Bika getImg URL: ${url}`)
    return request.proxyRequestImg(url)
  }
})()
