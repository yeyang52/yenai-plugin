import { defineUserConfig } from "vuepress";
import theme from "./theme.js";
import plugins from "./plugins.js";

export default defineUserConfig({
  base: "/",
  lang: "zh-CN",
  title: "Yenai-plugin",
  description: "Yunzai-Bot的扩展插件",
  // locales: {
  //   // "/": {
  //   //   lang: "en-US",
  //   //   title: "Docs Demo",
  //   //   description: "A docs demo for vuepress-theme-hope",
  //   // },
  //   // "/": {
  //   //   lang: "zh-CN",
  //   //   title: "文档演示",
  //   //   description: "vuepress-theme-hope 的文档演示",
  //   // },
  // },

  theme,
  plugins,
  // Enable it with pwa
  shouldPrefetch: false,
});
