'use strict';
/* Icons, stars, the block character and the canvas drawing helpers that every game shares. */
const IC = {
  bulb:'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/>',
  hammer:'<path d="M13.5 4.5l6 6-3 3-6-6zM12 9l-8.5 8.5 3 3L15 12"/>',
  pencil:'<path d="M4 20l1-4.5L16 4.5l3.5 3.5L8.5 19 4 20zM13.5 7l3.5 3.5"/>',
  maths:'<path d="M4.5 7.5h6M7.5 4.5v6M14 7.5h6M5 14.5l5 5M10 14.5l-5 5M14 15.5h6M14 19h6"/>',
  code:'<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 5l-3 14"/>',
  cog:'<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="6.5"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
  leaf:'<path d="M5 19C5 10 10 5 20 4.5 20 14 15 19.5 6.5 19.5M5 20l8-8.5"/>',
  team:'<circle cx="8.5" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M2.5 20c0-3.5 2.7-6 6-6s6 2.5 6 6M16 14.5c3-.3 5.5 1.8 5.5 5.5"/>',
  search:'<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l6 6"/>',
  why:'<circle cx="12" cy="12" r="9.5"/><path d="M9.2 9.5a2.9 2.9 0 1 1 4.4 2.5c-1 .6-1.6 1.2-1.6 2.5M12 17.6v.01"/>',
  talk:'<path d="M4 5h16v11H10.5L6 20v-4H4z"/>',
  flag:'<path d="M5 21V4M5 4.5h13l-3 4 3 4H5"/>',
  hex:'<path d="M12 2.5l8.2 4.7v9.6L12 21.5l-8.2-4.7V7.2z"/><circle cx="12" cy="12" r="2.8"/>',
  bolt:'<path d="M13 2.5L4.5 13.5H11L10 21.5l8.5-11.5H12.5z"/>',
  arrow:'<path d="M12 20V5M5.5 11.5L12 5l6.5 6.5"/>',
  back:'<path d="M19 12H5M11.5 5.5L5 12l6.5 6.5"/>',
  undo:'<path d="M4 9h10a5.5 5.5 0 0 1 0 11H8M4 9l4.5-4.5M4 9l4.5 4.5"/>',
  play:'<path d="M7 4.5v15l12-7.5z"/>',
  check:'<path d="M4.5 12.5l5 5 10-11"/>',
  glasses:'<circle cx="7" cy="13.5" r="4"/><circle cx="17" cy="13.5" r="4"/><path d="M11 13.5h2M3 13l1.5-6M21 13l-1.5-6"/>',
  school:'<path d="M2.5 9L12 4.5 21.5 9 12 13.5zM6.5 11.5v5c3 2.5 8 2.5 11 0v-5"/>',
  factory:'<path d="M3 20.5V10l6 4v-4l6 4V5h5v15.5z"/>',
  plane:'<path d="M2.5 13.5l19-8-5 15-4.5-5.5z"/><path d="M11.5 15l3-3.5"/>',
  shirt:'<path d="M8 3.5L3 6.5l2 4 2.5-1v10h9v-10l2.5 1 2-4-5-3c-.8 1.8-4.2 1.8-5 0z"/>',
  hat:'<path d="M4 16a8 8 0 0 1 16 0zM2.5 16h19v2.5h-19zM11 8V5h2v3"/>',
};
const icon = (n, rot = 0) => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"${rot ? ` style="transform:rotate(${rot}deg)"` : ''}>${IC[n]}</svg>`;

const STAR_ROWS = ['.....#.....', '....###....', '....###....', '###########', '.#########.', '..#######..', '..#######..', '.####.####.', '.##.....##.'];
const STAR = STAR_ROWS.map((row, y) => [...row.matchAll(/#+/g)].map(m => `<rect x="${m.index}" y="${y}" width="${m[0].length}" height="1"/>`).join('')).join('');
const stars = (n, cls = '') => `<span class="stars ${cls}" role="img" aria-label="${n} out of 3 stars">${[0,1,2].map(i => `<svg viewBox="0 0 11 9" shape-rendering="crispEdges" class="${i < n ? 'on' : ''}" aria-hidden="true">${STAR}</svg>`).join('')}</span>`;

/* ---------- the block character ---------- */
const SKIN = ['#F8D9BF','#EBBE98','#D4A074','#B37C52','#8B5A3C','#5C3A26'];
const COLS = [['Black','#1C1917'],['Dark brown','#4A2C17'],['Brown','#8A5A2B'],['Blonde','#E0B354'],['Ginger','#C2531A'],['Grey','#9AA3AF'],['Blue','#2563EB'],['Pink','#DB2777'],['Purple','#7C3AED'],['Teal','#0F766E']];
const HAIR = [['short','Short'],['curly','Curly'],['long','Long'],['bun','Bun'],['braids','Braids'],['buzz','Very short'],['hijab','Hijab'],['turban','Turban']];
const OUTFITS = [['overalls','Overalls'],['hivis','Hi-vis'],['labcoat','Lab coat'],['flight','Flight suit'],['polo','Polo']];
const GEAR = [['none','None'],['hardhat','Hard hat'],['goggles','Safety specs'],['ears','Ear defenders'],['headset','Headset']];
const OUTFIT_COL = {overalls:['#1F3A93','#1F3A93','#1F3A93'], hivis:['#DDF026','#14275E','#14275E'], labcoat:['#F2F5FB','#2B3350','#F2F5FB'], flight:['#52739F','#52739F','#52739F'], polo:['#2447C9','#2B3350','#2447C9']};

// The character is a list of rectangles on a 16 x 27.5 grid (half units allowed), so one drawing serves the pages (SVG) and the games (canvas).
// frame: 0 standing, 1 and 2 walking. accent: the engineer's colour, used for badges and stripes.
function spriteRects(av, frame = 0, accent = '#F5E12B') {
  const sk = SKIN[av.skin], hc = COLS[av.col][1], h = av.hair, o = av.outfit || 'overalls', gear = av.gear || 'none';
  const R = [], r = (x, y, w, hh, c) => R.push([x, y, w, hh, c]);
  const dk = 'rgba(8,12,40,.22)', lt = 'rgba(255,255,255,.28)', [top, leg, sleeve] = OUTFIT_COL[o];
  [[4.5, frame === 1 ? 1.5 : 0], [8.5, frame === 2 ? 1.5 : 0]].forEach(([x, up]) => {
    r(x, 20, 3, 5.5 - up, leg); r(x + 2.5, 20, .5, 5.5 - up, dk);
    if (o === 'hivis') r(x, 23.5 - up, 3, .5, '#D6DCE8');
    if (o === 'overalls' || o === 'flight') r(x + .5, 22 - up, 2, 1.5, dk);
    r(x - .5, 25.5 - up, 3.5, 2, '#171A26'); r(x - .5, 25.5 - up, 3.5, .5, '#3A4056');
  });
  if (o === 'labcoat') { r(4, 20, 8, 2.5, top); r(7.75, 20, .5, 2.5, dk); r(11, 20, 1, 2.5, dk); }
  if (h === 'long') { r(2.5, 3.5, 1.5, 12, hc); r(12, 3.5, 1.5, 12, hc); r(13, 3.5, .5, 12, dk); }
  for (const x of [2, 12]) { if (o === 'polo') { r(x, 12, 2, 2.5, sleeve); r(x, 14.5, 2, 4.5, sk); } else { r(x, 12, 2, 5.5, sleeve); r(x, 17, 2, .5, dk); r(x, 17.5, 2, 1.5, sk); } }
  r(13.5, 12, .5, 7, dk);
  r(4, 12, 8, 8, top); r(11, 12, 1, 8, dk); r(4, 12, .5, 8, lt);
  if (o === 'overalls') { r(6, 12, 1, 1, '#2C4CB8'); r(9, 12, 1, 1, '#2C4CB8'); r(7.75, 13, .5, 6, '#C9D1E3'); r(4.75, 14, 2, 1.75, '#182E7A'); r(9, 14, 2.25, 1.25, '#fff'); r(9, 15, 2.25, .5, accent); r(4, 19, 8, 1, '#12235F'); }
  else if (o === 'hivis') { r(5, 12, 1, 4, '#D6DCE8'); r(10, 12, 1, 4, '#D6DCE8'); r(4, 16, 8, 1, '#D6DCE8'); r(7.75, 12, .5, 8, '#9AA60F'); r(8.75, 13.25, 1.25, 1.75, '#fff'); r(8.75, 13.25, 1.25, .5, accent); }
  else if (o === 'labcoat') { r(6.5, 12, 3, 3.5, '#2447C9'); r(6, 12, .75, 3.5, '#D5DBE8'); r(9.25, 12, .75, 3.5, '#D5DBE8'); for (let i = 0; i < 3; i++) r(7.75, 16 + i * 1.25, .5, .5, '#7C879F'); r(9.25, 16.5, 2, 2, '#E1E6F2'); r(9.75, 15.75, .5, 1.5, accent); }
  else if (o === 'flight') { r(7.75, 12.5, .5, 7, '#C9D1E3'); r(4, 12.5, 1.5, 1.5, accent); r(8.75, 14, 2.5, 1, '#fff'); r(9.5, 14, 1, 1, '#14275E'); r(4.75, 15.5, 2, 2, '#44628A'); r(4, 19, 8, 1, '#3A5479'); }
  else { r(6, 12, 4, 1, '#fff'); r(6.5, 13, .5, 3, accent); r(9, 13, .5, 3, accent); r(6.5, 16, 3, 2, '#fff'); r(7, 16.5, 2, .5, '#14275E'); r(7, 17.25, 1.25, .25, '#7C879F'); }
  r(7, 11.5, 2, 1.5, sk); r(7, 12.5, 2, .5, dk);
  if (h !== 'hijab') { r(3.5, 7.5, .5, 2, sk); r(12, 7.5, .5, 2, sk); }
  r(4, 4, 8, 8, sk); r(11, 4, 1, 8, dk); r(4, 11.5, 8, .5, dk);
  const cap = () => { r(3.5, 2.5, 9, 3, hc); r(3.5, 5.5, 1, 2, hc); r(11.5, 5.5, 1, 2, hc); r(4.5, 2.5, 3.5, .5, lt); r(11.5, 2.5, 1, 5, dk); };
  if (h === 'short' || h === 'long') cap();
  else if (h === 'curly') { r(2.5, 1, 11, 4.5, hc); r(2.5, 5.5, 1.5, 3.5, hc); r(12, 5.5, 1.5, 3.5, hc); r(3.5, 0, 2, 1, hc); r(7, 0, 2, 1, hc); r(10.5, 0, 2, 1, hc); for (const [x, y] of [[4, 2], [6.5, 1.5], [9, 2.5], [5, 4], [8, 4]]) r(x, y, 1, .5, lt); r(12.5, 1, 1, 8, dk); }
  else if (h === 'bun') { cap(); r(6.5, 0, 3, 2.5, hc); r(7, .25, 1, .5, lt); r(9, 0, .5, 2.5, dk); }
  else if (h === 'braids') { cap(); for (let i = 0; i < 6; i++) { r(2.5, 5.5 + i * 2, 1.5, 1.5, hc); r(12, 5.5 + i * 2, 1.5, 1.5, hc); r(13, 5.5 + i * 2, .5, 1.5, dk); } r(2.5, 17.5, 1.5, 1, accent); r(12, 17.5, 1.5, 1, accent); r(7.75, 2.5, .5, 3, dk); }
  else if (h === 'buzz') { r(4, 3.5, 8, 1.5, hc); r(4, 5, .5, 1.5, hc); r(11.5, 5, .5, 1.5, hc); }
  else if (h === 'hijab') { r(3, 2.5, 10, 12, hc); r(5, 5.5, 6, 6.5, sk); r(5, 5.5, 6, .5, dk); r(3.5, 3, 3, .5, lt); r(12, 2.5, 1, 12, dk); r(5, 12, 6, .5, dk); r(4, 13.5, 8, .5, dk); }
  else if (h === 'turban') { r(3, 1, 10, 4, hc); r(4, 0, 8, 1, hc); r(3, 4.25, 10, .75, dk); for (let i = 0; i < 4; i++) { r(3.5 + i, 1 + i * .75, 1.5, .5, dk); r(11 - i, 1 + i * .75, 1.5, .5, dk); } r(7.5, 3.5, 1, 1, lt); r(4.5, .25, 3, .5, lt); }
  const cx = h === 'hijab' ? 5.25 : 4.5;
  r(cx, 9.25, 1, 1, 'rgba(255,90,90,.3)'); r(15 - cx, 9.25, 1, 1, 'rgba(255,90,90,.3)');
  r(5.25, 6.25, 2.25, .5, 'rgba(0,0,0,.5)'); r(8.5, 6.25, 2.25, .5, 'rgba(0,0,0,.5)');
  for (const x of [5.5, 8.5]) { r(x, 7, 2, 2, '#fff'); r(x + 1, 7.25, 1, 1.5, '#0B1437'); r(x + 1, 7.25, .5, .5, '#fff'); }
  r(7.75, 8.75, .5, 1, dk);
  r(6.25, 10, 3.5, 1.25, '#3B0F1A'); r(6.75, 10, 2.5, .5, '#fff');
  if (gear === 'goggles') { r(3.5, 7.5, 9, .75, '#14275E'); for (const x of [4.75, 8.25]) { r(x, 6.5, 3, 3, accent); r(x + .5, 7, 2, 2, 'rgba(190,235,255,.8)'); r(x + 1.5, 7.25, .75, 1.5, '#0B1437'); } }
  else if (av.glasses) for (const x of [5, 8]) { r(x, 6.5, 3, .5, '#111827'); r(x, 9, 3, .5, '#111827'); r(x, 6.5, .5, 3, '#111827'); r(x + 2.5, 6.5, .5, 3, '#111827'); }
  if (gear === 'hardhat' && h !== 'turban') { r(3, 1.5, 10, 3.5, '#F7F9FC'); r(4.5, .5, 7, 1, '#F7F9FC'); r(2.5, 4.5, 11, 1, '#C9D1E3'); r(7.25, .5, 1.5, 4, accent); r(3.5, 2, 1, 2, lt); r(12, 1.5, 1, 3.5, dk); }
  else if (gear === 'ears') { r(3.5, 1.5, 9, 1, '#2B3350'); for (const x of [2.25, 12]) { r(x, 5.5, 1.75, 4.5, accent); r(x, 9, 1.75, 1, dk); } }
  else if (gear === 'headset') { r(3.5, 1.5, 9, 1, '#2B3350'); r(2.25, 5.5, 1.75, 4, '#2B3350'); r(2.75, 6.25, .75, 2.5, accent); r(3, 10.25, 3, .5, '#2B3350'); r(5.5, 9.9, 1, 1.2, '#2B3350'); }
  return R;
}
const INK = '#0B1437';
function avatar(av, accent = '#F5E12B', label = '', crop = 'full') {
  const R = spriteRects(av, 0, accent), rect = ([x, y, w, h, c]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
  const line = R.filter(q => q[4][0] === '#').map(([x, y, w, h]) => `<rect x="${x - .4}" y="${y - .4}" width="${w + .8}" height="${h + .8}"/>`).join('');
  return `<svg viewBox="${crop === 'head' ? '0.5 -1 15 15' : crop === 'body' ? '-2 2 20 20' : '-6.5 -1.5 29 30'}" shape-rendering="crispEdges" ${label ? `role="img" aria-label="${label.replace(/"/g, '&quot;')}"` : 'aria-hidden="true"'}><g fill="${INK}">${line}</g>${R.map(rect).join('')}</svg>`;
}

/* ---------- canvas helpers shared by every game ---------- */
const ART = {
  P:{navy:'#0B1B4D', ink:INK, blue:'#1D3FBF', sky:'#9BD8FF', pale:'#EEF3FF', silver:'#C9D1E3', steel:'#7C879F', dark:'#2B3350', yel:'#F5E12B', gold:'#F59E0B', red:'#DC2626', orange:'#EA580C', green:'#22C55E', white:'#FFFFFF'},
  // filled rectangle snapped to whole pixels
  r(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); },
  // blocky panel: dark border, fill, optional hard shadow
  box(c, x, y, w, h, fill = '#fff', bw = 3, shadow = 0) { if (shadow) ART.r(c, x + shadow, y + shadow, w, h, 'rgba(11,20,55,.35)'); ART.r(c, x, y, w, h, INK); ART.r(c, x + bw, y + bw, w - bw * 2, h - bw * 2, fill); },
  text(c, str, x, y, size = 20, col = INK, align = 'left') { c.font = `${size}px "Jersey 15", "Trebuchet MS", sans-serif`; c.textAlign = align; c.textBaseline = 'top'; c.fillStyle = col; c.fillText(str, Math.round(x), Math.round(y)); },
  // wrapped text; returns the y just below the last line
  wrap(c, str, x, y, maxW, size = 20, col = INK, align = 'left') {
    c.font = `${size}px "Jersey 15", "Trebuchet MS", sans-serif`; let line = '';
    for (const w of String(str).split(' ')) { const t = line ? line + ' ' + w : w; if (c.measureText(t).width > maxW && line) { ART.text(c, line, x, y, size, col, align); y += Math.round(size * 1.1); line = w; } else line = t; }
    if (line) { ART.text(c, line, x, y, size, col, align); y += Math.round(size * 1.1); } return y;
  },
  // meter: frac 0..1
  bar(c, x, y, w, h, frac, col = '#22C55E', back = '#E2E8F0') { ART.r(c, x, y, w, h, INK); ART.r(c, x + 2, y + 2, w - 4, h - 4, back); ART.r(c, x + 2, y + 2, Math.max(0, Math.min(1, frac)) * (w - 4), h - 4, col); },
  // pixel art from rows of characters: pal maps a character to a colour, '.' and ' ' are see-through. s = pixels per cell.
  map(c, rows, pal, x, y, s = 2, flip = false) { x = Math.round(x); y = Math.round(y); rows.forEach((row, j) => { const n = row.length; for (let i = 0; i < n; i++) { const col = pal[row[i]]; if (col) { c.fillStyle = col; c.fillRect(x + (flip ? n - 1 - i : i) * s, y + j * s, s, s); } } }); },
  // the player's character with a dark outline. (x, y) is the top-left of a 16 x 27.5 unit box; s = pixels per unit (2 gives 32 x 55).
  char(c, av, x, y, s = 2, o = {}) {
    const R = spriteRects(av, o.frame || 0, o.accent), f = o.flip; x = Math.round(x); y = Math.round(y); c.fillStyle = INK;
    for (const [rx, ry, w, h, col] of R) if (col[0] === '#') c.fillRect(x + (f ? 16 - rx - w : rx) * s - 1, y + ry * s - 1, w * s + 2, h * s + 2);
    for (const [rx, ry, w, h, col] of R) { c.fillStyle = col; c.fillRect(x + (f ? 16 - rx - w : rx) * s, y + ry * s, w * s, h * s); }
  },
  // head and shoulders only, for portraits in a HUD
  head(c, av, x, y, s = 2, o = {}) { c.save(); c.beginPath(); c.rect(Math.round(x), Math.round(y), 16 * s, 15 * s); c.clip(); ART.char(c, av, x, y + s, s, o); c.restore(); },
  cloud(c, x, y, s = 1) { c.fillStyle = 'rgba(255,255,255,.9)'; c.fillRect(Math.round(x), Math.round(y), 72 * s, 14 * s); c.fillRect(Math.round(x + 16 * s), Math.round(y - 12 * s), 36 * s, 12 * s); },
  star(c, x, y, s = 2, on = true) { c.fillStyle = on ? '#F59E0B' : 'rgba(11,20,55,.25)'; STAR_ROWS.forEach((row, j) => { for (const m of row.matchAll(/#+/g)) c.fillRect(Math.round(x) + m.index * s, Math.round(y) + j * s, m[0].length * s, s); }); },
};
