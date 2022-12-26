import path from 'path'
import lodash from 'lodash'
import { Config } from './components/index.js'
import YamlReader from './model/YamlReader.js'
/**
 *  支持锅巴
 *  锅巴插件：https://gitee.com/guoba-yunzai/guoba-plugin.git
 *  组件类型，可参考 https://vvbin.cn/doc-next/components/introduction.html
 *  https://antdv.com/components/overview-cn/
 */
const Path = process.cwd();
const Plugin_Name = 'yenai-plugin'
const Plugin_Path = `${Path}/plugins/${Plugin_Name}`;
export function supportGuoba() {
  return {
    pluginInfo: {
      name: 'yenai-plugin',
      title: 'yenai-Plugin',
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
          field: 'privateMessage',
          label: '好友消息',
          bottomHelpMessage: '是否开启好友消息通知',
          component: 'Switch',
        },
        {
          field: 'groupMessage',
          label: '群聊消息',
          bottomHelpMessage: '是否开启群聊消息通知',
          component: 'Switch',
        },
        {
          field: 'grouptemporaryMessage',
          label: '群临时消息',
          bottomHelpMessage: '是否开启群临时消息通知',
          component: 'Switch',
        },
        {
          field: 'groupRecall',
          label: '群聊撤回',
          bottomHelpMessage: '是否开启群聊撤回通知',
          component: 'Switch',
        },
        {
          field: 'PrivateRecall',
          label: '好友撤回',
          bottomHelpMessage: '是否开启好友撤回通知',
          component: 'Switch',
        },
        {
          //分隔线
          component: 'Divider',
        },
        {
          field: 'friendRequest',
          label: '好友申请',
          bottomHelpMessage: '是否开启好友申请通知',
          component: 'Switch',
        },
        {
          field: 'addGroupApplication',
          label: '加群申请',
          bottomHelpMessage: '是否开启加群申请通知',
          component: 'Switch',
        },
        {
          field: 'groupInviteRequest',
          label: '群聊邀请',
          bottomHelpMessage: '是否开启群聊邀请通知',
          component: 'Switch',
        },
        {
          //分隔线
          component: 'Divider',
        },
        {
          field: 'groupAdminChange',
          label: '群管理变动',
          bottomHelpMessage: '群聊的管理增加或减少通知',
          component: 'Switch',
        },
        {
          field: 'friendNumberChange',
          label: '好友列表变动',
          bottomHelpMessage: '好友列表增加或减少通知',
          component: 'Switch',
        },
        {
          field: 'groupNumberChange',
          label: '群聊列表变动',
          bottomHelpMessage: '群聊列表增加或减少通知',
          component: 'Switch',
        },
        {
          field: 'groupMemberNumberChange',
          label: '群成员变动',
          bottomHelpMessage: '群聊成员增加或减少通知',
          component: 'Switch',
        },
        {
          //分隔线
          component: 'Divider',
        },
        {
          field: 'flashPhoto',
          label: '闪照',
          bottomHelpMessage: '是否开启闪照通知',
          component: 'Switch',
        },
        {
          field: 'botBeenBanned',
          label: 'Bot被禁言',
          bottomHelpMessage: '是否开启Bot被禁言通知',
          component: 'Switch',
        },
        {
          //分隔线
          component: 'Divider',
        },
        {
          field: 'notificationsAll',
          label: '通知全部管理',
          bottomHelpMessage: '是否将通知发给所有Bot管理',
          component: 'Switch',
        },
        {
          field: 'state',
          label: '状态',
          bottomHelpMessage: '是否将椰奶状态作为默认状态',
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
      ],
      // 获取配置数据方法（用于前端填充显示数据）
      getConfigData() {
        return Config.Notice
      },

      // 设置配置的方法（前端点确定后调用的方法）
      setConfigData(data, { Result }) {

        let keys = Object.keys(data);

        //写入
        keys.forEach(key => {
          let path = `${Plugin_Path}/config/config/whole.yaml`
          new YamlReader(path).set(key, data[key])
        });

        return Result.ok({}, '保存成功辣ε(*´･ω･)з')
      },
    },
  }
}
