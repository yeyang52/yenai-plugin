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

## 获取SauceNAO Api Key

### 需要准备的工具

1. 一个可以访问SauceNAO的网络
2. 一个脑子

### 获取api_key
1. 首先你需要拥有一个SauceNAO的账号，请在[这个网址](https://saucenao.com/user.php)进行注册

2. 然后进入[这个网址](https://saucenao.com/user.php?page=search-api)获取你的api_key
<img :src="$withBase('/img/SauceNAO.png')" alt="SauceNAO">

3. 最后对你的鸡鸡人发送 #设置SauceNAOApiKey <api_key>

## 获取Pixiv Token

- 你可以参考使用这两个脚本
- https://gist.github.com/ZipFile/c9ebedb224406f4f11845ab700124362
- https://gist.github.com/upbit/6edda27cb1644e94183291109b8a5fde

下面介绍第一个脚本的使用

1. 先将这个[脚本](https://gist.github.com/ZipFile/c9ebedb224406f4f11845ab700124362)下载下来，放在任意一个你喜欢的目录
2. 安装python(请自行百度安装)
3. 在你存放脚本的文件夹打卡cmd或者powerShell，运行命令：
   ```sh
   python pixiv_auth.py login
   ```
4. 这时会自动打开你的默认浏览器进入到Pixiv登录界面
5. 按下`F12`打开开发者工具，切换到“网络(Network)”选项卡
6. 在筛选器中输入`callback?`

<img :src="$withBase('/pixiv-token/filter.png')" alt="SauceNAO">

7. 登录你的Pixiv账号后，您应该会看到一个空白页面和请求，如下所示
  <img :src="$withBase('/pixiv-token/request.png')" alt="SauceNAO">

8. 复制code字段后的参数，你需要尽快因为这可能存在时效性
9. 回到你的控制台，将你刚才获得的`code`输入到控制台，按下你的`Enter`
10. 如果您做的一切都正确，并且 Pixiv 没有更改其身份验证流，则应显示一对`auth_token`和`refresh_token`
