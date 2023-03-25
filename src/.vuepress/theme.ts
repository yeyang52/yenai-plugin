import { hopeTheme } from "vuepress-theme-hope";
import { zhNavbar } from "./navbar/index.js";
import { zhSidebar } from "./sidebar/index.js";

export default hopeTheme({
  hostname: "https://www.yenai.ren",

  author: {
    name: "yeyang",
    url: "https://github.com/yeyang52",
  },

  //博客
  blog: {
    avatar: 'https://q1.qlogo.cn/g?b=qq&s=0&nk=746659424',
    name: '椰羊',
    roundAvatar: true,
    medias: {
      "QQ": 'http://wpa.qq.com/msgrd?v=3&uin=746659424&site=qq&menu=yes',
      "Qzone": "https://746659424.qzone.qq.com/",
      "BiliBili": "https://b23.tv/hnc7YDg",
    }
  },

  iconAssets: "iconfont",

  logo: "/logo.png",

  repo: "yeyang52/yenai-plugin",

  docsRepo: 'https://github.com/yeyang52/yenai-plugin',

  docsBranch: 'docs',

  docsDir: 'src',

  //文章信息
  pageInfo: ["Author", "Original", "Date", "Category", "Tag", "ReadingTime", "Word", "PageView"],

  locales: {
    /**
     * Chinese locale config
     */
    "/": {
      // navbar
      navbar: zhNavbar,

      // sidebar
      sidebar: zhSidebar,

      footer: "Yunzai-Bot & Yenai-plugin",

      displayFooter: true,

      // page meta
      metaLocales: {
        editLink: "在 GitHub 上编辑此页",
      },
    },
  },

  // encrypt: {
  //   config: {
  //     "/demo/encrypt.html": ["1234"],
  //     "/zh/demo/encrypt.html": ["1234"],
  //   },
  // },

  plugins: {
    prismjs: {
      light: 'ateliersulphurpool-light'
    },
    blog: true,
    comment: {
      provider: "Waline",
      serverURL: "https://waline.yenai.ren",
      reaction: true
    },

    // all features are enabled for demo, only preserve features you need here
    mdEnhance: {
      align: true,
      attrs: true,
      chart: true,
      codetabs: true,
      demo: true,
      echarts: true,
      figure: true,
      flowchart: true,
      gfm: true,
      imgLazyload: true,
      imgSize: true,
      include: true,
      katex: true,
      mark: true,
      mermaid: true,
      playground: {
        presets: ["ts", "vue"],
      },
      presentation: {
        plugins: ["highlight", "math", "search", "notes", "zoom"],
      },
      stylize: [
        {
          matcher: "Recommended",
          replacer: ({ tag }) => {
            if (tag === "em")
              return {
                tag: "Badge",
                attrs: { type: "tip" },
                content: "Recommended",
              };
          },
        },
      ],
      sub: true,
      sup: true,
      tabs: true,
      vPre: true,
      vuePlayground: true,
    },

    // uncomment these if you want a pwa
    pwa: {
      favicon: "/favicon.ico",
      cacheHTML: true,
      cachePic: true,
      appendBase: true,
      apple: {
        icon: "/assets/icon/favicon144.png",
        statusBarColor: "black",
      },
      msTile: {
        image: "/assets/icon/favicon144.png",
        color: "#ffffff",
      },
      manifest: {
        icons: [
          {
            src: "/assets/icon/favicon512.png",
            sizes: "512x512",
            purpose: "maskable",
            type: "image/png",
          },
          {
            src: "/assets/icon/favicon192.png",
            sizes: "192x192",
            purpose: "maskable",
            type: "image/png",
          },
          {
            src: "/assets/icon/favicon512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/assets/icon/favicon192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
        shortcuts: [
          {
            name: "快速上手",
            short_name: "快速上手",
            url: "/about",
            icons: [
              {
                src: "/assets/icon/favicon192.png",
                sizes: "192x192",
                purpose: "maskable",
                type: "image/png",
              },
            ],
          },
        ],
      },
    },
  },
});
