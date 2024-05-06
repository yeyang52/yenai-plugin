import { Config } from "../../components/index.js"
import requset from "../../lib/request/request.js"
import { createAbortCont } from "./utils.js"
export async function getBackground() {
  const { backdrop, backdropDefault } = Config.state
  if (!isValidUrl(backdrop)) {
    return backdrop
  }
  let { controller, clearTimeout } = await createAbortCont(5000)
  try {
    const buffer = await requset.get(backdrop, {
      statusCode: "arrayBuffer",
      signal: controller.signal,
      outErrorLog: false
    })
    const buffBase64 = arrayBufferToBase64(buffer)
    return `data:image/jpeg;base64,${buffBase64}`
  } catch (err) {
    logger.error(`Error requset state background image: ${err.message}`)
    const Plugin_Path = "../../../../../plugins/yenai-plugin"
    return `${Plugin_Path}/resources/state/img/${backdropDefault}`
  } finally {
    clearTimeout()
  }
}

function arrayBufferToBase64(arrayBuffer) {
  return Buffer.from(arrayBuffer).toString("base64")
}
function isValidUrl(str) {
  const urlRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/
  return urlRegex.test(str)
}
