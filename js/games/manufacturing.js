'use strict';
/* Manufacturing engineer: build three jet engines on the line. Tap the part the air meets next, but only if it has no crack. */
GAMES.manufacturing = {
  title:'Assembly line',
  how:['Build 3 jet engines, front to back.', 'Tap the part the air meets next.', 'Check it first. Never fit a cracked part!'],
  pads:'',
  make(g) {
    const P = ART.P, R = ART.r, SLOT = [130, 215, 300], BY = 236, EX = 18, EY = 58, AX = 172, AY = 216, L = 105;
    const TIME = [9, 6.5, 5.5].map(v => v * (g.easy ? 1.35 : 1)), CRACK = g.easy ? [10, 8, 6] : [9, 6, 5], ZIG = [0, 1, 0, 1, 2, 1, 2, 3, 2, 3];
    // the five engine sections, front to back: 15 x 20 cells each, drawn 4 pixels to a cell
    const SEC = [
      {n:'Fan', clue:'suck', fact:'The fan sucks air in.', rows:['.....KKKKKK....', '...KKHSSSSSKK..', '..KHSnnbcnnMMK.', '.KHSbnnbcnncMMK', '.KHnbcnbcnbcnMK', '.KSnbcnbcnbcnMK', '.KSnnbcbcbcnnMK',
        '.KSnnnbbccnnnMK', '.KSnnnHHSMnnnMK', '.KSbbbHSSMbbbMK', '.KScccSSSMcccMK', '.KSnnnSMMMnnnMK', '.KSnnnbbccnnnMK', '.KSnnbcbcbcnnMK',
        '.KSnbcnbcnbcnMK', '.KSnbcnbcnbcnMK', '.KSMbnnbcnncMMK', '..KSMnnbcnnMMK.', '...KKMMMMMMKK..', '.....KKKKKK....']},
      {n:'Compressor', clue:'squeeze', fact:'The compressor squeezes the air.', rows:['', '', 'KKKK...........', 'KHHDKKKK.......', 'KSSDHHDHKKKK...', 'KSSDSSDSHDHHKKK', 'KSSDSSDSSDSSDHK',
        'KSSDSSDSSDSSDSK', 'KSSDSSDSSDSSDSK', 'KSSDSSDSSDSSDSK', 'KSSDSSDSSDSSDSK', 'KSSDSSDSSDSSDSK', 'KSSDSSDSSDSSDSK', 'KSSDSSDSSDSSDMK',
        'KSSDSSDSMDMMKKK', 'KSSDMMDMKKKK...', 'KMMDKKKK.......', 'KKKK...........', '', '']},
      {n:'Combustor', clue:'bang', fact:'The combustor burns fuel in the air.', rows:['', '', '', '.KKKKKKKKKKKKK.', 'KEEEEEEEEEEEEEK', 'KCKKKKKKKKKKKCK', 'KCKROOYYWYORKCK',
        'KCKOOYYWWYYOKCK', 'KCKROOYYWYORKCK', 'KCSSSSSSSSSSSCK', 'KCMMMMMMMMMMMCK', 'KCKROOYYWYORKCK', 'KCKOOYYWWYYOKCK', 'KCKROOYYWYORKCK',
        'KCKKKKKKKKKKKCK', 'KCCCCCCCCCCCCCK', '.KKKKKKKKKKKKK.', '', '', '']},
      {n:'Turbine', clue:'blow', fact:'The hot gas spins the turbine.', rows:['', '', '.........KKKKKK', '.........KyyyyK', '....KKKKKKGGGGK', 'KKKKKyyyyDggggK', 'KyyyDggggDGGGGK',
        'KGGGDGGGGDggggK', 'KgggDggggDGGGGK', 'KSSSSSSSSSSSSSK', 'KMMMMMMMMMMMMMK', 'KGGGDggggDGGGGK', 'KgggDGGGGDggggK', 'KGGGDggggDGGGGK',
        'KKKKKGGGGDggggK', '....KKKKKKGGGGK', '.........KggggK', '.........KKKKKK', '', '']},
      {n:'Exhaust', clue:'', fact:'The gas rushes out of the back.', rows:['', '', 'KKK............', 'KAAKKK.........', 'KAASSSKKK......', 'KAAMMMSSSKKK...', 'KAAMMMMMMSSK...',
        'KAADDDDDDDDK...', 'KAAMMMMMMMMKKK.', 'KAAMMMMMMMMKHSK', 'KAAMMMMMMMMKSMK', 'KAAMMMMMMMMKKK.', 'KAADDDDDDDDK...', 'KAAMMMMMMMMK...',
        'KAAMMMMMMKKK...', 'KAAMMMKKK......', 'KAAKKK.........', 'KKK............', '', '']},
    ];
    const LAMP = ['......KK......', '.....KDDK.....', '...KKDHDDKK...', '..KDHDDDDDDK..', '.KDHDDDDDDDDK.', 'KKKKKKKKKKKKKK', '...KYYYYYYK...', '....KKKKKK....'];
    const ROLL = [['..KKK..', '.KSSSK.', 'KSSKSSK', 'KSKKKSK', 'KSSKSSK', '.KSSSK.', '..KKK..'], ['..KKK..', '.KSSSK.', 'KSKSKSK', 'KSSKSSK', 'KSKSKSK', '.KSSSK.', '..KKK..']];
    const TICK = ['........G', '.......GG', 'G.....GG.', 'GG...GG..', '.GG.GG...', '..GGG....', '...G.....'], CROSS = ['R.....R', 'RR...RR', '.RR.RR.', '..RRR..', '.RR.RR.', 'RR...RR', 'R.....R'];
    const PAL = {K:P.ink, H:'#FFFFFF', S:P.silver, M:P.steel, D:P.dark, n:P.navy, b:'#3D6BFF', c:P.sky, R:P.red, O:P.orange, Y:P.yel, W:'#FFF9D6', G:P.gold, g:'#B45309', y:'#FDE68A', A:P.blue, C:'#7C2D12', E:'#B4532A'};
    const HOT = {...PAL, R:P.orange, O:P.gold, Y:'#FFF9D6', W:'#FFFFFF'}, SPIN = {...PAL, b:PAL.c, c:PAL.b};
    const wash = (fill, line) => { const o = {}; for (const k in PAL) o[k] = k === 'K' ? line : fill; return o; };
    const GHOST = wash('rgba(255,255,255,.1)', 'rgba(255,255,255,.4)'), FLAT = wash('rgba(255,255,255,.15)', 'rgba(255,255,255,.15)');
    const NEXT = wash('rgba(245,225,43,.3)', P.yel), NEXTF = wash('rgba(245,225,43,.45)', 'rgba(245,225,43,.45)'), WHITE = wash('rgba(255,255,255,.7)', '#fff');
    const STAGE = ['all clues', 'clue only', 'no clues'], NAMEX = [44, 98, 176, 236, 292], CAB = '#D5DCEC';
    const s = {phase:'intro', pt:0, eng:0, n:0, total:0, first:0, fails:0, touts:0, idle:0, set:[], pips:[], slot:SLOT, slide:0, belt:0, T:TIME[0], tm:0, pick:-1, hold:0, from:0, carry:-1,
      path:null, ang:[-.09, 2.97], roll:0, lit:false, cheer:0, flash:0, msg:{t:'Which part does the air meet first?'}};
    const REST = s.ang, ease = u => { u = Math.max(0, Math.min(1, u)); return u * u * (3 - 2 * u); }, go = p => { s.phase = p; s.pt = 0; };
    const slide = v => { s.belt += v - s.slide; s.slide = v; }, good = o => o.k === s.n && !o.crack;
    const hud = () => { g.hud(`Engine ${s.eng + 1} of 3: ${STAGE[s.eng]}`); g.score(`First go ${s.first}/15`); };
    // robot arm: two links of length L. Work out both joint angles for a hand position, bending the way that keeps the elbow high.
    const pose = (x, y) => {
      const f = Math.atan2(y - AY, x - AX), a = Math.acos(Math.min(1, Math.hypot(x - AX, y - AY) / (2 * L))), t1 = Math.sin(f - a) < Math.sin(f + a) ? f - a : f + a;
      return [t1, Math.atan2(y - AY - L * Math.sin(t1), x - AX - L * Math.cos(t1))];
    };
    const swing = (a, b, u) => a.map((v, i) => v + ((b[i] - v + 9.4248) % 6.2832 - 3.1416) * ease(u));
    hud();

    // a crack is a zigzag two cells wide; find a place where all of it lies on the part
    function crackOn(k, n) {
      const solid = (x, y) => { const ch = SEC[k].rows[y][x]; return ch && ch !== '.'; };
      for (let i = 0; i < 300; i++) { const x = 1 + g.rnd(10), y = 1 + g.rnd(19 - n); let ok = true;
        for (let j = 0; j < n; j++) if (!solid(x + ZIG[j], y + j) || !solid(x + ZIG[j] + 1, y + j)) ok = false;
        if (ok) return {x, y, n}; }
      return {x:5, y:6, n:6};
    }
    // three parts for the pick station: one right, two wrong (another section, or the right section with a crack)
    function deal() {
      const set = [{k:s.n}], roll = g.rnd(10);
      const other = () => { let k; do k = g.rnd(5); while (set.some(o => o.k === k)); return {k}; }, bad = () => ({k:s.n, crack:crackOn(s.n, CRACK[s.eng])});
      if ((!s.total && !s.fails) || roll < 6) set.push(bad(), other()); else if (roll < 8) set.push(other(), other()); else set.push(bad(), bad());
      for (let i = 2; i > 0; i--) { const j = g.rnd(i + 1); [set[i], set[j]] = [set[j], set[i]]; }
      s.set = set; s.slide = 300; s.pick = -1; s.T = s.tm = TIME[s.eng] * (s.idle > 1 ? .6 : 1); go('in');
    }
    function fit(i, first) {
      s.from = i; s.carry = s.n; s.path = [pose(SLOT[i], BY + 12), pose(EX + 30 + s.n * 60, EY + 12)];
      s.pips.push(first ? 1 : 0); if (first) s.first++; go('fit');
    }
    function choose(i) {
      const o = s.set[i]; s.idle = 0; s.pick = i;
      if (good(o)) { s.msg = {ok:1, t:'Good check! No cracks.'}; return fit(i, !s.fails); }
      s.fails++; s.hold = .8; s.msg = {ok:0, t:o.crack ? 'That one is cracked.' : `The air meets the ${SEC[s.n].n.toLowerCase()} next.`}; go('miss');
    }
    // the belt carried them away: one more go, then the robot fits it so nobody gets stuck
    function late() {
      s.touts++; s.idle++; s.fails++;
      if (s.touts > 1 || s.idle > 1) { s.msg = {t:`The robot fits the ${SEC[s.n].n.toLowerCase()} for you.`}; return fit(s.set.findIndex(good), false); }
      s.hold = .1; s.msg = {ok:0, t:'Too slow! The belt moved on.'}; go('miss');
    }

    function step(dt) {
      s.pt += dt; s.cheer = Math.max(0, s.cheer - dt); s.flash = Math.max(0, s.flash - dt);
      const ph = s.phase, pt = s.pt, k = g.press;
      if (ph === 'intro') { if (g.tap || k.a || k.l || k.r || k.u || k.d || pt > 8) deal(); }
      else if (ph === 'in') { slide(300 * (1 - ease(pt / .6))); if (pt >= .6) go('pick'); }
      else if (ph === 'pick') {
        let i = k.l ? 0 : k.u || k.d ? 1 : k.r ? 2 : -1;
        if (g.tap && g.tap.y > 222 && g.tap.y < 366) SLOT.forEach((x, j) => { if (Math.abs(g.tap.x - x) < 43) i = j; });
        s.tm -= dt;
        if (i >= 0) choose(i); else if (s.tm <= 0) late();
      }
      else if (ph === 'miss') { slide(-300 * ease((pt - s.hold) / .6)); if (pt > s.hold + .75) deal(); }
      else if (ph === 'fit') {
        // reach for the part, lift it, swing it over to the engine, click it in, fold away
        const [a, b] = s.path;
        s.ang = pt < .4 ? swing(REST, a, pt / .4) : pt < .55 ? a : pt < 1.2 ? swing(a, b, (pt - .55) / .65) : pt < 1.35 ? b : swing(b, REST, (pt - 1.35) / .35);
        if (pt >= .55) { s.set[s.from].gone = true; slide(-300 * ease((pt - .55) / .6)); }
        if (pt >= 1.2 && s.carry >= 0) { s.msg = {ok:1, t:'Click! ' + SEC[s.n].fact}; s.carry = -1; s.n++; s.total++; s.fails = s.touts = 0; s.flash = .3; hud(); }
        if (pt >= 1.7) { s.ang = REST; if (s.n < 5) deal(); else { go('fire'); s.lit = true; s.cheer = 2; s.msg = {ok:1, t:`Engine ${s.eng + 1} fires up! Every part was checked.`}; } }
      }
      else if (ph === 'fire') {
        if (s.eng === 2 && s.lit) { if (pt > 1.5) { go('done'); g.end(s.first >= 13 ? 3 : s.first >= 9 ? 2 : 1, `You built 3 jet engines and picked ${s.first} of 15 parts right first go.`); } }
        else if (pt >= 2.3) {
          if (s.lit) { s.lit = false; s.eng++; s.n = 0; hud(); s.msg = {t:s.eng === 1 ? 'Engine 2: a faster belt and smaller cracks.' : 'Engine 3: no clues. Remember the order!'}; }
          s.roll = 390 * (1 - ease((pt - 2.3) / .8)); if (pt >= 3.1) deal();
        }
        else if (pt > 1.5) s.roll = -390 * ((pt - 1.5) / .8) ** 2;
      }
    }

    const pal = (k, lit) => k === 2 && Math.floor(g.t * 8) % 2 ? HOT : k === 0 && lit && Math.floor(g.t * 14) % 2 ? SPIN : PAL;
    function hazard(c, x, y, w, h) {
      R(c, x, y, w, h, P.yel);
      for (let i = -h; i < w; i += 16) for (let j = 0; j < h; j += 2) { const a = Math.max(0, i + j), b = Math.min(w, i + j + 8); if (b > a) R(c, x + a, y + j, b - a, 2, P.ink); }
    }
    function crack(c, cr, x, y) {
      for (const pass of [0, 1]) for (let j = 0; j < cr.n; j++) { const px = x + (cr.x + ZIG[j]) * 4, py = y + (cr.y + j) * 4;
        if (pass) R(c, px, py, 8, 4, '#05060F'); else R(c, px - 1, py - 1, 10, 6, '#FFF3C4'); }
    }
    // one arm link as a chunky stepped line of squares (no rotated shapes)
    function link(c, x0, y0, x1, y1, col) {
      const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 4), at = i => [Math.round((x0 + (x1 - x0) * i / n) / 2) * 2, Math.round((y0 + (y1 - y0) * i / n) / 2) * 2];
      for (let i = 0; i <= n; i++) { const [x, y] = at(i); R(c, x - 6, y - 6, 12, 12, P.ink); }
      for (let i = 0; i <= n; i++) { const [x, y] = at(i); R(c, x - 4, y - 4, 8, 8, i % 8 > 5 ? P.dark : col); R(c, x - 4, y - 4, 3, 3, 'rgba(255,255,255,.5)'); }
    }
    const joint = (c, x, y) => { ART.box(c, x - 8, y - 8, 16, 16, P.silver, 3); R(c, x - 5, y - 5, 4, 2, '#fff'); R(c, x - 2, y - 2, 4, 4, P.ink); };

    function draw(c) {
      const t = g.t, ph = s.phase, pt = s.pt, e = s.eng, blink = Math.floor(t * 3) % 2;
      // back wall, ceiling pipe, the two boards and the line's signal lights
      R(c, 0, 0, 360, 200, '#DCE3F2'); R(c, 0, 0, 360, 3, P.dark); R(c, 0, 15, 360, 7, P.steel); R(c, 0, 15, 360, 2, P.silver);
      ART.box(c, 6, 4, 132, 30, P.navy, 3); ART.text(c, `ENGINE ${e + 1} of 3`, 72, 9, 20, '#fff', 'center');
      ART.box(c, 222, 4, 132, 30, P.navy, 3); ART.text(c, `PARTS ${String(s.total).padStart(2, '0')}/15`, 288, 9, 20, '#fff', 'center');
      ART.box(c, 150, 4, 60, 30, P.dark, 3);
      [P.red, P.gold, P.green].forEach((col, i) => { const on = i === (ph === 'miss' ? 0 : ph === 'pick' ? 1 : 2) && (i !== 1 || blink), x = 157 + i * 17;
        R(c, x, 12, 12, 12, P.ink); R(c, x + 2, 14, 8, 8, on ? col : '#4A5270'); if (on) R(c, x + 2, 14, 3, 3, '#fff'); });
      // build bay: a dark booth with two hanging lights, the rail, and the engine on its cart
      ART.box(c, 6, 36, 348, 118, '#16265C', 3);
      for (let x = 38; x < 350; x += 58) R(c, x, 39, 2, 112, '#1E3172');
      R(c, 12, 44, 8, 8, P.ink); R(c, 14, 46, 4, 4, ph === 'fit' && Math.floor(t * 8) % 2 ? P.orange : '#4A5270');
      for (const x of [108, 252]) { for (let i = 0; i < 6; i++) R(c, x - 14 - i * 7, 54 + i * 16, 28 + i * 14, 16, 'rgba(255,244,190,.06)');
        ART.map(c, LAMP, {K:P.ink, D:P.steel, H:P.silver, Y:Math.floor(t * 2 + x) % 9 ? P.yel : '#FFF9D6'}, x - 14, 39, 2); }
      c.save(); c.beginPath(); c.rect(9, 39, 342, 112); c.clip();
      R(c, 9, 149, 342, 2, P.steel);
      const ex = EX + Math.round(s.roll) + (ph === 'fire' && pt < .7 ? Math.round(Math.sin(t * 70) * 3) : 0);
      for (let k = 0; k < 5; k++) R(c, ex + k * 60 + 24, 118, 12, 20, P.dark);
      R(c, ex + 4, 137, 292, 8, P.ink); R(c, ex + 6, 139, 288, 4, P.steel); R(c, ex + 6, 139, 288, 1, P.silver);
      for (const wx of [28, 98, 188, 258]) { R(c, ex + wx, 143, 12, 7, P.ink); R(c, ex + wx + 4, 145, 4, 3, P.silver); }
      for (let k = 0; k < 5; k++) ART.map(c, SEC[k].rows, k < s.n ? pal(k, s.lit) : k === s.n && blink && ph !== 'intro' ? (e < 2 ? NEXT : NEXTF) : e < 2 ? GHOST : FLAT, ex + k * 60, EY, 4);
      if (s.flash > 0) { const x = ex + (s.n - 1) * 60, d = (.3 - s.flash) * 90; if (s.flash > .15) ART.map(c, SEC[s.n - 1].rows, WHITE, x, EY, 4);
        for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) R(c, x + 27 + a * (20 + d), EY + 37 + b * (26 + d), 6, 6, P.yel); }
      if (s.lit) { const f = Math.floor(t * 18) % 3, fx = ex + 296; R(c, fx, 86, 30 + f * 8, 24, P.orange); R(c, fx + 30 + f * 8, 92, 10, 12, P.orange); R(c, fx, 90, 24 + f * 6, 16, P.yel); R(c, fx, 94, 12 + f * 5, 8, '#FFF9D6'); }
      c.restore();
      // warning stripe and the sign under the bay: names and clue on engine 1, clue only on engine 2, no clue on engine 3
      hazard(c, 6, 154, 348, 6); ART.box(c, 6, 160, 348, 38, P.navy, 3);
      const sign = s.lit ? 0 : e;
      if (sign === 2) ART.text(c, 'No clues now. What comes next?', 180, 168, 20, '#fff', 'center');
      else SEC.forEach((q, k) => { const x = EX + 30 + k * 60, on = k === s.n;
        if (!sign) ART.text(c, q.n, NAMEX[k], 163, 15, on ? P.yel : '#fff', 'center');
        if (q.clue) ART.text(c, q.clue, k === 3 ? x + 30 : x, sign ? 168 : 178, sign ? 20 : 17, on || (k === 3 && s.n === 4) ? P.yel : P.sky, 'center'); });
      // shop floor, the arm's stand, the lit checking board behind the pick station
      R(c, 0, 198, 360, 282, '#A9B4CE'); R(c, 0, 198, 360, 3, '#8794B3'); R(c, 0, 362, 360, 2, '#9CA8C4');
      for (let x = 20; x < 360; x += 68) R(c, x, 201, 2, 279, '#9CA8C4');
      ART.box(c, 4, 203, 138, 24, P.yel, 3); ART.text(c, 'CHECK EVERY PART', 73, 207, 17, P.ink, 'center');
      ART.box(c, 72, 224, 284, 94, '#F7F9FC', 3);
      for (let x = 92; x < 350; x += 20) R(c, x, 227, 1, 88, '#E1E8F6'); for (let y = 244; y < 314; y += 20) R(c, 75, y, 278, 1, '#E1E8F6');
      if (ph === 'pick') R(c, 75, 228 + Math.floor(t * 50) % 84, 278, 2, 'rgba(29,63,191,.22)');
      ART.box(c, AX - 16, AY - 2, 32, 24, P.dark, 3); R(c, AX - 24, AY + 18, 48, 6, P.ink); R(c, AX - 22, AY + 19, 44, 2, P.steel);
      // conveyor: moving stripes, turning rollers, legs
      R(c, 60, 316, 300, 14, P.ink); R(c, 60, 318, 300, 10, P.dark); R(c, 60, 316, 300, 2, P.steel);
      for (let x = 40 + ((s.belt % 24) + 24) % 24; x < 360; x += 24) R(c, x, 319, 8, 8, '#4A567E');
      R(c, 60, 330, 300, 14, '#5E6A8A'); R(c, 60, 342, 300, 2, P.ink);
      for (let x = 76; x < 356; x += 28) ART.map(c, ROLL[Math.floor(Math.abs(s.belt) / 8) % 2], {K:P.ink, S:P.silver}, x, 330, 2);
      for (const x of [170, 255, 344]) { R(c, x, 344, 8, 16, P.ink); R(c, x + 2, 344, 3, 14, P.steel); }
      // the three parts at the pick station
      s.set.forEach((o, i) => { if (o.gone) return; const x = SLOT[i] - 30 + Math.round(s.slide);
        ART.map(c, SEC[o.k].rows, pal(o.k), x, BY, 4); if (o.crack) crack(c, o.crack, x, BY);
        if (e === 0 && x > 78) { ART.box(c, x - 8, 346, 76, 18, P.navy, 2); ART.text(c, SEC[o.k].n, x + 30, 347, 15, '#fff', 'center'); }
        if (ph === 'pick' && s.fails > 1 && good(o)) for (const [a, b, w, h] of [[-6, -8, 72, 4], [-6, 84, 72, 4], [-6, -8, 4, 96], [62, -8, 4, 96]]) R(c, x + a, BY + b, w, h, blink ? P.yel : P.gold);
        if (ph === 'miss' && i === s.pick) { ART.map(c, CROSS, {R:P.ink}, x + 11, BY + 15, 6); ART.map(c, CROSS, {R:P.red}, x + 9, BY + 13, 6);
          ART.box(c, x - 12, BY + 60, 84, 24, '#fff', 2); ART.text(c, o.crack ? 'CRACKED' : 'NOT NEXT', x + 30, BY + 63, 18, P.ink, 'center'); } });
      // the control cabinet the belt runs into, with the player in front of it: pointing at the belt, or cheering
      ART.box(c, -3, 230, 73, 120, CAB, 3); R(c, 60, 238, 7, 92, P.ink);
      for (let i = 0; i < 3; i++) { R(c, 6 + i * 16, 236, 12, 8, P.ink); R(c, 8 + i * 16, 238, 8, 4, Math.floor(t * 3) % 3 === i ? P.green : '#4A5270'); }
      const cheer = s.cheer > 0 || ph === 'done', cy = 262 + (cheer ? -Math.abs(Math.round(Math.sin(t * 9) * 8)) : ph === 'fit' && pt < .3 ? -Math.round(Math.sin(pt / .3 * 3.14) * 5) : Math.round(Math.sin(t * 3)));
      ART.char(c, g.av, 8, cy, 3, {accent:g.accent, frame:cheer ? 1 + Math.floor(t * 6) % 2 : 0});
      const sleeve = OUTFIT_COL[g.av.outfit || 'overalls'][2], skin = SKIN[g.av.skin], arms = [], bx = g.av.hair === 'braids' ? 49 : 45;
      const hide = () => { R(c, bx, cy + 43, 52 - bx, 17, CAB); if (bx === 45) R(c, 44, cy + 43, 1, 17, P.ink); };
      if (cheer) { hide(); R(c, 13, cy + 43, 6, 17, CAB); R(c, 19, cy + 43, 1, 17, P.ink);
        arms.push([8, cy + 36, 12, 7, sleeve], [8, cy + 20, 7, 16, sleeve], [8, cy + 13, 7, 7, skin], [44, cy + 36, 12, 7, sleeve], [49, cy + 20, 7, 16, sleeve], [49, cy + 13, 7, 7, skin]); }
      else if (ph === 'in' || ph === 'pick') { hide(); arms.push([44, cy + 36, 14, 7, sleeve], [58, cy + 36, 7, 7, skin]); }
      for (const [x, y, w, h] of arms) R(c, x - 1, y - 1, w + 2, h + 2, P.ink);
      for (const q of arms) R(c, ...q);
      // robot arm, the part it is carrying, and its gripper
      const [t1, t2] = s.ang, elx = AX + L * Math.cos(t1), ely = AY + L * Math.sin(t1), hx = Math.round(elx + L * Math.cos(t2)), hy = Math.round(ely + L * Math.sin(t2));
      link(c, AX, AY, elx, ely, P.yel); link(c, elx, ely, hx, hy, g.accent); joint(c, AX, AY); joint(c, Math.round(elx), Math.round(ely));
      const held = ph === 'fit' && pt >= .55 && s.carry >= 0;
      if (held) ART.map(c, SEC[s.carry].rows, pal(s.carry), hx - 30, hy - 12, 4);
      R(c, hx - 14, hy - 7, 28, 10, P.ink); R(c, hx - 12, hy - 5, 24, 6, P.steel); R(c, hx - 12, hy - 5, 24, 2, P.silver);
      for (const jx of held || (ph === 'fit' && pt > .4 && pt < .55) ? [-12, 6] : [-16, 10]) { R(c, hx + jx, hy + 3, 6, 12, P.ink); R(c, hx + jx + 2, hy + 3, 2, 10, P.steel); }
      // belt timer, the message panel, and one square per part: tick = right first go
      const fr = ph === 'pick' ? s.tm / s.T : ph === 'in' ? 1 : 0, m = s.msg, tx = m.ok == null ? 16 : 50;
      ART.text(c, 'TIME', 8, 366, 18, P.navy); ART.bar(c, 50, 367, 304, 16, fr, fr > .5 ? P.green : fr > .25 ? P.gold : P.red);
      ART.box(c, 6, 388, 348, 52, '#fff', 3);
      if (m.ok === 1) ART.map(c, TICK, {G:P.green}, 14, 404, 3); else if (m.ok === 0) ART.map(c, CROSS, {R:P.red}, 17, 404, 3);
      ART.text(c, '', 0, 0, 19);   // sets the font, so the line below can measure: one line sits in the middle, two start higher
      ART.wrap(c, m.t, tx, c.measureText(m.t).width > 346 - tx ? 394 : 404, 346 - tx, 19, P.ink);
      for (let i = 0; i < 15; i++) { const x = 30 + Math.floor(i / 5) * 116 + (i % 5) * 19, v = s.pips[i];
        if (i % 5 === 0) ART.text(c, String(i / 5 + 1), x - 14, 444, 20, P.navy);
        ART.box(c, x, 446, 16, 16, v === 1 ? P.green : v === 0 ? P.gold : i === s.total && blink ? P.yel : '#fff', 2);
        if (v === 1) ART.map(c, TICK, {G:'#fff'}, x + 4, 451, 1); else if (v === 0) R(c, x + 6, 452, 4, 4, P.ink); }
      hazard(c, 0, 468, 360, 12);
      if (ph === 'intro') {
        ART.box(c, 4, 200, 348, 240, '#fff', 4, 4); ART.head(c, g.av, 24, 214, 3, {accent:g.accent});
        ART.text(c, 'Build 3 jet engines!', 82, 216, 30, P.navy); ART.text(c, 'Front to back, like the air.', 82, 246, 19, P.dark);
        const y = ART.wrap(c, 'Tap the part the air meets next. Check it first: never fit a cracked part.', 26, 274, 308, 19, P.ink);
        ART.text(c, 'suck, squeeze, bang, blow', 180, y + 4, 26, P.blue, 'center');
        for (let i = 0; i < 3; i++) ART.star(c, 28 + i * 26, y + 40, 2); ART.text(c, '= 13 of 15 right first go', 110, y + 39, 19, P.ink);
        if (blink) ART.text(c, 'Tap to start', 180, 408, 24, P.blue, 'center');
      }
    }
    return {s, step, draw};
  },
  // test robot: looks for a second and a half, then taps the next section that has no crack (and gets one wrong on purpose)
  auto(g, game) {
    const s = game.s;
    if (s.phase === 'intro') { if (s.pt > 1) g.press.a = 1; return; }
    if (s.phase !== 'pick' || s.T - s.tm < 1.5) return;
    const right = o => o.k === s.n && !o.crack, slip = s.total === 6 && !s.fails;
    g.tap = {x:s.slot[s.set.findIndex(o => right(o) !== slip)], y:276};
  },
};
