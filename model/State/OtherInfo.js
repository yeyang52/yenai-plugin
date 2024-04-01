import _ from 'lodash'
import { osInfo } from './DependencyChecker.js'
import { formatDuration } from '../../tools/index.js'
import os from 'os'
import Monitor from './Monitor.js'
import fs from 'fs'
import { Version } from '../../components/index.js'

export default function otherInfi () {
  let otherInfo = []
  // 其他信息
  otherInfo.push({
    first: '系统',
    tail: osInfo?.distro
  })
  otherInfo.push({
    first: '系统运行',
    tail: getSystime()
  })
  // 网络
  otherInfo.push(Monitor.getNetwork)
  // 插件数量
  otherInfo.push({
    first: '插件',
    tail: getPluginNum()
  })

  return _.compact(otherInfo)
}

function getSystime () {
  return formatDuration(os.uptime(), 'dd天hh小时mm分', false)
}

function getPluginNum () {
  let str = './plugins'
  let arr = fs.readdirSync(str)
  let plugin = []
  arr.forEach((val) => {
    let ph = fs.statSync(str + '/' + val)
    if (ph.isDirectory()) {
      plugin.push(val)
    }
  })
  let del = ['example', 'genshin', 'other', 'system', 'bin']
  plugin = plugin.filter(item => !del.includes(item))
  const plugins = plugin?.length || 0
  const js = fs.readdirSync('./plugins/example')?.filter(item => item.includes('.js'))?.length || 0
  return `${plugins} plugin | ${js} js`
}

export function getCopyright () {
  return `Created By ${Version.name}<span class="version">${Version.yunzai}</span> & Yenai-Plugin<span class="version">${Version.ver}</span> & Node <span class="version">${process.version}</span>`
}
