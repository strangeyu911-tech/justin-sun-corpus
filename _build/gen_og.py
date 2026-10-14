# -*- coding: utf-8 -*-
"""生成 1200×630 社交分享封面 assets/og.png"""
import os
from PIL import Image, ImageDraw, ImageFont

OUT = r"D:\workbuddy\Data\Agent-Reach\outputs\sunyuchen-site\assets\og.png"
W, H = 1200, 630
BG = (251, 250, 248)
INK = (23, 24, 26)
INK2 = (61, 64, 70)
MUTED = (113, 117, 125)
FAINT = (154, 160, 168)
TEAL = (15, 118, 110)
TEAL_SOFT = (230, 244, 241)
GOLD_SOFT = (253, 243, 227)
GOLD = (180, 83, 9)
LINE = (231, 227, 220)

BD = "C:/Windows/Fonts/msyhbd.ttc"
RG = "C:/Windows/Fonts/msyh.ttc"


def f(path, size):
    return ImageFont.truetype(path, size, index=0)


img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)

# 顶部三色细条（对应置信度三档）
bar = [(47, 111, 94), (138, 109, 47), (154, 74, 58)]
seg = W // 3
for i, c in enumerate(bar):
    d.rectangle([i * seg, 0, (i + 1) * seg if i < 2 else W, 8], fill=c)

# 右侧柔光块
d.ellipse([760, -180, 1420, 400], fill=(234, 250, 246))
d.ellipse([880, 250, 1500, 800], fill=GOLD_SOFT)

# 站点标记
x, y, s = 80, 92, 86
d.rounded_rectangle([x, y, x + s, y + s], radius=20, fill=TEAL)
d.polygon([(x + 34, y + 26), (x + 34, y + 60), (x + 62, y + 43)], fill=(251, 250, 248))
for dx in (14, 24):
    d.line([x + dx, y + 36, x + dx, y + 50], fill=(251, 250, 248), width=4)
for dx in (62, 72):
    d.line([x + dx, y + 36, x + dx, y + 50], fill=(251, 250, 248), width=4)

d.text((80, 218), "孙宇晨语料库", font=f(BD, 66), fill=INK)
d.text((82, 312), "2016–17《财富自由革命之路》全 156 集  ×  2026 年 4 小时长访谈",
       font=f(RG, 28), fill=INK2)

d.line([80, 386, 1120, 386], fill=LINE, width=2)

chips = [("卷一 · 2016–2017", TEAL_SOFT, TEAL),
         ("卷二 · 2026", TEAL_SOFT, TEAL),
         ("40 个板块 · 141 处置信度标注", GOLD_SOFT, GOLD)]
cx = 80
for text, bg, fg in chips:
    tw = d.textlength(text, font=f(RG, 22))
    d.rounded_rectangle([cx, 424, cx + tw + 40, 472], radius=24, fill=bg)
    d.text((cx + 20, 437), text, font=f(RG, 22), fill=fg)
    cx += tw + 56

d.text((80, 516), "按年份分卷 · 逐板块标注证据等级 · 与官方字幕逐句核对",
       font=f(RG, 23), fill=MUTED)
d.text((80, 558), "github.com/strangeyu911-tech/justin-sun-corpus",
       font=f(RG, 19), fill=FAINT)

img.save(OUT, "PNG", optimize=True)
print("写出 %s  %d×%d  %d B" % (OUT, W, H, os.path.getsize(OUT)))
