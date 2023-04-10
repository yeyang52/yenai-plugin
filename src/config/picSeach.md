---
title: 搜图搜番
date: 2023-03-14
category:
  - 配置
tag:
  - 搜图
  - 搜番
  - SauceNAO
  - Ascii2D
  - WhatAnime
icon: pic
---

::: tip
配置文件位置：`yenai-plugin/config/config/picSearch.yaml`
:::

### isMasterUse
- 类型：`boolean`
- 默认值：`false`

是否只有主人能用

### allowPM
- 类型：`boolean`
- 默认值：`true`


是否允许私聊使用

### limit
- 类型：`number`
- 默认值：`30`

每名用户每日搜索次数限制

### SauceNAOApiKey<Badge type="tip" text="必填" />
- 类型：`string`
- 默认值：``

SauceNAO搜图apikey 请在 _https://saucenao.com/user.php?page=search-api_ 进行获取

### SauceNAOMinSim
- 类型：`number`
- 默认值：`60`

SauceNAO搜图相似度低于这个百分比将被认定为相似度过低

### hideImgWhenSaucenaoNSFW
- 类型：`number`
- 默认值：`0`
- 可选值：`0` `1` `2` `3`

saucanao 得到 NSFW 结果时隐藏缩略图，可选 0~3，严格程度依次增加
0-不隐藏，1-隐藏明确为 NSFW 的缩略图，2-隐藏明确和可能为 NSFW 的缩略图，3-只显示明确为非 NSFW 的缩略图

### cfTLSVersion
- 类型：`string`
- 默认值：`TLSv1.1`
- 建议可选值：`TLSv1.1` `TLSv1.2`

绕过 Cloudflare Challenge 所使用的 TLS 版本

### ascii2dUsePuppeteer
- 类型：`boolean`
- 默认值：`false`

是否使用 Puppeteer 请求 ascii2d 以绕过 cf js challenge 
::: tip
**2023-4-8**：该功能更新需要安装 `puppeteer-extra` 和 `puppeteer-extra-plugin-stealth` 依赖
:::

### ascii2dResultMaxQuantity
- 类型：`number`
- 默认值：`3`

ascii2d搜图返回结果的最大数量

### hideImg
- 类型：`boolean`
- 默认值：`false`

隐藏所有搜索结果的缩略图

### hideImgWhenWhatanimeR18
- 类型：`boolean`
- 默认值：`false`

whatanime 得到 R18 结果时隐藏结果缩略图

### whatanimeSendVideo
- 类型：`boolean`
- 默认值：`false`

whatanime 发送预览视频，R18 结果不会发送

### useAscii2dWhenLowAcc
- 类型：`boolean`
- 默认值：`true`

是否在 saucenao 相似度过低时自动使用 ascii2d

### useAscii2dWhenFailed
- 类型：`boolean`
- 默认值：`true`

是否在 saucenao 搜索失败时自动使用 ascii2d
