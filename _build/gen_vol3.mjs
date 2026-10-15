/* 生成卷三页面 volume3.html —— 从 data/claims.jsonl 渲染。
   顶栏与目录从 index.html 复用（保证与全站一致），正文按「方向 vs 精度」框架分组。 */
import fs from 'fs';

const ROOT = 'D:/全局项目库/justin-sun-corpus';
const rows = fs.readFileSync(ROOT + '/data/claims.jsonl', 'utf8')
  .split('\n').filter(l => l.trim()).map(l => JSON.parse(l));
const tk = JSON.parse(fs.readFileSync(ROOT + '/data/takeaways.json', 'utf8'));
const total = tk.groups.reduce((n, g) => n + g.items.length, 0);

const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const done = rows.filter(r => r.status === 'done');
const G = {
  predPart: done.filter(r => r.type === 'prediction' && r.verdict === 'partial'),
  wrong:    done.filter(r => r.verdict === 'wrong'),
  right:    done.filter(r => r.verdict === 'right'),
  factPart: done.filter(r => r.type === 'fact' && r.verdict === 'partial'),
  unver:    done.filter(r => r.verdict === 'unverifiable'),
  future:   rows.filter(r => r.checkable_at === 'future'),
};
const TYPE = { prediction: '预测', fact: '事实主张', value: '价值主张', method: '方法论', self: '自我叙事' };
const REGION = { cn: '中国', global: '全球', us: '美国', mixed: '混合', na: '不适用' };

/* ---------- 卡片 ---------- */
function card(r, badge, badgeCls, verdictNote) {
  return `<div class="v3-item">
  <div class="v3-hd"><span class="v3-no">${esc(r.at)}</span><span class="v3-badge ${badgeCls}">${badge}</span></div>
  <h3>${esc(r.claim)}</h3>
  <div class="v3-cols">
    <div class="v3-col"><span class="v3-lbl">${esc(r.year)} · 他说的</span><p>${esc(r.quote)}</p></div>
    <div class="v3-col now"><span class="v3-lbl">2026 · 今天的事实</span><p>${esc(r.finding)}</p></div>
  </div>
  <div class="v3-meta">${TYPE[r.type]} · ${REGION[r.region] || r.region}${r.fidelity === 'mid' ? ' · 转写稿（引用前须回原音）' : r.fidelity === 'low' ? ' · 二手概要' : ''}${verdictNote ? ' · ' + esc(verdictNote) : ''}</div>
  ${r.sources && r.sources.length ? `<div class="v3-src">来源：${r.sources.map(esc).join('　·　')}</div>` : ''}
  ${r.note ? `<div class="v3-note">${esc(r.note)}</div>` : ''}
</div>`;
}

/* 紧凑行（用于事实类细节错误清单） */
function rowLine(r) {
  return `<div class="v3-row"><div class="v3-rh"><span class="v3-no">${esc(r.at)}</span><b>${esc(r.claim)}</b></div>
  <p>${esc(r.finding)}</p>${r.sources && r.sources.length ? `<div class="v3-src">来源：${r.sources.map(esc).join('　·　')}</div>` : ''}</div>`;
}

/* ---------- 顶栏 / 目录 复用 index.html ---------- */
const idx = fs.readFileSync(ROOT + '/index.html', 'utf8');
const shell = idx.slice(idx.indexOf('<div class="topbar">'), idx.indexOf('<header class="hero">'))
  .replace(
    /<span class="brand" title="[^"]*"><span class="b-full">[^<]*<\/span><span class="b-short">[^<]*<\/span><span class="b-xs">[^<]*<\/span><\/span>/,
    '<span class="brand" title="孙割这十年 · 卷三（十年之后回头看）"><span class="b-full">孙割这十年 · 卷三（十年之后回头看）</span><span class="b-short">孙割十年 · 卷三</span><span class="b-xs">卷三</span></span>')
  .replace(
    /<nav id="toc"[\s\S]*?<\/nav>/,
    `<nav id="toc" aria-label="目录">
<h4>本页<span class="sp"></span><button class="toc-tool" id="toc-expand" type="button">全展开</button><button class="toc-tool" id="toc-collapse" type="button">全收起</button></h4>
<a href="#s0" class="solo">卷首 · 这批数据说明了什么</a>
<a href="#s1" class="solo">01　方法与口径：方向 vs 精度</a>
<a href="#s2" class="solo">02　方向对了，精度没跟上</a>
<a href="#s3" class="solo">03　说错了的</a>
<a href="#s4" class="solo">04　说得准的</a>
<a href="#s5" class="solo">05　事实成立、细节不准</a>
<a href="#s6" class="solo">06　还没到检验点</a>
<a href="#s7" class="solo">07　这不是一份打脸清单</a>
<h4 class="toc-h4b">其他卷</h4>
<a href="index.html" class="solo">总览 · 两卷 + 十年对照</a>
<a href="2016-2017-wealthfreedom.html" class="solo">卷一 · 2016–17 音频课</a>
<a href="2026-interview.html" class="solo">卷二 · 2026 长访谈</a>
</nav>`);

/* ---------- 页面 ---------- */
const html = `<!DOCTYPE html>
<html lang="zh-CN" data-theme="light">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>十年之后回头看：他 2017 年说的，今天怎么样了（卷三）· 孙割这十年</title>
<meta name="description" content="把孙宇晨 2016–2017 年音频课里的断言逐条拿到今天核对：53 条里说中 10、部分说中 36、说错 4。结论是「方向常常对，精度基本不准」。">
<link rel="canonical" href="https://strangeyu911-tech.github.io/justin-sun-corpus/volume3.html">
<meta property="og:type" content="article">
<meta property="og:site_name" content="孙割这十年">
<meta property="og:url" content="https://strangeyu911-tech.github.io/justin-sun-corpus/volume3.html">
<meta property="og:title" content="十年之后回头看：他 2017 年说的，今天怎么样了">
<meta property="og:description" content="53 条断言逐条核对：方向常常对，精度基本不准。">
<meta property="og:image" content="https://strangeyu911-tech.github.io/justin-sun-corpus/assets/og.png">
<meta property="og:locale" content="zh_CN">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="十年之后回头看 · 孙割这十年 卷三">
<meta name="twitter:description" content="53 条断言逐条核对：方向常常对，精度基本不准。">
<meta name="twitter:image" content="https://strangeyu911-tech.github.io/justin-sun-corpus/assets/og.png">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect width='24' height='24' rx='6' fill='%230f766e'/%3E%3Cpath d='M10 7.6v8.8l7-4.4z' fill='%23fbfaf8'/%3E%3C/svg%3E">
<link rel="stylesheet" href="assets/site.css">
<script>try{var t=localStorage.getItem('sycn-theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}</script>
<style>
.v3-item{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:15px 18px;margin:0 0 12px;box-shadow:var(--shadow)}
.v3-hd{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin-bottom:11px}
.v3-no{font-size:11.5px;color:var(--teal);background:var(--teal-soft);border-radius:5px;padding:2px 8px;flex:0 0 auto;font-variant-numeric:tabular-nums}
.v3-hd h3{margin:0;font-size:15.5px;line-height:1.45;flex:1 1 100%;font-weight:650}
.v3-item h3{margin:0 0 11px;font-size:16px;line-height:1.45;font-weight:650}
.v3-badge{font-size:11.5px;font-weight:600;border-radius:5px;padding:2px 9px;flex:0 0 auto;white-space:nowrap;margin-left:auto}
.b-right{background:var(--teal-soft);color:var(--teal)}
.b-part{background:var(--gold-soft);color:var(--gold)}
.b-wrong{background:var(--rose-soft);color:var(--rose)}
.b-na{background:var(--line-2);color:var(--muted)}
.v3-cols{display:grid;gap:11px;grid-template-columns:repeat(auto-fit,minmax(288px,1fr))}
.v3-col{background:var(--paper);border:1px solid var(--line);border-radius:9px;padding:11px 13px}
.v3-col p{margin:0;font-size:13.7px;color:var(--ink-2);line-height:1.7}
.v3-col .v3-lbl{display:block;font-size:11.5px;font-weight:700;letter-spacing:.05em;margin-bottom:5px;color:var(--teal);font-variant-numeric:tabular-nums}
.v3-col.now .v3-lbl{color:var(--ink-2)}
.v3-meta{margin:11px 0 0;font-size:11.5px;color:var(--muted);letter-spacing:.02em}
.v3-src{margin:9px 0 0;padding-top:8px;border-top:1px dashed var(--line);font-size:11.5px;color:var(--faint);line-height:1.65;word-break:break-all}
.v3-note{font-size:11.5px;color:var(--faint);margin-top:5px;line-height:1.6}
.v3-row{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:12px 15px;margin:0 0 9px}
.v3-rh{display:flex;align-items:baseline;gap:9px;flex-wrap:wrap;margin-bottom:6px}
.v3-rh b{font-size:14.5px;line-height:1.5;flex:1;min-width:180px}
.v3-row p{margin:0;font-size:13.3px;color:var(--ink-2);line-height:1.68}
.v3-stat{display:grid;gap:1px;background:var(--line);border:1px solid var(--line);border-radius:12px;overflow:hidden;grid-template-columns:repeat(auto-fit,minmax(126px,1fr));margin:0 0 20px}
.v3-stat div{background:var(--card);padding:15px 17px}
.v3-stat b{display:block;font-size:24px;font-weight:700;font-variant-numeric:tabular-nums}
.v3-stat span{display:block;font-size:12.5px;color:var(--muted);margin-top:2px}
.v3-key{background:var(--teal);color:#fff;border-radius:12px;padding:18px 20px;margin:0 0 18px}
.v3-key h3{margin:0 0 9px;font-size:16px;color:#fff;font-family:var(--sans)}
.v3-key p{margin:0 0 8px;font-size:14.2px;color:rgba(255,255,255,.94);line-height:1.72}
.v3-key p:last-child{margin-bottom:0}
</style>
</head>
<body>
<div id="progress"></div>
${shell}
<header class="hero">
  <div class="hero-inner">
    <span class="kicker">卷三 · 十年之后回头看</span>
    <h1 class="title">十年之后回头看</h1>
    <p class="tagline">他 2017 年说的，今天怎么样了 · 方向常常对，精度基本不准</p>
    <div class="hero-cols">
      <div class="hero-main">
        <p class="subtitle">
          把卷一里<b>能被时间检验</b>的断言逐条抽取出来，用<b>今天的世界</b>来核对——海淀房价的真实峰值、
          BCH 的实际跌幅、贾跃亭被执行的金额。总览页的十年对照表问的是「他<b>变没变</b>」（拿他十年后的说法校对十年前）；
          这一卷问的是「他<b>对没对</b>」（拿不依赖他的公开事实来校对），每一条判定都挂着来源，任何读者都能复核。
        </p>
        <div class="meta">
          <span class="chip"><b>抽样总量</b> ${rows.length} 条</span>
          <span class="chip"><b>已核对</b> ${done.length} 条</span>
          <span class="chip"><b>说中</b> ${G.right.length}</span>
          <span class="chip"><b>部分说中</b> ${G.predPart.length + G.factPart.length}</span>
          <span class="chip"><b>说错</b> ${G.wrong.length}</span>
          <span class="chip"><b>核对时点</b> 2026-10-15</span>
        </div>
      </div>
      <aside class="hero-side">
        <div class="hero-notes">
          <p class="hn-hd">三个阅读前提</p>
          <div class="hn-item"><span class="hn-n">1</span>本卷所有「他说的」都来自卷一（2016–2017 年录制的付费课程）或卷二（2026 年长访谈），涉及投资、加密资产、健康、婚恋的表述均<b>不构成任何建议</b>。</div>
          <div class="hn-item"><span class="hn-n">2</span>「今天的事实」一栏均来自公开来源，已逐条标注出处；本站<b>只做事实核对，不评价其价值主张</b>。</div>
          <div class="hn-item"><span class="hn-n">3</span>核对的是<b>断言本身</b>，不是「他这个人准不准」——同一个人的不同断言，可信度本来就不同。</div>
        </div>
      </aside>
    </div>
  </div>
</header>
<div class="shell">
<main>

  <section id="s0">
    <h2 class="sec"><span class="num">00</span>这批数据说明了什么</h2>
    <p class="sec-lead">从两卷共 ${rows.length} 条断言里，筛出 ${done.length} 条「今天就能核」的逐条查证完毕。</p>
    <div class="v3-stat">
      <div><b>${done.length}</b><span>已核对条数</span></div>
      <div><b>${G.right.length}</b><span>说中</span></div>
      <div><b>${G.predPart.length + G.factPart.length}</b><span>部分说中</span></div>
      <div><b>${G.wrong.length}</b><span>说错</span></div>
      <div><b>${G.future.length}</b><span>还没到检验点</span></div>
    </div>
    <div class="v3-key">
      <h3>最要紧的一个数字：预测类 12 条，一条「说中」都没有</h3>
      <p>可检验的预测里：<b>0 条说中、10 条部分说中、2 条说错</b>。他看大的方向常常对，但给出的<b>时点、幅度、具体数字基本不准</b>。</p>
      <p>这不是什么异常。判断一个时代的趋势方向，靠足够的认知和逻辑推演是可以做到的；要让精度也准，难度高一个量级，而且越高越难。</p>
      <p>所以本卷不按「对 / 错」两栏排——那样会有四分之三的条目无处安放。本卷按<b>「方向」与「精度」分离</b>来组织。</p>
    </div>
  </section>

  <section id="s1">
    <h2 class="sec"><span class="num">01</span>方法与口径：方向 vs 精度</h2>
    <p class="sec-lead">同一个人的不同断言，可信度本来就不一样。所以要先分类型，再谈对错。</p>
    <div class="two">
      <div class="note-box">
        <h4>与总览页「十年对照表」的区别</h4>
        <p>总览页 §03 那张表的尺子是<b>他自己</b>：左边 2017、右边 2026，两边都出自他嘴里，问的是「他<b>变没变</b>」——所以判定词是「延续 / 转向 / 加码」。</p>
        <p>本卷的尺子是<b>今天的世界</b>：另一边不是他的任何一句话，而是海淀房价的真实数据、BCH 的实际走势、贾跃亭的被执行金额——问的是「他<b>对没对</b>」。</p>
      </div>
      <div class="note-box">
        <h4>这也是总览页 §D2 承诺的兑现</h4>
        <p>总览页 §D2 自己写着：「共同弱点：数字与预测缺少可核验来源」。这一卷就是给那些数字<b>补上来源</b>的——每条判定都挂着公开出处，照着查就能复核。</p>
        <p>所以两页不是重复，是<b>摘要与全文</b>：对照表给主题级的归纳，本卷给逐条的事实。</p>
      </div>
    </div>
    <table class="u-mt16">
      <thead><tr><th>类型</th><th>能不能核</th><th>怎么判</th></tr></thead>
      <tbody>
        <tr><td><b>预测</b></td><td>能，等时间到</td><td>方向对错是一回事，时点与幅度准不准是另一回事——本卷把这两层<b>分开呈现</b>。</td></tr>
        <tr><td><b>事实主张</b></td><td>能，对数据核</td><td>核实具体数字、时间、案例。常见的是「内核成立、细节不准」。</td></tr>
        <tr><td><b>价值主张 / 方法论 / 自我叙事</b></td><td>不能</td><td>没有公开数据能证真或证伪「该不该买房」。这类只保留保真度标注，<b>不做对错判定</b>。</td></tr>
      </tbody>
    </table>
    <p class="sec-src" style="margin-top:14px"><span class="tag tag-mid">口径说明</span>「部分说中」= 方向对，但时点、幅度或前提条件错；也可能是核心事实对、具体数字错。判定只用四档：说中 / 部分说中 / 说错 / 无法核验。</p>
  </section>

  <section id="s2">
    <h2 class="sec"><span class="num">02</span>方向对了，精度没跟上 <span class="sec-time">${G.predPart.length} 条</span></h2>
    <p class="sec-lead">全部是预测类。大逻辑成立，但给出的时点、幅度或条件对不上——这一档最能说明问题。</p>
    ${G.predPart.map(r => card(r, '方向 · 对　精度 · 不准', 'b-part', '部分说中（方向对，时点/幅度/条件错）')).join('\n')}
  </section>

  <section id="s3">
    <h2 class="sec"><span class="num">03</span>说错了的 <span class="sec-time">${G.wrong.length} 条</span></h2>
    <p class="sec-lead">与今天的事实相反。数量最少，但最值得看。</p>
    ${G.wrong.map(r => card(r, '说错', 'b-wrong')).join('\n')}
  </section>

  <section id="s4">
    <h2 class="sec"><span class="num">04</span>说得准的 <span class="sec-time">${G.right.length} 条</span></h2>
    <p class="sec-lead">完全对得上。<b>注意这一档几乎全是历史事实类，没有一条是预测。</b></p>
    ${G.right.map(r => card(r, '说中', 'b-right')).join('\n')}
  </section>

  <section id="s5">
    <h2 class="sec"><span class="num">05</span>事实成立、细节不准 <span class="sec-time">${G.factPart.length} 条</span></h2>
    <p class="sec-lead">他讲的具体案例与数字，很多在细节上站不住。<b>这一档最实用</b>——以后引用他讲的数据之前，先来看一眼有没有出现在这里。</p>
    ${G.factPart.map(rowLine).join('\n')}
  </section>

  <section id="s6">
    <h2 class="sec"><span class="num">06</span>还没到检验点 <span class="sec-time">${G.future.length} 条</span></h2>
    <p class="sec-lead">这一档不是「查不到」，是<b>时候没到</b>——现在下任何判定都太早。如实列出来，等时间给答案。</p>
    ${G.future.map(rowLine).join('\n')}
    <p class="sec-src" style="margin-top:16px"><span class="tag tag-low">另有 ${G.unver.length} 条</span>属于「现在就该能核、但确实找不到公开来源」，本卷不作判定：${G.unver.map(r => esc(r.claim)).join('；')}。</p>
  </section>

  <section id="s7">
    <h2 class="sec"><span class="num">07</span>这不是一份「打脸清单」</h2>
    <p class="sec-lead">最后说清楚这一卷想做什么、不做什么。</p>
    <div class="two">
      <div class="note-box">
        <h4>它是什么</h4>
        <p>是一份<b>精度评估</b>：把一个人的公开判断，按「方向」「精度」两层拆开，逐条对照今天的事实。方向层看他怎么理解世界，精度层看他给的具体数字是不是经得起查。</p>
        <p>对读者最直接的用处是<b>第 05 节</b>——那是一份「引用前先核对」的清单。</p>
      </div>
      <div class="note-box">
        <h4>它不是什么</h4>
        <p>不是「他全错」的证明，也不是「他全对」的背书。全 ${done.length} 条里说中 ${G.right.length} 条、说错 ${G.wrong.length} 条，两头都不占多数。</p>
        <p>也不是预测能力排行榜：样本是<b>我们自己筛的</b>，只覆盖能被检验的那部分；价值主张、方法论这些占了全部抽样的半数，它们一条都没进判定。</p>
      </div>
    </div>
    <p class="sec-src" style="margin-top:16px"><span class="tag tag-mid">数据与方法</span>全 ${rows.length} 条断言的结构化数据（含出处、保真度、地域、检验时点、核对结果与来源）见仓库 <code>data/claims.jsonl</code>。任何一条的判定都可以照来源复核。</p>
    <p class="sec-src" style="margin-top:10px"><span class="tag tag-fact">下一站</span>校准完成之后，这些结果已转成对普通人的<a href="takeaway.html">使用说明 · 可以拿走的部分</a>：${rows.length} 条的分级视图，与 ${total} 条不依赖预测对错也成立的可迁移方法论。</p>
  </section>

</main>
</div>
<div class="bottomnav"><div class="bn-in">
  <a class="btn" href="2026-interview.html">← 卷二 · 2026 长访谈</a>
  <span class="bn-tip">卷三 · 十年之后回头看</span>
  <a class="btn" href="index.html">总览 →</a>
</div></div>
<footer>
  <div class="foot-inner">
    <p><b>本页：</b>卷三把卷一（2016–2017 年《财富自由革命之路》全 156 集）里能检验的断言逐条拿到今天核对，共 ${done.length} 条。另 ${G.future.length} 条还没到检验点、${rows.filter(r => !r.verifiable).length} 条属价值主张 / 方法论 / 自我叙事，不做对错判定。</p>
    <p><b>卷次：</b><a href="index.html">总览 · 两卷 + 十年对照</a> ·
    <a href="2016-2017-wealthfreedom.html">卷一 · 2016–17 音频课</a> ·
    <a href="2026-interview.html">卷二 · 2026 长访谈</a> ·
    <a href="audit.html">站点审计报告</a> ·
    <a href="https://github.com/strangeyu911-tech/justin-sun-corpus" target="_blank" rel="noopener">GitHub 仓库</a></p>
    <p><b>免责声明：</b>本页「今天的事实」均取自公开来源并逐条标注，仅作事实核对，不构成任何投资建议、税务建议或医疗建议，也不对其价值主张作评价。数字、案例与专有名词请以原始来源为准。孙宇晨本人是波场 TRON 创始人、加密资产的直接利益相关方。</p>
    <p><b>许可：</b>本站的整理、标注与代码以 MIT 许可发布；原始素材的著作权归各自权利人所有。</p>
  </div>
</footer>
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
<script>window.SITE_META={"title":"十年之后回头看：他 2017 年说的，今天怎么样了 · 孙割这十年","desc":"53 条断言逐条核对：方向常常对，精度基本不准。"};</script>
<script src="assets/site.js" defer></script>
<script>window.QQ_CONFIG={siteName:'孙割这十年',wxNote:'孙割这十年'};</script>
<script src="qqgroup.js" defer></script>
</body>
</html>
`;

fs.writeFileSync(ROOT + '/volume3.html', html, 'utf8');
console.log('写出 volume3.html  ' + html.length + ' 字符');
console.log('分组：predPart ' + G.predPart.length + ' / wrong ' + G.wrong.length + ' / right ' + G.right.length + ' / factPart ' + G.factPart.length + ' / unver ' + G.unver.length + ' / future ' + G.future.length);
