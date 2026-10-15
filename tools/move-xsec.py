# -*- coding: utf-8 -*-
"""孙割站：把「同一位作者的其他站点」搬到「上一卷/下一卷」那条底部栏**之前**，
并在它前面插入 QQ 群 / 作者微信的挂载点。

为什么：`.bottomnav` 是 `position:sticky;bottom:0`、父元素就是 body，
它 sticky 时会盖住文档里排在它后面的内容 —— 引流区之前被插在它后面，所以看着"歪"。
正确顺序是：正文 → QQ 群卡片 → 引流区 → bottomnav → footer。

统一处理 7 个产物页 + 4 个生成器（assemble.py / gen_vol3 / gen_takeaway / gen_outlook）。
幂等。用法：python tools/move-xsec.py
"""
import io
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..')

FILES = [
    'index.html', '2016-2017-wealthfreedom.html', '2026-interview.html',
    'audit.html', 'takeaway.html', 'outlook.html', 'volume3.html',
    '_build/assemble.py', '_build/gen_vol3.mjs', '_build/gen_takeaway.mjs', '_build/gen_outlook.mjs',
]

QQ_SLOT = '<div class="wrap"><div id="qq-entry"></div></div>'

block_re = re.compile(r'[ \t]*<section class="xsec">[\s\S]*?</section>\n')
slot_re = re.compile(r'([ \t]*)<div class="bottomnav">|<div class="bottomnav">|(<footer>)')

changed = 0
for rel in FILES:
    p = os.path.join(ROOT, rel)
    if not os.path.exists(p):
        print('❌ 缺文件', rel)
        continue
    s = io.open(p, encoding='utf-8').read()
    before = s

    m = block_re.search(s)
    if not m:
        print('–  ' + rel + '  没有 xsec 块，跳过')
        continue
    block = m.group(0)
    s = s[:m.start()] + s[m.end():]

    # 目标位置：<div class="bottomnav"> 之前；没有就退到 <footer> 之前
    idx = s.find('<div class="bottomnav">')
    if idx >= 0:
        anchor_len = 0
    else:
        idx = s.find('<footer>')
        anchor_len = 0
    if idx < 0:
        print('❌ ' + rel + ' 找不到锚点，未改动')
        continue

    # 对齐缩进：产物页顶格，assemble.py 里要带 8 空格缩进
    indent_m = re.search(r'\n([ \t]*)<div class="bottomnav">', s)
    indent = indent_m.group(1) if indent_m else ''
    block_body = block.rstrip('\n')
    if indent:
        block_body = '\n'.join(indent + ln if ln.strip() else ln for ln in block_body.split('\n'))

    ins = block_body + '\n' + indent + QQ_SLOT + '\n'
    s = s[:idx] + ins + s[idx:]

    # 顺手把 QQ_CONFIG 的 siteName 去掉（若还在）
    s = s.replace("<script>window.QQ_CONFIG={siteName:'孙割这十年',wxNote:'孙割这十年'};</script>",
                  "<script>window.QQ_CONFIG={wxNote:'孙割这十年'};</script>")

    if s != before:
        io.open(p, 'w', encoding='utf-8', newline='\n').write(s)
        changed += 1
        print('✅ ' + rel + '  ' + str(len(before)) + ' → ' + str(len(s)))

print(f'\n改了 {changed} 个文件')
