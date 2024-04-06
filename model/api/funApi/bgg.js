import { _importDependency } from "./utils.js"
import request from "../../../lib/request/request.js"
import { puppeteer } from "../../index.js"

/**
 *
 * @param keyword
 */
export default async function bgg(keyword) {
  let cheerio = await _importDependency()
  let url = "https://www.gstonegames.com/game/?hot_sort=1&keyword=" + encodeURIComponent(keyword)
  const home = await request.get(url).then((res) => res.text())
  const $ = cheerio.load(home)

  // 获取集石第一个搜索结果的地址
  const firstGameLink = $(".goods-list.fl").first().find("a").attr("href")
  // 如果搜不到
  if (!firstGameLink) {
    const screenshot = await puppeteer.Webpage({ url })
    return [
      "集石搜索不到该游戏：",
        `搜索地址：${url}`,
        "\n以下是搜索页面的截图：",
        screenshot
    ]
  }
  // 拼出集石详情网址并访问
  let href = `https://www.gstonegames.com${firstGameLink}`
  logger.info(`集石详情网址：${href}`)

  const detailshtml = await request.get(href).then((res) => res.text())

  const details$ = cheerio.load(detailshtml)

  // 获取游戏类型
  const gametype = details$(
    ".published:contains(\"分类信息\") .part-left-title + ul li:nth-child(1) a"
  )
    .text()
    .trim()
  const gamemode = details$(
    ".published:contains(\"分类信息\") .part-left-title + ul li:nth-child(2) a"
  )
    .text()
    .trim()
    // const gamemove =details$('.published:contains("分类信息") .part-left-title + ul li:nth-child(3) a').text().trim();

  // 获取BGG网址
  const bgglink = details$(".published.who.matop15.mabot50")
    .eq(2)
    .find("a")
    .attr("href")
    // 如果搜不到
  if (!bgglink) {
    let url = href
    const screenshot = await puppeteer.Webpage({ url })
    return [
      "集石该游戏页面无BGG信息：",
        `搜索地址：${url}`,
        "\n以下是该游戏集石页面的截图：",
        screenshot
    ]
  }
  // 如果搜到了
  logger.info(bgglink)
  // 扒集石的数据
  const gameName2 = details$(".details-title h2 a").text().trim()
  logger.info(`游戏中文名字:${gameName2}`)

  // 访问bgg
  const bgghtml = await request.get(bgglink).then((res) => res.text())

  const bgg$ = cheerio.load(bgghtml)

  // 开扒
  let scriptdataA = bgg$("script").eq(2).text()
  let scriptdata = JSON.parse(
    scriptdataA.substring(
      scriptdataA.indexOf("GEEK.geekitemPreload = ") + 22,
      scriptdataA.indexOf("GEEK.geekitemSettings = ") - 3
    )
  )
  let {
    minplayers,
    maxplayers,
    minplaytime,
    maxplaytime,
    minage
  } = scriptdata.item
  let avgweight = scriptdata.item.stats.avgweight.substring(0, 4)
  let OverallRank = scriptdata.item.rankinfo[0].rank

  // 获取游戏英文名字
  const gameName1 = bgg$("meta[property='og:title']").attr("content")

  // 获取游戏图片URL
  const gameimgLink = bgg$("link[rel='preload'][as='image']:eq(1)").attr("href")

  // 游戏图片URL可能有多条，这里取第一条
  const gameimg = gameimgLink || null

  logger.info(`游戏英文名字:${gameName1}`)

  // 回复
  return [
      `游戏中文名：${gameName2}\n`,
      `游戏英文名：${gameName1}\n`,
      `游戏类型：${gametype}\n`,
      `游戏模式：${gamemode}\n`,
      `BGG地址：${bgglink}\n`,
      `集石地址：${href}\n`,
      `BGG当前总排名：${OverallRank}\n`,
      `支持游玩人数：${minplayers}-${maxplayers}\n`,
      `大概游玩时间：${minplaytime}-${maxplaytime}分钟\n`,
      `推荐年龄：${minage}+\n`,
      `游戏重度：${avgweight}/5\n`,
      segment.image(gameimg)
  ]
}
