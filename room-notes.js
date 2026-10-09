/* Savvy Renter — room notes
 * ---------------------------------------------------------------------------
 * Splits free notes, typed or spoken, into rooms. Say or write the room as you
 * walk into it ("now into the kitchen", "Bedroom two.", "Bathroom:") and what
 * follows goes under that room until the next one. Going back to a room adds
 * to what is already there.
 *
 * Photo markers in the text, "[photo 3]", tie each photo to the room it was
 * taken in, and count as the end of a sentence.
 *
 *   RoomNotes.split(text)      -> [{ room, text, photos:[3, 4] }]   in the order first visited
 *   RoomNotes.roomAt(text, i)  -> the room being talked about at character i
 *   RoomNotes.ROOM_NAMES       -> the names offered as quick buttons
 *
 * No network, no storage: it only reads the string it is given.
 */
const RoomNotes = (() => {

  // [label, pattern]. Longer names first, so "kitchen diner" is not read as "kitchen".
  const ROOMS = [
    ['Kitchen diner', 'kitchen[ -]?diner'],
    ['Kitchen', 'kitchenette|kitchen'],
    ['Shower room', 'shower ?room'],
    ['En-suite', 'en[ -]?suite'],
    ['Bathroom', 'bathroom'],
    ['Toilet', 'downstairs toilet|downstairs loo|toilet|cloakroom|w\\.?c\\.?(?![a-z])|loo'],
    ['Living room', 'living ?room|lounge|sitting room|front room|reception room'],
    ['Dining room', 'dining ?room'],
    ['Bedroom', 'BEDROOM'],
    ['Box room', 'box ?room'],
    ['Study', 'study|home office'],
    ['Hallway', 'entrance hall|hallway|hall'],
    ['Porch', 'porch'],
    ['Landing', 'landing'],
    ['Stairs', 'staircase|stairwell|stairs'],
    ['Utility room', 'utility room|utility'],
    ['Conservatory', 'conservatory'],
    ['Garden', 'GARDEN'],
    ['Garage', 'garage'],
    ['Loft', 'loft|attic'],
    ['Cellar', 'cellar|basement'],
    ['Balcony', 'balcony'],
    ['Cupboards', '(?:airing|meter|boiler|storage|under ?stairs|understairs) cupboard'],
    ['Communal areas', 'communal (?:areas?|hallway|stairs|entrance)|shared (?:areas?|hallway|stairs|entrance)'],
    ['Outside', 'outside of the (?:house|flat|building|property)|outside|exterior|front of the (?:house|building|property)|back of the (?:house|building|property)'],
  ];
  const NUM = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6,
                '1st': 1, '2nd': 2, '3rd': 3, '4th': 4, '5th': 5, '6th': 6 };
  const BED = '(?:(?:first|second|third|fourth|fifth|sixth|1st|2nd|3rd|4th|5th|6th|main|master|spare|big|small|front|back|double|single|largest|smallest)\\s+)?bedroom(?:\\s+(?:one|two|three|four|five|six|[1-6]))?';
  const GARDEN = '(?:(?:front|back|rear|side)\\s+)?(?:garden|yard)|patio';

  const alt = ROOMS.map(r => r[1] === 'BEDROOM' ? BED : r[1] === 'GARDEN' ? GARDEN : r[1]).join('|');

  // A room starts where a sentence starts with it (after any "okay, so now
  // we're into the ..."), or anywhere after a strong cue like "now into the".
  // A sentence that merely opens with a room's name ("The kitchen tap again")
  // only counts if the name stands alone ("Kitchen.", "Bedroom two,", "Hall:")
  // or begins a new line.
  const LEAD = '(?:(?:ok(?:ay)?|right|so|and|now|next|then|lastly|finally)[ ,]+)*' +
               '(?:(?:we(?:\'re| are)|i(?:\'m| am)|this is|here(?:\'s| is)|moving|going|coming|heading|walking|stepping)\\s+)?' +
               '(?:back\\s+(?=(?:in|into|to|onto|out|through)\\s))?' +
               '(?:(?:in|into|to|onto|on|out|through|up|down|upstairs|downstairs|over)\\s+(?:to\\s+|into\\s+|in\\s+)?)*' +
               '(?:the\\s+|a\\s+|my\\s+)?';
  const AT_START = new RegExp('(^|[\\n.!?;:\\]])([ \\t]*' + LEAD + ')(' + alt + ')(?![a-z])', 'gi');
  const CUE = new RegExp('\\b(?:now|next)\\s+(?:(?:in|into|on|onto|to|up|down|through)\\s+(?:to\\s+)?)?(?:the\\s+)?(' + alt + ')(?![a-z])' +
                         '|\\b(?:(?:we\'re|we are|i\'m|i am)\\s+)?(?:moving|going|heading|walking|stepping|we\'re|we are|i\'m|i am)\\s+(?:on\\s+|back\\s+)?(?:in|into|to|onto|through)\\s+(?:to\\s+)?(?:the\\s+)?(' + alt + ')(?![a-z])' +
                         '|\\bthis is the\\s+(' + alt + ')(?![a-z])', 'gi');
  const PHOTO = /\[photo (\d+)\]/gi;

  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  // The heading for a matched room name: "second bedroom" and "bedroom 2" are both "Bedroom 2".
  function label(word) {
    const w = word.toLowerCase().replace(/\s+/g, ' ').trim();
    if (/bedroom/.test(w)) {
      const m = w.match(/^(\S+) bedroom/), n = w.match(/bedroom (\S+)$/);
      const k = (n && (NUM[n[1]] || +n[1])) || (m && NUM[m[1]]);
      if (k) return 'Bedroom ' + k;
      if (m) return cap(m[1] === 'master' ? 'main' : m[1]) + ' bedroom';
      return 'Bedroom';
    }
    if (/garden|yard|patio/.test(w)) {
      if (w === 'patio') return 'Patio';
      const m = w.match(/^(front|back|rear|side) /);
      return m ? cap(m[1] === 'rear' ? 'back' : m[1]) + ' ' + w.split(' ').pop() : cap(w);
    }
    for (const [name, pat] of ROOMS) {
      if (pat === 'BEDROOM' || pat === 'GARDEN') continue;
      if (new RegExp('^(?:' + pat + ')$', 'i').test(w)) return name;
    }
    return cap(w);
  }

  // Every place a room starts: [{ at, room }], in order.
  function starts(text) {
    const out = [];
    let m;
    AT_START.lastIndex = 0;
    while ((m = AT_START.exec(text))) {
      const end = m.index + m[0].length;
      const moved = /\b(?:in|into|to|onto|on|out|through|up|down|upstairs|downstairs|over|now|next|this|here|we|we're|i'm|am|moving|going|coming|heading|walking|stepping)\b/i.test(m[2]);
      const alone = /^[ \t]*(?:[.,:;!?\u2013\u2014-]|\n|$)/.test(text.slice(end))
        || (/\s|\d/.test(m[3]) && !/\b(?:the|a|my)\s*$/i.test(m[2]));   // "Bedroom 3 cold", "Rear garden fence down"
      if (moved || alone || m[1] === '\n' || m.index === 0 && m[1] === '') out.push({ at: m.index + m[1].length, room: label(m[3]) });
      if (m[0].length === 0) AT_START.lastIndex++;
    }
    CUE.lastIndex = 0;
    while ((m = CUE.exec(text))) {
      // The room starts with the sentence the cue is in, not halfway through it.
      let at = m.index;
      while (at > 0 && !/[.!?;\n\]]/.test(text.charAt(at - 1))) at--;
      while (/\s/.test(text.charAt(at)) && at < m.index) at++;
      if (!out.some(s => Math.abs(s.at - at) < 40 && s.room === label(m[1] || m[2] || m[3]))) {
        out.push({ at: at, room: label(m[1] || m[2] || m[3]) });
      }
    }
    return out.sort((a, b) => a.at - b.at);
  }

  function split(text) {
    text = String(text || '');
    const st = starts(text);
    const rooms = [], byName = new Map();
    function add(room, chunk) {
      chunk = chunk.trim();
      const photos = [];
      let m;
      PHOTO.lastIndex = 0;
      while ((m = PHOTO.exec(chunk))) photos.push(+m[1]);
      if (!chunk && room === 'General') return;
      let r = byName.get(room);
      if (!r) { r = { room: room, text: '', photos: [] }; byName.set(room, r); rooms.push(r); }
      if (chunk) r.text += (r.text ? '\n' : '') + chunk;
      photos.forEach(n => { if (!r.photos.includes(n)) r.photos.push(n); });
    }
    add('General', text.slice(0, st.length ? st[0].at : text.length));
    st.forEach((s, i) => add(s.room, text.slice(s.at, i + 1 < st.length ? st[i + 1].at : text.length)));
    return rooms;
  }

  function roomAt(text, pos) {
    const st = starts(String(text || '').slice(0, pos));
    return st.length ? st[st.length - 1].room : 'General';
  }

  const ROOM_NAMES = ['Hallway', 'Living room', 'Kitchen', 'Bathroom', 'Bedroom', 'Toilet', 'Landing', 'Garden', 'Outside'];

  return { split, roomAt, label, ROOM_NAMES };
})();
if (typeof module === 'object' && module.exports) module.exports = RoomNotes;
