import { Config } from "../../components/index.js"
import notice from "./notice.js"
import thumbUp from "./thumbUp.js"
import state from "./state.js"
import bika from "./bika.js"
import pixiv from "./pixiv.js"
import picSearch from "./picSearch.js"
export const schemas = [
  ...notice,
  ...thumbUp,
  ...state,
  ...bika,
  ...pixiv,
  ...picSearch
]

export function getConfigData() {
  return {
    notice: {
      default: Config.getNotice()
    },
    pixiv: Config.pixiv,
    bika: Config.bika,
    picSearch: Config.picSearch,
    other: Config.other,
    state: Config.state
  }
}

export function setConfigData(data, { Result }) {
  for (let key in data) {
    Config.modify(...key.split(/\.(.+)/, 2), data[key])
  }

  return Result.ok({}, "保存成功辣ε(*´･ω･)з")
}
