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

  async search (keyword, page = 1) {
    let res = await fetch(`${this.domain}/advanced_search?keyword=${keyword}&page=${page}&sort=ld`, this.hearder)
      .then((res) => res.json())
      .catch((err) => console.log(err))
    if (!res) return { error: API_ERROR }
    let { docs } = res.data.comics
    return docs.map((item) => {
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
  }

  async comicPage (id, page = 1, order = 1) {
    let res = await fetch(`${this.domain}/comic_page?id=${id}&page=${page}&order=${order}`, this.hearder)
      .then((res) => res.json())
      .catch((err) => console.log(err))
    if (!res) return { error: API_ERROR }
    if (res.error) return { error: res.message }
    return res.data.pages.docs.map(item => segment.image(this.imgproxy + item.media.path))
  }
})()
