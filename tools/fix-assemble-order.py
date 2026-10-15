# -*- coding: utf-8 -*-
"""把 assemble.py 里的 XSEC 块移到 bottomnav 之前，并在其前加 QQ 挂载点。
（产物页和三个 mjs 已由 move-xsec.py 处理；assemble.py 因为块裹在 `\"\"\"` 里、正则没含引号，单独修。）
"""
import io
import os
import re

P = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '_build', 'assemble.py')
s = io.open(P, encoding='utf-8').read()

m = re.search(r'[ \t]*"""<section class="xsec">[\s\S]*?""",\n', s)
if not m:
    raise SystemExit('❌ 找不到 XSEC 块（可能已移动过）')
block = m.group(0)
s = s[:m.start()] + s[m.end():]

anchor = "        '<div class=\"bottomnav\"><div class=\"bn-in\">\\n  ', cfg['prev'][0],"
if anchor not in s:
    raise SystemExit('❌ 找不到 bottomnav 锚点')
if 'qq-entry' in s:
    raise SystemExit('– 已有 QQ 挂载点，只做移动')
qq = "        '<div class=\"wrap\"><div id=\"qq-entry\"></div></div>\\n',\n"
s = s.replace(anchor, qq + block + anchor)

io.open(P, 'w', encoding='utf-8', newline='\n').write(s)

import ast
ast.parse(io.open(P, encoding='utf-8').read())
print('✅ assemble.py 已修正，语法通过')
