/* 生成 takeaway.html「可以拿走的部分」——分级视图 + 可迁移方法论提炼。
   数据：data/claims.jsonl（136 条）+ data/takeaways.json（方法论提炼）。
   顶栏与目录从 index.html 复用，与全站一致。 */
import fs from 'fs';

const ROOT = 'D:/全局项目库/justin-sun-corpus';
const rows = fs.readFileSync(ROOT + '/data/claims.jsonl', 'utf8')
  .split('\n').filter(l => l.trim()).map(l => JSON.parse(l));
const tk = JSON.parse(fs.readFileSync(ROOT + '/data/takeaways.json', 'utf8'));

const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const done = rows.filter(r => r.status === 'done');
const TYPE = { prediction: '预测', fact: '事实主张', value: '价值主张', method: '方法论', self: '自我叙事' };
const V = { right: '说中', partial: '部分说中', wrong: '说错', unverifiable: '无法核验', pending: '待核' };

const green  = rows.filter(r => r.type === 'fact' && r.verdict === 'right');
const yellow = rows.filter(r => r.verdict === 'partial');
const red    = rows.filter(r => r.verdict === 'wrong');
const gray   = rows.filter(r => !r.verifiable);
const future = rows.filter(r => r.checkable_at === 'future');
const unv    = rows.filter(r => r.verdict === 'unverifiable');

/* 方法论卡 */
function tkCard(it) {
  return `<div class="tk-item">
  <h3>${esc(it.name)}</h3>
  <p class="tk-gist">${esc(it.gist)}</p>
  <p class="tk-limit"><b>边界：</b>${esc(it.limit)}</p>
  <div class="tk-src">对应断言：${it.ids.map(i => `<a href="volume3.html">${esc(i)}</a>`).join(' · ')}　·　出处：${esc(it.from)}</div>
</div>`;
}

/* 分级行 */
function gradeRow(r, badge, cls) {
  return `<tr><td style="width:96px"><code>${esc(r.id)}</code></td><td><span class="gb ${cls}">${badge}</span> ${esc(r.claim)}</td><td class="sm">${esc(r.at)}</td></tr>`;
}
function gradeTable(list, badge, cls) {
  return `<details${list.length < 14 ? ' open' : ''}><summary>${badge} · ${list.length} 条</summary>
  <table><thead><tr><th style="width:96px">编号</th><th>断言与对待方式</th><th style="width:170px">出处</th></tr></thead><tbody>
  ${list.map(r => gradeRow(r, badge, cls)).join('')}</tbody></table></details>`;
}

/* 顶栏复用 */
const idx = fs.readFileSync(ROOT + '/index.html', 'utf8');
const shell = idx.slice(idx.indexOf('<div class="topbar">'), idx.indexOf('<header class="hero">'))
  .replace(
    /<span class="brand" title="[^"]*"><span class="b-full">[^<]*<\/span><span class="b-short">[^<]*<\/span><span class="b-xs">[^<]*<\/span><\/span>/,
    '<span class="brand" title="孙割这十年 · 可以拿走的部分"><span class="b-full">孙割这十年 · 可以拿走的部分</span><span class="b-short">孙割十年 · 拿走</span><span class="b-xs">拿走</span></span>')
  .replace(
    /<nav id="toc"[\s\S]*?<\/nav>/,
    `<nav id="toc" aria-label="目录">
<h4>本页<span class="sp"></span><button class="toc-tool" id="toc-expand" type="button">全展开</button><button class="toc-tool" id="toc-collapse" type="button">全收起</button></h4>
<a href="#s0" class="solo">卷首 · 这页怎么用</a>
<a href="#s1" class="solo">01　可以拿走的方法论</a>
<a href="#s2" class="solo">02　全量分级视图</a>
<a href="#s3" class="solo">03　已证伪的 4 条</a>
<a href="#s4" class="solo">04　这页不做的事</a>
<h4 class="toc-h4b">其他页</h4>
<a href="index.html" class="solo">总览 · 两卷 + 十年对照</a>
<a href="2016-2017-wealthfreedom.html" class="solo">卷一 · 2016–17 音频课</a>
<a href="2026-interview.html" class="solo">卷二 · 2026 长访谈</a>
<a href="volume3.html" class="solo">卷三 · 十年之后回头看</a>
<a href="#qq-entry" class="solo">加 QQ 群 / 作者微信交流</a>
</nav>`);

const total = tk.groups.reduce((n, g) => n + g.items.length, 0);

const html = `<!DOCTYPE html>
<html lang="zh-CN" data-theme="light">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>可以拿走的部分：孙割观点使用说明 · 孙割这十年</title>
<meta name="description" content="对 136 条断言的可信度分级：哪些经得起核对、哪些只能参考方向、哪些别引用；外加 10 条不依赖预测对错也成立的可迁移方法论。">
<link rel="canonical" href="https://strangeyu911-tech.github.io/justin-sun-corpus/takeaway.html">
<meta property="og:site_name" content="孙割这十年">
<meta property="og:title" content="可以拿走的部分：孙割观点使用说明">
<meta property="og:description" content="136 条断言的可信度分级 + 10 条可迁移方法论。">
<meta property="og:image" content="https://strangeyu911-tech.github.io/justin-sun-corpus/assets/og.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="可以拿走的部分 · 孙割这十年">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect width='24' height='24' rx='6' fill='%230f766e'/%3E%3Cpath d='M10 7.6v8.8l7-4.4z' fill='%23fbfaf8'/%3E%3C/svg%3E">
<link rel="stylesheet" href="assets/site.css">
<script>try{var t=localStorage.getItem('sycn-theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}</script>
<style>
.tk-item{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:15px 18px;margin:0 0 11px;box-shadow:var(--shadow)}
.tk-item h3{margin:0 0 8px;font-size:17px;font-family:var(--serif)}
.tk-gist{margin:0 0 8px;font-size:14.2px;color:var(--ink-2);line-height:1.75}
.tk-limit{margin:0 0 9px;font-size:13px;color:var(--muted);line-height:1.7;background:var(--paper);border-radius:8px;padding:8px 12px}
.tk-limit b{color:var(--gold)}
.tk-src{font-size:11.5px;color:var(--faint);line-height:1.6;border-top:1px dashed var(--line);padding-top:8px}
.tk-grp{margin:26px 0 10px;font-family:var(--serif);font-size:17px;font-weight:700;padding-top:18px;border-top:2px solid var(--line)}
.tk-grp:first-of-type{border-top:0;padding-top:0;margin-top:4px}
.gb{display:inline-block;font-size:11.5px;font-weight:600;border-radius:4px;padding:1px 7px;margin-right:7px;vertical-align:1px}
.g-green{background:var(--teal-soft);color:var(--teal)}
.g-yellow{background:var(--gold-soft);color:var(--gold)}
.g-red{background:var(--rose-soft);color:var(--rose)}
.g-gray{background:var(--line-2);color:var(--muted)}
table{margin:0 0 12px}
details{margin:0 0 12px}
summary{cursor:pointer;font-weight:600;font-size:15px;padding:4px 0}
summary::marker{color:var(--teal)}
td code{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:11.5px;background:var(--line-2);border-radius:4px;padding:1px 5px;color:var(--ink-2)}
td.sm{font-size:12px;color:var(--muted)}
</style>
</head>
<body>
<div id="progress"></div>
${shell}
<header class="hero">
  <div class="hero-inner">
    <span class="kicker">本站提炼 · 对普通人的使用说明</span>
    <h1 class="title">可以拿走的部分</h1>
    <p class="tagline">哪些能听、哪些打折、哪些别听——${rows.length} 条断言的分级，与 ${total} 条可迁移方法论</p>
    <div class="hero-cols">
      <div class="hero-main">
        <p class="subtitle">
          卷三回答了「他<b>对没对</b>」。这一页把核对结果转成<b>使用说明</b>：对每个普通人来说，
          这套观点里哪些经得起核对、哪些只能参考方向、哪些别再引用，以及哪些方法论<b>不依赖他的预测对错也成立</b>、可以直接拿走。
        </p>
        <div class="meta">
          <span class="chip"><b>抽样总量</b> ${rows.length} 条</span>
          <span class="chip"><b>可迁移方法论</b> ${total} 条</span>
          <span class="chip"><b>经得起核对</b> ${green.length}</span>
          <span class="chip"><b>部分说中</b> ${yellow.length}</span>
          <span class="chip"><b>已证伪</b> ${red.length}</span>
        </div>
      </div>
      <aside class="hero-side">
        <div class="hero-notes">
          <p class="hn-hd">两句话先说清这页不是什么</p>
          <div class="hn-item"><span class="hn-n">1</span>它<b>不是人生指南</b>——不告诉你该怎么做，只告诉你他的话该怎么对待。判断始终在你。</div>
          <div class="hn-item"><span class="hn-n">2</span>它<b>不是背书</b>——标绿只代表「这句被公开数据支持」，不代表「这个人可信」；不同断言的可信度本来就不该捆在一起评。</div>
        </div>
      </aside>
    </div>
  </div>
</header>
<div class="shell">
<main>

  <section id="s1">
    <h2 class="sec"><span class="num">01</span>可以拿走的方法论 <span class="sec-time">${total} 条</span></h2>
    <p class="sec-lead">以下方法有一个共同点：<b>它们成立与否，不依赖他的任何预测对错</b>——要么有外部研究背书，要么是数学事实，要么是可独立验证的流程。每条都给了适用边界；对应断言的编号可在卷三核对页溯源。</p>
    ${tk.groups.map(g => `<div class="tk-grp">${esc(g.name)}</div>` + g.items.map(tkCard).join('\n')).join('\n')}
  </section>

  <section id="s2">
    <h2 class="sec"><span class="num">02</span>全量分级视图 <span class="sec-time">${rows.length} 条</span></h2>
    <p class="sec-lead">把卷三的核对结果转成四档对待方式。点开看明细；每条的核对证据与来源都在卷三。</p>

    <p class="sec-src" style="margin-top:4px"><span class="gb g-green">经得起核对</span>当参考用——有公开数据支持。判定与来源见卷三 §04。</p>
    ${gradeTable(green, '说中', 'g-green')}

    <p class="sec-src"><span class="gb g-yellow">方向可参考，数字别照抄</span>引用前先回卷三核对具体数字与时点。</p>
    ${gradeTable(yellow, '部分说中', 'g-yellow')}

    <p class="sec-src"><span class="gb g-gray">不对错坐标系里</span>价值观、方法论与自我叙事——不评级，不是「不能听」，是没有公开数据能判对错。方法论部分看本页 §01。</p>
    ${gradeTable(gray, '不评级', 'g-gray')}

    <p class="sec-src" style="margin-top:14px"><span class="gb g-yellow">还没到检验点</span>　${future.length} 条——多为卷二（2026 年录制）的长期判断，现在下判定为时过早，详见卷三 §06。<br>
    <span class="gb g-gray">无法核验</span>　${unv.length} 条——现在就该能核但确实查不到公开来源，本站不作判定：${unv.map(r => esc(r.claim)).join('；')}。</p>
  </section>

  <section id="s3">
    <h2 class="sec"><span class="num">03</span>已证伪的 ${red.length} 条 <span class="sec-time">别再引用</span></h2>
    <p class="sec-lead">以下断言与今天可查证的事实相反。<b>如果别处看到有人引用，可以直接用这里的来源反驳。</b></p>
    <table><thead><tr><th style="width:96px">编号</th><th>断言</th><th style="width:40%">今天的事实</th></tr></thead><tbody>
    ${red.map(r => `<tr><td><code>${esc(r.id)}</code></td><td>${esc(r.claim)}<div class="sm">${esc(r.at)}</div></td><td class="sm">${esc(r.finding)}</td></tr>`).join('')}
    </tbody></table>
  </section>

  <section id="s4">
    <h2 class="sec"><span class="num">04</span>这页不做的事</h2>
    <div class="two">
      <div class="note-box">
        <h4>不给操作建议</h4>
        <p>「该不该买房、该不该辞职、该不该买币」——本页一律不回答。标绿的条目只说明「这句与事实相符」，<b>不构成「照做」的理由</b>：事实成立不等于适合你。</p>
        <p>方法论条目给的是适用条件与边界，不是行动清单。</p>
      </div>
      <div class="note-box">
        <h4>趋势推演已另立板块</h4>
        <p>「用现在的数据 + 逻辑推演预测未来几年」已上线：<a href="outlook.html">未来推演</a>——情景式、弱断言、每个推演带证伪条件，全部标注为<b>编者自己的判断</b>，与孙宇晨的话分开。</p>
        <p>本页与它的分工：本页管「他的话哪些能信」（元层面），它管「接下来会怎样」（编者判断）。</p>
      </div>
    </div>
    <p class="sec-src" style="margin-top:16px"><span class="tag tag-mid">数据</span>全部分级依据来自卷三核对（53 条，每条挂公开来源）与结构化断言库（<code>data/claims.jsonl</code>，${rows.length} 条）。方法论提炼由编者加工，适用边界已逐条给出。</p>
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
  <a class="btn" href="volume3.html">← 卷三 · 十年之后回头看</a>
  <span class="bn-tip">可以拿走的部分 · 分级与方法论</span>
  <a class="btn" href="index.html">总览 →</a>
</div></div>

<footer>
  <div class="foot-inner">
    <p><b>本页：</b>对 ${rows.length} 条断言的可信度分级与 ${total} 条可迁移方法论。分级依据全部来自卷三的逐条核对（公开来源可复核）；方法论条目由编者提炼，适用边界已逐条给出。</p>
    <p><b>各页：</b><a href="index.html">总览</a> ·
    <a href="2016-2017-wealthfreedom.html">卷一 · 音频课</a> ·
    <a href="2026-interview.html">卷二 · 长访谈</a> ·
    <a href="volume3.html">卷三 · 十年之后回头看</a> ·
    <a href="takeaway.html">可以拿走的部分</a> ·
    <a href="audit.html">审计报告</a></p>
    <p><b>免责声明：</b>本页不构成任何投资建议、税务建议、医疗建议或人生建议。标「说中」只代表断言与公开数据相符，不构成「照做」的理由。方法论条目均已标注适用边界。孙宇晨本人是波场 TRON 创始人、加密资产的直接利益相关方。</p>
  </div>
</footer>
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
<script>window.SITE_META={"title":"可以拿走的部分：孙割观点使用说明 · 孙割这十年","desc":"136 条断言的可信度分级 + 10 条可迁移方法论。"};</script>
<script src="assets/site.js" defer></script>
<script>window.QQ_CONFIG={wxNote:'孙割这十年'};</script>
<script src="qqgroup.js" defer></script>
</body>
</html>
`;

fs.writeFileSync(ROOT + '/takeaway.html', html, 'utf8');
console.log('写出 takeaway.html  ' + html.length + ' 字符');
console.log('方法论 ' + total + ' 条 / 分级：green ' + green.length + ' yellow ' + yellow.length + ' red ' + red.length + ' gray ' + gray.length + ' | future ' + future.length + ' unv ' + unv.length);
