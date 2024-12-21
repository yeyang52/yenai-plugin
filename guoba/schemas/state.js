import fs from "fs"
export default [
  {
    component: "Divider",
    label: "状态设置"
  },
  {
    field: "state.defaultState",
    label: "默认状态",
    bottomHelpMessage: "将椰奶状态作为Yunzai默认状态",
    component: "Switch"
  },
  {
    field: "state.showFastFetch",
    label: "fastFetch显示模式",
    component: "RadioGroup",
    required: true,
    componentProps: {
      options: [
        { label: "始终显示", value: true },
        { label: "不显示", value: false },
        { label: "pro显示", value: "pro" },
        { label: "默认显示", value: "default" }
      ]
    }
  },
  {
    field: "state.showRedisInfo",
    label: "redis信息显示模式",
    component: "RadioGroup",
    required: true,
    componentProps: {
      options: [
        { label: "始终显示", value: true },
        { label: "不显示", value: false },
        { label: "pro显示", value: "pro" }
      ]
    }
  },
  {
    field: "state.systemResources",
    label: "显示的系统资源",
    bottomHelpMessage: "注意如果gpu获取不到将不会显示",
    component: "Select",
    componentProps: {
      allowClear: true,
      mode: "tags",
      options: [
        { value: "CPU" },
        { value: "RAM" },
        { value: "GPU" },
        { value: "SWAP" },
        { value: "Node" }
      ]
    }
  },
  {
    component: "Divider",
    label: "状态网络测试设置"
  },
  {
    field: "state.psTestSites.show",
    label: "显示模式",
    component: "RadioGroup",
    required: true,
    componentProps: {
      options: [
        { label: "始终显示", value: true },
        { label: "不显示", value: false },
        { label: "pro显示", value: "pro" }
      ]
    }
  },
  {
    field: "state.psTestSites.timeout",
    label: "超时时间",
    bottomHelpMessage: "单位：ms(毫秒)",
    component: "InputNumber"
  },
  {
    field: "state.psTestSites.list",
    label: "网络测试列表",
    bottomHelpMessage: "",
    component: "GSubForm",
    componentProps: {
      multiple: true,
      schemas: [
        {
          field: "name",
          label: "名称",
          bottomHelpMessage: "",
          component: "Input",
          required: true
        },
        {
          field: "url",
          label: "测试的链接",
          bottomHelpMessage: "",
          component: "Input",
          required: true
        },
        {
          field: "useProxy",
          label: "是否使用代理",
          bottomHelpMessage: "",
          component: "Switch"
        }
      ]
    }
  },
  {
    component: "Divider",
    label: "状态监控设置"
  },
  {
    field: "state.monitor.open",
    label: "开启监控任务",
    bottomHelpMessage: "网络 CPU RAM DiskIO",
    component: "Switch"
  },
  {
    field: "state.monitor.getDataInterval",
    label: "获取数据间隔",
    bottomHelpMessage: "间隔多久获取一次数据 时间越短越精确 单位毫秒",
    component: "InputNumber"
  },
  {
    field: "state.monitor.saveDataNumber",
    label: "存储数据最大数",
    bottomHelpMessage: "当数据量超出此值时会将最旧的数据删除",
    component: "InputNumber"
  },
  {
    field: "state.monitor.statusPowerShellStart",
    label: "PowerShellStart",
    bottomHelpMessage: "如果win出现内存异常的情况可将此配置项开启，如果打开后报错请将监控任务关闭",
    component: "Switch"
  },
  {
    field: "state.monitor.openRedisSaveData",
    label: "redis存储监控数据",
    bottomHelpMessage: "使用redis存储监控数据 重启后数据会保留",
    component: "Switch"
  },
  {
    component: "Divider",
    label: "状态进程负载设置"
  },
  {
    field: "state.processLoad.show",
    label: "显示模式",
    component: "RadioGroup",
    required: true,
    componentProps: {
      options: [
        { label: "pro显示", value: "pro" },
        { label: "始终显示", value: true },
        { label: "不显示", value: false }
      ]
    }
  },
  {
    field: "state.processLoad.list",
    label: "自定义显示进程",
    component: "GTags",
    componentProps: {
      allowAdd: true,
      allowDel: true,
      showPrompt: true,
      promptProps: {
        content: "请输入进程名 支持$开头支持js：",
        placeholder: "请输入进程名",
        okText: "添加进程",
        rules: [ { required: true, message: "进程名得填上才行哦~" } ]
      }
    }
  },
  {
    field: "state.processLoad.filterList",
    label: "过滤的进程",
    component: "GTags",
    componentProps: {
      allowAdd: true,
      allowDel: true,
      showPrompt: true,
      promptProps: {
        content: "请输入过滤进程名：",
        placeholder: "请输入过滤进程名",
        okText: "添加过滤进程",
        rules: [ { required: true, message: "进程名得填上才行哦~" } ]
      }
    }
  },
  {
    field: "state.processLoad.showCmd",
    label: "显示进程命令",
    component: "Switch"
  },
  {
    field: "state.processLoad.showMax.show",
    label: "显示最大占用进程",
    bottomHelpMessage: "是否使用redis存储监控数据 重启后数据会保留",
    component: "Switch"
  },
  {
    field: "state.processLoad.showMax.showNum",
    label: "显示最大占用进程数量",
    component: "InputNumber"
  },
  {
    field: "state.processLoad.showMax.order",
    label: "最大占用排序方式",
    component: "RadioGroup",
    required: true,
    componentProps: {
      options: [
        { label: "以cpu占用进行排序显示", value: "cpu" },
        { label: "以mem占用进行排序显示", value: "mem" },
        { label: "cpu占用和mem占用最多的各显示一半", value: "cpu_mem" }
      ]
    }
  },
  {
    component: "Divider",
    label: "状态图表设置"
  },
  {
    field: "state.chartsCfg.show",
    label: "显示模式",
    component: "RadioGroup",
    required: true,
    componentProps: {
      options: [
        { label: "始终显示", value: true },
        { label: "不显示", value: false },
        { label: "pro显示", value: "pro" }
      ]
    }
  },
  {
    field: "state.chartsCfg.titleColor",
    label: "标题颜色",
    component: "GColorPicker"
  },
  {
    field: "state.chartsCfg.titleText",
    label: "标题文字",
    component: "Input"
  },
  {
    field: "state.chartsCfg.color",
    label: "调色盘",
    bottomHelpMessage: "用于控制折线颜色",
    component: "GTags",
    componentProps: {
      allowAdd: true,
      allowDel: true
    }
  },
  {
    component: "Divider",
    label: "状态样式设置"
  },
  {
    field: "state.style.backdrop",
    label: "远程图片Api",
    component: "Input"
  },
  {
    field: "state.style.backdropDefault",
    label: "本地背景图",
    bottomHelpMessage: "当api请求失败时使用的默认背景图，请放置在yenai-plguin/resources/state/img/bg目录下",
    component: "Select",
    componentProps: {
      options: [
        { label: "随机", value: "random" },
        ...getBackdropDirectory()
      ]
    }
  },
  {
    field: "state.style.BotNameColor",
    label: "Bot昵称颜色",
    bottomHelpMessage: "支持渐变色请以gradient:开头 如 gradient:271.14deg,#001bff 0.98%,#00f0ff 25.79%,#fce84a 47.33%,#f34628 65.77%,#b275ff 91.4%",
    component: "Input"
  },
  {
    field: "state.style.progressBarColor.high",
    label: "进度条严重颜色",
    component: "GColorPicker"
  },
  {
    field: "state.style.progressBarColor.medium",
    label: "进度条中等颜色",
    component: "GColorPicker"
  },
  {
    field: "state.style.progressBarColor.low",
    label: "进度条正常颜色",
    component: "GColorPicker"
  },
  {
    field: "state.style.redisInfoValColor",
    label: "redis值颜色",
    component: "GColorPicker"
  }
]
function getBackdropDirectory() {
  const Bg_Path = "./plugins/yenai-plugin/resources/state/img/bg"
  return fs.readdirSync(Bg_Path).map(i => ({ label: i, value: i }))
}
