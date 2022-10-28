import plugin from '../../../lib/plugins/plugin.js'
import fetch from 'node-fetch'
import { segment } from "oicq";
import lodash from 'lodash'
import Cfg from '../model/Config.js';
import { Config } from '../components/index.js'
import uploadRecord from '../model/uploadRecord.js'
let heisitype = {
  "白丝": "baisi",
  "黑丝": "heisi",
  "巨乳": "juru",
  "jk": "jk",
  "网红": "mcn",
  "美足": "meizu"
}

let heisiwreg = new RegExp(`#?来点(${Object.keys(heisitype).join("|")})$`)
export class example extends plugin {
  constructor() {
    super({
      name: '娱乐',
      event: 'message',
      priority: 500,
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
          reg: '^#?coser$',
          fnc: 'coser'
        },
        {
          reg: '^#?waifu$',
          fnc: 'AiWife'
        },
        {
          reg: heisiwreg,
          fnc: 'heisiwu'
        },
        {
          reg: '^#?铃声搜索.*$',
          fnc: 'lingsheng'
        },
        {
          reg: '^#?半次元话题$',
          fnc: 'bcy_topic'
        },
        {
          reg: '^#?(xjj|hso|bs|hs|jk|ecy|cos|sy|bm)$',
          fnc: 'tu'
        },
        {
          reg: "^#*(谁|哪个吊毛|哪个屌毛|哪个叼毛)是龙王$",
          fnc: 'dragonKing'
        }

      ]
    })
  }

  /**随机唱鸭 */
  async Sing(e) {
    let url = "https://xiaobai.klizi.cn/API/music/changya.php"
    let res = await fetch(url).then(res => res.json()).catch(err => console.log(err))
    if (!res) return e.reply("接口失效辣(๑ŐдŐ)b")
    if (res.code != 200) return e.reply("❎ 接口请求错误")

    let data = res.data
    await e.reply(await uploadRecord(data.audioSrc, 0, false))
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
    let amount = parseFloat(e.msg.replace(/#|支付宝到账|元|圆/g, "").trim())

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
    if (!results) return e.reply("接口失效辣(๑ŐдŐ)b")
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
  //coser
  async coser(e) {
    if (!e.isMaster) {
      if (!Config.Notice.sese) return
    }
    await e.reply("少女祈祷中......")

    const api = "http://ovooa.com/API/cosplay/api.php"

    let res = await fetch(api).then((res) => res.json()).catch((err) => console.error(err))

    if (!res) return e.reply("接口失效辣(๑ŐдŐ)b")

    res = res.data
    let item = 1;
    let msg = [res.Title]
    for (let i of res.data) {
      msg.push(segment.image(i))
      if (item >= 20) {
        break
      } else {
        item++
      }
    }
    Cfg.getCDsendMsg(e, msg, false)
    return true
  }

  //AiWife
  async AiWife(e) {
    e.reply(segment.image(`https://www.thiswaifudoesnotexist.net/example-${lodash.random(100000)}.jpg`))
  }

  //黑丝
  async heisiwu(e) {
    if (!e.isMaster) {
      if (!Config.Notice.sese) return
    }
    await e.reply("少女祈祷中......")
    let types = heisiwreg.exec(e.msg)
    let api = `http://hs.heisiwu.com/${heisitype[types[1]]}#/page/${lodash.random(1, 20)}`
    let res = await fetch(api).then(res => res.text()).catch(err => console.error(err))
    if (!res) return e.reply("接口失效辣(๑ŐдŐ)b")

    let reg = /<a target(.*?)html/g
    let regs = /href="(.*)/
    let list = res.match(reg);
    list = regs.exec(lodash.sample(list))
    let heis = await fetch(list[1]).then(res => res.text()).catch(err => console.error(err))
    if (!heis) return e.reply("接口失效辣(๑ŐдŐ)b")

    let hsreg = /<img loading(.*?)jpg/g
    let img = heis.match(hsreg);
    let imgreg = /src="(.*)/
    let imglist = [];
    let item = 1;
    for (let i of img) {
      imglist.push(
        segment.image(imgreg.exec(i)[1])
      )

      if (item >= 20) {
        break
      } else {
        item++
      }
    }

    Cfg.getCDsendMsg(e, imglist, false)
  }

  //铃声多多
  async lingsheng(e) {
    let msg = e.msg.replace(/#|铃声搜索/g, "")
    let api = `https://xiaobai.klizi.cn/API/music/lingsheng.php?msg=${msg}&n=1`
    let res = await fetch(api).then(res => res.json()).catch(err => console.log(err))
    if (!res) return e.reply("接口失效辣(๑ŐдŐ)b")
    if (res.title == null && res.author == null) return e.reply("没有找到相关的歌曲哦~", true)

    await e.reply([
      `标题：${res.title}\n`,
      `作者：${res.author}`
    ])
    await e.reply(await uploadRecord(res.aac, 0, false))
  }
  /**半次元话题 */
  async bcy_topic(e) {
    let api = 'https://xiaobai.klizi.cn/API/other/bcy_topic.php'
    let res = await fetch(api).then(res => res.json()).catch(err => console.log(err))
    if (!res) return e.reply("接口失效辣(๑ŐдŐ)b")
    if (res.code != 200) return e.reply(`请求错误！,错误码：${res.code}`)
    if (lodash.isEmpty(res.data)) return e.reply(`请求错误！无数据，请稍后再试`)
    let msg = [];
    for (let i of res.data) {
      msg.push(i.title || " ");
      if (!lodash.isEmpty(i.image)) {
        msg.push(i.image.map(item => segment.image(item)))
      }
    }
    console.log(msg);
    Cfg.getforwardMsg(e, msg)
  }
  //谁是龙王
  async dragonKing(e) {
    let ck = Cfg.getck("qun.qq.com");
    let url = `http://xiaobai.klizi.cn/API/qqgn/dragon.php?data=json&uin=${(Bot.uin)}&skey=${(ck.skey)}&pskey=${(ck.p_skey)}&group=${(e.group_id)}`;
    console.log(url);
    let res = await fetch(url).then(res => res.json()).catch(err => console.log(err))
    if (!res) return e.reply("接口失效辣(๑ŐдŐ)b")
    e.reply([
      `本群龙王：${res.name}`,
      segment.image(res.avatar),
      `蝉联天数：${res.desc}`,
    ]);
  }
  //api大集合
  async tu(e) {
    let api;
    switch (e.msg) {
      case "bs":
        api = ["http://api.starrobotwl.com/api/baisi.php"]
        break;
      case "hs":
        api = [
          "http://api.starrobotwl.com/api/heisi.php",
          "https://api.caonm.net/api/siwa/api.php",
        ]
        break;
      case "jk":
        api = [
          "http://api.starrobotwl.com/api/jk.php",
          "http://www.ggapi.cn/Api/jkzf"
        ]
        break;
      case "ecy":
        api = [
          "http://api.starrobotwl.com/api/ecy.php",
          "http://api.starrobotwl.com/api/dmct.php",
          "http://api.iw233.cn/api.php?sort=random"
        ]
        break;
      case "cos":
        api = [
          "http://api.starrobotwl.com/api/yscos.php",
          "http://api.starrobotwl.com/api/wzcos.php",
          "http://api.starrobotwl.com/api/sjcos.php",
          "https://api.caonm.net/api/cos/api.php"
        ]
        break;
      case "hso":
        api = [
          "http://api.starrobotwl.com/api/sjvs.php",
          "https://api.ixiaowai.cn/api/api.php",]
        break;
      case "xjj":
        api = [
          "http://api.starrobotwl.com/api/mvzp.php",
          "http://api.starrobotwl.com/api/mnbz.php",
          "https://api.caonm.net/api/yangyan/api.php",
          "https://api.btstu.cn/sjbz/api.php",
          "https://api.wuque.cc/random/images",
        ]
        break;
      case "bm":
        api = ["http://iw233.cn/api.php?sort=yin"]
        break;
      case "sy":
        api = ["https://iw233.cn/api.php?sort=cat"]
    }
    e.reply(segment.image(lodash.sample(api)))
  }
}
