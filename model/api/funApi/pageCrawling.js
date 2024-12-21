import { pandadiuType } from "../../../constants/fun.js"
import _ from "lodash"
import request from "../../../lib/request/request.js"
import { load } from "cheerio"

/**
 *
 * @param type
 * @param keywords
 */
export async function pandadiu(type = "cos", keywords = "") {
  let domain = "https://www.pandadiu.com"
  const { id, page } = pandadiuType[type]
  let homeUrl = `${domain}/list-${id}-${_.random(1, page)}.html`
  if (keywords) {
    homeUrl = `${domain}/index.php?m=search&c=index&a=init&typeid=1&siteid=1&q=${keywords}`
  }
  logger.debug("[Yenai-Plugin][acg]作品索引页：" + homeUrl)
  const home = await request.get(homeUrl).then(res => res.text())
  const href = _.sample(_.map(load(home)("div.cos-list.clearfix > ul > a, div.cover.mod_imgLight > a"), item => item.attribs.href))
  if (!href) throw new ReplyError("未找到结果")
  logger.debug("[Yenai-Plugin][acg]图片详情页：" + domain + href)
  const details = await request.get(domain + href).then(res => res.text())
  const $ = load(details)
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
 */
export async function coser() {
  const domain = "https://a2cy.com"
  const homeUrl = `${domain}/acg/cos/index_${_.random(1, 30)}.html`
  logger.debug("[Yenai-Plugin][coser]作品索引页：" + homeUrl)
  const home = await request.get(homeUrl).then(res => res.text())
  const $ = load(home)
  const href = _.sample(
    _.map(
      $("body > div > div.content.hidden > ul.cy2-coslist.clr > li > div.showImg > a"),
      (item) => item.attribs.href
    )
  )
  if (!href) throw new ReplyError("未知错误")
  logger.debug("[Yenai-Plugin][coser]图片详情页：" + domain + href)
  const imgPage = await request.get(domain + href).then(res => res.text())
  const $1 = load(imgPage)
  const imgList = _.map(
    $1(
      "body > div > div.content.pb20.clr > div.cy_cosCon > div.w.maxImg.tc > p > img"
    ), item => segment.image(_.includes(item.attribs.src, "http") ? item.attribs.src : domain + (item.attribs["data-loadsrc"] || item.attribs.src))
  )
  const title = $1("h1").text().trim()
  return [ title, ..._.take(imgList, 20) ]
}
