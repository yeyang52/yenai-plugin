import plugin from '../../lib/plugins/plugin.js'
import gsCfg from '../genshin/model/gsCfg.js'
import { segment } from 'oicq'
import fs from 'node:fs'
import common from '../../lib/common/common.js'

export class curve extends plugin {
  constructor() {
    super({
      name: 'nga收益曲线',
      dsc: '收益曲线',
      event: 'message',
      priority: 500,
      rule: [
        {
          reg: '^#*(.*)收益曲线(帮助)?$',
          fnc: 'curve'
        },
      ]
    })
    this.path = './resources/收益曲线'

  }
  //初始化
  async init() {
    if (!fs.existsSync(this.path)) {
      fs.mkdirSync(this.path)
    }
  }

  async curve() {
    let role = {}
    if (/#?收益曲线帮助/.test(this.e.msg)) role.name = "帮助"
    else role = gsCfg.getRole(this.e.msg, '收益曲线')

    if (!role) return


    /** 主角特殊处理 */
    if (['10000005', '10000007', '20000000'].includes(String(role.roleId))) {
      if (!['风主', '岩主', '雷主', '草主'].includes(role.alias)) {
        await this.e.reply('请选择：风主收益曲线、岩主收益曲线、雷主收益曲线、草主收益曲线')
        return
      } else {
        role.name = role.alias
      }
    }



    if (!image[role.name]) return this.e.reply("暂时无该角色收益曲线~>_<")

    this.imgPath = `${this.path}/${role.name}.png`

    if (!fs.existsSync(this.imgPath)) {
      await this.getImg(role.name)
    }


    if (fs.existsSync(this.imgPath)) {
      await this.e.reply(segment.image(this.imgPath));
      return true;
    }


  }


  //下载图片
  async getImg(name) {
    logger.mark(`${this.e.logFnc} 下载${name}素材图`)

    if (!await common.downFile(image[name], this.imgPath)) {
      return false
    }

    logger.mark(`${this.e.logFnc} 下载${name}素材成功`)

    return true
  }
}


const image = {
  "帮助": "https://img.nga.178.com/attachments/mon_202208/21/i2Qjk1-j5voXxZ96T3cS1di-q9.png",

  "烟绯": "https://img.nga.178.com/attachments/mon_202208/17/i2Q2q-gz71XxZ96T3cS1di-q9.png",

  "辛炎": "https://img.nga.178.com/attachments/mon_202208/17/i2Q2q-1uboXyZ9cT3cS1di-q9.png",

  "霄宫": "https://img.nga.178.com/attachments/mon_202208/17/i2Q2q-acsfXyZ9eT3cS1di-q9.png",

  "香菱": "https://img.nga.178.com/attachments/mon_202208/17/i2Q2q-akwxXwZ8wT3cS1di-q9.png",

  "托马": "https://img.nga.178.com/attachments/mon_202208/17/i2Q2q-in5cXwZ90T3cS1di-q9.png",

  "胡桃": "https://img.nga.178.com/attachments/mon_202208/17/i2Q2q-6vbsXvZ8pT3cS1di-q9.png",

  "迪卢克": "https://img.nga.178.com/attachments/mon_202208/17/i2Q2q-dgbbXxZ92T3cS1di-q9.png",

  "安柏": "https://img.nga.178.com/attachments/mon_202208/17/i2Q2q-8m6vXxZ91T3cS1di-q9.png",

  "夜兰": "https://img.nga.178.com/attachments/mon_202208/17/i2Q2q-3oq4XxZ95T3cS1di-q9.png",

  "行秋": "https://img.nga.178.com/attachments/mon_202208/17/i2Q2q-b18cXwZ91T3cS1di-q9.png",

  "神里绫人": "https://img.nga.178.com/attachments/mon_202208/17/i2Q2q-hyagXyZ9fT3cS1di-q9.png",

  "珊瑚宫心海": "https://img.nga.178.com/attachments/mon_202208/17/i2Q2q-3ktjXxZ9bT3cS1di-q9.png",

  "莫娜": "https://img.nga.178.com/attachments/mon_202208/17/i2Q2q-9cifXyZ9bT3cS1di-q9.png",

  "达达利亚": "https://img.nga.178.com/attachments/mon_202208/17/i2Q2q-hu24XyZ9cT3cS1di-q9.png",

  "芭芭拉": "https://img.nga.178.com/attachments/mon_202208/17/i2Q2q-1t4oXxZ95T3cS1di-q9.png",

  "可莉": "https://img.nga.178.com/attachments/mon_202208/17/i2Q2q-bplpXwZ8zT3cS1di-q9.png",

  "班尼特": "https://img.nga.178.com/attachments/mon_202208/17/i2Q2q-i6w3XwZ8xT3cS1di-q9.png",

  "重云": "https://img.nga.178.com/attachments/mon_202208/19/i2Q2q-al2oXxZ9bT3cS1di-q9.png",

  "优菈": "https://img.nga.178.com/attachments/mon_202208/19/i2Q2q-ec2aXxZ98T3cS1di-q9.png",

  "神里凌华": "https://img.nga.178.com/attachments/mon_202208/19/i2Q2q-jurwXxZ97T3cS1di-q9.png",

  "申鹤": "https://img.nga.178.com/attachments/mon_202208/19/i2Q2q-2mawXxZ9bT3cS1di-q9.png",

  "七七": "https://img.nga.178.com/attachments/mon_202208/19/i2Q2q-gbmkXxZ99T3cS1di-q9.png",

  "罗莎莉亚": "https://img.nga.178.com/attachments/mon_202208/19/i2Q2q-2tppXyZ9cT3cS1di-q9.png",

  "凯亚": "https://img.nga.178.com/attachments/mon_202208/19/i2Q2q-cpsdXxZ96T3cS1di-q9.png",

  "甘雨": "https://img.nga.178.com/attachments/mon_202208/19/i2Q2q-jh27XxZ96T3cS1di-q9.png",

  "迪奥娜": "https://img.nga.178.com/attachments/mon_202208/19/i2Q2q-4pvvXxZ97T3cS1di-q9.png",

  "埃洛伊": "https://img.nga.178.com/attachments/mon_202208/19/i2Q2q-a90bXwZ8yT3cS1di-q9.png",

  "钟离": "https://img.nga.178.com/attachments/mon_202208/19/i2Q2q-3ifiXwZ8zT3cS1di-q9.png",

  "云堇": "https://img.nga.178.com/attachments/mon_202208/19/i2Q2q-9yzvXxZ97T3cS1di-q9.png",

  "五郎": "https://img.nga.178.com/attachments/mon_202208/19/i2Q2q-j6rfXxZ9aT3cS1di-q9.png",

  "诺艾尔": "https://img.nga.178.com/attachments/mon_202208/19/i2Q2q-9ht1XxZ97T3cS1di-q9.png",

  "凝光": "https://img.nga.178.com/attachments/mon_202208/19/i2Q2q-3sa1XxZ94T3cS1di-q9.png",

  "岩主": "https://img.nga.178.com/attachments/mon_202208/19/i2Q2q-kje0XxZ92T3cS1di-q9.png",

  "荒泷一斗": "https://img.nga.178.com/attachments/mon_202208/19/i2Q2q-73zhXxZ97T3cS1di-q9.png",

  "阿贝多": "https://img.nga.178.com/attachments/mon_202208/19/i2Q2q-cwmhXwZ8wT3cS1di-q9.png",

  "早柚": "https://img.nga.178.com/attachments/mon_202208/21/i2Qjk1-28j7XxZ94T3cS1di-q9.png",

  "魈": "https://img.nga.178.com/attachments/mon_202208/21/i2Qjk1-htbXwZ8yT3cS1di-q9.png",

  "琴": "https://img.nga.178.com/attachments/mon_202208/21/i2Qjk1-kqstXxZ9aT3cS1di-q9.png",

  "鹿野院平藏": "https://img.nga.178.com/attachments/mon_202208/21/i2Qjk1-jx1yXxZ92T3cS1di-q9.png",

  "雷主": "https://img.nga.178.com/attachments/mon_202208/21/i2Qjk1-aqakXxZ93T3cS1di-q9.png",

  "雷泽": "https://img.nga.178.com/attachments/mon_202208/21/i2Qjk1-axdiXxZ97T3cS1di-q9.png",

  "雷电将军": "https://img.nga.178.com/attachments/mon_202208/21/i2Qjk1-dagnXyZ9cT3cS1di-q9.png",

  "九条裟罗": "https://img.nga.178.com/attachments/mon_202208/21/i2Qjk1-ep0dXwZ8yT3cS1di-q9.png",

  "提娜里": "https://img.nga.178.com/attachments/mon_202208/24/i2Q8oyf-1twzXwZ8uT3cS1di-q9.png",

  "草主": "https://img.nga.178.com/attachments/mon_202208/24/i2Q8oyf-620hXuZ8aT3cS1di-q9.png",

  "枫原万叶": "https://img.nga.178.com/attachments/mon_202208/24/i2Q8oyf-i5niXvZ8iT3cS1di-q9.png",

  "丽莎": "https://img.nga.178.com/attachments/mon_202208/24/i2Q8oyf-ba0sXxZ96T3cS1di-q9.png",

  "刻晴": "https://img.nga.178.com/attachments/mon_202208/24/i2Q8oyf-j403XyZ9hT3cS1di-q9.png",

  "九歧忍": "https://img.nga.178.com/attachments/mon_202208/24/i2Q8oyf-1zzuXxZ97T3cS1di-q9.png",

  "菲谢尔": "https://img.nga.178.com/attachments/mon_202208/24/i2Q8oyf-77grXxZ98T3cS1di-q9.png",

  "北斗": "https://img.nga.178.com/attachments/mon_202208/24/i2Q8oyf-5xbkZ2dT3cS1di-q9.png",

  "八重神子": "https://img.nga.178.com/attachments/mon_202208/24/i2Q8oyf-ddaeXyZ9kT3cS1di-q9.png",

  "多莉": "https://img.nga.178.com/attachments/mon_202209/09/i2Q181-45azXyZ9bT3cS1di-q9.png",

  "柯莱": "https://img.nga.178.com/attachments/mon_202208/24/i2Q8oyf-86c8XvZ8pT3cS1di-q9.png",

  "温迪": "https://img.nga.178.com/attachments/mon_202208/24/i2Q8oyf-2s69XwZ8uT3cS1di-q9.png",

  "砂糖": "https://img.nga.178.com/attachments/mon_202208/24/i2Q8oyf-95mbXwZ8vT3cS1di-q9.png",

  "风主": "https://img.nga.178.com/attachments/mon_202208/24/i2Q8oyf-bplhXvZ8lT3cS1di-q9.png"
}
