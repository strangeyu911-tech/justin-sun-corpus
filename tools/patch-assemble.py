# -*- coding: utf-8 -*-
"""在 justin-sun-corpus/_build/assemble.py 的 parts 列表里，footer 之前插入
「同一位作者的其他站点」引流区；顺带修复一次误编辑造成的两行粘连。

幂等：已含 xsec 的跳过。
"""
import io
import re
import os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..')
P = os.path.join(ROOT, '_build', 'assemble.py')

SECTION = '''        """<section class="xsec">
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
'''

s = io.open(P, encoding='utf-8').read()
if 'xsec' in s:
    print('已就位，无需改动')
else:
    pat = re.compile(r"(\n)([ \t]*)(foot_of\(key, cfg\['foot_intro'\], ntag, ncite\),)[ \t]*(')")
    s2, n = pat.subn(lambda m: m.group(1) + SECTION + m.group(2) + m.group(3) + '\n' + m.group(2) + m.group(4), s)
    if n != 1:
        raise SystemExit(f'❌ 预期命中 1 处，实际 {n} 处 —— 未改动')
    io.open(P, 'w', encoding='utf-8', newline='\n').write(s2)
    print(f'✅ assemble.py 已插入引流区（命中 {n} 处）')

# 顺带把 QQ_CONFIG 的 siteName 去掉（生成器里也要同步）
s = io.open(P, encoding='utf-8').read()
old_cfg = """<script>window.QQ_CONFIG={siteName:\\'孙割这十年\\',wxNote:\\'孙割这十年\\'};</script>"""
new_cfg = """<script>window.QQ_CONFIG={wxNote:\\'孙割这十年\\'};</script>"""
if old_cfg in s:
    io.open(P, 'w', encoding='utf-8', newline='\n').write(s.replace(old_cfg, new_cfg))
    print('✅ assemble.py 的 QQ_CONFIG 已简化')
else:
    print('–  assemble.py 的 QQ_CONFIG 无需改动')
