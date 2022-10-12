import fs from 'node:fs'
import Ver from './components/Version.js'
import chalk from 'chalk'

const files = fs.readdirSync('./plugins/yenai-plugin/apps').filter(file => file.endsWith('.js'))

let ret = []

logger.info(chalk.green('------^-^------'))
logger.info(chalk.yellow(`椰奶插件${Ver.ver}初始化~`))
logger.info(chalk.green('---------------'))

if (!await redis.get(`yenai:notice:deltime`)) {
    await redis.set(`yenai:notice:deltime`, "600")
}


files.forEach((file) => {
    ret.push(import(`./apps/${file}`))
})

ret = await Promise.allSettled(ret)

let apps = {}
for (let i in files) {
    let name = files[i].replace('.js', '')

    if (ret[i].status != 'fulfilled') {
        logger.error(`载入插件错误：${logger.red(name)}`)
        logger.error(ret[i].reason)
        continue
    }
    apps[name] = ret[i].value[Object.keys(ret[i].value)[0]]
}
export { apps }
