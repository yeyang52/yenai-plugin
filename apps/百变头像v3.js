import fs from 'fs'
import fetch from 'node-fetch';

/**
 * 在“resources”文件夹下 新建“头像”文件夹把要修改的头像扔进去
 * 随机修改一个头像文件夹里面的头像，默认每五分钟修改一次
 */
export class example extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: '头像',
      /** 功能描述 */
      dsc: '定时随机修改头像',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 5000,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^#?换头像$',
          /** 执行方法 */
          fnc: 'avatar'
        }]
    })
    /** 定时任务 */
    this.task = {
      /**Cron表达式 每五分钟执行一次 */
      cron: '0 */10 * * * ?',
      name: '定时随机修改头像',
      fnc: () => this.avatar()
    }

  }

  async avatar() {
    //项目路径
    let _path = process.cwd();
    //头像路径
    let paths = `${_path}/resources/头像`

    let data;
    let random;
    try {
      //获取头像文件夹下的文件
      data = fs.readdirSync("././././resources/头像")
      //随机数
      random = Math.floor(Math.random() * (data.length - 0)) + 0;
    } catch { console.log("无头像文件夹"); }

    let url;
    if (Math.random() > 0.5) {
      url = await fetch("https://api.uomg.com/api/rand.avatar?sort=动漫女&format=json").then(res => res.json()).then(res => res.imgurl).catch(err => console.log(err))
    } else {
      url = "http://api.btstu.cn/sjtx/api.php?lx=c2&format=images"
    }


    //修改头像
    try {
      Bot.setAvatar(url).then(() => { logger.mark("[头像]修改网络头像") }).catch(
        err => {
          logger.error("[头像]API失效")
          console.log(err);
        }
      )
    } catch {
      Bot.setAvatar(`file:///${paths}/${data[random]}`).then(() => { logger.mark("[头像]修改本地头像") }).catch(
        err => {
          logger.error("[头像]本地头像报错")
          console.log(err);
        }
      )
    }


  }
}

