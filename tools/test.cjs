// Headless play-through of every screen, the platform level and all twelve puzzles at three device sizes.
// Run: heavy node tools/test.cjs   (set URL=https://... to test the live site)
const {chromium} = require(process.env.PW || '/home/matindarwish/.npm/_npx/9833c18b2d85bc59/node_modules/playwright-core');
const path = require('path');
const url = process.env.URL || 'file://' + path.resolve(__dirname, '../index.html');
const shots = path.resolve(__dirname, 'shots');
const SIZES = {phone:{width:390, height:844, hasTouch:true, isMobile:true}, ipad:{width:820, height:1180, hasTouch:true}, laptop:{width:1366, height:768}};
const fails = [];
const check = (ok, what) => { if (!ok) fails.push(what); console.log((ok ? 'ok   ' : 'FAIL ') + what); };

// A simple player: hold right, jump at walls, pits and hot vents. Runs the game's own physics step.
const autoRun = max => { const pf = S.pf, C = PFC, T = C.T, p = pf.p; let n = 0, resp = 0;
  while (!pf.paused && !pf.done && n < max) {
    const ty = Math.floor((p.y + C.H - 1) / T), front = p.x + C.W;
    pf.in.r = 1; pf.in.j = 1;
    if (p.ground && (pfSolid(Math.floor((front + 6) / T), ty) || !pfSolid(Math.floor((front + 2) / T), ty + 1) || pf.L.haz.includes(Math.floor((front + 14) / T)))) pf.in.jp = 1;
    const f = pf.flash; pfStep(1 / 60); if (pf.flash > f) resp++; n++;
  }
  pf.in = {l:0, r:0, j:0, jp:0};
  return {paused:pf.paused, done:pf.done, x:Math.round(p.x), n, resp}; };

(async () => {
  const browser = await chromium.launch({executablePath:'/usr/bin/chromium-browser', headless:true});
  for (const [dev, vp] of Object.entries(SIZES)) {
    const ctx = await browser.newContext({viewport:{width:vp.width, height:vp.height}, hasTouch:!!vp.hasTouch, isMobile:!!vp.isMobile, deviceScaleFactor:dev === 'laptop' ? 1 : 2});
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(String(e)));
    page.on('console', m => { if (m.type() === 'error' && !/fonts\.g/.test(m.text())) errs.push(m.text()); });
    let n = 0;
    const snap = async name => {
      const over = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      check(over <= 0, `${dev} ${name}: no sideways scroll (${over})`);
      const small = await page.evaluate(() => [...document.querySelectorAll('#app button')].filter(b => { const r = b.getBoundingClientRect(); return r.width && (r.width < 38 || r.height < 38); }).length);
      check(small === 0, `${dev} ${name}: no tiny buttons (${small})`);
      await page.screenshot({path:`${shots}/${dev}-${String(++n).padStart(2, '0')}-${name}.png`, fullPage:true});
    };
    const tap = sel => page.click(sel);
    const pzOpen = () => page.evaluate(() => !!S.pz);
    await page.goto(url); await page.waitForTimeout(500);
    await snap('start');
    await tap('text=Start');
    await page.fill('#nm', 'Amira'); await tap('[data-v="hijab"]'); await tap('[data-k="col"][data-v="9"]'); await tap('[data-k="skin"][data-v="3"]'); await tap('[data-k="glasses"]');
    await snap('look');
    await tap('text=Next: pick your skills');
    check(await page.isDisabled('[data-a="match"]'), `${dev} match disabled before 3 picks`);
    for (const id of ['code', 'solve', 'grit']) await tap(`[data-id="${id}"]`);
    await tap('[data-id="draw"]');
    check(await page.evaluate(() => S.picks.length) === 3, `${dev} a 4th skill is refused`);
    await snap('skills');
    await tap('[data-a="match"]');
    check(await page.evaluate(() => S.role) === 'software', `${dev} code+solve+grit -> software`);
    await page.waitForTimeout(400); await snap('role');
    await tap('[data-a="play"]'); await page.waitForTimeout(300);
    await snap('level-start');

    // real input: keyboard and the on-screen buttons move the player
    const x0 = await page.evaluate(() => S.pf.p.x);
    await page.keyboard.down('ArrowRight'); await page.waitForTimeout(450); await page.keyboard.up('ArrowRight');
    const x1 = await page.evaluate(() => S.pf.p.x);
    check(x1 > x0 + 30, `${dev} right arrow key moves the player (${Math.round(x0)} -> ${Math.round(x1)})`);
    await page.keyboard.down(' '); await page.waitForTimeout(120); const up = await page.evaluate(() => S.pf.p.y); await page.keyboard.up(' ');
    check(up < 238, `${dev} space jumps (y ${Math.round(up)})`);
    await page.waitForTimeout(700);
    await page.dispatchEvent('#pl', 'pointerdown', {pointerId:1}); await page.waitForTimeout(250); await page.dispatchEvent('#pl', 'pointerup', {pointerId:1});
    const x2 = await page.evaluate(() => S.pf.p.x);
    check(x2 < x1 - 15, `${dev} on-screen left button moves the player (${Math.round(x1)} -> ${Math.round(x2)})`);
    await page.dispatchEvent('#pj', 'pointerdown', {pointerId:2}); await page.waitForTimeout(120); const up2 = await page.evaluate(() => S.pf.p.y); await page.dispatchEvent('#pj', 'pointerup', {pointerId:2});
    check(up2 < 238, `${dev} on-screen jump button jumps`);
    // falling in a pit sends you back to the checkpoint
    await page.evaluate(() => { S.pf.p.x = 14.4 * 32; S.pf.p.y = 300; }); await page.waitForTimeout(900);
    check(await page.evaluate(() => S.pf.p.x < 100 && S.pf.p.y <= 238), `${dev} falling in a pit respawns at the start`);

    const solve = {
      design:[async () => { await tap('[data-a="quizPick"][data-id="smooth"]'); },
        async () => { await tap('[data-a="fanTest"]'); await page.waitForTimeout(500); check(!(await page.evaluate(() => S.g.won)), `${dev} fan: first design fails`); await snap('pz-design-fan-fail');
          await tap('[data-k="size"][data-v="2"]'); await tap('[data-k="mat"][data-v="2"]'); await tap('[data-k="shape"][data-v="1"]'); await tap('[data-a="fanTest"]'); await page.waitForTimeout(500); }],
      software:[async () => { await tap('[data-k="r"]'); await tap('[data-k="r"]'); await tap('[data-a="botRun"]'); await page.waitForTimeout(1900);
          check(/Bump/.test(await page.textContent('#msg')), `${dev} bot: bad code bumps`); await tap('[data-a="botUndo"]'); await tap('[data-a="botUndo"]');
          for (const k of 'rurrdr') await tap(`[data-k="${k}"]`); await tap('[data-a="botRun"]'); },
        async () => { for (const k of 'ddrrrddr') await tap(`[data-k="${k}"]`); await tap('[data-a="botRun"]'); }],
      materials:[async () => { await tap('[data-a="quizPick"][data-id="cf"]'); }, async () => { await tap('[data-a="quizPick"][data-id="nickel"]'); }],
      manufacturing:[async () => { await tap('[data-id="turb"]'); check(/Not that one/.test(await page.textContent('#msg')), `${dev} build: wrong part refused`);
          for (const id of ['fan', 'comp', 'comb', 'turb', 'noz']) await tap(`[data-a="orderPlace"][data-id="${id}"]`); },
        async () => { const bad = await page.evaluate(() => S.g.bad); await tap(`[data-a="crackPick"][data-i="${bad}"]`); }],
      electrical:[0, 1].map(() => async () => {
        const todo = await page.evaluate(() => { const g = S.g, out = []; for (const [x, y] of g.L.path) { const t = g.t[y][x]; let k = 0; while (turn(t.base, t.r + k) !== t.need) k++; out.push([x, y, k]); } return out; });
        for (const [x, y, k] of todo) for (let i = 0; i < k; i++) await tap(`.tile[data-x="${x}"][data-y="${y}"]`);
        await page.waitForTimeout(250); }),
      sustainability:[async () => { await tap('[data-a="quizPick"][data-id="oil"]'); },
        async () => { check(await page.isDisabled('[data-a="ecoOn"]'), `${dev} town: switch-on disabled when empty`);
          for (const id of ['smr', 'wind', 'wind', 'solar']) await tap(`[data-a="ecoStep"][data-id="${id}"][data-v="1"]`); await tap('[data-a="ecoOn"]'); }],
    };
    for (const id of Object.keys(solve)) {
      await page.evaluate(id => { S.role = id; go('challenge'); }, id);
      let resp = 0;
      for (let i = 0; i < 2; i++) {
        const r = await page.evaluate(autoRun, 3000); resp += r.resp;
        check(r.paused && await pzOpen(), `${dev} ${id}: running right reaches puzzle ${i + 1} (x ${r.x}, ${r.n} steps)`);
        await snap(`pz-${id}-${i + 1}-start`);
        await solve[id][i]();
        await page.waitForSelector('[data-a="pzDone"]', {timeout:8000});
        await snap(`pz-${id}-${i + 1}-end`);
        await tap('[data-a="pzDone"]');
        if (id === 'software' && i === 0) { await page.evaluate(autoRun, 150); await page.waitForTimeout(120); await snap('level-mid'); }
      }
      const r = await page.evaluate(autoRun, 3000); resp += r.resp;
      check(r.done, `${dev} ${id}: running right reaches the flag (x ${r.x})`);
      check(resp === 0, `${dev} ${id}: the simple runner never falls or gets burnt (${resp})`);
      const got = await page.evaluate(() => S.pf.got); check(got >= 10, `${dev} ${id}: bolts are collected along the way (${got}/29)`);
      const st = await page.evaluate(() => S.ch.stars);
      check(st === 3, `${dev} ${id}: both puzzles right plus the flag gives 3 stars (got ${st})`);
      if (id === 'design') { await page.waitForTimeout(100); await snap('level-flag'); }
      await page.waitForFunction(() => S.screen === 'result', null, {timeout:4000});
      if (id === 'software') { await page.waitForTimeout(400); await snap('result-3-stars'); }
    }

    // a wrong answer and a skipped puzzle open the gate without a star; "play without jumping" works
    await page.evaluate(() => { S.role = 'materials'; go('challenge'); });
    await tap('[data-a="pfAuto"]');
    check(await pzOpen(), `${dev} play without jumping opens puzzle 1`);
    await tap('[data-a="quizPick"][data-id="plastic"]'); await snap('pz-wrong-answer'); await tap('[data-a="pzDone"]');
    check(await page.evaluate(() => S.pz && S.pz.i === 1), `${dev} play without jumping goes straight to puzzle 2`);
    await tap('[data-a="pzSkip"]');
    await page.waitForFunction(() => S.screen === 'result', null, {timeout:4000});
    check(await page.evaluate(() => S.last) === 1, `${dev} wrong answer + skipped puzzle = 1 star`);
    await page.waitForTimeout(400); await snap('result-1-star');
    await tap('[data-to="explore"]'); await snap('explore');
    await tap('[data-a="open"][data-id="sustainability"]'); await page.waitForTimeout(400); await snap('role-explore');
    await tap('[data-a="play"]'); await tap('[data-a="finish"]');
    check(await page.evaluate(() => S.screen === 'result' && S.last === 0), `${dev} skip to the end gives 0 stars`);
    await tap('[data-a="reset"]');
    check(await page.evaluate(() => S.screen === 'start' && !S.name && !S.picks.length), `${dev} new player clears everything`);
    check(errs.length === 0, `${dev} no page errors ${errs.join(' | ')}`);

    if (dev === 'phone') {
      const dist = await page.evaluate(() => { const ids = SKILLS.map(s => s.id), c = {}; let n = 0;
        for (const a of ids) for (const b of ids) for (const d of ids) if (a !== b && b !== d && a !== d) { const r = match([a, b, d])[0]; c[r] = (c[r] || 0) + 1; n++; } return {n, c}; });
      console.log('role spread over', dist.n, 'ordered picks:', JSON.stringify(dist.c));
      check(Object.keys(dist.c).length === 6 && Math.min(...Object.values(dist.c)) / dist.n > 0.1, 'every role comes up for at least 10% of picks');
      await page.evaluate(() => { document.body.innerHTML = '<div style="display:grid;grid-template-columns:repeat(8,1fr);gap:8px;padding:8px;width:1100px">' + SKIN.map((_, s) => HAIR.map(([h], i) => `<div class="avw">${avatar({skin:s, hair:h, col:(s + i) % COLS.length, glasses:i % 3 === 0})}</div>`).join('')).join('') + '</div>'; });
      await page.setViewportSize({width:1120, height:900}); await page.screenshot({path:`${shots}/avatars.png`, fullPage:true});
    }
    await ctx.close();
  }
  await browser.close();
  console.log(fails.length ? `\n${fails.length} FAILED:\n` + fails.join('\n') : '\nALL PASSED');
  process.exit(fails.length ? 1 : 0);
})();
