export default [
  {
    component: "SOFT_GROUP_BEGIN",
    label: "通知配置"
  },
  {
    component: "Divider",
    label: "消息通知"
  },
  {
    field: "notice.default.privateMessage",
    label: "好友消息",
    bottomHelpMessage: "开启后将转发好友消息，可进行回复",
    component: "Switch"
  },
  {
    field: "notice.default.groupMessage",
    label: "群聊消息",
    helpMessage: "开启后将转发全部群聊消息，建议配置单独群开启",
    bottomHelpMessage: "是否开启群聊消息通知",
    component: "Switch"
  },
  {
    field: "notice.default.grouptemporaryMessage",
    label: "群临时消息",
    bottomHelpMessage: "开启后将转发群临时消息",
    component: "Switch"
  },
  {
    field: "notice.default.groupRecall",
    label: "群聊撤回",
    bottomHelpMessage: "群聊撤回后将撤回的消息转发给主人",
    component: "Switch"
  },
  {
    field: "notice.default.PrivateRecall",
    label: "好友撤回",
    bottomHelpMessage: "好友私聊撤回后将撤回的消息转发给主人",
    component: "Switch"
  },
  {
    component: "Divider",
    label: "申请通知"
  },
  {
    field: "notice.default.friendRequest",
    label: "好友申请",
    helpMessage: "将云崽的自动同意好友申请关闭后，可回复同意或拒绝进行处理",
    bottomHelpMessage: "是否开启好友申请通知",
    component: "Switch"
  },
  {
    field: "notice.default.addGroupApplication",
    label: "加群申请",
    helpMessage: "可回复同意或拒绝进行处理",
    bottomHelpMessage: "是否开启加群申请通知",
    component: "Switch"
  },
  {
    field: "notice.default.groupInviteRequest",
    label: "群聊邀请",
    helpMessage: "将云崽的自动退群设置为0后，可回复同意或拒绝进行处理",
    bottomHelpMessage: "是否开启群聊邀请通知",
    component: "Switch"
  },
  {
    component: "Divider",
    label: "列表变动"
  },
  {
    field: "notice.default.groupAdminChange",
    label: "群管理变动",
    bottomHelpMessage: "Bot被设置或取消管理，群员被设置或取消管理通知",
    component: "Switch"
  },
  {
    field: "notice.default.friendNumberChange",
    label: "好友列表变动",
    bottomHelpMessage: "新增好友和好友减少通知",
    component: "Switch"
  },
  {
    field: "notice.default.groupNumberChange",
    label: "群聊列表变动",
    bottomHelpMessage: "群转让，新增群聊，Bot退群，Bot被踢，群员被踢等通知",
    component: "Switch"
  },
  {
    field: "notice.default.groupMemberNumberChange",
    label: "群成员变动",
    bottomHelpMessage: "新增群员，群员被踢，群员退群等通知",
    component: "Switch"
  },
  {
    component: "Divider",
    label: "其他通知"
  },
  {
    field: "notice.default.botBeenBanned",
    label: "Bot被禁言",
    bottomHelpMessage: "Bot在群聊被禁言后通知主人",
    component: "Switch"
  },
  {
    component: "Divider",
    label: "通知其他配置"
  },
  {
    field: "notice.default.notificationsAll",
    label: "通知全部管理",
    bottomHelpMessage: "开启后通知将会发送给所有主人",
    component: "Switch"
  },
  {
    field: "notice.default.msgSaveDeltime",
    label: "缓存删除时间",
    helpMessage: "删除撤回消息保存的时间",
    bottomHelpMessage: "不建议设置太久",
    component: "InputNumber"
  },
  getGroupAlone({ field: "notice.groupAlone", label: "群单独配置" }),
  {
    field: "notice.botAlone",
    label: "Bot单独配置",
    component: "GSubForm",
    componentProps: {
      multiple: true,
      schemas: [
        {
          field: "bot_id",
          label: "Bot ID",
          component: "Input",
          required: true
        },
        {
          field: "privateMessage",
          label: "好友消息",
          component: "Switch"
        },
        {
          field: "PrivateRecall",
          label: "好友撤回",
          component: "Switch"
        },
        {
          field: "friendRequest",
          label: "好友申请",
          component: "Switch"
        },
        {
          field: "friendNumberChange",
          label: "好友列表变动",
          component: "Switch"
        },
        {
          field: "groupInviteRequest",
          label: "群邀请",
          component: "Switch"
        }
      ]
    }
  },
  getGroupAlone({
    field: "notice.botAndGroupAlone",
    label: "Bot群单独配置",
    schemas: [
      {
        field: "bot_id",
        label: "Bot ID",
        component: "Input",
        required: true
      }
    ]
  })
]
function getGroupAlone({ field, label, schemas = [] }) {
  return {
    field,
    label,
    component: "GSubForm",
    componentProps: {
      multiple: true,
      schemas: [
        ...schemas,
        {
          field: "group_id",
          label: "群号",
          component: "Input",
          required: true
        },
        {
          field: "groupMessage",
          label: "群消息",
          component: "Switch"
        },
        {
          field: "grouptemporaryMessage",
          label: "群临时消息",
          component: "Switch"
        },
        {
          field: "groupRecall",
          label: "群撤回",
          component: "Switch"
        },
        {
          field: "groupAdminChange",
          label: "群管理变动",
          component: "Switch"
        },
        {
          field: "groupNumberChange",
          label: "群聊列表变动",
          component: "Switch"
        },
        {
          field: "groupMemberNumberChange",
          label: "群成员变动",
          component: "Switch"
        },
        {
          field: "addGroupApplication",
          label: "加群申请",
          component: "Switch"
        },
        {
          field: "botBeenBanned",
          label: "Bot被禁言",
          component: "Switch"
        }
      ]
    }
  }
}
