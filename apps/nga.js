import plugin from '../../../lib/plugins/plugin.js'
import gsCfg from '../../genshin/model/gsCfg.js'
import { segment } from 'oicq'
import fs from 'node:fs'
import common from '../../../lib/common/common.js'
import { Data } from '../components/index.js'

const _path = './plugins/yenai-plugin'
export class NGA extends plugin {
  constructor () {
    super({
      name: '椰奶NGA',
      dsc: '收益曲线',
      event: 'message',
      priority: 500,
      rule: [
        {
          reg: '^#*(.*)(收益曲线|参考面板)(帮助)?$',
          fnc: 'NGA'
        }
      ]
    })
    this.incomeCurvePath = `${_path}/resources/incomeCurve`
    this.referencePanelPath = `${_path}/resources/ReferencPanel`
    this.incomeCurveObj = Data.readJSON('data/nga/incomeCurve.json')
  }

  // 初始化
  async init () {
    Data.createDir('resources/incomeCurve')
    Data.createDir('resources/ReferencPanel')
  }

  async NGA () {
    let role = {}
    if (/#?(收益曲线|参考面板)帮助/.test(this.e.msg)) {
      role.name = '帮助'
    } else {
      role = gsCfg.getRole(this.e.msg, '收益曲线|参考面板')
    }

    if (!role) return logger.error(`${this.e.logFnc}指令可能错误`, role)

    let type = /收益曲线/.test(this.e.msg) ? '收益曲线' : '参考面板'
    /** 主角特殊处理 */
    if (['10000005', '10000007', '20000000'].includes(String(role.roleId))) {
      if (!['风主', '岩主', '雷主', '草主'].includes(role.alias)) {
        await this.e.reply(`请选择：风主${type}、岩主${type}、雷主${type}、草主${type}`)
        return
      } else {
        role.name = role.alias
      }
    }
    let imgPath
    let url
    if (type == '收益曲线') {
      // 收益曲线
      if (!this.incomeCurveObj[role.name]) return this.e.reply('暂时无该角色收益曲线~>_<')
      url = this.incomeCurveObj[role.name]
      imgPath = `${this.incomeCurvePath}/${role.name}.png`
    } else {
      // 参考面板
      imgPath = `${this.referencePanelPath}/${role.name}.png`
      url = `http://www.liaobiao.top/Referenc/${role.name}.png`
    }
    if (!fs.existsSync(imgPath)) {
      await this.getImg(url, imgPath)
    }

    if (fs.existsSync(imgPath)) {
      await this.e.reply(segment.image(imgPath))
      return true
    }
  }

  // 下载图片
  async getImg (name, Path) {
    logger.mark(`${this.e.logFnc} 下载${name}素材图`)

    if (!await common.downFile(name, Path)) {
      return false
    }

    logger.mark(`${this.e.logFnc} 下载${name}素材成功`)

    return true
  }
}
