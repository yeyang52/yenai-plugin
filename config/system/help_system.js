/*
* 此配置文件为系统使用，请勿修改，否则可能无法正常使用
*
* 如需自定义配置请复制修改上一级help_default.js
*
* */

export const helpCfg = {
  title: '椰奶帮助',
  subTitle: 'Yunzai-Bot & Yenai-Plugin',
  columnCount: 3,
  colWidth: 265,
  theme: 'all',
  themeExclude: ['default'],
  style: {
    fontColor: '#ceb78b',
    descColor: '#eee',
    contBgColor: 'rgba(6, 21, 31, .5)',
    contBgBlur: 3,
    headerBgColor: 'rgba(6, 21, 31, .4)',
    rowBgColor1: 'rgba(6, 21, 31, .2)',
    rowBgColor2: 'rgba(6, 21, 31, .35)'
  }
}

export const helpList = [{
  "group": "助手",
  "list": [{
    "icon": 61,
    "title": "#发好友 <QQ> <消息>", "desc": "给好友发送一条涩涩的消息"
  },
  {
    "icon": 64,
    "title": "#发群聊 <群号> <消息>",
    "desc": "给群聊发送一条涩涩的消息"
  },
  {
    "icon": 66,
    "title": "#改头像 <图片>",
    "desc": "顾名思义"
  },
  {
    "icon": 62, "title": "#改状态 <状态> ",
    "desc": "顾名思义"
  },
  {
    "icon": 58, "title": "#改昵称 <昵称> ",
    "desc": "顾名思义"
  },
  {
    "icon": 59, "title": "#改签名 <签名> ",
    "desc": "顾名思义"
  },
  {
    "title": "#改性别 <性别> ",
    "desc": "顾名思义", "icon": 71
  },
  {
    "title": "#改群名片 <名片> ",
    "desc": "群里Bot自己的名片", "icon": 29
  },
  {
    "title": "#改群昵称 <昵称>",
    "desc": "改群的昵称", "icon": 57
  },
  {
    "title": "#改群头像 <图片>",
    "desc": "顾名思义", "icon": 46
  },
  {
    "title": "#删好友 <QQ> ",
    "desc": "删掉涩涩的好友", "icon": 71
  },
  {
    "title": "#退群 <群号> ",
    "desc": "退掉涩涩的群", "icon": 32
  },
  {
    "title": "#获取群列表",
    "desc": "获取Bot的所有群", "icon": 30
  },
  {
    "title": "#获取好友列表",
    "desc": "获取Bot的所有好友", "icon": 54
  },
  {
    "title": "#取说说列表 <页数> ",
    "desc": "获取Bot的说说列表", "icon": 29
  },
  {
    "title": "#发说说 <内容> ",
    "desc": "发送一条涩涩的说说", "icon": 71
  },
  {
    "title": "#删说说 <序号>",
    "desc": "用取说说列表获取序号", "icon": 54
  },
  {
    "title": "#清空说说",
    "desc": "一键清空", "icon": 48
  },
  {
    "title": "#清空留言",
    "desc": "一键清空留言", "icon": 57
  }]
},
{
  "group": "娱乐功能",
  "list": [{
    "icon": 32,
    "title": "#唱歌",
    "desc": "随机唱鸭"
  },
  {
    "icon": 12,
    "title": "#赞我",
    "desc": "给你点一个大大的赞"
  },
  {
    "icon": 20,
    "title": "#椰羊收益曲线",
    "desc": "查看角色收益曲线"
  },
  {
    "icon": 25,
    "title": "#收益曲线帮助",
    "desc": "=-="
  }]
},
{
  "group": "管理命令，仅管理员可用",
  "auth": "master",
  "list": [{
    "icon": 32,
    "title": "#椰奶设置",
    "desc": "查看椰奶设置"
  },
  {
    "icon": 42,
    "title": "#椰奶(强制)更新",
    "desc": "更新椰奶"
  },
  {
    "icon": 35,
    "title": "#椰奶版本",
    "desc": "查看版本信息"
  },
  {
    "icon": 35,
    "title": "#椰奶更新日志",
    "desc": "查看更新日志"
  },]
}]

export const isSys = true
