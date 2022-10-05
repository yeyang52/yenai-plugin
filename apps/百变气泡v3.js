import plugin from "../../lib/plugins/plugin.js";
import fetch from 'node-fetch'
import cfg from '../../lib/config/config.js'
import common from '../../lib/common/common.js'

//设置会员参数 (普通、vip、svip)
const member = "svip"
const myck = {
  "code": 0,
  "uin": "746659424",
  "skey": "@qPj9eqrJZ",
  "gtk": "1674138517",
  "pt4token": "s4xN*kb8Bf-7rWDdbtkWVRj-xg5LL3ydX4t7jC6NLTM_",
  "pskey": "YAfPtfubqFp4-4K0j3KWqb-B-O07H9tpX7eESL30zsw_",
  "superkey": "vLB8ZIs8Pr*r-zdlZcBYzas5l9fU2ExoG7LQko3d0QQ_",
  "state": "登录成功！",
  "name": "超市椰羊"
}
export class example extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: "百变气泡",
      /** 功能描述 */
      dsc: "百变气泡",
      /** https://oicqjs.github.io/oicq/#events */
      event: "message",
      /** 优先级，数字越小等级越高 */
      priority: 5000,
      rule: [
        {
          /** 命令正则匹配 */
          reg: "^换气泡$",
          /** 执行方法 */
          fnc: "Changeable",
        },
      ],
    });

    /** 定时任务默认每10分钟一次不建议太短 */
    this.task = {
      cron: '0 */10 * * * ?',
      name: '百变气泡',
      fnc: () => this.Changeable()
    }

  }

  async Changeable() {
    //获取ck
    let cookie = Bot.cookies['vip.qq.com']
    let ck = cookie.replace(/=/g, `":"`).replace(/;/g, `","`).replace(/ /g, "").trim()
    ck = ck.substring(0, ck.length - 2)
    ck = `{"`.concat(ck).concat("}")
    ck = JSON.parse(ck)


    let url = `http://www.dreamling.xyz/API/QQ/multivariant_bubbles/api.php?uin=${cfg.qq}&skey=${ck.skey}&pskey=${ck.p_skey}&type=text&member=${member}`
    let result = await fetch(url).then(res => res.text())

    let myurl = `http://www.dreamling.xyz/API/QQ/multivariant_bubbles/api.php?uin=${myck.uin}&skey=${myck.skey}&pskey=${myck.pskey}&type=text&member=${member}`

    let my = await fetch(myurl).then(res => res.text()).catch(common.relpyPrivate(746659424, "ck失效"))

    logger.mark(`[百变气泡] ${result}`)
    logger.mark(`[百变气泡自己] ${my}`)


  }
}
