import { youDaoLangType } from "../../../constants/fun.js"
import md5 from "md5"
import { API_ERROR } from "./utils.js"
import _ from "lodash"

/**
 * 有道翻译
 * @param msg
 * @param to
 * @param from
 */
export default async function youdao(msg, to = "auto", from = "auto") {
  if (to != "auto") to = youDaoLangType.find(item => item.label == to)?.code
  if (from != "auto") from = youDaoLangType.find(item => item.label == from)?.code
  if (!to || !from) return `未找到翻译的语种，支持的语言为：\n${youDaoLangType.map(item => item.label).join("，")}\n示例：#翻译你好 - 自动翻译\n#日语翻译你好 - 指定翻译为语种\n#中文-日语翻译你好 - 指定原语言翻译为指定语言`
  // 翻译结果为空的提示
  const RESULT_ERROR = "找不到翻译结果"
  // API 请求错误提示
  const qs = (obj) => {
    let res = ""
    for (const [ k, v ] of Object.entries(obj)) { res += `${k}=${encodeURIComponent(v)}&` }
    return res.slice(0, res.length - 1)
  }
  const appVersion = "5.0 (Windows NT 10.0; Win64; x64) Chrome/98.0.4750.0"
  const payload = {
    from,
    to,
    bv: md5(appVersion),
    client: "fanyideskweb",
    doctype: "json",
    version: "2.1",
    keyfrom: "fanyi.web",
    action: "FY_BY_DEFAULT",
    smartresult: "dict"
  }
  const headers = {
    "Host": "fanyi.youdao.com",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/98.0.4758.102",
    "Referer": "https://fanyi.youdao.com/",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "Cookie": "OUTFOX_SEARCH_USER_ID_NCOO=133190305.98519628; OUTFOX_SEARCH_USER_ID=\"2081065877@10.169.0.102\";"
  }
  const api = "https://fanyi.youdao.com/translate_o?smartresult=dict&smartresult=rule"
  const key = "Ygy_4c=r#e#4EX^NUGUc5"

  const i = msg // 翻译的内容
  const lts = "" + new Date().getTime()
  const salt = lts + parseInt(String(10 * Math.random()), 10)
  const sign = md5(payload.client + i + salt + key)
  const postData = qs(Object.assign({ i, lts, sign, salt }, payload))
  try {
    let { errorCode, translateResult } = await fetch(api, {
      method: "POST",
      body: postData,
      headers
    }).then(res => res.json()).catch(err => console.error(err))
    if (errorCode != 0) return API_ERROR
    translateResult = _.flattenDeep(translateResult)?.map(item => item.tgt).join("\n")
    if (!translateResult) return RESULT_ERROR
    return translateResult
  } catch (err) {
    logger.error(err)
    return API_ERROR
  }
}
