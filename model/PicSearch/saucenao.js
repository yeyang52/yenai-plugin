import _ from 'lodash'
import { Config } from '../../components/index.js'
import sagiri from '../../tools/sagiri.js'
import request from '../../lib/request/request.js'
import Ascii2D from './ascii2d.js'
export default async function doSearch (url) {
  let res = await getSearchResult(url)
  logger.debug('SauceNAO result:', res)
  if (res.header.status != 0) throw Error('SauceNAO搜图，错误信息：' + res.header.message?.replace(/<.*?>/g, ''))
  let format = sagiri(res)
  if (_.isEmpty(format)) throw Error('SauceNAO搜图无数据')

  let msgMap = async item => [
      `SauceNAO (${item.similarity}%)\n`,
      Config.picSearch.hideImg ? '' : await request.proxyRequestImg(item.thumbnail),
      `图源：${item.site}\n`,
      `作者：${item.authorName}(${item.authorUrl})\n`,
      `来源：${item.url.toString()}`
  ]
  let maxSimilarity = format[0].similarity
  let filterSimilarity = format.filter(item => item.similarity > 80)
  let message = []
  if (!_.isEmpty(filterSimilarity)) {
    let filterPixiv = filterSimilarity.filter(item => item.site == 'Pixiv')
    if (!_.isEmpty(filterPixiv)) {
      message.push(await msgMap(filterPixiv[0]))
    } else {
      message.push(await msgMap(filterSimilarity[0]))
    }
  } else {
    message = await Promise.all(format.map(msgMap))
  }
  let n = maxSimilarity > 80 ? '\n' : ''
  if (res.header.long_remaining < 30) {
    const msg = `${n}SauceNAO 24h 内仅剩 ${res.header.long_remaining} 次使用次数`
    n ? message[0].push(msg) : message.push(msg)
  }
  if (res.header.short_remaining < 3) {
    const msg = `${n}SauceNAO 30s 内仅剩 ${res.header.short_remaining} 次。`
    n ? message[0].push(msg) : message.push(msg)
  }
  let { SauceNAOMinSim, useAscii2dWhenLowAcc } = Config.picSearch
  if ((maxSimilarity < SauceNAOMinSim) && useAscii2dWhenLowAcc) {
    message.push(`SauceNAO 相似度 ${maxSimilarity}% 过低，使用Ascii2D进行搜索`)
    await Ascii2D(url)
      .then(res => message.push(...res.color, ...res.bovw))
      .catch(err => message.push(err.stack))
  }
  return message
}

async function getSearchResult (imgURL, db = 999) {
  logger.debug(`saucenao [${imgURL}]}`)
  let api_key = Config.picSearch.SauceNAOApiKey
  if (!api_key) throw Error('未配置SauceNAOApiKey，无法使用SauceNAO搜图，请在 https://saucenao.com/user.php?page=search-api 进行获取，请用指令：#设置SauceNAOapiKey <apikey> 进行添加')
  return await request.get('https://saucenao.com/search.php', {
    params: {
      api_key,
      db,
      output_type: 2,
      numres: 3,
      url: imgURL,
      hide: Config.picSearch.hideImgWhenSaucenaoNSFW
    },
    closeCheckStatus: true,
    timeout: 60000
  }).then(res => {
    if (res.status === 429) {
      throw Error('SauceNAO搜图 搜索次数已达单位时间上限，请稍候再试')
    } else {
      return res.json()
    }
  })
}
