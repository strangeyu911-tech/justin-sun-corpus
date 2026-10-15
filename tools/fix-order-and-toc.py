# -*- coding: utf-8 -*-
"""孙割站收尾两件事：
① 顺序修正 —— 应是「QQ 群卡片 → 同一位作者的其他站点」，与 mirror-guide 一致。
   move-xsec.py 当时把两块拼反了。
② 目录补齐 —— 各页面侧栏目录里补一条「加 QQ 群 / 作者微信交流」（指向 #qq-entry）。
   首页已手工加过，这里兜住其余页面。

幂等。用法：python tools/fix-order-and-toc.py
"""
import io
import os
import re

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
FILES = [
    'index.html', '2016-2017-wealthfreedom.html', '2026-interview.html',
    'audit.html', 'takeaway.html', 'outlook.html', 'volume3.html',
    '_build/assemble.py', '_build/gen_vol3.mjs', '_build/gen_takeaway.mjs', '_build/gen_outlook.mjs',
]

swap = re.compile(r'([ \t]*<section class="xsec">[\s\S]*?</section>\n)([ \t]*<div class="wrap"><div id="qq-entry"></div></div>\n)')
toc_last = re.compile(r'(\n[ \t]*<a href="[^"]*" class="solo">[^<]*</a>)([\s\S]*?</nav>)')

for rel in FILES:
    p = os.path.join(ROOT, rel)
    if not os.path.exists(p):
        print('❌ 缺', rel)
        continue
    s = io.open(p, encoding='utf-8').read()
    before = s

    s, n = swap.subn(lambda m: m.group(2) + m.group(1), s)

    # 目录补条目：仅产物页（生成器里的目录来自 toc*.html，不在这里）
    if rel.endswith('.html'):
        idx = s.find('id="toc"')
        end = s.find('</nav>', idx) if idx >= 0 else -1
        if end > 0 and 'href="#qq-entry"' not in s[idx:end]:
            seg = s[idx:end]
            m = None
            for m in re.finditer(r'\n([ \t]*)<a href="[^"]*" class="solo">[^<]*</a>', seg):
                pass
            if m:
                s = s[:idx] + seg[:m.end()] + '\n' + m.group(1) + '<a href="#qq-entry" class="solo">加 QQ 群 / 作者微信交流</a>' + seg[m.end():] + s[end:]

    if s != before:
        io.open(p, 'w', encoding='utf-8', newline='\n').write(s)
        print(f'✅ {rel}  交换 {n} 处' + ('，并补目录项' if 'href="#qq-entry"' in s and 'href="#qq-entry"' not in before else ''))
    else:
        print(f'–  {rel}  无变化')
