import { execSync } from '../../tools/index.js'

/**
 * 获取FastFetch
 * @param e
 */
export default async function getFastFetch (e) {
  if (process.platform == 'win32' && !/pro/.test(e.msg)) return ''
  let ret = await execSync('bash plugins/yenai-plugin/resources/state/state.sh')
  if (ret.error) {
    e.reply(`❎ 请检查是否使用git bash启动Yunzai-bot\n错误信息：${ret.stderr}`)
    return ''
  }
  return ret.stdout.trim()
}
