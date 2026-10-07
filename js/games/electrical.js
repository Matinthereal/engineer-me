'use strict';
/* Electrical engineer: an electric plane will not start. Turn wire tiles until the battery is joined to the motor, three times over. */
GAMES.electrical = {
  title:'Power up',
  how:['Tap a wire tile to turn it.', 'Join the battery to the motor with no gaps.', 'Fix all 3 circuits quickly for 3 stars.'],
  pads:'lruda', action:'TURN',
  make(g) {
    const P = ART.P, R = ART.r, GX = 84, GY = 190, WIN = 3.6, T3 = g.easy ? 100 : 80, T2 = g.easy ? 165 : 130, HINT = g.easy ? 12 : 20;
    const LV = [{n:3, lo:4, hi:5}, {n:4, lo:7, hi:8}, {n:4, lo:10, hi:12}];   // grid size and how many tiles the answer path may use
    const SYS = [{n:'Lights', on:'Cockpit lights ON!'}, {n:'Left prop', on:'Left propeller ON!'}, {n:'Right prop', on:'Right propeller ON!'}];
    // sides of a tile: 1 up, 2 right, 4 down, 8 left. A straight piece joins two opposite sides, a corner piece two next to each other.
    const STEP = {1:[-1, 0], 2:[0, 1], 4:[1, 0], 8:[0, -1]}, opp = d => ((d << 2) | (d >> 2)) & 15;
    const mask = t => t.k ? [3, 6, 12, 9][t.rot] : t.rot % 2 ? 5 : 10;
    const mix = a => { for (let i = a.length - 1; i > 0; i--) { const j = g.rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const clock = v => `${Math.floor(v / 60)}:${String(Math.floor(v % 60)).padStart(2, '0')}`;

    const PLANE = ['.....................................................................', '....KKKKKKK..........................................................', '...KAAAAAAAK.........................................................', '...KAAAAAAAAK........................................................', '....KYYYYYYYSK.......................................................', '....KHWWWWWWWSK.............KKKKKKKKKKKKKK.........KKKKKK............', '.....KHWWWWWWWSK...........KHHHHAAHHHHHHHHK......KKGGGWGGKK..........', '.....KHWWWWWWWWSK....KKKKKKKNNNNAANNNNNNNNYK....KGgggGWGGGGK.........', '......KHWWWWWWWWSK..KDDDDDDDnnnnAAnnnnnnnnK....KGggGGGWGGGGGK........', '......KHWWWWWWWWWSKKKDDDDDDDDDDDDDDDDDDDDDKKKKKKGGGGGGWGGGGGGK.......', '.KKKKKKKKKKKKHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHKKK......', 'KWWWWWWWWWWWWWWWWWWSWWWWWWWWWWWWWWWWWWWWWSSSWSWWWWWWWWWWWWWWWWWKKKK..', 'KSSSSSWWWWWWWWWWWWWSWHHHHAAHHHHHHHHHWWWWWSWSWSWWWWWWWWWWWWWWWWWWWWWK.', '.KKKWWWWWSSWWWWWWWWSWNNNNAANNDDDDNNNYWWWWSWSWSWWWWWWWWWWWWWWWWWWWYYK.', '...KAAAAAAAAAAAAAAASANNNNAANNNNNNNNNYAAAAAAAASAAAAAAAAAAAAAAAAAAAAAK.', '....KKWWWWWWWWWWWWWSWnnnnAAnnnnnnnnnWWWWWWWWWSWWWWWWWWWWWWWWWWWWWWK..', '......KKKKSYAAHHHHHHHHHHHHHHHHHHHHHHHHSSSSSSSSSSSSSSSSSSSSSSSSSSKK...', '..........KAAASSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSKKKK.....', '...........KKDDDDDDDDDDDDDDDDDDDDDDDKKKKKKKKKKKKKKKKKKKKDKKK.........', '.............KKKKKKKKKKKKKKDDKKKKKKK..................KKDKK..........', '........................KTTTTTTK.....................KTTTTTK.........', '........................KTTMMTTK.....................KTTMTTK.........', '........................KTTTTTTK.....................KTTTTTK.........', '.........................KKKKKK.......................KKKKK..........'];
    const BATT = ['...KKK....KKK...', '..KDDDK..KrRRK..', '.KKDDDKKKKrRRKK.', 'KHHHHHHHHHHHHHHK', 'KHMMBBBBBBBBMMSK', 'KHBBBBBBBBBBBBSK', 'KHBDDDDDDDDDDBSK', 'KHBDDDDDDDDDDBSK', 'KHBDDDDDDDDDDBSK', 'KHBDDDDDDDDDDBSK', 'KHBDDDDDDDDDDBSK', 'KHBDDDDDDDDDDBSK', 'KHBDDDDDDDDDDBSK', 'KHBDDDDDDDDDDBSK', 'KHBDDDDDDDDDDBSK', 'KHBDDDDDDDDDDBSK', 'KHBDDDDDDDDDDBSK', 'KHBBBBBBBBBBBBSK', 'KHYYYYYYDDYYYYSK', 'KHYYYYYDDYYYYYSK', 'KHYYYYDDDDYYYYSK', 'KHYYYYYDDYYYYYSK', 'KHYYYYDDYYYYYYSK', 'KHBBBBBBBBBBBBSK', 'KSSSSSSSSSSSSSSK', '.KDDDKKKKKKDDDK.', '.KDDDK....KDDDK.', '..KKK......KKK..'];
    const MOTOR = ['.......KK.......', '......KHMK......', '......KHMK......', '......KHMK......', '....KKKHMKKK....', '...KMMMMMMMMK...', '..KKDDDDDDDDKK..', '.KHNNNNNNNNNNnK.', '.KHnnnnnnnnnnnK.', '.KHNNNAAAANNNnK.', '.KHnnnAYYAnnnnK.', '.KAAAAAYYAAAAAK.', '.KHnnnAYYAnnnnK.', '.KHNNNAAAANNNnK.', '.KHnnnnnnnnnnnK.', '.KHNNNNNNNNNNnK.', 'KMMMMMMMMMMMMMMK', 'KDDHDDDDDDDDHDDK', '.KDDDKKKKKKDDDK.', '..KKK......KKK..'];
    const FAN = [['....KKK....', '....KFK....', '....KFK....', '....KFK....', 'KKKKKFKKKKK', 'KFFFFHFFFFK', 'KKKKKFKKKKK', '....KFK....', '....KFK....', '....KFK....', '....KKK....'], ['KK.......KK', 'KFK.....KFK', '.KFK...KFK.', '..KFK.KFK..', '...KFKFK...', '....KHK....', '...KFKFK...', '..KFK.KFK..', '.KFK...KFK.', 'KFK.....KFK', 'KK.......KK']];
    const RACK = ['.KKKKKKKKKKK.', 'KHHHHHHHHHHHK', 'KPPPPPPPPPPSK', 'KPMMMPPMPPPSK', 'KPMPMPPMPDDDK', 'KPPMPPPMPDDDK', 'KPPMPPPMPPYSK', 'KPPMPPPMPPYSK', 'KPPMPPPMPPYSK', 'KPPMPPrRRPYSK', 'KPPMPPrRRPYSK', 'KPPMPPrRRPYSK', 'KPMMMPrRRPYSK', 'KPMPMPrRRPYSK', 'KPPPPPPPPPPSK', 'KPPPPPPPPPPSK', '.KKKKKKKKKKK.'];
    const CHARGER = ['..KKKKKKKKK..', '.KHHHHHHHHHK.', '.KBBBBBBBBSK.', '.KBDDDDDYYSK.', '.KBDDDDDBBSK.', '.KBDDDDDMMSK.', '.KBBBBBBBBSK.', '.KBBLBBBBBSK.', '.KBBBBBBBBSK.', '..KKKKKKKKK..', '...KCCCCCK...', '..KCcccccCK..', '..KCcDDDCCK..', '..KCcDDDCCK..', '..KCcDDDCCK..', '..KCcCCCCCK..', '...KCCCCCK...', '....KKKKK....'];
    const LAMP = ['.......K.......', '......KDK......', '.....KKDKK.....', '...KKMMMMMKK...', '.KKHHHMMMMMMKK.', 'KDDDDDDDDDDDDDK', '.KKKKYYYYYKKKK.', '.....KKKKK.....'];
    const CLOCK = ['...KKKKK...', '..KWWWWWK..', '.KWWWKWWWK.', 'KWWWWKWWWWK', 'KWWWWKWWWWK', 'KWWWWKKKWWK', 'KWWWWWWWWWK', 'KWWWWWWWWWK', '.KWWWWWWWK.', '..KWWWWWK..', '...KKKKK...'];
    const ARROW = ['.KKKKK.', '.KYYYK.', '.KYYYK.', 'KKYYYKK', 'KYYYYYK', '.KYYYK.', '..KYK..', '...K...'];
    const TICK = ['......K', '.....KK', 'K...KK.', 'KK.KK..', '.KKK...', '..K....'];
    const pal = () => ({K:P.ink, H:'#FFFFFF', W:'#E6ECF7', S:'#B3BED6', A:g.accent, B:g.accent, Y:P.yel, D:P.dark, N:'#93A0BF', n:'#69758F', M:P.steel, T:'#171A26', R:P.red, r:'#F87171', P:'#E9DFC8', C:P.orange, c:'#FDBA74',
      L:Math.floor(g.t * 2) % 2 ? P.green : '#14532D', G:s.on[0] ? '#FFF3A0' : '#33456F', g:s.on[0] ? '#FFFFFF' : '#5C74A8'});

    const s = {lvl:0, n:3, T:64, gx:GX, gy:GY, tiles:[], order:[], a:0, b:0, phase:'play', time:0, started:false, idle:0, wait:HINT, hint:null, cur:null, age:0, on:[0, 0, 0], solved:false, tip:null, winT:0, flyT:0,
      wrong:() => s.order.find(t => mask(t) !== t.sol)};
    const at = (r, c) => r >= 0 && r < s.n && c >= 0 && c < s.n ? s.tiles[r * s.n + c] : null;
    const mid = t => ({x:GX + (t.col + .5) * s.T, y:GY + (t.row + .5) * s.T});
    const edge = (t, d) => { const m = mid(t); return {x:m.x + STEP[d][1] * s.T / 2, y:m.y + STEP[d][0] * s.T / 2}; };
    const rowY = r => GY + (r + .5) * s.T;
    // the fixed wires: battery to the board, board to the motor, and the wire back that closes the loop
    const leadIn = () => [{x:50, y:288}, {x:50, y:274}, {x:73, y:274}, {x:73, y:rowY(s.a)}, {x:GX, y:rowY(s.a)}];
    const leadOut = () => [{x:GX + 192, y:rowY(s.b)}, {x:287, y:rowY(s.b)}, {x:287, y:354}, {x:298, y:354}];
    const BACK = [{x:300, y:392}, {x:62, y:392}];

    // follow the wire from the battery: every tile it reaches is live, and it is solved if it gets out to the motor
    function trace() {
      for (const t of s.tiles) t.live = 0;
      let r = s.a, c = 0, from = 8, d = 0; s.solved = false; s.tip = {x:GX, y:rowY(s.a)};
      for (;;) {
        const t = at(r, c); if (!t || !(mask(t) & from)) break;
        const out = mask(t) & ~from; t.live = 1; t.from = from; t.out = out; t.d = d++; s.tip = edge(t, out);
        if (r === s.b && c === s.n - 1 && out === 2) { s.solved = true; break; }
        r += STEP[out][0]; c += STEP[out][1]; from = opp(out);
      }
    }
    // a new circuit: walk a random path from the battery side to the motor side, fill the rest with spare pieces, then scramble
    function build(i) {
      const {n, lo, hi} = LV[i]; let path;
      const walk = (r, c) => {
        path.push([r, c]);
        if (r === s.b && c === n - 1) { if (path.length >= lo) return true; }
        else if (path.length < hi) for (const d of mix([1, 2, 4, 8])) { const nr = r + STEP[d][0], nc = c + STEP[d][1]; if (nr >= 0 && nr < n && nc >= 0 && nc < n && !path.some(p => p[0] === nr && p[1] === nc) && walk(nr, nc)) return true; }
        path.pop(); return false;
      };
      do { s.a = g.rnd(n); s.b = g.rnd(n); path = []; } while (!walk(s.a, 0));
      Object.assign(s, {lvl:i, n, T:192 / n, phase:'play', idle:0, age:0, wait:HINT, hint:null, tiles:[]});
      for (let k = 0; k < n * n; k++) s.tiles.push({row:Math.floor(k / n), col:k % n, k:g.rnd(2), rot:0, sol:0, pop:0, live:0});
      s.order = path.map(([r, c], j) => {
        const t = s.tiles[r * n + c], side = q => +Object.keys(STEP).find(d => STEP[d][0] === q[0] - r && STEP[d][1] === q[1] - c);
        t.sol = (j ? side(path[j - 1]) : 8) | (j < path.length - 1 ? side(path[j + 1]) : 2); t.k = t.sol === 5 || t.sol === 10 ? 0 : 1; return t;
      });
      // most of the path starts turned the wrong way, and it never starts solved
      do { for (const t of s.tiles) t.rot = g.rnd(4); mix(s.order.slice()).slice(0, Math.ceil(path.length * .65)).forEach(t => { while (mask(t) === t.sol) t.rot = g.rnd(4); }); trace(); } while (s.solved);
      s.cur = s.order[0]; g.hud('Turn tiles to join the wire.');
    }
    function turn(t) {
      t.rot = (t.rot + 1) % 4; t.pop = .12; s.cur = t; s.started = true; s.idle = 0; trace();
      if (s.solved) { s.on[s.lvl] = 1; s.phase = 'win'; s.winT = 0; s.hint = null; g.hud('Complete circuit! Power on.'); }
      else g.hud(s.order.filter(q => mask(q) !== q.sol).length === 1 ? 'One wrong piece stops it!' : 'Turn tiles to join the wire.');
    }
    build(0); g.score('Time 0:00');
    // the host's row of pads is too wide for four arrows and TURN on a phone, so shrink the buttons until they fit
    const pads = document.querySelector('.pads');
    if (pads && pads.scrollWidth > pads.clientWidth) for (const b of pads.querySelectorAll('button')) { const act = b.classList.contains('act'); b.style.width = act ? 'auto' : '52px'; if (act) { b.style.minWidth = '92px'; b.style.padding = '0 10px'; } }

    function step(dt) {
      for (const t of s.tiles) t.pop = Math.max(0, t.pop - dt);
      if (s.phase === 'win') { s.winT += dt; if (s.winT >= WIN) { if (s.lvl < 2) build(s.lvl + 1); else { s.phase = 'fly'; g.hud('All systems on. Take-off!'); } } return; }
      if (s.phase === 'fly') {
        s.flyT += dt;
        if (s.flyT > 4.4 && !g.over) { const sec = Math.floor(s.time); g.end(sec < T3 ? 3 : sec < T2 ? 2 : 1, `You fixed all 3 circuits in ${sec} seconds and the plane took off.`); }
        return;
      }
      if (s.started) s.time += dt;
      s.idle += dt; s.age += dt; g.score('Time ' + clock(s.time));
      const mv = g.press.u ? 1 : g.press.r ? 2 : g.press.d ? 4 : g.press.l ? 8 : 0;
      if (mv) { s.cur = at(s.cur.row + STEP[mv][0], s.cur.col + STEP[mv][1]) || s.cur; s.idle = 0; }
      if (g.tap) { const t = at(Math.floor((g.tap.y - GY) / s.T), Math.floor((g.tap.x - GX) / s.T)); if (t) turn(t); }
      else if (g.press.a) turn(s.cur);
      if (s.phase !== 'play') return;
      // stuck? flash the first tile on the path that is turned wrong, until it is right
      if (!s.hint && s.idle >= s.wait) { s.hint = s.wrong(); g.hud('Turn the flashing tile.'); }
      else if (s.hint && mask(s.hint) === s.hint.sol) { s.hint = null; s.idle = 0; s.wait = 8; }
    }

    /* ---------- wires ---------- */
    const len = pts => pts.reduce((n, p, i) => i ? n + Math.abs(p.x - pts[i - 1].x) + Math.abs(p.y - pts[i - 1].y) : 0, 0);
    function pos(pts, d) {
      for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i], l = Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
        if (d <= l || i === pts.length - 1) { const k = l ? Math.min(1, d / l) : 0; return {x:a.x + (b.x - a.x) * k, y:a.y + (b.y - a.y) * k}; } d -= l; }
    }
    // a wire along right-angled points: thick insulation with a lighter stripe down it
    function wire(c, pts, w, col, hi) {
      for (const [th, off, cl] of [[w, 0, col], [Math.max(2, w >> 2), -w / 4, hi]]) for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i];
        R(c, Math.min(a.x, b.x) - th / 2 + off, Math.min(a.y, b.y) - th / 2 + off, Math.abs(a.x - b.x) + th, Math.abs(a.y - b.y) + th, cl); }
    }
    // current: bright blocks that run along the wire. start = how far round the whole circuit this wire begins
    function flow(c, pts, start) { const l = len(pts); for (let d = (((g.t * 120 - start) % 48) + 48) % 48; d <= l; d += 48) { const p = pos(pts, d); R(c, p.x - 7, p.y - 7, 14, 14, 'rgba(255,255,255,.45)'); R(c, p.x - 4, p.y - 4, 8, 8, '#fff'); } }
    // joined to the battery but going nowhere yet: dots that blink on the spot
    function charge(c, pts) { const l = len(pts), b = Math.floor(g.t * 3) % 2; for (let d = 8, i = 0; d < l; d += 12, i++) if (i % 2 === b) { const p = pos(pts, d); R(c, p.x - 2, p.y - 2, 4, 4, '#fff'); } }

    function tile(c, t, start) {
      const T = s.T, x = GX + t.col * T, y = GY + t.row * T, k = t.pop > 0 ? 3 : 0, w = T / 4, q = T - 4 - k * 2, on = t.live;
      const ends = on ? [t.from, t.out] : [1, 2, 4, 8].filter(d => mask(t) & d), pts = [edge(t, ends[0]), mid(t), edge(t, ends[1])];
      R(c, x, y, T, T, P.ink); R(c, x + 2 + k, y + 2 + k, q, q, on ? '#12205A' : '#EEF3FF');
      R(c, x + 2 + k, y + 2 + k, q, 2, on ? '#2F449B' : '#fff'); R(c, x + 2 + k, y + 2 + k, 2, q, on ? '#2F449B' : '#fff');
      R(c, x + 2 + k, y + T - 4 - k, q, 2, on ? '#070F33' : '#AEB9D2'); R(c, x + T - 4 - k, y + 2 + k, 2, q, on ? '#070F33' : '#AEB9D2');
      for (const [i, j] of [[7, 7], [T - 10, 7], [7, T - 10], [T - 10, T - 10]]) R(c, x + i, y + j, 3, 3, on ? '#4C63BD' : P.steel);
      wire(c, pts, w, on ? P.yel : '#1B2340', on ? '#FFFBD0' : '#5A6690');
      for (const d of ends) { const e = edge(t, d), dx = STEP[d][1], dy = STEP[d][0];   // bare copper where two tiles join
        R(c, e.x - dx * 4.5 - (dx ? 2.5 : w / 2 + 1), e.y - dy * 4.5 - (dy ? 2.5 : w / 2 + 1), dx ? 5 : w + 2, dy ? 5 : w + 2, on ? '#FF9A3D' : '#B8651F');
        R(c, e.x - dx * 4.5 - (dx ? 2.5 : w / 2 + 1), e.y - dy * 4.5 - (dy ? 2.5 : w / 2 + 1), dx ? 5 : 3, dy ? 5 : 3, on ? '#FFD9A8' : '#E39A52'); }
      if (on) s.solved ? flow(c, pts, start + t.d * T) : charge(c, pts);
    }

    /* ---------- the hangar and the plane ---------- */
    function hangar(c) {
      const open = Math.min(1, s.flyT / 1.2), pl = pal(), blink = Math.floor(g.t * 2) % 2;
      // outside, seen when the doors slide open: sky, clouds, grass and the runway
      R(c, 40, 14, 280, 114, P.sky); ART.cloud(c, 66, 36, .6); ART.cloud(c, 214, 60, .5); R(c, 40, 98, 280, 10, '#7CC08A'); R(c, 40, 106, 280, 22, '#5B6478');
      for (let x = 48; x < 320; x += 36) R(c, x, 115, 18, 3, '#F7F9FC');
      // two big sliding doors with windows and a hazard strip
      for (const x of [40 - open * 142, 180 + open * 142]) {
        R(c, x, 14, 140, 114, '#33406B'); for (let i = 0; i < 14; i++) R(c, x + i * 10, 14, 2, 114, '#3E4D80');
        for (let i = 0; i < 4; i++) { R(c, x + 10 + i * 32, 24, 24, 16, P.ink); R(c, x + 12 + i * 32, 26, 20, 12, '#8CC4EE'); R(c, x + 12 + i * 32, 26, 8, 3, '#D8EEFC'); }
        for (let i = 0; i < 7; i++) { R(c, x + i * 20, 118, 10, 10, P.yel); R(c, x + i * 20 + 10, 118, 10, 10, P.ink); }
        R(c, x, 14, 3, 114, P.ink); R(c, x + 137, 14, 3, 114, P.ink);
      }
      // wall posts: tool board and warning light on the left, charger and its cable on the right
      for (const x of [0, 320]) { R(c, x, 14, 40, 114, '#1A2550'); R(c, x, 14, 3, 114, '#2A3870'); R(c, x + 37, 14, 3, 114, '#0F1738'); }
      ART.map(c, RACK, pl, 1, 22, 3); ART.map(c, CHARGER, pl, 321, 20, 3);
      R(c, 13, 82, 12, 12, P.ink); R(c, 15, 84, 8, 8, blink ? P.red : '#5B1A1A'); R(c, 15, 84, 3, 3, blink ? '#FCA5A5' : '#7F2A2A');
      R(c, 339, 74, 4, 64, P.ink); R(c, 340, 74, 2, 63, P.orange); R(c, 322, 136, 21, 4, P.ink); R(c, 323, 137, 18, 2, P.orange);
      // roof beam, a sagging cable and three hanging lamps
      R(c, 0, 0, 360, 14, '#141C3F'); R(c, 0, 10, 360, 4, P.steel); for (let x = 0; x < 360; x += 24) { R(c, x, 0, 4, 10, P.steel); R(c, x + 8, 3, 12, 3, P.dark); }
      for (let i = 0; i < 9; i++) R(c, 40 + i * 8, 14 + [0, 3, 5, 6, 7, 6, 5, 3, 0][i], 8, 2, P.orange);
      for (const x of [112, 180, 290]) { const dim = x === 290 && Math.floor(g.t * 9) % 23 === 0;
        ART.map(c, LAMP, pl, x - 15, 10, 2); if (!dim) { R(c, x - 12, 26, 24, 102, 'rgba(255,240,160,.08)'); R(c, x - 26, 66, 52, 62, 'rgba(255,240,160,.07)'); } }
      // floor: concrete slabs and a painted guide line
      R(c, 0, 128, 360, 30, '#8F9AB5'); R(c, 0, 128, 360, 3, '#BCC5DA'); for (let x = 30; x < 360; x += 90) R(c, x, 131, 2, 27, P.steel);
      for (let x = 6; x < 360; x += 28) R(c, x, 153, 16, 3, P.yel);
    }
    // a propeller seen from the side: a blade that flickers long and short, a blur and wind streaks when it spins
    function prop(c, x, y, r, on) {
      const f = on ? Math.floor(g.t * 24) % 3 : 0, h = Math.round(r * [1, .62, .28][f]), w = [6, 8, 10][f], bx = x + 3 - w / 2;
      if (on) { R(c, x - 6, y - r + 4, 18, r * 2 - 8, 'rgba(255,255,255,.4)'); R(c, x - 1, y - r - 2, 8, r * 2 + 4, 'rgba(255,255,255,.5)');
        for (let i = 0; i < 3; i++) R(c, x - 20 - (g.t * 170 + i * 23) % 44, y - r + 6 + i * (r - 6), 14, 2, 'rgba(255,255,255,.8)'); }
      R(c, bx - 2, y - h - 2, w + 4, h * 2 + 4, P.ink); R(c, bx, y - h, w, h * 2, '#3A4056'); R(c, bx, y - h, 2, h * 2, P.steel); R(c, bx, y - h, w, 4, P.yel); R(c, bx, y + h - 4, w, 4, P.yel);
      R(c, x - 3, y - 6, 12, 12, P.ink); R(c, x - 1, y - 4, 8, 8, P.yel); R(c, x - 1, y - 4, 3, 3, '#fff');
    }
    function plane(c) {
      const k = Math.max(0, s.flyT - 1), dx = Math.round(46 * k * k), up = Math.round(Math.max(0, dx - 90) * .55), x = 42 + dx, y = 54 - up, blink = Math.floor(g.t * 3) % 2;
      if (!up) R(c, x + 34, 148, 214, 4, 'rgba(11,20,55,.3)');
      if (s.on[0]) { R(c, x + 184, y + 12, 72, 32, 'rgba(255,243,160,.35)'); R(c, x + 274, y + 43, 14, 10, 'rgba(255,243,160,.6)'); }
      prop(c, x + 176, y + 30, 26, s.on[1]);          // left propeller, on the far wing
      ART.map(c, PLANE, pal(), x, y, 4);
      prop(c, x + 148, y + 56, 30, s.on[2]);          // right propeller, on the near wing
      if (s.on[0]) { R(c, x + 266, y + 44, 8, 8, '#fff'); if (blink) { R(c, x + 20, y - 4, 10, 10, P.ink); R(c, x + 22, y - 2, 6, 6, P.red); R(c, x + 42, y + 62, 8, 8, '#86EFAC'); } }
    }
    // which of the three systems are alive, and the one being fixed now
    function chips(c) {
      R(c, 0, 158, 360, 26, P.navy);
      SYS.forEach((q, i) => { const x = 3 + i * 119, on = s.on[i], now = i === s.lvl && !on;
        ART.box(c, x, 160, 116, 22, on ? P.green : now ? '#fff' : '#22306B', 2);
        if (on) ART.map(c, TICK, {K:P.ink}, x + 6, 165, 2); else ART.text(c, String(i + 1), x + 8, 162, 17, now ? P.ink : '#C3CCE3');
        ART.text(c, q.n, x + 26, 162, 17, on || now ? P.ink : '#C3CCE3'); });
      if (s.phase === 'win' && s.winT > .3) { ART.box(c, 40, 16, 280, 34, '#fff', 3, 4); ART.map(c, TICK, {K:P.green}, 52, 25, 3); ART.text(c, SYS[s.lvl].on, 192, 20, 24, P.navy, 'center'); }
    }

    /* ---------- the bench: battery, board of tiles, motor ---------- */
    function bench(c) {
      const pl = pal(), spin = s.solved, live = s.tiles.filter(t => t.live).length, A = leadIn(), B = leadOut(), la = len(A), lb = la + live * s.T;
      R(c, 0, 184, 360, 212, '#1B2A63'); for (let y = 192; y < 392; y += 14) for (let x = 6; x < 360; x += 14) R(c, x, y, 2, 2, '#121C4A');
      // power gauge: how much of the path is live
      ART.text(c, 'POWER', 36, 188, 15, '#fff', 'center'); R(c, 20, 206, 32, 62, P.ink);
      for (let i = 0; i < 5; i++) { const lit = spin || i < Math.round(live / s.order.length * 5); R(c, 23, 256 - i * 12, 26, 9, lit ? P.yel : P.dark); if (lit) R(c, 23, 256 - i * 12, 26, 2, '#FFFBD0'); }
      // a shelf of spare wire
      R(c, 294, 250, 62, 5, P.ink); R(c, 295, 251, 60, 2, P.silver);
      [[298, P.red, '#F87171'], [328, P.blue, '#6C8BF5']].forEach(([x, a, b]) => { R(c, x, 218, 24, 32, P.ink); R(c, x + 2, 222, 20, 24, a); R(c, x + 2, 222, 5, 24, b); for (let y = 226; y < 244; y += 5) R(c, x + 2, y, 20, 1, P.ink); R(c, x + 1, 219, 22, 3, P.steel); R(c, x + 1, 246, 22, 3, P.steel); });
      // battery pack with a charge meter, and the motor with a fan on its shaft
      ART.map(c, BATT, pl, 4, 284, 4); R(c, 45, 303, 10, 2, '#fff'); R(c, 49, 299, 2, 10, '#fff');
      for (let i = 0; i < 4; i++) { const lit = spin ? (i + Math.floor(g.t * 6)) % 4 > 0 : i > 0 || Math.floor(g.t * 2) % 2; R(c, 18, 310 + i * 10, 36, 8, lit ? P.green : '#14532D'); if (lit) R(c, 18, 310 + i * 10, 36, 2, '#86EFAC'); }
      ART.map(c, MOTOR, pl, 292 + (spin ? Math.floor(g.t * 30) % 2 : 0), 316, 4); ART.map(c, FAN[spin ? Math.floor(g.t * 14) % 2 : 0], {K:P.ink, F:P.silver, H:P.yel}, 302, 274, 4);
      // the board and its tiles
      ART.box(c, GX - 6, GY - 6, 204, 204, P.steel, 3, 4); for (const t of s.tiles) tile(c, t, la);
      wire(c, A, 8, spin ? '#FF6B5E' : '#C62828', '#FFB4AD'); wire(c, B, 8, spin ? '#5FB2FF' : P.blue, '#B5D2FF'); wire(c, BACK, 6, spin ? '#E6ECF7' : '#4A5270', spin ? '#fff' : '#8A93AE');
      for (const p of [A[0], B[3], BACK[0], BACK[1]]) { R(c, p.x - 6, p.y - 6, 12, 12, P.ink); R(c, p.x - 4, p.y - 4, 8, 8, '#E39A52'); }
      if (spin) { flow(c, A, 0); flow(c, B, lb); flow(c, BACK, lb + len(B)); } else charge(c, A);
      if (s.phase !== 'play') return;
      // a spark where the power stops
      const p = s.tip, f = Math.floor(g.t * 10) % 2;
      R(c, p.x - 4 - f, p.y - 10, 8 + f * 2, 20, P.ink); R(c, p.x - 10, p.y - 4 - f, 20, 8 + f * 2, P.ink); R(c, p.x - 2 - f, p.y - 8, 4 + f * 2, 16, P.yel); R(c, p.x - 8, p.y - 2 - f, 16, 4 + f * 2, P.yel); R(c, p.x - 2, p.y - 2, 4, 4, '#fff');
      const T = s.T, mark = (t, col, th, o, L) => { const x = GX + t.col * T, y = GY + t.row * T; for (const sx of [0, 1]) for (const sy of [0, 1]) { R(c, x + (sx ? T - o - L : o), y + (sy ? T - o - th : o), L, th, col); R(c, x + (sx ? T - o - th : o), y + (sy ? T - o - L : o), th, L, col); } };
      // the hint: a flashing frame and a bouncing arrow
      if (s.hint) { const b = Math.floor(g.t * 4) % 2, x = GX + s.hint.col * T, y = GY + s.hint.row * T;
        for (const [o, th, col] of [[-4, 8, P.ink], [-2, 4, b ? P.yel : P.orange]]) { R(c, x + o, y + o, T - o * 2, th, col); R(c, x + o, y + T - o - th, T - o * 2, th, col); R(c, x + o, y + o, th, T - o * 2, col); R(c, x + T - o - th, y + o, th, T - o * 2, col); }
        ART.map(c, ARROW, {K:P.ink, Y:P.yel}, GX + (s.hint.col + .5) * T - 10, GY + s.hint.row * T - 18 + b * 6, 3); }
      // the cursor for the arrow keys
      if (s.cur !== s.hint) { mark(s.cur, P.ink, 6, -2, 16); mark(s.cur, '#fff', 2, 0, 12); }
    }
    // bench front: the player at the switch, and the clock that shows the stars left to win
    function front(c) {
      const cheer = s.phase !== 'play', t = g.t, now = s.time < T3 ? 3 : s.time < T2 ? 2 : 1;
      R(c, 0, 396, 360, 8, P.silver); R(c, 0, 396, 360, 2, '#fff'); R(c, 0, 402, 360, 2, P.steel); R(c, 0, 404, 360, 76, P.dark); R(c, 0, 404, 360, 3, '#1D2338');
      for (let x = 0; x < 360; x += 20) { R(c, x, 474, 10, 6, P.yel); R(c, x + 10, 474, 10, 6, P.ink); }
      // switch box: the lever goes up and the lamp turns on when a circuit is complete
      R(c, 56, 426, 30, 44, P.ink); R(c, 58, 428, 26, 40, P.steel); R(c, 58, 428, 26, 3, P.silver); R(c, 64, 432, 14, 8, P.ink); R(c, 66, 434, 10, 4, cheer ? P.green : '#5B1A1A');
      R(c, 68, 444, 6, 20, P.ink); R(c, 44, cheer ? 442 : 458, 30, 7, P.ink); R(c, 46, cheer ? 444 : 460, 26, 3, P.silver); R(c, 44, cheer ? 440 : 456, 10, 11, P.ink); R(c, 46, cheer ? 442 : 458, 6, 7, P.yel);
      ART.char(c, g.av, 2, cheer ? 396 - Math.abs(Math.sin(t * 9)) * 10 : 396 + Math.floor(t * 2) % 2, 3, {accent:g.accent, frame:cheer ? 1 + Math.floor(t * 6) % 2 : 0});
      ART.box(c, 94, 410, 262, 62, '#fff', 3);
      ART.map(c, CLOCK, {K:P.ink, W:P.pale}, 102, 416, 2); ART.text(c, clock(s.time), 132, 412, 28, P.navy);
      for (let i = 0; i < 3; i++) ART.star(c, 262 + i * 30, 417, 2, i < now);
      ART.text(c, now === 3 ? `Under ${T3} seconds: 3 stars` : now === 2 ? `Under ${T2} seconds: 2 stars` : 'Finish the job: 1 star', 102, 446, 17, P.ink);
    }
    function draw(c) { hangar(c); plane(c); chips(c); bench(c); front(c); }
    return {s, step, draw};
  },
  // test robot: a careful player who fixes the path one tile at a time from the battery end. It taps, and on circuit 2 it uses the arrow keys and TURN.
  auto(g, game) {
    const s = game.s, t = s.phase === 'play' && s.wrong();
    if (!t || s.age < 5) return;                                     // it looks at each new board first
    if (s.lvl !== 1) { if (s.idle >= 1.5) g.tap = {x:s.gx + (t.col + .5) * s.T, y:s.gy + (t.row + .5) * s.T}; }
    else if (s.cur !== t) { if (s.idle >= .35) g.press[s.cur.col < t.col ? 'r' : s.cur.col > t.col ? 'l' : s.cur.row < t.row ? 'd' : 'u'] = 1; }
    else if (s.idle >= 1.2) g.press.a = 1;
  },
};
