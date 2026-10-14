# -*- coding: utf-8 -*-
"""站点自检：结构、目录对齐、置信度覆盖、链接与资源、格式一致性。"""
import io, os, re, json, collections

ROOT = r"D:\workbuddy\Data\Agent-Reach\outputs\sunyuchen-site"
PAGES = ["index.html", "2016-2017-wealthfreedom.html", "2026-interview.html", "audit.html"]
EXIST = [p for p in PAGES if os.path.exists(os.path.join(ROOT, p))]

TAGS = ['div', 'section', 'p', 'li', 'ul', 'ol', 'h1', 'h2', 'h3', 'h4',
        'blockquote', 'cite', 'span', 'a', 'table', 'tr', 'td', 'th',
        'nav', 'main', 'header', 'footer', 'button', 'svg', 'mark']

out = {}
ids = {}

def strip_scripts(html):
    html = re.sub(r'<script.*?</script>', '', html, flags=re.S)
    html = re.sub(r'<style.*?</style>', '', html, flags=re.S)
    return html


def accessible_names(clean):
    """找出「无可访问名称」的按钮与链接（图标按钮必须带 aria-label）"""
    bad_btn, bad_a = [], []
    for m in re.finditer(r'<button\b([^>]*)>(.*?)</button>', clean, re.S):
        attrs, inner = m.group(1), m.group(2)
        text = re.sub(r'<[^>]+>', '', inner).strip()
        if not text and 'aria-label=' not in attrs:
            bad_btn.append(attrs[:70])
    for m in re.finditer(r'<a\b([^>]*)>(.*?)</a>', clean, re.S):
        attrs, inner = m.group(1), m.group(2)
        text = re.sub(r'<[^>]+>', '', inner).strip()
        if not text and 'aria-label=' not in attrs and 'title=' not in attrs:
            bad_a.append(attrs[:70])
    return bad_btn, bad_a

for page in EXIST:
    html = io.open(os.path.join(ROOT, page), encoding='utf-8').read()
    clean = strip_scripts(html)
    st = collections.OrderedDict()
    for t in TAGS:
        o = len(re.findall(r'<%s[ >]' % t, clean))
        c = len(re.findall(r'</%s>' % t, clean))
        st[t] = (o, c, o - c)
    pid = re.findall(r'\sid="([^"]+)"', clean)
    dup = [k for k, v in collections.Counter(pid).items() if v > 1]
    ids[page] = set(pid)
    out[page] = dict(
        size=len(html.encode('utf-8')),
        chars=len(html),
        lines=html.count('\n') + 1,
        tags=st,
        ids=len(pid),
        dup_ids=dup,
        sections=len(re.findall(r'<section id="', clean)),
        toc_links=len(re.findall(r'class="(?:lvl2|lvl3|solo|toc-title-link)"', clean)),
        n_tag_fact=len(re.findall(r'class="tag tag-fact"', clean)),
        n_tag_mid=len(re.findall(r'class="tag tag-mid"', clean)),
        n_tag_low=len(re.findall(r'class="tag tag-low"', clean)),
        n_topic_tag=len(re.findall(r'<span class="tag">', clean)),
        n_cite=len(re.findall(r'<cite>', clean)),
        n_cite_tagged=len(re.findall(r'<cite>.*?<span class="tag ', clean, re.S)),
        n_card=len(re.findall(r'<div class="card', clean)),
        n_idxrow=len(re.findall(r'<div class="row"', clean)),
        n_inline_style=len(re.findall(r'style="', clean)),
        n_btn_noname=len(accessible_names(clean)[0]),
        n_a_noname=len(accessible_names(clean)[1]),
        n_img=len(re.findall(r'<img', clean)),
        n_img_alt=len(re.findall(r'<img[^>]*alt=', clean)),
        n_btn=len(re.findall(r'<button', clean)),
        n_btn_aria=len(re.findall(r'<button[^>]*aria-label=', clean)),
        n_a_ext=len(re.findall(r'<a [^>]*target="_blank"', clean)),
        n_a_ext_rel=len(re.findall(r'<a [^>]*target="_blank"[^>]*rel=', clean)),
        n_table=len(re.findall(r'<table', clean)),
        n_tablewrap=len(re.findall(r'class="tablewrap"', clean)),
    )

# 目录对齐：页面里 class="lvl2" 等 href 指向的 id 是否都存在
align = {}
for page in ['2016-2017-wealthfreedom.html', '2026-interview.html']:
    if page not in EXIST:
        continue
    html = io.open(os.path.join(ROOT, page), encoding='utf-8').read()
    clean = strip_scripts(html)
    m = re.search(r'<nav id="toc".*?</nav>', clean, re.S)
    hrefs = re.findall(r'href="#([^"]+)"', m.group(0))
    missing = [h for h in hrefs if h not in ids[page]]
    # 反向：section 是否都在目录里
    secs = re.findall(r'<section id="(s\d+)"', clean)
    notoc = [s for s in secs if s not in hrefs]
    align[page] = dict(hrefs=len(hrefs), missing=missing, secs=len(secs), notoc=notoc)

# 站内检索索引核对
idx_report = {}
ip = os.path.join(ROOT, 'index.html')
if os.path.exists(ip):
    html = io.open(ip, encoding='utf-8').read()
    m = re.search(r'window\.SITE_INDEX=\[(.*?)\n\];', html, re.S)
    if m:
        arr = json.loads('[' + m.group(1) + ']')
        bad = []
        for it in arr:
            f, _, a = it['u'].partition('#')
            if f not in EXIST:
                bad.append((it['u'], '文件不存在'))
                continue
            if a and a not in ids.get(f, set()):
                bad.append((it['u'], '锚点不存在'))
        cnt = collections.Counter(it['v'] for it in arr)
        idx_report = dict(total=len(arr), by_vol=dict(cnt), bad=bad)

# 资源引用是否存在
assets = {}
for page in EXIST:
    html = io.open(os.path.join(ROOT, page), encoding='utf-8').read()
    for r in re.findall(r'(?:href|src)="((?!https?:|data:|#)[^"]+)"', html):
        p = os.path.join(ROOT, r.split('#')[0].split('?')[0])
        assets.setdefault(r, []).append(os.path.exists(p))

print(json.dumps(dict(pages=out, align=align, index=idx_report,
                      assets={k: all(v) for k, v in assets.items()}),
                 ensure_ascii=False, indent=1))
