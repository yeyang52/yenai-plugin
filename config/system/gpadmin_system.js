/*
* 此配置文件为系统使用，请勿修改，否则可能无法正常使用
*
* 如需自定义配置请复制修改上一级help_default.js
*
* */

export const helpCfg = {
  title: '椰奶群管帮助',
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
  "group": "基础功能",
  "list": [{
    "icon": 1,
    "title": "#禁言 <@QQ> <时间>",
    "desc": "=-="
  },
  {
    "icon": 2,
    "title": "#解禁 <@QQ>",
    "desc": "=-="
  },
  {
    "icon": 3,
    "title": "#全体禁言",
    "desc": "顾名思义"
  },
  {
    "icon": 4,
    "title": "#全体解禁",
    "desc": "顾名思义"
  },
  {
    "icon": 5,
    "title": "#允许匿名",
    "desc": "顾名思义"
  },
  {
    "icon": 6,
    "title": "#禁止匿名",
    "desc": "顾名思义"
  },
  {
    "title": "#踢 <@QQ>",
    "desc": "顾名思义",
    "icon": 7
  }, {
    "title": "#我要自闭 <时间>",
    "desc": "自闭一会",
    "icon": 20
  }, {
    "title": "#今日打卡",
    "desc": "查看今日打卡",
    "icon": 5
  }, {
    "title": "#获取禁言列表",
    "desc": "查看本群被禁言的人",
    "icon": 8
  },
  {
    "title": "#解除全部禁言",
    "desc": "解除本群全部被禁言的人",
    "icon": 6
  }]
}, {
  "group": "字符",
  "list": [
    {
      "title": "#幸运字符列表",
      "desc": "查看现有字符",
      "icon": 16
    },
    {
      "title": "#替换幸运字符+(id)",
      "desc": "用列表获取id",
      "icon": 3
    },
    {
      "title": "#抽幸运字符",
      "desc": "bot抽取字符",
      "icon": 4
    },
    {
      "title": "#开启|关闭幸运字符",
      "desc": "=-=",
      "icon": 5
    },
  ]
}, {
  "group": "进群验证(更多设置请在groupverify.yaml进行设置)",
  "list": [
    {
      "title": "#开启验证",
      "desc": "开启本群验证",
      "icon": 4
    },
    {
      "title": "#关闭验证",
      "desc": "关闭本群验证",
      "icon": 15
    },
    {
      "title": "#重新验证 <@群员>",
      "desc": "重新发起验证",
      "icon": 1
    }, {
      "title": "#绕过验证 <@群员>",
      "desc": "绕过本次验证",
      "icon": 3
    },
    {
      "title": "#切换验证模式",
      "desc": "更换答案匹配模式",
      "icon": 2
    },]
}, {
  "group": "Bot为群主可用",
  "auth": "master",
  "list": [
    {
      "title": "#设置管理 <@QQ>",
      "desc": "增加管理",
      "icon": 8
    },
    {
      "title": "#取消管理 <@QQ> ",
      "desc": "=-=",
      "icon": 9
    },
    {
      "title": "#申请头衔 <头衔>",
      "desc": "群员自己设置",
      "icon": 19
    },
    {
      "title": "#修改头衔 <@QQ> <头衔>",
      "desc": "主人给别人设置",
      "icon": 10
    }]
}]

export const isSys = true
