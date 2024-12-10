import { Config } from "../../components/index.js"
import requset from "../../lib/request/request.js"
import { createAbortCont } from "./utils.js"
import fs from "fs"
import _ from "lodash"

export default async function getStyle() {
  return {
    backdrop: await getBackground()
  }
}
export async function getBackground() {
  const { backdrop, backdropDefault } = Config.state.style
  let { controller, clearTimeout } = await createAbortCont(5000)
  try {
    if (!backdrop) throw Error("配置项backdrop为空")
    const startTime = Date.now()

    const buffer = await requset.get(backdrop, {
      statusCode: "arrayBuffer",
      signal: controller.signal,
      outErrorLog: false
    })

    const endTime = Date.now()

    const elapsedTime = endTime - startTime

    const fileSizeInBytes = buffer.byteLength
    const fileSizeInKB = (fileSizeInBytes / 1024).toFixed(2)

    logger.info(`[Yenai-Plugin][状态]背景图片请求成功 ${fileSizeInKB}KB ${elapsedTime}ms`)

    const buffBase64 = arrayBufferToBase64(buffer)
    return `data:image/jpeg;base64,${buffBase64}`
  } catch (err) {
    const bg = getDefaultBackdrop(backdropDefault)
    backdrop && logger.warn(`[Yenai-Plugin][状态]背景图请求失败，使用默认背景图 “${bg}” ，错误原因: ${err.message}`)
    return bg
  } finally {
    clearTimeout()
  }
}

function arrayBufferToBase64(arrayBuffer) {
  return Buffer.from(arrayBuffer).toString("base64")
}
function getDefaultBackdrop(backdropDefault) {
  const Plugin_Path = "../../../../../plugins/yenai-plugin"
  const Bg_Path = "./plugins/yenai-plugin/resources/state/img/bg"
  if (backdropDefault === "random") {
    backdropDefault = _.sample(fs.readdirSync(Bg_Path))
    logger.debug(`[Yenai-Plugin][状态]使用随机背景图 “${backdropDefault}”`)
  }
  return `${Plugin_Path}/resources/state/img/bg/${backdropDefault}`
}
