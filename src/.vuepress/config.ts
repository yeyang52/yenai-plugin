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

  head: [
    ['script', {}, `
  var _hmt = _hmt || [];
  (function () {
    var hm = document.createElement("script");
    hm.src = "https://hm.baidu.com/hm.js?b6b4a725c3bf645078e151689f5e183e";
    var s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(hm, s);
  })();
  `],
  ],
  theme,
  plugins,
  // Enable it with pwa
  shouldPrefetch: false,
});
