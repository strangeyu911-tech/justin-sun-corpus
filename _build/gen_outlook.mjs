/* 生成 outlook.html「未来推演」——第二期：编者前瞻推演。
   定位：弱断言、多情景、不碰具体标的、每条挂置信度与证伪条件。
   与孙宇晨的观点严格分开标注；引用其观点时标注卷三核对结果。 */
import fs from 'fs';

const ROOT = 'D:/全局项目库/justin-sun-corpus';
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* ---------- 顶栏复用 ---------- */
const idx = fs.readFileSync(ROOT + '/index.html', 'utf8');
const shell = idx.slice(idx.indexOf('<div class="topbar">'), idx.indexOf('<header class="hero">'))
  .replace(
    /<span class="brand" title="[^"]*"><span class="b-full">[^<]*<\/span><span class="b-short">[^<]*<\/span><span class="b-xs">[^<]*<\/span><\/span>/,
    '<span class="brand" title="孙割这十年 · 未来推演"><span class="b-full">孙割这十年 · 未来推演</span><span class="b-short">孙割十年 · 推演</span><span class="b-xs">推演</span></span>')
  .replace(
    /<nav id="toc"[\s\S]*?<\/nav>/,
    `<nav id="toc" aria-label="目录">
<h4>本页<span class="sp"></span><button class="toc-tool" id="toc-expand" type="button">全展开</button><button class="toc-tool" id="toc-collapse" type="button">全收起</button></h4>
<a href="#s0" class="solo">卷首 · 这页怎么读</a>
<a href="#s1" class="solo">01　房产：从普跌到分化出清</a>
<a href="#s2" class="solo">02　加密：周期变长，稳定币上位</a>
<a href="#s3" class="solo">03　AI：从聊天到托管</a>
<a href="#s4" class="solo">04　工作：稳定溢价的反转</a>
<a href="#s5" class="solo">05　婚恋：长期下行中的反弹</a>
<a href="#s6" class="solo">06　健康：身体即资产</a>
<a href="#s7" class="solo">07　本页什么时候错</a>
<a href="#s8" class="solo">08　边界</a>
<h4 class="toc-h4b">其他页</h4>
<a href="index.html" class="solo">总览</a>
<a href="volume3.html" class="solo">卷三 · 十年之后回头看</a>
<a href="takeaway.html" class="solo">可以拿走的部分</a>
</nav>`);

/* ---------- 组件 ---------- */
function anchor(list) {
  return `<div class="ol-block"><div class="ol-lbl">现状锚点（已核对 / 官方来源）</div><ul class="pts">${list.map(x => `<li>${x}</li>`).join('')}</ul></div>`;
}
function coord(quote, src, badge, cls) {
  return `<div class="ol-block"><div class="ol-lbl">孙割的坐标</div><blockquote class="quote">${quote}<cite>${src}　<span class="tag ${cls}">${badge}</span></cite></blockquote></div>`;
}
function scenario(title, cls, body) {
  return `<div class="ol-sc ${cls}"><div class="ol-sc-hd">${title}</div><p>${body}</p></div>`;
}
function falsify(text) {
  return `<div class="ol-falsify"><b>证伪条件：</b>${text}</div>`;
}
function conf(level, why) {
  return `<p class="ol-conf"><span class="tag ${level === '高' ? 'tag-fact' : level === '中' ? 'tag-mid' : 'tag-low'}">置信度 · ${level}</span>　${why}</p>`;
}

const html = `<!DOCTYPE html>
<html lang="zh-CN" data-theme="light">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>未来推演：从已核对的事实往下看 · 孙割这十年</title>
<meta name="description" content="用已核对的事实与公开数据，对房产、加密、AI、工作、婚恋、健康做情景式推演——弱断言、多情景、每个推演都给证伪条件。">
<link rel="canonical" href="https://strangeyu911-tech.github.io/justin-sun-corpus/outlook.html">
<meta property="og:site_name" content="孙割这十年">
<meta property="og:title" content="未来推演：从已核对的事实往下看">
<meta property="og:description" content="情景式推演：弱断言、多情景、每个推演都给证伪条件。">
<meta property="og:image" content="https://strangeyu911-tech.github.io/justin-sun-corpus/assets/og.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect width='24' height='24' rx='6' fill='%230f766e'/%3E%3Cpath d='M10 7.6v8.8l7-4.4z' fill='%23fbfaf8'/%3E%3C/svg%3E">
<link rel="stylesheet" href="assets/site.css">
<script>try{var t=localStorage.getItem('sycn-theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}</script>
<style>
.ol-block{background:var(--paper);border:1px solid var(--line);border-radius:10px;padding:12px 15px;margin:0 0 11px}
.ol-lbl{font-size:11.5px;font-weight:700;letter-spacing:.06em;color:var(--teal);margin-bottom:7px}
.ol-block .pts li{font-size:13.5px;color:var(--ink-2);line-height:1.72;margin:0 0 6px}
.ol-block blockquote.quote{margin:0;font-size:14.5px}
.ol-sc{border-radius:10px;padding:12px 15px;margin:0 0 9px;border:1px solid var(--line);background:var(--card)}
.ol-sc-hd{font-weight:700;font-size:14.5px;margin-bottom:5px}
.ol-sc.base{border-left:3px solid var(--teal)} .ol-sc.base .ol-sc-hd{color:var(--teal)}
.ol-sc.alt{border-left:3px solid var(--gold)} .ol-sc.alt .ol-sc-hd{color:var(--gold)}
.ol-sc p{margin:0;font-size:13.7px;color:var(--ink-2);line-height:1.72}
.ol-falsify{background:var(--gold-soft);border-radius:9px;padding:10px 14px;font-size:13px;color:var(--ink-2);line-height:1.7;margin:4px 0 14px}
.ol-falsify b{color:var(--gold)}
.ol-conf{font-size:13px;color:var(--muted);margin:2px 0 6px}
.sec-anchor{margin:0 0 8px}
</style>
</head>
<body>
<div id="progress"></div>
${shell}
<header class="hero">
  <div class="hero-inner">
    <span class="kicker">本站推演 · 编者判断，与孙宇晨的观点严格分开</span>
    <h1 class="title">未来推演</h1>
    <p class="tagline">用已核对的事实往下看几年——情景式、弱断言，每条推演自带认错条件</p>
    <div class="hero-cols">
      <div class="hero-main">
        <p class="subtitle">
          这是本站唯一一卷<b>编者自己的判断</b>。方法：只从<b>已核对成立的事实</b>出发（房产跌幅、加密周期、AI 渗透、结婚登记），
          沿孙宇晨世界观里<b>被核对验证过方向</b>的那部分往下推，给出多个情景而不是单一结论，
          并为每个情景写明<b>什么数据出现时应该认错</b>。
        </p>
        <div class="meta">
          <span class="chip"><b>主题</b> 6 个</span>
          <span class="chip"><b>形式</b> 情景式（基准 + 变体）</span>
          <span class="chip"><b>推演时点</b> 2026-10-15</span>
          <span class="chip"><b>视野</b> 1–3 年</span>
        </div>
      </div>
      <aside class="hero-side">
        <div class="hero-notes">
          <p class="hn-hd">三个前提</p>
          <div class="hn-item"><span class="hn-n">1</span>本页全部是<b>编者推演</b>，不是孙宇晨的观点；引用他的话时单独标注并附卷三核对结果。</div>
          <div class="hn-item"><span class="hn-n">2</span>情景不是预言：「如果 X 则 Y」的条件判断。判断始终在你，证伪条件是本页交给你的认错义务。</div>
          <div class="hn-item"><span class="hn-n">3</span>本页<b>不构成任何投资建议</b>，不预测任何具体标的价格；加密相关内容尤须以此为准。</div>
        </div>
      </aside>
    </div>
  </div>
</header>
<div class="shell">
<main>

  <section id="s0">
    <h2 class="sec"><span class="num">00</span>这页怎么读</h2>
    <p class="sec-lead">四个规则，先于一切结论。</p>
    <div class="two">
      <div class="note-box">
        <h4>只从已核对的事实出发</h4>
        <p>每个主题的「现状锚点」全部来自卷三核对时留下的公开来源，或官方统计。锚点不足的主题，宁可少写也不硬编。</p>
        <p>孙宇晨的观点只作为<b>坐标</b>出现——且只引用卷三核对中「方向说对」的部分；说错的部分（黄金、乐视）不作为推演依据。</p>
      </div>
      <div class="note-box">
        <h4>情景 + 证伪，而不是结论</h4>
        <p>每个主题给一个<b>基准情景</b>和若干<b>变体</b>。基准不是「最可能发生的」，是「当前证据下最简的解释」；变体写明需要什么额外条件。</p>
        <p>每段推演末尾的<b>证伪条件</b>是本页最重要的一句：它规定了「什么数据出现时，这条推演作废」。</p>
      </div>
    </div>
  </section>

  <section id="s1">
    <h2 class="sec"><span class="num">01</span>房产：从普跌，到分化出清</h2>
    ${anchor([
      '海淀二手房 2021-08 峰值 109,522 元/㎡ → 2026-07 80,154 元/㎡（-26.8%）；中关村一小对口老房 13 万 → 8.5 万/㎡（三个皮匠报告）',
      '个别案例回到十年前：天秀花园 2017 高点 748 万 → 2026-08 成交 384 万；万柳 900 万 → 370 万（成交数据整理）',
      '2026-05 北京二手房均价约 4.85–5 万/㎡，约等于 2017–2018 年水平；2026-03 核心区学区房反弹 3–5%，集中于优质小户型与次新房',
    ])}
    ${coord('「海淀破得像县城，房价是东三环四五倍……这是变态环境，迟早崩盘。」', '第 046 讲', '部分说中 · 方向对、时点晚约 4 年', 'tag-mid')}
    ${scenario('基准 · L 型与分化出清', 'base',
      '整体不再普涨、也难再深跌（政策持续托底），进入长 L 型；但<b>结构性出清继续</b>：老破小、远郊、无学区溢价的房子继续向「居住价值」阴跌回归，核心区优质次新房率先企稳——2026-03 的反弹只出现在这一类，正是分化开始信号。附着在房子上的教育溢价（多校划片）与投机溢价会被继续出清。')}
    ${scenario('变体 A · 出清更深', 'alt',
      '若人口下行加速叠加收入预期持续低迷，二线以下连「租金回报」逻辑也守不住，向「建筑成本 + 土地残值」寻底。一线核心因稀缺性相对抗跌，但金融属性（涨价预期）长期消失。')}
    ${scenario('变体 B · 政策强反弹', 'alt',
      '若出现强刺激（大幅降息 + 政府收储规模化），一线核心 2027 年前反弹。注意：即便发生，反弹更接近出货窗口而非新周期起点——判断依据是人口与库存的基本面并未逆转。')}
    ${falsify('北京二手房均价同比转正且连续两个季度、挂牌量同步下降 → 「L 型」判断作废，需重估为周期反转。')}
    ${conf('中', '方向置信高（分化出清有成交数据）；时点与幅度置信低——政策变量太大，本页不作幅度预测。')}
  </section>

  <section id="s2">
    <h2 class="sec"><span class="num">02</span>加密：周期变长，散户退场，稳定币上位</h2>
    ${anchor([
      'BTC：2025-10 历史高点 $126,000 → 2026-07-01 低点 $57,747（-54%）→ 2026-10 约 $82,000（价格档案）',
      'BCH 较 2017 年高点 $4,000+ 已跌 92%–93%；「减半年份买入必然暴涨」的历史规律在上一周期已经钝化',
      '黄金 2017 → 2026 涨约 270%，2025 年超越欧元成为全球第二大储备资产（BDO）——「数字资产取代黄金」的叙事被正面证伪',
    ])}
    ${coord('「长期看好比特币在整个虚拟货币生态中作为锚定货币。」', '第 102 讲', '部分说中 · 方向有争议、路径未如他所料', 'tag-mid')}
    ${scenario('基准 · 资产化与工具化', 'base',
      '「四年减半周期」的规律继续钝化——2026 年的深跌发生在减半年份之后，周期已经错位。BTC 波动率趋降、与美股科技股相关性上升，越来越像<b>高波动的科技资产</b>而非独立资产类别；散户直接持币占比下降，敞口转向 ETF 与合规产品。行业里确定性最高的部分是<b>稳定币与支付基础设施</b>（监管框架落地、真实结算需求），而非炒币——这与他「99% 场景不需要现金」的底层判断方向一致。')}
    ${scenario('变体 A · 流动性再宽松', 'alt',
      '主要经济体进入降息周期 + 风险偏好回升，BTC 可能再创新高。但「创新高 ≠ 周期重启」：结构上仍是 ETF 资金驱动，回撤特征会更接近科技股而非早期加密。')}
    ${scenario('变体 B · 信任事件', 'alt',
      '某大型稳定币出事或主要司法辖区收紧 → 行业信任危机，资金回流 BTC 原教旨主义叙事，「锚定货币」论短暂强化。')}
    ${falsify('BTC 与纳斯达克 90 天相关性持续低于 0.3，且稳定币总市值停止增长 → 「资产化 + 工具化」的基准判断作废。')}
    ${conf('中低', '波动结构变化的证据在积累，但这是政策变量最大的领域——本页不给任何价格区间。')}
  </section>

  <section id="s3">
    <h2 class="sec"><span class="num">03</span>AI：从「聊天工具」到「个人数据层」</h2>
    ${anchor([
      'AI 辅助诊断已是临床标配，首个自主诊断系统获批——「AI 只能给赤脚医生当参考」已被证伪（卷三 V1-110-a）',
      '国产模型免费层（智谱 / Kimi 等）持续可用，「零成本完成个人 AI 化」在 2026 年仍然成立',
    ])}
    ${coord('「所有文件存在本地，用一个 API 读取」——数据存本地、模型用 API 解耦。', '卷二 §02 / 附录', '方法论 · 已提炼为可迁移条目', 'tag-fact')}
    ${scenario('基准 · 托管与主权', 'base',
      'AI 的消费级主线从「问答」转向「个人数据层」：健康、财务、工作记录交给 AI 持续处理成为中产标配；「数据本地化 + 模型可换」从极客话题变成消费级卖点——因为他说的「没被机器读到的等于不存在」在生产力意义上是对的，而谁保管这些数据就会成为下一个战场。')}
    ${scenario('变体 A · 监管先行', 'alt',
      '医疗与个人数据的监管收紧（出境、审批），托管进程放缓——企业级 AI 先于个人级落地，个人端以「本地 + 开源模型」形态绕行。')}
    ${scenario('变体 B · 互操作标准', 'alt',
      'agent 互操作标准被主流厂商采纳，「换模型成本」趋零，按席位收费的 SaaS 被按量计费的 agent 重构。')}
    ${falsify('到 2027 年底，主流手机 / AI 厂商仍无一家把「本地个人数据托管」做成产品线卖点 → 「数据层」判断降级为极客小众需求。')}
    ${conf('中', '方向有产品信号；渗透速度是本页所有推演里最不确定的一格。')}
  </section>

  <section id="s4">
    <h2 class="sec"><span class="num">04</span>工作：「稳定溢价」的反转，慢于直觉</h2>
    ${anchor([
      '他 2017 年举的去产能国企减员 30% 案例，方向与后来的行业收缩一致（卷三 V1-078-a：部分说中，周期数「10 年」无来源）',
      '「AI 冲击初级白领岗位」为 2026 年公开报道的普遍现象，本站未逐条核对，仅作背景而非锚点',
    ])}
    ${coord('「稳定就是最大的不稳定。」', '第 078 讲', '部分说中 · 方向对、论据为个案', 'tag-mid')}
    ${scenario('基准 · 两条腿同时走', 'base',
      '「稳定」的市场定价缓慢反转：财政压力下体制内的隐性收紧（绩效化、缩编）与 AI 对白领流程岗的替代同时发生；另一边，<b>避险需求让考公考编在短期反而更热</b>。两个方向同时成立并不矛盾——长期反转被短期避险掩盖，节奏比方向更难判。「一人多职、个人 IP」从可选项变成常规选项。')}
    ${scenario('变体 A · 反转推迟', 'alt',
      '若财政转移支付超预期、体制内薪酬与编制逆势扩张，「稳定溢价反转」推迟到 2028 年以后——届时反转一旦发生会更剧烈。')}
    ${falsify('体制内编制与薪酬在 2027 年前出现显著扩张（逆势扩编成为公开政策）→ 反转判断推迟。')}
    ${conf('低-中', '方向有共识，节奏是本页最弱的一格；本主题的锚点最薄，读者应以最低权重对待本节。')}
  </section>

  <section id="s5">
    <h2 class="sec"><span class="num">05</span>婚恋：长期下行中的一次政策性反弹</h2>
    ${anchor([
      '2025 年全国结婚登记 676.5 万对，同比 +10.8%；离婚 393.7 万对（民政部《2025 年民政事业发展统计公报》）',
      '较 2013 年峰值 1,346.9 万对仍下降约一半；超大城市平均初婚年龄已超 30 岁（学习时报引民政部）',
      '背景：新修订《婚姻登记条例》2025-05-10 实施——全国通办、不再需要户口簿',
    ])}
    ${coord('「婚姻承担的五大功能正被互联网与科技替代。」', '第 035 讲', '部分说中 · 功能替代是慢变量', 'tag-mid')}
    ${scenario('基准 · 反弹是政策性的，不改结构', 'base',
      '2025 年的 +10.8% 主要是<b>政策性反弹</b>：全国通办释放了积压需求，叠加 2024 年（无立春等民俗避讳 + 疫情后）低基数。2026–2027 年增速回落，向「初婚年龄推迟 + 结婚率长期下行」的主趋势回归——2013 年至今腰斩的主线是人口结构与观念，登记便利化改变的是「在哪结、多麻烦」，不是「结不结」。')}
    ${scenario('变体 A · 企稳', 'alt',
      '若生育支持（托育、补贴、住房）加码到实质改变成本结构，结婚登记可能在 600 万对级别企稳——「政策能托住斜率，托不住趋势」。')}
    ${scenario('变体 B · 反弹延续', 'alt',
      '若 2026 年再增 8% 以上，说明「政策 + 观念松动」强于预期，本条的结构性判断需要重估——这也是本页最容易被 2027 年数据检验的一条。')}
    ${falsify('2026 年结婚登记同比再增 8% 以上 → 「政策性反弹」判断作废。')}
    ${conf('中', '结构下行的证据强；「反弹归因于政策」是推断——民政部未给出归因分析，这是本条最大的不确定性。')}
  </section>

  <section id="s6">
    <h2 class="sec"><span class="num">06</span>健康：从「治已病」到「身体即资产」</h2>
    ${anchor([
      '抗阻训练延缓肌肉量下降、20–40 岁为投入回报最高窗口——运动医学共识，卷二原话称其为「全片唯一几乎无争议的建议」',
      'AI 饮食记录 / 训练记录的用法已可零成本实践（卷二 method，已提炼为本站 §01）',
    ])}
    ${coord('「寿命 100 分模型：心肺 25 + 肌肉 25 + 其他 50。」「身体上你是个穷人，练薄肌就是领工资。」', '卷二 §05', '部分说中 · 框架可参考、数字非医学标准', 'tag-mid')}
    ${scenario('基准 · 预防型健康消费迁移', 'base',
      '健康支出从「治已病」向「数据型预防」迁移：可穿戴设备 + 年度血检基线 + AI 解读成为中产标配；GLP-1 类药物扩围重塑体重管理市场。他「把身体当资产配置」的框架方向是对的——错误在把框架数字（25/25/50）当成了公式，那只是记忆法不是医学。')}
    ${scenario('变体 · 泡沫先行', 'alt',
      '长寿产业（高端检测、补剂、抗衰）先行于真实寿命延长——「交智商税的市场先热」。对普通人的含义：这一层的增量信息几乎都在医学共识里（练抗阻、睡够、控体重），不在昂贵的检测里。')}
    ${falsify('无单一指标。可长期观察「家庭预防型健康支出占比」的官方统计；若 GLP-1 类与可穿戴渗透率双双停滞，则「迁移」判断作废。')}
    ${conf('中', '共识层置信高；「资产化」的消费迁移判断属于观察。')}
  </section>

  <section id="s7">
    <h2 class="sec"><span class="num">07</span>本页什么时候错</h2>
    <p class="sec-lead">把六段证伪条件汇成一张表——这是本页对读者最重要的承诺：<b>每条推演都自带认错条件</b>。</p>
    <table>
      <thead><tr><th style="width:110px">主题</th><th>出现以下数据时，本页推演作废</th></tr></thead>
      <tbody>
        <tr><td>房产</td><td>北京二手房均价同比转正 + 连续两季度 + 挂牌量下降</td></tr>
        <tr><td>加密</td><td>BTC 与纳指 90 天相关性持续 &lt; 0.3，且稳定币总市值停止增长</td></tr>
        <tr><td>AI</td><td>2027 年底前无主流厂商把「本地个人数据托管」做成产品卖点</td></tr>
        <tr><td>工作</td><td>体制内编制与薪酬 2027 年前显著逆势扩张</td></tr>
        <tr><td>婚恋</td><td>2026 年结婚登记同比再增 8% 以上</td></tr>
        <tr><td>健康</td><td>无单一指标；观察预防型健康支出占比与 GLP-1 / 可穿戴渗透率</td></tr>
      </tbody>
    </table>
  </section>

  <section id="s8">
    <h2 class="sec"><span class="num">08</span>边界</h2>
    <div class="two">
      <div class="note-box">
        <h4>这页是什么</h4>
        <p>编者的情景推演，输入只有两样：<b>已核对成立的事实</b>（全部来自卷三的公开来源）和<b>孙宇晨世界观里被验证过方向的部分</b>。它存在的理由：卷三证明了「数据 + 逻辑」这套方法能工作，本页是这套方法向前用。</p>
      </div>
      <div class="note-box">
        <h4>这页不是什么</h4>
        <p>不是预测承诺，不是投资建议，不涉及任何具体标的的买卖时点。所有情景都可能同时错——这也是为什么每条都给了证伪条件：检验本页的方式不是「等时间给答案」，而是<b>拿证伪条件逐条对照</b>。</p>
        <p>孙宇晨的话在本页只出现为「坐标」，且只引用方向被验证过的部分；他的说错项（黄金、乐视、BCC）不作为任何推演依据。</p>
      </div>
    </div>
  </section>

</main>
</div>
<div class="wrap"><div id="qq-entry"></div></div>
<section class="xsec">
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
<div class="bottomnav"><div class="bn-in">
  <a class="btn" href="takeaway.html">← 可以拿走的部分</a>
  <span class="bn-tip">未来推演 · 编者判断</span>
  <a class="btn" href="index.html">总览 →</a>
</div></div>

<footer>
  <div class="foot-inner">
    <p><b>本页：</b>编者的情景式推演（6 主题 × 基准/变体 + 证伪条件），输入为卷三核对留下的公开事实。本页与孙宇晨的观点严格分开：他只作为坐标出现，且只引用被核对验证过方向的部分。</p>
    <p><b>各页：</b><a href="index.html">总览</a> ·
    <a href="2016-2017-wealthfreedom.html">卷一 · 音频课</a> ·
    <a href="2026-interview.html">卷二 · 长访谈</a> ·
    <a href="volume3.html">卷三 · 十年之后回头看</a> ·
    <a href="takeaway.html">可以拿走的部分</a> ·
    <a href="outlook.html">未来推演</a> ·
    <a href="audit.html">审计报告</a></p>
    <p><b>免责声明：</b>本页全部为编者推演，不构成任何投资建议、税务建议或医疗建议，不预测任何具体标的价格，不承诺任何结果。情景与证伪条件可能同时错误；请以证伪条件自行检验。加密相关内容风险极高，孙宇晨本人是波场 TRON 创始人、加密资产的直接利益相关方。</p>
  </div>
</footer>
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
<script>window.SITE_META={"title":"未来推演：从已核对的事实往下看 · 孙割这十年","desc":"情景式推演：弱断言、多情景、每个推演都给证伪条件。"};</script>
<script src="assets/site.js" defer></script>
<script>window.QQ_CONFIG={wxNote:'孙割这十年'};</script>
<script src="qqgroup.js" defer></script>
</body>
</html>
`;

fs.writeFileSync(ROOT + '/outlook.html', html, 'utf8');
console.log('写出 outlook.html  ' + html.length + ' 字符');
