// Savvy Renter text reader (OCR) -- the one place a page starts Tesseract.
// Everything comes from the site's own copy in lib/tesseract, never the internet,
// so it works the same on the live site and on a downloaded copy.
//
//   <script src="lib/sr-ocr.js"></script>
//   const worker = await SROcr.create(m => { ... progress ... });
//   const { data } = await worker.recognize(canvas);
//
// Served over http(s): the usual separate files (reader, engine, English data).
// Opened from a file (file://): browsers refuse to start a worker or fetch from
// files, so the reader and engine come in as one string (offline-worker.js) and
// the English data as another (offline-eng.js), both loaded as plain scripts.
(function () {
  var me = document.currentScript && document.currentScript.src;
  var base = new URL('tesseract/', me || location.href).href;
  var fromFile = location.protocol === 'file:';

  function load(src) {
    return new Promise(function (ok, fail) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = ok;
      s.onerror = function () { fail(new Error('Could not load ' + src)); };
      document.head.appendChild(s);
    });
  }
  function bytes(b64) {
    var bin = atob(b64), out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  window.SROcr = {
    create: async function (logger) {
      if (!window.Tesseract) await load(base + 'tesseract.min.js');
      var opts = { logger: logger || function () {} };
      if (!fromFile) {
        opts.workerPath = base + 'worker.min.js';
        opts.corePath = base;
        opts.langPath = base;
        return Tesseract.createWorker('eng', 1, opts);
      }
      if (!window.SR_TESS_WORKER) await load(base + 'offline-worker.js');
      if (!window.SR_TESS_ENG) await load(base + 'offline-eng.js');
      opts.workerPath = URL.createObjectURL(new Blob([window.SR_TESS_WORKER], { type: 'application/javascript' }));
      opts.workerBlobURL = false;
      opts.cacheMethod = 'none';
      return Tesseract.createWorker([{ code: 'eng', data: bytes(window.SR_TESS_ENG) }], 1, opts);
    }
  };
})();
