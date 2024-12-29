import fs from "fs"
import _ from "lodash"
import os from "os"
import path from "path"
import si from "systeminformation"
import { Version } from "../../components/index.js"
import { formatDuration } from "../../tools/index.js"

let osInfo = null
let loader = null;

(async() => {
  osInfo = await si.osInfo()
})()

try {
  // eslint-disable-next-line import/no-unresolved
  loader = (await import("../../../../lib/plugins/loader.js")).default
} catch {

}
export default function otherInfo(e) {
  let otherInfo = []
  // 其他信息
  otherInfo.push({
    first: "系统",
    tail: osInfo?.distro
  })
  // 插件数量
  otherInfo.push({
    first: "插件",
    tail: getPluginNum(e)
  })
  otherInfo.push({
    first: "系统运行",
    tail: getSystime()
  })

  return _.compact(otherInfo)
}

function getSystime() {
  return formatDuration(os.uptime(), "dd天hh小时mm分", false)
}

function getPluginNum(e) {
  // 获取插件数量插件包目录包含package.json才被视为一个插件包
  const dir = "./plugins"
  const dirArr = fs.readdirSync(dir, { withFileTypes: true })
  const exc = [ "example" ]
  const plugin = dirArr.filter(i =>
    i.isDirectory() &&
    fs.existsSync(path.join(dir, i.name, "package.json")) &&
    !exc.includes(i.name)
  )
  const plugins = plugin?.length
  // 获取js插件数量，以.js结尾的文件视为一个插件
  const jsDir = path.join(dir, "example")
  let js = 0
  try {
    js = fs.readdirSync(jsDir)
      ?.filter(item => item.endsWith(".js"))
      ?.length
  } catch (error) {
    logger.debug(error)
  }

  const pluginsStr = `${plugins ?? 0} plugins | ${js ?? 0} js`
  if (loader && e.isPro) {
    const { priority, task } = loader
    const loaderStr = `${priority?.length} fnc | ${task?.length} task`
    return `${pluginsStr} | ${loaderStr}`
  }
  return pluginsStr
}

export async function getCopyright() {
  const { node, v8, git, redis } = await si.versions("node,v8,git,redis")
  let v = `Created By ${Version.name}<span class="version">${Version.yunzai}</span> & Yenai-Plugin<span class="version">v${Version.ver}</span>`
  v += "<br>"
  v += `Node <span class="version">v${node}</span> & V8 <span class="version">v${v8}</span>`
  if (git) {
    v += ` & Git <span class="version">v${git}</span>`
  }
  if (redis) {
    v += ` & Redis <span class="version">v${redis}</span>`
  }
  return v
}
