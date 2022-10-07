import plugin from '../../../lib/plugins/plugin.js'
import fetch from 'node-fetch'
import { segment } from "oicq";

export class example extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: '随机唱鸭',
      /** 功能描述 */
      dsc: '随机唱鸭',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 2000,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^#?唱歌$',
          /** 执行方法 */
          fnc: 'Sing'
        }
      ]
    })
  }


  async Sing(e) {
    let url = "https://xiaobai.klizi.cn/API/music/changya.php"
    let res = await fetch(url).catch(err => console.log(err))
    if (!res) {
      e.reply("❎ 接口请求失败")
      return false;
    }
    res = await res.json()

    if (res.code != 200) {
      e.reply("❎ 接口请求错误")
      return false;
    }
    let data = res.data
    await e.reply(segment.record(data.audioSrc))
    //处理歌词
    let lyric = data.lyrics.map(function (item) {
      return `${item}\n`
    })
    lyric[lyric.length - 1] = data.lyrics[data.lyrics.length - 1]
    await e.reply(lyric)
    return true;
  }
}
