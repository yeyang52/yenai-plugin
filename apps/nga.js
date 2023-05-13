import plugin from '../../../lib/plugins/plugin.js'
import gsCfg from '../../genshin/model/gsCfg.js'
import fs from 'node:fs'
import common from '../../../lib/common/common.js'
import { Data, Plugin_Path } from '../components/index.js'
import { incomeCurve } from '../constants/nga.js'

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
    this.incomeCurvePath = `${Plugin_Path}/temp/incomeCurve`
    this.referencePanelPath = `${Plugin_Path}/temp/referencPanel`
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

    let imgList = []

    if (type == '收益曲线') {
      // 收益曲线
      if (!this.incomeCurveObj[role.name]) {
        return this.e.reply('暂时无该角色收益曲线~>_<')
      }
      let urls = this.incomeCurveObj[role.name]

      if (Array.isArray(urls)) {
        urls.forEach((item, index) => imgList.push({
          url: item,
          imgPath: `${this.incomeCurvePath}/${role.name}_${index + 1}.png`
        }))
      } else {
        imgList.push({
          url: urls,
          imgPath: `${this.incomeCurvePath}/${role.name}.png`
        })
      }
    } else {
      // 参考面板
      imgList.push({
        url: `https://gitlab.com/yeyang52/referenc-profile/-/raw/master/image/${role.name}.png`,
        imgPath: `${this.referencePanelPath}/${role.name}.png`
      })
    }

    for (const item of imgList) {
      // 检测图片并下载图片
      if (!fs.existsSync(item.imgPath) || regRet[1]) {
        this.initFolder(type)
        await this.getImg(item.url, item.imgPath)
      }
      // 发送图片
      if (fs.existsSync(item.imgPath)) {
        await this.e.reply(segment.image(item.imgPath))
      }
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
