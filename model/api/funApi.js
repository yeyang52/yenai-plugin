import bgg from "./funApi/bgg.js"
import youdao from "./funApi/youdao.js"
import * as pageCrawling from "./funApi/pageCrawling.js"
import randomSinging from "./funApi/randomSinging.js"
import ThumbUpApi from "./funApi/thumbUpApi.js"
export default {
  bgg,
  youdao,
  ThumbUpApi,
  randomSinging,
  ...pageCrawling
}
