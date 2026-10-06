// Savvy Renter site menu -- the ONE place the left-hand menu lives.
// To add or change a page in the menu, edit MENU below and upload this file only.
// Every page has <aside class="tools" id="siteMenu"></aside> followed by
// <script src="menu.js"></script>; this fills it in and highlights the page you are on.
(function () {
  var MENU = "<a href=\"index.html\">Home</a><ul class=\"navlist\"><li class=\"navitem\"><span class=\"navcat\" tabindex=\"0\">Location</span><ul class=\"flyout\"><li><a href=\"area.html\">What rent costs here</a></li><li><a href=\"counciltax.html\">Council tax here</a></li></ul></li><li class=\"navitem\"><span class=\"navcat\" tabindex=\"0\">Tenancy &amp; Rent</span><ul class=\"flyout\"><li><a href=\"moving-in_audit.html\">Moving in audit</a></li><li><a href=\"section_8_eviction_defense_advisor.html\">Section 8 notice checker</a></li></ul></li><li class=\"navitem\"><span class=\"navcat\" tabindex=\"0\">Financial Tools</span><ul class=\"flyout hassub\"><li><a href=\"interest.html\">Interest owed to you</a></li><li><a href=\"arrears.html\">Paying off arrears</a></li><li><a href=\"benefits.html\">Benefit entitlements</a></li><li><a href=\"incoming-benefit-calc.html\">Record of income</a></li><li class=\"navitem sub\"><span class=\"navcat\" tabindex=\"0\">Redaction Suite</span><ul class=\"flyout\"><li><a href=\"bank-statement-redaction.html\" class=\"hot\">⚡ Redact a statement page</a></li><li><a href=\"bank-statement-split.html\">Split a PDF into pages</a></li><li><a href=\"bank-statement-rename.html\">Name statements by date</a></li></ul></li></ul></li><li class=\"navitem\"><span class=\"navcat\" tabindex=\"0\">Complaints &amp; Claims</span><ul class=\"flyout\"><li><a href=\"scrubber.html\">🔍 Web page data scrubber</a></li><li><a href=\"PRS_Tenant_Workspace.html\">PRS complaint</a></li><li><a href=\"TPO_Tenant_Workspace.html\">TPO complaint</a></li><li><a href=\"court_forms_workspace.html\">Money Claim Online</a></li></ul></li><li class=\"navitem resitem\"><a class=\"navcat\" href=\"resources.html\">Data &amp; Resources</a><ul class=\"flyout wide\"><li><a href=\"resources.html\">Other resources — the page</a></li><li class=\"sect\">Certificates and safety</li><li><a class=\"ext\" href=\"https://www.gov.uk/find-energy-certificate\" target=\"_blank\" rel=\"noopener\">Energy Performance Certificate</a></li><li><a class=\"ext\" href=\"https://www.scottishepcregister.org.uk/\" target=\"_blank\" rel=\"noopener\">EPC register</a></li><li><a class=\"ext\" href=\"https://www.gassaferegister.co.uk/find-an-engineer-or-check-the-register/\" target=\"_blank\" rel=\"noopener\">Gas Safe Register</a></li><li><a class=\"ext\" href=\"https://www.niceic.com/find-a-contractor\" target=\"_blank\" rel=\"noopener\">Electrical safety</a></li><li><a class=\"ext\" href=\"https://search.napit.org.uk/\" target=\"_blank\" rel=\"noopener\">NAPIT</a></li><li><a class=\"ext\" href=\"https://www.electricalsafetyfirst.org.uk/\" target=\"_blank\" rel=\"noopener\">Electrical Safety First</a></li><li><a class=\"ext\" href=\"https://www.gov.uk/government/publications/how-to-rent\" target=\"_blank\" rel=\"noopener\">How to Rent</a></li><li class=\"sect\">Deposits</li><li><a class=\"ext\" href=\"https://www.gov.uk/tenancy-deposit-protection\" target=\"_blank\" rel=\"noopener\">Tenancy deposit protection</a></li><li><a class=\"ext\" href=\"https://www.depositprotection.com/\" target=\"_blank\" rel=\"noopener\">Deposit Protection Service</a></li><li><a class=\"ext\" href=\"https://www.tenancydepositscheme.com/\" target=\"_blank\" rel=\"noopener\">Tenancy Deposit Scheme</a></li><li><a class=\"ext\" href=\"https://www.mydeposits.co.uk/\" target=\"_blank\" rel=\"noopener\">mydeposits</a></li><li class=\"sect\">Who owns and who manages</li><li><a class=\"ext\" href=\"https://find-and-update.company-information.service.gov.uk/\" target=\"_blank\" rel=\"noopener\">Companies House</a></li><li><a class=\"ext\" href=\"https://www.gov.uk/search-property-information-land-registry\" target=\"_blank\" rel=\"noopener\">HM Land Registry</a></li><li><a class=\"ext\" href=\"https://www.tpos.co.uk/\" target=\"_blank\" rel=\"noopener\">Property Ombudsman</a></li><li><a class=\"ext\" href=\"https://www.theprs.co.uk/\" target=\"_blank\" rel=\"noopener\">Property Redress Scheme</a></li><li><a class=\"ext\" href=\"https://www.rentsmart.gov.wales/\" target=\"_blank\" rel=\"noopener\">Rent Smart Wales</a></li><li><a class=\"ext\" href=\"https://www.landlordregistrationscotland.gov.uk/\" target=\"_blank\" rel=\"noopener\">Scottish Landlord Register</a></li><li><a class=\"ext\" href=\"https://www.london.gov.uk/programmes-strategies/housing-and-land/improving-private-rented-sector/rogue-landlord-and-agent-checker\" target=\"_blank\" rel=\"noopener\">London rogue landlord and agent checker</a></li><li><a class=\"ext\" href=\"https://www.gov.uk/find-local-council\" target=\"_blank\" rel=\"noopener\">Find your local council</a></li><li class=\"sect\">Rent, notices and the law</li><li><a class=\"ext\" href=\"https://www.gov.uk/private-renting/rent-increases\" target=\"_blank\" rel=\"noopener\">Rent increases</a></li><li><a class=\"ext\" href=\"https://www.legislation.gov.uk/ukpga/1988/50/section/13\" target=\"_blank\" rel=\"noopener\">Housing Act 1988</a></li><li><a class=\"ext\" href=\"https://www.legislation.gov.uk/ukpga/2019/4\" target=\"_blank\" rel=\"noopener\">Tenant Fees Act 2019</a></li><li><a class=\"ext\" href=\"https://www.legislation.gov.uk/ukpga/1985/70/section/11\" target=\"_blank\" rel=\"noopener\">Landlord and Tenant Act 1985</a></li><li><a class=\"ext\" href=\"https://www.legislation.gov.uk/ukpga/2018/34\" target=\"_blank\" rel=\"noopener\">Homes Act 2018</a></li><li><a class=\"ext\" href=\"https://www.legislation.gov.uk/ukpga/1977/43\" target=\"_blank\" rel=\"noopener\">Protection from Eviction Act 1977</a></li><li><a class=\"ext\" href=\"https://www.legislation.gov.uk/ukpga/2015/20\" target=\"_blank\" rel=\"noopener\">Deregulation Act 2015</a></li><li><a class=\"ext\" href=\"https://www.legislation.gov.uk/ukpga/1984/28/section/69\" target=\"_blank\" rel=\"noopener\">County Courts Act 1984</a></li><li><a class=\"ext\" href=\"https://www.legislation.gov.uk/all?title=Renters%27%20Rights%20Act\" target=\"_blank\" rel=\"noopener\">Renters' Rights Act</a></li><li class=\"sect\">Taking it further</li><li><a class=\"ext\" href=\"https://buntool.co.uk/\" target=\"_blank\" rel=\"noopener\">BunTool</a></li><li><a class=\"ext\" href=\"https://www.gov.uk/make-court-claim-for-money\" target=\"_blank\" rel=\"noopener\">Make a court claim for money</a></li><li><a class=\"ext\" href=\"https://www.moneyclaim.gov.uk/\" target=\"_blank\" rel=\"noopener\">Money Claim Online</a></li><li><a class=\"ext\" href=\"https://www.gov.uk/get-help-with-court-fees\" target=\"_blank\" rel=\"noopener\">Help with court fees</a></li><li><a class=\"ext\" href=\"https://www.gov.uk/government/collections/county-court-forms\" target=\"_blank\" rel=\"noopener\">County court forms</a></li><li><a class=\"ext\" href=\"https://www.gov.uk/housing-tribunals\" target=\"_blank\" rel=\"noopener\">Housing tribunals</a></li><li><a class=\"ext\" href=\"https://www.housing-ombudsman.org.uk/\" target=\"_blank\" rel=\"noopener\">Housing Ombudsman</a></li><li class=\"sect\">Free advice</li><li><a class=\"ext\" href=\"https://england.shelter.org.uk/housing_advice\" target=\"_blank\" rel=\"noopener\">Shelter</a></li><li><a class=\"ext\" href=\"https://www.citizensadvice.org.uk/housing/\" target=\"_blank\" rel=\"noopener\">Citizens Advice</a></li><li><a class=\"ext\" href=\"https://www.lawcentres.org.uk/\" target=\"_blank\" rel=\"noopener\">Law Centres Network</a></li><li><a class=\"ext\" href=\"https://www.advicenow.org.uk/\" target=\"_blank\" rel=\"noopener\">Advicenow</a></li></ul></li></ul>";
  var box = document.getElementById('siteMenu');
  if (!box) return;
  box.innerHTML = MENU;
  var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var links = box.querySelectorAll('a[href]');
  for (var k = 0; k < links.length; k++) {
    var a = links[k];
    if (a.classList.contains('navcat') || a.classList.contains('ext')) continue;
    if (a.getAttribute('href').toLowerCase() !== here) continue;
    a.classList.add('on');
    for (var p = a.parentElement; p && p !== box; p = p.parentElement) {
      if (p.classList && p.classList.contains('navitem')) p.classList.add('here');
    }
    break;
  }

  // ---- Phones: the menu and the page take turns, never stacked -----------
  // On a narrow screen the menu used to sit on top of every page, opened out,
  // so the page itself was pushed below a screen or more of buttons. Now:
  //   * the menu is hidden, and a "☰ Menu" button sits at the left of the
  //     thin bar at the top of the page (it stays at the top while scrolling);
  //   * tapping it shows the menu INSTEAD of the page, with "← Back to the page";
  //   * the menu's sections open one at a time when tapped;
  //   * arriving at the home page from outside the site opens the menu first;
  //   * the phone's own back button/gesture closes the menu.
  // Wider screens are untouched.
  var PHONE = window.matchMedia('(max-width:860px)');
  var root = document.documentElement;
  var rail = box.closest('.rail');
  if (!rail) return;

  var css = document.createElement('style');
  css.textContent =
    'html.sr-phone .rail{display:none}' +
    'html.sr-phone.sr-menu .rail{display:block;position:fixed;inset:0;width:auto;height:auto;margin:0;' +
      'padding:10px 12px 24px;overflow-y:auto;background:#0f172a;z-index:1000;box-sizing:border-box}' +
    'html.sr-phone.sr-menu main.page,html.sr-phone.sr-menu .page{display:none}' +
    'html.sr-phone.sr-menu body{overflow:hidden}' +
    'html.sr-phone .navitem>.flyout,html.sr-phone .navitem.resitem>.flyout{display:none}' +
    'html.sr-phone .navitem.open>.flyout{display:block}' +
    'html.sr-phone .navitem.resitem>.flyout{display:none!important}' +
    'html.sr-phone .navitem>span.navcat::after{content:"\\25BE";font-size:11px;color:#94a3b8}' +
    'html.sr-phone .navitem.open>span.navcat::after{content:"\\25B4"}' +
    'html.sr-phone .navitem>a.navcat::after{content:"\\203A";font-size:14px;color:#94a3b8}' +
    'html.sr-phone .pagebar{position:sticky;top:0;z-index:50;justify-content:flex-start}' +
    'html.sr-phone .pagebar>span{margin-left:auto}' +
    '.sr-menubtn,.sr-backbtn{display:none;font:inherit;font-weight:bold;cursor:pointer;border-radius:5px;' +
      'background:#0284c7;color:#fff;border:none;padding:5px 12px;font-size:13px;white-space:nowrap}' +
    'html.sr-phone .sr-menubtn{display:inline-block}' +
    'html.sr-phone .sr-backbtn{display:block;width:100%;margin:0 0 10px;padding:9px 12px;font-size:14px;' +
      'background:#1e293b;border:1px solid #38bdf8;color:#38bdf8;text-align:left}';
  document.head.appendChild(css);

  var menuBtn = document.createElement('button');
  menuBtn.type = 'button';
  menuBtn.className = 'sr-menubtn';
  menuBtn.textContent = '☰ Menu';
  // menu.js runs inside the rail, before the page below it has been read in,
  // so the button goes into the page's top bar once the page is there.
  function placeMenuBtn() {
    var bar = document.querySelector('.pagebar');
    if (bar && !bar.contains(menuBtn)) bar.insertBefore(menuBtn, bar.firstChild);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', placeMenuBtn); else placeMenuBtn();

  var backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.className = 'sr-backbtn';
  backBtn.textContent = '← Back to the page';
  rail.insertBefore(backBtn, rail.firstChild);

  var pushed = false;
  function openMenu(fromHistory) {
    root.classList.add('sr-menu');
    rail.scrollTop = 0;
    if (!fromHistory && history.pushState) { history.pushState({ srMenu: 1 }, ''); pushed = true; }
  }
  function closeMenu() {
    if (!root.classList.contains('sr-menu')) return;
    root.classList.remove('sr-menu');
    window.scrollTo(0, 0);
  }
  menuBtn.addEventListener('click', function () { openMenu(false); });
  backBtn.addEventListener('click', function () {
    if (pushed) { pushed = false; history.back(); } else closeMenu();
  });
  window.addEventListener('popstate', function () { pushed = false; closeMenu(); });

  // Sections open on tap, one at a time. The section holding this page starts open.
  var cats = box.querySelectorAll('.navitem > span.navcat');
  for (var c = 0; c < cats.length; c++) {
    cats[c].addEventListener('click', function (e) {
      if (!root.classList.contains('sr-phone')) return;
      var item = this.parentElement;
      var wasOpen = item.classList.contains('open');
      var sibs = item.parentElement.children;
      for (var s = 0; s < sibs.length; s++) if (sibs[s] !== item) sibs[s].classList.remove('open');
      item.classList.toggle('open', !wasOpen);
      if (!wasOpen) this.scrollIntoView({ block: 'nearest' });
      e.preventDefault();
    });
  }
  var heres = box.querySelectorAll('.navitem.here');
  for (var h = 0; h < heres.length; h++) heres[h].classList.add('open');

  // A link to the page already showing just closes the menu.
  box.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || !root.classList.contains('sr-phone')) return;
    if ((a.getAttribute('href') || '').toLowerCase() === here) { e.preventDefault(); backBtn.click(); }
  });

  function fit() {
    root.classList.toggle('sr-phone', PHONE.matches);
    if (!PHONE.matches) root.classList.remove('sr-menu');
  }
  fit();
  if (PHONE.addEventListener) PHONE.addEventListener('change', fit); else if (PHONE.addListener) PHONE.addListener(fit);

  // The home page on a phone, reached from outside the site: menu first.
  var fromSite = false;
  try { fromSite = !!document.referrer && new URL(document.referrer).host === location.host; } catch (e) { /* treat as outside */ }
  if (PHONE.matches && here === 'index.html' && !fromSite) openMenu(false);
})();
