# -*- coding: utf-8 -*-
"""
把两卷原始总结页重建为「孙割这十年」站点：
  index.html                      首页（年份分区 + 十年对照 + 全站检索）
  2016-2017-wealthfreedom.html    卷一 · 2016–17 音频课
  2026-interview.html             卷二 · 2026 长访谈
"""
import io, os, re, json, hashlib

ROOT = r"D:\workbuddy\Data\Agent-Reach\outputs\sunyuchen-site"
BUILD = os.path.join(ROOT, "_build")
RAW = r"D:\workbuddy\Data\Agent-Reach\outputs"
SRC = {
    "vol1": os.path.join(RAW, "wealthfreedom", "孙宇晨_财富自由革命之路_80讲总结.html"),
    "vol2": os.path.join(RAW, "sunyuchentalk", "对话孙宇晨_4小时访谈总结.html"),
}
GH = "https://github.com/strangeyu911-tech/justin-sun-corpus"
CANON = "https://strangeyu911-tech.github.io/justin-sun-corpus/"

LOGO = ('<svg class="logo" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
        '<rect width="24" height="24" rx="6" fill="#0f766e"/>'
        '<path d="M10 7.6v8.8l7-4.4z" fill="#fbfaf8"/>'
        '<path d="M5.2 9.6v4.8M7.4 10.8v2.4M18.8 9.6v4.8M16.6 10.8v2.4" stroke="#fbfaf8" '
        'stroke-width="1.4" stroke-linecap="round" opacity=".72"/></svg>')
FAVICON = ("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E"
           "%3Crect width='24' height='24' rx='6' fill='%230f766e'/%3E%3Cpath d='M10 7.6v8.8l7-4.4z' "
           "fill='%23fbfaf8'/%3E%3C/svg%3E")

HAMBURGER = ('<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
             'stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>')
ICO_SEARCH = ('<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
              'stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/>'
              '<path d="M21 21l-4.3-4.3"/></svg>')
ICO_SHARE = ('<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
             'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
             '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>'
             '<path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>')
ICO_GH = ('<svg width="19" height="19" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">'
          '<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49'
          '-2.01.37-2.53-.49-2.69-.94-.09-.23-.78-.94-1.33-1.13-.27-.16-.65-.52-.01-.53.6-.01 1.03.56 1.18.79'
          '.69 1.17 1.77.83 2.21.64.07-.5.27-.83.49-1.02-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15'
          '-.08-.2-.36-1.02.08-2.12 0 0 .67-.22 2.2.82a7.6 7.6 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 '
          '2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.28.24.53.71.53 '
          '1.44 0 1.04-.01 1.87-.01 2.13 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>')

SHARE_MENU = """<div class="share-menu" id="sharemenu" role="menu" aria-label="分享到">
  <button class="sm-item" type="button" role="menuitem" data-ch="native"><span class="sm-ic">&#8682;</span><span class="sm-tx">系统分享（手机含微信 / QQ）</span></button>
  <button class="sm-item" type="button" role="menuitem" data-ch="copy"><span class="sm-ic">&#10697;</span><span class="sm-tx">复制链接<small>粘贴到微信 / QQ 即显示卡片</small></span></button>
  <div class="sm-sep"></div>
  <button class="sm-item" type="button" role="menuitem" data-ch="weibo"><span class="sm-ic">微</span><span class="sm-tx">新浪微博</span></button>
  <button class="sm-item" type="button" role="menuitem" data-ch="qq"><span class="sm-ic">Q</span><span class="sm-tx">QQ 好友 / Qzone</span></button>
  <button class="sm-item" type="button" role="menuitem" data-ch="facebook"><span class="sm-ic">f</span><span class="sm-tx">Facebook</span></button>
  <button class="sm-item" type="button" role="menuitem" data-ch="twitter"><span class="sm-ic">X</span><span class="sm-tx">X (Twitter)</span></button>
  <button class="sm-item" type="button" role="menuitem" data-ch="telegram"><span class="sm-ic">T</span><span class="sm-tx">Telegram</span></button>
  <button class="sm-item" type="button" role="menuitem" data-ch="reddit"><span class="sm-ic">R</span><span class="sm-tx">Reddit</span></button>
  <button class="sm-item" type="button" role="menuitem" data-ch="linkedin"><span class="sm-ic">in</span><span class="sm-tx">LinkedIn</span></button>
  <button class="sm-item" type="button" role="menuitem" data-ch="whatsapp"><span class="sm-ic">W</span><span class="sm-tx">WhatsApp</span></button>
  <button class="sm-item" type="button" role="menuitem" data-ch="line"><span class="sm-ic">L</span><span class="sm-tx">LINE</span></button>
  <div class="sm-sep"></div>
  <button class="sm-item" type="button" role="menuitem" data-ch="qrcode"><span class="sm-ic">&#128247;</span><span class="sm-tx">微信：生成二维码<small>微信扫码打开后再分享</small></span></button>
  <div class="qr-box" id="qrbox" hidden><div id="qrcode"></div><p class="qr-hint">用微信「扫一扫」打开本页，再点右上角 ··· 分享给好友 / 朋友圈</p></div>
</div>"""


def topbar(brand_full, brand_short, brand_xs, placeholder, with_toc=True, toc_label="打开目录"):
    tocbtn = ('<button class="iconbtn" id="tocbtn" aria-label="%s" type="button">%s</button>'
              % (toc_label, HAMBURGER)) if with_toc else ''
    return """<div class="topbar">
  <div class="in">
    <div class="tb-brand">
      %(tocbtn)s
      %(logo)s
      <span class="brand" title="%(full)s"><span class="b-full">%(full)s</span><span class="b-short">%(short)s</span><span class="b-xs">%(xs)s</span></span>
    </div>
    <div class="tb-main">
      <div class="tb-col">
        <span class="sp"></span>
        <div class="searchbox">
          <span class="sico">%(ico_search)s</span>
          <input id="q" type="text" placeholder="%(ph)s" aria-label="%(ph)s">
          <span id="hitcount"></span>
          <span class="kbd">/</span>
        </div>
        <div class="share-wrap">
          <button class="iconbtn" id="sharebtn" type="button" aria-label="分享本页" aria-haspopup="menu" aria-expanded="false">%(ico_share)s</button>
          %(menu)s
        </div>
        <a class="iconbtn gh" href="%(gh)s" target="_blank" rel="noopener" aria-label="GitHub 仓库">%(ico_gh)s</a>
        <button class="switch" id="themebtn" role="switch" aria-label="日夜模式切换" aria-checked="false" type="button"><span class="knob"></span></button>
      </div>
    </div>
  </div>
</div>""" % dict(tocbtn=tocbtn, logo=LOGO, full=brand_full, short=brand_short, xs=brand_xs,
                 ico_search=ICO_SEARCH, ico_share=ICO_SHARE, ico_gh=ICO_GH, menu=SHARE_MENU,
                 ph=placeholder, gh=GH)


def head(title, desc, canon, extra_js=""):
    return """<!DOCTYPE html>
<html lang="zh-CN" data-theme="light">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>%(title)s</title>
<meta name="description" content="%(desc)s">
<link rel="canonical" href="%(canon)s">
<meta property="og:type" content="article">
<meta property="og:site_name" content="孙割这十年">
<meta property="og:url" content="%(canon)s">
<meta property="og:title" content="%(title)s">
<meta property="og:description" content="%(desc)s">
<meta property="og:image" content="%(canon)sassets/og.png">
<meta property="og:locale" content="zh_CN">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="%(title)s">
<meta name="twitter:description" content="%(desc)s">
<meta name="twitter:image" content="%(canon)sassets/og.png">
<link rel="icon" href="%(favicon)s">
<link rel="stylesheet" href="assets/site.css">
<script>try{var t=localStorage.getItem('sycn-theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}</script>
</head>
<body%(bodyattr)s>
<div id="progress"></div>
""" % dict(title=title, desc=desc, canon=canon, favicon=FAVICON, bodyattr="")


# ---------------------------------------------------------------- 置信度体系
TIER = {
    'high': ('tag-fact', '原话 · 已核字幕',
             '依据 B 站官方智能字幕逐句导出'),
    'mid':  ('tag-mid', '转写 · 中可信',
             '依据第三方 ASR 转写仓（Qwen-ASR，有同音字与断句错误，引用前需回原音核对）'),
    'low':  ('tag-low', '概要 · 待核',
             '依据小宇宙 AI 概要 + 时间轴（二手压缩材料，不能当逐字引用）'),
}

VOL1_SRC = [
    ('s0',  'note',  None, '本页结构由编者按主题轴重排，事实依据分见各板块的来源徽章。'),
    ('s1',  'high',  '001 / 013 / 015'),
    ('s2',  'high',  '006 / 007 / 011'),
    ('s3',  'high',  '001 / 017 / 052'),
    ('s4',  'high',  '034 – 054'),
    ('s5',  'high',  '026 – 031'),
    ('s6',  'high',  '056 – 062'),
    ('s7',  'high',  '013 / 031 / 032'),
    ('s8',  'high',  '063 – 065'),
    ('s9',  'high',  '002 / 011 / 043'),
    ('s10', 'high',  '066 – 080'),
    ('s11', 'high',  '016 / 022 – 024'),
    ('s12', 'mid',   '088 – 097'),
    ('s13', 'mid',   '098 – 100'),
    ('s14', 'mid',   '101 – 105'),
    ('s15', 'mid',   '106 – 116'),
    ('s16', 'mid',   '117 – 123'),
    ('s17', 'mid',   '124 – 130'),
    ('s18', 'mid',   '131 – 138'),
    ('s19', 'mid',   '139 – 142'),
    ('s20', 'mid',   '143 – 145'),
    ('s21', 'low',   '146 – 155'),
    ('s22', 'mix',   None, '三块来源在索引内分列，逐块标注证据等级；灰色编号表示该讲无字幕轨。'),
    ('s23', 'quotes', None, '每条引语末尾标注了出处与证据等级。'),
    ('s24', 'note',  None, '十六个关键词由编者整理释义，不是他的原话。'),
    ('s25', 'warn',  None, '编者整理的存疑清单，逐条说明该内容为什么需要打折听。'),
]
VOL2_SRC = [
    ('s0',  'note',  None, '这八句由编者从全片归纳，每句在正文里都有对应的时间码出处。'),
    ('s1',  'high',  '00:00:00 – 00:01:31'),
    ('s2',  'high',  '00:01:31 – 00:08:02'),
    ('s3',  'high',  '00:08:02 – 00:25:03'),
    ('s4',  'high',  '00:25:03 – 00:52:46'),
    ('s5',  'high',  '00:52:46 – 01:22:07'),
    ('s6',  'high',  '01:22:07 – 01:32:26'),
    ('s7',  'high',  '01:32:26 – 02:04:03'),
    ('s8',  'high',  '02:04:03 – 02:40:44'),
    ('s9',  'high',  '02:40:44 – 04:22:29'),
    ('s10', 'note',  None, '九个关键词由编者整理释义，不是他的原话。'),
    ('s11', 'quotes', None, '每条引语都带时间码，可直接回原片核对。'),
    ('s12', 'warn',  None, '编者整理的存疑清单，逐条说明该内容为什么需要打折听。'),
    ('s13', 'note',  None, '编者归纳的行动清单，不是他的原话。'),
]

MIX_TAG = {
    'note':   ('tag-mid', '编者归纳'),
    'quotes': ('tag-mid', '混合来源'),
    'warn':   ('tag-low', '阅读提醒'),
    'mix':    ('tag-mid', '混合来源'),
}


def sec_badge(kind, eps, note):
    if kind in MIX_TAG:
        cls, txt = MIX_TAG[kind]
        tail = ('讲号 / 时间码 ' + eps + ' · ' if eps else '') + (note or '')
        return '<p class="sec-src"><span class="tag %s">%s</span>%s</p>' % (cls, txt, tail)
    cls, txt, basis = TIER[kind]
    tail = ('讲号 ' + eps + ' · ' if eps else '') + basis
    return '<p class="sec-src"><span class="tag %s">%s</span>%s</p>' % (cls, txt, tail)


def inject_badges(html, spec):
    """在每个 <section id="sN"> 的 </h2> 之后插入来源徽章"""
    for item in spec:
        sid, kind = item[0], item[1]
        eps = item[2] if len(item) > 2 else None
        note = item[3] if len(item) > 3 else None
        key = '<section id="%s">' % sid
        i = html.find(key)
        if i < 0:
            raise SystemExit('缺少 %s' % key)
        j = html.index('</h2>', i) + len('</h2>')
        html = html[:j] + '\n    ' + sec_badge(kind, eps, note) + html[j:]
    return html


# ---------------------------------------------------------------- 引语出处分级
def tag_cites(html, vol):
    def repl(m):
        inner = m.group(1)
        if vol == 'vol2':
            cls, txt = 'tag-fact', '原话 · 已核'
        else:
            n = re.search(r'第\s*(\d+)\s*讲', inner)
            if n:
                k = int(n.group(1))
                if k <= 80:
                    cls, txt = 'tag-fact', '已核字幕'
                elif k <= 145:
                    cls, txt = 'tag-mid', '转写稿'
                else:
                    cls, txt = 'tag-low', '待核'
            elif re.search(r'vol\.\s*\d+', inner):
                cls, txt = 'tag-low', 'AI 概要'
            else:
                return m.group(0)
        return '<cite>%s <span class="tag %s">%s</span></cite>' % (inner, cls, txt)
    return re.sub(r'<cite>(.*?)</cite>', repl, html, flags=re.S)


# ---------------------------------------------------------------- 目录构建
def build_toc(solo, groups):
    out = ['<nav id="toc" aria-label="目录">',
           '<h4>章节<span class="sp"></span>'
           '<button class="toc-tool" id="toc-expand" type="button">全展开</button>'
           '<button class="toc-tool" id="toc-collapse" type="button">全收起</button></h4>']
    out.append('<a href="#%s" class="solo">%s</a>' % solo)
    for title, anchor, subs in groups:
        out.append('<div class="toc-group" data-part="%s">' % anchor)
        out.append('<div class="toc-head">')
        out.append('<button class="toc-caret" type="button" aria-label="展开%s" aria-expanded="false">&#9654;</button>' % title)
        out.append('<a class="toc-title-link" href="#%s">%s</a>' % (anchor, title))
        out.append('</div>')
        out.append('<div class="toc-subs">')
        for sid, label in subs:
            out.append('<a href="#%s" class="lvl2">%s</a>' % (sid, label))
        out.append('</div></div>')
    # 末尾一条「加 QQ 群 / 作者微信交流」：正文里 #qq-entry 排在全部 section 之后（页脚之前），
    # 所以目录里也放最后一行。原先靠 tools/fix-order2.py 事后插，而首页那条是手工加的、
    # 加到了「06 阅读前提与免责」和「卷一」之间 —— 七页位置不一致。这里直接固化，重建即正确。
    out.append('<a href="#qq-entry" class="solo">加 QQ 群 / 作者微信交流</a>')
    out.append('</nav>')
    out.append('<div id="toc-mask"></div>')
    return '\n'.join(out)


VOL1_TOC = build_toc(
    ('s0', '卷首 · 速览：十一句话说清这套课'),
    [('第一部分 · 课程主线（001–080）', 's1', [
        ('s1', '① 这套课是什么'), ('s2', '② 财富自由被重新定义'),
        ('s3', '③ 战略：为什么勤劳却不富有'), ('s4', '④ 三大革命：不买房、不买车、不结婚'),
        ('s5', '⑤ 全球流动性过剩'), ('s6', '⑥ 原始积累三定律'),
        ('s7', '⑦ 明道：自由意志主义'), ('s8', '⑧ 个人奋斗的道德合法性'),
        ('s9', '⑨ 投资实战'), ('s10', '⑩ 拥抱不确定性'),
        ('s11', '⑪ 家庭的边界'),
    ]),
     ('第二部分 · 续篇与补遗（088–155）', 's12', [
        ('s12', '⑫ 互联网章（088–097）'), ('s13', '⑬ 荐书《大败局》（098–100）'),
        ('s14', '⑭ 比特币与区块链（101–105）'), ('s15', '⑮ 医疗（106–116）'),
        ('s16', '⑯ 家人边界（117–123）'), ('s17', '⑰ 财富天问（124–130）'),
        ('s18', '⑱ 财富流向（131–138）'), ('s19', '⑲ From It to Bit（139–142）'),
        ('s20', '⑳ 终章（143–145）'), ('s21', '㉑ 补遗：146–155'),
     ]),
     ('索引与附录', 's22', [
        ('s22', '㉒ 全 156 讲逐讲索引'), ('s23', '金句精选'),
        ('s24', '概念词典'), ('s25', '需要打折听的地方'),
     ])])

VOL2_TOC = build_toc(
    ('s0', '卷首 · 速览：八句话看懂这 4 小时'),
    [('正文 · 按时间轴的九段', 's1', [
        ('s1', '① 开场与自我介绍'), ('s2', '② 用 AI 托管一天'),
        ('s3', '③ 零资源起步的三件套'), ('s4', '④ 机会地图与「先探图再下注」'),
        ('s5', '⑤ 健康是第一杠杆：薄肌'), ('s6', '⑥ 逐水草而居：流动性即选择权'),
        ('s7', '⑦ Crypto：把货币翻译给机器'), ('s8', '⑧ 认知操作系统：Small Ego'),
        ('s9', '⑨ 财富自由之后'),
     ]),
     ('附录', 's10', [
         ('s10', '概念词典'), ('s11', '金句精选'),
         ('s12', '需要打折听的地方'), ('s13', '如果只做三件事'),
     ])])

print('TOC 卷一 / 卷二 构建完成')
io.open(os.path.join(BUILD, 'toc1.html'), 'w', encoding='utf-8', newline='\n').write(VOL1_TOC)
io.open(os.path.join(BUILD, 'toc2.html'), 'w', encoding='utf-8', newline='\n').write(VOL2_TOC)

# ---------------------------------------------------------------- 正文加工
def load_main(key):
    return io.open(os.path.join(BUILD, key + '_main.html'), encoding='utf-8').read()


def footer_of(key):
    html = io.open(SRC[key], encoding='utf-8').read()
    i = html.index('<div class="foot-inner">') + len('<div class="foot-inner">')
    j = html.rindex('</div>\n</footer>')
    return html[i:j].strip()


if __name__ == '__main__':
    v1 = load_main('vol1')
    v2 = load_main('vol2')
    v1 = inject_badges(v1, VOL1_SRC)
    v2 = inject_badges(v2, VOL2_SRC)
    # 给逐讲索引补上第三块的标题（原文只给了续篇与补遗两块小标题）
    v1 = v1.replace(
        '    <div class="idx">\n',
        '    <h3 class="idx-sub">正篇 · B 站合集 001 – 080<span>（官方智能字幕逐句导出；77/80 讲有字幕轨，3 讲由本地 faster-whisper 转写补全）</span></h3>\n\n    <div class="idx">\n', 1)
    v1 = tag_cites(v1, 'vol1')
    v2 = tag_cites(v2, 'vol2')
    io.open(os.path.join(BUILD, 'vol1_proc.html'), 'w', encoding='utf-8', newline='\n').write(v1)
    io.open(os.path.join(BUILD, 'vol2_proc.html'), 'w', encoding='utf-8', newline='\n').write(v2)
    io.open(os.path.join(BUILD, 'vol1_foot.html'), 'w', encoding='utf-8', newline='\n').write(footer_of('vol1'))
    io.open(os.path.join(BUILD, 'vol2_foot.html'), 'w', encoding='utf-8', newline='\n').write(footer_of('vol2'))
    print('正文加工完成：vol1 %d 字符 / vol2 %d 字符' % (len(v1), len(v2)))
    print('  卷一 tag 数 %d｜cite 数 %d' % (v1.count('class="tag tag-'), v1.count('<cite>')))
    print('  卷二 tag 数 %d｜cite 数 %d' % (v2.count('class="tag tag-'), v2.count('<cite>')))
