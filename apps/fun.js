import plugin from '../../../lib/plugins/plugin.js'
import fetch from 'node-fetch'
import { segment } from "oicq";
import cfg from "../model/Config.js"
export class example extends plugin {
  constructor() {
    super({
      name: '娱乐',
      event: 'message',
      priority: 2000,
      rule: [
        {
          reg: '^#唱歌$',
          fnc: 'Sing'
        },
        {
          reg: '^#支付宝到账.*$',
          fnc: 'ZFB'
        },
        {
          reg: '^#翻译.*$',
          fnc: 'youdao'
        },
        {
          reg: '^#?(我要|给我)?(资料卡)?(点赞|赞我)$',
          fnc: 'zan'
        },
        {
          reg: 'github.com\/[a-zA-Z0-9-]{1,39}\/[a-zA-Z0-9_-]{1,100}',
          fnc: 'GH'
        },
        {
          reg: '#?coser',
          fnc: 'cos'
        }
      ]
    })
  }

  /**随机唱鸭 */
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
  /**支付宝语音 */
  async ZFB(e) {
    let amount = parseFloat(e.msg.replace(/#|支付宝到账/g, "").trim())

    if (!/^\d+(\.\d{1,2})?$/.test(amount)) return e.reply("你觉得这河里吗！！", true);

    if (!(0.01 <= amount && amount <= 999999999999.99)) {
      return e.reply("数字大小超出限制，支持范围为0.01~999999999999.99")
    }
    e.reply([segment.record(`https://mm.cqu.cc/share/zhifubaodaozhang/mp3/${amount}.mp3`)]);
  }

  /**有道翻译 */
  async youdao(e) {
    let msg = "";
    if (e.source) {
      let source;
      if (e.isGroup) {
        source = (await e.group.getChatHistory(e.source.seq, 1)).pop();
      } else {
        source = (await e.friend.getChatHistory(e.source.time, 1)).pop();
      }
      msg = source.raw_message;
    } else {
      msg = e.msg
    }
    msg = msg.replace(/#|翻译/g, "").trim()
    if (!msg) return;
    let results = await fetch(`https://xiaobai.klizi.cn/API/other/trans.php?data=&msg=${msg}`).then(res => res.text()).catch(err => console.log(err))
    if (!results) return e.reply("接口失效")
    e.reply(results)

    return true;
  }

  /**点赞 */
  async zan(e) {
    /**判断是否为好友 */
    let isFriend = await Bot.fl.get(e.user_id)
    if (!isFriend) return e.reply("不加好友不点🙄", true)

    /** 点赞成功回复的图片*/
    let imgs = [
      "https://xiaobai.klizi.cn/API/ce/zan.php?qq=",
      "https://xiaobai.klizi.cn/API/ce/xin.php?qq=",
      "https://ovooa.com/API/zan/api.php?QQ=",
    ]
    /** 一个随机数 */
    let random = Math.floor(Math.random() * (imgs.length - 0))
    let success_img = segment.image(imgs[random] + e.user_id)

    /** 点赞失败的图片 */
    let failds_img = segment.image(`https://xiaobai.klizi.cn/API/ce/paa.php?qq=${e.user_id}`)

    /** 执行点赞*/
    let n = 0;
    while (true) {
      let res = await Bot.sendLike(e.user_id, 10)
      if (!res) {
        break;
      } else {
        n += 10;
      }
    }
    /**回复的消息 */
    let success_result = ["\n", `给你点了${n}下哦，记得回我~`, success_img]
    let failds_result = ["\n", "今天点过了，害搁这讨赞呐", failds_img]

    /**判断点赞是否成功*/
    let msg = n > 0 ? success_result : failds_result
    /**回复 */
    await e.reply(msg, false, { at: true })

    return true
  }

  //github
  async GH(e) {
    const api = "https://opengraph.githubassets.com";

    let reg = /github.com\/[a-zA-Z0-9-]{1,39}\/[a-zA-Z0-9_-]{1,100}/
    const isMatched = e.msg.match(reg);
    console.log(isMatched);
    const id = "Yenai";
    if (isMatched) {
      const res = isMatched[0].split("/");
      const [user, repo] = [res[1], res[2].split("#")[0]];
      e.reply(segment.image(`${api}/${id}/${user}/${repo}`));
    }

    return true;
  }

  async cos(e) {
    await e.reply("少女祈祷中~")

    const api = "https://ovooa.com/API/cosplay/api.php"

    let res = await fetch(api).then((res) => res.json()).catch((err) => console.error(err))
    console.log(res);
    if (!res) return e.reply("接口失效")

    res = res.data
    let msg = [res.Title]
    for (let i of res.data) {
      msg.push(segment.image(i))
    }
    cfg.getforwardMsg(msg, e)
  }
}
