/**
 * 给孙割这十年的 7 个页面：① 简化 QQ_CONFIG（去掉已作废的 siteName）
 * ② 在页脚之前插入「同一位作者的其他站点」引流区。
 *
 * 幂等：已带 .xsec 的页面跳过；重复执行结果一致。
 *
 * ⚠️ 这 7 页里 index / 卷一 / 卷二 由 _build/assemble.py 生成，
 * volume3 / takeaway / outlook 由各自的 gen_*.mjs 生成 ——
 * 本脚本只改产物，生成器那边要**手动同步同样的片段**，否则重跑会冲掉。
 *
 * 用法：node tools/add-xsec.cjs
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PAGES = [
  'index.html',
  '2016-2017-wealthfreedom.html',
  '2026-interview.html',
  'audit.html',
  'takeaway.html',
  'outlook.html',
  'volume3.html',
];

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

let touched = 0;
for (const f of PAGES) {
  const p = path.join(ROOT, f);
  if (!fs.existsSync(p)) { console.log('❌ 缺文件', f); continue; }
  const before = fs.readFileSync(p, 'utf8');
  let h = before.replace(OLD_CFG, NEW_CFG);

  if (!h.includes('class="xsec"')) {
    if (/<footer[ >]/.test(h)) h = h.replace(/<footer[ >]/, (m) => SECTION + '\n' + m);
    else h = h.replace('</body>', SECTION + '\n</body>');
  }

  if (h === before) { console.log('–  ' + f + '  无变化（已就位）'); continue; }
  fs.writeFileSync(p, h, 'utf8');
  touched++;
  console.log('✅ ' + f + '  ' + before.length + ' → ' + h.length);
}
console.log(`\n改了 ${touched} 个页面`);
