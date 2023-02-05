import lodash from 'lodash'
import { segment } from 'oicq'
import { puppeteer } from '../index.js'

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
  let res = await puppeteer.get(`${domain}/search/url/${url}`, 'body > .container')
  if (!res) return { error: 'Ascii2D搜图请求失败' }
  let data = await parse(res.data)
  if (data?.error) return data.error
  if (lodash.isEmpty(data)) return { error: 'Ascii2D数据获取失败' }
  let msg = data.map(item => [
    segment.image(item.image),
      `\n${item.hash}\n`,
      `${item.info}\n`,
      `作者:${item.author?.text}(${item.author?.link})\n`,
      `来源:${item.source?.text}(${item.source?.link})`
  ])
  msg.unshift('Ascii2D搜图结果')
  return msg
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
