<?php
/* ---------------------------------------------------------------------------
 * build-faq.php — Savvy Renter
 *
 * Builds the renters' FAQ from one data file.
 *
 *   in   faq.json                 the questions, answers, sources and links
 *   out  faq.html                 every question on one page, grouped by topic
 *        faq/<question-id>.html   one page per question, so each can rank in
 *                                 search on its own
 *        sitemap.xml              FAQ entries refreshed; other entries untouched
 *
 * To change an answer, edit faq.json and run this again. Never hand-edit the
 * generated pages: the next build overwrites them.
 *
 * A question taken out of faq.json leaves its old page behind. The build
 * renames it with a DD_ prefix (faq/DD_<id>.html) so it can be deleted by hand.
 *
 * Run it from the repo folder:  php build-faq.php
 * or open it through WAMP:     http://localhost/Savvyrenter_html_repo/build-faq.php
 * ------------------------------------------------------------------------- */

$ROOT = __DIR__;
$SITE = 'https://savvyrenter.co.uk/';
$UMAMI = '<script defer src="https://cloud.umami.is/script.js" data-website-id="586e56fe-239b-4e82-be1e-c483dfdfeda1"></script>';
$COUNTER = '<div class="sr-count" style="text-align:center;margin:6px 0 14px"><style>@media print{.sr-count{display:none!important}}</style><script type="text/javascript" src="https://counter.websiteout.com/js/2/0/172/0"></script></div>';

$web = PHP_SAPI !== 'cli';
if ($web) header('Content-Type: text/plain; charset=utf-8');

$d = json_decode(file_get_contents("$ROOT/faq.json"), true);
if (!$d) { exit("faq.json is missing or is not valid JSON: " . json_last_error_msg() . "\n"); }

$cats = [];
foreach ($d['categories'] as $c) $cats[$c['id']] = $c['name'];
$byCat = [];
$seen = [];
foreach ($d['faqs'] as $f) {
  if (!preg_match('/^[a-z0-9-]+$/', $f['id'])) exit("Bad id (lowercase letters, numbers and hyphens only): {$f['id']}\n");
  if (isset($seen[$f['id']])) exit("Duplicate id: {$f['id']}\n");
  if (!isset($cats[$f['category']])) exit("Unknown category '{$f['category']}' on {$f['id']}\n");
  $seen[$f['id']] = true;
  $byCat[$f['category']][] = $f;
}

function e($s) { return htmlspecialchars($s, ENT_QUOTES | ENT_HTML5, 'UTF-8'); }
function ld($a) { return str_replace('</', '<\/', json_encode($a, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT)); }
function snippet($s, $n = 155) {
  if (mb_strlen($s) <= $n) return $s;
  $cut = mb_substr($s, 0, $n);
  $cut = mb_substr($cut, 0, mb_strrpos($cut, ' '));
  return rtrim($cut, ' ,;:') . '…';
}
function niceDate($iso) { return date('j F Y', strtotime($iso)); }

/* -- the shared page frame -------------------------------------------------- */
$CSS = <<<'CSS'
  /* Any link without its own colour: light blue, never the browser's dark blue on our dark pages. */
  :where(body) a { color:#38bdf8; }


  body { font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; line-height:1.5; color:#e2e8f0; max-width:960px; margin:0 auto; padding:24px 18px; background:#0f172a; }
  h1 { color:#f8fafc; border-bottom:2px solid #334155; padding-bottom:10px; font-size:24px; margin-top:0; }
  h2 { color:#f1f5f9; font-size:18px; margin:22px 0 6px; border-bottom:1px solid #334155; padding-bottom:6px; }
  .intro, .note { background:#1e293b; border-left:4px solid #38bdf8; padding:10px 14px; margin:0 0 14px; border-radius:4px; font-size:14px; color:#c9d4e0; }
  .note.warn { border-left-color:#fbbf24; color:#fde68a; }
  .grid { display:grid; grid-template-columns:1fr 1fr; gap:10px 16px; }
  .field { background:#1e293b; padding:10px 12px; border-radius:6px; border:1px solid #334155; }
  label { display:block; font-weight:600; margin-bottom:5px; font-size:13px; color:#94a3b8; }
  input, select { padding:7px 8px; border:1px solid #475569; border-radius:5px; font-size:14px; background:#0f172a; color:#f8fafc; box-sizing:border-box; }
  input:focus, select:focus { outline:none; border-color:#38bdf8; box-shadow:0 0 0 3px rgba(56,189,248,.15); }
  .dsel { display:inline-flex; gap:4px; }
  .dsel select { padding:7px 4px; }
  button { background:#0284c7; color:#fff; padding:10px 20px; border:none; border-radius:5px; font-size:15px; cursor:pointer; font-weight:bold; }
  button:hover { background:#0369a1; }
  button.secondary { background:#334155; }
  .cards { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:10px; margin:14px 0; }
  .card { background:#1e293b; padding:12px; border:1px solid #334155; border-radius:8px; text-align:center; }
  .card div:first-child { font-size:12px; text-transform:uppercase; letter-spacing:.5px; color:#94a3b8; font-weight:600; }
  .card .value { font-size:22px; font-weight:700; color:#f8fafc; margin-top:4px; }
  .card.total { border-top:4px solid #38bdf8; } .card.total .value { color:#38bdf8; }
  table { width:100%; border-collapse:collapse; margin-top:8px; background:#1e293b; font-size:13px; border:1px solid #334155; }
  th, td { padding:6px 10px; border-bottom:1px solid #334155; text-align:right; white-space:nowrap; }
  th:nth-child(-n+3), td:nth-child(-n+3) { text-align:left; }
  th { background:#334155; color:#f8fafc; }
  .hidden { display:none !important; }
  .brand { display:flex; align-items:center; gap:14px; border-bottom:2px solid #334155; padding-bottom:10px; margin-bottom:14px; }
  .brand img { height:56px; width:auto; border-radius:8px; }
  .brand h1 { border:none; padding:0; margin:0; font-size:26px; letter-spacing:-0.2px; }
  .brand .sub { color:#94a3b8; font-size:13px; margin-top:2px; }
  /* Feedback. The address is assembled in script when the button is used, so
     it is not sitting in the page source for a harvester to scrape. */
  .brand .fbwrap { margin-left:auto; text-align:right; position:relative; }
  #fbBtn { background:#0284c7; color:#fff; border:none; border-radius:5px; font-size:13px; font-weight:bold; padding:9px 14px; cursor:pointer; font-family:inherit; }
  #fbBtn:hover { background:#0369a1; }
  #fbPanel { position:absolute; top:0; right:0; z-index:20; width:470px; max-width:calc(100vw - 40px); box-sizing:border-box; background:#1e293b; border:1px solid #475569; border-radius:6px; padding:10px 30px 10px 12px; text-align:left; font-size:12.5px; color:#c9d4e0; line-height:1.5; box-shadow:0 6px 18px rgba(0,0,0,.45); }
  #fbClose { position:absolute; top:4px; right:6px; background:none; border:none; color:#94a3b8; font-size:16px; line-height:1; padding:2px 5px; cursor:pointer; font-family:inherit; }
  #fbClose:hover { color:#f8fafc; }
  #fbPanel a { color:#38bdf8; font-weight:bold; text-decoration:none; font-size:14px; }
  #fbPanel a:hover { text-decoration:underline; }
  @media print { .brand .fbwrap { display:none !important; } }
  .brand button { margin-left:auto; }
  button.small { padding:6px 12px; font-size:13px; }
  .brand .aboutlink { margin-left:auto; background:#334155; color:#fff; text-decoration:none; font-weight:bold; font-size:13px; padding:7px 13px; border-radius:5px; white-space:nowrap; }
  .brand .aboutlink:hover { background:#475569; }
  #about { position:fixed; inset:0; background:rgba(2,6,23,.82); display:flex; align-items:center; justify-content:center; padding:20px; z-index:20; }
  #about[hidden] { display:none; }
  .about-box { background:#1e293b; border:1px solid #334155; border-radius:10px; max-width:720px; max-height:90vh; overflow:auto; padding:18px 22px; box-shadow:0 10px 30px rgba(0,0,0,.5); }
  .about-box h2 { margin-top:14px; }
  .about-box p { margin:6px 0; font-size:14px; }
  .about-bar { display:flex; align-items:center; gap:12px; }
  .about-bar img { height:44px; border-radius:6px; }
  .about-bar h1 { font-size:20px; border:none; margin:0; padding:0; }
  .about-bar button { margin-left:auto; }
  @media print { #about, .brand button { display:none !important; } .brand img { height:40px; } }
  .foot { font-size:12px; color:#94a3b8; margin-top:18px; border-top:1px solid #334155; padding-top:8px; }
  @media print {
    body { background:#fff; color:#000; max-width:none; padding:0; font-size:11px; }
    #form, #runBtn, #printBtn, .intro, .foot .nostore { display:none !important; }
    h1, h2, .card .value, .card.total .value, th { color:#000; }
    .card, table, th, td { border-color:#999; background:#fff; }
    th { background:#eee; }
    .note { background:#f4f4f4; color:#000; } .note.warn { color:#000; }
  }

  .links { display:grid; grid-template-columns:repeat(auto-fill,minmax(290px,1fr)); gap:8px; }
  a.lnk { display:block; background:#1e293b; border:1px solid #334155; border-radius:6px; padding:8px 10px; color:#e2e8f0; text-decoration:none; }
  a.lnk:hover { border-color:#38bdf8; }
  a.lnk b { display:block; color:#f8fafc; font-size:14px; }
  a.lnk span { display:block; font-size:12.5px; color:#94a3b8; margin:2px 0; line-height:1.4; }
  a.lnk i { display:block; font-style:normal; font-size:11px; color:#38bdf8; }
  /* Where the data comes from. One entry per dataset, each with its own
     anchor so a lookup can link straight to the source it used. */
  .src { background:#1e293b; border:1px solid #334155; border-radius:6px; padding:8px 10px; margin-bottom:6px; }
  .src b { color:#f8fafc; font-size:14px; }
  .src .who { font-size:12px; color:#94a3b8; }
  .src p { margin:3px 0 0; font-size:12.5px; color:#c9d4e0; line-height:1.45; }
  .src .lic { display:inline-block; font-size:11px; color:#0f172a; background:#38bdf8; border-radius:3px; padding:1px 6px; font-weight:bold; margin-left:6px; vertical-align:1px; }
  .src .lic.todo { background:#fbbf24; }
  .src .attrib { display:block; font-size:11.5px; color:#94a3b8; font-family:ui-monospace,Consolas,monospace; background:#0f172a; border-radius:4px; padding:5px 7px; margin-top:4px; }
  .src a { color:#38bdf8; font-size:11.5px; text-decoration:none; }
  .src a:hover { text-decoration:underline; }
  .brand a.btn { margin-left:auto; background:#0284c7; color:#fff; padding:8px 14px; border-radius:5px; text-decoration:none; font-weight:bold; font-size:13px; }
  body { max-width:1180px; }
  .shell { display:flex; gap:20px; align-items:flex-start; }
  /* Capped to the screen: a sticky column taller than the viewport pins at
     the top and whatever sits below the fold can never be reached. */
  .rail { width:200px; flex:none; position:sticky; top:18px;
           max-height:calc(100vh - 36px); overflow-y:auto; overscroll-behavior:contain; }
  .tools { background:#1e293b; border:1px solid #334155; border-radius:8px; padding:12px; }
  .sidelogo { display:block; width:196px; max-width:100%; height:auto; border-radius:10px; margin:14px auto 0; }
  .tools h3 { margin:0 0 10px; font-size:12px; text-transform:uppercase; letter-spacing:.5px; color:#94a3b8; }
  .tools a { display:block; background:#0284c7; color:#fff; text-decoration:none; font-weight:bold; font-size:14px; padding:5px 12px; border-radius:5px; margin-bottom:8px; }
  .tools a:hover { background:#0369a1; }
  .tools a.on { background:#38bdf8; color:#0f172a; }
  /* Grouped rail -- the flat list of eleven buttons was getting long, so the
     related ones fold up. <details>/<summary>, so it works with no JS at all;
     the group holding the page you are on is written out already open. */
  .tools .grp { margin-bottom:8px; }
  .tools .grp > summary { list-style:none; cursor:pointer; background:#1e293b; border:1px solid #475569;
     color:#e2e8f0; font-weight:bold; font-size:14px; padding:5px 12px; border-radius:5px;
     display:flex; align-items:center; justify-content:space-between; gap:6px; }
  .tools .grp > summary::-webkit-details-marker { display:none; }
  .tools .grp > summary::after { content:"\25BE"; font-size:11px; color:#94a3b8; }
  .tools .grp[open] > summary::after { content:"\25B4"; }
  .tools .grp > summary:hover { border-color:#38bdf8; color:#fff; }
  .tools .grp > summary:focus-visible { outline:2px solid #38bdf8; outline-offset:1px; }
  .tools .grp[open] > summary { margin-bottom:6px; }
  .tools .grp a { margin-left:10px; font-size:13px; padding:4px 10px; }
  .unverified { background:#3b2f0b; border-left:4px solid #f2c94c; color:#f5e6b8;
     padding:8px 14px; margin:0 0 10px; border-radius:4px; font-size:13px; }
  .tools .tiny { font-size:11px; color:#94a3b8; margin-top:6px; }
  .page { flex:1; min-width:0; }
  @media (max-width:800px) { .shell { display:block; } .rail { width:auto; position:static; margin-bottom:14px; max-height:none; overflow:visible; } .sidelogo { max-width:208px; } }
  /* Other resources: the row is a link to the page, and the fly-out carries the
     links themselves, so nothing needs two clicks to reach. */
  .navitem > a.navcat { text-decoration:none; }
  .navitem.resitem { position:static; }
  /* The long one is pinned to the window instead, so all 39 links stay on screen. */
  .navitem.resitem > .flyout { position:fixed; top:2vh; bottom:2vh; left:221px; margin-left:0; transform:none; max-height:none; }
  .flyout.wide { width:300px; max-height:94vh; }
  .flyout .sect { font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:.6px;
                  color:#94a3b8; margin:10px 2px 5px; }
  .flyout a.hot { background:#15803d; }
  .flyout a.hot:hover { background:#166534; }
  .flyout a.ext { background:#0f172a; border:1px solid #334155; color:#e2e8f0; font-weight:600;
                  font-size:12.5px; padding:4px 10px; margin-bottom:4px; }
  .flyout a.ext:hover { background:#334155; border-color:#0284c7; color:#fff; }
  .flyout a.ext::after { content:" \2197"; color:#94a3b8; font-size:11px; }
  /* A category inside a fly-out: the Redaction Suite sits under Financial Tools,
     so what it redacts is said by where it lives. Its parent must not clip it. */
  .flyout.hassub { overflow:visible; max-height:none; }
  .flyout .navitem.sub { margin:2px 0 0; }
  .flyout .navitem.sub > .navcat { background:#0f172a; }
  .flyout .navitem.sub > .flyout { margin-left:14px; }
  /* keep the long one in the flow on a phone (this comes last on purpose) */
  @media (max-width:860px) { .navitem.resitem > .flyout { position:static; inset:auto; transform:none; } }
  @media print { .rail { display:none !important; } }

  /* A thin strip across the top of the page itself: the site's name, above the
     content and clear of the navigation, costing one line of height. */
  .pagebar { background:#0b1220; border:1px solid #1e293b; border-radius:6px;
             padding:5px 12px; margin-bottom:10px; display:flex; align-items:center;
             justify-content:space-between; gap:14px; font-size:11.5px; }
  .pagebar a { color:#94a3b8; text-decoration:none; font-weight:bold; letter-spacing:.6px;
               text-transform:uppercase; white-space:nowrap; }
  .pagebar a:hover { color:#38bdf8; }
  .pagebar span { color:#64748b; text-align:right; min-width:0;
                  white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .pagebar .brief { display:none; }
  @media (max-width:700px) { .pagebar .full { display:none; } .pagebar .brief { display:inline; } }

  /* ---- Site menu: the fly-out layout, in our own styling ---------------- */
  /* Fixed sidebar down the left, categories that fly out on hover or keyboard
     focus. The card, the blue pill links and the colours are the site's own. */
  .rail { position:fixed; top:0; left:0; width:236px; height:100vh; box-sizing:border-box;
          padding:14px 12px; overflow:visible; background:#0f172a;
          display:flex; flex-direction:column; max-height:none; z-index:2000; }
  .tools { background:#1e293b; border:1px solid #334155; border-radius:8px; padding:12px; }
  .tools > a { display:block; background:#0284c7; color:#fff; text-decoration:none; font-weight:bold;
               font-size:14px; padding:5px 12px; border-radius:5px; margin-bottom:8px; }
  .tools > a:hover { background:#0369a1; }
  .tools > a.on { background:#38bdf8; color:#0f172a; }
  .navlist { list-style:none; margin:0; padding:0; }
  .navitem { position:relative; margin-bottom:8px; }
  .navitem > .navcat { display:flex; align-items:center; justify-content:space-between; gap:8px;
                       background:#1e293b; border:1px solid #475569; border-radius:5px; color:#e2e8f0;
                       font-size:13px; font-weight:600; padding:5px 10px; cursor:pointer; user-select:none; }
  .navitem > .navcat::after { content:"\25B8"; font-size:11px; color:#94a3b8; }
  .navitem:hover > .navcat, .navitem:focus-within > .navcat { background:#334155; border-color:#0284c7; color:#fff; }
  .navitem.here > .navcat { border-color:#38bdf8; color:#38bdf8; }
  .flyout { visibility:hidden; opacity:0;
            transition:visibility 0s linear .4s, opacity .12s ease .4s;
            position:absolute; top:50%; transform:translateY(-50%); left:100%; margin-left:10px; width:246px;
            max-height:92vh; overflow-y:auto; list-style:none; padding:12px; margin-bottom:0;
            background:#1e293b; border:1px solid #334155; border-left:3px solid #0284c7;
            border-radius:8px; box-shadow:6px 4px 18px rgba(0,0,0,.5); z-index:2001; }
  .navitem:hover > .flyout, .navitem:focus-within > .flyout, .flyout:hover { visibility:visible; opacity:1; transition-delay:0s; }
  /* The gap between the row and its fly-out belongs to the row, so crossing it
     at any angle keeps the menu open; the fly-out then holds itself open. */
  .navitem > .flyout::before { content:''; position:absolute; top:-40px; bottom:-40px; left:-26px; width:26px; }
  .navitem::after { content:''; position:absolute; top:-6px; bottom:-6px; left:100%; width:28px; }
  .flyout a { display:block; background:#0284c7; color:#fff; text-decoration:none; font-weight:bold;
              font-size:14px; padding:5px 12px; border-radius:5px; margin-bottom:8px; }
  .flyout li:last-child a { margin-bottom:0; }
  .flyout a:hover { background:#0369a1; }
  .flyout a.on { background:#38bdf8; color:#0f172a; }
  .sidelogo { display:block; width:196px; max-width:100%; height:auto; border-radius:10px; margin:14px auto 0; }
  .shell { display:block; }
  main.page, .page { margin-left:252px; max-width:none; position:relative; z-index:1; }
  /* Narrow windows and phones: the sidebar stops being fixed and every item is
     listed openly, so nothing has to be hovered to be found. */
  @media (max-width:860px) {
    .rail { position:static; width:auto; height:auto; padding:0; display:block; z-index:auto; }
    main.page, .page { margin-left:0; }
    .navitem > .navcat::after { content:""; }
    .flyout, .navitem.resitem > .flyout { visibility:visible; opacity:1; pointer-events:auto; position:static; transform:none; width:auto; margin:8px 0 0; max-height:none; inset:auto;
              border-left:1px solid #334155; box-shadow:none; }
  }
  @media print { .rail { display:none !important; } main.page, .page { margin-left:0; } }
  /* FAQ */
  .faqnote { font-size:12.5px; color:#94a3b8; margin:0 0 2px; }
  #faqSearch { width:100%; max-width:520px; margin:0 0 8px; }
  .cats { display:flex; flex-wrap:wrap; gap:4px; margin:0 0 6px; }
  .cats a { font-size:12px; background:#1e293b; border:1px solid #334155; border-radius:4px; padding:2px 8px; text-decoration:none; }
  .cats a:hover { border-color:#38bdf8; }
  details.qa { background:#1e293b; border:1px solid #334155; border-radius:6px; margin-bottom:2px; }
  details.qa > summary { cursor:pointer; padding:6px 10px; font-weight:600; color:#f8fafc; font-size:14px; list-style:none; }
  details.qa > summary::-webkit-details-marker { display:none; }
  details.qa > summary::before { content:"\25B8  "; color:#38bdf8; }
  details.qa[open] > summary::before { content:"\25BE  "; }
  details.qa[open] { border-color:#38bdf8; }
  details.qa .ans { padding:0 12px 8px 26px; font-size:14px; color:#c9d4e0; }
  .ans p { margin:0 0 6px; }
  .refs { font-size:12px; color:#94a3b8; margin:0; }
  .refs a { margin-right:10px; }
  .tl { font-size:12px; margin:0 0 4px; }
  .own { font-size:12px; margin:0 0 4px; }
  .beta { font-size:12px; font-weight:bold; color:#fbbf24; vertical-align:super; margin-left:4px; }
  #noHits { font-size:13px; color:#94a3b8; }
  .qpage .brand h1 { font-size:20px; line-height:1.3; }
  #fbBtn { white-space:nowrap; }
  .crumbs { font-size:12px; color:#94a3b8; margin:0 0 6px; }
  .crumbs a { text-decoration:none; }
  .single { background:#1e293b; border:1px solid #334155; border-radius:6px; padding:10px 14px; font-size:15px; color:#c9d4e0; }
  .single p { margin:0 0 8px; }
  .related { list-style:none; margin:0; padding:0; }
  .related li { margin:0 0 2px; }
  .related a { display:block; background:#1e293b; border:1px solid #334155; border-radius:6px; padding:5px 10px; font-size:14px; text-decoration:none; }
  .related a:hover { border-color:#38bdf8; }
  @media print { #faqSearch, .faqnote, .cats, .crumbs { display:none !important; } details.qa .ans { display:block; } }
CSS;

function head($title, $desc, $url, $lds, $base = '') {
  global $CSS, $UMAMI;
  $t = e($title); $de = e($desc); $u = e($url);
  $h = "<!DOCTYPE html>\n<html lang=\"en-GB\">\n<head>\n<meta charset=\"UTF-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n";
  if ($base) $h .= "<base href=\"$base\">\n";
  $h .= "<title>$t</title>\n"
     . "<link rel=\"icon\" type=\"image/png\" href=\"favicon-96x96.png\" sizes=\"96x96\">\n<link rel=\"icon\" type=\"image/svg+xml\" href=\"favicon.svg\">\n<link rel=\"shortcut icon\" href=\"favicon.ico\">\n<link rel=\"apple-touch-icon\" sizes=\"180x180\" href=\"apple-touch-icon.png\">\n<link rel=\"manifest\" href=\"site.webmanifest\">\n<meta name=\"theme-color\" content=\"#0f172a\">\n"
     . "<meta name=\"description\" content=\"$de\">\n<link rel=\"canonical\" href=\"$u\">\n"
     . "<meta property=\"og:type\" content=\"article\">\n<meta property=\"og:site_name\" content=\"Savvy Renter\">\n<meta property=\"og:locale\" content=\"en_GB\">\n"
     . "<meta property=\"og:title\" content=\"$t\">\n<meta property=\"og:description\" content=\"$de\">\n<meta property=\"og:url\" content=\"$u\">\n"
     . "<meta property=\"og:image\" content=\"https://savvyrenter.co.uk/og-image.png\">\n<meta property=\"og:image:secure_url\" content=\"https://savvyrenter.co.uk/og-image.png\">\n<meta property=\"og:image:type\" content=\"image/png\">\n<meta property=\"og:image:width\" content=\"1200\">\n<meta property=\"og:image:height\" content=\"630\">\n<meta property=\"og:image:alt\" content=\"Savvy Renter — free tools for renters\">\n"
     . "<meta name=\"twitter:card\" content=\"summary_large_image\">\n<meta name=\"twitter:title\" content=\"$t\">\n<meta name=\"twitter:description\" content=\"$de\">\n<meta name=\"twitter:image\" content=\"https://savvyrenter.co.uk/og-image.png\">\n"
     . "<style>\n$CSS\n</style>\n";
  foreach ($lds as $l) $h .= "<script type=\"application/ld+json\">\n" . ld($l) . "\n</script>\n";
  return $h . "$UMAMI\n</head>\n";
}

function bodyOpen($h1, $sub, $cls = '') {
  return "<body" . ($cls ? " class=\"$cls\"" : '') . ">\n<nav id=\"siteRibbon\" aria-label=\"Site menu\"><a href=\"index.html\">Home</a> <a href=\"faq.html\">FAQ</a> <a href=\"resources.html\">Resources</a> <a href=\"about.html\">About</a></nav>\n"
   . "<script src=\"ribbon.js\"></script>\n<script src=\"feedback.js\"></script>\n<div class=\"shell\">\n<main class=\"page\">\n"
   . "<div class=\"pagebar\"><a href=\"index.html\">SavvyRenter.co.uk</a><span class=\"full\">Free tools for renters — nothing you type is stored or sent anywhere</span><span class=\"brief\">Nothing is stored or sent</span></div>\n"
   . "<div class=\"brand\"><div><h1>$h1<span class=\"beta\">Beta*</span></h1><div class=\"sub\">$sub</div></div><div class=\"fbwrap\"><button type=\"button\" id=\"fbBtn\" title=\"Like the site? Got a suggestion for something we can include? Send us some feedback. We can't promise to respond to every email, but we will read them — and if we end up using a suggestion, we'll credit whoever sent it on the page.\">&#9993; Feedback</button><div id=\"fbPanel\" class=\"hidden\"></div></div></div>\n";
}

function foot($updated) {
  global $COUNTER;
  return "<div class=\"foot\">Savvy Renter — savvyrenter.co.uk · free tools for renters. Answers checked " . niceDate($updated) . ". The full list is also published as <a href=\"faq.json\">faq.json</a>.<br>* Beta: new page, not yet reviewed by a housing adviser. General information, not legal advice.</div>\n$COUNTER\n";
}
$CLOSE = "</main>\n</div>\n</body>\n</html>\n";

function answerBody($f, $withOwn) {
  $h = '<p>' . e($f['answer']) . '</p>';
  if (!empty($f['links'])) {
    $t = [];
    foreach ($f['links'] as $l) $t[] = '<a href="' . e($l['url']) . '">' . e($l['title']) . '</a>';
    $h .= '<p class="tl">On this site: ' . implode(' · ', $t) . '</p>';
  }
  if ($withOwn) $h .= '<p class="own"><a href="faq/' . $f['id'] . '.html">Open this answer on its own page</a></p>';
  $r = [];
  foreach ($f['sources'] ?? [] as $s) $r[] = '<a href="' . e($s['url']) . '" target="_blank" rel="noopener">' . e($s['title']) . '</a>';
  if ($r) $h .= '<p class="refs">Sources: ' . implode('', $r) . '</p>';
  return $h;
}

$website = ['@type' => 'WebSite', 'name' => 'Savvy Renter', 'url' => $SITE];

/* -- faq.html: every question on one page ----------------------------------- */
$hubUrl = $SITE . 'faq.html';
$hubTitle = 'Renting questions answered: UK tenant FAQ — Savvy Renter';
$hubDesc = 'Plain answers to the questions renters ask most: deposits, rent increases, repairs and mould, landlord access, section 8 notices, students and the Renters\' Rights Act 2025.';
$main = [];
foreach ($d['faqs'] as $f) $main[] = ['@type' => 'Question', 'name' => $f['question'], 'url' => $SITE . 'faq/' . $f['id'] . '.html',
  'acceptedAnswer' => ['@type' => 'Answer', 'text' => $f['answer']]];
$hub = head($hubTitle, $hubDesc, $hubUrl, [[
  '@context' => 'https://schema.org', '@type' => 'FAQPage', 'name' => $d['title'], 'url' => $hubUrl,
  'inLanguage' => 'en-GB', 'dateModified' => $d['updated'], 'isPartOf' => $website, 'mainEntity' => $main]]);
$hub .= bodyOpen('Renting questions answered', 'The questions tenants ask most, answered in plain English');
$hub .= '<div class="intro">' . e($d['scope']) . ' ' . e($d['disclaimer']) . "</div>\n";
$hub .= "<div class=\"faqnote\">Type a word to filter the questions, or pick a topic. Every question has its own page you can share.</div>\n";
$hub .= "<input type=\"search\" id=\"faqSearch\" placeholder=\"e.g. deposit, mould, section 8\" aria-label=\"Filter questions\">\n<div class=\"cats\">";
foreach ($d['categories'] as $c) if (!empty($byCat[$c['id']])) $hub .= '<a href="faq.html#cat-' . $c['id'] . '">' . e($c['name']) . '</a>';
$hub .= "</div>\n";
foreach ($d['categories'] as $c) {
  if (empty($byCat[$c['id']])) continue;
  $hub .= '<section class="cat" id="cat-' . $c['id'] . '"><h2>' . e($c['name']) . "</h2>\n";
  foreach ($byCat[$c['id']] as $f)
    $hub .= '<details class="qa" id="' . $f['id'] . '"><summary>' . e($f['question']) . '</summary><div class="ans">' . answerBody($f, true) . "</div></details>\n";
  $hub .= "</section>\n";
}
$hub .= "<p id=\"noHits\" hidden>No questions match that. Try a shorter word, or see the <a href=\"resources.html\">free advice services</a>.</p>\n";
$hub .= foot($d['updated']);
$hub .= <<<'JS'
<script>
(function(){
  var q=document.getElementById('faqSearch'), items=[].slice.call(document.querySelectorAll('details.qa')), cats=[].slice.call(document.querySelectorAll('section.cat')), none=document.getElementById('noHits');
  function openHash(){ var h=location.hash.slice(1); if(!h) return; var el=document.getElementById(h); if(el && el.tagName==='DETAILS'){ el.open=true; el.scrollIntoView(); } }
  window.addEventListener('hashchange',openHash); openHash();
  q.addEventListener('input',function(){
    var t=q.value.trim().toLowerCase(), hits=0;
    items.forEach(function(d){ var m=!t || d.textContent.toLowerCase().indexOf(t)>-1; d.hidden=!m; if(m) hits++; });
    cats.forEach(function(s){ s.hidden=!s.querySelector('details.qa:not([hidden])'); });
    none.hidden=hits>0;
  });
})();
</script>

JS;
$hub .= $CLOSE;
file_put_contents("$ROOT/faq.html", $hub);

/* -- faq/<id>.html: one page per question ----------------------------------- */
if (!is_dir("$ROOT/faq")) mkdir("$ROOT/faq");
$built = [];
foreach ($d['faqs'] as $f) {
  $url = $SITE . 'faq/' . $f['id'] . '.html';
  $catName = $cats[$f['category']];
  $lds = [
    ['@context' => 'https://schema.org', '@type' => 'FAQPage', 'url' => $url, 'inLanguage' => 'en-GB', 'dateModified' => $d['updated'], 'isPartOf' => $website,
     'mainEntity' => [['@type' => 'Question', 'name' => $f['question'], 'acceptedAnswer' => ['@type' => 'Answer', 'text' => $f['answer']]]]],
    ['@context' => 'https://schema.org', '@type' => 'BreadcrumbList', 'itemListElement' => [
      ['@type' => 'ListItem', 'position' => 1, 'name' => 'Home', 'item' => $SITE],
      ['@type' => 'ListItem', 'position' => 2, 'name' => 'Renting questions answered', 'item' => $hubUrl],
      ['@type' => 'ListItem', 'position' => 3, 'name' => $catName, 'item' => $hubUrl . '#cat-' . $f['category']],
      ['@type' => 'ListItem', 'position' => 4, 'name' => $f['question']]]]];
  $p = head($f['question'] . ' — Savvy Renter', snippet($f['answer']), $url, $lds, '../');
  $p .= bodyOpen(e($f['question']), e($catName), 'qpage');
  $p .= '<div class="crumbs"><a href="index.html">Home</a> › <a href="faq.html">Renting questions answered</a> › <a href="faq.html#cat-' . $f['category'] . '">' . e($catName) . "</a></div>\n";
  $p .= '<div class="faqnote">' . e($d['short_scope'] ?? 'Private renting in England. General information, not legal advice.') . "</div>\n";
  $p .= '<div class="single">' . answerBody($f, false) . "</div>\n";
  $rel = array_values(array_filter($byCat[$f['category']], function ($o) use ($f) { return $o['id'] !== $f['id']; }));
  if ($rel) {
    $p .= '<h2>More on ' . e(mb_strtolower($catName)) . "</h2>\n<ul class=\"related\">";
    foreach (array_slice($rel, 0, 6) as $o) $p .= '<li><a href="faq/' . $o['id'] . '.html">' . e($o['question']) . '</a></li>';
    $p .= "</ul>\n";
  }
  $p .= '<p class="note" style="margin-top:12px">See <a href="faq.html">all ' . count($d['faqs']) . ' renting questions</a>, or the <a href="resources.html">free advice services</a> for help with your own situation.</p>' . "\n";
  $p .= foot($d['updated']) . $CLOSE;
  file_put_contents("$ROOT/faq/{$f['id']}.html", $p);
  $built[$f['id'] . '.html'] = true;
}

/* -- retire pages for questions that have been taken out -------------------- */
$retired = [];
foreach (glob("$ROOT/faq/*.html") as $file) {
  $b = basename($file);
  if (strpos($b, 'DD_') === 0 || isset($built[$b])) continue;
  rename($file, "$ROOT/faq/DD_$b");
  $retired[] = $b;
}

/* -- sitemap: drop the old FAQ entries, add the current ones ---------------- */
$sm = file_get_contents("$ROOT/sitemap.xml");
$sm = preg_replace('#\s*<url>\s*<loc>https://www\.savvyrenter\.co\.uk/faq(\.html|/[^<]*)</loc>.*?</url>#s', '', $sm);
$add = "\n  <url>\n    <loc>{$hubUrl}</loc>\n    <lastmod>{$d['updated']}</lastmod>\n    <priority>0.8</priority>\n  </url>";
foreach ($d['faqs'] as $f) $add .= "\n  <url>\n    <loc>{$SITE}faq/{$f['id']}.html</loc>\n    <lastmod>{$d['updated']}</lastmod>\n    <priority>0.6</priority>\n  </url>";
$sm = preg_replace('#\s*</urlset>\s*$#', $add . "\n</urlset>\n", $sm);
file_put_contents("$ROOT/sitemap.xml", $sm);

echo "Built faq.html and " . count($built) . " question pages in faq/.\n";
echo "Sitemap: " . (count($built) + 1) . " FAQ entries.\n";
if ($retired) echo "Retired (renamed DD_, delete by hand): " . implode(', ', $retired) . "\n";
