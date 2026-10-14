/* ============================================================
   孙宇晨语料库 · 共享脚本
   顶部栏（搜索 / 分享 / GitHub / 日夜模式）、进度条、抽屉目录、
   滚动联动，写法沿用 mirror.strangeyu.xyz（以日为镜）。
   ============================================================ */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- 轻提示 ---------- */
  function toast(msg) {
    var t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = 'position:fixed;left:50%;bottom:74px;transform:translateX(-50%);' +
      'background:var(--teal);color:#fbfaf8;padding:10px 18px;border-radius:8px;' +
      'z-index:999;font-size:14px;box-shadow:0 8px 24px rgba(0,0,0,.18)';
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2200);
  }
  window.siteToast = toast;

  /* ---------- 日夜模式（照搬以日为镜） ---------- */
  (function () {
    var KEY = 'sycn-theme';
    var t = localStorage.getItem(KEY) || 'light';
    document.documentElement.setAttribute('data-theme', t);
    var btn = $('#themebtn');
    if (!btn) return;
    function sync() {
      btn.setAttribute('aria-checked',
        document.documentElement.getAttribute('data-theme') === 'dark' ? 'true' : 'false');
    }
    btn.onclick = function () {
      var cur = document.documentElement.getAttribute('data-theme');
      var nx = cur === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', nx);
      localStorage.setItem(KEY, nx);
      sync();
    };
    sync();
  })();

  /* ---------- 顶部阅读进度条 ---------- */
  (function () {
    var el = $('#progress');
    if (!el) return;
    window.addEventListener('scroll', function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      el.style.width = (max > 0 ? (h.scrollTop / max * 100) : 0) + '%';
    }, { passive: true });
  })();

  /* ---------- 抽屉目录 + 手风琴 + 滚动联动 ---------- */
  (function () {
    var nav = $('#toc');
    if (!nav) return;
    var btn = $('#tocbtn'), mask = $('#toc-mask');

    function drawer(open) {
      nav.classList.toggle('open', open);
      if (mask) mask.classList.toggle('show', open);
    }
    if (btn) btn.onclick = function () { drawer(!nav.classList.contains('open')); };
    if (mask) mask.onclick = function () { drawer(false); };
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) drawer(false);
    });
    // 点击目录里的链接后自动收起（仅抽屉模式）
    nav.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a');
      if (a && window.matchMedia('(max-width:1119px)').matches) drawer(false);
    });

    var groups = $$('.toc-group', nav);
    var subs = $$('.toc-subgroup', nav);

    function setGroup(g, open) {
      g.classList.toggle('open', open);
      var c = $('.toc-caret', g), t = $('.toc-title-link', g);
      if (c) {
        c.setAttribute('aria-expanded', open ? 'true' : 'false');
        c.setAttribute('aria-label', (open ? '收起' : '展开') + (t ? t.textContent : ''));
      }
    }
    function setSub(sg, open) {
      sg.classList.toggle('open', open);
      var h = $('.toc-subhead', sg);
      if (h) h.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    function openOnlyGroup(g) { groups.forEach(function (o) { setGroup(o, o === g); }); }
    function openOnlySub(sg) { subs.forEach(function (o) { setSub(o, o === sg); }); }

    groups.forEach(function (g) {
      var caret = $('.toc-caret', g), title = $('.toc-title-link', g);
      if (caret) caret.onclick = function (e) {
        e.preventDefault(); e.stopPropagation();
        setGroup(g, !g.classList.contains('open'));
      };
      // 点篇名：只展开本篇，并短暂锁定滚动联动，避免跳转途中被改掉
      if (title) title.onclick = function () {
        setGroup(g, true);
        groups.forEach(function (o) { if (o !== g) setGroup(o, false); });
        nav._jlock = Date.now() + 1200;
      };
    });
    subs.forEach(function (sg) {
      var h = $('.toc-subhead', sg);
      if (h) h.onclick = function () { setSub(sg, !sg.classList.contains('open')); };
    });
    var exp = $('#toc-expand'), col = $('#toc-collapse');
    if (exp) exp.onclick = function () {
      groups.forEach(function (g) { setGroup(g, true); });
      subs.forEach(function (sg) { setSub(sg, true); });
    };
    if (col) col.onclick = function () {
      groups.forEach(function (g) { setGroup(g, false); });
      subs.forEach(function (sg) { setSub(sg, false); });
      clearActive();
    };

    /* 收集所有可定位的目录项，按文档顺序 + 层级决定「当前项」 */
    var order = new Map();
    $$('body *').forEach(function (el, i) { order.set(el, i); });
    var items = [];
    function add(sel, lvl) {
      $$(sel, nav).forEach(function (a) {
        var href = a.getAttribute('href') || '';
        if (href.charAt(0) !== '#') return;
        var el = document.getElementById(href.slice(1));
        if (!el) return;
        items.push({ a: a, el: el, lvl: lvl, di: order.get(el) || 0 });
      });
    }
    add('a.solo', 1);
    add('.toc-title-link', 2);
    add('a.lvl2', 3);
    add('a.lvl3', 4);
    if (!items.length) return;

    var activeA = null;
    function setActive(a) {
      if (activeA === a) return;
      if (activeA) activeA.classList.remove('active');
      activeA = a;
      if (a) a.classList.add('active');
    }
    function clearActive() { setActive(null); }

    var ticking = false;
    function spy() {
      ticking = false;
      if (nav._jlock && Date.now() < nav._jlock) return;
      var threshold = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--bar-h'), 10) + 58;
      if (!threshold || isNaN(threshold)) threshold = 116;
      var best = null;
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        if (it.el.getBoundingClientRect().top > threshold) continue;
        if (!best || it.di > best.di || (it.di === best.di && it.lvl > best.lvl)) best = it;
      }
      if (!best) { clearActive(); return; }
      var g = best.a.closest('.toc-group');
      if (g && !g.classList.contains('open')) openOnlyGroup(g);
      var sg = best.a.closest('.toc-subgroup');
      if (sg && !sg.classList.contains('open')) openOnlySub(sg);
      setActive(best.a);
    }
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(spy);
    }, { passive: true });
    window.addEventListener('resize', spy);

    // 首屏：按 hash 展开对应篇/子分组，再定位一次
    if (location.hash) {
      var hl = null;
      try { hl = nav.querySelector('a[href="' + location.hash + '"]'); } catch (e) { }
      if (hl) {
        var hg = hl.closest('.toc-group'); if (hg) openOnlyGroup(hg);
        var hs = hl.closest('.toc-subgroup'); if (hs) openOnlySub(hs);
      }
    }
    spy();
  })();

  /* ---------- 搜索：正文高亮 或 全站索引 ---------- */
  (function () {
    var input = $('#q'), cnt = $('#hitcount');
    if (!input) return;
    var panel = $('#searchpanel');
    var isSite = !!(window.SITE_INDEX && window.SITE_INDEX.length);

    function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

    /* --- 正文高亮（按文本节点，不碰标签，避免破坏页面结构） --- */
    function clearMarks() {
      $$('mark').forEach(function (m) {
        var p = m.parentNode;
        if (!p) return;
        p.replaceChild(document.createTextNode(m.textContent), m);
        p.normalize();
      });
    }
    function markText(re, counter) {
      var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode: function (n) {
          if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          var p = n.parentNode;
          if (!p) return NodeFilter.FILTER_REJECT;
          var tag = p.nodeName;
          if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'MARK' || tag === 'TEXTAREA' || tag === 'NOSCRIPT') {
            return NodeFilter.FILTER_REJECT;
          }
          if (p.closest && p.closest('.topbar,#toc,#searchpanel,#sharemenu,.bottomnav')) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      });
      var nodes = [], n;
      while ((n = walker.nextNode())) nodes.push(n);
      nodes.forEach(function (node) {
        var txt = node.nodeValue, m, last = 0, frag = null;
        re.lastIndex = 0;
        while ((m = re.exec(txt))) {
          counter.n++;
          if (!frag) frag = document.createDocumentFragment();
          if (m.index > last) frag.appendChild(document.createTextNode(txt.slice(last, m.index)));
          var mk = document.createElement('mark');
          mk.textContent = m[0];
          frag.appendChild(mk);
          last = m.index + m[0].length;
          if (m[0].length === 0) re.lastIndex++;
        }
        if (frag) {
          if (last < txt.length) frag.appendChild(document.createTextNode(txt.slice(last)));
          node.parentNode.replaceChild(frag, node);
        }
      });
    }

    /* --- 全站索引检索 --- */
    function siteSearch(v) {
      var words = v.toLowerCase().split(/\s+/).filter(Boolean);
      var hits = window.SITE_INDEX.filter(function (it) {
        var hay = (it.t + ' ' + (it.k || '') + ' ' + it.vol).toLowerCase();
        return words.every(function (w) { return hay.indexOf(w) >= 0; });
      });
      if (!panel) return hits.length;
      if (!hits.length) {
        panel.innerHTML = '<div class="sp-in"><div class="sp-none">没有匹配的条目。换个词试试，' +
          '或直接进入卷一的「全 156 讲逐讲索引」、卷二的「概念词典」逐条翻。</div></div>';
        panel.classList.add('open');
        return 0;
      }
      var html = '<div class="sp-in"><div class="sp-hd">全站检索 · 命中 ' + hits.length + ' 条' +
        (hits.length > 60 ? '（只显示前 60 条）' : '') + '</div>';
      hits.slice(0, 60).forEach(function (it) {
        html += '<a class="sp-hit" href="' + it.u + '"><span class="sp-vol">' + it.vol + '</span>' +
          '<span class="sp-t">' + it.t + '</span>' +
          (it.k ? '<span class="sp-k">' + it.k + '</span>' : '') + '</a>';
      });
      html += '</div>';
      panel.innerHTML = html;
      panel.classList.add('open');
      return hits.length;
    }

    function run() {
      var v = input.value.trim();
      if (isSite) {
        if (panel) { panel.classList.remove('open'); panel.innerHTML = ''; }
        if (!v) { if (cnt) cnt.textContent = ''; return; }
        var n = siteSearch(v);
        if (cnt) cnt.textContent = n + ' 条';
        return;
      }
      clearMarks();
      if (cnt) cnt.textContent = '';
      if (!v) return;
      var re = new RegExp('(' + escRe(v) + ')', 'gi');
      var counter = { n: 0 };
      markText(re, counter);
      if (cnt) cnt.textContent = counter.n + ' 处';
      var first = document.querySelector('main mark') || document.querySelector('mark');
      if (first) first.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }

    var timer = null;
    input.addEventListener('input', function () {
      if (timer) clearTimeout(timer);
      timer = setTimeout(run, 180);
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { if (timer) clearTimeout(timer); run(); }
    });

    // “/” 聚焦搜索，Esc 失焦并清空高亮
    document.addEventListener('keydown', function (e) {
      var tag = ((e.target && e.target.tagName) || '').toLowerCase();
      if (e.key === '/' && tag !== 'input' && tag !== 'textarea') { e.preventDefault(); input.focus(); }
      if (e.key === 'Escape' && e.target === input) {
        input.blur();
        if (isSite) { if (panel) { panel.classList.remove('open'); } }
        else { clearMarks(); if (cnt) cnt.textContent = ''; }
      }
    });
  })();

  /* ---------- 分享菜单（照搬以日为镜的 12 渠道） ---------- */
  (function () {
    var shareBtn = $('#sharebtn'), menu = $('#sharemenu');
    if (!shareBtn || !menu) return;
    var qrBox = $('#qrbox'), qrEl = $('#qrcode');
    var META = window.SITE_META || {};
    function shareUrl() {
      return location.origin + location.pathname.replace(/index\.html$/, '');
    }
    var TITLE = META.title || document.title;
    var DESC = META.desc || '';
    var OG = META.og || (shareUrl() + 'assets/og.png');
    function enc(s) { return encodeURIComponent(s); }
    function openWin(u) { window.open(u, '_share', 'width=640,height=580'); }
    var builders = {
      weibo: function () { return 'https://service.weibo.com/share/share.php?url=' + enc(shareUrl()) + '&title=' + enc(TITLE + ' ' + DESC) + '&pic=' + enc(OG); },
      qq: function () { return 'https://connect.qq.com/widget/shareqq/index.html?url=' + enc(shareUrl()) + '&title=' + enc(TITLE) + '&desc=' + enc(DESC) + '&pics=' + enc(OG); },
      facebook: function () { return 'https://www.facebook.com/sharer/sharer.php?u=' + enc(shareUrl()); },
      twitter: function () { return 'https://x.com/intent/tweet?url=' + enc(shareUrl()) + '&text=' + enc(TITLE + ' ' + DESC); },
      telegram: function () { return 'https://t.me/share/url?url=' + enc(shareUrl()) + '&text=' + enc(TITLE + ' ' + DESC); },
      reddit: function () { return 'https://www.reddit.com/submit?url=' + enc(shareUrl()) + '&title=' + enc(TITLE); },
      linkedin: function () { return 'https://www.linkedin.com/sharing/share-offsite/?url=' + enc(shareUrl()); },
      whatsapp: function () { return 'https://api.whatsapp.com/send?text=' + enc(TITLE + ' ' + shareUrl()); },
      line: function () { return 'https://social-plugins.line.me/lineit/share?url=' + enc(shareUrl()); }
    };
    function fallbackCopy(u, ok) {
      var ta = document.createElement('textarea');
      ta.value = u; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); ok(); }
      catch (e) { toast('复制失败，请手动复制地址栏链接'); }
      ta.remove();
    }
    function setMenu(o) {
      menu.classList.toggle('open', o);
      shareBtn.setAttribute('aria-expanded', o ? 'true' : 'false');
      if (!o && qrBox) qrBox.hidden = true;
    }
    shareBtn.onclick = function (e) { e.stopPropagation(); setMenu(!menu.classList.contains('open')); };
    document.addEventListener('click', function (e) {
      if (menu.classList.contains('open') && !menu.contains(e.target) && !shareBtn.contains(e.target)) setMenu(false);
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

    $$('.sm-item', menu).forEach(function (it) {
      it.addEventListener('click', function () {
        var ch = it.dataset.ch;
        if (ch === 'native') {
          if (navigator.share) navigator.share({ title: TITLE, text: DESC, url: shareUrl() }).catch(function () { });
          else toast('请用「复制链接」，粘贴到微信 / QQ 即显示卡片');
        } else if (ch === 'copy') {
          var u = shareUrl();
          function ok() { toast('链接已复制，粘贴到微信 / QQ 即显示卡片'); }
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(u).then(ok, function () { fallbackCopy(u, ok); });
          } else fallbackCopy(u, ok);
        } else if (ch === 'qrcode') {
          if (!qrBox) return;
          qrBox.hidden = false;
          if (qrEl && !qrEl.hasChildNodes()) {
            if (window.QRCode) {
              new QRCode(qrEl, {
                text: shareUrl(), width: 150, height: 150,
                colorDark: '#0f766e', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.M
              });
            } else {
              qrEl.textContent = '二维码库未加载，请改用「复制链接」';
            }
          }
        } else if (builders[ch]) openWin(builders[ch]());
      });
    });
  })();

  /* ---------- 移动端：搜索框收起为放大镜，点开下拉整行 ---------- */
  (function () {
    var mSearch = $('#msearch'), mIn = $('#msearchin');
    var tbCol = $('.tb-col'), shareWrap = $('.share-wrap');
    if (!mSearch || !mIn || !tbCol || !shareWrap) return;
    var searchbox = $('.searchbox', tbCol), input = $('#q');
    if (!searchbox || !input) return;
    var mq = window.matchMedia('(max-width:480px)');
    function closeSearch() {
      if (searchbox.parentNode !== mIn) return;
      tbCol.insertBefore(searchbox, shareWrap);
      mSearch.classList.remove('open');
    }
    function openSearch() {
      if (!mq.matches) { input.focus(); return; }
      mIn.appendChild(searchbox);
      mSearch.classList.add('open');
      input.focus();
    }
    searchbox.addEventListener('click', function () {
      if (mq.matches && searchbox.parentNode !== mIn) openSearch();
    });
    input.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSearch(); });
    input.addEventListener('blur', function () {
      setTimeout(function () {
        if (searchbox.parentNode === mIn && !mIn.contains(document.activeElement)) closeSearch();
      }, 120);
    });
    mq.addEventListener('change', function (ev) { if (!ev.matches) closeSearch(); });
  })();

  /* ---------- 外链统一加 rel ---------- */
  (function () {
    $$('a[target="_blank"]').forEach(function (a) {
      if (!a.rel) a.rel = 'noopener';
    });
  })();
})();
