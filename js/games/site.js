'use strict';
/* The site: a platform level that joins the six jobs together. Run and jump your character round the site,
   collect bolts, and go through a door to do that engineer's job. Not scored: it never ends by itself. */
GAMES.site = {
  title:'The site',
  how:['Run and jump around the site.', 'Stand at a door and press up to go in.', 'Collect bolts on the way.'],
  pads:'lru' + 'a', action:'JUMP',
  make(g) {
    const P = ART.P, R = ART.r, T = 32, GY = 13 * T, PW = 20, PH = 50, RUN = g.easy ? 140 : 175, JUMP = 640, GRAV = 1900;
    const NAMES = {design:'Design Hangar', software:'Code Lab', materials:'Materials Lab', manufacturing:'Factory', electrical:'Power Lab', sustainability:'Green Zone'};
    // your own building is nearest the gate; the other five carry on to the right
    const mine = S.ranked[0], order = mine ? [mine, ...ROLE_IDS.filter(id => id !== mine)] : ROLE_IDS.slice();
    const B = order.map((id, i) => ({id, x0:10 + i * 16, r:ROLES[id], name:NAMES[id]})), W = 10 + 6 * 16;
    // what is solid: the ground (with two pits), each roof, one stack of crates per building, one floating block pair
    const solid = new Set(), put = (x, y) => solid.add(x + ',' + y), pits = new Set();
    for (const i of [1, 3]) { pits.add(B[i].x0 + 12); pits.add(B[i].x0 + 13); }
    for (let x = 0; x < W; x++) if (!pits.has(x)) { put(x, 13); put(x, 14); }
    const bolts = [];
    B.forEach((b, i) => {
      for (let x = b.x0; x < b.x0 + 8; x++) put(x, 9);
      put(b.x0 + 9, 12); put(b.x0 + 9, 11); put(b.x0 + 3, 6); put(b.x0 + 4, 6);
      for (const [x, y] of [[1.5, 8], [4, 8], [6.5, 8], [4, 5], [9.5, 9.5], [-1.5, 12], [11, 12]]) bolts.push({x:(b.x0 + x) * T, y:y * T + 16});
      if (pits.has(b.x0 + 12)) bolts.push({x:(b.x0 + 13) * T, y:10 * T + 16});
    });
    const site = S.site || (S.site = {got:{}, at:null}), from = B.find(b => b.id === site.at);
    const s = {x:from ? (from.x0 + 3.7) * T : 2 * T, y:GY - PH, vx:0, vy:0, ground:true, face:1, walk:0, cam:0, coy:0, jbuf:0, safe:0, flash:0, door:null, goal:mine || order[0], cheer:0};
    s.safe = s.x; s.cam = Math.max(0, Math.min(W * T - g.W, s.x + PW / 2 - g.W * .42));
    const hit = (tx, ty) => tx < 0 || tx >= W || (ty >= 0 && solid.has(tx + ',' + ty));
    const count = () => Object.keys(site.got).length;
    g.score(`Bolts ${count()}/${bolts.length}`);

    function step(dt) {
      s.flash = Math.max(0, s.flash - dt); s.cheer = Math.max(0, s.cheer - dt);
      const want = (g.key.r ? 1 : 0) - (g.key.l ? 1 : 0), acc = (s.ground ? 2200 : 1400) * dt;
      s.vx += Math.max(-acc, Math.min(acc, want * RUN - s.vx)); if (want) s.face = want;
      if (g.press.a) s.jbuf = .12; else s.jbuf -= dt;
      s.coy = s.ground ? .1 : s.coy - dt;
      if (s.jbuf > 0 && s.coy > 0) { s.vy = -JUMP; s.jbuf = 0; s.coy = 0; s.ground = false; }
      if (!g.key.a && s.vy < -260) s.vy = -260;
      s.vy = Math.min(900, s.vy + GRAV * dt);
      // sideways, then up and down, against the tile grid
      const rows = () => { const a = []; for (let y = Math.floor(s.y / T); y <= Math.floor((s.y + PH - .01) / T); y++) a.push(y); return a; };
      const cols = () => { const a = []; for (let x = Math.floor(s.x / T); x <= Math.floor((s.x + PW - .01) / T); x++) a.push(x); return a; };
      s.x += s.vx * dt;
      if (s.vx > 0) { const tx = Math.floor((s.x + PW) / T); if (rows().some(y => hit(tx, y))) { s.x = tx * T - PW - .01; s.vx = 0; } }
      else if (s.vx < 0) { const tx = Math.floor(s.x / T); if (rows().some(y => hit(tx, y))) { s.x = (tx + 1) * T; s.vx = 0; } }
      s.y += s.vy * dt; s.ground = false;
      if (s.vy > 0) { const ty = Math.floor((s.y + PH) / T); if (cols().some(x => hit(x, ty))) { s.y = ty * T - PH; s.vy = 0; s.ground = true; } }
      else if (s.vy < 0) { const ty = Math.floor(s.y / T); if (cols().some(x => hit(x, ty))) { s.y = (ty + 1) * T; s.vy = 0; } }
      if (s.ground && Math.abs(s.vx) > 20) s.walk += dt * Math.abs(s.vx) / 22;
      const mid = s.x + PW / 2, onFloor = s.ground && s.y + PH === GY;
      if (onFloor && !pits.has(Math.floor((mid - 40) / T)) && !pits.has(Math.floor((mid + 40) / T))) s.safe = s.x;
      if (s.y > 15 * T + 60) { s.x = s.safe; s.y = GY - PH; s.vx = s.vy = 0; s.flash = .7; g.hud('Splash! Jump the gaps.'); }
      bolts.forEach((b, i) => { if (!site.got[i] && Math.abs(b.x - mid) < 20 && Math.abs(b.y - (s.y + PH / 2)) < 34) { site.got[i] = 1; g.score(`Bolts ${count()}/${bolts.length}`); if (count() === bolts.length) { s.cheer = 3; g.hud('Every bolt found. Wow!'); } } });
      // doors: stand in front and press up (or tap the canvas) to go in
      s.door = onFloor ? B.find(b => mid > (b.x0 + 3) * T - 6 && mid < (b.x0 + 5) * T + 6) || null : null;
      if (s.door) { g.hud(`Press up: ${s.door.name}`); if (g.press.u || g.tap) return siteEnter(s.door.id); }
      else if (s.cheer <= 0 && s.flash <= 0) g.hud(mine ? `Your job: the ${NAMES[mine]}` : 'Pick a building. Press up to go in.');
      const target = Math.max(0, Math.min(W * T - g.W, mid - g.W * .42));
      s.cam += (target - s.cam) * Math.min(1, dt * 8);
    }

    // one building: wall, sign, windows, a door in the engineer's colour, and something on the roof that says what happens inside
    function building(c, b, x, t) {
      const y = 10 * T, col = b.r.c, dk = b.r.cd;
      R(c, x - 2, y, 8 * T + 4, 3 * T, P.ink); R(c, x, y + 2, 8 * T, 3 * T - 2, '#E6EBF7'); R(c, x, y + 2, 8 * T, 26, col); R(c, x, y + 28, 8 * T, 3, dk);
      R(c, x + 8 * T - 10, y + 31, 10, 3 * T - 31, 'rgba(11,20,55,.12)');
      ART.text(c, b.name.toUpperCase(), x + 4 * T, y + 4, 22, '#fff', 'center');
      for (const wx of [14, 54, 170, 210]) { const lit = Math.floor(t * .7 + wx + b.x0) % 5 !== 0; R(c, x + wx - 2, y + 40, 32, 34, P.ink); R(c, x + wx, y + 42, 28, 30, lit ? '#FDE68A' : '#9BD8FF'); R(c, x + wx + 13, y + 42, 2, 30, P.ink); R(c, x + wx, y + 56, 28, 2, P.ink); R(c, x + wx, y + 42, 12, 4, 'rgba(255,255,255,.6)'); }
      R(c, x + 3 * T - 6, y + 30, 2 * T + 12, 66, P.ink); R(c, x + 3 * T - 2, y + 34, 2 * T + 4, 62, col); R(c, x + 3 * T + 4, y + 40, 2 * T - 8, 56, '#14275E'); R(c, x + 4 * T - 1, y + 40, 2, 56, P.ink);
      R(c, x + 3 * T + 10, y + 46, 16, 20, '#7DD3FC'); R(c, x + 4 * T + 6, y + 46, 16, 20, '#7DD3FC'); R(c, x + 4 * T - 8, y + 70, 4, 6, P.yel); R(c, x + 4 * T + 4, y + 70, 4, 6, P.yel);
      const ry = 9 * T;   // roof-top props sit behind the roof slab
      if (b.id === 'design') { R(c, x + 200, ry - 60, 6, 60, P.ink); const k = Math.floor(t * 4) % 2; R(c, x + 206, ry - 58, 30, 12, P.orange); R(c, x + 216, ry - 58, 8, 12, '#fff'); R(c, x + 230, ry - 58 + k * 2, 14, 10, P.orange); R(c, x + 30, ry - 34, 60, 34, '#C9D1E3'); R(c, x + 30, ry - 44, 14, 12, col); R(c, x + 40, ry - 24, 40, 6, P.ink); }
      else if (b.id === 'software') { R(c, x + 40, ry - 50, 4, 50, P.ink); R(c, x + 24, ry - 62, 36, 14, '#C9D1E3'); R(c, x + 24, ry - 62, 36, 4, '#fff'); if (Math.floor(t * 2) % 2) R(c, x + 38, ry - 70, 8, 8, P.red); R(c, x + 190, ry - 40, 44, 40, P.ink); R(c, x + 194, ry - 36, 36, 28, '#0B1B4D'); for (let i = 0; i < 4; i++) R(c, x + 198 + i * 8, ry - 14 - ((i * 7 + Math.floor(t * 3)) % 4) * 5, 5, 4 + ((i * 7 + Math.floor(t * 3)) % 4) * 5, P.green); }
      else if (b.id === 'materials') { R(c, x + 196, ry - 70, 26, 70, P.ink); R(c, x + 199, ry - 67, 20, 67, '#9AA3B5'); R(c, x + 199, ry - 67, 20, 8, P.red); for (let i = 0; i < 3; i++) { const k = (t * 22 + i * 26) % 70; R(c, x + 202 + (i % 2) * 8, ry - 76 - k, 10, 8, `rgba(255,255,255,${.7 - k / 110})`); } R(c, x + 36, ry - 30, 30, 30, P.ink); R(c, x + 39, ry - 27, 24, 24, P.orange); R(c, x + 45, ry - 21, 12, 12, P.yel); }
      else if (b.id === 'manufacturing') { for (let i = 0; i < 4; i++) { const sx = x + 18 + i * 56; R(c, sx, ry - 16, 52, 16, P.ink); R(c, sx + 2, ry - 14, 48, 14, '#9AA3B5'); for (let k = 0; k < 4; k++) R(c, sx + 2 + k * 12, ry - 14 - (4 - k) * 8, 12, (4 - k) * 8, k === 0 ? '#7DD3FC' : '#56617F'); } }
      else if (b.id === 'electrical') { R(c, x + 206, ry - 84, 6, 84, P.ink); R(c, x + 192, ry - 84, 34, 5, P.ink); R(c, x + 196, ry - 62, 26, 5, P.ink); for (const dx of [192, 222]) R(c, x + dx, ry - 79, 4, 8, '#7DD3FC'); R(c, x + 34, ry - 46, 40, 46, P.ink); R(c, x + 37, ry - 43, 34, 40, P.yel); R(c, x + 54, ry - 38, 8, 12, P.ink); R(c, x + 48, ry - 28, 12, 6, P.ink); R(c, x + 46, ry - 22, 8, 14, P.ink); if (Math.floor(t * 5) % 3 === 0) R(c, x + 208, ry - 92, 4, 6, P.yel); }
      else { R(c, x + 208, ry - 96, 6, 96, '#F7F9FC'); R(c, x + 206, ry - 96, 10, 4, P.ink); const k = Math.floor(t * 6) % 4, arm = [[0, -30, 6, 30], [0, 0, 30, 6], [0, 0, 6, 30], [-30, 0, 30, 6]]; for (let i = 0; i < 4; i += 2) { const a = arm[(k + i) % 4]; R(c, x + 208 + a[0], ry - 98 + a[1], a[2], a[3], '#F7F9FC'); } R(c, x + 206, ry - 100, 10, 10, P.ink); for (let i = 0; i < 3; i++) { R(c, x + 22 + i * 44, ry - 22, 40, 22, P.ink); R(c, x + 24 + i * 44, ry - 20, 36, 18, '#1D3FBF'); R(c, x + 24 + i * 44, ry - 20, 36, 3, '#7DD3FC'); R(c, x + 41 + i * 44, ry - 20, 2, 18, P.ink); } }
    }

    function draw(c) {
      const t = g.t, cam = Math.round(s.cam);
      R(c, 0, 0, 360, 480, '#9BD8FF'); R(c, 0, 300, 360, 180, '#BFE6FF');
      for (let i = 0; i < 9; i++) ART.cloud(c, ((i * 230 - cam * .25) % 2070 + 2070) % 2070 - 120, 40 + (i % 4) * 48, 1 + (i % 2) * .4);
      for (let i = 0; i < 30; i++) { const x = Math.round(i * 130 - cam * .5), h = 70 + (i * 53) % 90; if (x > -90 && x < 370) { R(c, x, GY - h, 86, h, '#A9CCF2'); R(c, x + 10, GY - h - 12, 30, 12, '#A9CCF2'); for (let k = 0; k < 3; k++) R(c, x + 10 + k * 24, GY - h + 14, 14, 10, '#C6DEF8'); } }
      c.save(); c.translate(-cam, 0);
      const x0 = Math.floor(cam / T), x1 = x0 + 13;
      // the gate, lamp posts and bushes behind the path
      R(c, 14, GY - 150, 10, 150, P.ink); R(c, 16, GY - 148, 6, 148, P.yel); R(c, 14, GY - 150, 150, 34, P.ink); R(c, 16, GY - 148, 146, 30, P.navy); ART.text(c, 'SITE ENTRANCE', 89, GY - 144, 22, '#fff', 'center'); R(c, 154, GY - 150, 10, 150, P.ink); R(c, 156, GY - 148, 6, 148, P.yel);
      for (let x = Math.max(6, x0 - 1); x <= x1; x++) { if (x % 8 === 0 && !B.some(b => x >= b.x0 - 1 && x <= b.x0 + 9)) { R(c, x * T + 14, GY - 110, 5, 110, P.ink); R(c, x * T + 6, GY - 118, 22, 10, P.ink); R(c, x * T + 8, GY - 112, 18, 5, Math.floor(t * 2 + x) % 7 ? P.yel : '#fff'); } if (x % 5 === 2 && !pits.has(x)) { R(c, x * T + 2, GY - 16, 28, 16, '#15803D'); R(c, x * T + 8, GY - 24, 16, 10, '#22A050'); } }
      for (const b of B) if (b.x0 + 9 >= x0 && b.x0 <= x1) building(c, b, b.x0 * T, t);
      // solid tiles: ground, roofs, crates, floating blocks; water in the pits
      for (let tx = x0; tx <= x1 && tx < W; tx++) {
        if (pits.has(tx)) { R(c, tx * T, GY + 18 + Math.floor(t * 3 + tx) % 2 * 2, T, 62, '#3B8FD9'); R(c, tx * T + 4 + Math.floor(t * 4) % 3 * 6, GY + 22, 10, 3, '#BFE6FF'); continue; }
        for (let ty = 5; ty < 15; ty++) { if (!solid.has(tx + ',' + ty)) continue; const px = tx * T, py = ty * T;
          if (ty >= 13) { R(c, px, py, T, T, '#56617F'); if (ty === 13) { R(c, px, py, T, 8, '#C9D1E3'); R(c, px, py + 8, T, 3, '#7C879F'); if (tx % 2) R(c, px + 8, py + 18, 16, 4, P.yel); } else R(c, px + (tx * 7 % 20), py + 10, 6, 6, 'rgba(0,0,0,.2)'); }
          else if (ty === 9) { R(c, px, py, T, T, P.ink); R(c, px, py + 3, T, T - 6, '#7C879F'); R(c, px, py + 3, T, 6, '#C9D1E3'); R(c, px + 14, py + 16, 4, 4, P.ink); }
          else if (ty === 6) { R(c, px, py, T, T, P.ink); R(c, px + 3, py + 3, T - 6, T - 6, P.yel); R(c, px + 3, py + 3, T - 6, 5, '#FEF9C3'); R(c, px + 3, py + T - 9, T - 6, 6, '#C9A800'); }
          else { R(c, px, py, T, T, P.ink); R(c, px + 3, py + 3, T - 6, T - 6, '#C2843A'); R(c, px + 3, py + 3, T - 6, 5, '#E0A85A'); R(c, px + 3, py + 13, T - 6, 3, '#8A5A2B'); R(c, px + 13, py + 3, 3, T - 6, '#8A5A2B'); } }
      }
      for (const b of B) { const st = S.done[b.id] || 0; if (st && b.x0 + 9 >= x0 && b.x0 <= x1) { R(c, (b.x0 + 4) * T - 40, 9 * T + 5, 80, 22, P.navy); for (let i = 0; i < 3; i++) ART.star(c, (b.x0 + 4) * T - 33 + i * 23, 9 * T + 7, 2, i < st); } }
      bolts.forEach((b, i) => { if (site.got[i] || b.x < cam - 20 || b.x > cam + 380) return; const y = b.y + Math.floor(t * 4 + b.x) % 2 * 2; R(c, b.x - 8, y - 8, 16, 16, P.ink); R(c, b.x - 5, y - 5, 10, 10, P.yel); R(c, b.x - 5, y - 5, 10, 3, '#FEF9C3'); R(c, b.x - 2, y - 1, 4, 4, '#B45309'); });
      // arrows: a bouncing one over your own door, and "go in" when you stand at any door
      const bob = Math.floor(t * 3) % 2 * 4, mineB = B.find(b => b.id === mine);
      if (mineB && !s.door) { const ax = (mineB.x0 + 4) * T; ART.box(c, ax - 46, 10 * T - 92 - bob, 92, 26, P.yel, 3); ART.text(c, 'YOUR JOB', ax, 10 * T - 90 - bob, 20, P.ink, 'center'); R(c, ax - 5, 10 * T - 66 - bob, 10, 6, P.ink); }
      if (s.door) { const ax = (s.door.x0 + 4) * T; ART.box(c, ax - 40, GY - 150 - bob, 80, 30, '#fff', 3, 3); ART.text(c, 'GO IN', ax + 8, GY - 147 - bob, 22, P.ink, 'center'); R(c, ax - 30, GY - 138 - bob, 4, 10, P.blue); R(c, ax - 34, GY - 138 - bob, 12, 4, P.blue); R(c, ax - 31, GY - 142 - bob, 6, 4, P.blue); }
      if (!(s.flash > 0 && Math.floor(s.flash * 12) % 2)) ART.char(c, g.av, Math.round(s.x) - 6, Math.round(s.y) - 5 - (s.cheer > 0 ? Math.floor(t * 8) % 2 * 4 : 0), 2, {accent:g.accent, flip:s.face < 0, frame:!s.ground ? 1 : Math.abs(s.vx) > 20 ? 1 + Math.floor(s.walk) % 2 : 0});
      c.restore();
    }
    return {s, step, draw, B, bolts, hit};
  },
  // test robot: head for the goal building (game.s.goal), hopping crates and pits either way, and go in
  auto(g, game) {
    const s = game.s, T = 32, ty = Math.floor((s.y + 49) / T), goal = game.B.find(b => b.id === s.goal), door = (goal.x0 + 4) * T - 10;
    if (s.door && s.door.id === s.goal) { g.key.l = g.key.r = 0; g.press.u = 1; return; }
    const dir = s.x < door ? 1 : -1, edge = dir > 0 ? s.x + 20 : s.x;
    g.key.r = dir > 0 ? 1 : 0; g.key.l = dir < 0 ? 1 : 0; g.key.a = 1;
    if (s.ground && (game.hit(Math.floor((edge + dir * 6) / T), ty) || !game.hit(Math.floor((edge + dir * 2) / T), ty + 1))) g.press.a = 1;
  },
};
