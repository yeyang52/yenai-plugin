import fs from "fs"
import _ from "lodash"
import { Config, Log_Prefix } from "../../components/index.js"
import requset from "../../lib/request/request.js"
import { createAbortCont } from "./utils.js"

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

    const elapsedTime = logger.green((endTime - startTime) + "ms")

    const fileSizeInBytes = buffer.byteLength
    const fileSizeInKB = logger.cyan((fileSizeInBytes / 1024).toFixed(2) + "KB")

    logger.info(`${Log_Prefix}[State] 背景图片请求成功 ${fileSizeInKB} ${elapsedTime}`)

    const buffBase64 = arrayBufferToBase64(buffer)
    return `data:image/jpeg;base64,${buffBase64}`
  } catch (err) {
    const bg = getDefaultBackdrop(backdropDefault)
    backdrop && logger.warn(`${Log_Prefix}[State] 背景图请求失败，使用默认背景图 ${logger.yellow(bg.fileName)} ，错误原因: ${logger.red(err.message)}`)
    return bg.path
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
    logger.debug(`${Log_Prefix}[State] 使用随机背景图 “${backdropDefault}”`)
  }
  return {
    path: `${Plugin_Path}/resources/state/img/bg/${backdropDefault}`,
    fileName: backdropDefault
  }
}
