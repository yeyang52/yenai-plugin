module.exports = [
    //移动端优化
    ['meta', { name: 'viewport', content: 'width=device-width,initial-scale=1,user-scalable=no' }],
    //pwa
    ['link', { rel: 'icon', href: '/logo.png' }],
    ['link', { rel: 'icon', href: 'favicon.ico', type: 'image/x-icon' }],
    ['link', { rel: 'manifest', href: '/manifest.json' }],
    ['meta', { name: 'theme-color', content: '#222222' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
    ['link', { rel: 'apple-touch-icon', href: '/icons/favicon152.png' }],
    ['link', { rel: 'mask-icon', href: '/icons/favicon152.png', color: '#3eaf7c' }],
    ['meta', { name: 'msapplication-TileImage', content: '/icons/favicon144.png' }],
    ['meta', { name: 'msapplication-TileColor', content: '#000000' }],
]