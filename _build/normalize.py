# -*- coding: utf-8 -*-
"""把正文里遗留的行内 style 归一为工具类（不改视觉效果，只改实现方式）。"""
import io, os, re

ROOT = r"D:\workbuddy\Data\Agent-Reach\outputs\sunyuchen-site"
PAGES = ['index.html', '2016-2017-wealthfreedom.html', '2026-interview.html']

STYLE_MAP = {
    'margin:0': 'u-m0',
    'margin-top:0': 'u-mt0',
    'margin-top:14px': 'u-mt14',
    'margin-top:16px': 'u-mt16',
    'margin-bottom:14px': 'u-mb14',
    'color:var(--rose)': 'u-rose',
    'color:var(--rose);font-size:13px': 'u-rose-s',
    'color:var(--muted);font-size:13px': 'u-muted-s',
    'font-family:var(--serif);font-size:17px;margin:26px 0 10px': 'u-h17',
    'font-family:var(--serif);font-size:17px;margin:22px 0 10px': 'u-h17-t',
    'margin:0 0 12px;font-size:14.2px;color:var(--ink-2)': 'u-lead',
    'margin:0;font-size:14.2px;color:var(--ink-2)': 'u-lead-0',
}

TAG_RE = re.compile(r'<([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>')
STYLE_RE = re.compile(r'\sstyle="([^"]*)"')
CLASS_RE = re.compile(r'\sclass="([^"]*)"')

unmapped = set()
total = 0


def on_tag(m):
    global total
    name, attrs = m.group(1), m.group(2)
    sm = STYLE_RE.search(attrs)
    if not sm:
        return m.group(0)
    val = sm.group(1).strip().rstrip(';')
    cls = STYLE_MAP.get(val)
    if not cls:
        unmapped.add(sm.group(1).strip())
        return m.group(0)
    total += 1
    rest = attrs[:sm.start()] + attrs[sm.end():]
    cm = CLASS_RE.search(rest)
    if cm:
        rest = rest[:cm.start()] + ' class="%s %s"' % (cm.group(1), cls) + rest[cm.end():]
    else:
        rest = rest.rstrip() + ' class="%s"' % cls
    return '<%s%s>' % (name, rest)


for p in PAGES:
    path = os.path.join(ROOT, p)
    s = io.open(path, encoding='utf-8').read()
    before = len(re.findall(r'\sstyle="', s))
    s2 = TAG_RE.sub(on_tag, s)
    after = len(re.findall(r'\sstyle="', s2))
    io.open(path, 'w', encoding='utf-8', newline='\n').write(s2)
    print('%-34s 行内样式 %3d → %3d' % (p, before, after))

print('共替换 %d 处；未映射残留：%s' % (total, sorted(unmapped) if unmapped else '无'))
