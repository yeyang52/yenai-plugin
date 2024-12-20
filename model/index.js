import puppeteer from "#yenai.puppeteer"
import uploadRecord from "../tools/uploadRecord.js"
import Bika from "./Bika.js"
import common from "../lib/common/common.js"
import GroupAdmin from "./GroupAdmin.js"
import funApi from "./api/funApi.js"
import Pixiv from "./Pixiv.js"
import QQApi from "./api/QQApi.js"
import setu from "./setu.js"
import Ascii2D from "./PicSearch/ascii2d.js"
import SauceNAO from "./PicSearch/saucenao.js"
import WhatAnime from "./PicSearch/whatanime.js"
import GroupBannedWords from "./GroupBannedWords.js"
import memes from "./memes.js"
// 导出模块
export const PicSearch = {
  Ascii2D,
  SauceNAO,
  WhatAnime
}
export {
  puppeteer,
  common,
  Pixiv,
  setu,
  Bika,
  uploadRecord,
  GroupAdmin,
  QQApi,
  GroupBannedWords,
  funApi,
  memes
}
