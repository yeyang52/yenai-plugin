module.exports = {
  title: 'Yenai-Plugin',
  description: 'Just playing around',
  themeConfig: {
    sidebar: 'auto',
    displayAllHeaders: true,
    nav: [
      { text: '首页', link: '/' },
      { text: '介绍', link: '/guide/' },
      { text: 'GitHub', link: 'https://github.com/yeyang52/yenai-plugin' },
      { text: 'Gitee', link: 'https://gitee.com/yeyang52/yenai-plugin' },
    ],
    lastUpdated: '最后更新',
    // 默认值是 true 。设置为 false 来禁用所有页面的 下一篇 链接
    nextLinks: true,
    // 默认值是 true 。设置为 false 来禁用所有页面的 上一篇 链接
    prevLinks: true,
    // 假定是 GitHub. 同时也可以是一个完整的 GitLab URL
    repo: 'yeyang52/yenai-plugin-file',
    // 自定义仓库链接文字。默认从 `themeConfig.repo` 中自动推断为
    // "GitHub"/"GitLab"/"Bitbucket" 其中之一，或是 "Source"。
    repoLabel: '查看源码',
  }
}