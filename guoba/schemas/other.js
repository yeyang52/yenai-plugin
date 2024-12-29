export default [
  {
    component: "SOFT_GROUP_BEGIN",
    label: "其他配置"
  },
  {
    field: "other.autoMaegeCfg",
    label: "配置文件合并",
    bottomHelpMessage: "检测到默认配置文件更新自动合并用户配置文件",
    component: "Switch"
  },
  {
    field: "other.githubAssetsImg",
    label: "github缩略图",
    bottomHelpMessage: "检测到github链接自动发送缩略图",
    component: "Switch"
  },
  {
    field: "other.renderScale",
    label: "渲染精度",
    component: "InputNumber",
    componentProps: { min: 50, max: 200 },
    bottomHelpMessage: "数字越大渲染精度越高，但会占用更多资源 50 - 200"
  }

]
