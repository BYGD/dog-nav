-- DogNav Seed Data for Cloudflare D1
-- Generated from seed.js

-- ═══════════════════════════════════════════
-- 1. Default Admin User
-- ═══════════════════════════════════════════
INSERT INTO users (username, password, role) VALUES ('admin', 'admin123', 'admin');

-- ═══════════════════════════════════════════
-- 2. Default Categories (10)
-- ═══════════════════════════════════════════
INSERT INTO categories (id, name, icon, sort_order, is_active) VALUES
('recommend', '常用推荐', '⭐', 1, 1),
('video', '影视资源', '🎬', 2, 1),
('anime', '动漫', '🌸', 3, 1),
('software', '软件博客', '💿', 4, 1),
('tools', '在线工具', '🔧', 5, 1),
('news', '资讯', '📰', 6, 1),
('community', '社区', '💬', 7, 1),
('ai', 'AI 工具', '🤖', 8, 1),
('dev', '开发编程', '💻', 9, 1),
('design', '设计素材', '🎨', 10, 1);

-- ═══════════════════════════════════════════
-- 3. Default Settings (11 key-value pairs)
-- ═══════════════════════════════════════════
INSERT INTO settings (key, value) VALUES
('site_name', 'DogNav'),
('site_description', '发现互联网的无限精彩'),
('weather_api_key', 'd7ebb8f4da72492f9ac290d366e8dab4'),
('weather_enabled', 'true'),
('footer_text', 'DogNav © 2026 — Design by CangDog'),
('footer_blog_url', 'https://www.cangdog.com'),
('footer_github_url', 'https://github.com/BYGD'),
('theme_primary_color', '#667eea'),
('theme_secondary_color', '#764ba2'),
('submission_enabled', 'true'),
('auto_nofollow', 'false');

-- ═══════════════════════════════════════════
-- 4. Default Pages (3)
-- ═══════════════════════════════════════════
INSERT INTO pages (id, title, content) VALUES
('about', '关于 DogNav', 'DogNav 是一个精选网址导航，致力于帮助用户发现和探索互联网上优质的网站和工具。我们精心挑选和分类每一个站点，让您能够快速找到所需的资源。'),
('contribute', '提交站点', '如果你发现了好网站，欢迎提交给我们。我们会审核后将其添加到导航中。请确保提交的网站内容健康、积极向上。'),
('links', '友情链接', '以下是与本站有友好往来的网站，欢迎交换友情链接。如果您也想加入友情链接，请先添加本站链接后通过邮件联系我们。');

-- ═══════════════════════════════════════════
-- 5. Sites (151 total)
-- ═══════════════════════════════════════════

-- ═══ 常用推荐 (18) ═══
INSERT INTO sites (name, url, description, icon, category, sort_order, status) VALUES
('GitHub', 'https://github.com', '全球最大的代码托管平台', '🐙', 'recommend', 0, 'active'),
('Gitee', 'https://gitee.com', '国内最大的代码托管平台', '🍊', 'recommend', 0, 'active'),
('哔哩哔哩', 'https://www.bilibili.com', '国内知名视频弹幕网站', '📺', 'recommend', 0, 'active'),
('知乎', 'https://www.zhihu.com', '有问题，就会有答案', '💡', 'recommend', 0, 'active'),
('微博', 'https://weibo.com', '随时随地发现新鲜事', '🔴', 'recommend', 0, 'active'),
('吾爱破解', 'https://www.52pojie.cn', '软件安全与逆向分析论坛', '🔓', 'recommend', 0, 'active'),
('精易论坛', 'https://bbs.125.la', '编程学习交流论坛', '💻', 'recommend', 0, 'active'),
('殁漂遥', 'https://www.mpyit.com', '精品软件分享', '📦', 'recommend', 0, 'active'),
('阿里图标库', 'https://www.iconfont.cn', '海量矢量图标免费下载', '🎨', 'recommend', 0, 'active'),
('Twitter / X', 'https://x.com', '全球实时社交媒体平台', '🐦', 'recommend', 0, 'active'),
('YouTube', 'https://youtube.com', '全球最大的视频分享平台', '▶️', 'recommend', 0, 'active'),
('百度网盘', 'https://pan.baidu.com', '个人云存储', '☁️', 'recommend', 0, 'active'),
('有道翻译', 'https://fanyi.youdao.com', '在线翻译工具', '🔤', 'recommend', 0, 'active'),
('阿里云', 'https://www.aliyun.com', '云计算服务平台', '🟠', 'recommend', 0, 'active'),
('腾讯云', 'https://cloud.tencent.com', '云计算服务', '🔷', 'recommend', 0, 'active'),
('石墨文档', 'https://shimo.im', '在线协作文档', '📝', 'recommend', 0, 'active'),
('高德地图', 'https://www.amap.com', '地图与导航', '🗺️', 'recommend', 0, 'active'),
('淘宝', 'https://www.taobao.com', '综合网购平台', '🛒', 'recommend', 0, 'active');

-- ═══ 影视资源 (14) ═══
INSERT INTO sites (name, url, description, icon, category, sort_order, status) VALUES
('555电影', 'https://www.555dy.fun', '免费在线观影', '🎬', 'video', 0, 'active'),
('爱奇艺', 'https://iqiyi.com', '中国领先的在线视频平台', '🟢', 'video', 0, 'active'),
('优酷', 'https://youku.com', '海量正版高清视频', '🔵', 'video', 0, 'active'),
('腾讯视频', 'https://v.qq.com', '综合视频平台', '🐧', 'video', 0, 'active'),
('Netflix', 'https://netflix.com', '全球流媒体巨头', '🔴', 'video', 0, 'active'),
('哔嘀影视', 'https://www.bdys.me', '最新影视资源下载', '⚡', 'video', 0, 'active'),
('人人影视', 'https://www.yyets.com', '美剧字幕组', '🇺🇸', 'video', 0, 'active'),
('AG美剧', 'https://www.agmeiju.com', '美剧在线观看', '📺', 'video', 0, 'active'),
('在线之家', 'https://www.zxzj.pro', '在线观影', '🏡', 'video', 0, 'active'),
('芒果TV', 'https://www.mgtv.com', '湖南卫视官方视频平台', '🥭', 'video', 0, 'active'),
('91美剧', 'https://www.91meiju.com', '美剧日剧韩剧', '🎭', 'video', 0, 'active'),
('搜狐视频', 'https://tv.sohu.com', '正版高清视频平台', '🦊', 'video', 0, 'active'),
('1905电影网', 'https://www.1905.com', '电影频道官方平台', '🎞️', 'video', 0, 'active'),
('PP视频', 'https://www.pptv.com', '网络视频服务', '📺', 'video', 0, 'active');

-- ═══ 动漫 (8) ═══
INSERT INTO sites (name, url, description, icon, category, sort_order, status) VALUES
('克拉TV', 'https://www.kelatv.com', '动漫追番神器', '📡', 'anime', 0, 'active'),
('OmoFun', 'https://www.omofun.com', '二次元动漫追番', '🎀', 'anime', 0, 'active'),
('动漫花园', 'https://share.dmhy.org', '动漫BT下载', '🌺', 'anime', 0, 'active'),
('不可视境界线', 'https://www.78dm.net', '动漫模型资源分享', '🔮', 'anime', 0, 'active'),
('Nyaa', 'https://nyaa.si', '动漫种子资源站', '🌸', 'anime', 0, 'active'),
('ACGrip', 'https://acg.rip', '动漫资源分享', '🎌', 'anime', 0, 'active'),
('腾讯动漫', 'https://ac.qq.com', '正版动漫平台', '🐧', 'anime', 0, 'active'),
('bilibili漫画', 'https://manga.bilibili.com', '正版漫画阅读', '📖', 'anime', 0, 'active');

-- ═══ 软件博客 (8) ═══
INSERT INTO sites (name, url, description, icon, category, sort_order, status) VALUES
('果核剥壳', 'https://www.ghxi.com', '精品软件分享', '🍑', 'software', 0, 'active'),
('小众软件', 'https://www.appinn.com', '有趣好用的软件', '🐜', 'software', 0, 'active'),
('异次元软件', 'https://www.iplaysoft.com', '软件推荐与评测', '🌀', 'software', 0, 'active'),
('易破解', 'https://www.ypojie.com', '软件破解资源', '🔑', 'software', 0, 'active'),
('远景论坛', 'https://bbs.pcbeta.com', '微软技术社区', '🪟', 'software', 0, 'active'),
('腾讯软件中心', 'https://pc.qq.com', '官方软件下载', '🐧', 'software', 0, 'active'),
('NICE', 'https://www.wepe.com.cn', '微PE工具箱', '🧰', 'software', 0, 'active'),
('软件管家', 'https://www.qq.com/software/', '腾讯软件管家', '🐧', 'software', 0, 'active');

-- ═══ 在线工具 (23) ═══
INSERT INTO sites (name, url, description, icon, category, sort_order, status) VALUES
('草料二维码', 'https://cli.im', '在线二维码生成器', '📱', 'tools', 0, 'active'),
('Bigjpg', 'https://bigjpg.com', 'AI图片无损放大', '🔍', 'tools', 0, 'active'),
('白描', 'https://web.baimiaoapp.com', 'OCR文字识别', '📝', 'tools', 0, 'active'),
('iLovePDF', 'https://www.ilovepdf.com/zh-cn', 'PDF在线处理', '📄', 'tools', 0, 'active'),
('ALL TO ALL', 'https://www.alltoall.net', '在线格式转换', '🔄', 'tools', 0, 'active'),
('67工具箱', 'https://www.67tool.com', '实用在线工具集', '🧰', 'tools', 0, 'active'),
('TinyPNG', 'https://tinypng.com', '智能图片压缩工具', '🐼', 'tools', 0, 'active'),
('ProcessOn', 'https://processon.com', '在线流程图思维导图', '🗺️', 'tools', 0, 'active'),
('Notion', 'https://notion.so', '一体化工作空间', '📋', 'tools', 0, 'active'),
('Google翻译', 'https://translate.google.com', '支持100+种语言互译', '🌐', 'tools', 0, 'active'),
('短视频解析', 'https://www.dspjx.com', '全网短视频下载', '🎥', 'tools', 0, 'active'),
('PhotoKit', 'https://photokit.com', '在线智能修图', '🖼️', 'tools', 0, 'active'),
('Moises.ai', 'https://moises.ai', 'AI音乐分离', '🎶', 'tools', 0, 'active'),
('易词云', 'https://www.yciyun.com', '词云在线生成', '☁️', 'tools', 0, 'active'),
('Remove.bg', 'https://www.remove.bg', 'AI一键去除图片背景', '✂️', 'tools', 0, 'active'),
('菜鸟工具', 'https://c.runoob.com', '在线编程与工具集', '🐣', 'tools', 0, 'active'),
('JSON格式化', 'https://www.json.cn', 'JSON在线解析美化', '{ }', 'tools', 0, 'active'),
('快递100', 'https://www.kuaidi100.com', '快递物流查询', '📮', 'tools', 0, 'active'),
('在线屏幕录制', 'https://www.screenrecorder.com', '免费录屏工具', '🖥️', 'tools', 0, 'active'),
('IP查询', 'https://www.ip138.com', 'IP地址与归属查询', '🌍', 'tools', 0, 'active'),
('语雀', 'https://www.yuque.com', '在线知识协作平台', '🐦', 'tools', 0, 'active'),
('腾讯文档', 'https://docs.qq.com', '在线文档协作', '📄', 'tools', 0, 'active'),
('思维导图', 'https://www.zxmind.cn', '在线思维导图工具', '🧠', 'tools', 0, 'active');

-- ═══ 资讯 (19) ═══
INSERT INTO sites (name, url, description, icon, category, sort_order, status) VALUES
('IT之家', 'https://www.ithome.com', '科技资讯门户', '📰', 'news', 0, 'active'),
('今日头条', 'https://www.toutiao.com', '个性化资讯推荐', '📱', 'news', 0, 'active'),
('36kr', 'https://36kr.com', '创业科技媒体', '📊', 'news', 0, 'active'),
('少数派', 'https://sspai.com', '数字生活指南', '📲', 'news', 0, 'active'),
('今日热榜', 'https://tophub.today', '全网热榜聚合', '🔥', 'news', 0, 'active'),
('微博热榜', 'https://weibo.com/hot', '微博热搜榜', '🔴', 'news', 0, 'active'),
('腾讯新闻', 'https://news.qq.com', '综合新闻资讯', '🐧', 'news', 0, 'active'),
('网易新闻', 'https://news.163.com', '有态度的新闻', '🔴', 'news', 0, 'active'),
('新华网', 'https://www.xinhuanet.com', '国家通讯社新闻', '🇨🇳', 'news', 0, 'active'),
('人民网', 'https://www.people.com.cn', '人民日报官网', '🇨🇳', 'news', 0, 'active'),
('澎湃新闻', 'https://www.thepaper.cn', '原创新闻资讯', '🌊', 'news', 0, 'active'),
('界面新闻', 'https://www.jiemian.com', '财经商业新闻', '📊', 'news', 0, 'active'),
('虎嗅', 'https://www.huxiu.com', '深度商业科技资讯', '🐯', 'news', 0, 'active'),
('品玩', 'https://www.pingwest.com', '全球科技媒体', '🌐', 'news', 0, 'active'),
('快科技', 'https://www.mydrivers.com', '硬件科技资讯', '⚡', 'news', 0, 'active'),
('爱范儿', 'https://www.ifanr.com', '科技生活方式', '💜', 'news', 0, 'active'),
('中关村', 'https://www.zol.com.cn', '科技产品资讯', '💻', 'news', 0, 'active'),
('知微事见', 'https://ef.zhiweidata.com', '事件影响力分析', '📈', 'news', 0, 'active'),
('大数据', 'https://www.cbndata.com', '大数据行业资讯', '📉', 'news', 0, 'active');

-- ═══ 社区 (12) ═══
INSERT INTO sites (name, url, description, icon, category, sort_order, status) VALUES
('V2EX', 'https://v2ex.com', '创意工作者的社区', '💬', 'community', 0, 'active'),
('掘金', 'https://juejin.cn', '开发者技术社区', '💎', 'community', 0, 'active'),
('百度贴吧', 'https://tieba.baidu.com', '中文最大社区论坛', '🏷️', 'community', 0, 'active'),
('Reddit', 'https://reddit.com', 'The front page of the internet', '🔶', 'community', 0, 'active'),
('Hacker News', 'https://news.ycombinator.com', '硅谷科技圈必读', '🟧', 'community', 0, 'active'),
('豆瓣', 'https://www.douban.com', '书影音精神角落', '🟩', 'community', 0, 'active'),
('虎扑', 'https://www.hupu.com', '体育社区', '🏀', 'community', 0, 'active'),
('NGA', 'https://bbs.nga.cn', '精英玩家社区', '🎮', 'community', 0, 'active'),
('龙空', 'https://www.lkong.com', '网络文学论坛', '🐉', 'community', 0, 'active'),
('一亩三分地', 'https://www.1point3acres.com', '留学申请社区', '🌾', 'community', 0, 'active'),
('Discord', 'https://discord.com', '社群聊天平台', '🎧', 'community', 0, 'active'),
('Telegram', 'https://telegram.org', '安全即时通讯', '✈️', 'community', 0, 'active');

-- ═══ AI 工具 (16) ═══
INSERT INTO sites (name, url, description, icon, category, sort_order, status) VALUES
('ChatGPT', 'https://chatgpt.com', 'OpenAI 智能对话助手', '🤖', 'ai', 0, 'active'),
('Claude', 'https://claude.ai', 'Anthropic AI 助手', '🧠', 'ai', 0, 'active'),
('Midjourney', 'https://midjourney.com', 'AI 图像生成工具', '🎨', 'ai', 0, 'active'),
('Stable Diffusion', 'https://stability.ai', '开源 AI 图像模型', '🖼️', 'ai', 0, 'active'),
('Poe', 'https://poe.com', '多模型 AI 聚合平台', '🔮', 'ai', 0, 'active'),
('Hugging Face', 'https://huggingface.co', 'AI 模型社区', '🤗', 'ai', 0, 'active'),
('通义千问', 'https://tongyi.aliyun.com', '阿里云大模型', '🔵', 'ai', 0, 'active'),
('文心一言', 'https://yiyan.baidu.com', '百度大模型', '🟦', 'ai', 0, 'active'),
('Kimi', 'https://kimi.moonshot.cn', 'Moonshot AI 助手', '🌙', 'ai', 0, 'active'),
('Suno', 'https://suno.com', 'AI 音乐生成', '🎵', 'ai', 0, 'active'),
('讯飞星火', 'https://xinghuo.xfyun.cn', '科大讯飞大模型', '✨', 'ai', 0, 'active'),
('智谱清言', 'https://chatglm.cn', '清华系 AI 助手', '🎓', 'ai', 0, 'active'),
('通义万相', 'https://tongyi.aliyun.com/wanxiang', 'AI 图像生成', '🖌️', 'ai', 0, 'active'),
('即梦', 'https://jimeng.jianying.com', '字节 AI 图像创作', '💭', 'ai', 0, 'active'),
('Perplexity', 'https://www.perplexity.ai', 'AI 搜索引擎', '🔎', 'ai', 0, 'active'),
('Cursor', 'https://cursor.com', 'AI 代码编辑器', '⌨️', 'ai', 0, 'active');

-- ═══ 开发编程 (17) ═══
INSERT INTO sites (name, url, description, icon, category, sort_order, status) VALUES
('Stack Overflow', 'https://stackoverflow.com', '全球最大的开发者问答社区', '📚', 'dev', 0, 'active'),
('MDN Web Docs', 'https://developer.mozilla.org', 'Web 技术权威文档', '📖', 'dev', 0, 'active'),
('npm', 'https://npmjs.com', 'Node.js 包管理器', '📦', 'dev', 0, 'active'),
('CodePen', 'https://codepen.io', '前端代码在线编辑器', '✏️', 'dev', 0, 'active'),
('Can I Use', 'https://caniuse.com', '浏览器兼容性查询', '✅', 'dev', 0, 'active'),
('CSDN', 'https://www.csdn.net', '中文开发者社区', '🟥', 'dev', 0, 'active'),
('博客园', 'https://www.cnblogs.com', '开发者的网上家园', '🏡', 'dev', 0, 'active'),
('LeetCode', 'https://leetcode.cn', '算法刷题平台', '🧩', 'dev', 0, 'active'),
('Vercel', 'https://vercel.com', '前端部署平台', '▲', 'dev', 0, 'active'),
('Cloudflare', 'https://www.cloudflare.com', 'CDN与安全服务', '🛡️', 'dev', 0, 'active'),
('开源中国', 'https://www.oschina.net', '中文开源社区', '🐉', 'dev', 0, 'active'),
('SegmentFault', 'https://segmentfault.com', '中文技术问答社区', '💡', 'dev', 0, 'active'),
('51CTO', 'https://www.51cto.com', 'IT技术社区', '🖥️', 'dev', 0, 'active'),
('菜鸟教程', 'https://www.runoob.com', '编程入门学习', '🐣', 'dev', 0, 'active'),
('W3School', 'https://www.w3school.com.cn', 'Web技术教程', '📖', 'dev', 0, 'active'),
('GitHub Trending', 'https://github.com/trending', '热门开源项目', '🔥', 'dev', 0, 'active'),
('Docker Hub', 'https://hub.docker.com', '容器镜像仓库', '🐳', 'dev', 0, 'active');

-- ═══ 设计素材 (16) ═══
INSERT INTO sites (name, url, description, icon, category, sort_order, status) VALUES
('Dribbble', 'https://dribbble.com', '设计师作品展示平台', '🏀', 'design', 0, 'active'),
('Behance', 'https://www.behance.net', 'Adobe 创意作品平台', '🎭', 'design', 0, 'active'),
('Figma', 'https://figma.com', '协作式界面设计工具', '🖌️', 'design', 0, 'active'),
('Unsplash', 'https://unsplash.com', '免费高质量图片素材', '📷', 'design', 0, 'active'),
('Coolors', 'https://coolors.co', '超快配色方案生成器', '🎨', 'design', 0, 'active'),
('包图网', 'https://ibaotu.com', '免费设计素材下载', '📐', 'design', 0, 'active'),
('千图网', 'https://www.58pic.com', '免费图片素材下载', '🖼️', 'design', 0, 'active'),
('Pinterest', 'https://www.pinterest.com', '全球灵感收集平台', '📌', 'design', 0, 'active'),
('即时设计', 'https://js.design', '国产在线设计工具', '⚡', 'design', 0, 'active'),
('IconPark', 'https://iconpark.oceanengine.com', '字节图标库', '🔷', 'design', 0, 'active'),
('站酷', 'https://www.zcool.com.cn', '设计师社区平台', '🎯', 'design', 0, 'active'),
('花瓣网', 'https://huaban.com', '中文灵感收集平台', '🌺', 'design', 0, 'active'),
('优设', 'https://www.uisdc.com', '设计师学习平台', '📐', 'design', 0, 'active'),
('字由', 'https://www.hellofont.cn', '字体管理与下载', '🔤', 'design', 0, 'active'),
('摄图网', 'https://699pic.com', '正版图片素材', '📸', 'design', 0, 'active'),
('千库网', 'https://588ku.com', '免费PNG素材下载', '🖼️', 'design', 0, 'active');
