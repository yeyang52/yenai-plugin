import plugin from '../../../lib/plugins/plugin.js'
import fetch from 'node-fetch'
import { segment } from "oicq";

export class example extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: '娱乐功能',
      /** 功能描述 */
      dsc: '娱乐',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 2000,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^#唱歌$',
          /** 执行方法 */
          fnc: 'Sing'
        },
        {
          /** 命令正则匹配 */
          reg: '^#支付宝到账.*$',
          /** 执行方法 */
          fnc: 'ZFB'
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

  async ZFB(e) {
    let amount = e.msg.replace(/#|支付宝到账/g, "").trim()

    if (!/^\d+(\.\d{1,2})?$/.test(amount)) return e.reply("你觉得这河里吗！！", true);

    if (!(0.01 <= amount && amount <= 999999999999.99)) {
      return e.reply("数字大小超出限制，支持范围为0.01~999999999999.99")
    }
    e.reply([segment.record(`https://mm.cqu.cc/share/zhifubaodaozhang/mp3/${amount}.mp3`)]);
  }
}
