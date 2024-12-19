export default [
  {
    component: "Divider",
    label: "pixiv设置"
  },
  {
    field: "pixiv.pixivDirectConnection",
    label: "pixiv图片直连",
    bottomHelpMessage: "直接使用官方图片链接发送，请确保你的网络环境可以访问pixiv",
    component: "Switch"
  },
  {
    field: "pixiv.allowPM",
    label: "pixiv私聊使用",
    bottomHelpMessage: "pixiv是否允许私聊使用",
    component: "Switch"
  },
  {
    field: "pixiv.refresh_token",
    label: "pixiv登录刷新令牌",
    bottomHelpMessage: "登录后直接使用账号调用官方api，不登录也可以正常使用功能",
    component: "Input"
  },
  {
    field: "pixiv.pixivImageProxy",
    label: "pixiv图片反代",
    bottomHelpMessage: "pixiv图片反代服务，如可以直接访问pixiv请直接打开图片直连",
    component: "Input"
  },
  {
    field: "pixiv.limit",
    label: "pixiv次数限制",
    bottomHelpMessage: "每名用户每日次数限制（0 则无限制）",
    component: "InputNumber"
  },
  {
    field: "pixiv.language",
    label: "pixiv返回语言",
    bottomHelpMessage: "返回语言, 会影响标签的翻译",
    component: "Input"
  }
]
