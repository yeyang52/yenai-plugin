---
title: 常见问题
date: 2023-2-17
categories:
- FAQ
---
<Boxx/>

## 常见问题
Q：某某功能群员不能用，怎么关闭撤回或设置撤回时间，怎么设置CD等

A：请移步[Pixiv#设置](./features/Pixiv#设置)

## 错误排查

::: tip
以下配置文件目录均在`yenai-plugin/config/config/*`，请参考注释进行配置

`config`下配置文件可能不是最新可复制`default_config`目录下文件进行替换
:::

### 请求错误
如果Bot回复`Request Get/Post Error`或控制台出现`FtechError...`等错误

大多数情况是目标网站无法访问，可尝试访问该网站，如被墙可在`proxy`配置文件设置代理进行解决

## Ascii2d
### OpenSSL 错误
如果遇到类似这样的错误

```
write EPROTO 140031419692928:error:1416D044:SSL routines:tls_process_key_exchange:internal error:../deps/openssl/openssl/ssl/statem/statem_clnt.c:2336:
```

请尝试将`picSearch`配置文件中`cfTLSVersion`配置改为`Tls1.2`

如修改后还报错请参考[这里](https://github.com/Tsuk1ko/cq-picsearcher-bot/wiki/%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98#ascii2d)进行修改

或使用Puppeteer 绕过cf js challenge
  
