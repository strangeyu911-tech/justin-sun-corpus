# -*- coding: utf-8 -*-
"""从两份原始总结页抽取 <main> 正文，供站点重建使用。"""
import io, os, re, sys

SRC = r"D:\workbuddy\Data\Agent-Reach\outputs"
OUT = r"D:\workbuddy\Data\Agent-Reach\outputs\sunyuchen-site\_build"
os.makedirs(OUT, exist_ok=True)

FILES = {
    "vol1": os.path.join(SRC, "wealthfreedom", "孙宇晨_财富自由革命之路_80讲总结.html"),
    "vol2": os.path.join(SRC, "sunyuchentalk", "对话孙宇晨_4小时访谈总结.html"),
}

report = []
for key, path in FILES.items():
    html = io.open(path, encoding="utf-8").read()
    n_main_open = len(re.findall(r"<main[ >]", html))
    n_main_close = html.count("</main>")
    i = html.index("<main>") + len("<main>")
    j = html.rindex("</main>")
    body = html[i:j]
    secs = re.findall(r"<section id=\"(s\d+)\"", body)
    # 每个 section 的 h2 文本
    heads = []
    for sid in secs:
        k = body.index('<section id="%s"' % sid)
        h2 = re.search(r"<h2[^>]*>(.*?)</h2>", body[k:], re.S)
        heads.append((sid, re.sub(r"<[^>]+>", "", h2.group(1)).strip()[:60] if h2 else "<no h2>"))
    io.open(os.path.join(OUT, key + "_main.html"), "w", encoding="utf-8", newline="\n").write(body)
    report.append((key, os.path.basename(path), len(html), n_main_open, n_main_close,
                   len(body), len(secs), heads))

for key, name, sz, mo, mc, bsz, nsec, heads in report:
    print("=" * 70)
    print("[%s] %s" % (key, name))
    print("  源文件 %d B | <main> ×%d | </main> ×%d | 正文 %d B | section ×%d"
          % (sz, mo, mc, bsz, nsec))
    for sid, t in heads:
        print("    %-5s %s" % (sid, t))
