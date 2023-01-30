import fetch from 'node-fetch'
import lodash from 'lodash'
import { segment } from 'oicq'
/** API请求错误文案 */
const API_ERROR = '❎ 出错辣，请稍后重试'
export default new (class {
  constructor () {
    this.domain = 'http://api.liaobiao.top/api/bika'
    this.imgproxy = 'https://proxy.liaobiao.top/'
    this.imageQuality = 'original'
    this.hearder = {
      headers: {
        'x-image-quality': this.imageQuality
      }
    }
  }

  /**
   * @description: 搜索关键词
   * @param {String} keyword 关键词
   * @param {Number} page 页数
   * @return {*}
   */
  async search (keyword, page = 1) {
    let res = await fetch(`${this.domain}/advanced_search?keyword=${keyword}&page=${page}&sort=ld`, this.hearder)
      .then((res) => res.json())
      .catch((err) => console.log(err))
    if (!res) return { error: API_ERROR }
    let { docs, total, page: pg, pages } = res.data.comics
    if (total == 0) return { error: '未找到作品，换个关键词试试吧' }

    return [
      `共找到${total}个关于${keyword}的作品`,
      `当前为第${pg}页，共${pages}页`,
      ...docs.map((item) => {
        let { title, tags, categories, author, description, likesCount, thumb, _id } = item
        return [
          `id：${_id}\n`,
          `标题：${title}\n`,
          `作者：${author}\n`,
          `描述：${lodash.truncate(description)}\n`,
          `分类：${categories.join('，')}\n`,
          `喜欢：${likesCount}\n`,
          `tag：${lodash.truncate(tags.join(','))}\n`,
          segment.image(this.imgproxy + thumb.path)
        ]
      })
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
      `id: ${_id}, ${title}`,
      `共${total}张，当前为第${pg}页，共${pages}页`,
      docs.map(item => segment.image(this.imgproxy + item.media.path))
    ]
  }
})()
