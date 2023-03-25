
/** 涩涩帮助 */
export const helpCfg = {
  title: '椰奶涩涩帮助',
  subTitle: 'Yunzai-Bot & Yenai-Plugin',
  columnCount: 3,
  colWidth: 265,
  theme: 'all',
  themeExclude: ['default'],
  style: {
    fontColor: '#ceb78b',
    descColor: '#eee',
    contBgColor: 'rgba(6, 21, 31, .5)',
    contBgBlur: 3,
    headerBgColor: 'rgba(6, 21, 31, .4)',
    rowBgColor1: 'rgba(6, 21, 31, .2)',
    rowBgColor2: 'rgba(6, 21, 31, .35)'
  }
}

export const helpList = [{
  group: 'Pixiv',
  list: [{
    icon: 1,
    title: '#无内鬼 #setu',
    desc: 'luoli接口随机图片'
  },
  {
    icon: 2,
    title: '#椰奶tag <关键词*3>',
    desc: 'luoli接口搜索tag'
  },
  {
    icon: 3,
    title: '#来(n)张好康的',
    desc: '国内镜像站接口，比较健康'
  },
  {
    icon: 4,
    title: '#pximg(pro)?',
    desc: '随机图片'
  },
  {
    icon: 5,
    title: '#查看热门tag',
    desc: '顾名思义'
  },
  {
    icon: 6,
    title: '#Pid搜图 <pid>',
    desc: '图片详情信息'
  },
  {
    title: '#tag(pro)搜图 <关键词>',
    desc: '不加Pro为国内镜像站接口',
    icon: 7
  },
  {
    title: '#Uid搜图 <uid或画师名>',
    desc: '搜索画师插画',
    icon: 8
  },
  {
    title: '#相关作品 <Pid>',
    desc: '作品的相关作品',
    icon: 9
  },
  {
    title: '#看看<类型>榜',
    desc: 'Pixiv榜单',
    icon: 10
  },
  {
    title: '#来(n)?张推荐图',
    desc: '登录后使用',
    icon: 19
  },
  {
    title: '#pixiv登录信息',
    desc: '登录后使用',
    icon: 19
  }
  ]
},
{
  group: '哔咔',
  list: [
    {
      icon: 7,
      title: '#哔咔搜索<关键词>',
      desc: '更多使用请查看文档'
    },
    {
      icon: 13,
      title: '#哔咔id<id>(第n页)?(第n话)?',
      desc: '查看作品详情'
    },
    {
      icon: 9,
      title: '#哔咔类别列表',
      desc: '适用于类别搜索'
    }, {
      icon: 20,
      title: '#哔咔看<1~20>',
      desc: '搜索后使用'
    },
    {
      icon: 13,
      title: '#哔咔下一页',
      desc: '快速翻页'
    },
    {
      icon: 15,
      title: '#哔咔下一话',
      desc: '快速下一话'
    }]
},
{
  group: '其他',
  list: [
    {
      icon: 15,
      title: '#coser',
      desc: '养眼=-='
    }, {
      title: '#acg刻晴',
      desc: 'acgcos',
      icon: 9
    },
    {
      title: '#来点xxx',
      desc: 'xxx',
      icon: 1
    }
  ]
}]

export const isSys = true
