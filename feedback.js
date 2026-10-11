// Savvy Renter -- the Feedback button, the one copy every page uses.
// A page carries the button and its empty panel:
//   <div class="fbwrap"><button type="button" id="fbBtn" ...>&#9993; Feedback</button><div id="fbPanel" class="hidden"></div></div>
// and loads this file. The look stays in each page's own CSS (#fbBtn, #fbPanel, #fbClose).
//
// The address is never written into the page source. It is put together only
// when someone asks for it, which keeps the harvesters off it.
(function () {
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
  function wire() {
    var b = document.getElementById('fbBtn');
    if (b) b.addEventListener('click', show);
  }
  window.showFeedback = show;   // older pages may still call these by name
  window.hideFeedback = hide;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire); else wire();
})();
