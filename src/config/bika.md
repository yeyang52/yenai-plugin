---
title: bika
date: 2023-03-14
category:
  - 配置
tag:
  - bika
icon: relation
---

::: tip
配置文件位置：`yenai-plugin/config/config/bika.yaml`
:::

### allowPM

- 类型：`boolean`
- 默认：`false`

是否允许私聊使用

### limit
- 类型：`number`
- 默认：`30`

每名用户每日使用次数限制 0则无限制

### bikaDirectConnection
- 类型：`boolean`
- 默认：`false`

哔咔图片直连，直接使用哔咔原图发送不使用图片反代，国内则需使用代理

### bikaImageProxy
- 类型：`string`
- 默认：`p.sesepic.top/static`

哔咔图片反代
如可以直接访问哔咔图片可将[图片直连](#bikadirectconnection)开启

### imageQuality
- 类型：`string`
- 默认：`medium`
- 可选值：`low` `medium` `high` `original`

哔咔图片质量，质量依次从低到高