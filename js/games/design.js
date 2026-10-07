'use strict';
/* Aerospace engineer: design an engine, then test-fly it. Top-down flight: steer through gates, grab fuel, dodge storms. */
GAMES.design = {
  title:'Test flight',
  how:['Pick a fan and a blade for your engine.', 'Steer through the yellow gates. 15 of 18 earns 3 stars.', 'Grab fuel cans. Keep away from storm clouds.'],
  pads:'lr',
  make(g) {
    const P = ART.P, N = 18, GAP = g.easy ? 124 : 100, SPEED = g.easy ? 120 : 160, PY = 372;
    const SIZE = [{n:'Small fan', use:1.35, d:'Uses lots of fuel'}, {n:'Medium fan', use:1.1, d:'In between'}, {n:'Large fan', use:.88, d:'Sips fuel'}];
    const MAT = [{n:'Steel', turn:.72, d:'Heavy: slow to turn', c:'#7C879F'}, {n:'Titanium', turn:.9, d:'Lighter', c:'#B6C0D4'}, {n:'Carbon fibre', turn:1.1, d:'Very light: quick to turn', c:'#2B3350'}];
    const PLANE = ['.......W.......', '......WWW......', '......WGW......', '.....WWGWW.....', '.....WWGWW.....', '.....WWWWW.....', '....SWWWWWS....', '...SSWWWWWSS...', '..SSSWWAWWSSS..', '.SSSSWWAWWSSSS.', 'SSSEEWWAWWEESSS', 'TSSEEWWAWWEESST', '...EEWWWWWEE...', '...DDWWWWWDD...', '.....WWWWW.....', '.....WWWWW.....', '....SWWWWWS....', '...SSSWAWSSS...', '...TSS.A.SST...', '.......A.......'];
    const s = {phase:'design', size:1, mat:1, x:180, fuel:1, dist:0, passed:0, hits:0, shake:0, out:false, gates:[], cans:[], storms:[], btn:[]};
    for (let i = 0; i < N; i++) {
      const d = 420 + i * 430, x = 70 + g.rnd(221);
      s.gates.push({d, x, done:0});
      if (i % 2 === 0 || i > 8) s.cans.push({d:d + 215, x:50 + g.rnd(261), got:false});
      for (let k = 0; k < (i >= 9 ? 2 : i >= 2 ? 1 : 0); k++) { let sx; do { sx = 50 + g.rnd(261); } while (Math.abs(sx - x) < 95); s.storms.push({d:d - 130 - k * 110, x:sx, hit:false}); }
    }
    const END = 420 + N * 430 + 260, FIELD = ['#5FAE57', '#74BD5C', '#8CCB62', '#C9D46A', '#4E9A51', '#A7C957'];
    const hash = n => { n = Math.sin(n * 127.1) * 43758.5453; return n - Math.floor(n); }, SHADE = {W:'rgba(11,20,55,.22)'};
    for (const k of 'SGAEDT') SHADE[k] = SHADE.W;
    const pal = () => ({W:'#F7F9FC', S:'#C9D1E3', G:'#7DD3FC', A:g.accent, E:MAT[s.mat].c, D:'#171A26', T:P.yel});
    const fly = () => { s.phase = 'fly'; g.hud('Fly through the yellow gates!'); };
    g.hud('Tap a fan and a blade, then FLY.'); g.score('');

    function step(dt) {
      s.shake = Math.max(0, s.shake - dt);
      if (s.phase === 'design') {
        if (g.press.l) s.size = (s.size + 2) % 3; if (g.press.r) s.size = (s.size + 1) % 3;
        if (g.press.u) s.mat = (s.mat + 2) % 3; if (g.press.d) s.mat = (s.mat + 1) % 3;
        if (g.tap) for (const b of s.btn) if (g.tap.x >= b.x && g.tap.x <= b.x + b.w && g.tap.y >= b.y && g.tap.y <= b.y + b.h) { if (b.k === 'fly') fly(); else s[b.k] = b.v; }
        if (g.press.a) fly();
        return;
      }
      if (g.over) return;
      const turn = 250 * MAT[s.mat].turn, want = g.ptr.down ? Math.max(-1, Math.min(1, (g.ptr.x - s.x) / 14)) : (g.key.r ? 1 : 0) - (g.key.l ? 1 : 0);
      s.x = Math.max(28, Math.min(332, s.x + want * turn * dt));
      const v = s.out ? Math.max(0, SPEED * (1 - (s.outT += dt) / 1.6)) : SPEED;
      s.dist += v * dt;
      if (!s.out) { s.fuel -= dt * SIZE[s.size].use / 36; if (s.fuel <= 0) { s.fuel = 0; s.out = true; s.outT = 0; g.hud('Out of fuel! Gliding down...'); } }
      for (const q of s.gates) if (!q.done && q.d <= s.dist) { q.done = Math.abs(q.x - s.x) < GAP / 2 ? 1 : -1; if (q.done > 0) s.passed++; g.score(`Gates ${s.passed}/${N}`); if (q === s.gates[8]) g.hud('Leg 2: storm front ahead!'); }
      for (const q of s.cans) if (!q.got && Math.abs(q.d - s.dist) < 30 && Math.abs(q.x - s.x) < 32) { q.got = true; s.fuel = Math.min(1, s.fuel + .24); }
      for (const q of s.storms) if (!q.hit && Math.abs(q.d - s.dist) < 34 && Math.abs(q.x - s.x) < 44) { q.hit = true; s.hits++; s.fuel = Math.max(.02, s.fuel - .1); s.shake = .5; g.hud('Storm! That cost you fuel.'); }
      if (s.dist >= END || (s.out && v <= 0)) {
        const landed = s.dist >= END;
        g.end(s.passed >= 15 ? 3 : s.passed >= 10 ? 2 : 1, `You flew through ${s.passed} of ${N} gates${landed ? ' and landed safely' : ' before the fuel ran out'}.`);
      }
    }

    function draw(c) {
      const t = g.t, R = ART.r, sy = d => PY - (d - s.dist), ox = s.shake > 0 ? Math.round(Math.sin(t * 60) * 4) : 0;
      // the countryside far below: fields, a river, a road and villages, drifting past slowly
      const off = s.dist * .3, r0 = Math.floor(off / 72);
      R(c, 0, 0, 360, 480, '#5FAE57');
      for (let r = r0 - 1; r <= r0 + 7; r++) {
        const y = 408 - r * 72 + off; let x = -8, k = 0;
        while (x < 360) { const w = 46 + Math.floor(hash(r * 13 + k) * 72); R(c, x, y, w - 3, 69, FIELD[Math.floor(hash(r * 7 + k * 3) * FIELD.length)]); if (hash(r * 5 + k) > .7) for (let j = 8; j < w - 8; j += 10) R(c, x + j, y + 6, 3, 57, 'rgba(0,0,0,.07)'); x += w; k++; }
        const rx = 250 + Math.round(Math.sin(r * .8) * 46), nx = 250 + Math.round(Math.sin((r + 1) * .8) * 46);
        R(c, rx, y, 20, 72, '#3B8FD9'); R(c, Math.min(rx, nx), y, Math.abs(nx - rx) + 20, 14, '#3B8FD9'); R(c, rx + 4, y + 20, 4, 30, '#7CC0F5');
        R(c, 84 + Math.round(Math.sin(r * .5) * 18), y, 7, 72, '#9AA3B5');
        if (hash(r * 3.1) > .55) { const hx = 20 + Math.floor(hash(r * 9.7) * 40); for (let j = 0; j < 3; j++) { R(c, hx + j * 16, y + 20 + (j % 2) * 14, 12, 12, '#7C2D12'); R(c, hx + j * 16, y + 20 + (j % 2) * 14, 12, 5, '#DC6B3A'); } }
      }
      R(c, 0, 0, 360, 480, 'rgba(155,216,255,.28)');
      for (let i = 0; i < 6; i++) { const cx = (i * 173) % 320 - 20, cy = ((i * 151 + s.dist * .7) % 640) - 90, k = 1 + (i % 2) * .5; R(c, cx + 14, cy + 22, 72 * k, 14 * k, 'rgba(11,20,55,.12)'); ART.cloud(c, cx, cy, k); }
      if (s.phase === 'design') return drawDesign(c);
      c.save(); c.translate(ox, 0);
      // runway at the end
      const ry = sy(END + 60);
      if (ry > -500) { R(c, 110, ry - 400, 140, 520, '#3A4056'); for (let y = ry - 380; y < ry + 100; y += 48) R(c, 176, y, 8, 26, '#F7F9FC'); R(c, 110, ry + 60, 140, 8, P.yel); }
      for (const q of s.gates) { const y = sy(q.d); if (y < -30 || y > 510) continue; const col = q.done > 0 ? P.green : q.done < 0 ? '#94A3B8' : P.yel;
        R(c, q.x - GAP / 2, y - 3, GAP, 6, q.done ? col : 'rgba(245,225,43,.45)');
        for (const px of [q.x - GAP / 2 - 12, q.x + GAP / 2]) { R(c, px - 2, y - 14, 16, 28, P.ink); R(c, px, y - 12, 12, 24, col); R(c, px, y - 4, 12, 8, P.ink); } }
      for (const q of s.cans) { const y = sy(q.d) + Math.round(Math.sin(t * 5 + q.x) * 2); if (q.got || y < -30 || y > 510) continue;
        R(c, q.x - 11, y - 14, 22, 28, P.ink); R(c, q.x - 9, y - 12, 18, 24, '#22C55E'); R(c, q.x - 9, y - 12, 18, 5, '#BBF7D0'); R(c, q.x - 4, y - 18, 8, 6, P.ink); R(c, q.x - 3, y - 3, 6, 8, '#fff'); }
      for (const q of s.storms) { const y = sy(q.d); if (y < -60 || y > 540) continue;
        R(c, q.x - 44, y - 16, 88, 34, '#475569'); R(c, q.x - 30, y - 30, 56, 16, '#475569'); R(c, q.x - 44, y + 8, 88, 10, '#334155');
        if (Math.floor(t * 6 + q.x) % 3 === 0) { R(c, q.x - 4, y + 16, 8, 10, P.yel); R(c, q.x - 10, y + 24, 8, 10, P.yel); R(c, q.x - 4, y + 32, 6, 10, P.yel); } }
      // the jet, with engine flames
      const px = Math.round(s.x) - 30;
      ART.map(c, PLANE, SHADE, px + 22, PY - 10, 3);
      if (!s.out) for (const fx of [12, 40]) { const h = 10 + (Math.floor(t * 20) % 3) * 5; R(c, px + fx, PY + 16, 8, h, P.orange); R(c, px + fx + 2, PY + 16, 4, h - 5, P.yel); R(c, px + fx + 2, PY + 30 + h, 4, 14, 'rgba(255,255,255,.5)'); }
      ART.map(c, PLANE, pal(), px, PY - 40, 4);
      c.restore();
      // cockpit HUD: pilot, fuel, how far
      ART.box(c, 6, 6, 348, 46, 'rgba(255,255,255,.92)', 3);
      ART.head(c, g.av, 10, 9, 2.5, {accent:g.accent});
      ART.text(c, 'FUEL', 58, 10, 16, P.navy); ART.bar(c, 58, 28, 130, 16, s.fuel, s.fuel > .3 ? P.green : P.red);
      ART.text(c, 'RUNWAY', 204, 10, 16, P.navy); ART.bar(c, 204, 28, 142, 16, s.dist / END, P.blue);
    }

    function drawDesign(c) {
      const R = ART.r; s.btn = [];
      ART.box(c, 12, 10, 336, 150, '#fff', 4, 5);
      ART.head(c, g.av, 20, 18, 3, {accent:g.accent});
      ART.wrap(c, 'Chief Designer, pick your engine. Bigger fans use less fuel. Lighter blades turn faster.', 76, 18, 262, 19, P.ink);
      ART.text(c, 'Fuel use', 22, 108, 17, P.navy); ART.bar(c, 96, 110, 240, 14, SIZE[s.size].use / 1.5, SIZE[s.size].use > 1.2 ? P.red : P.green);
      ART.text(c, 'Turning', 22, 132, 17, P.navy); ART.bar(c, 96, 134, 240, 14, MAT[s.mat].turn / 1.2, MAT[s.mat].turn < .8 ? P.red : P.green);
      const rowOf = (list, k, y, label) => {
        ART.text(c, label, 14, y - 22, 20, P.navy);
        list.forEach((o, i) => { const x = 12 + i * 114, on = s[k] === i; s.btn.push({x, y, w:108, h:66, k, v:i});
          ART.box(c, x, y, 108, 66, on ? P.yel : '#fff', 4, on ? 0 : 4); ART.text(c, o.n, x + 54, y + 8, 19, P.ink, 'center'); ART.wrap(c, o.d, x + 54, y + 28, 98, 15, '#334155', 'center'); });
      };
      rowOf(SIZE, 'size', 192, 'Fan'); rowOf(MAT, 'mat', 290, 'Blades');
      // the jet on the runway and the FLY button
      const pulse = Math.floor(g.t * 3) % 2;
      s.btn.push({x:190, y:380, w:158, h:84, k:'fly'});
      ART.box(c, 190, 380 + pulse * 2, 158, 84, P.blue, 4, 5); ART.text(c, 'FLY!', 269, 400 + pulse * 2, 44, '#fff', 'center');
      ART.box(c, 12, 372, 166, 100, '#3A4056', 4); for (let x = 24; x < 166; x += 34) R(c, x, 458, 18, 5, '#F7F9FC');
      ART.map(c, PLANE, pal(), 65, 382, 4);
    }
    return {s, step, draw};
  },
  // test robot: best design, then steer for the next gate (or a fuel can when low) and away from storms
  auto(g, game) {
    const s = game.s;
    if (s.phase === 'design') { s.size = 2; s.mat = 2; g.press.a = 1; return; }
    const ahead = q => q.d > s.dist + 6, gate = s.gates.find(q => !q.done && ahead(q)), can = s.cans.find(q => !q.got && ahead(q));
    let tx = gate ? gate.x : 180;
    if (can && (!gate || can.d < gate.d - 60) && (s.fuel < .75 || !gate)) tx = can.x;
    const storm = s.storms.find(q => !q.hit && q.d > s.dist - 30 && q.d < s.dist + 120 && Math.abs(q.x - s.x) < 60);
    if (storm && (!gate || gate.d - s.dist > 140)) tx = storm.x > s.x ? storm.x - 80 : storm.x + 80;
    g.key.l = s.x > tx + 5 ? 1 : 0; g.key.r = s.x < tx - 5 ? 1 : 0;
  },
};
