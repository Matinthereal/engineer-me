// Headless check of the whole game at phone, iPad and laptop size: every screen, every engineer's game
// (played by its own auto robot), real key and button input, the tally and stand mode.
// Run: flock /tmp/engineer-me-shot.lock heavy node tools/test.cjs   (set URL=https://... to test the live site)
const {chromium} = require(process.env.PW || '/home/matindarwish/.npm/_npx/9833c18b2d85bc59/node_modules/playwright-core');
const path = require('path');
const url = process.env.URL || 'file://' + path.resolve(__dirname, '../index.html');
const SIZES = {phone:{width:390, height:844, hasTouch:true, isMobile:true}, ipad:{width:820, height:1180, hasTouch:true}, laptop:{width:1366, height:768}};
const ROLES = ['design', 'software', 'materials', 'manufacturing', 'electrical', 'sustainability'];
const fails = [];
const check = (ok, what) => { if (!ok) fails.push(what); console.log((ok ? 'ok   ' : 'FAIL ') + what); };

(async () => {
  const browser = await chromium.launch({executablePath:'/usr/bin/chromium-browser', headless:true});
  for (const [dev, vp] of Object.entries(SIZES)) {
    const ctx = await browser.newContext({viewport:{width:vp.width, height:vp.height}, hasTouch:!!vp.hasTouch, isMobile:!!vp.isMobile, deviceScaleFactor:dev === 'laptop' ? 1 : 2});
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(String(e)));
    page.on('console', m => { if (m.type() === 'error' && !/fonts\.g/.test(m.text() + m.location().url)) errs.push(m.text() + ' ' + m.location().url); });
    const fit = async name => {
      const over = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      check(over <= 0, `${dev} ${name}: no sideways scroll (${over})`);
      const small = await page.evaluate(() => [...document.querySelectorAll('#app button')].filter(b => { const r = b.getBoundingClientRect(); return r.width && (r.width < 40 || r.height < 40); }).length);
      check(small === 0, `${dev} ${name}: no tiny buttons (${small})`);
    };
    const tap = sel => page.click(sel);
    await page.goto(url + '?stand'); await page.waitForTimeout(500);
    await page.evaluate(() => localStorage.clear());
    await fit('start');
    check(await page.isVisible('[data-a="quick"]'), `${dev} stand mode shows the quick demo button`);
    await tap('[data-to="know"]'); await fit('know'); await tap('[data-a="know"][data-v="0"]');
    await page.fill('#nm', 'Amira');
    for (const [k, v] of [['hair', 'turban'], ['gear', 'ears'], ['outfit', 'hivis'], ['col', '9'], ['skin', '3']]) await tap(`[data-k="${k}"][data-v="${v}"]`);
    check(await page.isDisabled('[data-k="gear"][data-v="hardhat"]'), `${dev} hard hat is switched off with a turban`);
    await tap('[data-k="hair"][data-v="hijab"]'); await tap('[data-k="gear"][data-v="hardhat"]'); await tap('[data-k="glasses"]');
    check(await page.evaluate(() => S.av.gear === 'hardhat' && S.av.outfit === 'hivis' && S.av.glasses), `${dev} character choices are kept`);
    await fit('look');
    await tap('[data-to="skills"]');
    check(await page.isDisabled('[data-a="match"]'), `${dev} match disabled before 3 picks`);
    for (const id of ['draw', 'maths', 'talk']) await tap(`[data-id="${id}"]`);
    await tap('[data-id="code"]');
    check(await page.evaluate(() => S.picks.length) === 3, `${dev} a 4th skill is refused`);
    await fit('skills');
    await tap('[data-a="match"]');
    check(await page.evaluate(() => S.role) === 'design', `${dev} draw+maths+talk -> aerospace`);
    await page.waitForTimeout(350); await fit('role');
    // the walk to work: real keys and buttons move the character, then the robot walks to your own door
    await tap('[data-a="walk"]');
    await page.waitForFunction(() => S.screen === 'site' && S.run && S.run.game, null, {timeout:5000});
    await fit('site');
    const sx0 = await page.evaluate(() => S.run.game.s.x);
    await page.keyboard.down('ArrowRight'); await page.waitForTimeout(350); await page.keyboard.up('ArrowRight');
    const sx1 = await page.evaluate(() => S.run.game.s.x);
    check(sx1 > sx0 + 20, `${dev} site: right arrow key walks (${Math.round(sx0)} -> ${Math.round(sx1)})`);
    await page.dispatchEvent('[data-pad="a"]', 'pointerdown', {pointerId:3}); await page.waitForTimeout(140); const sy = await page.evaluate(() => S.run.game.s.y); await page.dispatchEvent('[data-pad="a"]', 'pointerup', {pointerId:3});
    check(sy < 365, `${dev} site: the JUMP button jumps (y ${Math.round(sy)})`); await page.waitForTimeout(700);
    const far = await page.evaluate(() => { const gm = S.run.game; gm.s.goal = gm.B[5].id; let k = 0, falls = 0; while (S.screen === 'site' && k < 8000) { const f = gm.s.flash; S.run.def.auto(S.run.g, gm); hostStep(1 / 60); if (gm.s.flash > f) falls++; k++; } return {screen:S.screen, role:S.role, last:gm.B[5].id, falls, secs:Math.round(k / 60)}; });
    check(far.screen === 'role' && far.role === far.last && far.falls === 0, `${dev} site: the robot crosses the whole site to the last building without falling (${far.secs}s) and its door opens that job's card`);
    await tap('[data-a="back"]'); await page.waitForFunction(() => S.screen === 'site' && S.run && S.run.game);
    const own = await page.evaluate(() => { const gm = S.run.game; gm.s.goal = S.ranked[0]; let k = 0; while (S.screen === 'site' && k < 9000) { S.run.def.auto(S.run.g, gm); hostStep(1 / 60); k++; } return {screen:S.screen, role:S.role, bolts:Object.keys(S.site.got).length}; });
    check(own.screen === 'game' && own.role === 'design', `${dev} site: walking back and through your own door starts your job (${own.bolts} bolts picked up on the way)`);
    await page.waitForFunction(() => S.run && S.run.game && S.run.def === GAMES.design, null, {timeout:5000});
    await fit('game');
    // real input on the flight game: space starts the flight, a key and an on-screen button steer
    await page.keyboard.press(' '); await page.waitForTimeout(250);
    check(await page.evaluate(() => S.run.game.s.phase) === 'fly', `${dev} space bar starts the flight`);
    const x0 = await page.evaluate(() => S.run.game.s.x);
    await page.keyboard.down('ArrowRight'); await page.waitForTimeout(350); await page.keyboard.up('ArrowRight');
    const x1 = await page.evaluate(() => S.run.game.s.x);
    check(x1 > x0 + 20, `${dev} right arrow key steers (${Math.round(x0)} -> ${Math.round(x1)})`);
    await page.dispatchEvent('[data-pad="l"]', 'pointerdown', {pointerId:1}); await page.waitForTimeout(350); await page.dispatchEvent('[data-pad="l"]', 'pointerup', {pointerId:1});
    const x2 = await page.evaluate(() => S.run.game.s.x);
    check(x2 < x1 - 20, `${dev} on-screen left button steers (${Math.round(x1)} -> ${Math.round(x2)})`);
    const box = await page.locator('#gc').boundingBox();
    await page.mouse.move(box.x + box.width * .9, box.y + box.height * .5); await page.mouse.down(); await page.waitForTimeout(400); await page.mouse.up();
    check(await page.evaluate(() => S.run.game.s.x) > x2 + 20, `${dev} holding a finger on the canvas steers towards it`);

    let plays = 0;
    for (const id of ROLES) {
      await page.evaluate(id => { S.role = id; S.easy = false; go('game'); }, id);
      await page.waitForFunction(() => S.run && S.run.game, null, {timeout:5000});
      const idle = await page.evaluate(() => { for (let i = 0; i < 600; i++) hostStep(1 / 60); hostDraw(); return S.run.g.over; });
      check(!idle, `${dev} ${id}: does not end by itself in the first 10 seconds`);
      const r = await page.evaluate(() => { const r = hostSim(15000); hostDraw(); return r; });
      const secs = Math.round((r.steps + 600) / 60);
      check(r.over && r.stars >= 2, `${dev} ${id}: the robot finishes with ${r.stars} stars in ${secs}s ("${r.line}")`);
      check(secs >= 40 && secs <= 150, `${dev} ${id}: a good play takes 40 to 150 seconds (${secs})`);
      await page.waitForFunction(() => S.screen === 'result', null, {timeout:5000}); plays++;
      if (id === 'design') { await page.waitForTimeout(350); await fit('result'); await tap('[data-a="know2"][data-v="2"]'); }
    }
    const t = await page.evaluate(() => tallyRead());
    check(t.plays === plays && t.before[0] === 1 && t.after[2] === 1 && t.up === 1, `${dev} the tally counted ${t.plays} plays and the before/after answers`);
    // slow mode, skip, explore, stats, quick demo, new player
    await page.evaluate(() => { S.role = 'design'; go('game'); }); await page.waitForFunction(() => S.run && S.run.game);
    await tap('[data-a="easy"]'); await page.waitForFunction(() => S.run && S.run.game && S.run.g.easy);
    check(true, `${dev} slow mode restarts the job with easy on`);
    await tap('[data-a="skip"]');
    check(await page.evaluate(() => S.screen === 'result' && S.last === 0), `${dev} skipping a job gives 0 stars`);
    await tap('[data-a="site"]'); await page.waitForFunction(() => S.screen === 'site' && S.run && S.run.game);
    check(await page.evaluate(() => S.run.game.s.x > 300), `${dev} back to the site puts you outside the building you just left`);
    await tap('[data-to="explore"]'); await fit('explore');
    await tap('[data-a="open"][data-id="sustainability"]'); await page.waitForTimeout(350); await fit('role-explore');
    await page.evaluate(() => go('stats')); await fit('stats');
    await tap('[data-to="start"]'); await tap('[data-a="quick"]');
    check(await page.evaluate(() => S.screen === 'explore' && !S.name), `${dev} quick demo goes straight to the six engineers`);
    await tap('[data-a="reset"]');
    check(await page.evaluate(() => S.screen === 'start' && !S.picks.length), `${dev} new player clears everything`);
    check(errs.length === 0, `${dev} no page errors ${errs.join(' | ')}`);
    if (dev === 'phone') {
      const dist = await page.evaluate(() => { const ids = SKILLS.map(s => s.id), c = {}; let n = 0;
        for (const a of ids) for (const b of ids) for (const d of ids) if (a !== b && b !== d && a !== d) { const r = match([a, b, d])[0]; c[r] = (c[r] || 0) + 1; n++; } return {n, c}; });
      console.log('role spread over', dist.n, 'ordered picks:', JSON.stringify(dist.c));
      check(Object.keys(dist.c).length === 6 && Math.min(...Object.values(dist.c)) / dist.n > 0.1, 'every role comes up for at least 10% of picks');
    }
    await ctx.close();
  }
  await browser.close();
  console.log(fails.length ? `\n${fails.length} FAILED:\n` + fails.join('\n') : '\nALL PASSED');
  process.exit(fails.length ? 1 : 0);
})();
