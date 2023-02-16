
module.exports = {
  base: '/yenai-plugin/',
  title: 'Yenai-Plugin',
  description: 'Just playing around',
  themeConfig: {
    sidebar: 'auto',
    displayAllHeaders: true,
    nav: [
      { text: '首页', link: '/' },
      { text: '介绍', link: '/guide/' },
      { text: '功能', link: '/guide/features' },
      { text: 'GitHub', link: 'https://github.com/yeyang52/yenai-plugin' },
      { text: 'Gitee', link: 'https://gitee.com/yeyang52/yenai-plugin' },
    ],
    lastUpdated: '最后更新',
    // 默认值是 true 。设置为 false 来禁用所有页面的 下一篇 链接
    nextLinks: true,
    // 默认值是 true 。设置为 false 来禁用所有页面的 上一篇 链接
    prevLinks: true,
    // 假定是 GitHub. 同时也可以是一个完整的 GitLab URL
    repo: 'yeyang52/yenai-plugin',
    // 自定义仓库链接文字。默认从 `themeConfig.repo` 中自动推断为
    // "GitHub"/"GitLab"/"Bitbucket" 其中之一，或是 "Source"。
    repoLabel: '查看源码',
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