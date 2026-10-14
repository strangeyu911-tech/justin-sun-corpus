#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
sync_audit.py — 把 audit.html 里的「实测数字」按真实产物重新生成。

为什么需要它：审计报告的最基本要求是「报告里的数字与产物一致」。
手工抄数字迟早漂移（本站已经漂移过一次：品牌文案缩短后三页字节数变化，
A0 审计对象表还停在旧值）。这个脚本让数字由产物直接推导，杜绝这一类错误。

数据来源：
  · _build/validate_out.json  —— 三页的字节/行数/板块数/目录链接数/标签数/引语数
  · 直接 stat assets/site.css、assets/site.js（validate 不统计它们）

约定：行数沿用 validate.py 的口径 `html.count('\\n') + 1`，
      字节数一律用文件真实大小（十进制千字节换算，与页面文案一致）。

用法：
    python _build/sync_audit.py            # 就地改写 audit.html
    python _build/sync_audit.py --check    # 只报告差异，不写文件（退出码 1 表示有差异）
"""
import io
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
AUDIT = os.path.join(ROOT, 'audit.html')
VALIDATE_OUT = os.path.join(HERE, 'validate_out.json')

PAGES = [
    ('index.html', '首页'),
    ('2016-2017-wealthfreedom.html', '卷一'),
    ('2026-interview.html', '卷二'),
]
ASSETS = ['assets/site.css', 'assets/site.js']


def size_and_lines(path):
    with io.open(path, 'r', encoding='utf-8', newline='') as f:
        data = f.read()
    return os.path.getsize(path), data.count('\n') + 1


def collect():
    with io.open(VALIDATE_OUT, 'r', encoding='utf-8') as f:
        v = json.load(f)

    rows = []
    for fname, _label in PAGES:
        p = v['pages'][fname]
        tags = p['n_tag_fact'] + p['n_tag_mid'] + p['n_tag_low']
        cites = '%d / %d' % (p['n_cite_tagged'], p['n_cite']) if p['n_cite'] else '—'
        rows.append({
            'file': fname,
            'size': p['size'],
            'lines': p['lines'],
            'secs': p['sections'],
            'toc': p['toc_links'] or '—',
            'tags': tags,
            'cites': cites,
        })

    for fname in ASSETS:
        full = os.path.join(ROOT, fname.replace('/', os.sep))
        sz, ln = size_and_lines(full)
        rows.append({'file': fname, 'size': sz, 'lines': ln,
                     'secs': '—', 'toc': '—', 'tags': '—', 'cites': '—'})

    total = {
        'size': sum(r['size'] for r in rows),
        'lines': sum(r['lines'] for r in rows),
        'secs': sum(r['secs'] for r in rows if isinstance(r['secs'], int)),
        'toc': sum(r['toc'] for r in rows if isinstance(r['toc'], int)),
        'tags': sum(r['tags'] for r in rows if isinstance(r['tags'], int)),
        'cites': '%d / %d' % (
            sum(int(r['cites'].split('/')[0]) for r in rows if r['cites'] != '—'),
            sum(int(r['cites'].split('/')[1]) for r in rows if r['cites'] != '—'),
        ),
    }
    return rows, total


def render_rows(rows, total):
    out = []
    for r in rows:
        fmt = lambda x: ('{:,}'.format(x) if isinstance(x, int) else x)
        out.append('        <tr><td><code>%s</code></td><td>%s</td><td>%s</td>'
                   '<td>%s</td><td>%s</td><td>%s</td><td>%s</td></tr>'
                   % (r['file'], fmt(r['size']), fmt(r['lines']), fmt(r['secs']),
                      fmt(r['toc']), fmt(r['tags']), r['cites']))
    fmt = lambda x: ('{:,}'.format(x) if isinstance(x, int) else x)
    out.append('        <tr><td><b>合计</b></td><td><b>%s</b></td><td><b>%s</b></td>'
               '<td><b>%s</b></td><td><b>%s</b></td><td><b>%s</b></td><td><b>%s</b></td></tr>'
               % tuple(fmt(total[k]) for k in ('size', 'lines', 'secs', 'toc', 'tags', 'cites')))
    return '\n'.join(out)


def rewrite(html, rows, total):
    """把 A0 审计对象表的行块、A6 体积卡的三个数字换成实测值。

    每一次替换都用 subn 并断言命中 1 次 —— 模板一改就立刻报错，
    绝不允许「正则没匹配上但脚本默默通过」这种情况发生
    （这正是本站数字漂移过一次的原因）。
    """
    def must(pattern, repl, src, what):
        new, n = re.subn(pattern, repl, src, count=1, flags=re.S)
        if n != 1:
            raise SystemExit('!! 替换失败（命中 %d 次）：%s\n   正则：%s' % (n, what, pattern))
        return new

    new_block = render_rows(rows, total)

    # —— A0 审计对象表：从 <code>index.html</code> 那一行到「合计」行 ——
    # 正则连同行首缩进一起吃掉，再整块吐回 new_block（其首行自带 8 空格缩进），
    # 否则每跑一次就会在行首多堆一层缩进（非幂等）。
    html = must(
        r'[ \t]*<tr><td><code>index\.html</code></td>.*?<tr><td><b>合计</b></td>.*?</tr>',
        new_block, html, 'A0 审计对象清单（7 列表格）')

    html_total = sum(r['size'] for r in rows if r['file'] in dict(PAGES))
    shared = sum(r['size'] for r in rows if r['file'] in ASSETS)
    css = [r for r in rows if r['file'] == 'assets/site.css'][0]
    js = [r for r in rows if r['file'] == 'assets/site.js'][0]
    g = lambda n: '{:,}'.format(n)

    # A6 体积卡标题：3 页共 N KB，共享资源 M KB（十进制千字节，四舍五入）
    html = must(r'3 页共 [\d,]+ KB，共享资源 [\d,]+ KB',
                '3 页共 %d KB，共享资源 %d KB' % (round(html_total / 1000), round(shared / 1000)),
                html, 'A6 体积卡标题')

    # A6 体积卡正文
    html = must(
        r'HTML 合计 [\d,]+ B；<code>site\.css</code> [\d,]+ B \+ <code>site\.js</code> [\d,]+ B，\s*'
        r'三页加共享资源共 <b>[\d,]+ B</b>。',
        'HTML 合计 %s B；<code>site.css</code> %s B + <code>site.js</code> %s B，\n        '
        '三页加共享资源共 <b>%s B</b>。'
        % (g(html_total), g(css['size']), g(js['size']), g(html_total + shared)),
        html, 'A6 体积卡正文')
    return html


def main():
    check_only = '--check' in sys.argv
    rows, total = collect()
    with io.open(AUDIT, 'r', encoding='utf-8', newline='') as f:
        html = f.read()
    new = rewrite(html, rows, total)

    label = {r['file']: r for r in rows}
    print('实测：HTML %s B / 共享 %s B / 合计 %s B'
          % ('{:,}'.format(sum(label[f]['size'] for f, _ in PAGES)),
             '{:,}'.format(sum(label[f]['size'] for f in ASSETS)),
             '{:,}'.format(total['size'])))
    for f, _ in PAGES + [('assets/site.css', ''), ('assets/site.js', '')]:
        r = label[f]
        print('  %-32s %8s B  %5s 行  板块 %s  目录 %s  标签 %s  引语 %s'
              % (r['file'], '{:,}'.format(r['size']), '{:,}'.format(r['lines']),
                 r['secs'], r['toc'], r['tags'], r['cites']))

    if new == html:
        print('audit.html 数字已是最新，无需改动。')
        return 0
    if check_only:
        print('!! audit.html 数字与实测不一致（--check 不写文件）')
        return 1
    with io.open(AUDIT, 'w', encoding='utf-8', newline='') as f:
        f.write(new)
    print('audit.html 已同步为实测数字。')
    return 0


if __name__ == '__main__':
    sys.exit(main())
