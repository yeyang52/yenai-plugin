export default [
  {
    component: "SOFT_GROUP_BEGIN",
    label: "代理配置"
  },
  {
    field: "proxy.switchProxy",
    label: "开启代理",
    bottomHelpMessage: "代理椰奶插件绝大部分请求",
    component: "Switch"
  },
  {
    field: "proxy.proxyAddress",
    label: "代理地址",
    component: "Input"
  },
  {
    field: "proxy.blacklist",
    label: "代理黑名单",
    component: "GTags",
    bottomHelpMessage: "开启全局代理后，指定地址将不会使用代理",
    componentProps: {
      allowAdd: true,
      allowDel: true,
      showPrompt: true,
      promptProps: {
        content: "请输入地址 可以使用*和?通配符：",
        placeholder: "请输入地址",
        okText: "添加黑名单",
        rules: [ { required: true, message: "地址得填上才行哦~" } ]
      }
    }
  },
  {
    field: "proxy.whitelist",
    label: "代理白名单",
    component: "GTags",
    bottomHelpMessage: "在全局关闭的情况下 该名单地址也会使用代理 可以使用*和?通配符",
    componentProps: {
      allowAdd: true,
      allowDel: true,
      showPrompt: true,
      promptProps: {
        content: "请输入地址 可以使用*和?通配符：",
        placeholder: "请输入地址",
        okText: "添加白名单",
        rules: [ { required: true, message: "地址得填上才行哦~" } ]
      }
    }
  }

]
