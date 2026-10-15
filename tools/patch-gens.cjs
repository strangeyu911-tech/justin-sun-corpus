// 给 _build 里三个 mjs 生成器（volume3 / takeaway / outlook）同步：
//   ① 在 <footer> 之前插入「同一位作者的其他站点」引流区
//   ② 简化 QQ_CONFIG（去掉已作废的 siteName）
// 幂等。用法：node tools/patch-gens.cjs
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const GENS = ['_build/gen_vol3.mjs', '_build/gen_takeaway.mjs', '_build/gen_outlook.mjs'];

const SECTION = `<section class="xsec">
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
`;

const OLD_CFG = "<script>window.QQ_CONFIG={siteName:'孙割这十年',wxNote:'孙割这十年'};</script>";
const NEW_CFG = "<script>window.QQ_CONFIG={wxNote:'孙割这十年'};</script>";

for (const f of GENS) {
  const p = path.join(ROOT, f);
  const before = fs.readFileSync(p, 'utf8');
  let h = before.replace(OLD_CFG, NEW_CFG);
  if (!h.includes('class="xsec"')) {
    if (/<footer[ >]/.test(h)) h = h.replace(/<footer[ >]/, (m) => SECTION + '\n' + m);
    else { console.log('❌ ' + f + ' 找不到 <footer>，跳过'); continue; }
  }
  if (h === before) { console.log('–  ' + f + '  无变化'); continue; }
  fs.writeFileSync(p, h, 'utf8');
  console.log('✅ ' + f + '  ' + before.length + ' → ' + h.length);
}
