import plugin from '../../../lib/plugins/plugin.js'
import gsCfg from '../../genshin/model/gsCfg.js'
import { segment } from 'oicq'
import fs from 'node:fs'
import common from '../../../lib/common/common.js'
export class curve extends plugin {
  constructor() {
    super({
      name: 'NGA',
      dsc: '收益曲线',
      event: 'message',
      priority: 500,
      rule: [
        {
          reg: '^#*(.*)收益曲线(帮助)?$',
          fnc: 'curve'
        },
        {
          reg: '^#*(.*)参考面板$',
          fnc: 'ReferencPanel'
        },
      ]
    })
    this.curvepath = './plugins/yenai-plugin/resources/curveimg'
    this.ReferencPanelpath = './plugins/yenai-plugin/resources/ReferencPanel'
    this.json = './plugins/yenai-plugin/config/curve.json'

  }
  //初始化
  async init() {
    if (!fs.existsSync(this.curvepath)) {
      fs.mkdirSync(this.curvepath)
    }
    if (!fs.existsSync(this.ReferencPanelpath)) {
      fs.mkdirSync(this.ReferencPanelpath)
    }
  }

  async curve() {
    let role = {}
    if (/#?收益曲线帮助/.test(this.e.msg)) role.name = "帮助"
    else role = gsCfg.getRole(this.e.msg, '收益曲线')

    if (!role) return logger.error("[收益曲线]指令可能错误", role)


    /** 主角特殊处理 */
    if (['10000005', '10000007', '20000000'].includes(String(role.roleId))) {
      if (!['风主', '岩主', '雷主', '草主'].includes(role.alias)) {
        await this.e.reply('请选择：风主收益曲线、岩主收益曲线、雷主收益曲线、草主收益曲线')
        return
      } else {
        role.name = role.alias
      }
    }

    let image = await fs.promises
      .readFile(this.json, 'utf8')
      .then((data) => {
        return JSON.parse(data)
      })
      .catch((err) => {
        logger.error('读取失败')
        console.error(err)
        return false
      })

    if (!image[role.name]) return this.e.reply("暂时无该角色收益曲线~>_<")

    let imgPath = `${this.curvepath}/${role.name}.png`

    if (!fs.existsSync(imgPath)) {
      await this.getImg(image[role.name], imgPath)
    }

    if (fs.existsSync(imgPath)) {
      await this.e.reply(segment.image(imgPath));
      return true;
    }




  }
  async ReferencPanel(e) {
    let role = gsCfg.getRole(this.e.msg, '参考面板')

    if (!role) return logger.error("[参考面板]指令可能错误", role)

    /** 主角特殊处理 */
    if (['10000005', '10000007', '20000000'].includes(String(role.roleId))) {
      if (!['风主', '岩主', '雷主', '草主'].includes(role.alias)) {
        await this.e.reply('请选择：风主参考面板、岩主参考面板、雷主参考面板、草主参考面板')
        return
      } else {
        role.name = role.alias
      }
    }

    let imgPath = `${this.ReferencPanelpath}/${role.name}.png`
    let url = `http://www.liaobiao.top/Referenc/${role.name}.png`
    if (!fs.existsSync(imgPath)) {
      await this.getImg(url, imgPath)
    }

    if (fs.existsSync(imgPath)) {
      await this.e.reply(segment.image(imgPath));
      return true;
    }
  }


  //下载图片
  async getImg(name, Path) {
    logger.mark(`${this.e.logFnc} 下载${name}素材图`)

    if (!await common.downFile(name, Path)) {
      return false
    }

    logger.mark(`${this.e.logFnc} 下载${name}素材成功`)

    return true
  }
}
