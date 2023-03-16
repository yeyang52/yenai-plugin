---
title: 代理
date: 2023-03-14
category:
  - 配置
tag:
  - proxy
  - 代理
icon: proxy
---

::: tip
配置文件位置：`yenai-plugin/config/config/proxy.yaml`
:::

### proxyAddress 
- 类型：`string`
- 默认：`http://127.0.0.1:7890`

代理地址

### switchProxy
- 类型：`boolean`
- 默认：`false`

开启或关闭使用代理，开启后代理才会失效

可使用`#椰奶开启代理`或`#椰奶关闭代理`命令快速开启或关闭