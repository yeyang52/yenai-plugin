import request from '../../lib/request/request.js'
import { Config, Plugin_Path } from '../../components/index.js'
import common from '../../../../lib/common/common.js'
import _ from 'lodash'

/**
 *
 * @param imgURL
 */
export default async function doSearch (imgURL) {
  let result = await getSearchResult(imgURL)
  if (result.error) throw Error(result.error)

  let {
    result: [{
      similarity,
      anilist, // 番剧 ID
      episode = '-', // 集数
      from, // 时间点
      video // 预览视频
    // image // 预览图片
    }]
  } = result
  if (_.isEmpty(result)) throw Error('未获取到相关信息')
  similarity = (similarity * 100).toFixed(2) // 相似度
  const time = (() => {
    const s = Math.floor(from)
    const m = Math.floor(s / 60)
    const ms = [m, s % 60]
    return ms.map(num => String(num).padStart(2, '0')).join(':')
  })()
  const AnimeInfo = await getAnimeInfo(anilist)
  const { type, format, isAdult, title, startDate, endDate, coverImage } = AnimeInfo.data.Media
  const { hideImg, hideImgWhenWhatanimeR18, whatanimeSendVideo } = Config.picSearch
  let msg = [
    `WhatAnime (${similarity}%)\n该截图出自第${episode}集的${time}\n`
  ]
  if (!(hideImg || (hideImgWhenWhatanimeR18 && isAdult))) {
    msg.push(segment.image(coverImage.large))
  }
  const titles = _.uniq(['romaji', 'native', 'chinese'].map(k => title[k]).filter(v => v))
  msg.push(titles.join('\n'), `\n类型：${type}-${format}`, `\n开播：${date2str(startDate)}`)
  if (endDate.year > 0) msg.push(`\n完结：${date2str(endDate)}`)
  if (isAdult) msg.push('\nR18注意！')
  let msgs = [msg]
  if (!isAdult && whatanimeSendVideo) {
    msgs.push(await downFile(video))
  }
  return msgs
}

const date2str = ({ year, month, day }) => [year, month, day].join('-')
/**
 * 取得搜番结果
 * @param {string} url 图片地址
 * @param {string} key whatanime token
 * @returns {Promise<Response|*>} Prased JSON
 */
async function getSearchResult (url, key = '') {
  let host = 'https://api.trace.moe'
  return await request.get(`${host}/search`, {
    params: {
      url,
      key
    }
  }).then(res => res.json())
}
const animeInfoQuery = `
query ($id: Int) {
  Media (id: $id, type: ANIME) {
    id
    type
    format
    isAdult
    title {
      native
      romaji
    }
    startDate {
      year
      month
      day
    }
    endDate {
      year
      month
      day
    }
    coverImage {
      large
    }
  }
}`
/**
 * 取得番剧信息
 * @param {number} id
 * @returns {Promise<Response|*>} Prased JSON
 */
async function getAnimeInfo (id) {
  return await request.post('https://trace.moe/anilist/', {
    data: {
      query: animeInfoQuery,
      variables: { id }
    }
  }).then(res => res.json())
}

/**
 *
 * @param url
 */
async function downFile (url) {
  let path = `${Plugin_Path}/temp/whatanime/1.mp4`
  logger.mark('[Yenai-Plugin][whatanime]下载预览视频')
  await common.downFile(url, path)
  logger.mark('[Yenai-Plugin][whatanime]下载预览视频成功')
  return segment.video(path)
}
