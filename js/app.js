/* ============================================
   DogNav — Main Application Logic
   ============================================ */

// ---- Navigation Data ----
const categories = [
  {
    id: 'popular', name: '常用推荐', icon: 'star',
    sites: [
      { name: 'GitHub', url: 'https://github.com', desc: '全球最大的代码托管平台', ico: 'github.png' },
      { name: 'Gitee', url: 'https://gitee.com', desc: '国内最大的代码托管平台', ico: 'gitee.png' },
      { name: '吾爱破解', url: 'https://www.52pojie.cn', desc: '软件安全与逆向分析论坛', ico: '52.png' },
      { name: '精易论坛', url: 'https://bbs.125.la', desc: '编程学习交流论坛', ico: 'jingyi.png' },
      { name: '殁漂遥', url: 'https://www.mpyit.com', desc: '精品软件分享', ico: 'mpy.png' },
      { name: '阿里图标库', url: 'https://www.iconfont.cn', desc: '海量矢量图标免费下载', ico: 'baotu.png' },
      { name: '包图网', url: 'https://ibaotu.com', desc: '免费设计素材下载', ico: 'baotu.png' },
      { name: '千图网', url: 'https://www.58pic.com', desc: '免费图片素材下载', ico: 'qiantu.png' },
      { name: 'FreeMP3', url: 'https://freemp3.cn', desc: '免费音乐在线下载', ico: 'wangyiyun.png' },
      { name: 'VIP视频解析', url: 'https://vip.jbsou.cn', desc: '全网VIP视频在线解析', ico: 'vip.png' },
      { name: '时光相册', url: 'https://www.faceu.com', desc: 'AI照片特效处理', ico: 'xiangce.png' },
      { name: '哔哩哔哩', url: 'https://www.bilibili.com', desc: '国内知名视频弹幕网站', ico: 'bilibili.png' }
    ]
  },
  {
    id: 'video-online', name: '影视资源 · 在线', icon: 'film',
    sites: [
      { name: '555电影', url: 'https://www.555dy.fun', desc: '免费在线观影', ico: '555dianying.png' },
      { name: '电影先生', url: 'https://www.dianyingim.com', desc: '高清电影在线观看', ico: 'dianyingxiansheng.png' },
      { name: '片库', url: 'https://www.pianku.la', desc: '最新电影电视剧', ico: 'pianku.png' },
      { name: '片吧影院', url: 'http://www.pianba.net', desc: '免费在线看电影', ico: 'pianba.png' },
      { name: '剧迷', url: 'https://gimytv.com', desc: '大陆台湾日韩剧追剧', ico: '52.png' },
      { name: '白嫖者联盟', url: 'https://www.qlxpz.com', desc: '免费影视资源', ico: 'no.png' }
    ]
  },
  {
    id: 'video-download', name: '影视资源 · 下载', icon: 'download',
    sites: [
      { name: '影音屋', url: 'https://www.yinyingwu.com', desc: '高清影视资源下载', ico: 'no.png' },
      { name: 'BD影视', url: 'https://www.bd2020.com', desc: '蓝光高清电影下载', ico: 'no.png' },
      { name: 'MP4电影', url: 'https://www.mp4pa.com', desc: 'MP4格式电影下载', ico: 'no.png' },
      { name: '哔嘀影视', url: 'https://www.bdys.me', desc: '最新影视资源下载', ico: 'no.png' },
      { name: '迅雷电影天堂', url: 'https://www.xunleidianying.com', desc: '迅雷资源下载', ico: 'no.png' },
      { name: '悠悠MP4', url: 'https://www.uump4.net', desc: 'MP4资源下载', ico: 'no.png' }
    ]
  },
  {
    id: 'video-anime', name: '影视资源 · 动漫', icon: 'sparkles',
    sites: [
      { name: 'AGE动漫', url: 'https://www.agemys.org', desc: '在线动漫观看', ico: 'no.png' },
      { name: 'bimi动漫', url: 'https://www.bimiacg.com', desc: '番剧动漫在线观看', ico: 'no.png' },
      { name: '克拉TV', url: 'https://www.kelatv.com', desc: '动漫追番神器', ico: 'no.png' },
      { name: '不可视境界线', url: 'https://www.78dm.net', desc: '动漫资源分享', ico: 'no.png' },
      { name: 'OmoFun', url: 'https://www.omofun.com', desc: '二次元动漫追番', ico: 'no.png' },
      { name: '去看吧', url: 'https://www.kanba.tv', desc: '动漫在线观看', ico: 'no.png' },
      { name: '樱花动漫', url: 'https://www.yhdmp.com', desc: '樱花动漫追番', ico: 'no.png' },
      { name: '卡通站', url: 'https://www.katongzhan.com', desc: '卡通动漫资源', ico: 'no.png' },
      { name: '趣动漫', url: 'https://www.qudongman.com', desc: '趣味动漫推荐', ico: 'no.png' },
      { name: '蜜柑计划', url: 'https://mikanani.me', desc: '新番动漫追番', ico: 'no.png' },
      { name: 'KOTOMI', url: 'https://www.kotomi.top', desc: '动漫资源聚合', ico: 'no.png' },
      { name: '动漫花园', url: 'https://share.dmhy.org', desc: '动漫BT下载', ico: 'no.png' }
    ]
  },
  {
    id: 'video-western', name: '影视资源 · 美剧', icon: 'tv',
    sites: [
      { name: '人人影视', url: 'https://www.yyets.com', desc: '美剧字幕组', ico: 'no.png' },
      { name: 'AG美剧', url: 'https://www.agmeiju.com', desc: '美剧在线观看', ico: 'no.png' },
      { name: 'NO视频', url: 'http://www.novipnoad.com', desc: '无广告影视', ico: 'no.png' },
      { name: '爱美剧', url: 'https://www.imeiju.net', desc: '爱美剧在线看', ico: 'no.png' },
      { name: '美剧天堂', url: 'https://www.meijutt.tv', desc: '美剧下载观看', ico: 'no.png' },
      { name: '在线之家', url: 'https://www.zxzj.pro', desc: '在线之家观影', ico: 'no.png' }
    ]
  },
  {
    id: 'software-blogs', name: '软件工具 · 软件博客', icon: 'code',
    sites: [
      { name: '果核剥壳', url: 'https://www.ghxi.com', desc: '精品软件分享', ico: 'no.png' },
      { name: '小众软件', url: 'https://www.appinn.com', desc: '有趣好用的软件', ico: 'no.png' },
      { name: '异次元软件', url: 'https://www.iplaysoft.com', desc: '软件推荐与评测', ico: 'no.png' },
      { name: '423down', url: 'https://www.423down.com', desc: '去广告绿色软件', ico: '423.png' },
      { name: '芊芊精典', url: 'https://www.52qfjd.com', desc: '精品软件资源', ico: 'no.png' },
      { name: '易破解', url: 'https://www.ypojie.com', desc: '软件破解资源', ico: 'no.png' }
    ]
  },
  {
    id: 'software-tools', name: '软件工具 · 在线工具', icon: 'wrench',
    sites: [
      { name: '草料二维码', url: 'https://cli.im', desc: '在线二维码生成器', ico: 'no.png' },
      { name: 'Bigjpg', url: 'https://bigjpg.com', desc: 'AI图片无损放大', ico: 'no.png' },
      { name: '白描', url: 'https://web.baimiaoapp.com', desc: 'OCR文字识别', ico: 'no.png' },
      { name: '短视频解析', url: 'https://www.dspjx.com', desc: '全网短视频下载', ico: 'dspjx.png' },
      { name: '在线PS图片', url: 'https://ps.fotor.com', desc: '在线图片编辑', ico: 'ps.png' },
      { name: 'PhotoKit', url: 'https://photokit.com', desc: '在线智能修图', ico: 'no.png' },
      { name: '在线音频编辑', url: 'https://www.audioalter.com', desc: '音频处理工具', ico: 'no.png' },
      { name: '395公章', url: 'https://www.gongzhang395.com', desc: '在线公章制作', ico: 'gongzhang.png' },
      { name: '易词云', url: 'https://www.yciyun.com', desc: '词云在线生成', ico: 'ciyun.png' },
      { name: '在线屏幕录制', url: 'https://www.screenrecorder.com', desc: '屏幕录制工具', ico: 'pingmuluzhi.png' },
      { name: '在线图片修复', url: 'https://www.pixfix.com', desc: 'AI图片修复', ico: 'pixfix.png' },
      { name: '太美工具', url: 'https://tools.taimei.com', desc: '在线图片处理', ico: 'taimei.png' },
      { name: 'iLovePDF', url: 'https://www.ilovepdf.com/zh-cn', desc: 'PDF在线处理', ico: 'ipdf.png' },
      { name: 'ALL TO ALL', url: 'https://www.alltoall.net', desc: '在线格式转换', ico: 'alltoall.png' },
      { name: '67工具箱', url: 'https://www.67tool.com', desc: '实用在线工具集', ico: '67tool.png' },
      { name: 'YEELOGO', url: 'https://yeelogo.com', desc: '在线Logo制作', ico: 'YEELOGO.png' },
      { name: 'Moises.ai', url: 'https://moises.ai', desc: 'AI音乐分离', ico: 'moises.png' }
    ]
  },
  {
    id: 'community-news', name: '社区资讯 · 资讯', icon: 'newspaper',
    sites: [
      { name: 'IT之家', url: 'https://www.ithome.com', desc: '科技资讯门户', ico: 'ITzj.png' },
      { name: '微博热榜', url: 'https://weibo.com/hot', desc: '微博热搜榜', ico: 'weibo.png' },
      { name: '今日头条', url: 'https://www.toutiao.com', desc: '个性化资讯推荐', ico: 'toutiao.png' },
      { name: '36kr', url: 'https://36kr.com', desc: '创业科技媒体', ico: '36kr.png' },
      { name: '少数派', url: 'https://sspai.com', desc: '数字生活指南', ico: 'shaoshu.png' },
      { name: '中关村', url: 'https://www.zol.com.cn', desc: '科技产品资讯', ico: 'zgc.png' },
      { name: '知微事见', url: 'https://ef.zhiweidata.com', desc: '事件影响力分析', ico: 'zhiweishijian.png' },
      { name: '知微舆论场', url: 'https://ef.zhiweidata.com/yuqing', desc: '舆论数据分析', ico: 'zhiweiyulun.png' },
      { name: '大数据', url: 'https://www.cbndata.com', desc: '大数据行业资讯', ico: 'dashuju.png' },
      { name: '今日热榜', url: 'https://tophub.today', desc: '全网热榜聚合', ico: 'jrrb.png' }
    ]
  },
  {
    id: 'community-forum', name: '社区资讯 · 社区', icon: 'users',
    sites: [
      { name: '百度贴吧', url: 'https://tieba.baidu.com', desc: '中文最大社区论坛', ico: 'teiba.png' },
      { name: '知乎', url: 'https://www.zhihu.com', desc: '问答知识社区', ico: 'zhihu.png' }
    ]
  }
];

// ---- Search Engine Data ----
const searchEngines = {
  '常用': [
    { name: '百度', url: 'https://www.baidu.com/s?wd=', ph: '百度一下' },
    { name: '谷歌', url: 'https://www.google.com/search?q=', ph: 'Google 搜索' },
    { name: '软件', url: 'https://www.423down.com/?s=', ph: '搜索软件' },
    { name: '淘宝', url: 'https://s.taobao.com/search?q=', ph: '搜淘宝' },
    { name: '影视', url: 'https://www.cupfox.com/search?key=', ph: '搜影视' }
  ],
  '搜索': [
    { name: '百度', url: 'https://www.baidu.com/s?wd=', ph: '百度一下' },
    { name: '谷歌', url: 'https://www.google.com/search?q=', ph: 'Google 搜索' },
    { name: '360', url: 'https://www.so.com/s?q=', ph: '360 搜索' },
    { name: '搜狗', url: 'https://www.sogou.com/web?query=', ph: '搜狗搜索' },
    { name: '必应', url: 'https://cn.bing.com/search?q=', ph: 'Bing 搜索' },
    { name: '神马', url: 'https://yz.m.sm.cn/s?q=', ph: '神马搜索' }
  ],
  '工具': [
    { name: '权重查询', url: 'https://rank.chinaz.com/all/', ph: '输入域名' },
    { name: '友链检测', url: 'https://link.chinaz.com/', ph: '输入域名' },
    { name: '备案查询', url: 'https://beian.chinaz.com/', ph: '输入域名' },
    { name: 'PING检测', url: 'https://ping.chinaz.com/', ph: '输入域名或IP' },
    { name: '死链检测', url: 'https://tool.chinaz.com/deadlinks/', ph: '输入网址' },
    { name: '关键词挖掘', url: 'https://keyword.chinaz.com/', ph: '输入关键词' }
  ],
  '社区': [
    { name: '知乎', url: 'https://www.zhihu.com/search?q=', ph: '搜知乎' },
    { name: '微信', url: 'https://weixin.sogou.com/weixin?type=2&query=', ph: '搜微信文章' },
    { name: '微博', url: 'https://s.weibo.com/weibo?q=', ph: '搜微博' },
    { name: '豆瓣', url: 'https://search.douban.com/all/subject_search?search_text=', ph: '搜豆瓣' },
    { name: '搜外问答', url: 'https://ask.seowhy.com/search/?q=', ph: '搜SEO问答' }
  ],
  '生活': [
    { name: '淘宝', url: 'https://s.taobao.com/search?q=', ph: '搜淘宝' },
    { name: '京东', url: 'https://search.jd.com/Search?keyword=', ph: '搜京东' },
    { name: '下厨房', url: 'https://www.xiachufang.com/search/?keyword=', ph: '搜菜谱' },
    { name: '香哈菜谱', url: 'https://www.xiangha.cn/search/?s=', ph: '搜菜谱' },
    { name: '12306', url: 'https://www.12306.cn/index/', ph: '查火车票' },
    { name: '快递100', url: 'https://www.kuaidi100.com/', ph: '查快递单号' },
    { name: '去哪儿', url: 'https://www.qunar.com/', ph: '搜旅行' }
  ],
  '求职': [
    { name: '智联招聘', url: 'https://sou.zhaopin.com/?kw=', ph: '搜职位' },
    { name: '前程无忧', url: 'https://search.51job.com/', ph: '搜职位' },
    { name: '拉钩网', url: 'https://www.lagou.com/wn/zhaopin?kd=', ph: '搜互联网职位' },
    { name: '猎聘网', url: 'https://www.liepin.com/zhaopin/?key=', ph: '搜高端职位' }
  ]
};

// ---- SVG Icons ----
const icons = {
  star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  film: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/><line x1="17" y1="17" x2="22" y2="17"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  sparkles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z"/></svg>',
  tv: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>',
  code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
  wrench: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
  newspaper: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><line x1="10" y1="6" x2="18" y2="6"/><line x1="10" y1="10" x2="18" y2="10"/><line x1="10" y1="14" x2="14" y2="14"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  arrowUp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>',
  arrowRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  github: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
  dog: '<svg viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="45" fill="rgba(127,90,240,0.15)" stroke="rgba(127,90,240,0.6)" stroke-width="2"/><ellipse cx="35" cy="42" rx="6" ry="7" fill="rgba(255,255,255,0.9)"/><ellipse cx="65" cy="42" rx="6" ry="7" fill="rgba(255,255,255,0.9)"/><circle cx="36" cy="43" r="3" fill="#1a1a2e"/><circle cx="66" cy="43" r="3" fill="#1a1a2e"/><ellipse cx="50" cy="58" rx="10" ry="7" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/><ellipse cx="50" cy="56" rx="4" ry="3" fill="rgba(255,255,255,0.8)"/><path d="M20 30 Q15 15 25 20" stroke="rgba(255,255,255,0.5)" stroke-width="2" fill="none"/><path d="M80 30 Q85 15 75 20" stroke="rgba(255,255,255,0.5)" stroke-width="2" fill="none"/></svg>'
};

// ---- State ----
let currentGroup = '常用';
let currentEngine = searchEngines['常用'][0];
let heartAnim = null;

// ---- Initialize ----
document.addEventListener('DOMContentLoaded', () => {
  renderCategories();
  initSearch();
  initHitokoto();
  initHeartAnimation();
  initScrollEffects();
  initMobileNav();
  initLoader();
});

// ---- Render Categories & Cards ----
function renderCategories() {
  const container = document.getElementById('categories-container');
  if (!container) return;

  const filterBar = document.getElementById('category-filter');

  categories.forEach((cat, i) => {
    // Render filter pill
    if (filterBar) {
      const pill = document.createElement('button');
      pill.className = 'cat-pill' + (i === 0 ? ' active' : '');
      pill.textContent = cat.name;
      pill.dataset.target = cat.id;
      pill.addEventListener('click', () => scrollToCategory(cat.id));
      filterBar.appendChild(pill);
    }

    // Render section
    const section = document.createElement('section');
    section.className = 'category-section reveal';
    section.id = cat.id;

    section.innerHTML = `
      <div class="cat-header">
        ${icons[cat.icon] || icons.star}
        <span class="cat-title">${cat.name}</span>
        <span class="cat-count">${cat.sites.length}</span>
      </div>
      <div class="site-grid">
        ${cat.sites.map(site => `
          <a href="${site.url}" target="_blank" rel="noopener" class="site-card" data-name="${site.name}">
            <div class="card-favicon">
              <img src="ico/${site.ico}" alt="${site.name}" loading="lazy"
                   onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 36 36%22><rect fill=%22%237f5af0%22 width=%2236%22 height=%2236%22 rx=%2218%22/><text x=%2218%22 y=%2224%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2216%22>${site.name[0]}</text></svg>'">
            </div>
            <div class="card-info">
              <div class="card-name">${site.name}</div>
              <div class="card-desc">${site.desc}</div>
            </div>
            <div class="card-arrow">${icons.arrowRight}</div>
          </a>
        `).join('')}
      </div>
    `;

    container.appendChild(section);
  });

  // Setup IntersectionObserver for active category tracking
  initCategoryObserver();
}

// ---- Category Scroll & Observe ----
function scrollToCategory(id) {
  const section = document.getElementById(id);
  if (!section) return;
  const navH = document.querySelector('.navbar').offsetHeight;
  const barH = document.querySelector('.category-bar') ? document.querySelector('.category-bar').offsetHeight : 0;
  const top = section.getBoundingClientRect().top + window.scrollY - navH - barH - 16;
  window.scrollTo({ top, behavior: 'smooth' });
}

function initCategoryObserver() {
  const pills = document.querySelectorAll('.cat-pill');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        pills.forEach(p => p.classList.toggle('active', p.dataset.target === id));
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px' });

  document.querySelectorAll('.category-section').forEach(s => observer.observe(s));
}

// ---- Search ----
function initSearch() {
  const groupContainer = document.getElementById('search-groups');
  const engineContainer = document.getElementById('search-engines');
  const searchInput = document.getElementById('search-input');
  const searchForm = document.getElementById('search-form');

  if (!groupContainer || !engineContainer) return;

  // Render group pills
  Object.keys(searchEngines).forEach((group, i) => {
    const btn = document.createElement('button');
    btn.className = 'search-group-btn' + (i === 0 ? ' active' : '');
    btn.textContent = group;
    btn.addEventListener('click', () => switchGroup(group));
    groupContainer.appendChild(btn);
  });

  // Render initial engines
  renderEngines();

  // Group switch
  function switchGroup(group) {
    currentGroup = group;
    currentEngine = searchEngines[group][0];
    groupContainer.querySelectorAll('.search-group-btn').forEach(b => {
      b.classList.toggle('active', b.textContent === group);
    });
    renderEngines();
    updatePlaceholder();
  }

  function renderEngines() {
    engineContainer.innerHTML = '';
    searchEngines[currentGroup].forEach((eng, i) => {
      const btn = document.createElement('button');
      btn.className = 'engine-btn' + (i === 0 ? ' active' : '');
      btn.textContent = eng.name;
      btn.addEventListener('click', () => {
        currentEngine = eng;
        engineContainer.querySelectorAll('.engine-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updatePlaceholder();
        searchInput.focus();
      });
      engineContainer.appendChild(btn);
    });
  }

  function updatePlaceholder() {
    searchInput.placeholder = currentEngine.ph;
  }

  // Submit
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = searchInput.value.trim();
      if (q) {
        window.open(currentEngine.url + encodeURIComponent(q), '_blank');
      }
    });
  }

  updatePlaceholder();
}

// ---- Hitokoto ----
function initHitokoto() {
  const el = document.getElementById('hitokoto-text');
  const fromEl = document.getElementById('hitokoto-from');
  if (!el) return;

  fetch('https://v1.hitokoto.cn')
    .then(r => r.json())
    .then(data => {
      el.textContent = data.hitokoto;
      if (fromEl) fromEl.textContent = data.from ? '— ' + data.from : '';
    })
    .catch(() => {
      el.textContent = '精选每一个链接，为你导航';
    });
}

// ---- Heart Animation ----
function initHeartAnimation() {
  const canvas = document.createElement('canvas');
  canvas.id = 'heart-canvas';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const hearts = [];
  const colors = ['#ff6b6b', '#f093fb', '#7f5af0', '#2cb67d', '#ffd93d', '#e16162'];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  document.addEventListener('click', (e) => {
    if (e.target.closest('.site-card')) {
      for (let i = 0; i < 3; i++) {
        hearts.push({
          x: e.clientX + (Math.random() - 0.5) * 20,
          y: e.clientY,
          size: 8 + Math.random() * 8,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          scale: 0.3 + Math.random() * 0.3,
          vy: -(1.5 + Math.random() * 2),
          vx: (Math.random() - 0.5) * 3,
          rotation: Math.random() * 0.6 - 0.3,
          rotSpeed: (Math.random() - 0.5) * 0.06
        });
      }
    }
  });

  function drawHeart(x, y, size, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.beginPath();
    const s = size;
    ctx.moveTo(0, -s * 0.25);
    ctx.bezierCurveTo(s * 0.5, -s, s, -s * 0.25, 0, s * 0.5);
    ctx.moveTo(0, -s * 0.25);
    ctx.bezierCurveTo(-s * 0.5, -s, -s, -s * 0.25, 0, s * 0.5);
    ctx.fill();
    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = hearts.length - 1; i >= 0; i--) {
      const h = hearts[i];
      h.y += h.vy;
      h.x += h.vx;
      h.alpha -= 0.012;
      h.scale += 0.006;
      h.rotation += h.rotSpeed;

      if (h.alpha <= 0) { hearts.splice(i, 1); continue; }

      ctx.globalAlpha = h.alpha;
      ctx.fillStyle = h.color;
      drawHeart(h.x, h.y, h.size * h.scale, h.rotation);
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(animate);
  }
  animate();
}

// ---- Scroll Effects ----
function initScrollEffects() {
  // Back to top
  const btn = document.getElementById('back-top');
  if (btn) {
    window.addEventListener('scroll', () => {
      btn.classList.toggle('show', window.scrollY > 300);
    }, { passive: true });
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Reveal on scroll
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

// ---- Mobile Nav ----
function initMobileNav() {
  const toggle = document.getElementById('mobile-toggle');
  const nav = document.getElementById('mobile-nav');
  const close = document.getElementById('mobile-close');

  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => nav.classList.add('open'));
  if (close) close.addEventListener('click', () => nav.classList.remove('open'));
  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => nav.classList.remove('open'));
  });
}

// ---- Loading Screen ----
function initLoader() {
  const loader = document.getElementById('loader');
  if (loader) {
    window.addEventListener('load', () => {
      setTimeout(() => loader.classList.add('hide'), 300);
    });
  }
}
