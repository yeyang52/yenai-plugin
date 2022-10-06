import { segment } from "oicq"

//由于oicq不加好友点不上赞
/**没加好友回复 */
let notFriend = "不加好友不点🙄"
/** 点赞成功回复 n是点赞数 普通用户为 10，svip 为 20*/
let success = "给你点了[n]下哦，记得回我~"
/** 点赞失败的回复(一般是点赞上限) */
let failds = "今天点过了，害搁这讨赞呐";
/**是否需要要回复的图片*/
let picture = true

export class example extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: '点赞插件',
      /** 功能描述 */
      dsc: '给自己资料卡点赞',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 5000,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^(我要|给我)?(资料卡)?(点赞|赞我)$',
          /** 执行方法 */
          fnc: 'zan'
        }
      ]
    })
  }

  async zan(e) {

    /**判断是否为好友 */
    let isFriend = await Bot.fl.get(e.user_id)
    if (!isFriend) return e.reply(notFriend, true)

    /** 点赞成功回复的图片*/
    let imgs = [
      "https://xiaobai.klizi.cn/API/ce/zan.php?qq=",
      "https://xiaobapi.top/api/xb/api/bixin.php?qq=",
      "https://xiaobapi.top/api/xb/api/zan.php?qq="]
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

    let success_ = success.replace(/\[n]/g, String(n))
    let success_result = ""
    let failds_result = ""
    if (picture) {
      success_result = ["\n", success_, success_img]
      failds_result = ["\n", failds, failds_img]
    } else {
      success_result = "\b" + success_
      failds_result = "\b" + failds
    }



    /**判断点赞是否成功*/
    let msg = n > 0 ? success_result : failds_result
    /**回复 */
    if (e.isPrivate) {
      e.reply(msg)
    } else {
      e.reply(msg, false, { at: true })
    }

    return true
  }
}