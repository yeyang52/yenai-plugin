import { pandadiuType, xiurenTypeId } from "../../../constants/fun.js"
import _ from "lodash"
import { _importDependency } from "./utils.js"
import request from "../../../lib/request/request.js"

/**
 *
 * @param type
 * @param keywords
 */
export async function pandadiu(type = "cos", keywords = "") {
  let cheerio = await _importDependency()
  let domain = "https://www.pandadiu.com"
  const { id, page } = pandadiuType[type]
  let homeUrl = `${domain}/list-${id}-${_.random(1, page)}.html`
  if (keywords) {
    homeUrl = `${domain}/index.php?m=search&c=index&a=init&typeid=1&siteid=1&q=${keywords}`
  }
  logger.debug("[Yenai-Plugin][acg]作品索引页：" + homeUrl)
  const home = await request.get(homeUrl).then(res => res.text())
  const href = _.sample(_.map(cheerio.load(home)("div.cos-list.clearfix > ul > a, div.cover.mod_imgLight > a"), item => item.attribs.href))
  if (!href) throw new ReplyError("未找到结果")
  logger.debug("[Yenai-Plugin][acg]图片详情页：" + domain + href)
  const details = await request.get(domain + href).then(res => res.text())
  const $ = cheerio.load(details)
  const imgs = _.map($("div.con > p > img"), item =>
    segment.image(item.attribs.src.includes("http")
      ? item.attribs.src
      : domain + item.attribs.src
    ))
  const title = $("div.title > h1").text()
  return [
    title,
    ..._.take(imgs, 30)
  ]
}
/**
 *
 * @param keywords
 * @param isSearch
 */
export async function mengdui(keywords, isSearch) {
  let cheerio = await _importDependency()
  const domain = "https://b6u8.com"
  let href = ""
  if (isSearch) {
    const mengduipage = JSON.parse(await redis.get("yenai:mengduipage")) || {}
    const randomPage = _.random(1, mengduipage[keywords] || 1)
    const url = `${domain}/search.php?mdact=community&q=${keywords}&page=${randomPage}`
    const home = await request.get(url).then(res => res.text())
    const $ = cheerio.load(home)
    href = _.sample(_.map($("div.md-wide > ul > li > a"), item => item.attribs.href))
    if (!href) throw new ReplyError($("div.no-tips > p:nth-of-type(1)").text().trim())
    const maxPage = $("div.pagebar.md-flex-wc.mb20 > a:not(:last-child)").length
    mengduipage[keywords] = maxPage
    await redis.set("yenai:mengduipage", JSON.stringify(mengduipage))
  } else {
    let random = keywords
    if (!random) {
      do {
        random = _.random(1, 11687)
      } while (
        _.inRange(random, 7886, 10136)
      )
    }
    href = `${domain}/post/${random}.html`
  }
  const details = await request.get(href).then(res => res.text())
  const $ = cheerio.load(details)
  const imgs = _.map($("div.md-text.mb20.f-16 > p > img"), item => segment.image(item.attribs.src))
  const title = $("h1").text().trim()
  const number = `序号：${href.match(/(\d+).html/)[1]}`
  return [ title, number, ..._.take(imgs, 30) ]
}

/**
 *
 * @param type
 */
export async function xiuren(type) {
  let cheerio = await _importDependency()
  // 可扩展
  let handleType = xiurenTypeId[type]
  let homeUrl = `https://www.lisiku1.com/forum-${handleType.id}-${_.random(1, handleType.maxPage)}.html`
  let html = await request.get(homeUrl).then(res => res.text())
  let $ = cheerio.load(html)
  let href = _.sample(
    _.map(
      $("#moderate > div > div.kind_show > div > div:nth-child(1) > a"),
      (item) => item.attribs.href
    )
  )
  let imgPageUrl = "https://www.lisiku1.com/" + href
  let imgPage = await request.get(imgPageUrl).then((res) =>
    res.text()
  )
  let $1 = cheerio.load(imgPage)
  let imgList = _.map(
    $1(
      "td > img"
    ), item => segment.image("https://www.lisiku1.com/" + item.attribs.src)
  )
  return imgList
}

/**
 *
 */
export async function coser() {
  let cheerio = await _importDependency()
  const domain = "https://a2cy.com"
  const homeUrl = `${domain}/acg/cos/index_${_.random(1, 30)}.html`
  logger.debug("[Yenai-Plugin][coser]作品索引页：" + homeUrl)
  const home = await request.get(homeUrl).then(res => res.text())
  const $ = cheerio.load(home)
  const href = _.sample(
    _.map(
      $("body > div > div.content.hidden > ul.cy2-coslist.clr > li > div.showImg > a"),
      (item) => item.attribs.href
    )
  )
  if (!href) throw new ReplyError("未知错误")
  logger.debug("[Yenai-Plugin][coser]图片详情页：" + domain + href)
  const imgPage = await request.get(domain + href).then(res => res.text())
  const $1 = cheerio.load(imgPage)
  const imgList = _.map(
    $1(
      "body > div > div.content.pb20.clr > div.cy_cosCon > div.w.maxImg.tc > p > img"
    ), item => segment.image(_.includes(item.attribs.src, "http") ? item.attribs.src : domain + (item.attribs["data-loadsrc"] || item.attribs.src))
  )
  const title = $1("h1").text().trim()
  return [ title, ..._.take(imgList, 20) ]
}
