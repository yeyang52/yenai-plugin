import plugin from '../../../lib/plugins/plugin.js'
import gsCfg from '../../genshin/model/gsCfg.js'
import { segment } from 'oicq'
import fs from 'node:fs'
import common from '../../../lib/common/common.js'
import { Data, Plugin_Path } from '../components/index.js'
import { incomeCurve } from '../tools/nga.js'

export class NGA extends plugin {
  constructor () {
    super({
      name: '椰奶NGA',
      dsc: '收益曲线',
      event: 'message',
      priority: 500,
      rule: [
        {
          reg: '^#?(更新)?(.*)(收益曲线|参考面板)(帮助)?$',
          fnc: 'NGA'
        }
      ]
    })
    this.incomeCurvePath = `${Plugin_Path}/data/incomeCurve`
    this.referencePanelPath = `${Plugin_Path}/data/referencPanel`
    this.incomeCurveObj = incomeCurve
  }

  // 初始化
  async initFolder (type) {
    Data.createDir(`data/${type == '收益曲线' ? 'incomeCurve' : 'referencPanel'}`)
  }

  async NGA () {
    let role = {}
    let regRet = this.e.msg.match('^#?(更新)?(.*)(收益曲线|参考面板)(帮助)?$')
    if (regRet[4]) {
      role.name = '帮助'
    } else {
      role = gsCfg.getRole(regRet[2])
    }

    if (!role) return logger.error(`${this.e.logFnc}未找到该角色`, role)

    let type = regRet[3]
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
    if (!fs.existsSync(imgPath) || regRet[1]) {
      this.initFolder(type)
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
