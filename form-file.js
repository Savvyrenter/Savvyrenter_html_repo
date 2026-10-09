/* form-file — save a form to a file on the person's own device, and open it again.
 * ---------------------------------------------------------------------------
 * Shared module. MASTER COPY lives in www\shared-modules\form-file\.
 * Projects get a copy through sync-modules.bat; edit here, never in a project.
 *
 * Nothing is uploaded or stored anywhere: the file is made in the browser and
 * handed to the person, and opening reads it straight from their disk.
 *
 * The file is plain JSON:  { kind, version, saved, fields: { id: value } }
 *   kind    — names the page or tool that made it, so a file from one tool is
 *             not mistaken for another's. Tools that share field ids can read
 *             each other's files by accepting more than one kind.
 *   fields  — every input, select and textarea inside the root, keyed by id.
 *
 * Skipped: elements with no id, file inputs, and anything with class "gen"
 * (text the page generates itself, which would be stale when reopened).
 * Checkboxes are stored as true when ticked and left out when not.
 *
 * Usage:
 *   const fields = FormFile.collect(document.getElementById('f'));
 *   FormFile.save('savvyrenter-before-you-rent', fields, 'Before you rent.json');
 *
 *   FormFile.open(fileFromInput, ['savvyrenter-before-you-rent'])
 *     .then(data => FormFile.restore(document.getElementById('f'), data.fields))
 *     .catch(msg => show(msg));
 */
const FormFile = (() => {

  const FIELDS = 'input, select, textarea';
  const skip = (e) => !e.id || e.type === 'file' || e.classList.contains('gen');

  // Read every field under root into a plain object.
  function collect(root) {
    const out = {};
    root.querySelectorAll(FIELDS).forEach((e) => {
      if (skip(e)) return;
      if (e.type === 'checkbox' || e.type === 'radio') { if (e.checked) out[e.id] = true; return; }
      if (e.value !== '') out[e.id] = e.value;
    });
    return out;
  }

  // Empty every field under root, then put the saved values back. Ids in the
  // file that this page does not have are ignored, so older files still open.
  function restore(root, fields) {
    root.querySelectorAll(FIELDS).forEach((e) => {
      if (skip(e)) return;
      if (e.type === 'checkbox' || e.type === 'radio') e.checked = false;
      else if (e.tagName === 'SELECT') e.selectedIndex = 0;
      else e.value = '';
    });
    Object.keys(fields || {}).forEach((id) => {
      const e = root.querySelector('#' + CSS.escape(id));
      if (!e || skip(e)) return;
      if (e.type === 'checkbox' || e.type === 'radio') e.checked = !!fields[id];
      else e.value = fields[id];
    });
  }

  // A file name Windows, Mac and phones will all accept.
  const safeName = (s) => String(s || 'saved').replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, ' ').trim();

  // Hand the person a file. Returns the name it was given.
  function save(kind, fields, name, version) {
    const data = { kind: kind, version: version || 1, saved: new Date().toISOString(), fields: fields };
    const file = safeName(name).replace(/\.json$/i, '') + '.json';
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' }));
    a.download = file;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    return file;
  }

  // Read a File (from an <input type="file">). Resolves with the whole saved
  // object; rejects with a plain-English message if it is not one of 'kinds'.
  function open(file, kinds) {
    return new Promise((resolve, reject) => {
      if (!file) { reject('No file chosen.'); return; }
      const rd = new FileReader();
      rd.onerror = () => reject('That file could not be read.');
      rd.onload = () => {
        let data = null;
        try { data = JSON.parse(rd.result); } catch (e) { data = null; }
        const ok = data && data.fields && (!kinds || [].concat(kinds).includes(data.kind));
        if (ok) resolve(data); else reject('That is not a file saved from this page.');
      };
      rd.readAsText(file);
    });
  }

  return { collect, restore, save, open, safeName };
})();
