import { docsearchPlugin } from "@vuepress/plugin-docsearch";
export default [
    docsearchPlugin({
        apiKey: 'e06a8158e380032996667007566df42f',
        indexName: 'yenai',
        // 如果 Algolia 没有为你提供 `appId` ，使用 `BH4D9OD16A` 或者移除该配置项
        appId: '7AT6JPKZZA',
    })
]