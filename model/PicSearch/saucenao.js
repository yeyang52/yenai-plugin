import _ from "lodash"
import { Config } from "../../components/index.js"
import sagiri from "../../tools/sagiri.js"
import request from "../../lib/request/request.js"
import Ascii2D from "./ascii2d.js"

/**
 * SauceNAO搜图
 * @param url 图片链接
 */
export default async function doSearch(url) {
  let res = await getSearchResult(url)
  logger.debug("SauceNAO result:", res)
  if (res.header.status != 0) throw new ReplyError("SauceNAO搜图，错误信息：" + res.header.message?.replace(/<.*?>/g, ""))
  let format = sagiri(res)
  if (_.isEmpty(format)) throw new ReplyError("SauceNAO搜图无数据")

  let msgMap = async item => [
      `SauceNAO (${item.similarity}%)\n`,
      Config.picSearch.hideImg ? "" : await request.proxyRequestImg(item.thumbnail),
      `图源：${item.site}\n`,
      `作者：${item.authorName}(${item.authorUrl})\n`,
      `来源：${item.url.toString()}`
  ]
  let maxSimilarity = format[0].similarity
  let filterSimilarity = format.filter(item => item.similarity > 80)
  let message = []
  if (!_.isEmpty(filterSimilarity)) {
    let filterPixiv = filterSimilarity.filter(item => item.site == "Pixiv")
    if (!_.isEmpty(filterPixiv)) {
      message.push(await msgMap(filterPixiv[0]))
    } else {
      message.push(await msgMap(filterSimilarity[0]))
    }
  } else {
    message = await Promise.all(format.map(msgMap))
  }
  let n = maxSimilarity > 80 ? "\n" : ""
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

/**
 *
 * @param imgURL
 * @param db
 */
async function getSearchResult(imgURL, db = 999) {
  logger.debug(`saucenao [${imgURL}]}`)
  let isPublicToken = false
  let api_key = Config.picSearch.SauceNAOApiKey
  if (!api_key) {
    logger.warn("SauceNAO搜图: 未配置SauceNAOApiKey，将尝试使用公共ApiKey搜图。ApiKey获取地址:https://saucenao.com/user.php?page=search-api 使用指令：#设置SauceNAOapiKey <apikey> 进行添加")
    api_key = _.sample(public_token)
    isPublicToken = true
    logger.debug(`SauceNAO搜图: 使用公共ApiKey ${api_key} 进行搜索`)
  }
  return await request.get("https://saucenao.com/search.php", {
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
      throw new ReplyError(isPublicToken ? "公共SauceNAOApiKey搜索次数已达单位时间上限，请稍候再试或在 https://saucenao.com/user.php?page=search-api 获取个人ApiKey，使用指令：#设置SauceNAOapiKey <apikey> 进行添加" : "SauceNAO搜图 搜索次数已达单位时间上限，请稍候再试")
    } else {
      return res.json()
    }
  })
}

const public_token = [
  "addb1ed568f06a7251bddf38705ee4e597226060",
  "71c6f24c2913a6ca740b3d328683536f58caa504",
  "858B1AA57501935974FCA06E540A02965EF56716",
  "c8cec8853f4ea36b1c4561553e6e300484a02e96",
  "e38dc9de9ac2e353d8468fe4cc52c151da22184d",
  "7BC2204DC29C0124D892EF5F17376FA2C090A59E",
  "998f9a2e5f31d45dc9f4cd58c783807241a8fed0",
  "eed12b68bcc240900a8f9c88adf8a8fbf1499bf9",
  "f6c23aa52877ebfa79c76e6c604981707bec16b7",
  "2abee21554f82b5a4d61df6d9858db2844c32275",
  "37FA405F5BE242EDAFCE2E28BBBACA4F48385907"
]
