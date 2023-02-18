---
title: 教程
date: 2023-2-17
autoSort: -1
---

::: tip
以下配置文件目录均在`yenai-plugin/config/config/*`，请参考注释进行配置

`config`下配置文件可能不是最新可复制`default_config`目录下文件进行替换
:::

## 单独群开启功能
::: tip
首先你具备一定的yaml语法知识，如果你不知道什么是yaml请前往[yaml基本语法](https://blog.csdn.net/hejian_0534/article/details/100577740)
:::

打开`group`配置文件可以看到如下配置
```yaml
#config/group.yaml
123456:
  groupMessage: false #群消息
  grouptemporaryMessage: false #群临时消息
  groupRecall: false #群撤回
  groupInviteRequest: false #群邀请
  groupAdminChange: false #群管理变动
  groupNumberChange: false #群聊列表变动
  groupMemberNumberChange: false #群成员变动
  botBeenBanned: false #禁言
  flashPhoto: false #闪照

#请严格按照yaml格式设置 不需要的设置项可删除
456789:
  groupMessage: false #群消息
  grouptemporaryMessage: false #群临时消息
```
将需要开启或关闭的通知的key值写到对应群`true`为开启`false`为关闭

以下为单独开启一个群`群消息通知`的示例
```yaml
114514:
  groupMessage: true #群消息
```

**支持单独开启或关闭的功能如下**

| key值                   | 说明         |
| :---------------------- | ------------ |
| groupMessage            | 群消息       |
| grouptemporaryMessage   | 群临时消息   |
| groupRecall             | 群撤回       |
| groupInviteRequest      | 群邀请       |
| groupAdminChange        | 群管理变动   |
| groupNumberChange       | 群聊列表变动 |
| groupMemberNumberChange | 群成员变动   |
| addGroupApplication     | 加群通知     |
| botBeenBanned           | 禁言         |
| flashPhoto              | 闪照         |
| sese                    | *            |
| sesepro                 | *            |

