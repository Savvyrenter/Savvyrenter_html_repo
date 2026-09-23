/* Savvy Renter — data loader
 * ---------------------------------------------------------------------------
 * Fetches the small JSON files published at data.savvyrenter.co.uk.
 *
 * Nothing about the user is sent anywhere. A postcode typed into a page is
 * used to work out which file to ask for and never leaves the browser beyond
 * that: the request is for a file named after the outcode, the same file
 * everyone in that outcode asks for.
 *
 * Usage:
 *     const place = await SavvyData.postcode('SW1A 1AA');
 *     const rents = await SavvyData.rents(place.lad);
 *     const lha   = await SavvyData.lha();
 */
const SavvyData = (() => {

  // The one place the address lives. Change this and everything follows.
  const BASE = 'https://data.savvyrenter.co.uk/v1/';

  // Files fetched once per tab. They never change while someone is looking at
  // the page, so checking three flats in a row costs one request, not three.
  const cache = new Map();

  // One attempt. 'how' is the browser cache mode: the first go is happy to use
  // a stored copy, the second insists on a fresh one.
  function attempt(path, how) {
    return fetch(BASE + path, { cache: how }).then(r => {
      if (r.status === 404) return null;            // asked for something that isn't there
      if (!r.ok) throw new Error('Could not load ' + path + ' (' + r.status + ')');
      return r.json();
    });
  }

  function get(path) {
    if (cache.has(path)) return cache.get(path);
    // If the stored copy is bad — held over from a spell when the data host was
    // down or misconfigured — the browser would go on serving it for as long as
    // it kept it, and the page would look broken to someone whose connection is
    // perfectly fine. So a failure is tried once more with the cache bypassed,
    // and only a second failure is reported.
    const p = attempt(path, 'default')
      .catch(() => attempt(path, 'reload'))
      .catch(err => { cache.delete(path); throw err; });   // let a later retry work
    cache.set(path, p);
    return p;
  }

  // ---- postcodes ---------------------------------------------------------
  // Accepts anything a person might type: "sw1a 1aa", "SW1A1AA", " SW1A  1AA ".
  // The last three characters of a UK postcode are always the inward code, so
  // the split is reliable without needing to know the outcode's shape.
  function tidy(raw) {
    const s = String(raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (s.length < 5 || s.length > 7) return null;
    return { outcode: s.slice(0, -3), unit: s.slice(-3), full: s.slice(0, -3) + ' ' + s.slice(-3) };
  }

  async function postcode(raw) {
    const t = tidy(raw);
    if (!t) return { ok: false, reason: 'format', message: 'That does not look like a full UK postcode.' };

    let file;
    try {
      file = await get('outcodes/' + t.outcode + '.json');
    } catch (e) {
      return { ok: false, reason: 'offline', message: 'Could not reach the data just now. Check your connection and try again.' };
    }
    if (!file) return { ok: false, reason: 'unknown', message: 'No postcodes found for ' + t.outcode + '.' };

    const row = file.p[t.unit];
    if (!row) return { ok: false, reason: 'unknown', message: t.full + ' was not found. It may be a closed postcode, or a typo.' };

    return {
      ok: true,
      postcode: t.full,
      outcode: t.outcode,
      lad: file.lad[row[0]],        // local authority code — the key for rents
      pfa: file.pfa[row[1]],        // police force area code
      lat: row[2],
      lon: row[3]
    };
  }

  // ---- the rent index ----------------------------------------------------
  const rents = code => code ? get('rents/' + code + '.json') : Promise.resolve(null);

  // ---- housing allowance -------------------------------------------------
  const lha = () => get('lha-rates.json');

  // Names are normalised in the rates file: uppercase, "and" spelled out.
  const brmaKey = name => String(name || '').toUpperCase().replace(/&/g, 'AND').replace(/\s+/g, ' ').trim();

  async function lhaFor(brmaName, year) {
    const all = await lha();
    const b = all.brma[brmaKey(brmaName)];
    if (!b) return null;
    const y = year || all.years[all.years.length - 1];
    const r = b.rates[y];
    if (!r) return null;
    return { name: b.name, nation: b.nation, year: y,
             shared: r[0], bed1: r[1], bed2: r[2], bed3: r[3], bed4: r[4] };
  }

  // ---- council tax -------------------------------------------------------
  // One file for the whole of Great Britain: the Band D charge for each
  // authority, and the fractions that turn it into the other bands.
  const councils = () => get('councils.json');

  async function council(code) {
    const all = await councils();
    const a = all.la[code];
    return a ? Object.assign({ code }, a) : null;
  }

  // Every band for one authority, as { A: 1627.90, B: 1899.22, ... }.
  //
  // The fractions differ by nation, which is the trap. England and Wales are
  // ninths of Band D; Wales has a ninth band on top. Scotland kept ninths for
  // A to D but made E to H considerably steeper in April 2017 — its Band H is
  // 2.45 times Band D, not twice. Reading the fractions out of the file rather
  // than carrying a copy here means there is one place to be right.
  async function bands(code, year) {
    const all = await councils();
    const a = all.la[code];
    if (!a) return null;
    const y = year || all.years[0];
    const d = a.bandD[y];
    if (d == null) return null;
    const r = all.ratios[a.nation];
    const out = { code, name: a.name, nation: a.nation, year: y, bandD: d, bands: {} };
    for (const band in r.bands) out.bands[band] = Math.round((d * r.bands[band] / r.den) * 100) / 100;
    return out;
  }

  // What one household actually pays. 'discount' is a key from the file's own
  // list — 'standard', 'single', 'oneleft', 'allgone' — so the page offers
  // whatever the data offers instead of hard-coding the percentages.
  async function charge(code, band, opts) {
    const o = opts || {};
    const all = await councils();
    const b = await bands(code, o.year);
    if (!b || b.bands[band] == null) return null;
    const rule = (all.discounts || []).find(d => d.key === (o.discount || 'standard'))
              || { key: 'standard', off: 0, label: 'Two or more adults' };
    const full = b.bands[band];
    const pay  = Math.round(full * (1 - rule.off) * 100) / 100;
    // Ten instalments is the default a council will bill on; a tenant can ask
    // for twelve and the council has to agree, so both are given.
    return {
      code, name: b.name, nation: b.nation, year: b.year, band,
      full, discount: rule, off: Math.round((full - pay) * 100) / 100, yearly: pay,
      overTen: Math.round((pay / 10) * 100) / 100,
      overTwelve: Math.round((pay / 12) * 100) / 100
    };
  }

  // ---- reading the rent series ------------------------------------------
  // beds: 0 = any size, 1..4 = that many bedrooms. Returns null where ONS
  // published no figure, rather than guessing one.
  const COL = { 0: 1, 1: 2, 2: 3, 3: 4, 4: 5 };

  function atMonth(series, month, beds = 0) {
    if (!series) return null;
    const col = COL[beds];
    const row = month
      ? series.months.find(m => m[0] === month)
      : [...series.months].reverse().find(m => m[col] != null);
    return row ? { month: row[0], rent: row[col] } : null;
  }

  // How much the rent in an area has moved over a period, as a figure and a
  // percentage. Give it the number of years back to compare with.
  function change(series, yearsBack = 1, beds = 0) {
    const now = atMonth(series, null, beds);
    if (!now) return null;
    const [y, m] = now.month.split('-').map(Number);
    const thenMonth = (y - yearsBack) + '-' + String(m).padStart(2, '0');
    const then = atMonth(series, thenMonth, beds);
    if (!then || !then.rent) return null;
    return {
      from: then.month, to: now.month,
      wasRent: then.rent, nowRent: now.rent,
      difference: now.rent - then.rent,
      percent: Math.round(((now.rent - then.rent) / then.rent) * 1000) / 10
    };
  }

  return { BASE, postcode, rents, lha, lhaFor, brmaKey, atMonth, change, tidy,
           councils, council, bands, charge };
})();
