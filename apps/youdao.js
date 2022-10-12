import plugin from '../../../lib/plugins/plugin.js'
import fetch from 'node-fetch'

export class example extends plugin {
  constructor() {
    super({
      name: '有道翻译',
      dsc: '有道翻译',
      event: 'message',
      priority: 5000,
      rule: [
        {
          reg: '^#?翻译.*$',
          fnc: 'youdao'
        }
      ]

    })
  }


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
  }
}
