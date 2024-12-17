/* eslint-disable no-unused-vars */
import _ from "lodash"
import { puppeteer } from "../index.js"
import request from "../../lib/request/request.js"
import { Config } from "../../components/index.js"
import { load } from "cheerio"

let domain = Config.picSearch.Ascii2dHost ?? "https://ascii2d.net"

/**
 *
 * @param url
 */
export default async function doSearch(url) {
  const { ascii2dUsePuppeteer, ascii2dResultMaxQuantity } = Config.picSearch
  const callApi = ascii2dUsePuppeteer ? callAscii2dUrlApiWithPuppeteer : callAscii2dUrlApi
  const isCf = domain === "https://ascii2d.net"
  let ret = await callApi(url, isCf)
  if (!ret) throw new ReplyError("Ascii2D搜图请求失败")
  const colorURL = ret.url
  if (!colorURL.includes("/color/")) {
    const $ = load(ret.data, { decodeEntities: false })
    logger.error("[error] ascii2d url:", colorURL)
    logger.debug(ret.data)
    let isCloudflare = ret.data.includes("cloudflare") ? "绕过Cloudflare盾失败" : false
    throw new ReplyError(`Ascii2D搜索失败，错误原因：${isCloudflare || $(".container > .row > div:first-child > p").text().trim()}`)
  }
  const bovwURL = colorURL.replace("/color/", "/bovw/")
  let bovwDetail = await (ascii2dUsePuppeteer ? getAscii2dWithPuppeteer(bovwURL) : request[isCf ? "cfGet" : "get"](bovwURL))
  if (!ascii2dUsePuppeteer) {
    bovwDetail = {
      url: bovwDetail.url,
      data: await bovwDetail.text()
    }
  }
  let colorData = (await parse(ret.data)).slice(0, ascii2dResultMaxQuantity)
  let bovwData = (await parse(bovwDetail.data)).slice(0, ascii2dResultMaxQuantity)
  if (_.isEmpty(colorData)) throw new ReplyError("Ascii2D数据获取失败")
  let mapfun = async item => [
    Config.picSearch.hideImg ? "" : await request.proxyRequestImg(item.image),
    `${item.info}\n`,
    `标题：${item.source?.text}\n`,
    `作者：${item.author?.text}(${item.author?.link})\n`,
    `来源：${item.source?.link}`
  ]
  let [ color, bovw ] = await Promise.all([ Promise.all(colorData.map(mapfun)), Promise.all(bovwData.map(mapfun)) ])
  color.unshift("ascii2d 色合検索")
  bovw.unshift("ascii2d 特徴検索")
  return {
    color,
    bovw
  }
}
const callAscii2dUrlApiWithPuppeteer = (imgUrl) => {
  return getAscii2dWithPuppeteer(`${domain}/search/url/${imgUrl}`)
}
const callAscii2dUrlApi = async(imgUrl, isCf) => {
  let res = await request[isCf ? "cfGet" : "get"](`${domain}/search/url/${imgUrl}`).catch(
    err => {
      if (err.stack?.includes("legacy sigalg disallowed or unsupported")) {
        throw new ReplyError(`Error Tls版本过低 请尝试将配置文件的‘cfTLSVersion’字段改为‘TLS1.2’\n详情请参考：https://yenai.trss.me/faq.html#openssl-%E9%94%99%E8%AF%AF\n错误信息：${err.stack}`)
      } else {
        throw err
      }
    }
  )
  return {
    url: res.url,
    data: await res.text()
  }
}
/**
 *
 * @param url
 */
async function getAscii2dWithPuppeteer(url) {
  return await puppeteer.get(url, "body > .container")
}
/**
 *
 * @param body
 */
async function parse(body) {
  const $ = load(body, { decodeEntities: true })
  return _.map($(".item-box"), (item) => {
    const detail = $(".detail-box", item)
    const hash = $(".hash", item)
    const info = $(".info-box > .text-muted", item)
    const [ image ] = $(".image-box > img", item)

    const [ source, author ] = $("a[rel=noopener]", detail)

    if (!source && !author) return

    return {
      hash: hash.text(),
      info: info.text(),
      image: new URL(
        image.attribs.src ?? image.attribs["data-cfsrc"],
        domain
      ).toString(),
      source: source
        ? { link: source.attribs.href, text: $(source).text() }
        : undefined,
      author: author
        ? { link: author.attribs.href, text: $(author).text() }
        : undefined
    }
  }).filter(v => v !== undefined)
}
