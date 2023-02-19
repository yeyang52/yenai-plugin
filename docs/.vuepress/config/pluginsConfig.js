const moment = require('moment')
module.exports = {
    '@vuepress/pwa': {
        serviceWorker: true,
        updatePopup: {
            message: '好像有更新诶！',
            buttonText: '走！瞅瞅去！',
        },
    },
    '@vuepress/last-updated': {
        transformer: (timestamp) => moment(timestamp).format('YYYY-MM-DD HH:mm:ss')
    },
    '@vuepress/medium-zoom': {
        selector: '.content__default:not(.custom) img',
    },
    '@vuepress-reco/bgm-player': {
        audios: [
            {
                name: '我再没见过 像你一般的星空',
                artist: 'Seto',
                url: 'https://assets.smallsunnyfox.com/music/2.mp3',
                cover: 'https://assets.smallsunnyfox.com/music/2.jpg'
            },
            {
                name: '萤火之森',
                artist: 'CMJ',
                url: 'https://assets.smallsunnyfox.com/music/3.mp3',
                cover: 'https://assets.smallsunnyfox.com/music/3.jpg'
            }
        ],
        autoplay: true
    },
    'vuepress-plugin-sponsor': {
        theme: 'simple',
        alipay: '/sponsor-qrcode/qrcode-alipay.png',
        // alipay: '/yenai-plugin/sponsor-qrcode/qrcode-alipay.png',
        wechat: '/sponsor-qrcode/qrcode-wechat.png',
        // wechat: '/yenai-plugin/sponsor-qrcode/qrcode-wechat.png',
        qq: '/sponsor-qrcode/qrcode-qq.png',
        // qq: '/yenai-plugin/sponsor-qrcode/qrcode-qq.png',
        duration: 2000
    },
    //自动生成侧边栏
    "vuepress-plugin-auto-sidebar": true,
    //随机名言
    "vuepress-plugin-boxx": true,
    //点击特效
    'cursor-effects': true,
    //动态标题
    "dynamic-title": true,
    //悬挂小猫返回顶部
    // "go-top": true,
    //关闭自带
    // "@vuepress-reco/back-to-top": false,
    //樱花
    "sakura": {},
    //彩带
    "vuepress-plugin-ribbon-animation": {
        ribbonShow: false,
    },
    //公告
    "@vuepress-reco/bulletin-popover": {
        // width: '300px', // 默认 260px
        title: '消息提示',
        body: [
            {
                type: 'title',
                content: '欢迎加入QQ交流群 🎉🎉🎉',
            },
            {
                type: 'text',
                content: 'QQ群：254974507',
                style: 'text-align: center;'
            },
            {
                type: 'text',
                content: `如果你觉得插件还不错，可以为作者贡献一杯奶茶。
          <ul>
            <li><a href="https://github.com/yeyang52/yenai-plugin/issues">Issues<a/></li>
          </ul>`,
                style: 'font-size: 12px;'
            },
        ],
        footer: [
            {
                type: 'button',
                text: '打赏',
                link: '/donate'
            }
        ]
    },
}