# -*- coding: utf-8 -*-
"""组装站点页面：卷一 / 卷二（首页与审计页另行手写）。"""
import io, os, re, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))   # 站点根 = _build/ 的父目录
BUILD = os.path.join(ROOT, "_build")
RAW = r"D:\workbuddy\Data\Agent-Reach\outputs"   # 外部原始素材（不在仓库里，换机器需改这一行）
SRC = {
    "vol1": os.path.join(RAW, "wealthfreedom", "孙宇晨_财富自由革命之路_80讲总结.html"),
    "vol2": os.path.join(RAW, "sunyuchentalk", "对话孙宇晨_4小时访谈总结.html"),
}
CANON = "https://strangeyu911-tech.github.io/justin-sun-corpus/"
GH = "https://github.com/strangeyu911-tech/justin-sun-corpus"

import sys
sys.path.insert(0, BUILD)
import build as B   # 复用 head / topbar / 目录

PAGES = {
    "vol1": dict(
        out="2016-2017-wealthfreedom.html",
        title="孙宇晨《财富自由革命之路》全 156 集（2016–2017）｜结构化总结与置信度标注 · 孙割这十年",
        desc="孙宇晨 2016–2017 年喜马拉雅付费音频专栏《财富自由革命之路》全 156 集结构化总结："
             "B 站官方字幕 001–080 + 第三方 ASR 转写 088–145 + 小宇宙概要 146–155，逐板块标注证据等级。",
        brand_full="孙割这十年 · 卷一（2016–17）",
        brand_short="孙割十年 · 卷一",
        brand_xs="卷一",
        ph="搜索本卷关键词",
        kicker="卷一 · 内容年份 2016 – 2017 · 喜马拉雅付费音频专栏",
        meta_title="孙割这十年 · 卷一：2016–17《财富自由革命之路》全 156 集",
        meta_desc="跨度十年的两套公开材料，按年份分卷。卷一为 2016–2017 年喜马拉雅音频课全 156 集的结构化总结，逐板块标注证据等级。",
        prev=('<a class="btn" href="index.html">← 总览</a>',
              '<a class="btn" href="2026-interview.html">卷二 · 2026 长访谈 →</a>',
              '卷一 · 内容年份 2016 – 2017'),
        foot_intro=("<p><b>本站：</b><b>孙割这十年</b>把孙宇晨跨度十年的两套公开材料放在一起，"
                    "<b>按年份分卷</b>，并给每个板块标注证据等级。本页是<b>卷一</b>，内容录制于 <b>2016 – 2017 年</b>；"
                    "另一卷是 <a href=\"2026-interview.html\">2026 年的 4 小时长访谈</a>，"
                    "两卷相隔约十年，其中的判断、口径与自我定位已经明显不同——"
                    "<a href=\"index.html\">总览页</a>有一张逐条对照表。"
                    "另有 <a href=\"volume3.html\">卷三 · 十年之后回头看</a>——把本卷里能检验的断言逐条核对到了今天。</p>\n"
                    "<p><b>置信度怎么读：</b>每个板块标题下的徽章标明这一块的依据来源；"
                    "行内标签三档为 <span class=\"tag tag-fact\">原话 · 已核字幕</span>、"
                    "<span class=\"tag tag-mid\">转写 · 中可信</span>、"
                    "<span class=\"tag tag-low\">概要 · 待核</span>。"
                    "本页共 <b>%s</b> 处置信度标注、<b>%s</b> 条引语带出处标签。"
                    "方法与自查见 <a href=\"audit.html\">站点审计报告</a>。</p>"),
    ),
    "vol2": dict(
        out="2026-interview.html",
        title="对话孙宇晨：年轻人如何抓住 AI 时代的机会？（2026）｜4 小时长谈结构化总结 · 孙割这十年",
        desc="邵艾伦（Alan）与孙宇晨 4 小时 22 分钟长谈的结构化总结：AI 个人操作系统、薄肌、"
             "全球套利、Crypto 与财富自由。全片依据 B 站官方字幕逐句核对，逐板块标注证据等级。",
        brand_full="孙割这十年 · 卷二（2026）",
        brand_short="孙割十年 · 卷二",
        brand_xs="卷二",
        ph="搜索本卷关键词",
        kicker="卷二 · 内容年份 2026 · 4 小时长访谈",
        meta_title="孙割这十年 · 卷二：2026 年对话孙宇晨 4 小时长谈",
        meta_desc="跨度十年的两套公开材料，按年份分卷。卷二为 2026 年邵艾伦与孙宇晨的 4 小时长谈总结，全片依据 B 站官方字幕逐句核对。",
        prev=('<a class="btn" href="2016-2017-wealthfreedom.html">← 卷一 · 2016–17 音频课</a>',
              '<a class="btn" href="index.html">总览 →</a>',
              '卷二 · 内容年份 2026'),
        foot_intro=("<p><b>本站：</b><b>孙割这十年</b>把孙宇晨跨度十年的两套公开材料放在一起，"
                    "<b>按年份分卷</b>，并给每个板块标注证据等级。本页是<b>卷二</b>，录制于 <b>2026 年</b>；"
                    "另一卷是 <a href=\"2016-2017-wealthfreedom.html\">2016–2017 年的音频课全 156 集</a>，"
                    "两卷相隔约十年——<a href=\"index.html\">总览页</a>把两卷的说法逐条并排放了。"
                    "另有 <a href=\"volume3.html\">卷三 · 十年之后回头看</a>——把卷一里能检验的断言逐条核对到了今天。</p>\n"
                    "<p><b>置信度怎么读：</b>本卷全片有官方字幕（7,068 句，覆盖 00:00:00 – 04:22:28），"
                    "所以正文与引语基本都能落到时间码，证据等级以 "
                    "<span class=\"tag tag-fact\">原话 · 已核字幕</span> 为主；"
                    "「概念词典」「如果只做三件事」是编者归纳，"
                    "「需要打折听的地方」是编者整理的存疑清单——这三块另标。"
                    "本页共 <b>%s</b> 处置信度标注、<b>%s</b> 条引语带时间码。"
                    "方法与自查见 <a href=\"audit.html\">站点审计报告</a>。</p>"),
    ),
}


def hero_of(key, kicker):
    html = io.open(SRC[key], encoding='utf-8').read()
    i = html.index('<header class="hero">')
    j = html.index('</header>', i) + len('</header>')
    hero = html[i:j]
    # 换 kicker
    hero = re.sub(r'(<span class="kicker">).*?(</span>)', lambda m: m.group(1) + kicker + m.group(2), hero, count=1, flags=re.S)
    # 插入返回链接 + 卷内导航
    hero = hero.replace('<div class="hero-inner">',
                        '<div class="hero-inner">\n    <a class="volback" href="index.html">← 返回总览（两卷 + 十年对照）</a>', 1)
    return hero


def foot_of(key, intro_fmt, ntag, ncite):
    inner = io.open(os.path.join(BUILD, key + '_foot.html'), encoding='utf-8').read()
    return '<footer>\n  <div class="foot-inner">\n    ' + (intro_fmt % (ntag, ncite)) + '\n' + inner + '\n  </div>\n</footer>'


for key, cfg in PAGES.items():
    main = io.open(os.path.join(BUILD, key + '_proc.html'), encoding='utf-8').read()
    ntag = len(re.findall(r'class="tag tag-', main))
    ncite = main.count('<cite>')
    toc = io.open(os.path.join(BUILD, ('toc1.html' if key == 'vol1' else 'toc2.html')), encoding='utf-8').read()
    hero = hero_of(key, cfg['kicker'])
    meta = json.dumps({'title': cfg['meta_title'], 'desc': cfg['meta_desc']},
                      ensure_ascii=False)
    parts = [
        B.head(cfg['title'], cfg['desc'], CANON + cfg['out']),
        B.topbar(cfg['brand_full'], cfg['brand_short'], cfg['brand_xs'], cfg['ph'], with_toc=True),
        '\n<div class="m-search" id="msearch"><div class="m-search-in" id="msearchin"></div></div>\n',
        toc,
        '\n' + hero + '\n',
        '<div class="shell">\n<main>\n', main, '\n</main>\n</div>\n',
        '<div class="wrap"><div id="qq-entry"></div></div>\n',
        """<section class="xsec">
  <div class="wrap">
    <h2>同一位作者的其他站点</h2>
    <p class="xsec-lead">下面这两处与本页同出一手，但体裁、口径完全不同 —— 列在这里，供你自己判断。</p>
    <div class="xgrid">
      <a class="xcard" href="https://mirror.strangeyu.xyz/" target="_blank" rel="noopener">
        <b>以日为镜：衰退时代普通人生存指南</b>
        <span>以日本「失去三十年」为镜，综合 20 余位中日与国际学者的观点与 2026 年最新数据，直接给出结论、置信度与分人群行动。</span>
        <i>去看看 →</i>
      </a>
      <a class="xcard" href="https://htlb.strangeyu.xyz/" target="_blank" rel="noopener">
        <b>《高性价比人生指南》衍生站 · 聚合索引</b>
        <span>另一个开源项目散在墙内各处的 18 个衍生站、加上维护者自己的几个站点聚在一页，逐个核实谁同步到了哪一版。</span>
        <i>去看看 →</i>
      </a>
    </div>
  </div>
</section>
""",
        '<div class="bottomnav"><div class="bn-in">\n  ', cfg['prev'][0],
        '\n  <span class="bn-tip">', cfg['prev'][2], '</span>\n  ', cfg['prev'][1],
        '\n</div></div>\n',
        foot_of(key, cfg['foot_intro'], ntag, ncite),
        '\n<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>\n',
        '<script>window.SITE_META=%s;</script>\n' % meta,
        '<script src="assets/site.js" defer></script>\n',
        '<script>window.QQ_CONFIG={wxNote:\'孙割这十年\'};</script>\n',
        '<script src="qqgroup.js" defer></script>\n',
        '</body>\n</html>\n',
    ]
    html = ''.join(parts)
    io.open(os.path.join(ROOT, cfg['out']), 'w', encoding='utf-8', newline='\n').write(html)
    print('%-32s %8d 字符 | 置信度标注 %3d | 引语 %2d' % (cfg['out'], len(html), ntag, ncite))
