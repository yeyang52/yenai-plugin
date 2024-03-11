import bgg from './funApi/bgg.js'
import youdao from './funApi/youdao.js'
import * as pageCrawling from './funApi/pageCrawling.js'
import randomSinging from './funApi/randomSinging.js'
import thumbUp from './funApi/thumbUp.js'
export default {
  bgg,
  youdao,
  thumbUp,
  randomSinging,
  ...pageCrawling
}
