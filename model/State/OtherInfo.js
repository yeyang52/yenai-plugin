import fs from "fs"
import _ from "lodash"
import os from "os"
import path from "path"
import loader from "../../../../lib/plugins/loader.js"
import { Version } from "../../components/index.js"
import { formatDuration } from "../../tools/index.js"
import { osInfo } from "./utils.js"

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
  const js = fs.readdirSync(jsDir)
    ?.filter(item => item.endsWith(".js"))
    ?.length
  const pluginsStr = `${plugins ?? 0} plugins | ${js ?? 0} js`
  const { priority, task } = loader
  const loaderStr = `${priority?.length} fnc | ${task?.length} task`
  return e.isPro ? `${pluginsStr} | ${loaderStr}` : pluginsStr
}

export function getCopyright() {
  return `Created By ${Version.name}<span class="version">${Version.yunzai}</span> & Yenai-Plugin<span class="version">${Version.ver}</span> & Node <span class="version">${process.version}</span>`
}
