'use strict';
/* Materials engineer: choose what three engine parts are made of, then heat-test the turbine blade in a furnace.
   Hold COOL to blow air through the blade's tiny holes and keep the needle in the green band. */
GAMES.materials = {
  title:'Heat test',
  how:['Tap the best material for each engine part.', 'Then hold COOL to keep the needle in the green.', 'Too hot and the blade sags. Too cold stops the test.'],
  pads:'a', action:'COOL',
  make(g) {
    const P = ART.P, R = ART.r, T = ART.text, K = g.easy ? .75 : 1, DUR = 25, COOL = .32, rep = (ch, n) => ch.repeat(n);
    // v = strong, light, heat-proof (out of 5)
    const MAT = {cf:{n:'Carbon fibre', v:[5, 5, 2]}, st:{n:'Steel', v:[5, 1, 4]}, pl:{n:'Plastic', v:[1, 5, 1]}, ni:{n:'Nickel superalloy', v:[5, 2, 5]}, al:{n:'Aluminium', v:[3, 4, 2]}};
    const PARTS = [
      {n:'Fan blade', need:'It sits at the cool front of the engine. It must be very strong and as light as it can be.', best:'cf', yes:'Carbon fibre is very strong and very light.', no:{st:'Steel is strong, but far too heavy.', pl:'Plastic is light, but far too weak.'}},
      {n:'Turbine blade', need:'It sits in gas hotter than lava. It must stay strong in that heat.', best:'ni', yes:'Nickel superalloy stays strong when it is very hot.', no:{al:'Aluminium cannot take that heat.', cf:'Carbon fibre cannot take that heat.'}},
      {n:'Main shaft', need:'It gets quite hot. It must be as strong as it can be. Weight matters less.', best:'st', yes:'Steel is very strong and can take the heat.', no:{al:'Aluminium is not strong enough.', pl:'Plastic is far too weak.'}},
    ];
    // the two furnace tests: green band, how fast the heat climbs, how hard and how often it surges
    const TEST = {2:{n:'Furnace test', lo:.38, hi:.70, rise:.09, surge:.17, gap:2.6}, 3:{n:'Hotter test', lo:.43, hi:.67, rise:.11, surge:.21, gap:1.7}};
    const CARD = {
      1:['Pick the material', 'Three engine parts need the right material. Read the bars, then tap the best crate.', '3 stars: 2 right picks and 70% of the test in the green.'],
      2:['Furnace test', 'The gas in a jet engine is hotter than the melting point of its blades! Cooling air through tiny holes keeps them safe. Hold COOL to keep the needle in the green.', 'Too hot: the blade sags. Too cold: the test stops counting.'],
      3:['Hotter test', 'Now the green band is smaller and the heat jumps faster. Keep that blade safe!', ''],
    };

    // ---- sprites: rows of characters, coloured by the palettes below ----
    const BLADE = ['.......KKKKKK...', '......KLLBBBDK..', '......KLHBBBDK..', '.....KLLBBHBDK..', '.....KLHBBBBDK..', '.....KLBBBHBDK..', '....KLLHBBBBDK..', '....KLBBBBHBDK..',
      '....KLHBBBBBDK..', '....KLBBBBHBDK..', '...KLLHBBBBBDK..', '...KLBBBBBHBDK..', '...KLHBBBBBBDK..', '...KLBBBBBHBDK..', '...KLHBBBBBDDK..', '.KKKKKKKKKKKKKK.',
      '.KLLLLLLLLLLLDK.', '.KBBBBBBBBBBDDK.', '.KKKKKKKKKKKKKK.', '...KRRRRRRRRK...', '..KRRRRRRRRRRK..', '...KRRRRRRRDK...', '....KRRRRRDK....', '.....KKKKKK.....'];
    const FAN = ['.........KKKKK..', '........KTCcCCK.', '.......KTCcCCcK.', '......KTCCcCCcK.', '......KTCcCCcCK.', '.....KTCCcCCcCK.', '.....KTCcCCcCCK.', '....KTCCcCCcCCK.',
      '....KTCcCCcCCcK.', '....KTCCCcCCcCK.', '...KTCCcCCcCCK..', '...KTCcCCcCCcK..', '...KTCCCcCCcCK..', '...KTCCcCCcCK...', '...KTCcCCcCCK...', '....KTCCcCCK....',
      '....KTCcCCcK....', '.....KTCCCK.....', '....KKKKKKKK....', '....KSSSSSsK....', '....KSsssssK....', '.....KKKKKK.....'];
    const SHAFT = ['..KKK' + rep('.', 18) + 'KKK..', '.KLLLK' + rep('.', 16) + 'KLLLK.', '.KLBBK' + rep('K', 16) + 'KLBBK.', '.KLBBK' + rep('L', 16) + 'KLBBK.', '.KLBBK' + rep('B', 16) + 'KLBBK.',
      '.KBBDK' + rep('B', 16) + 'KBBDK.', '.KBBDK' + rep('D', 16) + 'KBBDK.', '.KBDDK' + rep('K', 16) + 'KBDDK.', '.KDDDK' + rep('.', 16) + 'KDDDK.', '..KKK' + rep('.', 18) + 'KKK..'];
    const CRATE = [rep('K', 24), 'K' + rep('L', 22) + 'K', 'K' + rep('W', 21) + 'DK', rep('K', 24), ...['W', 'W', 'K', 'W', 'W', 'D'].map(ch => '.KLWK' + rep(ch, 14) + 'KWDK.'), rep('K', 24), 'KL' + rep('W', 20) + 'DK', rep('K', 24)];
    // what pokes out of the top of each crate: steel bars, aluminium sheets, woven carbon fibre, plastic blocks, nickel ingots
    const STUFF = {
      st:['...' + rep('K', 16) + '...', '..KLLWLLLLLLLLLLWLLK..', '..K' + rep('D', 16) + 'K..', '.' + rep('K', 20) + '.', '.KLWLLLLLLLLLLLLLLWLK.', '.K' + rep('D', 18) + 'K.'],
      al:['..' + rep('K', 18) + '..', '..K' + rep('L', 13) + 'WLLK..', '..' + rep('K', 18) + '..', '..KLLW' + rep('L', 13) + 'K..', '..' + rep('K', 18) + '..', '..K' + rep('L', 9) + 'WLLLLLLK..'],
      cf:['..' + rep('K', 18) + '..', ...[0, 1, 0, 1, 0].map(k => '..K' + rep(k ? 'cC' : 'Cc', 8) + 'K..')],
      pl:['...KKKKKK...KKKKKK....', '...KRRrRK...KYYyYK....', '.' + rep('K', 20) + '.', '.KGGGgGKBBBbBBKRRRrRK.', '.KGGGGGKBBBBBBKRRRRRK.', '.KGGGGGKBBBBBBKRRRRRK.'],
      ni:['....KKKKKK..KKKKKK....', '...KLLWLLLKKLLLWLLK...', '...KDDDDDDKKDDDDDDK...', '.' + rep('K', 20) + '.', '.KLWLLLLKLLLWLLKLLWLK.', '.KDDDDDDKDDDDDDKDDDDK.'],
    };
    const FLAME = ['...O...', '..OO...', '..OOO..', '.OOYO.O', '.OYYOOO', 'OOYYYOO', 'OYYWYYO', '.OYWYO.'];
    const TICK = ['.......GG', '......GGG', 'GG...GGG.', 'GGG.GGG..', '.GGGGG...', '..GGG....'], CROSS = ['GG...GG', 'GGG.GGG', '.GGGGG.', '..GGG..', '.GGGGG.', 'GGG.GGG', 'GG...GG'];
    const METAL = {K:P.ink, L:'#E6ECF7', B:'#9AA6C0', D:'#5F6B88', H:'#2B3350', R:'#7C879F'}, WOOD = {K:P.ink, L:'#F0C98A', W:'#C98A3C', D:'#8A5A2B'};
    const FANPAL = {K:P.ink, T:'#E6ECF7', C:'#1B2033', c:'#3F4A6B', S:'#9AA6C0', s:'#5F6B88'};
    const SPAL = {st:{K:P.ink, L:P.silver, W:'#fff', D:P.steel}, al:{K:'#5F6B88', L:'#EEF3FF', W:'#fff'}, cf:{K:P.ink, C:'#171A26', c:'#4B5878'}, ni:{K:P.ink, L:'#C9BFA5', W:'#F7F0DC', D:'#8C8168'},
      pl:{K:P.ink, R:'#EF4444', r:'#FECACA', Y:P.yel, y:'#FFFBD0', G:P.green, g:'#BBF7D0', B:'#3B82F6', b:'#BFDBFE'}};
    // metal colour for a temperature 0..1: dark red, red, orange, yellow, white. k darkens or lightens it.
    const HEAT = [[78, 16, 16], [160, 32, 26], [234, 88, 12], [245, 200, 43], [255, 252, 232]];
    const heat = (v, k = 1) => { v = Math.max(0, Math.min(.999, v)) * 4; const i = v | 0, a = HEAT[i], b = HEAT[i + 1]; return `rgb(${a.map((n, j) => Math.round((n + (b[j] - n) * (v - i)) * k)).join(',')})`; };

    const s = {phase:'intro', stage:1, t:0, part:0, picks:0, opts:[], best:0, chosen:-1, ok:false, idle:0, slide:0, temp:.5, lo:.4, hi:.68, air:0, surgeT:0, next:2.5, time:0, inT:0, totT:0, sag:0, puffs:[]};
    const pct = () => s.totT ? Math.round(100 * s.inT / s.totT) : 0;
    function intro(n) {
      s.stage = n; s.phase = 'intro'; s.t = 0; g.hud('Read, then tap START.');
      if (n > 1) { const q = TEST[n], e = g.easy ? .03 : 0; s.lo = q.lo - e; s.hi = q.hi + e; s.temp = (s.lo + s.hi) / 2; s.time = 0; s.surgeT = 0; s.next = 2.5; s.sag = 0; s.air = 0; }
    }
    function nextPart() {
      const p = PARTS[s.part], o = [p.best, ...Object.keys(p.no)];
      for (let i = 2; i > 0; i--) { const j = g.rnd(i + 1); [o[i], o[j]] = [o[j], o[i]]; }
      Object.assign(s, {opts:o, best:o.indexOf(p.best), chosen:-1, idle:0, slide:1, phase:'pick', t:0});
      g.hud('Which crate is best? Tap it.'); g.score(`Picks ${s.picks}/3`);
    }
    function pick(i) { s.chosen = i; s.ok = i === s.best; if (s.ok) s.picks++; s.phase = 'fb'; s.t = 0; g.hud(s.ok ? 'Yes! Good choice.' : 'Not quite. Here is why.'); g.score(`Picks ${s.picks}/3`); }
    intro(1); g.score('');

    function step(dt) {
      s.t += dt;
      for (const q of s.puffs) { q.x += q.vx * dt; q.y += q.vy * dt; q.life -= dt; }
      if (s.puffs.length && s.puffs[0].life <= 0) s.puffs.shift();
      if (g.over) return;
      const any = g.tap || g.press.a || g.press.l || g.press.r || g.press.u || g.press.d;
      if (s.phase === 'intro') { if ((any && s.t > .8) || s.t > 9) { if (s.stage === 1) nextPart(); else { s.phase = 'test'; g.hud('Stay in the green!'); } } return; }
      if (s.phase === 'pick') {
        s.slide = Math.max(0, s.slide - dt * 1.6);
        if ((s.idle += dt) > 20) g.hud('Tap a crate to pick it.');
        let i = g.press.l ? 0 : g.press.u || g.press.d ? 1 : g.press.r ? 2 : -1;
        if (g.tap && g.tap.y >= 236) i = Math.max(0, Math.min(2, Math.floor((g.tap.x - 3) / 118)));
        if (i >= 0 && s.slide <= 0) pick(i);   // not while the part is still riding in, so a double tap cannot pick by accident
        return;
      }
      if (s.phase === 'fb') { if (s.t > 3 || (any && s.t > 1)) { if (++s.part < 3) nextPart(); else intro(2); } return; }
      if (s.phase === 'done') {
        if (s.t > 2.6) { const n = pct(); g.end(s.picks >= 2 && n >= 70 ? 3 : n >= 50 ? 2 : 1, `You picked ${s.picks} of 3 materials right and kept the blade safe ${n}% of the time.`); }
        return;
      }
      // the furnace: heat climbs by itself and surges; cooling air pulls it back down
      const q = TEST[s.stage], hold = g.key.a || g.ptr.down;
      s.air += ((hold ? 1 : 0) - s.air) * Math.min(1, dt * 9);
      if ((s.next -= dt) <= 0) { s.surgeT = .7 + g.rnd(7) / 10; s.next = s.surgeT + q.gap * (.6 + g.rnd(9) / 10); }
      const sur = s.surgeT > 0 ? q.surge : 0; s.surgeT -= dt;
      s.temp = Math.max(0, Math.min(1, s.temp + (q.rise + sur - s.air * COOL) * K * dt));
      const hot = s.temp > s.hi, cold = s.temp < s.lo;
      s.time += dt; s.totT += dt; if (!hot && !cold) s.inT += dt;
      s.sag = Math.max(0, Math.min(1, s.sag + (s.temp > s.hi + .12 ? .5 : -.35) * dt));
      if (s.air > .4 && s.puffs.length < 40 && g.rnd(3) === 0) s.puffs.push({x:92 + g.rnd(28), y:136 + g.rnd(52), vx:50 + g.rnd(50), vy:-8 - g.rnd(30), life:.8});
      g.hud(hot ? 'Too hot! Hold COOL!' : cold ? 'Too cold! Let go.' : sur ? 'Heat surge! Cool it!' : 'Stay in the green!');
      g.score(`Green ${pct()}%`);
      if (s.time >= DUR) { if (s.stage === 2) intro(3); else { s.phase = 'done'; s.t = 0; s.air = 0; g.hud(pct() >= 50 ? 'Test passed!' : 'Test finished.'); } }
    }

    // lab background: tiled wall with a pipe run along the top, skirting, floor
    function lab(c, y0, yf, y1) {
      R(c, 0, y0, 360, yf - y0, '#DCE4F5');
      for (let x = 22; x < 360; x += 48) R(c, x, y0, 2, yf - y0, '#CDD7EE');
      for (let y = y0 + 52; y < yf - 20; y += 48) R(c, 0, y, 360, 2, '#CDD7EE');
      R(c, 0, yf - 12, 360, 12, '#B4C0DC'); R(c, 0, yf - 12, 360, 2, '#98A6C8');
      R(c, 0, yf, 360, y1 - yf, '#8491AE'); R(c, 0, yf, 360, 3, '#5F6B88');
      for (let x = 10; x < 360; x += 64) R(c, x, yf + 3, 2, y1 - yf, '#75829F');
      R(c, 0, y0 + 5, 360, 13, P.ink); R(c, 0, y0 + 6, 360, 11, P.steel); R(c, 0, y0 + 6, 360, 3, '#E6ECF7'); R(c, 0, y0 + 14, 360, 3, '#566080');
      for (let x = 30; x < 360; x += 96) { R(c, x, y0 + 2, 9, 19, P.ink); R(c, x + 2, y0 + 4, 5, 15, P.dark); R(c, x + 2, y0 + 4, 2, 15, '#5B6480'); }
    }
    function header(c, name, frac) {
      R(c, 0, 0, 360, 30, P.navy); R(c, 0, 28, 360, 2, g.accent);
      for (let i = 1; i <= 3; i++) { R(c, i * 16 - 10, 8, 13, 13, P.ink); R(c, i * 16 - 8, 10, 9, 9, i < s.stage || s.phase === 'done' ? P.green : i === s.stage ? P.yel : '#3B4C86'); }
      T(c, `Stage ${s.stage} of 3: ${name}`, 58, 5, 18, '#fff');
      if (frac !== undefined) ART.bar(c, 272, 7, 82, 16, frac, P.yel, '#3B4C86');
    }
    // a square badge with a tick or a cross, so right and wrong never rest on colour alone
    function badge(c, x, y, ok) { ART.box(c, x, y, 38, 38, ok ? '#15803D' : P.red, 3); if (ok) ART.map(c, TICK, {G:'#fff'}, x + 6, y + 10, 3); else ART.map(c, CROSS, {G:'#fff'}, x + 9, y + 9, 3); }
    function thermo(c, x, y, h, v) {
      ART.box(c, x, y, 18, h, '#fff', 2); R(c, x + 7, y + 6, 4, h - 22, '#E2E8F0');
      const n = (h - 26) * v; R(c, x + 7, y + h - 16 - n, 4, n, P.red); R(c, x + 5, y + h - 16, 8, 8, P.ink); R(c, x + 6, y + h - 15, 6, 6, P.red);
      for (let k = y + 10; k < y + h - 18; k += 8) R(c, x + 12, k, 3, 1, P.ink);
    }

    function drawPick(c) {
      const t = g.t, p = PARTS[Math.min(2, s.part)], fb = s.phase === 'fb', hint = s.phase === 'pick' && s.idle > 20;
      R(c, 0, 0, 360, 480, P.pale); lab(c, 120, 216, 238); header(c, 'Pick the material');
      // the job card for this part, or why the pick was right or wrong
      ART.box(c, 6, 34, 348, 84, '#fff', 3);
      if (fb) { badge(c, 14, 44, s.ok); T(c, s.ok ? 'Yes!' : 'Not quite.', 62, 38, 24, P.navy); ART.wrap(c, s.ok ? p.yes : `${p.no[s.opts[s.chosen]]} Best: ${MAT[p.best].n.toLowerCase()}.`, 62, 66, 284, 18, P.ink); }
      else { T(c, `Part ${s.part + 1} of 3: ${p.n}`, 16, 38, 24, P.navy); ART.wrap(c, p.need, 16, 66, 330, 18, P.ink); }
      // wall: sign, thermometer, shelf of sample jars
      ART.box(c, 232, 142, 122, 24, P.navy, 2); T(c, 'MATERIALS LAB', 293, 145, 16, '#fff', 'center');
      R(c, 222, 150, 6, 6, Math.floor(t * 2) % 2 ? P.green : '#14532D'); thermo(c, 74, 142, 56, .45 + Math.sin(t) * .04);
      R(c, 236, 194, 118, 5, P.ink); R(c, 236, 194, 118, 2, P.steel);
      ['#F59E0B', '#3B82F6', P.silver, '#22C55E', '#171A26'].forEach((col, i) => { R(c, 242 + i * 22, 174, 16, 20, P.ink); R(c, 244 + i * 22, 178, 12, 14, col); R(c, 244 + i * 22, 178, 3, 14, 'rgba(255,255,255,.45)'); R(c, 245 + i * 22, 172, 10, 4, P.steel); });
      // bench with a moving belt, and the part riding in on it
      const px = 172 + Math.round(s.slide * 240), run = s.slide > 0 ? Math.floor(t * 40) % 24 : 0;
      R(c, 66, 204, 294, 20, P.ink); R(c, 66, 204, 294, 5, P.silver); R(c, 66, 204, 294, 2, '#fff'); R(c, 66, 211, 294, 10, P.dark);
      for (let x = 66 - run; x < 360; x += 24) R(c, Math.max(66, x), 214, 10, 4, P.yel);
      for (const x of [78, 338]) { R(c, x, 224, 10, 12, P.ink); R(c, x + 2, 224, 3, 12, P.steel); }
      R(c, px - 30, 201, 60, 3, 'rgba(11,20,55,.3)');
      if (s.part === 0) ART.map(c, FAN, FANPAL, px - 24, 138, 3); else if (s.part === 1) ART.map(c, BLADE, METAL, px - 24, 132, 3); else ART.map(c, SHAFT, METAL, px - 56, 164, 4);
      // the engineer: hops for a good pick, shakes their head for a bad one
      const hop = fb && s.ok ? Math.round(Math.abs(Math.sin(t * 10)) * 8) : 0, wob = fb && !s.ok && s.t < .6 ? Math.round(Math.sin(t * 40) * 2) : 0;
      ART.char(c, g.av, 14 + wob, 148 - hop, 3, {accent:g.accent, frame:hop ? 1 + Math.floor(t * 8) % 2 : 0});
      // three crates of material with their bars
      s.opts.forEach((id, i) => {
        const m = MAT[id], x = 6 + i * 118, best = fb && i === s.best, bad = fb && i === s.chosen && !s.ok;
        if (best || bad) R(c, x - 3, 239, 118, 240, best ? '#15803D' : P.red);
        ART.box(c, x, 242, 112, 232, best ? '#DCFCE7' : bad ? '#FEE2E2' : hint && Math.floor(t * 3) % 2 ? '#FEF9C3' : '#fff', 3, best || bad ? 0 : 3);
        ART.map(c, STUFF[id], SPAL[id], x + 12, 250, 4); ART.map(c, CRATE, WOOD, x + 8, 270, 4);
        ART.box(c, x + 6, 326, 100, 44, '#fff', 2); ART.wrap(c, m.n, x + 56, m.n.length > 12 ? 328 : 338, 92, 18, P.ink, 'center');
        ['Strong', 'Light', 'Heat'].forEach((name, k) => {
          const y = 380 + k * 30; T(c, name, x + 7, y - 2, 17, P.ink);
          for (let n = 0; n < 5; n++) { R(c, x + 57 + n * 10, y, 9, 15, P.ink); R(c, x + 59 + n * 10, y + 2, 5, 11, n < m.v[k] ? [P.blue, '#0EA5E9', P.orange][k] : '#E2E8F0'); }
        });
        if (best || bad) badge(c, x + 37, 280, best);
        if (hint) { const y = 216 + Math.floor(t * 4) % 2 * 4; R(c, x + 46, y, 20, 14, P.ink); R(c, x + 38, y + 12, 36, 6, P.ink); R(c, x + 44, y + 18, 24, 5, P.ink); R(c, x + 50, y + 23, 12, 4, P.ink); R(c, x + 49, y + 2, 14, 12, P.yel); R(c, x + 42, y + 14, 28, 3, P.yel); R(c, x + 47, y + 17, 18, 4, P.yel); R(c, x + 52, y + 21, 8, 4, P.yel); }
      });
    }

    function drawTest(c) {
      const t = g.t, q = TEST[s.stage], v = s.temp, live = s.phase === 'test', done = s.phase === 'done', hot = v > s.hi, cold = v < s.lo, sur = live && s.surgeT > 0, blink = Math.floor(t * 5) % 2, n = pct(), pass = done && n >= 50;
      lab(c, 30, 340, 480); header(c, q.n, 1 - s.time / DUR);
      // cooling-air pipe down into the furnace; air moves in it while COOL is held
      R(c, 136, 48, 18, 30, P.ink); R(c, 139, 48, 12, 30, '#60A5FA'); R(c, 139, 48, 3, 30, '#BFDBFE'); T(c, 'AIR', 158, 52, 16, P.navy);
      if (s.air > .2) for (let i = 0; i < 3; i++) R(c, 143, 49 + (t * 90 + i * 9) % 26, 4, 4, '#fff');
      // furnace: chimney, heat shimmer, body with rivets
      R(c, 26, 54, 44, 24, P.ink); R(c, 29, 57, 38, 21, '#3A4056'); R(c, 29, 57, 4, 21, '#5B6480'); R(c, 22, 50, 52, 8, P.ink); R(c, 24, 52, 48, 3, '#5B6480');
      for (let i = 0; i < 14; i++) { const ph = (t * (22 + i * 5) + i * 37) % 40; R(c, 14 + (i * 43) % 172 + Math.round(Math.sin(t * 5 + i) * 3), (i % 3 ? 70 : 48) - ph, 4, 7, `rgba(234,88,12,${((.25 + v * .6) * (1 - ph / 40)).toFixed(2)})`); }
      ART.box(c, 8, 74, 188, 258, '#3A4056', 4, 4); R(c, 12, 78, 180, 4, '#5B6480'); R(c, 12, 78, 4, 250, '#5B6480'); R(c, 188, 82, 4, 246, '#262B3D');
      for (const [x, y] of [[18, 84], [182, 84], [18, 286], [182, 286]]) { R(c, x - 1, y - 1, 6, 6, P.ink); R(c, x, y, 4, 4, '#9AA6C0'); }
      // window: glowing gas rushing past the blade
      ART.box(c, 26, 96, 144, 160, P.silver, 4); R(c, 30, 100, 136, 3, '#fff'); R(c, 36, 106, 124, 140, P.ink); R(c, 38, 108, 120, 136, heat(v * .75, .42));
      c.save(); c.beginPath(); c.rect(38, 108, 120, 136); c.clip();
      for (let i = 0; i < 18; i++) R(c, 20 + (t * (70 + i * 9 + (sur ? 110 : 0)) + i * 61) % 150, 112 + (i * 29) % 128, 8 + (i % 3) * 6, 3, heat(v + .12, .95));
      if (hot && blink) R(c, 58, 116, 84, 110, 'rgba(255,252,232,.22)');
      const bp = {K:heat(v, .34), B:heat(v), L:heat(v + .14), D:heat(v, .74), H:s.air > .3 ? '#DFF3FF' : heat(v, .5), R:heat(v * .7, .8)};
      BLADE.forEach((row, j) => { const k = Math.max(0, 15 - j); ART.map(c, [row], bp, 66 + Math.round(s.sag * k * k * .1), 126 + j * 4 + Math.round(s.sag * k * .5), 4); });
      R(c, 54, 220, 88, 24, P.ink); R(c, 56, 222, 84, 22, '#262B3D'); R(c, 56, 222, 84, 3, '#4B556F');
      for (const p of s.puffs) R(c, p.x, p.y, p.life > .4 ? 4 : 3, p.life > .4 ? 4 : 3, p.life > .5 ? '#fff' : '#9BD8FF');
      if (sur && blink) T(c, 'SURGE!', 98, 110, 20, '#fff', 'center');
      c.restore();
      ART.box(c, 26, 262, 144, 26, P.navy, 2); T(c, 'TEST FURNACE', 98, 266, 17, '#fff', 'center');
      // status lamps and warning stripes
      [[P.red, hot && blink], [P.green, !hot && !cold], ['#3B82F6', cold]].forEach(([col, on], i) => { R(c, 174, 102 + i * 22, 14, 14, P.ink); R(c, 176, 104 + i * 22, 10, 10, on ? col : '#1B2033'); if (on) R(c, 177, 105 + i * 22, 3, 3, '#fff'); });
      R(c, 12, 298, 180, 30, P.ink); R(c, 14, 300, 176, 26, P.yel);
      for (let x = 14; x < 170; x += 24) for (let j = 0; j < 4; j++) R(c, x + j * 4, 300 + (3 - j) * 7, 12, j ? 7 : 5, P.ink);
      thermo(c, 206, 150, 110, .25 + v * .6);
      ART.box(c, 200, 100, 30, 36, '#fff', 2, 2); ART.map(c, FLAME, {O:P.red, Y:P.orange, W:P.yel}, 205, 106, 3, Math.floor(t * 6) % 2 > 0);   // hot-surface sign with a flickering flame
      // the big gauge: cold at the bottom, the green band, hot at the top
      const gy = k => 322 - k * 232, yh = gy(s.hi), yl = gy(s.lo), ny = Math.round(gy(v));
      ART.box(c, 232, 54, 122, 280, '#fff', 4, 4); T(c, 'HEAT', 293, 59, 22, P.navy, 'center');
      R(c, 280, 86, 68, 240, P.ink); R(c, 284, 90, 60, 232, '#93C5FD');
      R(c, 284, 90, 60, yh - 90, '#FB923C'); R(c, 284, 90, 60, (yh - 90) * .4, '#EF4444'); R(c, 284, yh, 60, yl - yh, P.green);
      R(c, 284, yh - 2, 60, 3, P.ink); R(c, 284, yl - 1, 60, 3, P.ink);
      for (let k = 1; k < 20; k++) R(c, 284, gy(k / 20), k % 5 ? 5 : 9, 2, 'rgba(11,20,55,.55)');
      T(c, 'HOT', 340, 94, 19, P.ink, 'right'); T(c, 'GOOD', 340, (yh + yl) / 2 - 10, 19, P.ink, 'right'); T(c, 'COLD', 340, 298, 19, P.ink, 'right');
      R(c, 238, ny - 8, 30, 16, P.ink); R(c, 268, ny - 6, 5, 12, P.ink); R(c, 273, ny - 4, 5, 8, P.ink); R(c, 278, ny - 2, 5, 4, P.ink);
      R(c, 241, ny - 5, 25, 10, g.accent); R(c, 241, ny - 5, 25, 3, 'rgba(255,255,255,.4)'); R(c, 283, ny - 2, 18, 4, P.ink); R(c, 283, ny - 1, 18, 1, '#fff');
      // control desk: the COOL button, a little screen, blinking lights
      const dn = s.air > .5 ? 3 : 0;
      ART.box(c, 92, 404, 272, 80, P.dark, 3); R(c, 95, 407, 266, 4, '#566080');
      ART.box(c, 102, 416 + dn, 96, 54, dn ? '#38BDF8' : P.blue, 3, dn ? 0 : 3); T(c, 'COOL', 150, 427 + dn, 30, '#fff', 'center');
      ART.box(c, 208, 414, 146, 44, P.navy, 3); T(c, 'IN THE GREEN', 216, 417, 16, '#86EFAC'); T(c, n + '%', 348, 415, 20, '#fff', 'right');
      ART.bar(c, 214, 437, 134, 15, n / 100, n >= 70 ? P.green : P.yel, '#3B4C86'); R(c, 216 + 91, 435, 2, 19, '#fff');
      for (let i = 0; i < 6; i++) R(c, 212 + i * 24, 464, 14, 8, (Math.floor(t * 3) + i) % 3 === 0 ? [P.green, P.yel, '#38BDF8'][i % 3] : '#1B2033');
      // what the engineer says
      const say = done ? (pass ? 'Test passed! Blade is safe.' : 'Test finished.') : !live ? 'Ready when you are.' : hot ? 'Too hot! Hold COOL!' : cold ? 'Too cold! Let go!' : sur ? 'Heat surge! Cool it!' : 'In the green. Nice!';
      R(c, 82, 378, 16, 10, P.ink); ART.box(c, 94, 348, 260, 46, hot && live ? '#FEF9C3' : '#fff', 3, 3); R(c, 85, 381, 12, 4, hot && live ? '#FEF9C3' : '#fff'); T(c, say, 224, 359, 21, P.ink, 'center');
      // the engineer leans in over the desk when it is too hot and jumps for joy on a pass
      const lean = live && hot ? 8 : 0, jump = pass ? Math.round(Math.abs(Math.sin(t * 9)) * 12) : 0;
      ART.char(c, g.av, 12 + lean, 366 + (lean ? 3 : Math.floor(t * 2) % 2) - jump, 4, {accent:g.accent, frame:pass || lean ? 1 + Math.floor(t * 7) % 2 : 0});
      if (lean) R(c, 86, 384 + (t * 50) % 18, 3, 6, '#38BDF8');
      if (done) {
        if (pass) for (let i = 0; i < 22; i++) R(c, (i * 53 + t * 30) % 360, 34 + (i * 71 + t * 150) % 300, 5, 5, [P.yel, g.accent, P.green, '#38BDF8'][i % 4]);
        ART.box(c, 20, 60, 320, 104, '#fff', 4, 5); T(c, `In the green: ${n}%`, 180, 68, 30, P.navy, 'center');
        ART.wrap(c, 'The right material and cooling air keep a real blade safe.', 180, 106, 296, 19, P.ink, 'center');
      }
    }

    function drawCard(c) {
      const [name, body, tip] = CARD[s.stage], up = Math.floor(g.t * 3) % 2 * 2;
      const say = tip || `So far: ${pct()}% in the green. 3 stars needs 70%.`, y = ART.wrap(c, body, 32, 142, 298, 20, 'rgba(0,0,0,0)');   // first pass only measures
      R(c, 0, 30, 360, 450, 'rgba(11,27,77,.6)'); ART.box(c, 16, 62, 328, y + 74, '#fff', 4, 6);
      T(c, `Stage ${s.stage} of 3`, 180, 72, 20, g.accent, 'center'); T(c, name, 180, 94, 36, P.navy, 'center'); ART.wrap(c, body, 32, 142, 298, 20, P.ink);
      ART.box(c, 28, y + 6, 304, 54, '#FEF9C3', 2); ART.wrap(c, say, 38, y + 13, 286, 18, P.ink);
      ART.box(c, 96, y + 74 - up, 168, 48, P.blue, 4, 4); T(c, 'START', 180, y + 81 - up, 34, '#fff', 'center');
    }
    function draw(c) { if (s.stage === 1) drawPick(c); else drawTest(c); if (s.phase === 'intro') drawCard(c); }
    return {s, step, draw};
  },
  // test robot: reads each card, taps the best crate after a think, then holds COOL whenever the needle is above the middle of the band
  auto(g, game) {
    const s = game.s;
    if (s.phase === 'intro') { if (s.t > 2.5) g.press.a = 1; return; }
    if (s.phase === 'pick') { if (s.t > 4) g.tap = {x:62 + s.best * 118, y:350}; return; }
    if (s.phase === 'test') g.key.a = s.temp > (s.lo + s.hi) / 2 + (g.key.a ? -.02 : .02) ? 1 : 0; else g.key.a = 0;
  },
};
