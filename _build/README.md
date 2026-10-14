# 构建与自检流水线

这些脚本把两卷的原始总结页重建成本站，并输出审计页用到的全部实测数据。

## 输入依赖

流水线的输入是**两份本地的原始总结页**（不在本仓库内，路径写死在 `extract.py` 与 `assemble.py` 顶部）：

```
<...>/outputs/wealthfreedom/孙宇晨_财富自由革命之路_80讲总结.html   # 卷一原始稿
<...>/outputs/sunyuchentalk/对话孙宇晨_4小时访谈总结.html          # 卷二原始稿
```

要让别人也能复跑，改这两个绝对路径即可。中间产物（`*_main.html` / `*_proc.html` / `*_foot.html`）
不入库，按下面顺序跑一遍就会重新生成。

## 顺序

```bash
python extract.py     # 从两份原始稿抽出 <main> 正文 → vol1_main.html / vol2_main.html
python build.py       # 挂板块来源徽章 + 给每条 <cite> 分档        → vol1_proc.html / vol2_proc.html
python annotate.py    # 速览卡片、索引分组、存疑条目补标注
python assemble.py    # 组装 index / 卷一 / 卷二 三页（复用 build.py 的 head/topbar/目录）
python normalize.py   # 把行内 style 归一为工具类
python validate.py    # 输出 audit.html 用到的全部实测数据 → validate_out.json
python gen_og.py      # 生成 1200×630 社交分享封面（需 Pillow）
```

## 各脚本做什么

| 脚本 | 职责 |
|---|---|
| `extract.py` | 抽取 `<main>` 正文，顺带打印每份稿的 section 清单（人工核对用） |
| `build.py` | 定义三级置信度口径与 40 个板块的来源分级；构建抽屉式目录；给引语按讲号机械分档 |
| `annotate.py` | 速览卡片来源行、逐讲索引三块分组徽章、第 010/019 两条的 ASR 复核标注 |
| `assemble.py` | 组装页头 / 顶部栏 / 目录 / hero / 正文 / 底部导航 / 页脚；逐页 canonical |
| `normalize.py` | 13 种行内 style → 12 个工具类（不改视觉，只改实现） |
| `validate.py` | 标签平衡、目录双向对齐、检索锚点、引语覆盖、行内样式、可访问名称 + 资源存在性 |
| `gen_og.py` | 纯 Pillow 绘制分享封面 |

## 自检六项（`validate.py`）

1. 24 类 HTML 标签开闭差值必须全为 0
2. 目录 href 无悬空、section 无孤立
3. 站内检索索引的文件与锚点全部存在
4. `<cite>` 数量 = 带置信度标签的 `<cite>` 数量
5. 三页行内 `style` 计数为 0
6. 无可访问名称的按钮与链接均为 0

任何一次改动后重跑第 7 步，若数字偏移，`audit.html` 必须同步更新——否则审计报告本身就成了不实陈述。
