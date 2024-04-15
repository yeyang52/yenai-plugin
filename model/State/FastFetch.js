import { execSync } from "../../tools/index.js"
import { Config } from "../../components/index.js"
/**
 * 获取FastFetch
 * @param e
 */
export default async function getFastFetch(e) {
  if (!isFeatureVisible(e.isPro)) return ""
  let ret = await execSync("bash plugins/yenai-plugin/resources/state/state.sh")
  if (ret.error) {
    e.reply(`❎ 请检查是否使用git bash启动Yunzai-bot\n错误信息：${ret.stderr}`)
    return ""
  }
  return ret.stdout.trim()
}
function isFeatureVisible(isPro) {
  const { showFastFetch } = Config.state
  if (showFastFetch === true) return true
  if (showFastFetch === "pro" && isPro) return true
  if (showFastFetch === "default") {
    if (!isPlatformWin() || isPro) return true
  }
  return false
}
function isPlatformWin() {
  return process.platform === "win32"
}
