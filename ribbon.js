// Savvy Renter top ribbon menu -- the ONE place the ribbon's links live.
// A page carries <nav id="siteRibbon"></nav> and <script src="ribbon.js"></script>
// as the first thing in its body;
// this fills it in, styles it, and highlights the page you are on.
//
// The ribbon is one row on a wide screen. As the screen narrows the items wrap
// onto a second row, then a third, so nothing is hidden behind a hamburger.
// Each section opens a panel of its links under it. Click to open; it also
// opens on hover where there is a mouse.
//
// Phones, tablets and any window under 860px get the mobile menu instead: one
// slim bar with a "Menu" button before the logo, which opens the sections as a
// list down the left, each section opening its links beneath it. Add ?m=1 to any
// address to see the mobile menu on a computer (it stays on while you click
// around); ?m=0 goes back to choosing by screen.
// ---- Opened inside the front page's tool view (?embed=1) ----------------
// The front page shows a tool full screen with its own "All tools" bar, so the
// ribbon and the page's top strip are hidden. A postcode handed over (?pc=...)
// goes into the page's postcode box and is looked up straight away. Answers
// started in a box (?set=[[selector, value], ...]) are filled in once the page
// has finished loading, as if typed; true/false ticks or clears a box.
(function () {
  var q;
  try { q = new URLSearchParams(location.search); } catch (e) { return; }
  var pc = q.get('pc'), set = null;
  try { set = JSON.parse(q.get('set') || 'null'); } catch (e) { set = null; }
  if (Array.isArray(set)) window.addEventListener('load', function () {
    set.forEach(function (pair) {
      var t;
      try { t = document.querySelector(pair[0]); } catch (e) { return; }
      if (!t) return;
      if (typeof pair[1] === 'boolean') t.checked = pair[1]; else t.value = pair[1];
      t.dispatchEvent(new Event('input', { bubbles: true }));
      t.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });
  if (q.get('embed') === '1') {
    document.documentElement.classList.add('sr-embed');
    var st = document.createElement('style');
    st.textContent = 'html.sr-embed #siteRibbon,html.sr-embed .pagebar{display:none!important}';
    document.head.appendChild(st);
  }
  if (!pc) return;
  function fill() {
    var box = document.getElementById('pc') || document.getElementById('pC');
    if (!box) return;
    box.value = pc;
    if (typeof window.look === 'function') window.look();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fill); else fill();
})();

(function () {
  var NAV = [
    { label: 'Home', href: 'index.html' },
    { label: 'Location', items: [
      ['area.html', 'What rent costs here'],
      ['counciltax.html', 'Council tax here'] ] },
    { label: 'Tenancy & Rent', items: [
      ['before-you-rent.html', 'Before you rent'],
      ['viewing-notes.html', 'Viewing notes'],
      ['moving-in_audit.html', 'Moving in audit'],
      ['section_8_eviction_defense_advisor.html', 'Section 8 notice checker'] ] },
    { label: 'Money', items: [
      ['interest.html', 'Interest owed to you'],
      ['arrears.html', 'Paying off arrears'],
      ['benefits.html', 'Benefit entitlements'],
      ['incoming-benefit-calc.html', 'Record of income'] ] },
    { label: 'Redaction', items: [
      ['bank-statement-redaction.html', 'Redact a statement page'],
      ['bank-statement-split.html', 'Split a PDF into pages'],
      ['bank-statement-rename.html', 'Name statements by date'] ] },
    { label: 'Complaints & Claims', items: [
      ['letters.html', 'Template letters'],
      ['PRS_Tenant_Workspace.html', 'PRS complaint'],
      ['TPO_Tenant_Workspace.html', 'TPO complaint'],
      ['court_forms_workspace.html', 'Money Claim Online'],
      ['scrubber.html', 'Web page data scrubber'] ] },
    { label: 'Resources', href: 'resources.html' },
    { label: 'About', href: 'about.html' }
  ];

  var nav = document.getElementById('siteRibbon');
  if (!nav) return;
  var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  var css = document.createElement('style');
  css.textContent =
    '#siteRibbon{position:sticky;top:0;z-index:900;background:#0b1220;border-bottom:1px solid #1e293b;' +
      'display:flex;flex-wrap:wrap;align-items:center;gap:4px 6px;padding:6px 18px;box-sizing:border-box}' +
    '#siteRibbon .rb-brand{display:flex;align-items:center;gap:8px;color:#f8fafc;font-weight:800;font-size:16px;' +
      'text-decoration:none;margin-right:6px;white-space:nowrap}' +
    '#siteRibbon .rb-brand img{height:30px;width:auto;border-radius:5px}' +
    '#siteRibbon .rb-list{display:flex;flex-wrap:wrap;justify-content:center;gap:4px;list-style:none;margin:0;padding:0;flex:1 1 auto}' +
    '#siteRibbon .rb-item{position:relative}' +
    '#siteRibbon .rb-link,#siteRibbon .rb-cat{display:block;background:#1e293b;border:1px solid #334155;color:#e2e8f0;' +
      'font:inherit;font-size:13.5px;font-weight:600;padding:5px 11px;border-radius:5px;cursor:pointer;text-decoration:none;white-space:nowrap}' +
    '#siteRibbon .rb-cat::after{content:" \\25BE";font-size:11px;color:#94a3b8}' +
    '#siteRibbon .rb-item.open>.rb-cat::after{content:" \\25B4"}' +
    '#siteRibbon .rb-link:hover,#siteRibbon .rb-cat:hover,#siteRibbon .rb-item.open>.rb-cat{background:#334155;border-color:#0284c7;color:#fff}' +
    '#siteRibbon .rb-on,#siteRibbon .rb-here>.rb-cat{border-color:#38bdf8;color:#38bdf8}' +
    '#siteRibbon .rb-panel{display:none;position:absolute;top:100%;left:0;min-width:240px;z-index:901;' +
      'background:#1e293b;border:1px solid #334155;border-top:3px solid #0284c7;border-radius:7px;padding:8px;' +
      'box-shadow:0 8px 20px rgba(0,0,0,.5);list-style:none;margin:0}' +
    '#siteRibbon .rb-item.open>.rb-panel{display:block}' +
    '#siteRibbon .rb-panel a{display:block;background:#0284c7;color:#fff;text-decoration:none;font-weight:bold;' +
      'font-size:14px;padding:6px 12px;border-radius:5px;margin-bottom:6px}' +
    '#siteRibbon .rb-panel li:last-child a{margin-bottom:0}' +
    '#siteRibbon .rb-panel a:hover{background:#0369a1}' +
    '#siteRibbon .rb-panel a.rb-on{background:#38bdf8;color:#0f172a}' +
    // The mobile menu: a slim bar that scrolls away with the page, the sections
    // listed full width under it when Menu is pressed.
    '#siteRibbon .rb-burger{display:none}' +
    '#siteRibbon.rb-m{position:relative}' +
    '#siteRibbon.rb-m .rb-burger{display:block;order:-1;margin-right:4px;background:#1e293b;border:1px solid #334155;color:#e2e8f0;' +
      'font:inherit;font-size:15px;font-weight:700;padding:6px 14px;border-radius:5px;cursor:pointer;white-space:nowrap}' +
    '#siteRibbon.rb-m.rb-open .rb-burger{border-color:#0284c7;background:#334155;color:#fff}' +
    '#siteRibbon.rb-m .rb-list{display:none;flex:1 1 100%;flex-direction:column;flex-wrap:nowrap;gap:4px;margin:6px 0 2px!important}' +
    '#siteRibbon.rb-m.rb-open .rb-list{display:flex}' +
    '#siteRibbon.rb-m .rb-item{position:static;width:100%;max-width:320px}' +
    '#siteRibbon.rb-m .rb-link,#siteRibbon.rb-m .rb-cat{width:100%;box-sizing:border-box;text-align:left;font-size:15px;padding:9px 12px}' +
    '#siteRibbon.rb-m .rb-cat::after{float:right}' +
    '#siteRibbon.rb-m .rb-panel{position:static;min-width:0;margin-top:4px;box-shadow:none}' +
    '#siteRibbon.rb-m .rb-panel a{font-size:15px;padding:9px 12px}' +
    '@media print{#siteRibbon{display:none!important}}' +
    // Older pages were laid out round the old left-hand menu: give them the full width.
    '.rail{display:none!important}main.page,.page{margin-left:0!important}';
  document.head.appendChild(css);

  var html = '<a class="rb-brand" href="index.html" title="Savvy Renter home"><img src="SavvyRenter-sml.png" alt="Savvy Renter"><span>Savvy Renter</span></a>' +
    '<button type="button" class="rb-burger" aria-expanded="false" aria-controls="rbList">\u2630 Menu</button><ul class="rb-list" id="rbList">';
  NAV.forEach(function (n, i) {
    if (n.href) {
      html += '<li class="rb-item"><a class="rb-link' + (n.href.toLowerCase() === here ? ' rb-on' : '') + '" href="' + n.href + '">' + esc(n.label) + '</a></li>';
      return;
    }
    var isHere = n.items.some(function (it) { return it[0].toLowerCase() === here; });
    html += '<li class="rb-item' + (isHere ? ' rb-here' : '') + '"><button type="button" class="rb-cat" aria-expanded="false" aria-controls="rbp' + i + '">' +
      esc(n.label) + '</button><ul class="rb-panel" id="rbp' + i + '">';
    n.items.forEach(function (it) {
      html += '<li><a href="' + it[0] + '"' + (it[0].toLowerCase() === here ? ' class="rb-on"' : '') + '>' + esc(it[1]) + '</a></li>';
    });
    html += '</ul></li>';
  });
  nav.innerHTML = html + '</ul>';

  // Edge to edge across the window, whatever padding or width the page gives its
  // body, and level with the very top. Measured, so no page needs changing.
  // Its contents line up with the page column (1180px wide, centred, the same
  // 18px / 12px edge the pages use), and the links sit centred on the page.
  var PAGE = 1180, list = nav.querySelector('.rb-list'), brand = nav.querySelector('.rb-brand');
  function bleed() {
    nav.style.marginLeft = nav.style.width = '';
    var r = nav.getBoundingClientRect();
    var cw = document.documentElement.clientWidth, phone = cw <= 700, mob = nav.classList.contains('rb-m');
    nav.style.width = cw + 'px';
    nav.style.marginLeft = (-r.left - window.scrollX) + 'px';
    var side = Math.max(phone ? 12 : 18, (cw - PAGE) / 2);
    nav.style.paddingLeft = nav.style.paddingRight = side + 'px';
    list.style.marginRight = (phone || mob) ? '' : (brand.offsetWidth + 12) + 'px';
    // Wrapped under the logo: nothing to balance, so centre on the full width.
    if (!mob && list.getBoundingClientRect().top >= brand.getBoundingClientRect().bottom) list.style.marginRight = '';
  }
  // Mobile menu or ribbon. ?m=1 / ?m=0 is remembered for this browser tab only.
  var forced = null;
  try {
    var mq = new URLSearchParams(location.search).get('m');
    if (mq === '1') sessionStorage.setItem('sr-m', '1');
    if (mq === '0') sessionStorage.removeItem('sr-m');
    if (sessionStorage.getItem('sr-m') === '1') forced = true;
  } catch (e) { /* no storage: choose by screen */ }
  var small = window.matchMedia('(max-width:860px), (hover:none) and (pointer:coarse)');
  var burger = nav.querySelector('.rb-burger');
  function setMenu(open) {
    nav.classList.toggle('rb-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.textContent = open ? '\u2715 Close' : '\u2630 Menu';
    if (open) { var h = nav.querySelector('.rb-item.rb-here'); if (h) setOpen(h, true); }
  }
  function mode() {
    var on = forced || small.matches;
    nav.classList.toggle('rb-m', on);
    if (!on) setMenu(false);
    bleed();
  }
  burger.addEventListener('click', function () { setMenu(!nav.classList.contains('rb-open')); });
  var top = nav.getBoundingClientRect().top + window.scrollY;
  if (top > 0 && top < 60) nav.style.marginTop = (-top) + 'px';
  mode();
  window.addEventListener('resize', bleed);
  if (small.addEventListener) small.addEventListener('change', mode); else if (small.addListener) small.addListener(mode);
  var logo = brand.querySelector('img');
  if (logo && !logo.complete) logo.addEventListener('load', bleed);

  var items = nav.querySelectorAll('.rb-item');
  function closeAll(except) {
    for (var k = 0; k < items.length; k++) {
      if (items[k] === except) continue;
      items[k].classList.remove('open');
      var b = items[k].querySelector('.rb-cat');
      if (b) b.setAttribute('aria-expanded', 'false');
    }
  }
  function setOpen(item, on) {
    closeAll(item);
    item.classList.toggle('open', on);
    item.querySelector('.rb-cat').setAttribute('aria-expanded', on ? 'true' : 'false');
  }
  var mouse = window.matchMedia('(hover:hover) and (pointer:fine)');
  Array.prototype.forEach.call(nav.querySelectorAll('.rb-cat'), function (btn) {
    var item = btn.parentElement;
    btn.addEventListener('click', function () { setOpen(item, !item.classList.contains('open')); });
    item.addEventListener('mouseenter', function () { if (mouse.matches && !nav.classList.contains('rb-m')) setOpen(item, true); });
    item.addEventListener('mouseleave', function () { if (mouse.matches && !nav.classList.contains('rb-m')) setOpen(item, false); });
  });
  document.addEventListener('click', function (e) { if (!nav.contains(e.target)) { closeAll(null); setMenu(false); } });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeAll(null); setMenu(false); } });
})();
