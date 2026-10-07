'use strict';
/* Sustainability engineer: power a town for two days. Build wind, solar, nuclear, gas and coal; keep every light on and the air clean. */
GAMES.sustainability = {
  title:'Keep the lights on',
  how:['Tap + and - to build power for the town.', 'Wind and sun are clean, but they come and go.', 'Keep every light on with no smoke for 3 stars.'],
  pads:'',
  make(g) {
    const P = ART.P, R = ART.r, T = ART.text, K = P.ink, DAY = g.easy ? 38 : 30, LULL = g.easy ? .14 : .22, TOP = 232;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
    const mix = (a, b, u) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * u)).join(',')})`; };
    // power made, coins to build, smoke made each second. Wind follows the gusts, solar follows the sun, the rest are always on.
    const SRC = [{n:'Wind', pow:2, cost:2, co2:0}, {n:'Solar', pow:1, cost:1, co2:0}, {n:'Nuclear', pow:5, cost:6, co2:0}, {n:'Gas', pow:3, cost:2, co2:1}, {n:'Coal', pow:4, cost:2, co2:3}];
    const DAYS = [{coins:12, need:8}, {coins:14, need:10}];
    const HOUSE = ['...........KKK..', '.......KK..KcK..', '......KLRK.KcK..', '.....KLRRRKKcK..', '....KLRRRRRKcK..', '...KLRRRRRRRKK..', '..KLRRRRRRRrrK..', '.KLRRRRRRRRrrrK.', 'KKKKKKKKKKKKKKKK', '.KHWWWWWWWWWWwK.', '.KHWWWWWWWWWWwK.', '.KHWWWWWWWWWWwK.', '.KHWWWWWWWWWWwK.', '.KHWWWWDDWWWWwK.', '.KHWWWWDdWWWWwK.', '.KKKKKKKKKKKKKK.'];
    const SCHOOL = ['............KK............', '...........KLRK...........', '..........KLRRRK..........', '.........KLRRRRrK.........', '........KKKKKKKKKK........', '........KHWWWWWWwK........', '.KKKKKKKKHWWWWWWwKKKKKKKK.', 'KLRRRRRRKHWWWWWWwKRRRRRRrK', 'KRRRRRRRKHWWWWWWwKRRRRRrrK', 'KKKKKKKKKHWWWWWWwKKKKKKKKK', 'KHWWWWWWWWWWWWWWWWWWWWWWwK', 'KHWWWWWWWWWWWWWWWWWWWWWWwK', 'KHWWWWWWWWWWWWWWWWWWWWWWwK', 'KHWWWWWWWWWKDDKWWWWWWWWWwK', 'KHWWWWWWWWWKDdKWWWWWWWWWwK', 'KHWWWWWWWWWKDdKWWWWWWWWWwK', 'KwwwwwwwwwwKDdKwwwwwwwwwwK', 'KKKKKKKKKKKKKKKKKKKKKKKKKK'];
    const FACTORY = ['................KKKK..', '................KssK..', '.KK...KK...KK...KYYK..', '.KSK..KSK..KSK..KssK..', '.KSSK.KSSK.KSSK.KssK..', '.KSSSKKSSSKKSSSKKssK..', 'KKKKKKKKKKKKKKKKKKKKKK', 'KHGGGGGGGGGGGGGGGGGGgK', 'KHGGGGGGGGGGGGGGGGGGgK', 'KHGGGGGGGGGGGGGGGGGGgK', 'KHGGGGGGGGGGGGGGGGGGgK', 'KYYYYYYYYYYYYYYYYYYYYK', 'KHGGGGGKKKKKKGGGGGGGgK', 'KHGGGGGKddddKGGGGGGGgK', 'KHGGGGGKddddKGGGGGGGgK', 'KKKKKKKKKKKKKKKKKKKKKK'];
    const REACTOR = ['.....KKKKKK.....', '...KKHHWWWWKK...', '..KHHWWWWWWWwK..', '.KHWWWWWWWWWWwK.', '.KHWWWWWWWWWWwK.', 'KHWWWWWWWWWWWWwK', 'KBBBBBBBBBBBBBBK', 'KHWWWWWWWWWWWWwK', 'KKKKKKKKKKKKKKKK', 'KHSSSSSSSSSSSSsK', 'KHSSSSSSSSSSSSsK', 'KYYYYYYYYYYYYYYK', 'KHSSSSKKKKSSSSsK', 'KHSSSSKddKSSSSsK', 'KHSSSSKddKSSSSsK', 'KKKKKKKKKKKKKKKK'];
    const GAS = ['..........KKK...', '..........KcK...', '..........KOK...', '..........KcK...', '.KKKKKK...KcK...', 'KHTTTTtK..KcK...', 'KHTTTTtK..KcK...', 'KKKKKKKKKKKKKKKK', 'KHGGGGGGGGGGGGgK', 'KHGGGGGGGGGGGGgK', 'KOOOOOOOOOOOOOOK', 'KHGGGGGGKKKGGGgK', 'KHGGGGGGKdKGGGgK', 'KHGGGGGGKdKGGGgK', 'KgggggggKdKggggK', 'KKKKKKKKKKKKKKKK'];
    const COAL = ['..KKKK....KKKK....', '..KccK....KccK....', '..KRRK....KRRK....', '..KccK....KccK....', '..KccK....KccK....', '..KccK....KccK....', '..KccK....KccK....', '..KccK....KccK....', 'KKKKKKKKKKKKKKKK..', 'KHBBBBBBBBBBBBbK..', 'KHBBBBBBBBBBBBbK..', 'KHBBBBBBBBBBBBbK..', 'KYKYKYKYKYKYKYKK..', 'KHBBBBBBBBBBBBbK..', 'KHBBBKKKKBBBBBbKK.', 'KHBBBKddKBBBBBbKkK', 'KHBBBKddKBBBBBKkkK', 'KbbbbKddKbbbbKkkkK', 'KKKKKKKKKKKKKKKKKK'];
    const TURB = ['.......KK.......', '......KWWK......', '......KWWK......', '......KWWK......', '......KWWK......', '.....KKHHKK.....', '...KKWKHHKWKK...', '.KKWWKKSSKKWWKK.', 'KWWKK.KSSK.KKWWK', 'KKK...KSSK...KKK', '......KSSK......', '......KSSK......', '......KSSK......', '......KSSK......', '.....KKSSKK.....', '....KKKKKKKK....'];
    const PANEL = ['KKKKKKKKKKKKKKKK', 'KLBBKLBBKLBBKLBK', 'KBBBKBBBKBBBKBBK', 'KBBbKBBbKBBbKBbK', 'KKKKKKKKKKKKKKKK', 'KLBBKLBBKLBBKLBK', 'KBBBKBBBKBBBKBBK', 'KBBbKBBbKBBbKBbK', 'KKKKKKKKKKKKKKKK', '...KK......KK...', '...KK......KK...', '..KKKK....KKKK..'];
    const TREE = ['...KKKK...', '..KLGGGK..', '.KLGGGGGK.', 'KLGGGGGGgK', 'KGGGGGGGgK', 'KGGGGGGggK', 'KGGGGGgggK', '.KGGGgggK.', '..KKggKK..', '...KTtK...', '...KTtK...', '...KTtK...', '..KKTtKK..', '..KKKKKK..'];
    const SUN = ['......yy......', '.y....yy....y.', '..y........y..', '....KKKKKK....', '...KLLYYYYK...', '...KLYYYYYK...', 'yy.KYYYYYYK.yy', 'yy.KYYYYYYK.yy', '...KYYYYYOK...', '...KYYYYOOK...', '....KKKKKK....', '..y........y..', '.y....yy....y.', '......yy......'];
    const MOON = ['...KKKK...', '.KKWWWKK..', '.KWWWK....', 'KWWWK.....', 'KWWWK.....', 'KWWWK.....', 'KWWWWK....', '.KWWWKKKK.', '.KKWWWWWK.', '...KKKKK..'];
    const COIN = ['..KKKK..', '.KYYYYK.', 'KYLYYYOK', 'KYLYYYOK', 'KYLYYYOK', 'KYYYYYOK', '.KOOOOK.', '..KKKK..'];
    const BOLT = ['...KKK.', '..KYK..', '.KYYK..', 'KYYYKKK', 'KKKYYYK', '..KYYK.', '..KYK..', '.KYK...', '.KK....'];
    const hp = (R, L, r, W, H, w, D, d) => ({K, R, L, r, W, H, w, D, d, c:'#8B8FA3'});
    const HP = [hp('#C2533A', '#E07A5F', '#8F3524', '#F3E3C3', '#FFF6DF', '#D4BE94', P.blue, '#142C8A'), hp('#3B4F8F', '#6077BD', '#27376B', '#EEF3FF', '#FFFFFF', '#C9D1E3', P.red, '#991B1B'), hp('#2F7D5B', '#52A882', '#1E5A40', '#FBE3D0', '#FFF3E8', '#DDBFA6', '#7C4A1E', '#55310F')];
    const FP = {K, S:P.silver, s:P.steel, Y:P.yel, G:'#9AA6C0', H:'#C9D1E3', g:P.steel, d:P.dark}, TP = {K, L:'#6EE7A0', G:'#22A552', g:'#15803D', T:'#8A5A2B', t:'#5C3A1A'};
    const SP = {K, L:'#9BD8FF', B:'#2C5BD8', b:'#1B3A9A'}, CP = {K, Y:P.yel, L:'#FFF7C2', O:P.gold}, WP = {K, W:'#F7F9FC', H:P.silver, S:P.silver};
    const STP = {2:{K, W:'#F7F9FC', H:'#FFFFFF', w:P.silver, B:P.blue, S:'#DCE3F2', s:'#AEB8D0', Y:g.accent, d:P.dark}, 3:{K, c:P.silver, O:P.orange, T:'#F7F9FC', t:P.silver, H:'#B8C2D8', G:'#8E9AB6', g:'#6C7896', d:P.dark}, 4:{K, c:'#8B8FA3', R:P.red, H:'#6F7892', B:'#565E78', b:'#3F4660', Y:P.yel, d:'#171A26', k:'#171A26'}};
    const ICON = [[TURB, WP, 3, 0], [PANEL, SP, 3, 4], [REACTOR, STP[2], 3, 0], [GAS, STP[3], 3, 0], [COAL.slice(3), STP[4], 1, 0]];
    const SKY = [[0, '#8FCBF5', '#BFE3FA', '#FFDDB8'], [.22, '#5FB4F0', '#7EC8F7', '#B5E2FB'], [.46, '#5FB4F0', '#8CCBF3', '#FFD9A0'], [.58, '#5B58A8', '#E58A6B', '#FBC16A'], [.68, '#0A1440', '#0F1C52', '#1B2B68'], [1.01, '#0A1440', '#0F1C52', '#1B2B68']];
    const LAMPS = [83, 175, 259, 332], p1 = g.rnd(628) / 100, p2 = g.rnd(628) / 100;
    const s = {phase:'plan', day:0, n:[0, 0, 0, 0, 0], sel:0, t:0, f:0, lit:0, dark:0, co2:0, wind:.8, sun:.4, night:0, made:0, ok:false, glow:0, idle:0, pt:0, flash:0, wt:0, spin:0, emit:0, cheer:false, puffs:[], res:[], town:[], trees:[]};

    // the town: two streets of houses, a school and a factory. Each window gets its own place in the queue to light up or go dark.
    function town(day) {
      let k = 0; s.town = [];
      const put = (spr, pal, x, base, wins) => { const y = base - spr.length * 2; s.town.push({spr, pal, x, y, wins:wins.map(([wx, wy, w, h]) => ({x:x + wx * 2, y:y + wy * 2, w:w * 2, h:h * 2, o:(++k * .381966) % 1}))}); };
      const house = (x, base, v) => put(HOUSE, HP[v % 3], x, base, [[3, 10, 3, 3], [10, 10, 3, 3]]);
      (day ? [60, 96, 190, 262, 316] : [96, 262]).forEach((x, i) => house(x, 182, i + 1));
      [50, 86, 178, 262, 298].forEach((x, i) => house(x, 214, i));
      put(SCHOOL, hp('#B4432B', '#D96A50', '#8A2F1C', '#F3E3C3', '#FFF6DF', '#D9C39A', P.blue, '#142C8A'), 122, 214, [[3, 11, 3, 3], [7, 11, 3, 3], [16, 11, 3, 3], [20, 11, 3, 3], [11, 6, 4, 3]]);
      put(FACTORY, FP, 214, 214, [[3, 8, 3, 2], [7, 8, 3, 2], [12, 8, 3, 2], [16, 8, 3, 2]]);
      s.trees = [[164, 154], [232, 154], [296, 154], [336, 186]].concat(day ? [] : [[58, 154], [196, 154], [324, 154]]);
    }
    town(0);
    // where the built power stations stand: up to two reactors, two gas and two coal stations share the yard on the right
    function plots() {
      const list = []; for (const k of [2, 3, 4]) for (let j = 0; j < Math.min(2, s.n[k]); j++) list.push(k);
      const gap = Math.min(40, 100 / Math.max(1, list.length - 1));
      return list.map((k, i) => ({k, x:Math.round(222 + i * gap)}));
    }
    const free = () => DAYS[s.day].coins - s.n.reduce((a, n, i) => a + n * SRC[i].cost, 0);
    function add(i) { s.sel = i; if (s.n[i] >= 9) return; if (free() < SRC[i].cost) { s.flash = 1.2; g.hud('Not enough coins. Remove one.'); return; } s.n[i]++; }
    function drop(i) { s.sel = i; if (s.n[i]) s.n[i]--; }
    function go() { s.phase = 'play'; s.t = s.lit = s.dark = s.co2 = 0; }
    // time of day 0..1, the gusting wind (with a lull in the night), the sun, and so the power made right now
    function weather() {
      const f = s.f = s.phase === 'play' ? s.t / DAY : s.phase === 'plan' ? 0 : 1;
      const lull = f > .68 && f < .98 ? Math.min(1, (f - .68) / .05, (.98 - f) / .05) : 0;
      s.wind = clamp(.8 + (.14 * Math.sin(s.wt * .8 + p1) + .06 * Math.sin(s.wt * 2.3 + p2)) * (1 - .7 * lull) - LULL * lull, .4, 1);
      s.sun = f < .64 ? clamp(Math.sin(Math.PI * (f + .06) / .7) * 1.6, 0, 1) : 0;
      s.night = clamp((f - .5) / .16, 0, 1);
      s.made = s.n[0] * 2 * s.wind + s.n[1] * s.sun + s.n[2] * 5 + s.n[3] * 3 + s.n[4] * 4;
      s.ok = s.made >= DAYS[s.day].need - .001;
    }
    function smoke(dt) {
      const st = plots().filter(q => q.k > 2);
      s.emit = st.length ? s.emit + dt * (s.n[3] * 1.5 + s.n[4] * 4) : 0;
      while (s.emit >= 1) { s.emit--; const q = st[g.rnd(st.length)]; if (s.puffs.length < 70) s.puffs.push({x:q.x + (q.k === 3 ? 22 : 8 + g.rnd(2) * 16), y:q.k === 3 ? 110 : 104, vy:-12, a:0, z:5 + g.rnd(4), k:q.k}); }
      for (const p of s.puffs) { p.a += dt; p.x -= (6 + 26 * s.wind) * dt; p.vy = Math.min(5, p.vy + 6 * dt); p.y += p.vy * dt; }
      s.puffs = s.puffs.filter(p => p.a < 7 && p.x > -20);
    }
    function endDay() {
      const pct = Math.round(100 * s.lit / (s.lit + s.dark)), air = s.co2 ? clamp(Math.round(100 - 100 * s.co2 / (DAY * 6)), 0, 99) : 100;
      const tip = pct >= 95 && air === 100 ? 'Every light on and clean air. Great plan!' : pct < 95 && !(s.n[2] + s.n[3] + s.n[4]) ? 'Wind and sun come and go. Add power that is always on.'
        : air < 100 ? 'Gas and coal make smoke. Try nuclear: always on, low carbon.' : 'The lights went out for a bit. Build a little more power.';
      s.res.push({pct, air, tip}); s.phase = 'sum'; s.pt = 0; s.cheer = pct >= 95 && air >= 50;
      g.hud(`Day ${s.day + 1} done. Tap NEXT.`);
    }
    function next() {
      if (s.day === 0) { s.day = 1; s.phase = 'plan'; s.idle = s.pt = s.t = s.co2 = 0; town(1); g.score(''); return; }
      const [a, b] = s.res, lo = Math.min(a.pct, b.pct), air = Math.min(a.air, b.air);
      s.phase = 'done'; g.hud('Two days done!');
      g.end(lo >= 95 && air === 100 ? 3 : lo >= 85 && air >= 50 ? 2 : 1, `${lo < 50 ? 'The lights were on only' : 'You kept the lights on'} ${Math.round((a.pct + b.pct) / 2)}% of the time ${air === 100 ? 'with clean air' : air >= 50 ? 'with some smoke' : 'but the air got very smoky'}.`);
    }
    g.score('');

    function step(dt) {
      s.wt += dt; s.pt += dt; s.idle += dt; s.flash = Math.max(0, s.flash - dt);
      weather();
      s.glow = clamp(s.glow + (s.ok ? 2.5 : -2.5) * dt, 0, 1); s.spin += dt * 10 * (s.wind - .35);
      smoke(dt);
      if (g.over) return;
      const tp = g.tap, col = tp ? clamp(Math.floor((tp.x - 3) / 71), 0, 4) : 0;
      if (tp || g.press.l || g.press.r || g.press.u || g.press.d || g.press.a) s.idle = 0;
      if (s.phase === 'sum') { if (s.pt > 12 || (s.pt > .8 && (tp || g.press.a))) next(); return; }
      if (g.press.u) s.sel = (s.sel + 4) % 5; if (g.press.d) s.sel = (s.sel + 1) % 5;
      if (g.press.r) add(s.sel); if (g.press.l) drop(s.sel);
      if (tp && tp.y >= 386) { if (tp.y < 431) add(col); else drop(col); } else if (tp && tp.y >= 291) s.sel = col;
      if (s.phase === 'plan') {
        if (g.press.a || (tp && tp.x >= 282 && tp.y >= TOP && tp.y < 291) || s.idle > 40) return go();
        if (s.flash <= 0) g.hud(s.idle > 20 ? 'Tap + to build, then tap GO.' : `Day ${s.day + 1}: build power, press GO.`);
        return;
      }
      s.t += dt; if (s.ok) s.lit += dt; else s.dark += dt;
      s.co2 += (s.n[3] + s.n[4] * 3) * dt;
      if (s.flash <= 0) g.hud(!s.ok ? (s.n[0] && s.wind < .68 ? 'Blackout! Low wind.' : s.n[1] && s.sun < .5 ? 'Blackout! No sun.' : 'Blackout! Add power.')
        : s.n[3] + s.n[4] ? 'Smoke! Swap to clean.' : s.n[1] && s.f > .64 ? 'Night: no solar power.' : 'Lights on. Clean air!');
      g.score(`Lights ${Math.round(100 * s.lit / s.t)}%`);
      if (s.t >= DAY) endDay();
    }

    // a tick or a cross built from blocks, so right and wrong never rest on colour alone
    const mark = (c, x, y, ok, col = ok ? '#15803D' : P.red) => (ok ? [[0, 6], [3, 9], [6, 6], [9, 3], [12, 0]] : [[0, 0], [3, 3], [6, 6], [9, 9], [9, 0], [6, 3], [3, 6], [0, 9]]).forEach(([a, b]) => R(c, x + a, y + b, 4, 4, col));
    // blades are chains of blocks, so they can turn smoothly and stay pixel art
    function turbine(c, x, base, a) {
      const cy = base - 44, w = mix('#F7F9FC', '#7783AD', s.night * .7);
      R(c, x - 3, cy, 6, 44, K); R(c, x - 2, cy, 4, 44, w); R(c, x + 1, cy, 1, 44, P.steel);
      for (const [col, o, z] of [[K, -3, 6], [w, -2, 4]]) for (let b = 0; b < 3; b++) for (let k = 1; k <= 7; k++) R(c, x + o + Math.round(Math.cos(a + b * 2.094) * k) * 2, cy + o + Math.round(Math.sin(a + b * 2.094) * k) * 2, z, z, col);
      R(c, x - 3, cy - 3, 6, 6, K); R(c, x - 2, cy - 2, 4, 4, P.silver);
    }

    function draw(c) {
      const t = g.t, f = s.f, nt = s.night, tint = (col, to = '#101C4A') => mix(col, to, nt * .75), st = plots();
      // sky bands that change through the day, stars, sun, moon, clouds
      const i = SKY.findIndex(k => k[0] > f), a = SKY[i - 1], b = SKY[i], u = (f - a[0]) / (b[0] - a[0]);
      [[0, 40], [40, 36], [76, 30]].forEach(([y, h], j) => R(c, 0, y, 360, h, mix(a[j + 1], b[j + 1], u)));
      if (nt > .6) for (let j = 0; j < 28; j++) { const z = Math.floor(t * 2 + j * 1.7) % 5 ? 2 : 3; R(c, (j * 137) % 356, (j * 53) % 86, z, z, z > 2 ? '#FFFFFF' : '#C9D1E3'); }
      if (f < .66) ART.map(c, SUN, {K:'#E08A00', L:'#FFF7C2', Y:'#FFD21F', O:'#F5A80B', y:Math.floor(t * 3) % 2 ? '#FFD21F' : '#FFE97A'}, f / .64 * 318, 70 - Math.sin(Math.PI * (f + .06) / .7) * 64, 3);
      if (f > .62) { const m = (f - .62) / .38 * .8; ART.map(c, MOON, {K:'#8A93B8', W:'#F7F9FC'}, 30 + m * 290, 66 - Math.sin(Math.PI * m) * 52, 3); }
      for (let j = 0; j < 3; j++) { const x = 380 - (j * 150 + s.wt * 9) % 450, y = 16 + j * 19, col = tint('#FFFFFF', '#2A3A78'); R(c, x, y, 44, 9, col); R(c, x + 10, y - 7, 22, 7, col); }
      // far hills, the wind hill with its wind sock, the solar field and the power yard
      [10, 16, 20, 16, 10, 6, 10, 18, 22, 18, 12, 8, 6, 12, 16].forEach((h, j) => R(c, j * 24, 106 - h, 24, h, tint('#3F9E63')));
      R(c, 0, 106, 360, 126, '#62BE74'); R(c, 0, 112, 124, 38, '#7FD08A'); R(c, 0, 109, 108, 3, '#7FD08A'); R(c, 0, 106, 84, 3, '#7FD08A'); R(c, 0, 106, 84, 2, '#A5E5AA'); R(c, 84, 109, 24, 2, '#A5E5AA'); R(c, 108, 112, 16, 2, '#A5E5AA'); R(c, 128, 108, 90, 36, '#55AE66'); R(c, 220, 138, 140, 12, '#B8C2D8');
      for (let x = 222; x < 360; x += 16) R(c, x, 147, 8, 3, P.yel);
      R(c, 349, 106, 2, 36, K); R(c, 343, 108, 14, 2, K); R(c, 345, 116, 10, 2, K); R(c, 345, 128, 2, 12, K); R(c, 353, 128, 2, 12, K); R(c, 345, 128, 10, 2, K);
      for (let y = 116; y < 138; y += 7) R(c, 130, y, 86, 2, '#4CA65C');
      for (let j = 0; j < 3; j++) { const x = 56 + j * 22 + Math.round(Math.sin(t * .4 + j * 2) * 5), y = [122, 138, 126][j], eat = Math.floor(t * .7 + j) % 3 ? 0 : 2; R(c, x, y, 10, 6, K); R(c, x + 1, y - 1, 8, 6, '#F7F9FC'); R(c, x + 1, y + 6, 2, 2, K); R(c, x + 7, y + 6, 2, 2, K); R(c, x - 3, y + eat, 4, 4, K); }
      for (let x = 128; x <= 216; x += 11) R(c, x, 139, 2, 7, '#8A5A2B'); R(c, 128, 141, 90, 2, '#8A5A2B');
      for (let j = 0; j < Math.min(7, s.n[0]); j++) turbine(c, 14 + j * 16, j % 2 ? 142 : 132, s.spin + j * 1.3);
      R(c, 119, 112, 2, 26, K); for (let k = 0; k < 2 + Math.round(s.wind * 4); k++) R(c, 115 - k * 4, 112 + Math.round(k * (1 - s.wind) * 3), 4, 6, k % 2 ? '#FFFFFF' : P.orange);
      for (let j = 0; j < Math.min(6, s.n[1]); j++) { const x = 130 + (j % 3) * 29, y = 100 + Math.floor(j / 3) * 21, gl = Math.floor(t * 14 + j * 4) % 40; ART.map(c, PANEL, SP, x, y, 2); if (s.sun > .95 && gl < 13) R(c, x + 2 + gl * 2, y + 2, 4, 14, '#FFFFFF'); }
      for (const q of st) ART.map(c, q.k === 2 ? REACTOR : q.k === 3 ? GAS : COAL, STP[q.k], q.x, q.k === 4 ? 108 : 114, 2);
      // the town, its road with a little car, street lights, and the hill the engineer stands on
      R(c, 0, 150, 360, 82, '#57B368'); R(c, 48, 182, 312, 4, '#D9C9A0');
      for (let j = 0; j < 40; j++) R(c, 50 + (j * 83) % 306, 152 + (j * 37) % 58, 3, 2, j % 2 ? '#6BC77B' : '#459C56');
      for (const [x, y] of s.trees) ART.map(c, TREE, TP, x, y, 2);
      for (const q of s.town) ART.map(c, q.spr, q.pal, q.x, q.y, 2);
      if (s.day && s.phase === 'plan') for (const x of [60, 190, 316]) ART.star(c, x + 5, 136 + Math.floor(t * 3) % 2 * 2, 2);
      const wave = Math.floor(t * (2 + 6 * s.wind)) % 2;
      R(c, 147, 160, 2, 18, K); R(c, 149, 160 + wave, 7, 8, P.yel); R(c, 156, 161 - wave, 6, 8, P.yel); R(c, 149, 163 + wave, 7, 2, g.accent); R(c, 156, 164 - wave, 6, 2, g.accent);
      R(c, 0, 212, 360, 4, '#C9D1E3'); R(c, 0, 216, 360, 16, '#3A4056'); for (let x = 54; x < 360; x += 30) R(c, x, 223, 14, 2, '#F7F9FC');
      const cx = (t * 36) % 440 - 40;
      R(c, cx, 219, 22, 9, K); R(c, cx + 1, 220, 20, 6, P.blue); R(c, cx + 1, 220, 20, 2, '#4A6BE0'); R(c, cx + 5, 215, 12, 5, K); R(c, cx + 6, 216, 10, 4, '#BFE3FA'); R(c, cx + 3, 227, 4, 3, K); R(c, cx + 15, 227, 4, 3, K);
      for (const lx of LAMPS) { R(c, lx, 190, 2, 24, K); R(c, lx, 190, 9, 2, K); R(c, lx + 4, 192, 7, 4, K); }
      R(c, 0, 204, 50, 28, '#4CA65C'); R(c, 0, 200, 44, 4, '#4CA65C'); R(c, 0, 200, 44, 2, '#8AD694'); for (let j = 0; j < 6; j++) R(c, 4 + j * 8, 208 + (j * 5) % 18, 3, 2, '#3C8F4C');
      // smoke, the grey haze it leaves over the town, and the dark of night
      for (const p of s.puffs) { const z = p.z + p.a * 1.5; R(c, p.x - z / 2, p.y - z / 2, z, z, `rgba(${p.k === 4 ? '40,42,54' : '120,124,138'},${p.a > 5 ? .25 : .6})`); }
      if (s.co2) R(c, 0, 0, 360, TOP, `rgba(84,84,92,${Math.min(.55, s.co2 / (DAY * 6) * .6).toFixed(2)})`);
      if (nt) R(c, 0, 106, 360, 126, `rgba(6,10,40,${(nt * .5).toFixed(2)})`);
      // everything that glows: windows one by one, street lights, the reactor's steady light, the factory beacon, headlights
      for (const q of s.town) for (const w of q.wins) { const on = s.glow > w.o; R(c, w.x, w.y, w.w, w.h, on ? '#FFE66D' : '#1E2742'); R(c, w.x, w.y, 2, 2, on ? '#FFF9D6' : '#33406B'); }
      LAMPS.forEach((lx, j) => { if (s.glow <= j * .25 + .1) return; R(c, lx + 5, 193, 5, 2, '#FFE66D'); if (nt > .3) { R(c, lx + 2, 196, 11, 8, 'rgba(255,230,110,.28)'); R(c, lx - 1, 204, 17, 10, 'rgba(255,230,110,.16)'); } });
      for (const q of st) if (q.k === 2) { R(c, q.x + 13, 105, 6, 9, K); R(c, q.x + 14, 106, 4, 4, '#5EEAD4'); R(c, q.x + 6, 132, 6, 4, '#5EEAD4'); R(c, q.x + 22, 132, 4, 4, '#5EEAD4'); }
      if (s.ok && Math.floor(t * 2) % 2) R(c, 248, 186, 4, 2, P.red);
      if (cx > 50) { R(c, cx + 20, 222, 2, 3, P.yel); if (nt > .3) R(c, cx + 22, 221, 14, 5, 'rgba(255,240,150,.3)'); }
      // the engineer on the hill with a tablet: bobs while watching, shakes in a blackout, jumps when the day went well
      const cheer = s.cheer && s.phase !== 'plan' && s.phase !== 'play', px = 6 + (s.phase === 'play' && !s.ok ? Math.round(Math.sin(t * 40)) : 0);
      const py = 145 - (cheer ? Math.round(Math.abs(Math.sin(s.pt * 7)) * 10) : Math.round(Math.sin(t * 3) * .6));
      ART.char(c, g.av, px, py, 2, {accent:g.accent, frame:cheer ? 1 + Math.floor(s.pt * 6) % 2 : 0});
      R(c, px + 24, py + 30, 14, 11, K); R(c, px + 26, py + 32, 10, 7, s.ok ? '#86EFAC' : '#FCA5A5'); R(c, px + 26, py + 32, 10, 2, '#FFFFFF');
      if (cheer) for (let j = 0; j < 12; j++) R(c, 24 + Math.sin(j * 2.4) * 22, 196 - (s.pt * 46 + j * 17) % 64, 3, 3, [P.yel, g.accent, '#FFFFFF', P.orange][j % 4]);
      // signs over the scene: the plan for the day, a blackout warning, or how the day went
      if (s.phase === 'plan') {
        ART.box(c, 6, 4, 348, 66, '#fff', 3, 4);
        T(c, s.day ? 'Day 2 of 2: the town grew. It needs 10.' : 'Day 1 of 2: the town needs 8 power.', 14, 8, 18, P.navy);
        T(c, s.day ? 'You have 2 more coins. Then press GO.' : 'Spend your 12 coins, then press GO.', 14, 27, 18, K);
        ART.star(c, 14, 50, 1.5); T(c, '3 stars: lights on all day, no smoke.', 36, 46, 18, K);
      } else if (s.phase === 'play' && !s.ok) {
        ART.box(c, 82, 6, 196, 34, Math.floor(t * 4) % 2 ? P.red : '#7F1D1D', 3, 3); mark(c, 92, 17, false, '#fff'); T(c, `BLACKOUT ${Math.ceil(s.dark)}s`, 190, 11, 22, '#fff', 'center');
      } else if (s.phase === 'sum') {
        const r = s.res[s.day];
        ART.box(c, 48, 4, 306, 130, '#fff', 3, 4); T(c, `Day ${s.day + 1} done!`, 201, 8, 26, P.navy, 'center');
        mark(c, 60, 42, r.pct >= 95); T(c, `Lights on ${r.pct}% of the day`, 84, 38, 19, K);
        mark(c, 60, 63, r.air === 100); T(c, r.air === 100 ? 'Air stayed 100% clean' : `Air only ${r.air}% clean`, 84, 59, 19, K);
        ART.wrap(c, r.tip, 60, 84, 284, 17, P.navy);
      }
      drawPanel(c);
    }

    function drawPanel(c) {
      const d = DAYS[s.day], fr = free(), co = clamp(s.co2 / (DAY * 6), 0, 1), blink = Math.floor(g.t * 5) % 2, hint = s.phase === 'plan' && s.idle > 20 && blink;
      const good = s.ok ? '#86EFAC' : '#FCA5A5';
      R(c, 0, TOP, 360, 248, P.navy); R(c, 0, TOP, 360, 3, K);
      // coins left, power made against power needed, the carbon dioxide meter, and GO or the clock
      ART.map(c, COIN, CP, 6, 240, 3); T(c, String(fr), 36, 235, 32, s.flash > 0 && blink ? '#FCA5A5' : '#fff'); T(c, 'coins', 8, 268, 17, P.silver);
      T(c, `Made ${s.made.toFixed(1)}`, 82, 237, 17, '#fff'); T(c, `Need ${d.need}`, 156, 237, 17, P.yel); mark(c, 216, 239, s.ok, good); T(c, s.ok ? 'OK' : 'LOW', 238, 237, 17, good);
      ART.bar(c, 82, 256, 196, 12, s.made / 16, s.ok ? P.green : P.red); R(c, 82 + d.need * 12, 252, 6, 20, K); R(c, 84 + d.need * 12, 254, 2, 16, P.yel);
      T(c, 'CO2', 82, 271, 17, '#fff'); ART.bar(c, 114, 274, 90, 12, co, '#6B7280', '#fff'); T(c, s.co2 ? `${Math.max(1, Math.round(co * 100))}% smoke` : 'clean', 210, 271, 17, s.co2 ? '#FCA5A5' : '#86EFAC');
      if (s.phase === 'play' || s.phase === 'done') {
        ART.box(c, 286, 236, 70, 52, '#fff', 3); T(c, `Day ${s.day + 1} of 2`, 321, 239, 16, P.navy, 'center');
        T(c, s.f < .2 ? 'Morning' : s.f < .44 ? 'Noon' : s.f < .64 ? 'Evening' : 'Night', 321, 254, 16, K, 'center'); ART.bar(c, 292, 273, 58, 10, s.f, P.blue);
      } else { const up = Math.floor(g.t * 3) % 2 * 2, plan = s.phase === 'plan'; ART.box(c, 286, 235 + up, 68, 50, hint ? '#fff' : P.yel, 3, 3); T(c, plan ? 'GO' : 'NEXT', 320, (plan ? 242 : 247) + up, plan ? 34 : 24, K, 'center'); }
      // one column for each power source: name, picture, how many, what it is making now, power and price, smoke, then + and -
      SRC.forEach((o, i) => {
        const x = 3 + i * 71, n = s.n[i], can = fr >= o.cost && n < 9, [spr, pal, ix, iy] = ICON[i];
        R(c, x, 291, 69, 93, s.sel === i ? P.yel : K); R(c, x + 3, 294, 63, 87, '#fff');
        T(c, o.n, x + 34, 294, 16, P.navy, 'center'); ART.map(c, spr, pal, x + ix, 311 + iy, 2); T(c, 'x' + n, x + 53, 313, 26, n ? K : P.steel, 'center');
        ART.bar(c, x + 4, 344, 61, 7, n ? [s.wind, s.sun, 1, 1, 1][i] : 0, o.co2 ? '#6B7280' : P.green);
        ART.map(c, BOLT, CP, x + 5, 351, 2); T(c, String(o.pow), x + 21, 351, 17, K); ART.map(c, COIN, CP, x + 34, 352, 2); T(c, String(o.cost), x + 53, 351, 17, K);
        if (o.co2) { R(c, x + 4, 374, 6, 5, '#6B7280'); R(c, x + 5, 371, 4, 3, '#6B7280'); T(c, o.co2 > 1 ? 'smoke x3' : 'smoke', x + 12, 367, 15, K); }
        else { mark(c, x + 6, 369, true); T(c, 'clean', x + 26, 367, 15, '#15803D'); }
        ART.box(c, x, 386, 69, 44, can ? (hint ? P.yel : P.blue) : '#94A3B8', 3); R(c, x + 24, 405, 21, 6, '#fff'); R(c, x + 32, 397, 6, 22, '#fff');
        ART.box(c, x, 432, 69, 44, n ? P.dark : '#94A3B8', 3); R(c, x + 24, 451, 21, 6, '#fff');
      });
    }
    return {s, step, draw};
  },
  // test robot: two reactors on day 1 (by keyboard), one wind farm more on day 2 (by tapping +), then GO; NEXT after reading each summary
  auto(g, game) {
    const s = game.s, want = s.day ? [1, 0, 2, 0, 0] : [0, 0, 2, 0, 0];
    if (s.phase === 'sum') { if (s.pt > 3) g.press.a = 1; return; }
    if (s.phase !== 'plan' || Math.floor(g.t * 60) % 15) return;
    const i = want.findIndex((n, k) => s.n[k] < n);
    if (i < 0) { if (s.pt > 2) g.press.a = 1; }
    else if (s.day) g.tap = {x:38 + i * 71, y:408};
    else if (s.sel !== i) g.press.d = 1; else g.press.r = 1;
  },
};
