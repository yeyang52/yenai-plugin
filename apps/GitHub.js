import plugin from '../../../lib/plugins/plugin.js'
import { segment } from "oicq";

export class GHIMG extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: 'GH仓库',
      /** 功能描述 */
      dsc: 'GH仓库',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 500,
      rule: [
        {
          /** 命令正则匹配 */
          reg: 'github.com\/[a-zA-Z0-9-]{1,39}\/[a-zA-Z0-9_-]{1,100}',
          /** 执行方法 */
          fnc: 'GH'
        }
      ]

    })
  }


  async GH(e) {
    const api = "https://opengraph.githubassets.com";
    let reg = /github.com\/[a-zA-Z0-9-]{1,39}\/[a-zA-Z0-9_-]{1,100}/
    const isMatched = e.msg.match(reg);
    const id = "Yenai";
    if (isMatched) {
      const res = isMatched[0].split("/");
      const [user, repo] = [res[1], res[2].split("#")[0]];
      e.reply(segment.image(`${api}/${id}/${user}/${repo}`));
    }
  }
}
