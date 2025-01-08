export default [
  {
    component: "SOFT_GROUP_BEGIN",
    label: "群管配置"
  },
  {
    field: "groupAdmin.whiteQQ",
    label: "白名单QQ",
    component: "GTags",
    componentProps: {
      allowAdd: true,
      allowDel: true,
      valueFormatter: ((value) => Number.parseInt(value)).toString()
    }
  },
  {
    field: "groupAdmin.blackQQ",
    label: "黑名单QQ",
    component: "GTags",
    componentProps: {
      allowAdd: true,
      allowDel: true,
      valueFormatter: ((value) => Number.parseInt(value)).toString()
    }
  },
  {
    field: "groupAdmin.noBan",
    label: "白名单禁言自动解禁",
    component: "Switch"
  },
  {
    field: "groupAdmin.groupAddNotice.openGroup",
    label: "进群通知群聊",
    bottomHelpMessage: "将加群申请消息发送至群里面",
    component: "GSelectGroup"
  },
  {
    field: "groupAdmin.groupAddNotice.msg",
    label: "进群通知自定义消息",
    component: "Input"
  },
  {
    component: "Divider",
    label: "群管投票禁言设置"
  },
  {
    field: "groupAdmin.VoteBan",
    label: "投票禁言",
    component: "Switch"
  },
  {
    field: "groupAdmin.VoteKick",
    label: "投票踢人",
    component: "Switch"
  },
  {
    field: "groupAdmin.outTime",
    label: "禁言超时时间",
    component: "InputNumber"
  },
  {
    field: "groupAdmin.minNum",
    label: "最低所需票数",
    bottomHelpMessage: "不建议太低",
    component: "InputNumber"
  },
  {
    field: "groupAdmin.BanTime",
    label: "成功禁言时间",
    bottomHelpMessage: "单位：秒",
    component: "InputNumber"
  },
  {
    field: "groupAdmin.veto",
    label: "管理员一票否决",
    component: "Switch"
  },
  {
    field: "groupAdmin.voteAdmin",
    label: "投票禁言管理员",
    bottomHelpMessage: "开启后Bot为群主情况下可投票禁言管理员",
    component: "Switch"
  },
  {
    component: "Divider",
    label: "群管进群验证设置"
  },
  {
    field: "groupAdmin.groupVerify.openGroup",
    label: "开启的群聊",
    component: "GSelectGroup"
  },
  {
    field: "groupAdmin.groupVerify.SuccessMsgs",
    label: "验证成功消息",
    bottomHelpMessage: "0 字段代表默认回复",
    component: "GSubForm",
    componentProps: {
      multiple: true,
      schemas: [
        {
          field: "groupId",
          label: "群号",
          bottomHelpMessage: "",
          component: "Input",
          required: true
        },
        {
          field: "msg",
          label: "消息",
          bottomHelpMessage: "",
          component: "Input",
          required: true
        }
      ]
    }
  },
  {
    field: "groupAdmin.groupVerify.mode",
    label: "答案验证模式",
    component: "RadioGroup",
    required: true,
    componentProps: {
      options: [
        { label: "精确匹配", value: "精确" },
        { label: "模糊匹配", value: "模糊" }
      ]
    }
  },
  {
    field: "groupAdmin.groupVerify.times",
    label: "最多允许尝试次数",
    component: "InputNumber"
  },
  {
    field: "groupAdmin.groupVerify.remindAtLastMinute",
    label: "最后一分钟提醒",
    bottomHelpMessage: "仅在超时时长大于等于 120 秒时有效",
    component: "Switch"
  },
  {
    field: "groupAdmin.groupVerify.time",
    label: "超时时长",
    bottomHelpMessage: "单位：秒，建议至少一分钟（60 秒）",
    component: "InputNumber"
  },
  {
    field: "groupAdmin.groupVerify.range.min",
    label: "随机算式数字最小范围",
    component: "InputNumber"
  },
  {
    field: "groupAdmin.groupVerify.range.max",
    label: "随机算式数字最大范围",
    component: "InputNumber"
  },
  {
    field: "groupAdmin.groupVerify.DelayTime",
    label: "延迟发送验证时间",
    bottomHelpMessage: "收到进群事件后延迟多少秒再发送验证信息(秒) 确保验证消息在最下面",
    component: "InputNumber"
  }
]
