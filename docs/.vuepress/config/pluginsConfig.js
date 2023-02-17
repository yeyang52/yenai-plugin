const moment = require('moment')
moment.locale('zh-cn')
module.exports = {
    '@vuepress/last-updated': {
        transformer: (timestamp) => moment(timestamp).format('LLLL')
    },
    '@vuepress/back-to-top': true,
    "vuepress-plugin-auto-sidebar": {}
}