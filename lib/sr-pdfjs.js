// Savvy Renter: points pdf.js at the site's own copy in lib/pdfjs.
// Load straight after lib/pdfjs/pdf.min.js.
//
// Older phone and tablet browsers cannot run the standard build, and it then
// simply never appears; for them the "legacy" build in lib/pdfjs/legacy, made
// by pdf.js for older browsers, is loaded in its place.
//
// Opened from a file (file://), browsers will not start pdf.js's worker from a
// file, so its code is put on the page instead and pdf.js runs it there --
// slower on big files, but it works offline.
(function () {
  var base = new URL('pdfjs/', document.currentScript.src).href;
  var dir = window.pdfjsLib ? base : base + 'legacy/';
  var worker = dir + (window.pdfjsLib ? 'pdf.worker.min.js' : 'pdf.worker.js');
  window.SR_pdfjsSetup = function () {
    if (!window.pdfjsLib) return;
    pdfjsLib.GlobalWorkerOptions.workerSrc = worker;
  };
  if (!window.pdfjsLib) document.write('<script src="' + dir + 'pdf.min.js"><\/script>');
  if (location.protocol === 'file:') document.write('<script src="' + worker + '"><\/script>');
  document.write('<script>SR_pdfjsSetup()<\/script>');
})();
