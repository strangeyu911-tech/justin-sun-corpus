# -*- coding: utf-8 -*-
"""给速览卡片、逐讲索引分组、两处存疑条目补上更细的行内置信度标注。"""
import io, os, re

BUILD = r"D:\workbuddy\Data\Agent-Reach\outputs\sunyuchen-site\_build"

LEGEND = """
    <div class="legend">
      <div class="lg"><span class="tag tag-fact">原话 · 已核字幕</span>
        <p><b>可以当引用用</b>有官方字幕或原视频逐字可核验，出处精确到讲号 / 时间码。</p></div>
      <div class="lg"><span class="tag tag-mid">转写 · 中可信</span>
        <p><b>引前须回原音</b>依据第三方 ASR 转写或二手压缩材料，同音字、断句与专有名词都可能有误。</p></div>
      <div class="lg"><span class="tag tag-low">概要 · 待核</span>
        <p><b>只能当线索</b>别人已经压缩过一遍的概要，或标题 / 编号本身存疑、原片检索不到的流传说法。</p></div>
    </div>
"""

V1_CARDS = {
    '总纲': ('tag-fact', '已核字幕', '第 006 · 007 讲'),
    '诊断': ('tag-fact', '已核字幕', '第 001 讲'),
    '战略课表': ('tag-fact', '已核字幕', '第 013 · 015 讲'),
    '世界观': ('tag-mid', 'ASR 复核', '第 010 · 019 · 020 讲（第 010 分 P 标题贴错，已用本地 ASR 转写核对）'),
    '财务判断': ('tag-fact', '已核字幕', '第 026 – 031 讲'),
    '积累方法': ('tag-fact', '已核字幕', '第 056 – 062 讲'),
    '边界': ('tag-fact', '已核字幕', '第 016 · 022 – 024 讲'),
    '态度': ('tag-fact', '已核字幕', '第 066 – 080 讲'),
    '防御 · 106–116': ('tag-mid', '转写稿', '第 106 – 116 讲'),
    '天问 · 124–130': ('tag-mid', '转写稿', '第 124 – 130 讲'),
    '流向 · 131–138': ('tag-mid', '转写稿', '第 131 – 138 讲'),
}
V2_TAIL = '官方字幕逐句核对（7,068 句，覆盖 00:00:00 – 04:22:28）'


def tag_cards(html, mapping, v2=False):
    """在每个速览卡片 </div> 前插入来源行"""
    m = re.search(r'<section id="s0">(.*?)</section>', html, re.S)
    if not m:
        raise SystemExit('找不到 s0')
    block = m.group(1)
    out, pos = [], 0
    for c in re.finditer(r'<div class="card[^"]*">', block):
        start, end = c.start(), c.end()
        label_m = re.match(r'\s*<span class="tag">([^<]+)</span>', block[end:])
        if not label_m:
            continue
        label = label_m.group(1).strip()
        if label not in mapping:
            continue
        cls, txt, tail = mapping[label]
        close = block.index('</div>', end)
        card = block[start:close]
        card = card.rstrip() + '\n        <p class="card-src"><span class="tag %s">%s</span>%s</p>\n      ' % (cls, txt, tail)
        out.append(block[pos:start])
        out.append(card)
        pos = close
    out.append(block[pos:])
    newblock = ''.join(out)
    # 在 s0 的 sec-lead 之后插入置信度图例
    newblock = re.sub(r'(<p class="sec-lead">.*?</p>)', r'\1' + LEGEND, newblock, count=1, flags=re.S)
    return html[:m.start(1)] + newblock + html[m.end(1):]


def tag_idx_sub(html):
    html = html.replace(
        '<h3 class="idx-sub">正篇 · B 站合集 001 – 080<span>',
        '<h3 class="idx-sub"><span class="tag tag-fact">已核字幕</span>正篇 · B 站合集 001 – 080<span>', 1)
    html = html.replace(
        '<h3 class="idx-sub">续篇 · 转写仓编号 088 – 145<span>',
        '<h3 class="idx-sub"><span class="tag tag-mid">转写稿</span>续篇 · 转写仓编号 088 – 145<span>', 1)
    html = html.replace(
        '<h3 class="idx-sub">补遗 · 小宇宙 vol.146 – 155<span>',
        '<h3 class="idx-sub"><span class="tag tag-low">AI 概要</span>补遗 · 小宇宙 vol.146 – 155<span>', 1)
    return html


def tag_dup_rows(html):
    """第 010 / 019 两条索引补 ASR 复核标注"""
    hit = '<span class="tt">因信仰自由而享受自由</span>'
    if hit in html:
        html = html.replace(hit, '<span class="tt">因信仰自由而享受自由</span>'
                            '<span class="tag tag-mid">ASR 复核</span>', 1)
    old = '<div class="hd"><span class="no">19</span><span class="tt">性与权力</span>'
    new = ('<div class="hd"><span class="no">19</span><span class="tt">性与权力</span>'
           '<span class="tag tag-mid">ASR 复核</span>')
    html = html.replace(old, new, 1)
    return html


def process(key, mapping, v2):
    p = os.path.join(BUILD, key + '_proc.html')
    html = io.open(p, encoding='utf-8').read()
    before = html.count('class="tag tag-')
    html = tag_cards(html, mapping, v2)
    if key == 'vol1':
        html = tag_idx_sub(html)
        html = tag_dup_rows(html)
    io.open(p, 'w', encoding='utf-8', newline='\n').write(html)
    print('%s：置信度标注 %d → %d' % (key, before, html.count('class="tag tag-')))


process('vol1', V1_CARDS, False)
process('vol2', {k: ('tag-fact', '原话 · 已核', V2_TAIL) for k in
                 ['AI 个人操作系统', '零成本三件套', '决策方法', '商业观',
                  '健康', '财富观', '心态', '人生态度']}, True)
