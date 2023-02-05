/* eslint-disable no-unused-vars */
import lodash from 'lodash'
import { segment } from 'oicq'
import { puppeteer } from '../index.js'
import request from '../../lib/request/request.js'
import { Config } from '../../components/index.js'
let cheerio = ''

let domain = 'https://ascii2d.net/'

export default async function doSearch (url) {
  if (!cheerio) {
    try {
      cheerio = await import('cheerio')
    } catch (e) {
      return { error: '未检测到依赖cheerio，请安装后再使用Ascii2D搜图，安装命令：pnpm add cheerio -w 或 pnpm install -P' }
    }
  }
  const { ascii2dUsePuppeteer, ascii2dResultMaxQuantity } = Config.picSearch
  const callApi = ascii2dUsePuppeteer ? callAscii2dUrlApiWithPuppeteer : callAscii2dUrlApi
  let ret = await callApi(url)
  if (!ret) return { error: 'Ascii2D搜图请求失败' }
  const colorURL = ret.url
  if (!colorURL.includes('/color/')) {
    const $ = cheerio.load(ret.data, { decodeEntities: false })
    console.error('[error] ascii2d url:', colorURL)
    logger.debug(ret.data)
    return { error: ($('.container > .row > div:first-child > p').text().trim()) }
  }
  const bovwURL = colorURL.replace('/color/', '/bovw/')
  let bovwDetail = await (ascii2dUsePuppeteer ? getAscii2dWithPuppeteer(bovwURL) : request.cfGet(bovwURL))
  if (!ascii2dUsePuppeteer) {
    bovwDetail = {
      url: bovwDetail.url,
      data: await bovwDetail.text()
    }
  }
  let colorData = (await parse(ret.data)).slice(0, ascii2dResultMaxQuantity)
  let bovwData = (await parse(bovwDetail.data)).slice(0, ascii2dResultMaxQuantity)
  if (lodash.isEmpty(colorData)) return { error: 'Ascii2D数据获取失败' }
  let mapfun = item => [
    Config.picSearch.hideImg ? '' : segment.image(item.image),
    `${item.info}\n`,
    `标题：${item.source?.text}\n`,
    `作者:${item.author?.text}(${item.author?.link})\n`,
    `来源:(${item.source?.link})`
  ]
  let color = colorData.map(mapfun)
  let bovw = bovwData.map(mapfun)

  color.unshift('ascii2d 色合検索')
  bovw.unshift('ascii2d 特徴検索')
  return {
    color,
    bovw
  }
}
const callAscii2dUrlApiWithPuppeteer = (imgUrl) => {
  return getAscii2dWithPuppeteer(`${domain}/search/url/${imgUrl}`)
}
const callAscii2dUrlApi = async (imgUrl) => {
  let res = await request.cfGet(`${domain}/search/url/${imgUrl}`)
  if (!res || !res.ok) return false
  return {
    url: res.url,
    data: await res.text()
  }
}
async function getAscii2dWithPuppeteer (url) {
  return await puppeteer.get(url, 'body > .container')
}
async function parse (body) {
  const $ = cheerio.load(body, { decodeEntities: true })
  return lodash.map($('.item-box'), (item) => {
    const detail = $('.detail-box', item)
    const hash = $('.hash', item)
    const info = $('.info-box > .text-muted', item)
    const [image] = $('.image-box > img', item)

    const [source, author] = $('a[rel=noopener]', detail)

    if (!source && !author) return

    return {
      hash: hash.text(),
      info: info.text(),
      image: new URL(
        image.attribs.src ?? image.attribs['data-cfsrc'],
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
