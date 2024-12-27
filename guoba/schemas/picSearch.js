export default [
  {
    component: "SOFT_GROUP_BEGIN",
    label: "搜图配置"
  },
  {
    field: "picSearch.isMasterUse",
    label: "搜图主人独享",
    bottomHelpMessage: "搜图是否只有主人能用",
    component: "Switch"
  },
  {
    field: "picSearch.limit",
    label: "搜图次数限制",
    bottomHelpMessage: "每名用户每日次数限制（0 则无限制）",
    component: "InputNumber"
  },
  {
    field: "picSearch.allowPM",
    label: "搜图私聊使用",
    bottomHelpMessage: "搜图是否允许私聊使用",
    component: "Switch"
  },
  {
    field: "picSearch.hideImg",
    label: "隐藏结果缩略图",
    bottomHelpMessage: "隐藏所有搜索结果的缩略图",
    component: "Switch"
  },
  {
    component: "Divider",
    label: "Ascii2d配置"
  },
  {
    field: "picSearch.ascii2dUsePuppeteer",
    label: "Puppeteer绕cf",
    bottomHelpMessage: "是否使用 Puppeteer 请求 ascii2d 以绕过 cf js challenge",
    component: "Switch"
  },
  {
    field: "picSearch.cfTLSVersion",
    label: "TLS 版本",
    bottomHelpMessage: "绕过 Cloudflare Challenge 所使用的 TLS 版本，建议可选值：[\"TLSv1.1\", \"TLSv1.2\"]node >= 18 无法使用 TLSv1.1，现已不推荐更改",
    component: "Input"
  },
  {
    field: "picSearch.ascii2dResultMaxQuantity",
    label: "ascii2d结果数量",
    bottomHelpMessage: "ascii2d搜图返回结果的最大数量",
    component: "InputNumber"
  },
  {
    field: "picSearch.Ascii2dHost",
    label: "Ascii2d Host",
    bottomHelpMessage: "Ascii2d 403解决方案使用cf反代 https://github.com/Tsuk1ko/cq-picsearcher-bot/wiki/ascii2d-403-%E8%A7%A3%E5%86%B3%E6%96%B9%E6%A1%88",
    component: "Input"
  },
  {
    component: "Divider",
    label: "Saucenao配置"
  },
  {
    field: "picSearch.useAscii2dWhenLowAcc",
    label: "相似度过低使用ascii2d",
    bottomHelpMessage: "在 saucenao 相似度过低时自动使用 ascii2d",
    component: "Switch"
  },
  {
    field: "picSearch.useAscii2dWhenFailed",
    label: "搜索失败使用ascii2d",
    bottomHelpMessage: "在 saucenao 搜索失败时自动使用 ascii2d",
    component: "Switch"
  },
  {
    field: "picSearch.SauceNAOApiKey",
    label: "SauceNAO搜图apikey",
    bottomHelpMessage: "SauceNAO搜图apikey 请在 https://saucenao.com/user.php?page=search-api 进行获取",
    component: "Input"
  },
  {
    field: "picSearch.SauceNAOMinSim",
    label: "SauceNAO相似度警戒值",
    bottomHelpMessage: "SauceNAO搜图相似度低于这个百分比将被认定为相似度过低",
    component: "InputNumber"
  },
  {
    field: "picSearch.hideImgWhenSaucenaoNSFW",
    label: "SauceNAO NSFW 隐藏缩略图",
    bottomHelpMessage: "哔咔返回的图片质量",
    component: "Select",
    componentProps: {
      options: [
        { label: "不隐藏", value: 0 },
        { label: "隐藏明确为 NSFW 的缩略图", value: 1 },
        { label: "隐藏明确和可能为 NSFW 的缩略图", value: 2 },
        { label: "只显示明确为非 NSFW 的缩略图", value: 3 }
      ],
      placeholder: "请选择严格程度"
    }
  },
  {
    component: "Divider",
    label: "Whatanime配置"
  },
  {
    field: "picSearch.hideImgWhenWhatanimeR18",
    label: "whatanime R18 隐藏图",
    bottomHelpMessage: "whatanime 得到 R18 结果时隐藏结果缩略图",
    component: "Switch"
  },
  {
    field: "picSearch.whatanimeSendVideo",
    label: "whatanime预览视频",
    bottomHelpMessage: "whatanime 发送预览视频，R18 结果不会发送",
    component: "Switch"
  }
]
