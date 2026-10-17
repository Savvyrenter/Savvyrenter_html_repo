/* Savvy Renter — photo details reader
 * ---------------------------------------------------------------------------
 * Reads what a photo file says about itself, entirely in the browser:
 *   - EXIF: camera make and model, when it was taken, editing software, GPS
 *   - XMP: the creating tool and the IPTC "digital source type", which AI
 *     image tools use to label their output (trainedAlgorithmicMedia etc.)
 *   - C2PA Content Credentials: whether a manifest is present, the tool that
 *     made it, its recorded actions and source types, and the organisation
 *     named on its signing certificate. The signature is NOT verified here.
 *   - PNG text: the prompt and settings some AI generators write into the file
 *
 *   const r = PhotoMeta.read(arrayBuffer, fileName);
 *   r.verdict  -> { level: 'ai' | 'edited' | 'none', reasons: [...] }
 *
 * No network, no storage. Works on JPEG, PNG and WebP; other formats get a
 * byte scan for the same markers.
 */
const PhotoMeta = (() => {

  // Tools that make images with AI, or whose output is AI-made.
  const AI_TOOLS = /firefly|dall[\s·-]?e|openai|chatgpt|midjourney|stable[\s_-]?diffusion|sdxl|\bimagen\b|gemini|google ai|bing image creator|microsoft designer|image creator|leonardo|ideogram|\bflux\b|comfyui|automatic1111|novelai|nightcafe|dreamstudio|runway|krea|playground ai|grok|aurora|recraft|virtual ?staging|boxbrownie|reimagine ?home|collov|roomgpt|interior ?ai|apply design/i;
  // Software that edits photos. Not proof of anything, but worth knowing.
  const EDIT_TOOLS = /photoshop|lightroom|gimp|canva|snapseed|pixelmator|affinity|picsart|fotor|befunky|photoroom|luminar|facetune|photopea|paint\.net|capture one|darktable|vsco|meitu|airbrush/i;
  // IPTC digital source types that mean "made or changed by AI".
  const AI_SOURCES = /^(trainedAlgorithmicMedia|compositeWithTrainedAlgorithmicMedia|algorithmicMedia|compositeSynthetic)$/;
  const SOURCE_WORDS = {
    trainedAlgorithmicMedia: 'made by generative AI',
    compositeWithTrainedAlgorithmicMedia: 'partly made or changed by generative AI',
    algorithmicMedia: 'made by a computer, not a camera',
    compositeSynthetic: 'a composite including computer-made parts',
    digitalCapture: 'taken with a digital camera',
    negativeFilm: 'scanned from film', positiveFilm: 'scanned from film', print: 'scanned from a print',
    minorHumanEdits: 'a capture with minor edits', compositeCapture: 'a composite of camera photos',
    composite: 'a composite image', screenCapture: 'a screenshot', digitalArt: 'digital artwork',
    humanEdits: 'edited by a person', dataDrivenMedia: 'made from data',
  };

  function latin1(u8, a, b) {
    let s = '';
    for (let i = a; i < b; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, Math.min(b, i + 0x8000)));
    return s;
  }
  function utf8(u8, a, b) {
    try { return new TextDecoder('utf-8').decode(u8.subarray(a, b)); } catch (e) { return latin1(u8, a, b); }
  }
  function clean(s) { return String(s || '').replace(/\0+$/g, '').replace(/[\0-\x08\x0b\x0c\x0e-\x1f]/g, '').trim(); }

  // ---------------------------------------------------------------- EXIF (TIFF)
  function readTiff(u8, start, end, out) {
    const dv = new DataView(u8.buffer, u8.byteOffset);
    if (end - start < 8) return;
    const le = dv.getUint16(start) === 0x4949;
    const g16 = o => dv.getUint16(start + o, le), g32 = o => dv.getUint32(start + o, le);
    const len = end - start;
    const SIZE = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8 };
    function ascii(vo, cnt) { return vo + cnt <= len ? clean(utf8(u8, start + vo, start + vo + cnt)) : ''; }
    function rat(vo, i) { const n = g32(vo + i * 8), d = g32(vo + i * 8 + 4); return d ? n / d : 0; }
    function ifd(off, fn) {
      if (!off || off + 2 > len) return;
      const n = g16(off);
      for (let i = 0; i < n; i++) {
        const e = off + 2 + i * 12;
        if (e + 12 > len) break;
        const tag = g16(e), type = g16(e + 2), cnt = g32(e + 4);
        const vo = (SIZE[type] || 1) * cnt <= 4 ? e + 8 : g32(e + 8);
        if (vo > len) continue;
        fn(tag, type, cnt, vo);
      }
    }
    let exifOff = 0, gpsOff = 0;
    ifd(g32(4), (tag, type, cnt, vo) => {
      if (tag === 0x010F) out.make = ascii(vo, cnt);
      else if (tag === 0x0110) out.model = ascii(vo, cnt);
      else if (tag === 0x0131) out.software = ascii(vo, cnt);
      else if (tag === 0x0132) out.modified = ascii(vo, cnt);
      else if (tag === 0x013B) out.artist = ascii(vo, cnt);
      else if (tag === 0x8298) out.copyright = ascii(vo, cnt);
      else if (tag === 0x8769) exifOff = g32(vo);
      else if (tag === 0x8825) gpsOff = g32(vo);
    });
    ifd(exifOff, (tag, type, cnt, vo) => {
      if (tag === 0x9003) out.taken = ascii(vo, cnt);
      else if (tag === 0x9004 && !out.taken) out.taken = ascii(vo, cnt);
      else if (tag === 0xA434) out.lens = ascii(vo, cnt);
    });
    const gps = {};
    ifd(gpsOff, (tag, type, cnt, vo) => {
      if (tag === 1) gps.latRef = ascii(vo, cnt);
      else if (tag === 2 && type === 5 && cnt >= 3) gps.lat = rat(vo, 0) + rat(vo, 1) / 60 + rat(vo, 2) / 3600;
      else if (tag === 3) gps.lonRef = ascii(vo, cnt);
      else if (tag === 4 && type === 5 && cnt >= 3) gps.lon = rat(vo, 0) + rat(vo, 1) / 60 + rat(vo, 2) / 3600;
    });
    if (typeof gps.lat === 'number' && typeof gps.lon === 'number' && (gps.lat || gps.lon)) {
      out.gps = { lat: gps.latRef === 'S' ? -gps.lat : gps.lat, lon: gps.lonRef === 'W' ? -gps.lon : gps.lon };
    }
  }

  // ---------------------------------------------------------------- XMP
  function readXmp(text, out) {
    out.xmpFound = true;
    function field(name) {
      const a = new RegExp(name + '="([^"]*)"').exec(text);
      if (a) return a[1];
      const b = new RegExp('<' + name + '[^>]*>([\\s\\S]*?)</' + name + '>').exec(text);
      if (!b) return '';
      const li = /<rdf:li[^>]*>([\s\S]*?)<\/rdf:li>/.exec(b[1]);
      return clean((li ? li[1] : b[1]).replace(/<[^>]+>/g, ' '));
    }
    out.creatorTool = out.creatorTool || field('xmp:CreatorTool');
    out.credit = field('photoshop:Credit') || field('dc:creator') || '';
    out.xmpCreated = field('xmp:CreateDate') || field('photoshop:DateCreated') || field('exif:DateTimeOriginal') || '';
    collectSources(text, out);
  }
  function collectSources(text, out) {
    const re = /digitalsourcetype\/([A-Za-z]+)/g;
    let m;
    while ((m = re.exec(text))) if (out.sourceTypes.indexOf(m[1]) < 0) out.sourceTypes.push(m[1]);
  }

  // ---------------------------------------------------------------- C2PA
  // The manifest is JUMBF boxes holding CBOR and a COSE signature. This reads
  // the parts that say what made the image; it does not check the signature.
  function readC2pa(u8, chunks, out) {
    let total = 0;
    chunks.forEach(c => { total += c[1] - c[0]; });
    if (!total) return;
    const s = chunks.map(c => latin1(u8, c[0], c[1])).join('');
    if (s.indexOf('c2pa') < 0 && s.indexOf('jumb') < 0) return;
    const c = out.c2pa = { found: true, generator: '', actions: [], signers: [] };
    // CBOR text right after a key: 0x60+len (len<24), 0x78 len, 0x79 len16
    function textAfter(key, from) {
      const i = s.indexOf(key, from || 0);
      if (i < 0) return '';
      let p = i + key.length, h = s.charCodeAt(p), len = -1;
      if (h >= 0x60 && h <= 0x77) { len = h - 0x60; p += 1; }
      else if (h === 0x78) { len = s.charCodeAt(p + 1); p += 2; }
      else if (h === 0x79) { len = s.charCodeAt(p + 1) * 256 + s.charCodeAt(p + 2); p += 3; }
      if (len < 0 || len > 512) return '';
      try { return decodeURIComponent(escape(s.substr(p, len))); } catch (e) { return s.substr(p, len); }
    }
    c.generator = textAfter('claim_generator') || '';
    if (!c.generator || c.generator.length < 2) {
      const gi = s.indexOf('claim_generator_info');
      c.generator = gi >= 0 ? textAfter('name', gi) : '';
    }
    const acts = /c2pa\.(created|placed|opened|edited|cropped|resized|filtered|color_adjustments|drawing|converted|transcoded|repackaged|removed|published|watermarked|redacted|unknown)/g;
    let m;
    while ((m = acts.exec(s))) if (c.actions.indexOf(m[1]) < 0) c.actions.push(m[1]);
    collectSources(s, out);
    // Organisation names on the signing certificates: X.509 OID 2.5.4.10.
    const oid = '\x06\x03\x55\x04\x0a';
    let k = 0;
    while ((k = s.indexOf(oid, k)) >= 0) {
      const t = s.charCodeAt(k + 5), l = s.charCodeAt(k + 6);
      if ((t === 0x0c || t === 0x13 || t === 0x14) && l > 0 && l < 128) {
        const v = clean(s.substr(k + 7, l));
        if (v && c.signers.indexOf(v) < 0) c.signers.push(v);
      }
      k += 5;
    }
  }

  // ---------------------------------------------------------------- formats
  function readJpeg(u8, out) {
    const dv = new DataView(u8.buffer, u8.byteOffset);
    let p = 2;
    const jumbf = [];
    while (p + 4 <= u8.length) {
      if (u8[p] !== 0xFF) { p++; continue; }
      const mk = u8[p + 1];
      if (mk === 0xD8 || (mk >= 0xD0 && mk <= 0xD7) || mk === 0x01 || mk === 0xFF) { p += mk === 0xFF ? 1 : 2; continue; }
      if (mk === 0xD9 || mk === 0xDA) break;
      const len = dv.getUint16(p + 2), a = p + 4, b = p + 2 + len;
      if (b > u8.length) break;
      if (mk === 0xE1) {
        const head = latin1(u8, a, Math.min(b, a + 40));
        if (head.indexOf('Exif\0') === 0) readTiff(u8, a + 6, b, out);
        else if (head.indexOf('http://ns.adobe.com/xap/1.0/') === 0) readXmp(utf8(u8, a + 29, b), out);
      } else if (mk === 0xEB && u8[a] === 0x4A && u8[a + 1] === 0x50) {
        jumbf.push([a + 8, b]);   // JP, En, Z, then the box data
      } else if (mk >= 0xC0 && mk <= 0xCF && mk !== 0xC4 && mk !== 0xC8 && mk !== 0xCC) {
        out.height = dv.getUint16(a + 1); out.width = dv.getUint16(a + 3);
      }
      p = b;
    }
    readC2pa(u8, jumbf, out);
  }
  function readPng(u8, out) {
    const dv = new DataView(u8.buffer, u8.byteOffset);
    let p = 8;
    while (p + 12 <= u8.length) {
      const len = dv.getUint32(p), type = latin1(u8, p + 4, p + 8), a = p + 8, b = a + len;
      if (b > u8.length) break;
      if (type === 'IHDR') { out.width = dv.getUint32(a); out.height = dv.getUint32(a + 4); }
      else if (type === 'eXIf') readTiff(u8, a, b, out);
      else if (type === 'caBX') readC2pa(u8, [[a, b]], out);
      else if (type === 'tEXt' || type === 'iTXt' || type === 'zTXt') {
        const z = u8.indexOf(0, a);
        const key = z > a && z < b ? latin1(u8, a, z) : '';
        let val = '';
        if (type === 'tEXt') val = utf8(u8, z + 1, b);
        else if (type === 'iTXt' && u8[z + 1] === 0) {
          let q = z + 3; q = u8.indexOf(0, q) + 1; q = u8.indexOf(0, q) + 1;
          val = utf8(u8, q, b);
        }
        if (key === 'XML:com.adobe.xmp') readXmp(val, out);
        else if (key) out.pngText[key] = val ? val.slice(0, 600) : '(compressed)';
      }
      if (type === 'IEND') break;
      p = b + 4;
    }
  }
  function readWebp(u8, out) {
    const dv = new DataView(u8.buffer, u8.byteOffset);
    let p = 12;
    while (p + 8 <= u8.length) {
      const type = latin1(u8, p, p + 4), len = dv.getUint32(p + 4, true), a = p + 8, b = a + len;
      if (b > u8.length) break;
      if (type === 'EXIF') readTiff(u8, latin1(u8, a, a + 6) === 'Exif\0\0' ? a + 6 : a, b, out);
      else if (type === 'XMP ') readXmp(utf8(u8, a, b), out);
      else if (type === 'C2PA') readC2pa(u8, [[a, b]], out);
      else if (type === 'VP8X') { out.width = 1 + (u8[a + 4] | u8[a + 5] << 8 | u8[a + 6] << 16); out.height = 1 + (u8[a + 7] | u8[a + 8] << 8 | u8[a + 9] << 16); }
      p = b + (len & 1);
    }
  }

  // ---------------------------------------------------------------- the verdict
  function verdict(out) {
    const ai = [], ed = [];
    out.sourceTypes.forEach(t => {
      const w = SOURCE_WORDS[t] || t;
      if (AI_SOURCES.test(t)) ai.push('The file is labelled as ' + w + '.');
    });
    const pt = Object.keys(out.pngText);
    if (pt.some(k => /^(parameters|prompt|workflow|negative_prompt|sd-metadata|invokeai_metadata|dream)$/i.test(k))) {
      ai.push('The file carries AI image-generator settings (' + pt.filter(k => /parameters|prompt|workflow|sd-metadata|invokeai|dream/i.test(k)).join(', ') + ').');
    }
    [['Content Credentials say it was made with', out.c2pa && out.c2pa.generator],
     ['The creating software is', out.creatorTool], ['The software recorded is', out.software],
     ['The credit line reads', out.credit]].forEach(([lead, v]) => {
      if (!v) return;
      if (AI_TOOLS.test(v)) ai.push(lead + ' "' + v + '", which is an AI image tool or AI virtual staging service.');
      else if (EDIT_TOOLS.test(v)) ed.push(lead + ' "' + v + '", which is photo-editing software.');
    });
    if (out.c2pa && out.c2pa.actions.indexOf('edited') >= 0 && !ai.length) ed.push('Content Credentials record that the image was edited.');
    if (ai.length) return { level: 'ai', reasons: ai.concat(ed) };
    if (ed.length) return { level: 'edited', reasons: ed };
    return { level: 'none', reasons: [] };
  }

  function read(buf, name) {
    const u8 = new Uint8Array(buf);
    const out = { format: '', width: 0, height: 0, pngText: {}, sourceTypes: [], c2pa: null };
    try {
      if (u8[0] === 0xFF && u8[1] === 0xD8) { out.format = 'JPEG'; readJpeg(u8, out); }
      else if (u8[0] === 0x89 && u8[1] === 0x50 && u8[2] === 0x4E && u8[3] === 0x47) { out.format = 'PNG'; readPng(u8, out); }
      else if (latin1(u8, 0, 4) === 'RIFF' && latin1(u8, 8, 12) === 'WEBP') { out.format = 'WebP'; readWebp(u8, out); }
      else {
        out.format = /\.(hei[cf]|avif)$/i.test(name || '') ? RegExp.$1.toUpperCase() : 'another format';
        // Not read box by box: look for the same markers anywhere in the file.
        const s = latin1(u8, 0, Math.min(u8.length, 4000000));
        collectSources(s, out);
        if (s.indexOf('c2pa') >= 0) readC2pa(u8, [[0, Math.min(u8.length, 4000000)]], out);
        out.partial = true;
      }
    } catch (e) { out.error = 'Part of this file could not be read: ' + e.message; }
    out.verdict = verdict(out);
    return out;
  }

  return { read, SOURCE_WORDS };
})();
if (typeof module === 'object' && module.exports) module.exports = PhotoMeta;
