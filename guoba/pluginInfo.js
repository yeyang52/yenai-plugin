import { Plugin_Path } from "../components/index.js"

export default {
  name: "yenai-plugin",
  title: "Yenai-Plugin",
  author: "@yeyang52",
  authorLink: "https://gitee.com/yeyang52",
  link: "https://gitee.com/yeyang52/yenai-plugin",
  isV3: true,
  isV2: false,
  description: "提供对Bot的一些便捷操作",
  // 显示图标，此为个性化配置
  // 图标可在 https://icon-sets.iconify.design 这里进行搜索
  // icon: 'emojione-monotone:baby-chick',
  // 图标颜色，例：#FF0000 或 rgb(255, 0, 0)
  // iconColor: '#ffff99',
  // 如果想要显示成图片，也可以填写图标路径（绝对路径）
  iconPath: `${Plugin_Path}/resources/img/tb.png`
}
