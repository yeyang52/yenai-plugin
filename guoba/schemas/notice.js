export default [
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
    label: "通知其他设置"
  },
  {
    field: "notice.default.notificationsAll",
    label: "通知全部管理",
    bottomHelpMessage: "开启后通知将会发送给所有主人",
    component: "Switch"
  },
  {
    field: "notice.default.msgSaveDeltime",
    label: "删除缓存时间",
    helpMessage: "删除撤回消息保存的时间",
    bottomHelpMessage: "不建议设置太久",
    component: "InputNumber"
  }
]
