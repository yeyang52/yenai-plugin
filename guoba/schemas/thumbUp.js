export default [
  {
    component: "SOFT_GROUP_BEGIN",
    label: "点赞配置"
  },
  {
    field: "thumbUp.enable",
    label: "点赞总开关",
    bottomHelpMessage: "关闭后所有人将无法点赞",
    component: "Switch"
  },
  {
    field: "thumbUp.closeTips",
    label: "点赞关闭提示",
    bottomHelpMessage: "点赞关闭时回复的消息，填空则不回复",
    component: "Input"
  },
  {
    field: "thumbUp.strangeThumbUp",
    label: "陌生人点赞",
    bottomHelpMessage: "开启后赞我功能将可以陌生人点赞，不活跃的号有可能被风控",
    component: "Switch"
  },
  {
    field: "thumbUp.cloneAllThumbUp",
    label: "关闭全部赞我",
    component: "Switch"
  },
  {
    field: "thumbUp.successMsg",
    label: "点赞成功消息",
    bottomHelpMessage: "设置为空则不会回复 支持变量 : {{at}} - at用户 | {{userId}} - 使用赞他会显示艾特的userId 使用赞我则会返回\"你\" | {{doType}} - 赞我则返回\"赞\" 超我则会返回\"超\" | {{thumbUpNum}} - 点赞数量 |  {{noFriend:msg}} - 非好友才会显示的语句请在\":\"后设置要显示的语句里面的变量请使用单括号 | {{img}} - 根据头像生成的图片",
    component: "Input"
  },
  {
    field: "thumbUp.failsMsg",
    label: "点赞失败消息",
    bottomHelpMessage: "设置为空则不会回复 支持变量 : {{doType}} - 赞我则返回\"赞\" 超我则会返回\"超\" | {{at}} - at用户 | {{userId}} - 使用赞他会显示艾特的userId 使用赞我则会返回\"你\" | {{img}} -根据头像生成的图片",
    component: "Input"
  },
  {
    field: "thumbUp.noFriendMsg",
    label: "非好友回复",
    bottomHelpMessage: "变量同点赞失败消息",
    component: "Input"
  },
  {
    field: "thumbUp.recall",
    label: "撤回时间",
    bottomHelpMessage: "单位：s(秒)",
    component: "InputNumber"
  }
]
