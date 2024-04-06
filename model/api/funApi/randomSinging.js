import { API_ERROR } from "./utils.js"
import _ from "lodash"

/** 随机唱歌/唱鸭 */
export default async function randomSinging() {
  try {
    const api = "https://m.api.singduck.cn/user-piece/SoQJ9cKu61FJ1Vwc7"
    let res = await fetch(api).then(res => res.text())
    let JSONdara = JSON.parse(res.match(/<script id="__NEXT_DATA__" type="application\/json" crossorigin="anonymous">(.*?)<\/script>/)[1])
    if (!JSONdara) return { error: API_ERROR }
    let piece = _.sample(JSONdara.props.pageProps.pieces)
    let { songName, lyric, audioUrl } = piece
    if (!audioUrl) return { error: "找不到歌曲文件" }
    return {
      lyrics: `《${songName}》\n${lyric}`,
      audioUrl: decodeURIComponent(audioUrl)
    }
  } catch (error) {
    logger.error(error)
    return { error: API_ERROR }
  }
}
