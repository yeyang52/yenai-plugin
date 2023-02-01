
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

<div align="center">
  <img src="resources/img/tb.png" alt="看板娘" width = "400">
  </a><br>



<h1>Yenai-Plugin</h1>

Yenai-Plugin是一个Yunzai-Bot的扩展插件，提供对Bot的一些便捷操作。<br><br><img src="https://count.getloli.com/get/@:yenai-plugin?theme=rule34" /> <br>

[![GitHub](https://img.shields.io/badge/GitHub-Yenai-black?style=flat-square&logo=github)](https://github.com/yeyang52/yenai-plugin) [![插件库](https://img.shields.io/badge/Gitee-插件库-black?style=flat-square&logo=gitee)](https://gitee.com/yhArcadia/Yunzai-Bot-plugins-index) [![YunzaiBot](https://img.shields.io/badge/Yunzai-v3.0.0-black?style=flat-square&logo=dependabot)](https://gitee.com/Le-niao/Yunzai-Bot) [![Group](https://img.shields.io/badge/群号-254974507-red?style=flat-square&logo=GroupMe&logoColor=white)](https://jq.qq.com/?_wv=1027&k=o8FTig5Z) [![QQ](https://img.shields.io/badge/QQ-746659424-success?style=flat-square&logo=tencent-qq)](https://qm.qq.com/cgi-bin/qm/qr?k=m6tyVb1v5y7a5_YK8CU7AoKyuR51aEaI&noverify=0&personal_qrcode_source=4)

<br>

</div>


## 安装教程
**Tip：Yenai-Plugin仅适配Yunzai-BotV3!!!**

请将Yenai-Plugin放置在Yunzai-Bot的plugins目录下，重启Yunzai-Bot后即可使用。

1. 推荐使用git进行安装，以方便后续升级。在Yunzai目录打开终端，运行

```
// 使用gitee
git clone --depth=1 https://gitee.com/yeyang52/yenai-plugin.git ./plugins/yenai-plugin

// 使用github
git clone --depth=1 https://github.com/yeyang52/yenai-plugin.git ./plugins/yenai-plugin
```

2. 如需使用椰奶状态则需安装以下依赖：

```
pnpm add systeminformation -w
```


---

## 功能介绍

> Yenai-Plugin为您提供以下功能
>
> Tip：以下只是简单描述功能具体指令请使用 **#椰奶帮助 #椰奶群管帮助 #椰奶设置**查看

<details>
  <summary>事件通知</summary>

- [x] ~~闪照监听~~ (目前企鹅闪照功能被ban)

- [x] 撤回监听

- [x] 好友申请

- [x] 群邀请

- [x] 好友|群 列表变动

- [x] 好友|群 消息

- [x] Bot被禁言

Tip：具体可使用 **#椰奶设置** 查看
  </details>

<details>
  <summary>助手功能</summary>

- [x] 发送 群聊|好友 消息

- [x] 改头像 | 改昵称 | 改状态 | 改昵称 | 改签名 | 改性别

- [x] 删好友 | 退群

- [x] 获取 好友|群 列表

- [x] 增 删 查 说说

- [x] 开启/关闭戳一戳


</details>
<details>
  <summary>事件处理</summary>

- [x] 同意|拒绝 好友申请

- [x] 同意|拒绝 群邀请

- [x] 回复好友消息

- [x] 查看现有好友申请/群邀请

- [x] 同意/拒绝全部好友申请/群邀请

- [x] 查看全部请求
  
- [ ] 查看/回添 单向好友
  

</details>
<details>
  <summary>娱乐功能</summary>

- [x] 随机唱鸭

- [x] 角色收益曲线

- [x] 赞我（支持陌生人点赞）

- [x] coser

- [x] 铃声搜索

- [x] 支付宝到账语音

- [x] 半次元话题

- [x] 哪个叼毛是龙王

</details>
<details>
  <summary>Pixiv功能</summary>

- [x] Pixiv排行榜

- [x] Tag搜图

- [x] Pid搜图

- [x] Uid搜图

- [x] 查看热门Tag

- [x] 查看相关作品

Tip：详情请参考[此教程](https://docs.qq.com/doc/p/108e5d788607d988ac62e1512552c8bd2d870321)

</details>
<details>
  <summary>群管功能</summary>

- [x] (全体)?禁言|解禁

- [x] 允许|禁止 匿名

- [x] 踢@群员

- [x] 设置|取消 管理

- [x] 增 删 查 公告

- [x] 我要自闭

- [x] 申请头衔

- [x] 修改头衔

- [x] 头衔屏蔽词

- [x] 查看/清理多久没发言的人

- [x] 查看/清理从未发言的人

- [x] 查看最近入群情况

- [x] 获取禁言列表

- [x] 解除全部禁言

- [x] 加群申请处理

- [ ] 黑名单/白名单


Tip：具体可使用 **#椰奶群管帮助** 查看
  </details>

<details>
  <summary>图片状态</summary>

 <img src="resources/img/状态.png" alt="状态" width = "300" />

</details>

---

## FAQ

Q：某某功能群员不能用，怎么关闭撤回或设置撤回时间，怎么设置CD等

A：请参考[此教程](https://docs.qq.com/doc/p/108e5d788607d988ac62e1512552c8bd2d870321)进行解决

---

## 免责声明

1. 功能仅限内部交流与小范围使用，请勿将Yunzai-Bot及Yenai-Plugin用于任何以盈利为目的的场景.
2. 图片与其他素材均来自于网络，仅供交流学习使用，如有侵权请联系，会立即删除.

## 贡献 ✨

感谢这些了不起的人 ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/TimeRainStarSky"><img src="https://avatars.githubusercontent.com/u/63490117?v=4?s=100" width="100px;" alt="时雨◎星空"/><br /><sub><b>时雨◎星空</b></sub></a><br /><a href="https://github.com/yeyang52/yenai-plugin/commits?author=TimeRainStarSky" title="Documentation">📖</a> <a href="https://github.com/yeyang52/yenai-plugin/commits?author=TimeRainStarSky" title="Code">💻</a></td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td align="center" size="13px" colspan="7">
        <img src="https://raw.githubusercontent.com/all-contributors/all-contributors-cli/1b8533af435da9854653492b1327a23a4dbd0a10/assets/logo-small.svg">
          <a href="https://all-contributors.js.org/docs/en/bot/usage">Add your contributions</a>
        </img>
      </td>
    </tr>
  </tfoot>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

该项目遵循 [all-contributors](https://github.com/all-contributors/all-contributors) 规范。欢迎任何形式的贡献！

#### 联系方式

QQ：[746659424](https://qm.qq.com/cgi-bin/qm/qr?k=m6tyVb1v5y7a5_YK8CU7AoKyuR51aEaI&noverify=0&personal_qrcode_source=4)

群号：[254974507](https://jq.qq.com/?_wv=1027&k=o8FTig5Z)

投喂：[爱发电](https://afdian.net/a/yeyang52)

