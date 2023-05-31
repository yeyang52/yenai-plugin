import { Config } from './components/index.js'
/**
 *  支持锅巴
 *  锅巴插件：https://gitee.com/guoba-yunzai/guoba-plugin.git
 *  组件类型，可参考 https://vvbin.cn/doc-next/components/introduction.html
 *  https://antdv.com/components/overview-cn/
 */
const Path = process.cwd()
const Plugin_Path = `${Path}/plugins/yenai-plugin`

export function supportGuoba () {
  return {
    pluginInfo: {
      name: 'yenai-plugin',
      title: 'Yenai-Plugin',
      author: '@椰羊',
      authorLink: 'https://gitee.com/yeyang52',
      link: 'https://gitee.com/yeyang52/yenai-plugin',
      isV3: true,
      isV2: false,
      description: '提供对Bot的一些便捷操作',
      // 显示图标，此为个性化配置
      // 图标可在 https://icon-sets.iconify.design 这里进行搜索
      // icon: 'emojione-monotone:baby-chick',
      // 图标颜色，例：#FF0000 或 rgb(255, 0, 0)
      // iconColor: '#ffff99',
      // 如果想要显示成图片，也可以填写图标路径（绝对路径）
      iconPath: `${Plugin_Path}/resources/img/tb.png`
    },
    // 配置项信息
    configInfo: {
      // 配置项 schemas
      schemas: [
        {
          component: 'whole.Divider',
          label: '消息通知'
        },
        {
          field: 'whole.privateMessage',
          label: '好友消息',
          bottomHelpMessage: '开启后将转发好友消息，可进行回复',
          component: 'Switch'
        },
        {
          field: 'whole.groupMessage',
          label: '群聊消息',
          helpMessage: '开启后将转发全部群聊消息，建议配置单独群开启',
          bottomHelpMessage: '是否开启群聊消息通知',
          component: 'Switch'
        },
        {
          field: 'whole.grouptemporaryMessage',
          label: '群临时消息',
          bottomHelpMessage: '开启后将转发群临时消息',
          component: 'Switch'
        },
        {
          field: 'whole.groupRecall',
          label: '群聊撤回',
          bottomHelpMessage: '群聊撤回后将撤回的消息转发给主人',
          component: 'Switch'
        },
        {
          field: 'whole.PrivateRecall',
          label: '好友撤回',
          bottomHelpMessage: '好友私聊撤回后将撤回的消息转发给主人',
          component: 'Switch'
        },
        {
          component: 'Divider',
          label: '申请通知'
        },
        {
          field: 'whole.friendRequest',
          label: '好友申请',
          helpMessage: '将云崽的自动同意好友申请关闭后，可回复同意或拒绝进行处理',
          bottomHelpMessage: '是否开启好友申请通知',
          component: 'Switch'
        },
        {
          field: 'whole.addGroupApplication',
          label: '加群申请',
          helpMessage: '可回复同意或拒绝进行处理',
          bottomHelpMessage: '是否开启加群申请通知',
          component: 'Switch'
        },
        {
          field: 'whole.groupInviteRequest',
          label: '群聊邀请',
          helpMessage: '将云崽的自动退群设置为0后，可回复同意或拒绝进行处理',
          bottomHelpMessage: '是否开启群聊邀请通知',
          component: 'Switch'
        },
        {
          component: 'Divider',
          label: '列表变动'
        },
        {
          field: 'whole.groupAdminChange',
          label: '群管理变动',
          bottomHelpMessage: 'Bot被设置或取消管理，群员被设置或取消管理通知',
          component: 'Switch'
        },
        {
          field: 'whole.friendNumberChange',
          label: '好友列表变动',
          bottomHelpMessage: '新增好友和好友减少通知',
          component: 'Switch'
        },
        {
          field: 'whole.groupNumberChange',
          label: '群聊列表变动',
          bottomHelpMessage: '群转让，新增群聊，Bot退群，Bot被踢，群员被踢等通知',
          component: 'Switch'
        },
        {
          field: 'whole.groupMemberNumberChange',
          label: '群成员变动',
          bottomHelpMessage: '新增群员，群员被踢，群员退群等通知',
          component: 'Switch'
        },
        {
          component: 'Divider',
          label: '其他通知'
        },
        {
          field: 'whole.flashPhoto',
          label: '闪照',
          helpMessage: '目前QQ群聊闪照功能已被移除',
          bottomHelpMessage: '开启后将转发群聊和私聊的闪照',
          component: 'Switch'
        },
        {
          field: 'whole.botBeenBanned',
          label: 'Bot被禁言',
          bottomHelpMessage: 'Bot在群聊被禁言后通知主人',
          component: 'Switch'
        },
        {
          component: 'Divider',
          label: '其他设置'
        },
        {
          field: 'whole.Strangers_love',
          label: '陌生人点赞',
          bottomHelpMessage: '开启后赞我功能将可以陌生人点赞，不活跃的号有可能被风控',
          component: 'Switch'
        },
        {
          field: 'whole.state',
          label: '默认状态',
          bottomHelpMessage: '是否将椰奶状态作为默认状态',
          component: 'Switch'
        },
        {
          field: 'whole.notificationsAll',
          label: '通知全部管理',
          bottomHelpMessage: '开启后通知将会发送给所有主人',
          component: 'Switch'
        },
        {
          field: 'whole.deltime',
          label: '删除缓存时间',
          helpMessage: '删除撤回消息保存的时间',
          bottomHelpMessage: '不建议设置太久',
          component: 'InputNumber',
          componentProps: {
            placeholder: '请输入删除缓存时间'
          }
        },
        {
          component: 'Divider',
          label: '权限设置'
        },
        {
          field: 'whole.sese',
          label: 'sese',
          bottomHelpMessage: '开放一些功能',
          component: 'Switch'
        },
        {
          field: 'whole.sesepro',
          label: 'sesepro',
          bottomHelpMessage: '开放全部功能',
          component: 'Switch'
        },
        {
          component: 'Divider',
          label: 'pixiv设置'
        },
        {
          field: 'pixiv.pixivDirectConnection',
          label: 'pixiv图片直连',
          bottomHelpMessage: '直接使用官方图片链接发送，请确保你的网络环境可以访问pixiv',
          component: 'Switch'
        },
        {
          field: 'pixiv.allowPM',
          label: 'pixiv私聊使用',
          bottomHelpMessage: 'pixiv是否允许私聊使用',
          component: 'Switch'
        },
        {
          field: 'pixiv.refresh_token',
          label: 'pixiv登录刷新令牌',
          bottomHelpMessage: '登录后直接使用账号调用官方api，不登录也可以正常使用功能',
          component: 'Input'
        },
        {
          field: 'pixiv.pixivImageProxy',
          label: 'pixiv图片反代',
          bottomHelpMessage: 'pixiv图片反代服务，如可以直接访问pixiv请直接打开图片直连',
          component: 'Input'
        },
        {
          field: 'pixiv.limit',
          label: 'pixiv次数限制',
          bottomHelpMessage: '每名用户每日次数限制（0 则无限制）',
          component: 'InputNumber'
        },
        {
          field: 'pixiv.language',
          label: 'pixiv返回语言',
          bottomHelpMessage: '返回语言, 会影响标签的翻译',
          component: 'Input'
        },
        {
          component: 'Divider',
          label: '哔咔设置'
        },
        {
          field: 'bika.allowPM',
          label: '哔咔私聊使用',
          bottomHelpMessage: '哔咔是否允许私聊使用',
          component: 'Switch'
        },
        {
          field: 'bika.bikaDirectConnection',
          label: '哔咔图片直连',
          bottomHelpMessage: '直接使用官方图片链接发送，请确保你的网络环境可以访问哔咔',
          component: 'Switch'
        },
        {
          field: 'bika.limit',
          label: '哔咔次数限制',
          bottomHelpMessage: '每名用户每日次数限制（0 则无限制）',
          component: 'InputNumber'
        },
        {
          field: 'bika.bikaImageProxy',
          label: '哔咔图片反代',
          bottomHelpMessage: '哔咔图片反代服务，如可以直接访问bika请直接打开图片直连',
          component: 'Input'
        },
        {
          field: 'bika.imageQuality',
          label: '哔咔图片质量',
          bottomHelpMessage: '哔咔返回的图片质量',
          component: 'Select',
          componentProps: {
            options: [
              { label: '低', value: 'low' },
              { label: '中', value: 'medium' },
              { label: '高', value: 'high' },
              { label: '原图', value: 'original' }
            ],
            placeholder: '请选择图片质量'
          }
        },
        {
          component: 'Divider',
          label: '搜图设置'
        },
        {
          field: 'picSearch.isMasterUse',
          label: '搜图主人独享',
          bottomHelpMessage: '搜图是否只有主人能用',
          component: 'Switch'
        },
        {
          field: 'picSearch.allowPM',
          label: '搜图私聊使用',
          bottomHelpMessage: '搜图是否允许私聊使用',
          component: 'Switch'
        },
        {
          field: 'picSearch.ascii2dUsePuppeteer',
          label: 'Puppeteer绕cf',
          bottomHelpMessage: '是否使用 Puppeteer 请求 ascii2d 以绕过 cf js challenge',
          component: 'Switch'
        },
        {
          field: 'picSearch.hideImg',
          label: '隐藏结果缩略图',
          bottomHelpMessage: '隐藏所有搜索结果的缩略图',
          component: 'Switch'
        },
        {
          field: 'picSearch.hideImgWhenWhatanimeR18',
          label: 'whatanime R18 隐藏图',
          bottomHelpMessage: 'whatanime 得到 R18 结果时隐藏结果缩略图',
          component: 'Switch'
        },
        {
          field: 'picSearch.whatanimeSendVideo',
          label: 'whatanime预览视频',
          bottomHelpMessage: 'whatanime 发送预览视频，R18 结果不会发送',
          component: 'Switch'
        },
        {
          field: 'picSearch.useAscii2dWhenLowAcc',
          label: 'saucenao 相似度过低使用ascii2d',
          bottomHelpMessage: '是否在 saucenao 相似度过低时自动使用 ascii2d',
          component: 'Switch'
        },
        {
          field: 'picSearch.useAscii2dWhenFailed',
          label: 'saucenao 搜索失败使用ascii2d',
          bottomHelpMessage: '是否在 saucenao 搜索失败时自动使用 ascii2d',
          component: 'Switch'
        },
        {
          field: 'picSearch.limit',
          label: '搜图次数限制',
          bottomHelpMessage: '每名用户每日次数限制（0 则无限制）',
          component: 'InputNumber'
        },
        {
          field: 'picSearch.SauceNAOApiKey',
          label: 'SauceNAO搜图apikey',
          bottomHelpMessage: 'SauceNAO搜图apikey 请在 https://saucenao.com/user.php?page=search-api 进行获取',
          component: 'Input'
        },
        {
          field: 'picSearch.SauceNAOMinSim',
          label: 'SauceNAO相似度警戒值',
          bottomHelpMessage: 'SauceNAO搜图相似度低于这个百分比将被认定为相似度过低',
          component: 'InputNumber'
        },
        {
          field: 'picSearch.hideImgWhenSaucenaoNSFW',
          label: 'SauceNAO NSFW 隐藏缩略图',
          bottomHelpMessage: '哔咔返回的图片质量',
          component: 'Select',
          componentProps: {
            options: [
              { label: '不隐藏', value: 0 },
              { label: '隐藏明确为 NSFW 的缩略图', value: 1 },
              { label: '隐藏明确和可能为 NSFW 的缩略图', value: 2 },
              { label: '只显示明确为非 NSFW 的缩略图', value: 3 }
            ],
            placeholder: '请选择严格程度'
          }
        },
        {
          field: 'picSearch.cfTLSVersion',
          label: 'TLS 版本',
          bottomHelpMessage: '绕过 Cloudflare Challenge 所使用的 TLS 版本，建议可选值：["TLSv1.1", "TLSv1.2"]',
          component: 'Input'
        },
        {
          field: 'picSearch.ascii2dResultMaxQuantity',
          label: 'ascii2d结果数量',
          bottomHelpMessage: 'ascii2d搜图返回结果的最大数量',
          component: 'InputNumber'
        }

      ],
      // 获取配置数据方法（用于前端填充显示数据）
      getConfigData () {
        return {
          whole: Config.whole,
          pixiv: Config.pixiv,
          bika: Config.bika,
          picSearch: Config.picSearch
        }
      },

      // 设置配置的方法（前端点确定后调用的方法）
      setConfigData (data, { Result }) {
        for (let key in data) Config.modify(...key.split('.'), data[key])

        return Result.ok({}, '保存成功辣ε(*´･ω･)з')
      }
    }
  }
}
