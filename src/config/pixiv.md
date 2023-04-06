---
title: pixiv
date: 2023-03-14
category:
  - 配置
tag:
  - pixiv
icon: dart
---

::: tip
配置文件位置：`yenai-plugin/config/config/pixiv.yaml`
:::

### allowPM

- 类型：`boolean`
- 默认：`false`

是否允许私聊使用


### pixivDirectConnection
- 类型：`boolean`
- 默认：`false`
  
开启pixiv图片直连，国内需配合代理使用

### pixivImageProxy
- 类型：`string`
- 默认：`i.pixiv.re`

pixiv图片反代，开启直连后反代服务则无效

### limit
- 类型：`number`
- 默认：`30`

每名用户每日次数限制（0 则无限制）

### refresh_token
- 类型：`string`
- 默认：` `

Pixiv 登录凭证刷新令牌 (Refresh Token)

获取方法请参考: [获取pixiv-token](../help.md#获取pixiv-token)

### language 
- 类型：`string`
- 默认：`zh-cn`

返回语言, 会影响标签的翻译
