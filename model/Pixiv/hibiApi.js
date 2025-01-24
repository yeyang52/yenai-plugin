import { Config } from "#yenai.components"
import request from "#yenai.request"

export default new class HibiAPI {
  constructor() {
    this.domain = `${Config.pixiv.hibiAPI}/api/pixiv`
  }

  async illust(params) {
    return await request.get(`${this.domain}/illust`, {
      params,
      responseType: "json"
    })
  }

  async rank(params) {
    return await request.get(`${this.domain}/rank`, {
      params,
      responseType: "json"
    })
  }

  async search(params) {
    return await request.get(`${this.domain}/search`, {
      params,
      responseType: "json"
    })
  }

  async tags() {
    return await request.get(`${this.domain}/tags`, {
      responseType: "json"
    })
  }

  async search_user(params) {
    return await request.get(`${this.domain}/search_user`, {
      params,
      responseType: "json"
    })
  }

  async related(params) {
    return await request.get(`${this.domain}/related`, {
      params,
      responseType: "json"
    })
  }

  async member_illust(params) {
    return await request.get(`${this.domain}/member_illust`, {
      params,
      responseType: "json"
    })
  }
}()
