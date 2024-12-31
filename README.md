> [!TIP]
> 如果您觉得我们的项目有帮助，请给我们一个星星（Starred）！您的支持对我们非常重要，将激励我们不断改进和提供更好的内容。谢谢！🙏

> [!WARNING]
> ⚠️注意，该分支为yenai-plugin v2版本 配置文件进行重构无法直接从v1进行迁移 该版本还未完善，请谨慎使用

<img src="resources/img/logo.gif" alt="看板娘" width = "200" align="right">

<div align="left">

# Yenai-Plugin

🐑 **_Yenai-Plugin是一个Yunzai-Bot的扩展插件，提供对Bot的一些便捷操作。_**<img src="https://media.giphy.com/media/mGcNjsfWAjY5AEZNw6/giphy.gif" width="50">

<br><img src="https://count.getloli.com/get/@:yenai-plugin?theme=rule34" /><br>

[![deploy_docs](https://github.com/yeyang52/yenai-plugin/actions/workflows/deploy-docs.yml/badge.svg)](https://github.com/yeyang52/yenai-plugin/actions/workflows/deploy-docs.yml)
[![Vercel](https://therealsujitk-vercel-badge.vercel.app/?app=yenai-plugin-eta)](https://vercel.com/yeyang52/yenai-plugin)
[![Netlify Status](https://api.netlify.com/api/v1/badges/fbae5073-1b4c-4c62-a818-6cc8e100d336/deploy-status)](https://app.netlify.com/sites/yenai-plugin/deploys)

![Nodejs](https://img.shields.io/badge/-Node.js-3C873A?style=flat&logo=Node.js&logoColor=white) 
![JavaScript](https://img.shields.io/badge/-JavaScript-eed718?style=flat&logo=javascript&logoColor=ffffff)
[![license](https://img.shields.io/github/license/yeyang52/yenai-plugin.svg?style=flat&logo=gnu)](https://github.com/yeyang52/yenai-plugin/blob/master/LICENSE) 
[![Gitmoji](https://img.shields.io/badge/gitmoji-%20😜%20😍-FFDD67.svg?style=flat-square)](https://gitmoji.dev)

</div>

---

## 安装教程 💡

请将Yenai-Plugin放置在Yunzai-Bot的plugins目录下，重启Yunzai-Bot后即可使用。

1. 推荐使用git进行安装，以方便后续升级。在Yunzai目录打开终端，运行

- 使用github

```sh
git clone -b v2 --depth=1 https://github.com/yeyang52/yenai-plugin.git ./plugins/yenai-plugin
```

- 使用gitee

```sh
git clone -b v2 --depth=1 https://gitee.com/yeyang52/yenai-plugin.git ./plugins/yenai-plugin
```

2. 安装依赖(可选：不安装依赖将无法使用一些功能)

```sh
pnpm install
```

## 功能介绍 📖

> [!Note]
> Yenai-Plugin为您提供以下功能

<details>
  <summary>事件通知</summary>

> 特定通知支持`群单独设置`、 `bot单独设置`、 `bot群单独设置`<br>
> 例如：`#椰奶通知设置群消息单独开启`<br>
> 具体可使用 **#椰奶通知设置** 查看

| 功能         | 通知类型 | 群单独 | Bot单独 | 指令                          |
| ------------ | :------: | :----: | :-----: | ----------------------------- |
| 好友消息     |   消息   |        |    ✅    | #椰奶通知设置好友消息开启     |
| 群消息       |   消息   |   ✅    |         | #椰奶通知设置群消息开启       |
| 群临时消息   |   消息   |   ✅    |         | #椰奶通知设置群临时消息开启   |
| 群撤回       |   消息   |   ✅    |         | #椰奶通知设置群撤回开启       |
| 好友撤回     |   消息   |        |    ✅    | #椰奶通知设置好友撤回开启     |
| 好友申请     |   申请   |        |    ✅    | #椰奶通知设置好友申请开启     |
| 加群申请     |   申请   |   ✅    |         | #椰奶通知设置加群申请开启     |
| 群聊邀请     |   申请   |        |    ✅    | #椰奶通知设置群邀请开启       |
| 好友列表变动 | 列表变动 |        |         | #椰奶通知设置好友列表变动开启 |
| 群聊列表变动 | 列表变动 |   ✅    |         | #椰奶通知设置群聊列表变动开启 |
| 群成员变动   | 列表变动 |   ✅    |         | #椰奶通知设置群成员变动开启   |
| 群管理变动   | 列表变动 |   ✅    |         | #椰奶通知设置群管理变动开启   |
| Bot被禁言    |   其他   |   ✅    |         | #椰奶通知设置禁言开启         |
| 通知全部主人 | 系统设置 |        |         | #椰奶通知设置全部通知开启     |
| 删除缓存时间 | 系统设置 |        |         | #椰奶通知设置删除缓存时间60秒 |

</details>

<details>
  <summary>助手功能</summary>

| 功能             | 指令                               | 描述                                                                        |
| ---------------- | ---------------------------------- | --------------------------------------------------------------------------- |
| 发送好友消息     | #发好友 QQ号 消息                  | 向指定好友发送消息                                                          |
| 发送群聊消息     | #发群聊 群号 消息                  | 向指定群聊发送消息                                                          |
| 发送多群聊消息   | #发群列表1,2,3 消息                | 向指定的多个群聊发送消息，使用`,`分割群号                                   |
| 改群头像         | #改群头像 图片                     | 修改指定群的头像                                                            |
| 改昵称           | #改昵称 昵称                       | 修改Bot的昵称                                                               |
| 改群昵称         | #改群昵称 群号 昵称                | 修改指定群的昵称                                                            |
| 改状态           | #改状态 状态                       | 修改Bot的在线状态，可选值：我在线上，离开，隐身，忙碌，Q我吧，请勿打扰      |
| 改签名           | #改签名 签名                       | 修改Bot的签名                                                               |
| 退群             | #退群 群号                         | 让Bot退出指定的群聊                                                         |
| 删好友           | #删好友 QQ号                       | 删除指定的好友                                                              |
| 改性别           | #改性别 性别                       | 修改Bot的性别，可选值：男，女，无                                           |
| 改群名片         | #改群名片 @用户 名片               | 修改指定用户的群名片                                                        |
| 获取好友\|群列表 | #获取好友列表 或 #获取群列表       | 获取Bot的所有好友或所在的所有群的列表                                       |
| 开/关戳一戳      | #开启戳一戳 或 #关闭戳一戳         | 开启或关闭戳一戳功能                                                        |
| 撤回消息         | #撤回                              | 撤回Bot发送的消息                                                           |
| 开/关好友添加    | #开启好友添加 或 #关闭好友添加     | 开启或关闭好友添加功能                                                      |
| 更改好友申请方式 | #更改好友申请方式 类型 问题 答案   | 更改好友申请方式，类型可选值：1（允许所有人），2（需要验证），3（问答验证） |
| 设置机型         | #设置机型 机型                     | 设置Bot的机型显示                                                           |
| 拉黑白群/用户    | #拉黑 QQ号 或 #拉白 QQ号           | 将指定的群或用户加入黑名单或白名单                                          |
| 取图片链接       | #取直链 图片                       | 获取图片的直链                                                              |
| ocr              | #ocr 图片 或 #提取文字 图片        | 提取图片中的文字                                                            |
| 看群?头像        | #查看群头像 群号 或 #查看头像 QQ号 | 查看或获取群或用户的头像                                                    |
| 修改日志等级     | #设置日志等级 等级                 | 修改日志等级，可选值：trace, debug, info, warn, fatal, mark, error, off     |
| 查看说说         | #获取说说列表                      | 获取QQ空间的说说列表                                                        |
| 删除说说         | #删除说说 说说ID                   | 删除指定的QQ空间说说                                                        |
| 发说说           | #发说说 内容                       | 在QQ空间发表说说                                                            |

</details>

<details>
  <summary>群管功能</summary>

| 功能                   | 用户所需权限 | Bot所需权限 | 指令                     |
| ---------------------- | :----------: | :---------: | ------------------------ |
| 禁言                   |    管理员    |   管理员    | #禁言 @用户 时间         |
| 解禁                   |    管理员    |   管理员    | #解禁 @用户              |
| 全体禁言               |    管理员    |   管理员    | #全体禁言                |
| 全体解禁               |    管理员    |   管理员    | #全体解禁                |
| 踢出群聊               |    管理员    |   管理员    | #踢 @用户                |
| 设置管理               |     主人     |    群主     | #设置管理 @用户          |
| 取消管理               |     主人     |    群主     | #取消管理 @用户          |
| 修改头衔               |     主人     |    群主     | #修改头衔 @用户 头衔     |
| 申请头衔               |      -       |    群主     | #申请头衔 头衔           |
| 获取禁言列表           |    管理员    |   管理员    | #获取禁言列表            |
| 解除全部禁言           |    管理员    |   管理员    | #解除全部禁言            |
| 查看从未发言的人       |    管理员    |   管理员    | #查看从未发言的人        |
| 清理从未发言的人       |    管理员    |   管理员    | #清理从未发言的人        |
| 查看不活跃排行榜       |    管理员    |   管理员    | #查看不活跃排行榜        |
| 查看最近入群情况       |    管理员    |   管理员    | #查看最近入群情况        |
| 查看多久没发言的人     |    管理员    |   管理员    | #查看X天没发言的人       |
| 清理多久没发言的人     |    管理员    |   管理员    | #清理X天没发言的人       |
| 发通知                 |    管理员    |   管理员    | #发通知 内容             |
| 设置定时禁言           |    管理员    |   管理员    | #设置定时禁言 时间       |
| 取消定时禁言           |    管理员    |   管理员    | #取消定时禁言            |
| 设置定时解禁           |    管理员    |   管理员    | #设置定时解禁 时间       |
| 取消定时解禁           |    管理员    |   管理员    | #取消定时解禁            |
| 开启加群通知           |    管理员    |   管理员    | #开启加群通知            |
| 关闭加群通知           |    管理员    |   管理员    | #关闭加群通知            |
| 加精                   |    管理员    |   管理员    | #加精 @消息              |
| 移精                   |    管理员    |   管理员    | #移精 @消息              |
| 我要自闭               |      -       |   管理员    | #我要自闭 时间           |
| 发起投票禁言           |      -       |   管理员    | #发起投票禁言 @用户      |
| 发起投票踢人           |      -       |   管理员    | #发起投票踢人 @用户      |
| 支持投票               |      -       |   管理员    | #支持投票 @用户          |
| 反对投票               |      -       |   管理员    | #反对投票 @用户          |
| 启用投票禁言           |     主人     |      -      | #启用投票禁言            |
| 禁用投票禁言           |     主人     |      -      | #禁用投票禁言            |
| 启用投票踢人           |     主人     |      -      | #启用投票踢人            |
| 禁用投票踢人           |     主人     |      -      | #禁用投票踢人            |
| 投票设置超时时间       |     主人     |      -      | #投票设置超时时间 秒数   |
| 投票设置最低票数       |     主人     |      -      | #投票设置最低票数 票数   |
| 投票设置禁言时间       |     主人     |      -      | #投票设置禁言时间 秒数   |
| 新增违禁词             |    管理员    |   管理员    | #新增违禁词 词语         |
| 删除违禁词             |    管理员    |   管理员    | #删除违禁词 词语         |
| 查看违禁词             |    管理员    |   管理员    | #查看违禁词 词语         |
| 违禁词列表             |    管理员    |   管理员    | #违禁词列表              |
| 设置违禁词禁言时间     |    管理员    |   管理员    | #设置违禁词禁言时间 秒数 |
| 增加头衔屏蔽词         |    管理员    |   管理员    | #增加头衔屏蔽词 词语     |
| 减少头衔屏蔽词         |    管理员    |   管理员    | #减少头衔屏蔽词 词语     |
| 查看头衔屏蔽词         |    管理员    |   管理员    | #查看头衔屏蔽词          |
| 切换头衔屏蔽词匹配模式 |    管理员    |   管理员    | #切换头衔屏蔽词匹配模式  |
| 发群公告               |    管理员    |   管理员    | #发群公告 内容           |
| 删群公告               |    管理员    |   管理员    | #删群公告 序号           |
| 查群公告               |    管理员    |   管理员    | #查群公告                |
| 加白名单               |     主人     |      -      | #群管加白 @用户          |
| 删白名单               |     主人     |      -      | #群管删白 @用户          |
| 开启白名单自动解禁     |     主人     |      -      | #开启白名单自动解禁      |
| 关闭白名单自动解禁     |     主人     |      -      | #关闭白名单自动解禁      |
| 查幸运字符列表         |    管理员    |   管理员    | #查幸运字符列表          |
| 抽幸运字符             |    管理员    |   管理员    | #抽幸运字符              |
| 替换幸运字符           |    管理员    |   管理员    | #替换幸运字符 序号       |
| 开启幸运字符           |    管理员    |   管理员    | #开启幸运字符            |
| 关闭幸运字符           |    管理员    |   管理员    | #关闭幸运字符            |
| 谁是龙王               |      -       |      -      | #谁是龙王                |
| 群星级                 |      -       |      -      | #群星级                  |
| 群数据                 |    管理员    |   管理员    | #群数据                  |
| 今日打卡               |      -       |      -      | #今日打卡                |
| 群发言榜单             |    管理员    |   管理员    | #群发言榜单              |
| 重新验证               |    管理员    |   管理员    | #重新验证 @用户          |
| 绕过验证               |    管理员    |   管理员    | #绕过验证 @用户          |
| 开启验证               |    管理员    |   管理员    | #开启验证                |
| 关闭验证               |    管理员    |   管理员    | #关闭验证                |
| 切换验证模式           |     主人     |      -      | #切换验证模式            |
| 设置验证超时时间       |     主人     |      -      | #设置验证超时时间 秒数   |

Tip：具体可使用 **#椰奶群管帮助** 查看
</details>

<details>
  <summary>娱乐功能</summary>

| 功能           | 指令                             | 描述               |
| -------------- | -------------------------------- | ------------------ |
| 随机唱鸭       | #唱歌                            |                    |
| 支付宝到账语音 | #支付宝到账(金额)                |                    |
| coser          | #coser                           |                    |
| 有道翻译       | #((源语言-)?目标语言)?翻译(内容) |                    |
| Github略缩图   | github.com/用户名/仓库名         |                    |
| acg搜索        | #(类型)?acg(关键词)              | 类型可选：cos, acg |

</details>

<details>
  <summary>Pixiv功能</summary>

| 功能          | 指令                                  | 描述                   |
| ------------- | ------------------------------------- | ---------------------- |
| Pixiv排行榜   | #看看(日期)?(类型)(全年龄)?榜(第n页)? | 类型可选：日, 周, 月等 |
| Tag搜图       | #tag(pro)?搜图(关键词)(第n页)?        |                        |
| Pid搜图       | #pid搜图(插画ID)                      |                        |
| Uid搜图       | #uid搜图(用户ID)(第n页)?              |                        |
| 查看热门Tag   | #查看热门Tag                          |                        |
| 查看相关作品  | #看相关作品(插画ID)                   |                        |
| 随机原创插画  | #来(n)张(好康的\| 涩图)               |                        |
| 推荐作品      | #来(n)张推荐图                        |                        |
| 搜索用户      | #user搜索(用户名)(第n页)?             |                        |
| P站单图       | #pximg(pro)?                          |                        |
| 更换代理      | #pixiv更换代理(代理地址)              |                        |
| 开启/关闭直连 | #pixiv(开启\| 关闭)直连               |                        |
| 登录信息      | #pixiv登录信息                        |                        |

</details>

<details>
  <summary>搜图搜番</summary>

| 功能                | 指令                         | 描述                  |
| ------------------- | ---------------------------- | --------------------- |
| SauceNAO搜图        | #SauceNAO搜图                | 使用SauceNAO进行搜图  |
| WhatAnime搜番       | #WhatAnime搜番               | 使用WhatAnime进行搜番 |
| Ascii2D搜图         | #Ascii2D搜图                 | 使用Ascii2D进行搜图   |
| 设置SauceNAO ApiKey | #设置SauceNAOApiKey (ApiKey) | 设置SauceNAO的ApiKey  |

</details>

<details>
  <summary>哔咔功能</summary>

| 功能          | 指令                                              | 描述 |
| ------------- | ------------------------------------------------- | ---- |
| 哔咔搜索      | #哔咔(类别\|作者\| 高级)?搜索(关键词)(第n页)?     |      |
| 哔咔看本子    | #哔咔id(本子ID)(第n页)?(第n话)?                   |      |
| 快速查看      | #哔咔看(编号)                                     |      |
| 下一页        | #哔咔下一页                                       |      |
| 下一话        | #哔咔下一话                                       |      |
| 类别列表      | #哔咔类别列表                                     |      |
| 漫画详情      | #哔咔(详情\| 细节)(本子ID)                        |      |
| 修改图片质量  | #哔咔修改图片质量(低质量\|中等质量\|高质量\|原图) |      |
| 开启/关闭直连 | #哔咔(开启\| 关闭)直连                            |      |

</details>

<details>
  <summary>图片状态</summary>

| 功能     | 指令                    | 描述         |
| -------- | ----------------------- | ------------ |
| 查看状态 | #椰奶状态(pro)?(debug)? | 查看当前状态 |
| 查看监控 | #椰奶监控               | 查看监控数据 |
| 查看原图 | #原图                   | 查看原图     |

<img src="resources/img/state.jpg" alt="状态" width="300" />

<img src="resources/img/statePro.jpg" alt="状态Pro" width="300" />

</details>

<br>

> [!TIP]
> 更多信息可以查看我们的[文档](https://yenai.trss.me)


## 特别鸣谢 ❤️

- [Yunzai-Bot](https://gitee.com/Le-niao/Yunzai-Bot)
- [cq-picsearcher-bot](https://github.com/Tsuk1ko/cq-picsearcher-bot)
- [nonebot-plugin-picstatus](https://github.com/lgc2333/nonebot-plugin-picstatus)
- [HibiAPI](https://github.com/mixmoe/HibiAPI)
- [SauceNAO](https://saucenao.com/)
- [Ascii2D](https://ascii2d.net/)
- [trace.moe](https://trace.moe) ([GitHub](https://github.com/soruly/trace.moe))
- [vilipix](https://www.vilipix.com/)
- [trss.me](https://trss.me)

### 贡献者 ✨

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-16-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->
感谢这些了不起的人 ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/TimeRainStarSky"><img src="https://avatars.githubusercontent.com/u/63490117?v=4?s=100" width="100px;" alt="时雨◎星空"/><br /><sub><b>时雨◎星空</b></sub></a><br /><a href="https://github.com/yeyang52/yenai-plugin/commits?author=TimeRainStarSky" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Saury-loser"><img src="https://avatars.githubusercontent.com/u/106982493?v=4?s=100" width="100px;" alt="花海里的秋刀鱼"/><br /><sub><b>花海里的秋刀鱼</b></sub></a><br /><a href="https://github.com/yeyang52/yenai-plugin/commits?author=Saury-loser" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Georgebillion"><img src="https://avatars.githubusercontent.com/u/40432824?v=4?s=100" width="100px;" alt="Georgebillion"/><br /><sub><b>Georgebillion</b></sub></a><br /><a href="#ideas-Georgebillion" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/xfdown"><img src="https://avatars.githubusercontent.com/u/42599406?v=4?s=100" width="100px;" alt="小飞"/><br /><sub><b>小飞</b></sub></a><br /><a href="#ideas-xfdown" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/liuzj288"><img src="https://avatars.githubusercontent.com/u/13833404?v=4?s=100" width="100px;" alt="liuzj288"/><br /><sub><b>liuzj288</b></sub></a><br /><a href="https://github.com/yeyang52/yenai-plugin/commits?author=liuzj288" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/OKKOM2020"><img src="https://avatars.githubusercontent.com/u/88592811?v=4?s=100" width="100px;" alt="OKKOM2020"/><br /><sub><b>OKKOM2020</b></sub></a><br /><a href="https://github.com/yeyang52/yenai-plugin/commits?author=OKKOM2020" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/kmiit"><img src="https://avatars.githubusercontent.com/u/61952405?v=4?s=100" width="100px;" alt="大可鸭"/><br /><sub><b>大可鸭</b></sub></a><br /><a href="https://github.com/yeyang52/yenai-plugin/commits?author=kmiit" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/SmallK111407"><img src="https://avatars.githubusercontent.com/u/108290923?v=4?s=100" width="100px;" alt="曉k"/><br /><sub><b>曉k</b></sub></a><br /><a href="https://github.com/yeyang52/yenai-plugin/commits?author=SmallK111407" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ikechan8370"><img src="https://avatars.githubusercontent.com/u/21212372?v=4?s=100" width="100px;" alt="ikechan8370"/><br /><sub><b>ikechan8370</b></sub></a><br /><a href="https://github.com/yeyang52/yenai-plugin/commits?author=ikechan8370" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/fsqhn"><img src="https://avatars.githubusercontent.com/u/13745793?v=4?s=100" width="100px;" alt="fsqhn"/><br /><sub><b>fsqhn</b></sub></a><br /><a href="https://github.com/yeyang52/yenai-plugin/commits?author=fsqhn" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Loli-Lain"><img src="https://avatars.githubusercontent.com/u/74231782?v=4?s=100" width="100px;" alt="Lain."/><br /><sub><b>Lain.</b></sub></a><br /><a href="https://github.com/yeyang52/yenai-plugin/commits?author=Loli-Lain" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Denfenglai"><img src="https://avatars.githubusercontent.com/u/129082426?v=4?s=100" width="100px;" alt="等风来"/><br /><sub><b>等风来</b></sub></a><br /><a href="https://github.com/yeyang52/yenai-plugin/commits?author=Denfenglai" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://fuxuan.org/"><img src="https://avatars.githubusercontent.com/u/59615518?v=4?s=100" width="100px;" alt="Sora"/><br /><sub><b>Sora</b></sub></a><br /><a href="https://github.com/yeyang52/yenai-plugin/commits?author=8852690" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/batvbs"><img src="https://avatars.githubusercontent.com/u/60730393?v=4?s=100" width="100px;" alt="batvbs"/><br /><sub><b>batvbs</b></sub></a><br /><a href="https://github.com/yeyang52/yenai-plugin/commits?author=batvbs" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ifeif"><img src="https://avatars.githubusercontent.com/u/36729028?v=4?s=100" width="100px;" alt="ifeif"/><br /><sub><b>ifeif</b></sub></a><br /><a href="https://github.com/yeyang52/yenai-plugin/commits?author=ifeif" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Jin1c-3"><img src="https://avatars.githubusercontent.com/u/126029323?v=4?s=100" width="100px;" alt="青青"/><br /><sub><b>青青</b></sub></a><br /><a href="https://github.com/yeyang52/yenai-plugin/commits?author=Jin1c-3" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

本段遵循 [all-contributors](https://github.com/all-contributors/all-contributors) 规范，欢迎任何形式的贡献！

## 如何贡献 🤔

我们欢迎所有形式的贡献！请查看我们的[贡献指南](CONTRIBUTING.md)以了解如何开始贡献。感谢您的支持！

## 友情链接 😊

- [Yunzai-Bot插件索引](https://gitee.com/Hikari666/Yunzai-Bot-plugins-index)
- [码云镜像库](https://gitee.com/yeyang52/yenai-plugin)
- [Miao-Yunzai](https://gitee.com/yoimiya-kokomi/Miao-Yunzai)
- [TRSS-Yunzai](https://gitee.com/TimeRainStarSky/Yunzai)

## 免责声明 ❗

1. 本项目的功能仅限于内部交流与小范围使用，请勿将Yunzai-Bot及Yenai-Plugin用于任何以盈利为目的的场景。
2. 本项目中的图片与其他素材均来自网络，仅供交流学习使用。如有侵权，请联系我们，我们会立即删除相关内容。
  
## 联系方式 <img src="https://media.giphy.com/media/VgCDAzcKvsR6OM0uWg/giphy.gif" width="50">

🐧：746659424

💬：914247840

❤️：[打赏](https://yenai.trss.me/donate.html)