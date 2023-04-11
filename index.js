import Ver from './components/Version.js'
import chalk from 'chalk'
import Data from './components/Data.js'
import fs from 'fs'

logger.info(chalk.rgb(253, 235, 255)('----ヾ(￣▽￣)Bye~Bye~----'))
logger.info(chalk.rgb(134, 142, 204)(`椰奶插件${Ver.ver}初始化~`))
logger.info(chalk.rgb(253, 235, 255)('-------------------------'))

if (!global.segment) {
  try {
    global.segment = (await import('oicq')).segment
  } catch (err) {
    global.segment = (await import('icqq')).segment
  }
}

// 加载监听事件
const eventsPath = './plugins/yenai-plugin/apps/events'
const events = fs.readdirSync(eventsPath)
  .filter(file => file.endsWith('.js'))
for (const File of events) {
  try {
    logger.debug(`[yenai-plugin] 加载监听事件：${File}`)
    await import(`./apps/events/${File}`)
  } catch (e) {
    logger.error(`[yenai-plugin] 监听事件错误：${File}`)
    logger.error(e)
  }
}

const appsPath = './plugins/yenai-plugin/apps'
const jsFiles = Data.readDirRecursive(appsPath, 'js', 'events')

let ret = jsFiles.map(file => {
  console.log(`./apps/${file}`)
  return import(`./apps/${file}`)
})

ret = await Promise.allSettled(ret)

let apps = {}
for (let i in jsFiles) {
  let name = jsFiles[i].replace('.js', '')

  if (ret[i].status != 'fulfilled') {
    logger.error(`载入插件错误：${logger.red(name)}`)
    logger.error(ret[i].reason)
    continue
  }
  apps[name] = ret[i].value[Object.keys(ret[i].value)[0]]
}

export { apps }
