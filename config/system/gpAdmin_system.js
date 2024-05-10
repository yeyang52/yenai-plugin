/*
* 此配置文件为系统使用，请勿修改，否则可能无法正常使用
*
* 如需自定义配置请复制修改上一级help_default.js
*
* */

export const helpCfg = {
  title: "椰奶群管帮助",
  subTitle: "Yunzai-Bot & Yenai-Plugin",
  columnCount: 3,
  colWidth: 265,
  theme: "all",
  themeExclude: [ "default" ],
  style: {
    fontColor: "#ceb78b",
    descColor: "#eee",
    contBgColor: "rgba(6, 21, 31, .5)",
    contBgBlur: 3,
    headerBgColor: "rgba(6, 21, 31, .4)",
    rowBgColor1: "rgba(6, 21, 31, .2)",
    rowBgColor2: "rgba(6, 21, 31, .35)"
  }
}

export const helpList = [
  {
    group: "基础功能",
    list: [
      {
        icon: 1,
        title: "#禁言 <@QQ> <时间>",
        desc: "=-="
      },
      {
        icon: 2,
        title: "#解禁 <@QQ>",
        desc: "=-="
      },
      {
        icon: 3,
        title: "#全体禁言|解禁",
        desc: "顾名思义"
      },
      {
        icon: 16,
        title: "#发通知 <消息>",
        desc: "发送@全体的通知"
      },
      {
        title: "#踢 <@QQ>",
        desc: "顾名思义",
        icon: 4
      }, {
        title: "#发群公告 <文字>",
        desc: "发送简易公告",
        icon: 16
      }, {
        title: "#查群公告$",
        desc: "查看现有公告",
        icon: 3
      }, {
        title: "#删群公告 <序号>",
        desc: "用查看公告获取序号",
        icon: 4
      },
      {
        title: "#获取禁言列表",
        desc: "查看本群被禁言的人",
        icon: 8
      },
      {
        title: "#解除全部禁言",
        desc: "解除本群全部被禁言的人",
        icon: 6
      },
      {
        title: "#查看n月没发言的人",
        desc: "查看多少天|周|月没发言的人",
        icon: 15
      },
      {
        title: "#清理n天没发言的人",
        desc: "清理多少天|周|月没发言的人",
        icon: 14
      },
      {
        title: "#查看从未发言的人",
        desc: "查看进群后从未发言的人",
        icon: 1
      },
      {
        title: "#清理从未发言的人",
        desc: "清理进群后从未发言的人",
        icon: 5
      },
      {
        title: "#查看不活跃排行榜",
        desc: "后面可以加数字",
        icon: 16
      },
      {
        title: "#查看最近入群情况",
        desc: "后面可以加数字",
        icon: 4
      },
      {
        title: "#查看加群申请",
        desc: "查看本群的加群申请",
        icon: 2
      },
      {
        title: "#同意|拒绝加群申请<QQ>",
        desc: "处理本群的加群申请",
        icon: 19
      },
      {
        title: "#同意|拒绝全部加群申请",
        desc: "处理本群的全部加群申请",
        icon: 3
      },
      {
        title: "#加|移精",
        desc: "回复消息进行加/移精",
        icon: 18
      },
      {
        title: "#我要自闭 <时间>",
        desc: "自闭一会",
        icon: 20
      }
    ]
  }, {
    group: "字符",
    list: [
      {
        title: "#幸运字符列表",
        desc: "查看现有字符",
        icon: 16
      },
      {
        title: "#替换幸运字符+(id)",
        desc: "用列表获取id",
        icon: 3
      },
      {
        title: "#抽幸运字符",
        desc: "bot抽取字符",
        icon: 4
      },
      {
        title: "#开启|关闭幸运字符",
        desc: "=-=",
        icon: 5
      }
    ]
  },
  {
    group: "定时禁言",
    list: [
      {
        title: "#定时(禁言|解禁)00:00",
        desc: "设置定时可用cron表达式设置",
        icon: 12
      }, {
        title: "#定时禁言任务",
        desc: "查看禁言任务",
        icon: 10
      }, {
        title: "#取消定时(禁言|解禁)",
        desc: "取消查看禁言任务",
        icon: 3
      }
    ]
  },
  {
    group: "群信息",
    list: [
      {
        icon: 2,
        title: "#群星级",
        desc: "查看群星级"
      }, {
        title: "#哪个叼毛是龙王",
        desc: "查看谁是龙王",
        icon: 6
      }, {
        title: "#今日打卡",
        desc: "查看今日打卡",
        icon: 5
      }, {
        title: "#群数据(7天)?",
        desc: "活跃数据等",
        icon: 7
      }, {
        title: "#群发言榜单(7天)?",
        desc: "不加7天查看昨天的数据",
        icon: 16
      }
    ]
  }, {
    group: "投票禁言(更多配置请看config/groupAdmin.yaml)",
    list: [
      {
        title: "#(启用|禁用)投票禁言",
        desc: "是否允许群员投票",
        icon: 4
      }, {
        title: "#投票禁言<@QQ>",
        desc: "投票禁言不听话的群员",
        icon: 6
      }, {
        title: "#(支持|反对)禁言<@QQ>",
        desc: "跟随投票",
        icon: 12
      }
    ]
  }, {
    group: "其他",
    list: [
      {
        title: "#开启|关闭加群通知",
        desc: "将加群申请发送至群",
        icon: 2
      }, {
        title: "#群管(加|删)白 <@QQ>",
        desc: "白名单可以不被群管功能操作",
        icon: 1
      }, {
        title: "#开启|关闭白名单解禁",
        desc: "白名单被禁言时自动解禁",
        icon: 8
      }
    ]
  },
  {
    group: "进群验证(更多设置请在config/groupverify.yaml进行设置)",
    list: [
      {
        title: "#开启验证",
        desc: "开启本群验证",
        icon: 4
      },
      {
        title: "#关闭验证",
        desc: "关闭本群验证",
        icon: 15
      },
      {
        title: "#重新验证 <@群员>",
        desc: "重新发起验证",
        icon: 1
      }, {
        title: "#绕过验证 <@群员>",
        desc: "绕过本次验证",
        icon: 3
      },
      {
        title: "#切换验证模式",
        desc: "更换答案匹配模式",
        icon: 2
      },
      {
        title: "#设置验证超时时间+(s)",
        desc: "多少秒后踢出",
        icon: 17
      }
    ]
  }, {
    group: "违禁词",
    list: [
      {
        title: "#新增违禁词.*",
        desc: "文档查看具体用法",
        icon: 7
      },
      {
        title: "#删除违禁词.*",
        desc: "---",
        icon: 3
      },
      {
        title: "#查看违禁词.*",
        desc: "---",
        icon: 9
      },
      {
        title: "#违禁词列表",
        desc: "列表",
        icon: 17
      },
      {
        title: "#设置违禁词禁言时间400",
        desc: "禁言时间",
        icon: 11
      }
    ]
  }, {
    group: "Bot为群主可用",
    list: [
      {
        title: "#设置管理 <@QQ>",
        desc: "增加管理",
        icon: 8
      },
      {
        title: "#取消管理 <@QQ> ",
        desc: "=-=",
        icon: 9
      },
      {
        title: "#申请头衔 <头衔>",
        desc: "群员自己设置",
        icon: 19
      },
      {
        title: "#修改头衔 <@QQ> <头衔>",
        desc: "主人给别人设置",
        icon: 10
      },
      {
        title: "#(增加|减少|查看)头衔屏蔽词",
        desc: "头衔屏蔽词",
        icon: 2
      },
      {
        title: "#切换头衔屏蔽词匹配模式",
        desc: "模糊匹配和精确匹配",
        icon: 13
      }
    ]
  }
]

export const isSys = true
