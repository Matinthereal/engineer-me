// Play one engineer's game headlessly with its own auto() robot and save screenshots along the way.
// Usage: flock /tmp/engineer-me-shot.lock heavy node tools/shot.cjs <roleId> [--idle] [--easy]
// Writes tools/shots/<roleId>-NN.png (phone size) and prints the result as JSON.
const {chromium} = require(process.env.PW || '/home/matindarwish/.npm/_npx/9833c18b2d85bc59/node_modules/playwright-core');
const path = require('path');
const role = process.argv[2], idle = process.argv.includes('--idle'), easy = process.argv.includes('--easy');
(async () => {
  const b = await chromium.launch({executablePath:'/usr/bin/chromium-browser', headless:true});
  const p = await (await b.newContext({viewport:{width:390, height:844}, hasTouch:true, isMobile:true, deviceScaleFactor:2})).newPage();
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/favicon|fonts\.g/.test(m.text() + m.location().url)) errs.push(m.text()); });
  await p.goto('file://' + path.resolve(__dirname, '../index.html')); await p.waitForTimeout(300);
  await p.evaluate(([role, easy]) => { S.role = role; S.easy = easy; S.name = 'Amira'; S.av = {skin:3, hair:'hijab', col:9, glasses:false, outfit:'hivis', gear:'goggles'}; go('game'); }, [role, easy]);
  await p.waitForFunction(() => S.run && S.run.game, null, {timeout:5000});
  let n = 0; const snap = async () => { await p.evaluate(() => hostDraw()); await p.screenshot({path:path.resolve(__dirname, `shots/${role}${idle ? '-idle' : ''}-${String(++n).padStart(2, '0')}.png`)}); };
  await snap();
  let r = {over:false, steps:0}, total = 0;
  for (let i = 0; i < 40 && !r.over; i++) {
    r = await p.evaluate(idle => { if (!idle) return hostSim(300); const g = S.run.g; let k = 0; while (!g.over && k < 300) { hostStep(1 / 60); k++; } return {over:g.over, stars:g.stars, steps:k, line:S.line}; }, idle);
    total += r.steps; if (i < 9 || r.over) await snap();
  }
  const hud = await p.evaluate(() => [document.querySelector('#ghint').textContent, document.querySelector('#gscore').textContent]);
  console.log(JSON.stringify({role, idle, easy, over:r.over, stars:r.stars, seconds:Math.round(total / 60), line:r.line, hud, shots:n, errors:errs}));
  await b.close();
})();
