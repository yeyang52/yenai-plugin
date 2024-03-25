import fs from 'fs'

export default function getPluginNum () {
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
  // return {
  //   plugins: plugin?.length || 0,
  //   js: fs.readdirSync('./plugins/example')?.filter(item => item.includes('.js'))?.length || 0
  // }
  return {
    first: '插件',
    tail: `${plugins} plugin | ${js} js`
  }
}
