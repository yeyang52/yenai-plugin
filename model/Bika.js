import _ from "lodash"
import request from "../lib/request/request.js"
import { Config } from "../components/index.js"

export default new (class {
  constructor () {
    this.domain = "https://api.obfs.dev/api/bika"
    this.hearder = {
      headers: {
        "x-image-quality": Config.bika.imageQuality
      }
    }
    this.searchCaching = null
    this.idNext = null
  }

  get imgproxy () {
    return Config.bika.bikaDirectConnection ? undefined : `https://${Config.bika.bikaImageProxy}/`
  }

  /**
   * 关键词搜索作品
   * @param {string} keyword - 搜索关键词
   * @param {number} [page] - 页码，默认为1
   * @param {string} [type] - 搜索类型：advanced（高级）、category（类别）、author（作者），默认为'advanced'
   * @param {'dd'|'da'|'ld'|'vd'} [sort] - 排序方式：dd（最新发布）、da（最早发布）、ld（最多喜欢）、vd（最多浏览），默认为'ld'
   * @throws {Error} 当未找到作品时，会抛出异常
   * @returns {Array<string>} 返回搜索结果信息数组
   */
  async search (keyword, page = 1, type = "advanced", sort = "ld") {
    let types = [
      {
        alias: ["关键词", "advanced", "高级"],
        url: `${this.domain}/advanced_search?keyword=${keyword}&page=${page}&sort=${sort}`
      },
      {
        alias: ["类别", "category"],
        url: `${this.domain}/category_list?category=${keyword}&page=${page}&sort=${sort}`
      },
      {
        alias: ["作者", "author"],
        url: `${this.domain}/author_list?author=${keyword}&page=${page}&sort=${sort}`
      }
    ]
    type = types.find(item => item.alias.includes(type))
    let res = await request.get(type.url, this.hearder)
      .then(res => res.json())
      .catch(err => {
        logger.error(err)
        throw new ReplyError(`bika search Error，${err.message.match(/reason:(.*)/i) || err.message}`)
      })
    let { docs, total, page: pg, pages } = res.data.comics
    if (total == 0) throw new ReplyError(`未找到作品，换个${type.alias[0]}试试吧`)
    this.searchCaching = docs
    let msg = [
      `共找到${total}个关于「${keyword}」${type.alias[0]}的作品`,
      `当前为第${pg}页，共${pages}页`
    ]
    for (let [index, item] of docs.entries()) {
      let { title, tags, categories, author, description = "未知", likesCount, thumb, _id, finished } = item
      msg.push(_id)
      msg.push([
          `${index + 1}、${title}\n`,
          `作者：${author}\n`,
          `描述：${_.truncate(description)}\n`,
          `分类：${categories.join("，")}\n`,
          `喜欢：${likesCount}\n`,
          `完结：${finished}\n`,
          tags ? `tag：${_.truncate(tags.join(","))}\n` : "",
          await this._requestBikaImg(thumb.fileServer, thumb.path)
      ])
    }
    return msg
  }

  /**
   * 获取漫画某一话某一页的信息及图片列表
   * @async
   * @param {string} id - 漫画id
   * @param {number} [page] - 页码，默认为1
   * @param {number} [order] - 话数，默认为1
   * @returns {Promise<string[]>} - 返回一个数组，包含漫画某一话某一页的信息及图片列表
   * @throws {Error} - 如果返回结果中包含error，则抛出异常
   */
  async comicPage (id, page = 1, order = 1) {
    let res = await request.get(`${this.domain}/comic_page?id=${id}&page=${page}&order=${order}`, this.hearder)
      .then((res) => res.json())
      .catch(err => {
        logger.error(err)
        throw new ReplyError(`bika comicPage Error，${err.message.match(/reason:(.*)/i) || err.message}`)
      })
    if (res.error) throw new ReplyError(res.message)
    this.idNext = {
      id, page, order
    }
    let { docs, total, page: pg, pages } = res.data.pages
    let { _id, title } = res.data.ep
    return [
      `id: ${_id}， ${title}`,
      `共${total}张，当前为第${pg}页，共${pages}页，当前为第${order}话`,
      ...await Promise.all(docs.map(async item => await this._requestBikaImg(item.media.fileServer, item.media.path)))
    ]
  }

  async viewComicPage (num) {
    if (!this.searchCaching) throw new ReplyError("请先搜索后再使用此命令")
    let id = this.searchCaching[num]._id
    if (!id) throw new ReplyError("未获取到目标作品，请使用id进行查看")
    return this.comicPage(id)
  }

  /**
   * 获取下一个漫画页面或漫画章节的信息及图片列表
   * @async
   * @param {string} [type] - 请求的类型，可选值为'comicPage'或'chapter'，默认为'comicPage'
   * @returns {Promise<string[]>} - 返回一个数组，包含下一个漫画页面或漫画章节的信息及图片列表
   * @throws {Error} - 如果未找到上一个id，则抛出异常
   */
  async next (type = "comicPage") {
    if (!this.idNext) throw new ReplyError("未找到上一个id")
    let { id, page, order } = this.idNext
    if (type == "chapter") {
      order++
      page = 1
    } else {
      page++
    }
    return await this.comicPage(id, page, order).then(res => {
      this.idNext = { id, page, order }
      return res
    })
  }

  /** 类别列表 */
  async categories () {
    let key = "yenai:bika:categories"
    let res = JSON.parse(await redis.get(key))
    if (!res) {
      res = await request.get(`${this.domain}/categories`, this.hearder)
        .then((res) => res.json())
        .catch(err => {
          logger.error(err)
          throw new ReplyError(`bika categories Error，${err.message.match(/reason:(.*)/i) || err.message}`)
        })
      if (res.error) throw new ReplyError(res.message)
      res = res.data.categories.filter(item => !item.isWeb)
      await redis.set(key, JSON.stringify(res), { EX: 43200 })
    }
    return await Promise.all(res.map(async item => {
      let { title, thumb, description = "未知" } = item
      return [
        `category: ${title}\n`,
        `描述:${description}\n`,
        await this._requestBikaImg(thumb.fileServer, thumb.path)
      ]
    }))
  }

  /**
   * 获取指定id的Bika漫画详细信息
   * @async
   * @param {string} id - 漫画的id
   * @returns {Promise<string[]>} - 返回一个由字符串组成的数组，包含漫画的详细信息和封面图片
   */
  async comicDetail (id) {
    let res = await request.get(`${this.domain}/comic_detail?id=${id}`, this.hearder)
      .then((res) => res.json())
      .catch(err => {
        logger.error(err)
        throw new ReplyError(`bika comicDetail Error，${err.message.match(/reason:(.*)/i) || err.message}`)
      })
    if (res.error) throw new ReplyError(res.message)
    let {
      _id, title, description, author, chineseTeam, categories, tags, pagesCount, epsCount, finished, totalLikes, totalViews, totalComments, thumb
    } = res.data.comic
    return [
      `id: ${_id}\n`,
      `title：${title}\n`,
      `描述：${_.truncate(description)}\n`,
      `作者：${author}\n`,
      `汉化：${chineseTeam}\n`,
      `页数：${pagesCount}\n`,
      `话数：${epsCount}\n`,
      `完结：${finished}\n`,
      `喜欢：${totalLikes}\n`,
      `浏览量：${totalViews}\n`,
      `评论量：${totalComments}\n`,
      `分类：${categories.join("，")}\n`,
      `tag：${tags.join("，")}`,
      await this._requestBikaImg(thumb.fileServer, thumb.path)
    ]
  }

  /**
   * 请求Bika漫画网站的图片
   * @async
   * @param {string} fileServer - 图片所在的文件服务器
   * @param {string} path - 图片的路径
   * @returns {Promise<import('icqq').ImageElem>} - 返回构造图片消息
   */
  async _requestBikaImg (fileServer, path) {
    fileServer = /static/.test(fileServer) ? fileServer : fileServer + "/static/"
    let url = (/picacomic.com/.test(fileServer) && this.imgproxy ? this.imgproxy : fileServer) + path
    return request.proxyRequestImg(url)
  }
})()
