'use strict';
/* Software engineer: write the steps that drive a tiny inspection robot through a jet engine, then find and fix the bug in someone else's code. */
GAMES.software = {
  title:'Debug the bot',
  how:['Tap the arrows to write the robot\'s steps.', 'Press RUN. Watch it follow your code.', 'A bug? Change the wrong step and run again.'],
  pads:'',
  make(g) {
    const P = ART.P, R = ART.r, CAP = 10, STEP = g.easy ? .56 : .42, HINT = g.easy ? 2 : 3, T3 = g.easy ? 6 : 5, T2 = g.easy ? 9 : 8;
    const DIR = {u:[0, -1], d:[0, 1], l:[-1, 0], r:[1, 0]}, OPP = {u:'d', d:'u', l:'r', r:'l'};
    // S start, C crack, H hot part, W wall. prog is the code the level starts with; sol is one right answer (for the hint and the test robot).
    const LEVELS = [
      {name:'Write the code', hud:'Level 1 of 3: write the code', say:'Write the code', map:['.....', '.....', 'S.H.C', '.....', '.....'], prog:'', sol:'rurrdr',
        tip:'Tap the arrows to write the steps.', card:'The robot must reach the crack and take a photo. Tap the arrows to write its steps. Then press RUN.', extra:`Fewer runs, more stars: ${T3} runs or fewer wins 3 stars.`},
      {name:'Find the bug', hud:'Level 2 of 3: find the bug', say:'Find the bug', map:['...HC', '.H...', '...H.', '.H...', 'S....'], prog:'rruurrru', sol:'rruuurru',
        tip:'One step is wrong. Press RUN and watch.', card:'Another engineer wrote this code, but one step is wrong. Press RUN and watch. Then change the wrong step.', extra:'Bugs are normal. Finding them is the job.'},
      {name:'Keep it short', hud:'Level 3 of 3: 10 steps only', say:'Keep it short', map:['..W..C', '.H..H.', '...W..', 'W.H..W', '....H.', 'S.W...'], prog:'', sol:'rurrururuu',
        tip:'Only 10 steps! Plan a short route.', card:'This is a maze, and the code can only be 10 steps long. Plan your route before you press RUN.', extra:'Short code is good code. Keep It Simple!'},
    ];
    // sprites: the robot and the arrow are drawn facing up; the other three directions are made from them
    const BOT = ['......KKKK......', 'KKK..KLLLLK..KKK', 'KTK..KLEeLK..KTK', 'KtKKKKLEELKKKKtK', 'KTKbbbbLLBBBdKTK', 'KtKbBBBBBBBBdKtK', 'KTKbBAAAAAABdKTK', 'KtKbBAAAAAABdKtK', 'KTKbBBBBBBBBdKTK', 'KtKbBBKKKKBBdKtK', 'KTKbBBKYYKBBdKTK', 'KtKbBBKKKKBBdKtK', 'KTKbBBBBBBBBdKTK', 'KtKddddddddddKtK', 'KTKKKKKKKKKKKKTK', 'KKK..........KKK'];
    const HOT = ['.....KKKKKK.....', '...KKRRRRRRKK...', '..KRROOOOOORRK..', '.KRROOYYYYOORRK.', '.KROOYYYYYYOORK.', 'KRROYYYWWYYYORRK', 'KROOYYWWWWYYOORK', 'KROYYWWWWWWYYORK', 'KROYYWWWWWWYYORK', 'KROOYYWWWWYYOORK', 'KRROYYYWWYYYORRK', '.KROOYYYYYYOORK.', '.KRROOYYYYOORRK.', '..KRROOOOOORRK..', '...KKRRRRRRKK...', '.....KKKKKK.....'];
    const WALL = ['KKKKKKKKKKKKKKKK', 'KllllllllllllllK', 'KlSSSSSSSSSSSSdK', 'KlSbSSSSSSSSbSdK', 'KlSSSSSSSSSSSSdK', 'KlSSddddddddSSdK', 'KlSSdYYKKYYlSSdK', 'KlSSdYKKYYKlSSdK', 'KlSSdKKYYKKlSSdK', 'KlSSdKYYKKYlSSdK', 'KlSSllllllllSSdK', 'KlSSSSSSSSSSSSdK', 'KlSbSSSSSSSSbSdK', 'KlSSSSSSSSSSSSdK', 'KddddddddddddddK', 'KKKKKKKKKKKKKKKK'];
    const CRACK = ['................', '............KK..', '...........KKc..', '..........KKc...', '.......KKKKc....', '......KKcc......', '......KKc.......', '.......KKK......', '........cKKK....', '..........cKK...', '.......KKKKKc...', '.....KKKccc.....', '....KKcc........', '...KKc..........', '..KKc...........', '................'];
    const LAPTOP = ['..KKKKKKKKKKKKKKKKKKKK..', '..KllllllllllllllllllK..', ...Array(9).fill('..KlSSSSSSSSSSSSSSSSdK..'), '..KddddddddddddddddddK..', 'KggggggggggggggggggggggK', 'KGkGkGkGkGkGkGkGkGkGkGGK', 'KGGkGkGkGkGkGkGkGkGkGkGK', 'KKKKKKKKKKKKKKKKKKKKKKKK'];
    const BUG = ['K.K...K.K', '.K.KKK.K.', '..KRRRK..', 'KKRKRKRKK', '..KRRRK..', 'KKRRKRRKK', '..KRRRK..', '.K.KKK.K.'];
    const ARROW = ['....W....', '...WWW...', '..WWWWW..', '.WWWWWWW.', 'WWWWWWWWW', '...WWW...', '...WWW...', '...WWW...', '...WWW...'];
    const TICK = ['......G', '.....GG', 'G...GG.', 'GG.GG..', '.GGG...', '..G....'], CROSS = ['R...R', 'RR.RR', '.RRR.', 'RR.RR', 'R...R'], PLAY = ['K....', 'KK...', 'KKK..', 'KKKK.', 'KKKKK', 'KKKK.', 'KKK..', 'KK...', 'K....'];
    const turn = rows => [...rows[0]].map((_, i) => rows.map(r => r[i]).join('')), mirror = rows => rows.map(r => [...r].reverse().join(''));
    const facing = up => ({u:up, d:up.slice().reverse(), l:turn(up), r:mirror(turn(up))});
    const BOTS = facing(BOT), ARROWS = facing(ARROW);
    const HOTPAL = [{K:P.ink, R:'#991B1B', O:P.orange, Y:P.gold, W:P.yel}, {K:P.ink, R:'#B91C1C', O:'#F97316', Y:P.yel, W:'#FFF7C2'}, {K:P.ink, R:'#B91C1C', O:P.orange, Y:P.yel, W:'#fff'}];
    const WALLPAL = {K:P.ink, l:'#EEF3FF', S:P.silver, b:P.dark, d:P.steel, Y:P.yel};
    // everything that can be tapped: four arrows, undo, run, then the ten slots of the code strip (two rows of five)
    const BTN = [{k:'u', x:58, y:385, w:48, h:44}, {k:'l', x:8, y:431, w:48, h:44}, {k:'d', x:58, y:431, w:48, h:44}, {k:'r', x:108, y:431, w:48, h:44}, {k:'undo', x:164, y:385, w:76, h:44}, {k:'run', x:246, y:385, w:108, h:90}];
    for (let i = 0; i < CAP; i++) BTN.push({k:'step', i, x:12 + (i % 5) * 67, y:292 + (i / 5 | 0) * 44, w:67, h:44});
    const s = {lv:0, L:null, n:5, T:40, phase:'card', cardT:0, prog:[], sel:-1, bad:-1, runs:0, fails:0, hint:false, lastFail:'', x:0, y:0, sx:0, sy:0, fx:0, fy:0, dir:'r', pc:0, pt:0, blk:false, backT:0, winT:0, sadT:0, idle:0, nag:false, hitK:'', hitT:0, trail:[], msg:'', mk:'', btn:BTN};
    const say = (msg, mk = '') => { s.msg = msg; s.mk = mk; };
    const cell = (x, y) => x < 0 || y < 0 || x >= s.n || y >= s.n ? 'E' : s.L.map[y][x];
    const starsNow = () => s.runs <= T3 ? 3 : s.runs <= T2 ? 2 : 1;

    function load(i) {
      const L = s.L = LEVELS[i]; s.lv = i; s.n = L.map.length; s.T = s.n === 5 ? 40 : 33;
      L.map.forEach((row, y) => { const x = row.indexOf('S'); if (x >= 0) { s.sx = s.x = x; s.sy = s.y = y; } });
      Object.assign(s, {phase:'card', cardT:0, prog:[...L.prog], sel:-1, bad:-1, fails:0, hint:false, lastFail:'', dir:L.sol[0], backT:0, idle:0, trail:[]});
      g.hud(L.hud); say(L.tip);
    }
    function undo() { if (!s.prog.length) return; s.prog.pop(); s.sel = -1; if (s.bad >= s.prog.length) s.bad = -1; say('Last step removed.'); }
    // an arrow changes the picked step, or adds a step to the end. On a keyboard, the opposite arrow takes the last step back.
    function add(k, key) {
      const n = s.prog.length;
      if (s.sel >= 0) { s.prog[s.sel] = k; say(`Step ${s.sel + 1} changed. Press RUN to test it.`); if (s.sel === s.bad) s.bad = -1; s.sel = -1; }
      else if (key && n && s.prog[n - 1] === OPP[k]) undo();
      else if (n >= CAP) say('The code is full. Tap a step to change it.');
      else { s.prog.push(k); say(n + 1 < CAP ? 'Keep going. Press RUN to test your code.' : 'That is all 10 steps. Press RUN.'); }
    }
    function run() {
      const code = s.prog.join('');
      if (!code) return say('Add some steps first.');
      if (code === s.lastFail) return say('Same code, same bug. Change a step first.', 'bad');
      s.runs++; g.score(`Runs ${s.runs}`);
      Object.assign(s, {phase:'run', pc:0, pt:-1, x:s.sx, y:s.sy, sel:-1, bad:-1, backT:0, sadT:0, blk:false, trail:[]});
    }
    // never the end of the game: the robot goes back to the start and the message says which step went wrong
    function fail(why) {
      s.fails++; s.lastFail = s.prog.join(''); s.phase = 'edit'; s.backT = 1.2; s.sadT = 3; s.fx = s.x; s.fy = s.y; s.x = s.sx; s.y = s.sy; s.idle = 0;
      if (s.fails >= HINT) s.hint = true;
      const help = s.hint ? ' Follow the faint arrows.' : '';
      if (why) { s.bad = s.sel = s.pc; say(`Step ${s.pc + 1} ${why}.${help || ' Tap a new arrow to change it.'}`, 'bad'); }
      else say(`The code stopped before the crack.${help || (s.prog.length < CAP ? ' Add more steps.' : ' Change a step.')}`, 'bad');
    }
    function win() { s.phase = 'won'; s.winT = 0; say(s.lv < 2 ? 'Photo taken! The crack is found.' : 'Photo taken! All three cracks found.', 'ok'); }

    function step(dt) {
      s.backT = Math.max(0, s.backT - dt); s.sadT = Math.max(0, s.sadT - dt); s.hitT = Math.max(0, s.hitT - dt);
      if (s.phase === 'won') {
        s.winT += dt;
        if (s.winT > 2.8 && !g.over) { if (s.lv < 2) load(s.lv + 1); else g.end(starsNow(), `You wrote and fixed the robot's code in ${s.runs} runs.`); }
        return;
      }
      if (g.over) return;
      if (s.phase === 'run') {
        s.pt += dt / STEP; if (s.pt < 0) return;
        const k = s.dir = s.prog[s.pc], [dx, dy] = DIR[k], to = cell(s.x + dx, s.y + dy);
        s.blk = 'EWH'.includes(to); say(`Running step ${s.pc + 1} of ${s.prog.length}...`);
        if (s.pt < 1) return;
        s.pt = 0;
        if (s.blk) return fail(to === 'H' ? 'hit a hot part' : 'hit a wall');
        s.trail.push([s.x, s.y]); s.x += dx; s.y += dy; s.pc++;
        if (cell(s.x, s.y) === 'C') win(); else if (s.pc >= s.prog.length) fail('');
        return;
      }
      const key = ['l', 'r', 'u', 'd'].find(k => g.press[k]), any = g.tap || key || g.press.a;
      s.idle = any ? 0 : s.idle + dt; if (any) s.nag = false;
      if (s.phase === 'card') { s.cardT += dt; if ((any && s.cardT > .5) || s.idle > 12) { s.phase = 'edit'; s.idle = 0; } return; }
      const hit = g.tap && BTN.find(b => g.tap.x >= b.x && g.tap.x < b.x + b.w && g.tap.y >= b.y && g.tap.y < b.y + b.h);
      if (hit) { s.hitK = hit.k; s.hitT = .15; }
      if (key) add(key, true);
      else if (g.press.a || (hit && hit.k === 'run')) run();
      else if (hit && hit.k === 'undo') undo();
      else if (hit && hit.k === 'step') { if (hit.i < s.prog.length) { s.sel = s.sel === hit.i ? -1 : hit.i; say(s.sel < 0 ? 'Tap a step to change it.' : `Step ${hit.i + 1} picked. Tap a new arrow.`); } }
      else if (hit) add(hit.k, false);
      // nothing touched for 20 seconds: say what to do and flash it
      if (s.idle > 20 && !s.nag) { s.nag = true; say(wantArrow() ? 'Stuck? Tap an arrow to add or change a step.' : 'Now press RUN to test your code.'); }
    }
    const wantArrow = () => { const code = s.prog.join(''); return s.sel >= 0 || !code || code === s.lastFail; };

    function draw(c) {
      R(c, 0, 0, 360, 480, P.navy);
      R(c, 0, 0, 360, 22, P.pale); ART.text(c, `Level ${s.lv + 1} of 3: ${s.L.name}`, 8, 2, 18, P.navy);
      ART.text(c, `Runs ${s.runs}`, 284, 2, 18, P.navy, 'right'); for (let i = 0; i < 3; i++) ART.star(c, 290 + i * 23, 2, 2, i < starsNow());
      drawMap(c); drawDesk(c);
      if (s.phase === 'card') return drawCard(c);
      ART.box(c, 6, 246, 348, 42, '#fff', 3);
      if (s.mk) ART.map(c, s.mk === 'ok' ? TICK : CROSS, {G:'#15803D', R:P.red}, 14, 258, 3);
      const mw = s.mk ? 304 : 332; ART.text(c, '', 0, 0, 17);   // sets the font, so a one-line message can sit in the middle
      ART.wrap(c, s.msg, s.mk ? 42 : 14, c.measureText(s.msg).width > mw ? 249 : 258, mw, 17, P.ink);
      drawCode(c); drawPad(c);
    }

    // the inside of the engine from above: pipes round the edge, riveted floor plates, hot parts, the crack and the robot
    function drawMap(c) {
      const t = g.t, T = s.T, n = s.n, o = (200 - n * T) / 2, px = x => 16 + o + x * T, py = y => 34 + o + y * T, m = (T - 32) / 2;
      R(c, 6, 24, 220, 220, P.ink);
      for (const b of [26, 236]) { R(c, 8, b, 216, 6, P.steel); R(c, 8, b, 216, 2, P.silver); R(c, 8, b + 4, 216, 2, '#4B556F'); }
      for (const b of [8, 218]) { R(c, b, 26, 6, 216, P.steel); R(c, b, 26, 2, 216, P.silver); R(c, b + 4, 26, 2, 216, '#4B556F'); }
      for (let i = 0; i < 4; i++) { const q = 52 + i * 44; for (const b of [25, 235]) { R(c, q, b, 8, 8, P.ink); R(c, q + 2, b + 1, 4, 6, P.yel); } for (const b of [7, 217]) { R(c, b, q + 8, 8, 8, P.ink); R(c, b + 1, q + 10, 6, 4, P.yel); } }
      [[6, 24], [214, 24], [6, 232], [214, 232]].forEach(([x, y], i) => { R(c, x, y, 12, 12, P.ink); R(c, x + 2, y + 2, 8, 8, P.dark); R(c, x + 4, y + 4, 4, 4, Math.floor(t * 2 + i) % 2 ? P.green : '#14532D'); });
      for (const u0 of [0, 416]) { const u = (t * 90 + u0) % 832, d = u % 208, side = u / 208 | 0;   // something flowing round the pipes
        if (side === 0) R(c, 12 + d, 28, 8, 2, '#fff'); else if (side === 1) R(c, 220, 30 + d, 2, 8, '#fff'); else if (side === 2) R(c, 220 - d, 238, 8, 2, '#fff'); else R(c, 10, 238 - d, 2, 8, '#fff'); }
      R(c, 14, 32, 204, 204, P.ink); R(c, 16, 34, 200, 200, '#3D4763');
      c.save(); c.beginPath(); c.rect(16, 34, 200, 200); c.clip();
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
        const X = px(x), Y = py(y), h = (x * 7 + y * 13) % 5;
        R(c, X, Y, T, T, (x + y) % 2 ? '#56627F' : '#5F6C8A'); R(c, X, Y, T, 2, '#7C89A8'); R(c, X, Y, 2, T, '#7C89A8'); R(c, X, Y + T - 2, T, 2, '#3D4763'); R(c, X + T - 2, Y, 2, T, '#3D4763');
        for (const [a, b] of [[5, 5], [T - 7, 5], [5, T - 7], [T - 7, T - 7]]) { R(c, X + a, Y + b + 1, 3, 2, '#333D58'); R(c, X + a, Y + b, 2, 2, '#B6C0D4'); }
        if (h === 0) for (let i = 0; i < 3; i++) { R(c, X + 10, Y + T / 2 - 7 + i * 5, T - 20, 3, '#2B3350'); R(c, X + 10, Y + T / 2 - 4 + i * 5, T - 20, 1, '#7C89A8'); }
        if (h === 3) { R(c, X + 10, Y + T - 13, 12, 3, P.yel); R(c, X + 14, Y + T - 13, 4, 3, P.ink); }
      }
      // dashed yellow dock where the robot starts
      for (let i = 4; i < T - 6; i += 8) { const X = px(s.sx), Y = py(s.sy); R(c, X + i, Y + 3, 4, 2, P.yel); R(c, X + i, Y + T - 5, 4, 2, P.yel); R(c, X + 3, Y + i, 2, 4, P.yel); R(c, X + T - 5, Y + i, 2, 4, P.yel); }
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
        const X = px(x), Y = py(y), ch = cell(x, y);
        if (ch === 'W') ART.map(c, WALL, WALLPAL, X + m, Y + m, 2);
        if (ch === 'H') { const f = Math.floor(t * 9 + x * 3 + y * 5) % 3;
          R(c, X - 3, Y - 3, T + 6, T + 6, `rgba(234,88,12,${.18 + f * .07})`); ART.map(c, HOT, HOTPAL[f], X + m, Y + m, 2);
          for (let i = 0; i < 2; i++) { const e = (t * 14 + i * 9 + x * 5) % 18; R(c, X + 9 + i * (T - 20), Y + m + 8 - e, 2, 2, e > 12 ? P.orange : P.yel); } }
        if (ch === 'C') { const q = Math.floor(t * 3) % 2 * 2;
          ART.map(c, CRACK, {K:P.ink, c:'#B6C0D4'}, X + m, Y + m, 2);
          for (const a of [0, 1]) for (const b of [0, 1]) { R(c, X + (a ? T - 11 - q : 3 + q), Y + (b ? T - 6 - q : 3 + q), 8, 3, P.yel); R(c, X + (a ? T - 6 - q : 3 + q), Y + (b ? T - 11 - q : 3 + q), 3, 8, P.yel); }
          for (let i = 0; i < 3; i++) { const e = (t * 1.6 + i * .37) % 1; if (e < .5) R(c, X + T / 2 + (i - 1) * 20 * e, Y + T / 2 - e * 26 + i * 3, 2, 2, e < .25 ? '#fff' : P.yel); } }
      }
      for (const [x, y] of s.trail) { R(c, px(x) + T / 2 - 4, py(y) + T / 2 - 4, 8, 8, P.ink); R(c, px(x) + T / 2 - 2, py(y) + T / 2 - 2, 4, 4, P.sky); }
      // after three failed runs the right path shows faintly
      if (s.hint) { let x = s.sx, y = s.sy; for (const k of s.L.sol) { ART.map(c, ARROWS[k], {W:`rgba(255,255,255,${.34 + .16 * (Math.floor(t * 2) % 2)})`}, px(x) + T / 2 - 9, py(y) + T / 2 - 9, 2); x += DIR[k][0]; y += DIR[k][1]; } }
      // the robot: slides along its step, or bounces off whatever is in the way
      const [dx, dy] = DIR[s.dir], moving = s.phase === 'run' && s.pt > 0, bumped = s.backT > .6, f = moving ? (s.blk ? (s.pt < .5 ? s.pt : 1 - s.pt) * .7 : s.pt) : 0;
      const X = px((bumped ? s.fx : s.x) + dx * f) + m + (bumped ? Math.round(Math.sin(t * 50) * 2) : 0), Y = py((bumped ? s.fy : s.y) + dy * f) + m;
      const won = s.phase === 'won', blink = t % 3.4 < .14, tread = moving && Math.floor(t * 14) % 2;
      if (moving) R(c, X + 16 + dx * T * .55 - 7, Y + 16 + dy * T * .55 - 7, 14, 14, 'rgba(125,211,252,.22)');
      if (!(s.backT > 0 && s.backT < .6 && Math.floor(t * 12) % 2)) {
        R(c, X + 3, Y + 4, 32, 32, 'rgba(8,12,40,.3)');
        ART.map(c, BOTS[s.dir], {K:P.ink, T:tread ? '#55607F' : P.dark, t:tread ? P.dark : '#55607F', B:P.silver, b:'#F7F9FC', d:P.steel, A:g.accent, L:'#171A26', E:blink ? '#171A26' : won && s.winT < .6 ? '#fff' : '#38BDF8', e:blink ? '#171A26' : '#fff', Y:Math.floor(t * 4) % 2 ? P.green : '#14532D'}, X, Y, 2);
      }
      if (moving && s.blk && s.pt > .4 && s.pt < .9) for (let i = 0; i < 4; i++) R(c, X + 16 + dx * 20 + (i % 2 ? 7 : -7) * (dy ? 1 : .3) + dx * i, Y + 16 + dy * 20 + (i < 2 ? 7 : -7) * (dx ? 1 : .3), 3, 3, i % 2 ? '#fff' : P.yel);
      if (bumped) { ART.box(c, X + 9, Y + 5, 14, 22, P.red, 2); ART.text(c, '!', X + 16, Y + 6, 19, '#fff', 'center'); }
      // the camera flash, then the photo
      if (won && s.winT < .2) R(c, 16, 34, 200, 200, `rgba(255,255,255,${.9 - s.winT * 4})`);
      else if (won) { const e = Math.min(1, (s.winT - .2) / .3), ax = X - 24 + (76 - X + 24) * e, ay = Y - 34 + (84 - Y + 34) * e;
        R(c, ax + 5, ay + 5, 80, 100, 'rgba(8,12,40,.4)'); ART.box(c, ax, ay, 80, 100, '#fff', 3); R(c, ax + 8, ay + 8, 64, 64, '#56627F'); R(c, ax + 8, ay + 8, 64, 3, '#7C89A8');
        ART.map(c, CRACK, {K:P.ink, c:'#B6C0D4'}, ax + 8, ay + 8, 4); ART.map(c, TICK, {G:'#15803D'}, ax + 30, ay + 76, 3); }
      c.restore();
    }

    // the side panel: the player's character at a laptop, reacting to each run
    function drawDesk(c) {
      const t = g.t, won = s.phase === 'won', sad = s.sadT > 0 && !won, running = s.phase === 'run';
      ART.box(c, 230, 24, 124, 220, '#E3EAFA', 3);
      for (let x = 262; x < 351; x += 30) R(c, x, 27, 1, 111, '#CBD5EE');
      R(c, 233, 138, 118, 5, P.yel); for (let x = 235; x < 349; x += 14) R(c, x, 138, 6, 5, P.ink);
      R(c, 233, 143, 118, 79, '#D3DCF2'); R(c, 233, 222, 118, 19, '#B4BFD8'); R(c, 233, 222, 118, 2, '#8E9BC0');
      // wall screen: software watching the engine's health
      ART.text(c, 'ENGINE OK', 348, 62, 15, P.navy, 'right'); ART.box(c, 296, 80, 52, 30, P.navy, 3); R(c, 318, 110, 8, 4, P.dark);
      for (let i = 0; i < 6; i++) { const h = 6 + Math.floor((Math.sin(t * 3 + i * 1.7) + 1) * 6); R(c, 301 + i * 7, 105 - h, 5, h, P.green); R(c, 301 + i * 7, 105 - h, 5, 2, '#BBF7D0'); }
      const cy = 90 - (won ? Math.round(Math.abs(Math.sin(t * 9)) * 8) : Math.round(Math.sin(t * 2))), cx = 236 + (s.sadT > 2.5 ? Math.round(Math.sin(t * 50) * 2) : 0);
      ART.char(c, g.av, cx, cy, 3, {accent:g.accent, frame:won ? 1 + Math.floor(t * 6) % 2 : 0});
      // desk, drawers, mug and laptop
      ART.box(c, 232, 154, 120, 8, '#F7F9FC', 2); R(c, 236, 162, 112, 60, '#8E9BC0'); R(c, 236, 162, 112, 3, '#6B7896'); R(c, 236, 165, 3, 57, '#A9B4CF'); R(c, 345, 165, 3, 57, '#6B7896');
      R(c, 244, 174, 40, 6, g.accent); R(c, 244, 186, 40, 3, '#6B7896'); R(c, 244, 194, 40, 3, '#6B7896');
      for (const y of [170, 194]) { ART.box(c, 296, y, 46, 21, P.silver, 2); R(c, 298, y + 2, 42, 2, '#EEF3FF'); R(c, 312, y + 9, 14, 3, P.dark); }
      ART.box(c, 286, 144, 9, 10, '#fff', 2); R(c, 295, 147, 2, 4, P.ink);
      for (let i = 0; i < 2; i++) { const e = (t * 9 + i * 5) % 10; R(c, 288 + i * 3, 141 - e, 2, 2, 'rgba(124,135,159,.7)'); }
      ART.map(c, LAPTOP, {K:P.ink, l:'#EEF3FF', d:P.steel, S:P.navy, g:'#EEF3FF', G:P.silver, k:P.dark}, 298, 122, 2);
      if (won) { R(c, 306, 126, 32, 18, '#15803D'); ART.map(c, TICK, {G:'#fff'}, 315, 129, 2); }
      else if (sad) { R(c, 306, 126, 32, 18, '#7F1D1D'); ART.map(c, BUG, {K:'#fff', R:P.yel}, 313 + Math.floor(t * 4) % 2 * 2, 127, 2); }
      else for (let i = 0; i < 4; i++) { const on = running && i === s.pc % 4; R(c, 308, 128 + i * 4, 4, 2, on ? P.yel : P.green); R(c, 314, 128 + i * 4, 8 + (i * 7) % 13, 2, on ? P.yel : '#7DD3FC'); }
      if (won) for (let i = 0; i < 9; i++) R(c, 236 + (i * 29) % 110, 62 + (t * 70 + i * 41) % 170, 4, 4, [P.yel, g.accent, P.green, P.blue][i % 4]);
      ART.box(c, 234, 29, 116, 28, '#fff', 3); R(c, 254, 54, 10, 9, P.ink); R(c, 257, 54, 4, 6, '#fff');
      ART.text(c, won ? 'It works!' : sad ? 'A bug! Fix it.' : running ? 'Running...' : s.L.say, 292, 34, 17, P.ink, 'center');
    }

    // the program: a strip of numbered code blocks. The running step lights up; a step that hit something gets a bug on it.
    function drawCode(c) {
      const t = g.t, tick = Math.floor(t * 3) % 2;
      ART.box(c, 6, 289, 348, 92, '#131C45', 3);
      for (const b of BTN.slice(6)) {
        const i = b.i, on = s.phase === 'run' && i === s.pc, x = b.x + 1, y = b.y + 2 - (on ? 2 : 0), w = 64, h = 40;
        if (i >= s.prog.length) {
          R(c, x, y, w, h, P.ink); R(c, x + 2, y + 2, w - 4, h - 4, '#1E2A5E'); ART.text(c, i + 1, x + w / 2, y + 9, 20, '#9AA6C8', 'center');
          if (i === s.prog.length && s.phase === 'edit' && s.sel < 0 && tick) R(c, x + 9, y + 8, 4, 24, P.yel);
          continue;
        }
        if (i === s.sel) R(c, x - 3, y - 3, w + 6, h + 6, tick ? P.yel : '#fff');
        const col = on ? P.yel : g.accent, ink = on ? P.ink : '#fff';
        R(c, x, y, w, h, P.ink); R(c, x + 2, y + 2, w - 4, h - 4, col); R(c, x + 2, y + 2, w - 4, 3, 'rgba(255,255,255,.35)'); R(c, x + 2, y + h - 5, w - 4, 3, 'rgba(8,12,40,.3)');
        if (i % 5 < 4 && i + 1 < s.prog.length) { R(c, x + w, y + 14, 3, 12, P.ink); R(c, x + w - 2, y + 16, 5, 8, col); }
        ART.text(c, i + 1, x + 6, y + 10, 20, ink); ART.map(c, ARROWS[s.prog[i]], {W:ink}, x + 28, y + 7, 3);
      }
      const b = s.bad >= 0 && BTN[6 + s.bad];
      if (b) { ART.box(c, b.x + 42, b.y - 9, 24, 22, '#fff', 2); ART.map(c, BUG, {K:P.ink, R:P.red}, b.x + 45 + tick, b.y - 6, 2); }
    }

    function drawPad(c) {
      const t = g.t, edit = s.phase === 'edit', flash = edit && s.idle > 20 && Math.floor(t * 4) % 2, arrows = wantArrow(), ready = edit && !arrows, bob = ready && Math.floor(t * 3) % 2 ? 2 : 0;
      ART.text(c, 'ADD', 32, 398, 18, '#fff', 'center'); ART.text(c, 'STEP', 132, 398, 18, '#fff', 'center');
      for (const b of BTN.slice(0, 4)) { const dn = s.hitK === b.k && s.hitT > 0 ? 2 : 0;
        ART.box(c, b.x, b.y + dn, 48, 44 - dn, dn || (flash && arrows) ? P.yel : '#fff', 3); R(c, b.x + 3, b.y + 38, 42, 3, P.silver); ART.map(c, ARROWS[b.k], {W:P.ink}, b.x + 10, b.y + 7 + dn, 3); }
      ART.box(c, 164, 385, 76, 44, s.hitK === 'undo' && s.hitT > 0 ? P.yel : P.silver, 3); ART.text(c, 'UNDO', 202, 396, 22, P.ink, 'center');
      ART.text(c, `${s.prog.length} of ${CAP}`, 202, 434, 22, '#fff', 'center'); ART.text(c, 'steps', 202, 456, 16, P.sky, 'center');
      ART.box(c, 246, 385 + bob, 108, 90 - bob, !edit ? P.steel : flash && !arrows ? '#fff' : ready ? P.yel : '#D9C92A', 4);
      ART.text(c, 'RUN', 300, 392 + bob, 42, P.ink, 'center'); ART.map(c, PLAY, {K:P.ink}, 292, 440 + bob, 3);
    }

    // level card: covers the code strip and buttons, so the map can be studied while reading
    function drawCard(c) {
      const L = s.L, bob = Math.floor(g.t * 3) % 2 * 2;
      ART.box(c, 6, 246, 348, 230, '#fff', 4);
      ART.text(c, `Level ${s.lv + 1}: ${L.name}`, 180, 254, 28, P.navy, 'center');
      const y = ART.wrap(c, L.card, 22, 290, 316, 18, P.ink);
      ART.wrap(c, L.extra, 22, y + 6, 316, 18, P.blue);
      ART.box(c, 110, 424 + bob, 140, 44, P.yel, 4, 4 - bob); ART.text(c, 'START', 180, 431 + bob, 28, P.ink, 'center');
    }

    g.score('Runs 0'); load(0);
    return {s, step, draw};
  },
  // test robot: plays like a careful child. Reads each card, taps out the right steps, and on the bug level runs the broken code first to see where it goes wrong.
  auto(g, game) {
    const s = game.s, L = s.L, key = s.phase + s.lv, tap = b => { g.tap = {x:b.x + b.w / 2, y:b.y + b.h / 2}; }, btn = k => s.btn.find(b => b.k === k);
    if (s.botKey !== key) { s.botKey = key; s.botT = s.phase === 'card' ? 5 : 3; }
    if (g.over || s.phase === 'run' || s.phase === 'won' || (s.botT -= 1 / 60) > 0) return;
    s.botT = 1.3;
    if (s.phase === 'card') return tap({x:110, y:424, w:140, h:44});
    const want = [...L.sol], i = want.findIndex((k, j) => s.prog[j] && s.prog[j] !== k);
    if (L.prog && !s.fails) return tap(btn('run'));
    if (i >= 0) return tap(s.sel === i ? btn(want[i]) : s.btn.find(b => b.k === 'step' && b.i === i));
    tap(s.prog.length < want.length ? btn(want[s.prog.length]) : btn('run'));
  },
};
