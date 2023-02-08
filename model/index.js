import puppeteer from '../lib/puppeteer/puppeteer.js'
import uploadRecord from '../lib/uploadRecord/uploadRecord.js'
import Bika from './Bika.js'
import common from '../lib/common/common.js'
import CPU from './CPU.js'
import CronValidate from './CronValidate.js'
import GroupAdmin from './GroupAdmin.js'
import funApi from './api/funApi.js'
import Pixiv from './Pixiv.js'
import QQApi from './api/QQApi.js'
import setu from './setu.js'
import Ascii2D from './PicSearch/ascii2d.js'
import SauceNAO from './PicSearch/saucenao.js'
import WhatAnime from './PicSearch/whatanime.js'
const PicSearch = {
  Ascii2D,
  SauceNAO,
  WhatAnime
}
export {
  puppeteer,
  common,
  CPU,
  Pixiv,
  setu,
  Bika,
  uploadRecord,
  CronValidate,
  GroupAdmin,
  QQApi,
  funApi,
  PicSearch
}
