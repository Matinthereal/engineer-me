// Headless play-through of every screen and challenge at three device sizes.
// Run: heavy node tools/test.cjs
const {chromium} = require(process.env.PW || '/home/matindarwish/.npm/_npx/9833c18b2d85bc59/node_modules/playwright-core');
const path = require('path');
const url = 'file://' + path.resolve(__dirname, '../index.html');
const shots = path.resolve(__dirname, 'shots');
const SIZES = {phone:{width:390, height:844, hasTouch:true, isMobile:true}, ipad:{width:820, height:1180, hasTouch:true}, laptop:{width:1366, height:768}};
const fails = [];
const check = (ok, what) => { if (!ok) fails.push(what); console.log((ok ? 'ok   ' : 'FAIL ') + what); };

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
    await page.goto(url); await page.waitForTimeout(400);
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
    await page.waitForTimeout(450); await snap('role');

    const play = {
      software: async () => {
        await tap('[data-k="r"]'); await tap('[data-k="r"]'); await tap('[data-a="botRun"]'); await page.waitForTimeout(1900);
        check(/Bump/.test(await page.textContent('#msg')), `${dev} bot: bad code bumps`);
        await snap('software-bump');
        await tap('[data-a="botUndo"]'); await tap('[data-a="botUndo"]');
        for (const [i, sol] of ['rurrdr', 'ddrrrddr', 'uurrruu'].entries()) {
          for (const k of sol) await tap(`[data-k="${k}"]`);
          await tap('[data-a="botRun"]'); await page.waitForSelector('#nextslot button', {timeout:8000});
          if (i === 1) await snap('software-won');
          if (i < 2) await tap('[data-a="botNext"]');
        }
      },
      electrical: async () => {
        for (let lv = 0; lv < 3; lv++) {
          if (lv === 2) await snap('electrical-mid');
          const todo = await page.evaluate(() => { const g = S.g, out = []; for (const [x, y] of g.L.path) { const t = g.t[y][x]; let k = 0; while (turn(t.base, t.r + k) !== t.need) k++; out.push([x, y, k]); } return out; });
          for (const [x, y, k] of todo) for (let i = 0; i < k; i++) await tap(`.tile[data-x="${x}"][data-y="${y}"]`);
          await page.waitForSelector('#nextslot button', {timeout:3000}); await page.waitForTimeout(250);
          if (lv < 2) await tap('[data-a="wireNext"]');
        }
      },
      materials: async () => { for (const [i, id] of ['cf', 'nickel', 'steel'].entries()) { await tap(`[data-a="matPick"][data-id="${id}"]`); if (i < 2) await tap('[data-a="matNext"]'); } },
      manufacturing: async () => {
        await tap('[data-id="turb"]'); check(/Not that one/.test(await page.textContent('#msg')), `${dev} build: wrong part refused`);
        for (const id of ['fan', 'comp', 'comb', 'turb', 'noz']) await tap(`[data-a="mfgPlace"][data-id="${id}"]`);
        await snap('manufacturing-built'); await tap('[data-a="mfgNext"]');
        for (let q = 0; q < 2; q++) { if (q === 1) await snap('manufacturing-tiny-crack'); const bad = await page.evaluate(() => S.g.bad); await tap(`[data-a="mfgBlade"][data-i="${bad}"]`); if (q === 0) await tap('[data-a="mfgNext"]'); }
      },
      sustainability: async () => {
        check(await page.isDisabled('[data-a="ecoOn"]'), `${dev} town: switch-on disabled when empty`);
        for (const id of ['smr', 'wind', 'wind', 'solar']) await tap(`[data-a="ecoStep"][data-id="${id}"][data-v="1"]`);
        await tap('[data-a="ecoOn"]');
      },
      design: async () => {
        await tap('[data-a="fanTest"]'); await page.waitForTimeout(500); check(!(await page.evaluate(() => S.g.won)), `${dev} fan: first design fails`); await snap('design-failed-test');
        await tap('[data-k="size"][data-v="2"]'); await tap('[data-k="mat"][data-v="2"]'); await tap('[data-k="shape"][data-v="1"]'); await tap('[data-a="fanTest"]');
      },
    };
    for (const id of Object.keys(play)) {
      await page.evaluate(id => { S.role = id; go('challenge'); }, id);
      await snap(id + '-start');
      await play[id]();
      const st = await page.evaluate(() => S.ch.stars);
      check(st === (id === 'design' ? 3 : 3), `${dev} ${id}: perfect play gives 3 stars (got ${st})`);
      await snap(id + '-end');
      await tap('[data-a="finish"]');
      if (id === 'software') { await page.waitForTimeout(450); await snap('result'); }
    }
    await page.evaluate(() => go('explore')); await snap('explore');
    await tap('[data-a="open"][data-id="sustainability"]'); await page.waitForTimeout(450); await snap('role-explore');
    await tap('[data-a="back"]'); await tap('[data-a="reset"]');
    check(await page.evaluate(() => S.screen === 'start' && !S.name && !S.picks.length), `${dev} new player clears everything`);
    check(errs.length === 0, `${dev} no page errors ${errs.join(' | ')}`);

    if (dev === 'phone') {
      const dist = await page.evaluate(() => { const ids = SKILLS.map(s => s.id), c = {}; let n = 0;
        for (const a of ids) for (const b of ids) for (const d of ids) if (a !== b && b !== d && a !== d) { const r = match([a, b, d])[0]; c[r] = (c[r] || 0) + 1; n++; } return {n, c}; });
      console.log('role spread over', dist.n, 'ordered picks:', JSON.stringify(dist.c));
      check(Object.keys(dist.c).length === 6 && Math.min(...Object.values(dist.c)) / dist.n > 0.1, 'every role comes up for at least 10% of picks');
      const avs = await page.evaluate(() => { document.body.innerHTML = '<div style="display:grid;grid-template-columns:repeat(8,1fr);gap:6px;padding:8px;width:1100px;background:#EEF2FF">' + SKIN.map((_, s) => HAIR.map(([h], i) => `<div class="avw">${avatar({skin:s, hair:h, col:(s + i) % COLS.length, glasses:i % 3 === 0})}</div>`).join('')).join('') + '</div>'; });
      await page.setViewportSize({width:1120, height:900}); await page.screenshot({path:`${shots}/avatars.png`, fullPage:true});
    }
    await ctx.close();
  }
  await browser.close();
  console.log(fails.length ? `\n${fails.length} FAILED:\n` + fails.join('\n') : '\nALL PASSED');
  process.exit(fails.length ? 1 : 0);
})();
