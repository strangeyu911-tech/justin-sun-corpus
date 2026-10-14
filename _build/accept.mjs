/* ============================================================
   accept.mjs — 真实浏览器交互验收

   静态自检（check.py）只能证明「标签配平、锚点存在、无行内样式」，
   证明不了顶部栏那三样 JS 交互真的能用：搜索会不会高亮、分享菜单会不会弹、
   日夜模式会不会切换、抽屉目录能不能开。这些是照搬「以日为镜」的核心交付，
   静态截图看不出来。

   所以用 Playwright 驱动本机已装的 Edge（不下载 Chromium）跑一遍真交互，
   逐条断言 + 出证据截图。

   前提：本地已起静态服务（脚本自己起自己关）。
   用法：node _build/accept.mjs [baseUrl]
   ============================================================ */
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(HERE);
const SHOTS = join(HERE, 'shots');
const PORT = 8777;
const BASE = process.argv[2] || `http://127.0.0.1:${PORT}/`;

/* playwright-core 可能装在项目里，也可能装在 WorkBuddy 的 node 工作区。
   ESM 的 import 不认 NODE_PATH（踩过），所以用 createRequire 逐个候选路径找。 */
const require = createRequire(import.meta.url);
function loadPlaywright() {
  const candidates = [
    'playwright-core',
    'playwright',
    ...(process.env.PLAYWRIGHT_HOME ? [join(process.env.PLAYWRIGHT_HOME, 'playwright-core')] : []),
    'C:/Users/23159/.workbuddy/binaries/node/workspace/node_modules/playwright-core',
  ];
  for (const c of candidates) {
    try { return require(c); } catch { /* 试下一个 */ }
  }
  console.error('找不到 playwright-core。装一个：npm i playwright-core（并用 PLAYWRIGHT_HOME 指向 node_modules）');
  process.exit(2);
}
const { chromium } = loadPlaywright();

const EDGE = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
].find(existsSync);
if (!EDGE) { console.error('未找到 msedge.exe'); process.exit(2); }

const results = [];
const check = (name, ok, detail) => {
  results.push({ name, ok: !!ok, detail: detail === undefined ? '' : String(detail) });
  console.log(`  [${ok ? 'PASS' : 'FAIL'}] ${name}${detail ? '  ' + detail : ''}`);
};
const section = (t) => console.log(`\n${t}`);

let server = null;
async function startServer() {
  if (process.argv[2]) return;
  const py = process.env.PYTHON || (process.platform === 'win32' ? 'python' : 'python3');
  server = spawn(py, ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'],
    { cwd: ROOT, stdio: 'ignore', shell: false });
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(BASE, { method: 'HEAD' });
      if (r.ok) return;
    } catch { /* 还没起来 */ }
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error('本地静态服务未能就绪');
}

mkdirSync(SHOTS, { recursive: true });

const errors = [];

try {
  await startServer();
  const browser = await chromium.launch({ executablePath: EDGE, headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });

  /* ================= 首页：搜索 / 分享 / 日夜模式 ================= */
  section('首页 index.html（全站索引检索）');
  await page.goto(BASE, { waitUntil: 'load' });

  // —— 日夜模式 ——
  const t0 = await page.getAttribute('html', 'data-theme');
  await page.click('#themebtn');
  const t1 = await page.getAttribute('html', 'data-theme');
  const persisted = await page.evaluate(() => localStorage.getItem('sycn-theme'));
  check('日夜模式切换并持久化', t0 !== t1 && persisted === t1, `${t0} → ${t1}（localStorage=${persisted}）`);
  await page.screenshot({ path: join(SHOTS, 'accept-index-dark.png') });
  await page.click('#themebtn');           // 切回浅色

  // —— 全站检索 ——
  await page.fill('#q', '财富自由');
  await page.waitForTimeout(400);
  const hits = await page.locator('#searchpanel .sp-hit').count();
  const cntTxt = (await page.textContent('#hitcount')) || '';
  const panelOpen = await page.locator('#searchpanel.open').count();
  check('站内检索命中并开面板', hits > 0 && /\d+\s*条/.test(cntTxt) && panelOpen === 1,
    `命中 ${hits} 条，计数「${cntTxt.trim()}」`);

  // 无命中时给的是引导文案而非空白
  await page.fill('#q', 'zzzz不存在的词zzzz');
  await page.waitForTimeout(400);
  const noneTxt = (await page.textContent('#searchpanel')) || '';
  check('检索无命中给出引导文案', noneTxt.includes('没有匹配'), '');
  await page.fill('#q', '');
  await page.waitForTimeout(300);
  await page.keyboard.press('Escape');

  // —— 分享菜单 ——
  await page.click('#sharebtn');
  await page.waitForTimeout(150);
  const smItems = await page.locator('#sharemenu .sm-item').count();
  const smOpen = await page.locator('#sharemenu.open').count();
  const aria = await page.getAttribute('#sharebtn', 'aria-expanded');
  check('分享菜单弹出且渠道齐备', smOpen === 1 && smItems === 12 && aria === 'true',
    `${smItems} 个渠道，aria-expanded=${aria}`);
  await page.screenshot({ path: join(SHOTS, 'accept-index-share.png') });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(120);
  check('Esc 可收起分享菜单', (await page.locator('#sharemenu.open').count()) === 0, '');

  /* ================= 卷一：正文高亮搜索 + 目录 + 进度 ================= */
  section('卷一 2016-2017-wealthfreedom.html（正文高亮检索）');
  await page.goto(BASE + '2016-2017-wealthfreedom.html', { waitUntil: 'load' });

  await page.fill('#q', '财富自由');
  await page.waitForTimeout(500);
  // 高亮的范围是「整页正文」，只排除顶部栏/目录/搜索面板/分享菜单/底部导航，
  // hero 与页脚是算在内的 —— 所以这里数全页 mark，不是只数 <main>。
  const marks = await page.locator('mark').count();
  const inMain = await page.locator('main mark').count();
  const volCnt = ((await page.textContent('#hitcount')) || '').trim();
  check('正文高亮命中且计数一致', marks > 0 && volCnt === `${marks} 处`,
    `mark ${marks} 处（<main> 内 ${inMain}），计数「${volCnt}」`);

  // 高亮不得污染顶部栏 / 目录 / 分享菜单
  const leaked = await page.evaluate(() =>
    [...document.querySelectorAll('mark')].filter((m) =>
      m.closest('.topbar,#toc,#searchpanel,#sharemenu,.bottomnav')).length);
  check('高亮不污染顶部栏与目录', leaked === 0, `越界 ${leaked} 处`);
  await page.screenshot({ path: join(SHOTS, 'accept-vol1-search.png') });

  await page.keyboard.press('Escape');
  await page.waitForTimeout(250);
  check('Esc 清除全部高亮',
    (await page.locator('mark').count()) === 0 &&
    ((await page.textContent('#hitcount')) || '').trim() === '', '');

  // —— 抽屉目录手风琴 ——
  const groupCount = await page.locator('#toc .toc-group').count();
  const caret = page.locator('#toc .toc-group .toc-caret').first();
  const before = await page.locator('#toc .toc-group.open').count();
  await caret.click();
  await page.waitForTimeout(150);
  const after = await page.locator('#toc .toc-group.open').count();
  check('目录篇目可展开/收起', groupCount > 0 && before !== after,
    `${groupCount} 篇，展开数 ${before} → ${after}`);

  // —— 阅读进度条 + 滚动联动 ——
  await page.evaluate(() => window.scrollTo(0, 6000));
  await page.waitForTimeout(400);
  const prog = await page.evaluate(() => document.getElementById('progress').style.width);
  const active = await page.locator('#toc a.active').count();
  check('滚动更新进度条与当前项联动', parseFloat(prog) > 0 && active >= 1,
    `进度 ${prog}，目录高亮 ${active} 项`);

  /* ================= 移动端：抽屉目录 ================= */
  section('移动端 420px');
  await page.setViewportSize({ width: 420, height: 900 });
  await page.goto(BASE + '2026-interview.html', { waitUntil: 'load' });
  const hamburgerVisible = await page.locator('#tocbtn').isVisible();
  check('窄屏出现汉堡按钮', hamburgerVisible, '');
  await page.click('#tocbtn');
  await page.waitForTimeout(350);
  const drawerOpen = await page.locator('#toc.open').count();
  const maskShown = await page.locator('#toc-mask.show').count();
  check('抽屉目录可开启并带遮罩', drawerOpen === 1 && maskShown === 1, '');
  await page.screenshot({ path: join(SHOTS, 'accept-mobile-toc.png') });

  /* ================= 四页通检：无脚本报错 ================= */
  section('四页加载通检');
  for (const f of ['index.html', '2016-2017-wealthfreedom.html', '2026-interview.html', 'audit.html']) {
    const p = await ctx.newPage();
    p.on('pageerror', (e) => errors.push(`${f} pageerror: ${e.message}`));
    p.on('console', (m) => { if (m.type() === 'error') errors.push(`${f} console: ${m.text()}`); });
    const resp = await p.goto(BASE + f, { waitUntil: 'load' });
    await p.waitForTimeout(250);
    const title = await p.title();
    const topbar = await p.locator('.topbar .tb-col').count();
    check(`${f} 正常渲染`, resp.status() === 200 && title.length > 0 && topbar === 1,
      `${resp.status()} · 「${title}」`);
    await p.close();
  }

  check('运行期无脚本报错', errors.length === 0,
    errors.length ? errors.slice(0, 3).join(' | ') : '0 条');

  await browser.close();
} catch (e) {
  check('验收脚本自身异常', false, e.message);
} finally {
  if (server) { try { server.kill(); } catch { /* ignore */ } }
}

const failed = results.filter((r) => !r.ok);
console.log(`\n验收：${results.length - failed.length} / ${results.length} 通过` +
  (failed.length ? `，失败项：${failed.map((f) => f.name).join('、')}` : ''));
process.exit(failed.length ? 1 : 0);
