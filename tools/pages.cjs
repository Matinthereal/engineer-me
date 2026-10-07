// Screenshot every non-game screen at phone, iPad and laptop size.
// Usage: flock /tmp/engineer-me-shot.lock heavy node tools/pages.cjs
const {chromium} = require(process.env.PW || '/home/matindarwish/.npm/_npx/9833c18b2d85bc59/node_modules/playwright-core');
const path = require('path');
const SIZES = {phone:{width:390, height:844, hasTouch:true, isMobile:true}, ipad:{width:820, height:1180, hasTouch:true}, laptop:{width:1366, height:768}};
(async () => {
  const b = await chromium.launch({executablePath:'/usr/bin/chromium-browser', headless:true});
  for (const [dev, vp] of Object.entries(SIZES)) {
    const p = await (await b.newContext({viewport:{width:vp.width, height:vp.height}, hasTouch:!!vp.hasTouch, isMobile:!!vp.isMobile, deviceScaleFactor:dev === 'laptop' ? 1 : 2})).newPage();
    const errs = []; p.on('pageerror', e => errs.push(String(e)));
    let n = 0; const snap = async name => { const over = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth); if (over > 0) console.log(`${dev} ${name}: sideways scroll ${over}px`); await p.screenshot({path:path.resolve(__dirname, `shots/page-${dev}-${String(++n).padStart(2, '0')}-${name}.png`), fullPage:true}); };
    await p.goto('file://' + path.resolve(__dirname, '../index.html') + '?stand'); await p.waitForTimeout(500);
    await snap('start'); await p.click('[data-to="know"]'); await snap('know'); await p.click('[data-a="know"][data-v="0"]');
    await p.fill('#nm', 'Amira'); await p.click('[data-v="hijab"]'); await p.click('[data-k="col"][data-v="9"]'); await p.click('[data-k="skin"][data-v="3"]'); await p.click('[data-k="outfit"][data-v="labcoat"]'); await p.click('[data-k="gear"][data-v="goggles"]');
    await snap('look'); await p.click('[data-to="skills"]');
    for (const id of ['draw', 'maths', 'talk']) await p.click(`[data-id="${id}"]`);
    await snap('skills'); await p.click('[data-a="match"]'); await p.waitForTimeout(400); await snap('role');
    await p.evaluate(() => { S.last = 3; S.line = 'You flew through 11 of 12 gates and landed safely.'; S.done.design = 3; go('result'); }); await p.waitForTimeout(400); await snap('result');
    await p.click('[data-a="know2"][data-v="2"]'); await p.click('[data-to="explore"]'); await snap('explore');
    await p.evaluate(() => go('stats')); await snap('stats');
    console.log(dev, 'errors:', errs.length, errs.join(' | '));
  }
  await b.close();
})();
