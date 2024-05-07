import { Config } from "../../components/index.js"
import requset from "../../lib/request/request.js"
import { createAbortCont } from "./utils.js"
export async function getBackground() {
  const { backdrop, backdropDefault } = Config.state
  if (!backdrop?.startsWith("http")) {
    return backdrop
  }
  let { controller, clearTimeout } = await createAbortCont(5000)
  try {
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
    logger.error(`[Yenai-Plugin][状态]背景图请求失败，使用默认背景图“${backdropDefault}”，错误原因: ${err.message}`)
    const Plugin_Path = "../../../../../plugins/yenai-plugin"
    return `${Plugin_Path}/resources/state/img/${backdropDefault}`
  } finally {
    clearTimeout()
  }
}

function arrayBufferToBase64(arrayBuffer) {
  return Buffer.from(arrayBuffer).toString("base64")
}
