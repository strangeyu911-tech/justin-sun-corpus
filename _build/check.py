#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
check.py — 一条命令跑完「六项自检 + 数字一致性」，并给人看的结论。

为什么要有它：audit.html 的 A8 节写着「六项必跑、脚本随仓库发布、可复跑」。
但 validate.py 只吐一份 JSON，人不看 JSON 就看不出过没过；
在此之前那句「六项全部通过」是我在终端里临时拼出来的，**不可复跑**。
这个脚本把那句话变成可执行的东西。

它做的事：
  1. 跑 validate.py → 覆盖写 _build/validate_out.json
  2. 读回来，逐项判定六条自检 + 资源存在性
  3. 跑 sync_audit.py --check，确认审计页数字没与产物脱节
  4. 打印分页清单与 PASS/FAIL，退出码 0 = 全过

用法：
    python _build/check.py
"""
import io
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
PY = sys.executable
OUT = os.path.join(HERE, 'validate_out.json')

PAGES = ['index.html', '2016-2017-wealthfreedom.html', '2026-interview.html']


def run(args, **kw):
    return subprocess.run([PY] + args, cwd=HERE, capture_output=True, text=True, **kw)


def main():
    # —— 1. 跑 validate.py ——
    with io.open(OUT, 'w', encoding='utf-8', newline='') as f:
        r = subprocess.run([PY, os.path.join(HERE, 'validate.py')],
                           cwd=HERE, stdout=f, stderr=subprocess.PIPE, text=True)
    if r.returncode != 0:
        print('validate.py 自身异常退出（exit %d）：\n%s' % (r.returncode, r.stderr))
        return 2

    with io.open(OUT, 'r', encoding='utf-8') as f:
        v = json.load(f)

    checks = []

    # —— 2. 六项自检 ——
    bad_bal = [p for p, d in v['pages'].items()
               if any(x[2] != 0 for x in d['tags'].values())]
    checks.append(('标签平衡（24 类开闭差值全为 0）', not bad_bal,
                   '不平衡：%s' % bad_bal if bad_bal else '24 类全部配平'))

    bad_toc = [p for p, a in v['align'].items() if a['missing'] or a['notoc']]
    checks.append(('目录双向对齐（无悬空 / 无孤立）', not bad_toc,
                   'href 合计 %d 条，悬空与孤立均为 0'
                   % sum(a['hrefs'] for a in v['align'].values())))

    idx = v['index']
    checks.append(('站内检索索引锚点全部存在', not idx['bad'],
                   '%d 条索引，失效 0 条（%s）'
                   % (idx['total'], ' / '.join('%s %d' % kv for kv in idx['by_vol'].items()))))

    bad_cite = [p for p, d in v['pages'].items() if d['n_cite'] != d['n_cite_tagged']]
    tot_cite = sum(d['n_cite'] for d in v['pages'].values())
    checks.append(('引语全部带出处标签', not bad_cite,
                   '%d / %d 带标签' % (sum(d['n_cite_tagged'] for d in v['pages'].values()), tot_cite)))

    bad_style = [p for p, d in v['pages'].items() if d['n_inline_style']]
    checks.append(('行内 style 归零', not bad_style,
                   '四页行内 style 计数均为 0' if not bad_style else '残留：%s' % bad_style))

    bad_name = [p for p, d in v['pages'].items() if d['n_btn_noname'] or d['n_a_noname']]
    checks.append(('可访问名称齐备', not bad_name,
                   '无名按钮 / 无名链接均为 0' if not bad_name else '缺名：%s' % bad_name))

    bad_asset = [k for k, ok in v['assets'].items() if not ok]
    checks.append(('被引用的资源全部存在', not bad_asset,
                   '%d 个引用全部命中' % len(v['assets']) if not bad_asset else '缺失：%s' % bad_asset))

    # —— 3. 数字一致性 ——
    a = run([os.path.join(HERE, 'sync_audit.py'), '--check'])
    checks.append(('audit.html 数字与产物一致', a.returncode == 0,
                   'A0 表格与 A6 体积卡均为实测值' if a.returncode == 0
                   else '存在偏差（跑 sync_audit.py 修）'))

    # —— 4. 分页清单 ——
    print('分页实测')
    print('  %-30s %10s %7s %6s %6s %6s %8s' % ('文件', '字节', '行数', '板块', '目录', '标签', '引语'))
    for p in PAGES:
        d = v['pages'][p]
        tags = d['n_tag_fact'] + d['n_tag_mid'] + d['n_tag_low']
        cites = ('%d / %d' % (d['n_cite_tagged'], d['n_cite'])) if d['n_cite'] else '—'
        print('  %-30s %10s %7s %6d %6s %6d %8s'
              % (p, '{:,}'.format(d['size']), '{:,}'.format(d['lines']), d['sections'],
                 d['toc_links'] or '—', tags, cites))

    print()
    print('自检结论')
    ok = True
    for name, passed, detail in checks:
        ok = ok and passed
        print('  [%s] %-28s %s' % ('PASS' if passed else 'FAIL', name, detail))
    print()
    print('自检：%s' % ('全部通过' if ok else '存在未通过项'))
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main())
