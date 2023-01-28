import fetch from 'node-fetch'
import md5 from 'md5'
import lodash from 'lodash'

const API_ERROR = '出了点小问题，待会再试试吧'

export default new class Interface {
  constructor () {
    this.langtype = [{
      code: 'ar',
      label: '阿拉伯语',
      alphabet: 'A'
    }, {
      code: 'de',
      label: '德语',
      alphabet: 'D'
    }, {
      code: 'ru',
      label: '俄语',
      alphabet: 'E'
    }, {
      code: 'fr',
      label: '法语',
      alphabet: 'F'
    }, {
      code: 'ko',
      label: '韩语',
      alphabet: 'H'
    }, {
      code: 'nl',
      label: '荷兰语',
      alphabet: 'H'
    }, {
      code: 'pt',
      label: '葡萄牙语',
      alphabet: 'P'
    }, {
      code: 'ja',
      label: '日语',
      alphabet: 'R'
    }, {
      code: 'th',
      label: '泰语',
      alphabet: 'T'
    }, {
      code: 'es',
      label: '西班牙语',
      alphabet: 'X'
    }, {
      code: 'en',
      label: '英语',
      alphabet: 'Y'
    }, {
      code: 'it',
      label: '意大利语',
      alphabet: 'Y'
    }, {
      code: 'vi',
      label: '越南语',
      alphabet: 'Y'
    }, {
      code: 'id',
      label: '印度尼西亚语',
      alphabet: 'Y'
    }, {
      code: 'zh-CHS',
      label: '中文',
      alphabet: 'Z'
    }]
  }

  /** 有道翻译 */
  async youdao (msg, to = 'auto', from = 'auto') {
    if (to != 'auto') to = this.langtype.find(item => item.label == to)?.code
    if (from != 'auto') from = this.langtype.find(item => item.label == from)?.code
    if (!to || !from) return `未找到翻译的语种，支持的语言为：\n${this.langtype.map(item => item.label).join('，')}\n示例：#翻译你好 - 自动翻译\n#日语翻译你好 - 指定翻译为语种\n#中文-日语翻译你好 - 指定原语言翻译为指定语言`
    console.log(to, from)
    // 翻译结果为空的提示
    const RESULT_ERROR = '找不到翻译结果'
    // API 请求错误提示
    const qs = (obj) => {
      let res = ''
      for (const [k, v] of Object.entries(obj)) { res += `${k}=${encodeURIComponent(v)}&` }
      return res.slice(0, res.length - 1)
    }
    const appVersion = '5.0 (Windows NT 10.0; Win64; x64) Chrome/98.0.4750.0'
    const payload = {
      from,
      to,
      bv: md5(appVersion),
      client: 'fanyideskweb',
      doctype: 'json',
      version: '2.1',
      keyfrom: 'fanyi.web',
      action: 'FY_BY_DEFAULT',
      smartresult: 'dict'
    }
    const headers = {
      Host: 'fanyi.youdao.com',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/98.0.4758.102',
      Referer: 'https://fanyi.youdao.com/',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      Cookie: 'OUTFOX_SEARCH_USER_ID_NCOO=133190305.98519628; OUTFOX_SEARCH_USER_ID="2081065877@10.169.0.102";'
    }
    const api = 'https://fanyi.youdao.com/translate_o?smartresult=dict&smartresult=rule'
    const key = 'Ygy_4c=r#e#4EX^NUGUc5'

    const i = msg // 翻译的内容
    const lts = '' + new Date().getTime()
    const salt = lts + parseInt(String(10 * Math.random()), 10)
    const sign = md5(payload.client + i + salt + key)
    const postData = qs(Object.assign({ i, lts, sign, salt }, payload))
    try {
      let { errorCode, translateResult } = await fetch(api, {
        method: 'POST',
        body: postData,
        headers
      }).then(res => res.json()).catch(err => console.error(err))
      if (errorCode != 0) return API_ERROR
      translateResult = lodash.flattenDeep(translateResult)?.map(item => item.tgt).join('\n')
      if (!translateResult) return RESULT_ERROR
      return translateResult
    } catch (e) {
      console.log(e)
      return API_ERROR
    }
  }

  /** 随机唱歌/唱鸭 */
  async randomSinging () {
    try {
      const api = 'https://m.api.singduck.cn/user-piece/SoQJ9cKu61FJ1Vwc7'
      let res = await fetch(api).then(res => res.text())
      let JSONdara = JSON.parse(res.match(/<script id="__NEXT_DATA__" type="application\/json" crossorigin="anonymous">(.*?)<\/script>/)[1])
      if (!JSONdara) return { error: API_ERROR }
      let piece = lodash.sample(JSONdara.props.pageProps.pieces)
      let { songName, lyric, audioUrl } = piece
      if (!audioUrl) return { error: '找不到歌曲文件' }
      return {
        lyrics: `《${songName}》\n${lyric}`,
        audioUrl: decodeURIComponent(audioUrl)
      }
    } catch (error) {
      console.log(error)
      return { error: API_ERROR }
    }
  }
}()
