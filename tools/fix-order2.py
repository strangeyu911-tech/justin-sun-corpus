# -*- coding: utf-8 -*-
"""孙割站收尾：① 修正顺序（应为「QQ 群卡片 → 同一位作者的其他站点」）
            ② 各页侧栏目录补一条「加 QQ 群 / 作者微信交流」

⚠️ 2026-10-16 起 ② 已降级为**兜底**：生成器（_build/build.py 的 build_toc、
   _build/gen_vol3|takeaway|outlook.mjs 的 TOC 模板）已直接固化该条目，重建即自带。
   本脚本的 ② 有 `'href="#qq-entry"' not in seg` 守卫，不会重复插；位置是目录末尾，
   与生成器一致。当初首页那条是手工加的、错插在「06」和「卷一」之间，才导致七页不统一。

幂等。用法：python tools/fix-order2.py
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
SWAP = re.compile(
    r'([ \t]*<section class="xsec">[\s\S]*?</section>\n)'
    r'([ \t]*<div class="wrap"><div id="qq-entry"></div></div>\n)'
)
LINK = re.compile(r'<a href="[^"]*" class="solo">[^<]*</a>')
QQ_ITEM = '<a href="#qq-entry" class="solo">加 QQ 群 / 作者微信交流</a>'

for rel in FILES:
    p = os.path.join(ROOT, rel)
    if not os.path.exists(p):
        print('❌ 缺', rel)
        continue
    s = io.open(p, encoding='utf-8').read()
    before = s
    notes = []

    s2, n = SWAP.subn(lambda m: m.group(2) + m.group(1), s)
    if n:
        notes.append(f'顺序交换 {n} 处')
    s = s2

    if rel.endswith('.html'):
        i = s.find('id="toc"')
        j = s.find('</nav>', i) if i >= 0 else -1
        if i >= 0 and j > i:
            seg = s[i:j]
            links = list(LINK.finditer(seg))
            if links and 'href="#qq-entry"' not in seg:
                last = links[-1]
                # 取该行行首缩进
                ls = seg.rfind('\n', 0, last.start())
                indent = seg[ls + 1:last.start()] if ls >= 0 else ''
                ins = f'\n{indent}{QQ_ITEM}'
                s = s[:i + last.end()] + ins + s[i + last.end():]
                notes.append('目录补 QQ 项')

    if s != before:
        io.open(p, 'w', encoding='utf-8', newline='\n').write(s)
        print(f'✅ {rel}  ' + '、'.join(notes))
    else:
        print(f'–  {rel}  无变化')

# 语法自检
import ast
ast.parse(io.open(os.path.join(ROOT, '_build', 'assemble.py'), encoding='utf-8').read())
print('\nassemble.py 语法 OK')
