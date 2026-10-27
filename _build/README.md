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
python validate.py    # 输出全部实测数据 → validate_out.json
python sync_audit.py  # 用实测数据回填 audit.html 的数字（幂等；未命中即报错）
python check.py       # 一条命令跑完「六项自检 + 数字一致性」并打印结论
python gen_og.py      # 生成 1200×630 社交分享封面（需 Pillow）
```

> 交付前只需跑 `python check.py`：它会自己调用 `validate.py` 与 `sync_audit.py --check`，
> 八项全绿才说明可以推。退出码非 0 即未通过。

## 各脚本做什么

| 脚本 | 职责 |
|---|---|
| `extract.py` | 抽取 `<main>` 正文，顺带打印每份稿的 section 清单（人工核对用） |
| `build.py` | 定义三级置信度口径与 40 个板块的来源分级；构建抽屉式目录；给引语按讲号机械分档 |
| `annotate.py` | 速览卡片来源行、逐讲索引三块分组徽章、第 010/019 两条的 ASR 复核标注 |
| `assemble.py` | 组装页头 / 顶部栏 / 目录 / hero / 正文 / 底部导航 / 页脚；逐页 canonical |
| `normalize.py` | 13 种行内 style → 12 个工具类（不改视觉，只改实现） |
| `validate.py` | 标签平衡、目录双向对齐、检索锚点、引语覆盖、行内样式、可访问名称 + 资源存在性 |
| `sync_audit.py` | 把 `validate_out.json` 与产物真实字节数回填进 `audit.html`（A0 表格 + A6 体积卡） |
| `check.py` | 调用上面两个脚本并判定结论，打印 PASS/FAIL 清单（退出码 0 = 可交付） |
| `accept.mjs` | Playwright 驱动本机 Edge 跑 17 条**真交互**断言（搜索/分享/日夜/抽屉目录/进度条） |
| `gen_og.py` | 纯 Pillow 绘制分享封面 |

## 自检六项（`validate.py`）

1. 24 类 HTML 标签开闭差值必须全为 0
2. 目录 href 无悬空、section 无孤立
3. 站内检索索引的文件与锚点全部存在
4. `<cite>` 数量 = 带置信度标签的 `<cite>` 数量
5. 三页行内 `style` 计数为 0
6. 无可访问名称的按钮与链接均为 0

## 数字一致性（`sync_audit.py`）

审计报告里写的是「实测」二字，就必须真的由产物推导。**人工抄数字一定会漂移**——
本站已经漂移过一次：缩短顶部栏品牌文案后三页字节数变化，A0 审计对象表还停在旧值。

所以 `audit.html` 里所有会随构建变化的数字都由 `sync_audit.py` 回填：

```bash
python sync_audit.py           # 就地改写 audit.html
python sync_audit.py --check   # 只报告差异，退出码 1 表示有差异（可挂 CI）
```

它回填三处：A0 审计对象清单整张表、A6 体积卡的标题与正文。

两条设计约束，都是踩过坑才加的：

- **单次替换失败即报错退出**。第一版用了 `re.sub` 却不检查命中次数，
  结果体积卡正文的正则因为漏了一个 `<b>` 而**静默不匹配**，脚本照样打印「已同步」。
  现在每一处替换都走 `re.subn` 并断言命中 1 次，模板一改就立刻炸出来。
- **必须幂等**。第一版的正则只吃 `<tr>`、不吃行首缩进，每跑一次就在行首多堆 8 个空格。
  现在正则连缩进一起吃掉再整块吐回。验证方式：连跑两次，第二次应打印「无需改动」。

任何一次改动后重跑 `validate.py` → `sync_audit.py`，三页自检通过、`--check` 无差异，
才算交付闭环。

## 交互验收（`accept.mjs`）

`check.py` 属于静态检查：它能证明标签配平、锚点存在、没有行内样式，
但**证明不了顶部栏那几样 JS 交互真的能用**——搜索会不会高亮、分享菜单会不会弹出来、
日夜模式会不会切换并记住、抽屉目录能不能开。这些恰恰是照搬「以日为镜」的核心交付，
只看静态截图看不出来。

所以另有一份真交互验收：Playwright 驱动本机已装的 Edge（不下载 Chromium）：

```bash
PLAYWRIGHT_HOME=<node_modules 路径> node _build/accept.mjs
```

它会自己起一个本地静态服务（默认 8777）、跑完 17 条断言、出证据截图到 `_build/shots/`，
最后自己关掉服务和浏览器。也可以直接指向线上：`node _build/accept.mjs https://justin.strangeyu.xyz/`

覆盖：日夜模式切换 + `localStorage` 持久化、全站检索命中数与面板、无命中时的引导文案、
分享菜单 12 渠道与 `aria-expanded`、Esc 收起、正文高亮计数一致、高亮不越界到顶部栏与目录、
Esc 清除高亮、目录篇目展开收起、滚动更新进度条与当前项联动、窄屏汉堡与抽屉遮罩、
四页无脚本报错。

**这份验收抓到过一个真问题**：断言「高亮处数 == 正文 `<mark>` 数」时报 46 对 43。
查下来是断言写窄了——`site.js` 的高亮有意只排除顶部栏/目录/搜索面板/分享菜单/底部导航，
hero 与页脚是算在内的。计数本来是对的，改的是断言。这正是静态检查发现不了的那类问题。
