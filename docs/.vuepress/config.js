const navConfig = require('./config/navConfig')
const pluginsConfig = require('./config/pluginsConfig')
const headConfig = require('./config/headConfig')
const sidebarConfig = require('./config/sidebarConfig')

module.exports = {
  base: '/yenai-plugin/',
  title: 'Yenai-Plugin',
  description: 'Yunzai-Bot的一个扩展插件',
  head: headConfig,
  plugins: pluginsConfig,
  theme: 'reco',
  themeConfig: {
    //评论
    valineConfig: {
      appId: 'xHmzBTN6lvuLAlBvZbGcQWWZ-gzGzoHsz',// your appId
      appKey: 'DfYRscIDhbBP2Ka9pMWq9GyQ', // your appKey
      placeholder: '善语结善缘，恶语伤人心',
      avatar: 'wavatar',
    },
    // 项目开始时间
    startYear: '2022',
    //作者
    author: '椰羊',
    //自动形成侧边导航及其深度
    subSidebar: 'auto',
    // 导航栏左侧logo
    logo: '/img/logo.png',
    //导航栏配置
    nav: navConfig,
    //更新时间
    lastUpdated: '最后更新',
    // 默认值是 true 。设置为 false 来禁用所有页面的 下一篇 链接
    nextLinks: true,
    // 默认值是 true 。设置为 false 来禁用所有页面的 上一篇 链接
    prevLinks: true,
    // 假定是 GitHub. 同时也可以是一个完整的 GitLab URL
    repo: 'yeyang52/yenai-plugin',
    // 自定义仓库链接文字。默认从 `themeConfig.repo` 中自动推断为
    // "GitHub"/"GitLab"/"Bitbucket" 其中之一，或是 "Source"。
    repoLabel: 'GitHub',
    // 假如文档不是放在仓库的根目录下：
    docsDir: 'docs',
    // 假如文档放在一个特定的分支下：
    docsBranch: 'docs',
    // 默认是 false, 设置为 true 来启用
    editLinks: true,
    // 默认为 "Edit this page"
    editLinkText: '在 GitHub 上编辑此页'
  }
}