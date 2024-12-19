export default [
  {
    component: "Divider",
    label: "哔咔设置"
  },
  {
    field: "bika.allowPM",
    label: "哔咔私聊使用",
    bottomHelpMessage: "哔咔是否允许私聊使用",
    component: "Switch"
  },
  {
    field: "bika.bikaDirectConnection",
    label: "哔咔图片直连",
    bottomHelpMessage: "直接使用官方图片链接发送，请确保你的网络环境可以访问哔咔",
    component: "Switch"
  },
  {
    field: "bika.limit",
    label: "哔咔次数限制",
    bottomHelpMessage: "每名用户每日次数限制（0 则无限制）",
    component: "InputNumber"
  },
  {
    field: "bika.bikaImageProxy",
    label: "哔咔图片反代",
    bottomHelpMessage: "哔咔图片反代服务，如可以直接访问bika请直接打开图片直连",
    component: "Input"
  },
  {
    field: "bika.imageQuality",
    label: "哔咔图片质量",
    bottomHelpMessage: "哔咔返回的图片质量",
    component: "Select",
    componentProps: {
      options: [
        { label: "低", value: "low" },
        { label: "中", value: "medium" },
        { label: "高", value: "high" },
        { label: "原图", value: "original" }
      ],
      placeholder: "请选择图片质量"
    }
  }
]
