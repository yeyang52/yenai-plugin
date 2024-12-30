import Ascii2D from "./PicSearch/ascii2d.js"
import SauceNAO from "./PicSearch/saucenao.js"
import WhatAnime from "./PicSearch/whatanime.js"

// 导出模块
export { default as puppeteer } from "#yenai.puppeteer"
export { default as uploadRecord } from "../tools/uploadRecord.js"
export { default as Bika } from "./Bika.js"
export { default as common } from "../lib/common/common.js"
export { default as GroupAdmin } from "./GroupAdmin.js"
export { default as funApi } from "./api/funApi.js"
export { default as Pixiv } from "./Pixiv.js"
export { default as QQApi } from "./api/QQApi.js"
export { default as setu } from "./setu.js"
export { default as GroupBannedWords } from "./GroupBannedWords.js"
export { default as memes } from "./memes.js"
export const PicSearch = {
  Ascii2D,
  SauceNAO,
  WhatAnime
}
