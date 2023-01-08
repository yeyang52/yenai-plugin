import { Config } from './components/index.js'
/**
 *  支持锅巴
 *  锅巴插件：https://gitee.com/guoba-yunzai/guoba-plugin.git
 *  组件类型，可参考 https://vvbin.cn/doc-next/components/introduction.html
 *  https://antdv.com/components/overview-cn/
 */
const Path = process.cwd();
const Plugin_Path = `${Path}/plugins/yenai-plugin`;

export function supportGuoba() {
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
      iconPath: `${Plugin_Path}/resources/img/tb.png`,
    },
    // 配置项信息
    configInfo: {
      // 配置项 schemas
      schemas: [
        {
          component: 'Divider',
          label: '消息通知',
        },
        {
          field: 'privateMessage',
          label: '好友消息',
          bottomHelpMessage: '开启后将转发好友消息，可进行回复',
          component: 'Switch',
        },
        {
          field: 'groupMessage',
          label: '群聊消息',
          helpMessage: '开启后将转发全部群聊消息，建议配置单独群开启',
          bottomHelpMessage: '是否开启群聊消息通知',
          component: 'Switch',
        },
        {
          field: 'grouptemporaryMessage',
          label: '群临时消息',
          bottomHelpMessage: '开启后将转发群临时消息',
          component: 'Switch',
        },
        {
          field: 'groupRecall',
          label: '群聊撤回',
          bottomHelpMessage: '群聊撤回后将撤回的消息转发给主人',
          component: 'Switch',
        },
        {
          field: 'PrivateRecall',
          label: '好友撤回',
          bottomHelpMessage: '好友私聊撤回后将撤回的消息转发给主人',
          component: 'Switch',
        },
        {
          component: 'Divider',
          label: '申请通知',
        },
        {
          field: 'friendRequest',
          label: '好友申请',
          helpMessage: '将云崽的自动同意好友申请关闭后，可回复同意或拒绝进行处理',
          bottomHelpMessage: '是否开启好友申请通知',
          component: 'Switch',
        },
        {
          field: 'addGroupApplication',
          label: '加群申请',
          helpMessage: '可回复同意或拒绝进行处理',
          bottomHelpMessage: '是否开启加群申请通知',
          component: 'Switch',
        },
        {
          field: 'groupInviteRequest',
          label: '群聊邀请',
          helpMessage: '将云崽的自动退群设置为0后，可回复同意或拒绝进行处理',
          bottomHelpMessage: '是否开启群聊邀请通知',
          component: 'Switch',
        },
        {
          component: 'Divider',
          label: '列表变动',
        },
        {
          field: 'groupAdminChange',
          label: '群管理变动',
          bottomHelpMessage: 'Bot被设置或取消管理，群员被设置或取消管理通知',
          component: 'Switch',
        },
        {
          field: 'friendNumberChange',
          label: '好友列表变动',
          bottomHelpMessage: '新增好友和好友减少通知',
          component: 'Switch',
        },
        {
          field: 'groupNumberChange',
          label: '群聊列表变动',
          bottomHelpMessage: '群转让，新增群聊，Bot退群，Bot被踢，群员被踢等通知',
          component: 'Switch',
        },
        {
          field: 'groupMemberNumberChange',
          label: '群成员变动',
          bottomHelpMessage: '新增群员，群员被踢，群员退群等通知',
          component: 'Switch',
        },
        {
          component: 'Divider',
          label: '其他通知',
        },
        {
          field: 'flashPhoto',
          label: '闪照',
          helpMessage: '目前QQ群聊闪照功能已被移除',
          bottomHelpMessage: '开启后将转发群聊和私聊的闪照',
          component: 'Switch',
        },
        {
          field: 'botBeenBanned',
          label: 'Bot被禁言',
          bottomHelpMessage: 'Bot在群聊被禁言后通知主人',
          component: 'Switch',
        },
        {
          component: 'Divider',
          label: '其他设置',
        },
        {
          field: 'Strangers_love',
          label: '陌生人点赞',
          bottomHelpMessage: '开启后赞我功能将可以陌生人点赞，不活跃的号有可能被风控',
          component: 'Switch',
        },
        {
          field: 'state',
          label: '默认状态',
          bottomHelpMessage: '是否将椰奶状态作为默认状态',
          component: 'Switch',
        },
        {
          field: 'statusTask',
          label: '状态任务',
          helpMessage: '关闭后不再读取网速和硬盘速率',
          bottomHelpMessage: '如果出现许多cmd进程占用或控制台输出乱码可尝试关闭此选项',
          component: 'Switch',
        },
        {
          field: 'notificationsAll',
          label: '通知全部管理',
          bottomHelpMessage: '开启后通知将会发送给所有主人',
          component: 'Switch',
        },
        {
          field: 'deltime',
          label: '删除缓存时间',
          helpMessage: '删除撤回消息保存的时间',
          bottomHelpMessage: '不建议设置太久',
          component: 'InputNumber',
          componentProps: {
            placeholder: '请输入删除缓存时间',
          },
        },
        {
          component: 'Divider',
          label: 'pixiv设置',
        },
        {
          field: 'sese',
          label: 'sese',
          bottomHelpMessage: '开放一些功能',
          component: 'Switch',
        },
        {
          field: 'sesepro',
          label: 'sesepro',
          bottomHelpMessage: '开放全部功能',
          component: 'Switch',
        },

      ],
      // 获取配置数据方法（用于前端填充显示数据）
      getConfigData() {
        return Config.Notice
      },

      // 设置配置的方法（前端点确定后调用的方法）
      setConfigData(data, { Result }) {

        for (let key in data) Config.modify("whole", key, data[key])


        return Result.ok({}, '保存成功辣ε(*´･ω･)з')
      },
    },
  }
}
