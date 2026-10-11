// Savvy Renter -- the Feedback button, the one copy every page uses.
// A page carries the button and its empty panel:
//   <div class="fbwrap"><button type="button" id="fbBtn" ...>&#9993; Feedback</button><div id="fbPanel" class="hidden"></div></div>
// and loads this file. The look stays in each page's own CSS (#fbBtn, #fbPanel, #fbClose).
//
// The address is never written into the page source. It is put together only
// when someone asks for it, which keeps the harvesters off it.
(function () {
  // A plain look for pages that have no feedback styles of their own. Every
  // selector is wrapped in :where(), which gives it no weight, so a page's own
  // #fbBtn / #fbPanel rules always win.
  var css = document.createElement('style');
  css.textContent =
    ':where(.brand .fbwrap){margin-left:auto;text-align:right;position:relative}' +
    ':where(#fbBtn){background:#0284c7;color:#fff;border:none;border-radius:5px;font-size:13px;font-weight:bold;padding:9px 14px;cursor:pointer;font-family:inherit}' +
    ':where(#fbBtn:hover){background:#0369a1}' +
    ':where(#fbPanel){position:absolute;top:0;right:0;z-index:20;width:470px;max-width:calc(100vw - 40px);box-sizing:border-box;background:#1e293b;border:1px solid #475569;border-radius:6px;padding:10px 30px 10px 12px;text-align:left;font-size:12.5px;color:#c9d4e0;line-height:1.5;box-shadow:0 6px 18px rgba(0,0,0,.45)}' +
    ':where(#fbPanel.hidden){display:none}' +
    ':where(#fbClose){position:absolute;top:4px;right:6px;background:none;border:none;color:#94a3b8;font-size:16px;line-height:1;padding:2px 5px;cursor:pointer;font-family:inherit}' +
    ':where(#fbPanel a){color:#38bdf8;font-weight:bold;text-decoration:none;font-size:14px}' +
    // In the menu bar: these carry two ids' weight, so they beat each page's own button styles.
    '#siteRibbon .rb-fb{position:absolute;margin:0;text-align:right;z-index:902}' +
    '#siteRibbon #fbBtn{background:#0284c7;color:#fff;border:1px solid #0284c7;border-radius:5px;font:inherit;font-size:13.5px;font-weight:600;padding:5px 11px;line-height:inherit;white-space:nowrap;cursor:pointer}' +
    '#siteRibbon #fbBtn:hover{background:#0369a1}' +
    '#siteRibbon.rb-m #fbBtn{font-size:15px;padding:6px 12px}' +
    '#siteRibbon.rb-m .rb-fbt{display:none}' +
    '#siteRibbon #fbPanel{top:calc(100% + 6px);right:0}' +
    '@media print{.fbwrap{display:none!important}}' +
    // With the menu bar on the page, the title-bar copy is never drawn at all,
    // so it cannot flash there before it is lifted into the bar.
    (document.getElementById('siteRibbon') ? '.fbwrap:not(.rb-fb){display:none!important}' : '');
  document.head.appendChild(css);

  function show() {
    var p = document.getElementById('fbPanel');
    if (!p) return;
    var who = ['feedback', 'savvyrenter.co.uk'].join('@');
    p.innerHTML =
      '<button type="button" id="fbClose" title="Close">✕</button>' +
      '<p style="margin:0 0 6px">Suggestions, corrections, or an open-source tool we could host — we read everything, though we can’t promise to answer every email. Use a suggestion and we’ll credit you on the page.</p>' +
      '<a href="mailto:' + who + '?subject=Savvy%20Renter%20feedback">' + who + '</a>';
    p.classList.remove('hidden');
    document.getElementById('fbClose').addEventListener('click', hide);
  }
  function hide() {
    var p = document.getElementById('fbPanel');
    if (p) p.classList.add('hidden');
  }
  // The button lives at the right-hand end of the site menu bar, which is the
  // same on every page, so it never moves from page to page. It is built there
  // the moment this file runs (the bar is already drawn by then), so it is on
  // screen with the bar instead of popping in once the page has loaded. Each
  // page's own title-bar copy is hidden, and removed once the page is in; it is
  // only used if a page has no menu bar.
  var nav = document.getElementById('siteRibbon');
  var brand = nav && nav.querySelector('.rb-brand');
  var wrap = null;
  function place() {
    if (!wrap) return;
    wrap.style.right = getComputedStyle(nav).paddingRight;
    wrap.style.top = Math.round(brand.offsetTop + (brand.offsetHeight - wrap.offsetHeight) / 2) + 'px';
  }
  if (nav && brand) {
    wrap = document.createElement('div');
    wrap.className = 'fbwrap rb-fb';
    wrap.innerHTML = '<button type="button" id="fbBtn" title="Like the site? Got a suggestion for something we can include? Send us some feedback.">' +
      '<span aria-hidden="true">\u2709</span><span class="rb-fbt"> Feedback</span></button><div id="fbPanel" class="hidden"></div>';
    nav.appendChild(wrap);
    wrap.querySelector('#fbBtn').addEventListener('click', show);
    place();
    window.addEventListener('resize', function () { requestAnimationFrame(place); });
    if (window.matchMedia) {
      var mq = window.matchMedia('(max-width:860px), (hover:none) and (pointer:coarse)');
      if (mq.addEventListener) mq.addEventListener('change', function () { requestAnimationFrame(place); });
    }
    var img = brand.querySelector('img');
    if (img && !img.complete) img.addEventListener('load', place);
  }
  function wire() {
    var old = document.querySelectorAll('.fbwrap:not(.rb-fb)');
    if (wrap) { for (var k = 0; k < old.length; k++) old[k].parentNode.removeChild(old[k]); place(); return; }
    var b = document.getElementById('fbBtn');
    if (b) b.addEventListener('click', show);
  }
  window.showFeedback = show;   // older pages may still call these by name
  window.hideFeedback = hide;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire); else wire();
})();
