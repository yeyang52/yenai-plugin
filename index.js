import fs from 'node:fs'
import Ver from './components/Version.js'
import chalk from 'chalk'

const files = fs.readdirSync('./plugins/yenai-plugin/apps').filter(file => file.endsWith('.js'))

let ret = []

logger.info(chalk.rgb(253, 235, 255)('----ヾ(￣▽￣)Bye~Bye~----'))
logger.info(chalk.rgb(255, 207, 247)(`椰奶插件${Ver.ver}初始化~`))
logger.info(chalk.rgb(253, 235, 255)('-------------------------'))

try {
    await import('systeminformation')
    await redis.set('yenai:node_modules', '1')
} catch (error) {
    if (error.stack.includes('Cannot find package')) {
        logger.warn('--------椰奶依赖缺失--------')
        logger.warn("yenai-plugin 没有检测到systeminformation依赖将无法使用椰奶状态")
        logger.warn(`如需使用请运行：${logger.red('pnpm add systeminformation -w')}`)
        logger.warn('---------------------')
    } else {
        logger.error(`椰奶载入依赖错误：${logger.red('systeminformation')}`)
        logger.error(decodeURI(error.stack))
    }
    await redis.del('yenai:node_modules')
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
