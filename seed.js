const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'dognav.db');

// All sites from index.html
const sites = [
    // ═══ 常用推荐 ═══
    { n: 'GitHub', u: 'https://github.com', d: '全球最大的代码托管平台', i: '🐙', c: 'recommend' },
    { n: 'Gitee', u: 'https://gitee.com', d: '国内最大的代码托管平台', i: '🍊', c: 'recommend' },
    { n: '哔哩哔哩', u: 'https://www.bilibili.com', d: '国内知名视频弹幕网站', i: '📺', c: 'recommend' },
    { n: '知乎', u: 'https://www.zhihu.com', d: '有问题，就会有答案', i: '💡', c: 'recommend' },
    { n: '微博', u: 'https://weibo.com', d: '随时随地发现新鲜事', i: '🔴', c: 'recommend' },
    { n: '吾爱破解', u: 'https://www.52pojie.cn', d: '软件安全与逆向分析论坛', i: '🔓', c: 'recommend' },
    { n: '精易论坛', u: 'https://bbs.125.la', d: '编程学习交流论坛', i: '💻', c: 'recommend' },
    { n: '殁漂遥', u: 'https://www.mpyit.com', d: '精品软件分享', i: '📦', c: 'recommend' },
    { n: '阿里图标库', u: 'https://www.iconfont.cn', d: '海量矢量图标免费下载', i: '🎨', c: 'recommend' },
    { n: 'Twitter / X', u: 'https://x.com', d: '全球实时社交媒体平台', i: '🐦', c: 'recommend' },
    { n: 'YouTube', u: 'https://youtube.com', d: '全球最大的视频分享平台', i: '▶️', c: 'recommend' },
    { n: '百度网盘', u: 'https://pan.baidu.com', d: '个人云存储', i: '☁️', c: 'recommend' },
    { n: '有道翻译', u: 'https://fanyi.youdao.com', d: '在线翻译工具', i: '🔤', c: 'recommend' },
    { n: '阿里云', u: 'https://www.aliyun.com', d: '云计算服务平台', i: '🟠', c: 'recommend' },
    { n: '腾讯云', u: 'https://cloud.tencent.com', d: '云计算服务', i: '🔷', c: 'recommend' },
    { n: '石墨文档', u: 'https://shimo.im', d: '在线协作文档', i: '📝', c: 'recommend' },
    { n: '高德地图', u: 'https://www.amap.com', d: '地图与导航', i: '🗺️', c: 'recommend' },
    { n: '淘宝', u: 'https://www.taobao.com', d: '综合网购平台', i: '🛒', c: 'recommend' },

    // ═══ 影视资源 ═══
    { n: '555电影', u: 'https://www.555dy.fun', d: '免费在线观影', i: '🎬', c: 'video' },
    { n: '爱奇艺', u: 'https://iqiyi.com', d: '中国领先的在线视频平台', i: '🟢', c: 'video' },
    { n: '优酷', u: 'https://youku.com', d: '海量正版高清视频', i: '🔵', c: 'video' },
    { n: '腾讯视频', u: 'https://v.qq.com', d: '综合视频平台', i: '🐧', c: 'video' },
    { n: 'Netflix', u: 'https://netflix.com', d: '全球流媒体巨头', i: '🔴', c: 'video' },
    { n: '哔嘀影视', u: 'https://www.bdys.me', d: '最新影视资源下载', i: '⚡', c: 'video' },
    { n: '人人影视', u: 'https://www.yyets.com', d: '美剧字幕组', i: '🇺🇸', c: 'video' },
    { n: 'AG美剧', u: 'https://www.agmeiju.com', d: '美剧在线观看', i: '📺', c: 'video' },
    { n: '在线之家', u: 'https://www.zxzj.pro', d: '在线观影', i: '🏡', c: 'video' },
    { n: '芒果TV', u: 'https://www.mgtv.com', d: '湖南卫视官方视频平台', i: '🥭', c: 'video' },
    { n: '91美剧', u: 'https://www.91meiju.com', d: '美剧日剧韩剧', i: '🎭', c: 'video' },
    { n: '搜狐视频', u: 'https://tv.sohu.com', d: '正版高清视频平台', i: '🦊', c: 'video' },
    { n: '1905电影网', u: 'https://www.1905.com', d: '电影频道官方平台', i: '🎞️', c: 'video' },
    { n: 'PP视频', u: 'https://www.pptv.com', d: '网络视频服务', i: '📺', c: 'video' },

    // ═══ 动漫 ═══
    { n: '克拉TV', u: 'https://www.kelatv.com', d: '动漫追番神器', i: '📡', c: 'anime' },
    { n: 'OmoFun', u: 'https://www.omofun.com', d: '二次元动漫追番', i: '🎀', c: 'anime' },
    { n: '动漫花园', u: 'https://share.dmhy.org', d: '动漫BT下载', i: '🌺', c: 'anime' },
    { n: '不可视境界线', u: 'https://www.78dm.net', d: '动漫模型资源分享', i: '🔮', c: 'anime' },
    { n: 'Nyaa', u: 'https://nyaa.si', d: '动漫种子资源站', i: '🌸', c: 'anime' },
    { n: 'ACGrip', u: 'https://acg.rip', d: '动漫资源分享', i: '🎌', c: 'anime' },
    { n: '腾讯动漫', u: 'https://ac.qq.com', d: '正版动漫平台', i: '🐧', c: 'anime' },
    { n: 'bilibili漫画', u: 'https://manga.bilibili.com', d: '正版漫画阅读', i: '📖', c: 'anime' },

    // ═══ 软件博客 ═══
    { n: '果核剥壳', u: 'https://www.ghxi.com', d: '精品软件分享', i: '🍑', c: 'software' },
    { n: '小众软件', u: 'https://www.appinn.com', d: '有趣好用的软件', i: '🐜', c: 'software' },
    { n: '异次元软件', u: 'https://www.iplaysoft.com', d: '软件推荐与评测', i: '🌀', c: 'software' },
    { n: '易破解', u: 'https://www.ypojie.com', d: '软件破解资源', i: '🔑', c: 'software' },
    { n: '远景论坛', u: 'https://bbs.pcbeta.com', d: '微软技术社区', i: '🪟', c: 'software' },
    { n: '腾讯软件中心', u: 'https://pc.qq.com', d: '官方软件下载', i: '🐧', c: 'software' },
    { n: 'NICE', u: 'https://www.wepe.com.cn', d: '微PE工具箱', i: '🧰', c: 'software' },
    { n: '软件管家', u: 'https://www.qq.com/software/', d: '腾讯软件管家', i: '🐧', c: 'software' },

    // ═══ 在线工具 ═══
    { n: '草料二维码', u: 'https://cli.im', d: '在线二维码生成器', i: '📱', c: 'tools' },
    { n: 'Bigjpg', u: 'https://bigjpg.com', d: 'AI图片无损放大', i: '🔍', c: 'tools' },
    { n: '白描', u: 'https://web.baimiaoapp.com', d: 'OCR文字识别', i: '📝', c: 'tools' },
    { n: 'iLovePDF', u: 'https://www.ilovepdf.com/zh-cn', d: 'PDF在线处理', i: '📄', c: 'tools' },
    { n: 'ALL TO ALL', u: 'https://www.alltoall.net', d: '在线格式转换', i: '🔄', c: 'tools' },
    { n: '67工具箱', u: 'https://www.67tool.com', d: '实用在线工具集', i: '🧰', c: 'tools' },
    { n: 'TinyPNG', u: 'https://tinypng.com', d: '智能图片压缩工具', i: '🐼', c: 'tools' },
    { n: 'ProcessOn', u: 'https://processon.com', d: '在线流程图思维导图', i: '🗺️', c: 'tools' },
    { n: 'Notion', u: 'https://notion.so', d: '一体化工作空间', i: '📋', c: 'tools' },
    { n: 'Google翻译', u: 'https://translate.google.com', d: '支持100+种语言互译', i: '🌐', c: 'tools' },
    { n: '短视频解析', u: 'https://www.dspjx.com', d: '全网短视频下载', i: '🎥', c: 'tools' },
    { n: 'PhotoKit', u: 'https://photokit.com', d: '在线智能修图', i: '🖼️', c: 'tools' },
    { n: 'Moises.ai', u: 'https://moises.ai', d: 'AI音乐分离', i: '🎶', c: 'tools' },
    { n: '易词云', u: 'https://www.yciyun.com', d: '词云在线生成', i: '☁️', c: 'tools' },
    { n: 'Remove.bg', u: 'https://www.remove.bg', d: 'AI一键去除图片背景', i: '✂️', c: 'tools' },
    { n: '菜鸟工具', u: 'https://c.runoob.com', d: '在线编程与工具集', i: '🐣', c: 'tools' },
    { n: 'JSON格式化', u: 'https://www.json.cn', d: 'JSON在线解析美化', i: '{ }', c: 'tools' },
    { n: '快递100', u: 'https://www.kuaidi100.com', d: '快递物流查询', i: '📮', c: 'tools' },
    { n: '在线屏幕录制', u: 'https://www.screenrecorder.com', d: '免费录屏工具', i: '🖥️', c: 'tools' },
    { n: 'IP查询', u: 'https://www.ip138.com', d: 'IP地址与归属查询', i: '🌍', c: 'tools' },
    { n: '语雀', u: 'https://www.yuque.com', d: '在线知识协作平台', i: '🐦', c: 'tools' },
    { n: '腾讯文档', u: 'https://docs.qq.com', d: '在线文档协作', i: '📄', c: 'tools' },
    { n: '思维导图', u: 'https://www.zxmind.cn', d: '在线思维导图工具', i: '🧠', c: 'tools' },

    // ═══ 资讯 ═══
    { n: 'IT之家', u: 'https://www.ithome.com', d: '科技资讯门户', i: '📰', c: 'news' },
    { n: '今日头条', u: 'https://www.toutiao.com', d: '个性化资讯推荐', i: '📱', c: 'news' },
    { n: '36kr', u: 'https://36kr.com', d: '创业科技媒体', i: '📊', c: 'news' },
    { n: '少数派', u: 'https://sspai.com', d: '数字生活指南', i: '📲', c: 'news' },
    { n: '今日热榜', u: 'https://tophub.today', d: '全网热榜聚合', i: '🔥', c: 'news' },
    { n: '微博热榜', u: 'https://weibo.com/hot', d: '微博热搜榜', i: '🔴', c: 'news' },
    { n: '腾讯新闻', u: 'https://news.qq.com', d: '综合新闻资讯', i: '🐧', c: 'news' },
    { n: '网易新闻', u: 'https://news.163.com', d: '有态度的新闻', i: '🔴', c: 'news' },
    { n: '新华网', u: 'https://www.xinhuanet.com', d: '国家通讯社新闻', i: '🇨🇳', c: 'news' },
    { n: '人民网', u: 'https://www.people.com.cn', d: '人民日报官网', i: '🇨🇳', c: 'news' },
    { n: '澎湃新闻', u: 'https://www.thepaper.cn', d: '原创新闻资讯', i: '🌊', c: 'news' },
    { n: '界面新闻', u: 'https://www.jiemian.com', d: '财经商业新闻', i: '📊', c: 'news' },
    { n: '虎嗅', u: 'https://www.huxiu.com', d: '深度商业科技资讯', i: '🐯', c: 'news' },
    { n: '品玩', u: 'https://www.pingwest.com', d: '全球科技媒体', i: '🌐', c: 'news' },
    { n: '快科技', u: 'https://www.mydrivers.com', d: '硬件科技资讯', i: '⚡', c: 'news' },
    { n: '爱范儿', u: 'https://www.ifanr.com', d: '科技生活方式', i: '💜', c: 'news' },
    { n: '中关村', u: 'https://www.zol.com.cn', d: '科技产品资讯', i: '💻', c: 'news' },
    { n: '知微事见', u: 'https://ef.zhiweidata.com', d: '事件影响力分析', i: '📈', c: 'news' },
    { n: '大数据', u: 'https://www.cbndata.com', d: '大数据行业资讯', i: '📉', c: 'news' },

    // ═══ 社区 ═══
    { n: 'V2EX', u: 'https://v2ex.com', d: '创意工作者的社区', i: '💬', c: 'community' },
    { n: '掘金', u: 'https://juejin.cn', d: '开发者技术社区', i: '💎', c: 'community' },
    { n: '百度贴吧', u: 'https://tieba.baidu.com', d: '中文最大社区论坛', i: '🏷️', c: 'community' },
    { n: 'Reddit', u: 'https://reddit.com', d: 'The front page of the internet', i: '🔶', c: 'community' },
    { n: 'Hacker News', u: 'https://news.ycombinator.com', d: '硅谷科技圈必读', i: '🟧', c: 'community' },
    { n: '豆瓣', u: 'https://www.douban.com', d: '书影音精神角落', i: '🟩', c: 'community' },
    { n: '虎扑', u: 'https://www.hupu.com', d: '体育社区', i: '🏀', c: 'community' },
    { n: 'NGA', u: 'https://bbs.nga.cn', d: '精英玩家社区', i: '🎮', c: 'community' },
    { n: '龙空', u: 'https://www.lkong.com', d: '网络文学论坛', i: '🐉', c: 'community' },
    { n: '一亩三分地', u: 'https://www.1point3acres.com', d: '留学申请社区', i: '🌾', c: 'community' },
    { n: 'Discord', u: 'https://discord.com', d: '社群聊天平台', i: '🎧', c: 'community' },
    { n: 'Telegram', u: 'https://telegram.org', d: '安全即时通讯', i: '✈️', c: 'community' },

    // ═══ AI 工具 ═══
    { n: 'ChatGPT', u: 'https://chatgpt.com', d: 'OpenAI 智能对话助手', i: '🤖', c: 'ai' },
    { n: 'Claude', u: 'https://claude.ai', d: 'Anthropic AI 助手', i: '🧠', c: 'ai' },
    { n: 'Midjourney', u: 'https://midjourney.com', d: 'AI 图像生成工具', i: '🎨', c: 'ai' },
    { n: 'Stable Diffusion', u: 'https://stability.ai', d: '开源 AI 图像模型', i: '🖼️', c: 'ai' },
    { n: 'Poe', u: 'https://poe.com', d: '多模型 AI 聚合平台', i: '🔮', c: 'ai' },
    { n: 'Hugging Face', u: 'https://huggingface.co', d: 'AI 模型社区', i: '🤗', c: 'ai' },
    { n: '通义千问', u: 'https://tongyi.aliyun.com', d: '阿里云大模型', i: '🔵', c: 'ai' },
    { n: '文心一言', u: 'https://yiyan.baidu.com', d: '百度大模型', i: '🟦', c: 'ai' },
    { n: 'Kimi', u: 'https://kimi.moonshot.cn', d: 'Moonshot AI 助手', i: '🌙', c: 'ai' },
    { n: 'Suno', u: 'https://suno.com', d: 'AI 音乐生成', i: '🎵', c: 'ai' },
    { n: '讯飞星火', u: 'https://xinghuo.xfyun.cn', d: '科大讯飞大模型', i: '✨', c: 'ai' },
    { n: '智谱清言', u: 'https://chatglm.cn', d: '清华系 AI 助手', i: '🎓', c: 'ai' },
    { n: '通义万相', u: 'https://tongyi.aliyun.com/wanxiang', d: 'AI 图像生成', i: '🖌️', c: 'ai' },
    { n: '即梦', u: 'https://jimeng.jianying.com', d: '字节 AI 图像创作', i: '💭', c: 'ai' },
    { n: 'Perplexity', u: 'https://www.perplexity.ai', d: 'AI 搜索引擎', i: '🔎', c: 'ai' },
    { n: 'Cursor', u: 'https://cursor.com', d: 'AI 代码编辑器', i: '⌨️', c: 'ai' },

    // ═══ 开发编程 ═══
    { n: 'Stack Overflow', u: 'https://stackoverflow.com', d: '全球最大的开发者问答社区', i: '📚', c: 'dev' },
    { n: 'MDN Web Docs', u: 'https://developer.mozilla.org', d: 'Web 技术权威文档', i: '📖', c: 'dev' },
    { n: 'npm', u: 'https://npmjs.com', d: 'Node.js 包管理器', i: '📦', c: 'dev' },
    { n: 'CodePen', u: 'https://codepen.io', d: '前端代码在线编辑器', i: '✏️', c: 'dev' },
    { n: 'Can I Use', u: 'https://caniuse.com', d: '浏览器兼容性查询', i: '✅', c: 'dev' },
    { n: 'CSDN', u: 'https://www.csdn.net', d: '中文开发者社区', i: '🟥', c: 'dev' },
    { n: '博客园', u: 'https://www.cnblogs.com', d: '开发者的网上家园', i: '🏡', c: 'dev' },
    { n: 'LeetCode', u: 'https://leetcode.cn', d: '算法刷题平台', i: '🧩', c: 'dev' },
    { n: 'Vercel', u: 'https://vercel.com', d: '前端部署平台', i: '▲', c: 'dev' },
    { n: 'Cloudflare', u: 'https://www.cloudflare.com', d: 'CDN与安全服务', i: '🛡️', c: 'dev' },
    { n: '开源中国', u: 'https://www.oschina.net', d: '中文开源社区', i: '🐉', c: 'dev' },
    { n: 'SegmentFault', u: 'https://segmentfault.com', d: '中文技术问答社区', i: '💡', c: 'dev' },
    { n: '51CTO', u: 'https://www.51cto.com', d: 'IT技术社区', i: '🖥️', c: 'dev' },
    { n: '菜鸟教程', u: 'https://www.runoob.com', d: '编程入门学习', i: '🐣', c: 'dev' },
    { n: 'W3School', u: 'https://www.w3school.com.cn', d: 'Web技术教程', i: '📖', c: 'dev' },
    { n: 'GitHub Trending', u: 'https://github.com/trending', d: '热门开源项目', i: '🔥', c: 'dev' },
    { n: 'Docker Hub', u: 'https://hub.docker.com', d: '容器镜像仓库', i: '🐳', c: 'dev' },

    // ═══ 设计素材 ═══
    { n: 'Dribbble', u: 'https://dribbble.com', d: '设计师作品展示平台', i: '🏀', c: 'design' },
    { n: 'Behance', u: 'https://www.behance.net', d: 'Adobe 创意作品平台', i: '🎭', c: 'design' },
    { n: 'Figma', u: 'https://figma.com', d: '协作式界面设计工具', i: '🖌️', c: 'design' },
    { n: 'Unsplash', u: 'https://unsplash.com', d: '免费高质量图片素材', i: '📷', c: 'design' },
    { n: 'Coolors', u: 'https://coolors.co', d: '超快配色方案生成器', i: '🎨', c: 'design' },
    { n: '包图网', u: 'https://ibaotu.com', d: '免费设计素材下载', i: '📐', c: 'design' },
    { n: '千图网', u: 'https://www.58pic.com', d: '免费图片素材下载', i: '🖼️', c: 'design' },
    { n: 'Pinterest', u: 'https://www.pinterest.com', d: '全球灵感收集平台', i: '📌', c: 'design' },
    { n: '即时设计', u: 'https://js.design', d: '国产在线设计工具', i: '⚡', c: 'design' },
    { n: 'IconPark', u: 'https://iconpark.oceanengine.com', d: '字节图标库', i: '🔷', c: 'design' },
    { n: '站酷', u: 'https://www.zcool.com.cn', d: '设计师社区平台', i: '🎯', c: 'design' },
    { n: '花瓣网', u: 'https://huaban.com', d: '中文灵感收集平台', i: '🌺', c: 'design' },
    { n: '优设', u: 'https://www.uisdc.com', d: '设计师学习平台', i: '📐', c: 'design' },
    { n: '字由', u: 'https://www.hellofont.cn', d: '字体管理与下载', i: '🔤', c: 'design' },
    { n: '摄图网', u: 'https://699pic.com', d: '正版图片素材', i: '📸', c: 'design' },
    { n: '千库网', u: 'https://588ku.com', d: '免费PNG素材下载', i: '🖼️', c: 'design' },
];

async function seed() {
    const SQL = await initSqlJs();

    // Load existing database or create new one
    let db;
    if (fs.existsSync(DB_PATH)) {
        const fileBuffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(fileBuffer);
        console.log('Loaded existing database');
    } else {
        db = new SQL.Database();
        console.log('Created new database');
    }

    // Create tables
    db.run(`CREATE TABLE IF NOT EXISTS sites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        description TEXT,
        icon TEXT,
        category TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS admin (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )`);

    // Insert default admin if not exists
    const result = db.exec("SELECT COUNT(*) as count FROM admin");
    const count = result[0]?.values[0][0] || 0;
    if (count === 0) {
        db.run("INSERT INTO admin (username, password) VALUES ('admin', 'admin123')");
        console.log('Default admin created: admin / admin123');
    }

    // Clear existing sites and insert all
    db.run("DELETE FROM sites");
    console.log('Cleared existing sites');

    const stmt = db.prepare("INSERT INTO sites (name, url, description, icon, category, sort_order) VALUES (?, ?, ?, ?, ?, ?)");

    for (const site of sites) {
        stmt.run([site.n, site.u, site.d, site.i, site.c, 0]);
    }
    stmt.free();

    console.log(`Imported ${sites.length} sites`);

    // Save database
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
    console.log('Database saved to', DB_PATH);

    // Show stats
    const stats = db.exec("SELECT category, COUNT(*) as count FROM sites GROUP BY category ORDER BY count DESC");
    if (stats.length > 0) {
        console.log('\nSites by category:');
        stats[0].values.forEach(([cat, cnt]) => {
            console.log(`  ${cat}: ${cnt}`);
        });
    }
}

seed().catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
});
