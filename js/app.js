'use strict';
/* Screens, state, the tally for the stand, and the host that runs each engineer's game. */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const app = $('#app');
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rnd = n => Math.floor(Math.random() * n);
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const STAND = new URLSearchParams(location.search).has('stand');   // add ?stand to the address at a stall

/* ---------- tally: counts only, kept on this device, no names ---------- */
const TALLY_KEY = 'engineer-me-tally';
const tallyBlank = () => ({plays:0, roles:{}, stars:[0, 0, 0, 0], before:[0, 0, 0], after:[0, 0, 0], both:0, up:0});
function tallyRead() { try { return Object.assign(tallyBlank(), JSON.parse(localStorage.getItem(TALLY_KEY)) || {}); } catch (e) { return tallyBlank(); } }
function tally(fn) { try { const t = tallyRead(); fn(t); localStorage.setItem(TALLY_KEY, JSON.stringify(t)); } catch (e) {} }

/* ---------- state ---------- */
const fresh = () => ({screen:'start', av:{skin:2, hair:'short', col:1, glasses:false, outfit:'overalls', gear:'none'}, name:'', know:null, know2:null, picks:[], ranked:[], role:null, explore:false, done:{}, last:0, line:'', run:null, easy:false});
let S = fresh();
const who = () => S.name.trim() ? esc(S.name.trim()) : 'You';
const role = () => ROLES[S.role];
const KNOW = ['Not much', 'A bit', 'Lots'];

function go(screen) { S.screen = screen; S.run = null; render(); window.scrollTo(0, 0); const h = $('h1,h2', app); if (h) { h.tabIndex = -1; h.focus({preventScroll:true}); } }
function render(keep) {
  const fk = keep && document.activeElement && document.activeElement.getAttribute('data-f');
  const r = role();
  document.documentElement.style.setProperty('--role', r ? r.c : '#1D3FBF');
  document.documentElement.style.setProperty('--role-d', r ? r.cd : '#14275E');
  app.innerHTML = (S.screen === 'start' ? '' : topbar()) + SCREENS[S.screen]();
  if (AFTER[S.screen]) AFTER[S.screen]();
  if (fk) { const el = $(`[data-f="${fk}"]`); if (el) el.focus({preventScroll:true}); }
}
const BACK = {know:'start', look:'know', skills:'look', role:() => S.explore ? 'explore' : 'skills', game:'role', result:'role', explore:() => S.ranked.length ? 'result' : 'start', stats:'start'};
function topbar() {
  const step = {know:1, look:1, skills:2, role:3, game:4, result:4, explore:4, stats:4}[S.screen];
  return `<header class="top"><button class="back" data-a="back" aria-label="Go back">${icon('back')}</button>
<ol class="steps" aria-label="Step ${step} of 4">${[1,2,3,4].map(i => `<li class="${i <= step ? 'on' : ''}"></li>`).join('')}</ol><span class="brand">${GAME_NAME}</span></header>`;
}

/* ---------- screens ---------- */
const SCREENS = {}, AFTER = {};

SCREENS.start = () => `<section class="hero">
<div class="trio" aria-hidden="true">
<div class="avw">${avatar({skin:4, hair:'curly', col:0, outfit:'hivis', gear:'hardhat'}, '#EA580C')}</div>
<div class="avw">${avatar({skin:1, hair:'hijab', col:9, outfit:'labcoat', gear:'goggles'}, '#BE185D')}</div>
<div class="avw">${avatar({skin:2, hair:'short', col:1, glasses:true, outfit:'flight', gear:'headset'}, '#F5E12B')}</div></div>
<h1>What kind of engineer could you be?</h1>
<p class="lead">Engineers do not just fix things. They design, code, test and invent. Make your character and try a real job.</p>
<div class="row center"><button class="btn big" data-a="go" data-to="know">${icon('play')} Start</button>
${STAND ? `<button class="btn blue" data-a="quick">Quick demo</button>` : ''}</div>
<p class="fact"><b>Did you know?</b> Nearly 1 in 5 jobs in the UK are in engineering and technology.</p>
<p class="tiny">${GAME_NAME} is a student idea for the Rolls-Royce Future Makers Challenge. It is not an official Rolls-Royce product.${STAND ? ' <button class="link" data-a="go" data-to="stats">Stand tally</button>' : ''}</p></section>`;

SCREENS.know = () => `<h2>One quick question first</h2><p>How much do you know about what engineers do?</p>
<div class="know">${KNOW.map((k, i) => `<button class="btn sec" data-a="know" data-v="${i}">${k}</button>`).join('')}</div>`;

const thumb = (patch, crop) => `<div class="avw">${avatar({...S.av, ...patch}, '#F5E12B', '', crop)}</div>`;
SCREENS.look = () => {
  const a = S.av;
  return `<h2>Make your character</h2><p>Engineers look like everyone. Make yours look however you like.</p>
<div class="look"><div class="me"><div class="avw">${avatar(a, '#F5E12B', 'Your character')}</div>
<div class="field"><label for="nm">Name or nickname (if you want)</label><input id="nm" maxlength="14" autocomplete="off" value="${esc(S.name)}" placeholder="Type here"></div></div>
<div><div class="grp"><h3 id="g1">Skin</h3><div class="sw" role="group" aria-labelledby="g1">${SKIN.map((c, i) => `<button style="background:${c}" data-a="av" data-k="skin" data-v="${i}" data-f="sk${i}" aria-pressed="${a.skin === i}" aria-label="Skin tone ${i + 1}"></button>`).join('')}</div></div>
<div class="grp"><h3 id="g2">Hair or headwear</h3><div class="styles" role="group" aria-labelledby="g2">${HAIR.map(([id, n]) => `<button data-a="av" data-k="hair" data-v="${id}" data-f="h${id}" aria-pressed="${a.hair === id}">${thumb({hair:id, gear:'none', glasses:false}, 'head')}${n}</button>`).join('')}</div></div>
<div class="grp"><h3 id="g3">Colour</h3><div class="sw" role="group" aria-labelledby="g3">${COLS.map(([n, c], i) => `<button style="background:${c}" data-a="av" data-k="col" data-v="${i}" data-f="c${i}" aria-pressed="${a.col === i}" aria-label="${n}"></button>`).join('')}</div></div>
<div class="grp"><h3 id="g4">Work clothes</h3><div class="styles five" role="group" aria-labelledby="g4">${OUTFITS.map(([id, n]) => `<button data-a="av" data-k="outfit" data-v="${id}" data-f="o${id}" aria-pressed="${a.outfit === id}">${thumb({outfit:id, gear:'none'}, 'body')}${n}</button>`).join('')}</div></div>
<div class="grp"><h3 id="g5">Safety kit</h3><div class="styles five" role="group" aria-labelledby="g5">${GEAR.map(([id, n]) => { const no = id === 'hardhat' && a.hair === 'turban'; return `<button data-a="av" data-k="gear" data-v="${id}" data-f="k${id}" aria-pressed="${a.gear === id}" ${no ? 'disabled' : ''}>${thumb({gear:id}, 'head')}${n}</button>`; }).join('')}</div></div>
<div class="grp"><button class="tog" data-a="av" data-k="glasses" data-f="gl" aria-pressed="${a.glasses}">${icon('glasses')} Glasses</button></div>
<button class="btn wide" data-a="go" data-to="skills">Next: pick your skills</button></div></div>`;
};
AFTER.look = () => { $('#nm').addEventListener('input', e => { S.name = e.target.value; }); };

SCREENS.skills = () => {
  const full = S.picks.length === 3;
  return `<h2>Pick 3 things you like doing</h2><p>There are no wrong answers. Tap one again to un-pick it.</p>
<div class="skills">${SKILLS.map(s => { const on = S.picks.includes(s.id); return `<button class="skill ${full && !on ? 'dim' : ''}" data-a="pick" data-id="${s.id}" data-f="s${s.id}" aria-pressed="${on}">${icon(s.i)}<span>${s.n}</span></button>`; }).join('')}</div>
<div class="bar"><span role="status">${S.picks.length} of 3 picked</span><span class="row"><button class="btn sec" data-a="surprise">Surprise me</button><button class="btn" data-a="match" ${full ? '' : 'disabled'}>Find my engineer</button></span></div>`;
};

SCREENS.role = () => {
  const r = role(), def = GAMES[S.role], why = S.picks.filter(p => r.w[p]), mine = !S.explore, also = mine && S.ranked[1];
  return `<section class="pop"><div class="rolehead"><div class="avw">${avatar(S.av, r.c, 'Your character as ' + r.n, 'head')}</div>
<div><p>${mine ? who() + ' could be ' + (/^[AEIOU]/.test(r.n) ? 'an' : 'a') : 'Meet the'}</p><h2>${r.n}</h2><p>${r.tag}</p></div></div>
${mine && why.length ? `<h3>Why it fits you</h3><ul class="chips">${why.map(p => `<li>${icon(SKILL[p].i)}${SKILL[p].n}</li>`).join('')}</ul>` : ''}
<div class="info">
<div class="card"><h3>${icon(r.i)} The job</h3><p>${r.does}</p></div>
<div class="card"><h3>${icon('cog')} At Rolls-Royce</h3><p>${r.rr}</p></div>
<div class="card green"><h3>${icon('leaf')} Helping the planet</h3><p>${r.planet}</p></div>
</div>
<div class="how"><h3>Your job today: ${def.title}</h3><ol>${def.how.map(h => `<li>${h}</li>`).join('')}</ol>
<button class="btn big" data-a="play">${icon('play')} Start the job</button></div>
${also ? `<p>You would also suit: <b>${ROLES[also].n}</b>.</p>` : ''}</section>`;
};

SCREENS.game = () => {
  const def = GAMES[S.role], arrows = [...def.pads].filter(k => 'lrud'.includes(k)), rot = {l:270, r:90, u:0, d:180}, name = {l:'left', r:'right', u:'up', d:'down'};
  return `<div class="gamegrid"><div class="chhead"><h2>${def.title}</h2><span id="chstars">${stars(0)}</span></div>
<div class="hud"><p class="hint" id="ghint" role="status"></p><p class="hint" id="gscore"></p></div>
<p class="turn">Turn your phone upright for a bigger game.</p>
<div class="gwrap"><canvas id="gc" width="360" height="480" tabindex="0" aria-label="${def.title}. ${def.how.join(' ')}"></canvas></div>
${def.pads ? `<div class="pads"><div>${arrows.map(k => `<button data-pad="${k}" aria-label="${name[k]}">${icon('arrow', rot[k])}</button>`).join('')}</div>${def.pads.includes('a') ? `<button class="act" data-pad="a">${def.action || 'GO'}</button>` : ''}</div>` : ''}
<div class="row center glinks"><button class="link" data-a="easy">${S.easy ? 'Normal speed' : 'Too fast? Slow it down'}</button><button class="link" data-a="skip">Skip this job</button></div></div>`;
};
AFTER.game = () => hostStart();

SCREENS.result = () => {
  const r = role(), n = S.last, v = VERDICT[n].map(t => t.replace('{r}', r.n.toLowerCase())), ask = S.know !== null && S.know2 === null;
  return `<section class="result pop"><div class="avw">${avatar(S.av, r.c, 'Your character')}</div><div class="badge">${r.n}</div>
${stars(n, 'xl')}<h2>${v[0]}${who() === 'You' ? '' : ', ' + who()}!</h2>
<p style="max-width:28em">${S.line ? S.line + ' ' : ''}${v[1]}</p>
${ask ? `<div class="ask" id="ask">Now how much do you know about what engineers do?<div class="row">${KNOW.map((k, i) => `<button class="btn sec" data-a="know2" data-v="${i}">${k}</button>`).join('')}</div></div>` : ''}
<div class="card next"><h3>${icon('flag')} Your next steps</h3>
<p><b>Try this now:</b> ${r.try}</p>
<p><b>Subjects that help:</b> ${r.subjects}.</p>
<p><b>When you are older:</b> Rolls-Royce runs work experience weeks. After your GCSEs you could start an apprenticeship there. You are paid while you learn, over £18,000 in the first year. University is another way in. Both can lead to this job.</p></div>
<div class="row center"><button class="btn" data-a="go" data-to="explore">Try another engineer</button><button class="btn sec" data-a="play">Play again</button></div>
<button class="link" data-a="reset">New player</button></section>`;
};

SCREENS.explore = () => `<h2>Six kinds of engineer</h2><p>Pick one to see what they do and try their job.</p>
<div class="roles">${ROLE_IDS.map(id => { const r = ROLES[id]; return `<button class="roletile" style="--role:${r.c};--role-d:${r.cd}" data-a="open" data-id="${id}">${icon(r.i)}<span>${r.n}</span><small>${GAMES[id].title}</small>${stars(S.done[id] || 0)}</button>`; }).join('')}</div>
<div class="row center"><button class="btn sec" data-a="reset">New player</button></div>`;

SCREENS.stats = () => {
  const t = tallyRead(), row = (a, b) => `<tr><td>${a}</td><td>${b}</td></tr>`;
  return `<h2>Stand tally</h2><p>Counts from this device only. No names are kept.</p>
<table class="tally">${row('Jobs played', t.plays)}${ROLE_IDS.map(id => row('&nbsp; ' + ROLES[id].n, t.roles[id] || 0)).join('')}
${row('Stars: 0 / 1 / 2 / 3', t.stars.join(' / '))}
${row('Before: ' + KNOW.join(' / '), t.before.join(' / '))}${row('After: ' + KNOW.join(' / '), t.after.join(' / '))}
${row('Answered both questions', t.both)}${row('Said they know more afterwards', t.up + (t.both ? ` (${Math.round(t.up / t.both * 100)}%)` : ''))}</table>
<div class="row"><button class="btn sec" data-a="wipe">Clear the tally</button><button class="btn" data-a="go" data-to="start">Done</button></div>`;
};

/* ---------- actions ---------- */
const ACT = {
  go: d => go(d.to),
  back: () => { const b = BACK[S.screen]; go(typeof b === 'function' ? b() : b); },
  know: d => { S.know = +d.v; tally(t => t.before[S.know]++); go('look'); },
  know2: d => { S.know2 = +d.v; tally(t => { t.after[S.know2]++; t.both++; if (S.know2 > S.know) t.up++; }); $('#ask').textContent = S.know2 > S.know ? 'Brilliant. That is what this game is for.' : 'Thanks for telling us!'; },
  av: d => {
    if (d.k === 'glasses') S.av.glasses = !S.av.glasses; else S.av[d.k] = 'skin col'.includes(d.k) ? +d.v : d.v;
    if (S.av.hair === 'turban' && S.av.gear === 'hardhat') S.av.gear = 'none';
    render(true);
  },
  pick: (d, el) => {
    const i = S.picks.indexOf(d.id);
    if (i >= 0) S.picks.splice(i, 1); else if (S.picks.length < 3) S.picks.push(d.id); else { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); return; }
    render(true);
  },
  surprise: () => { S.picks = shuffle(SKILLS.map(s => s.id)).slice(0, 3); ACT.match(); },
  match: () => { if (S.picks.length !== 3) return; S.ranked = match(S.picks); S.role = S.ranked[0]; S.explore = false; go('role'); },
  quick: () => { S = fresh(); S.av = randomLook(); go('explore'); },
  play: () => go('game'),
  easy: () => { S.easy = !S.easy; go('game'); },
  skip: () => { S.last = 0; S.line = ''; go('result'); },
  open: d => { S.role = d.id; S.explore = true; go('role'); },
  reset: () => { S = fresh(); go('start'); },
  wipe: () => { try { localStorage.removeItem(TALLY_KEY); } catch (e) {} render(); },
};
const randomLook = () => ({skin:rnd(SKIN.length), hair:HAIR[rnd(HAIR.length)][0], col:rnd(6), glasses:!rnd(4), outfit:OUTFITS[rnd(OUTFITS.length)][0], gear:'none'});
app.addEventListener('click', e => { const b = e.target.closest('[data-a]'); if (b && !b.disabled && ACT[b.dataset.a]) ACT[b.dataset.a](b.dataset, b); });

/* ---------- game host ----------
   Each file in js/games/ adds one entry to GAMES:
     GAMES.<roleId> = {
       title: 'Test flight',              // shown above the canvas and on the role card
       how: ['short line', 'short line'], // 2 or 3 "how to play" lines for a 9 year old
       pads: 'lr',                        // on-screen buttons: any of l r u d, plus a for one action button; '' for tap-only games
       action: 'COOL',                    // label of the action button when pads has 'a'
       make(g) { return {step(dt) {}, draw(c) {}}; },   // build a new game; called once per play
       auto(g, game) {},                  // test robot: called before every step, sets g.key / g.press / g.tap so the game is played well
     };
   The host owns the canvas (360 x 480, portrait), the loop (fixed 1/60 s steps), input and the result screen. */
const GAMES = {};
const KEYMAP = {ArrowLeft:'l', a:'l', A:'l', ArrowRight:'r', d:'r', D:'r', ArrowUp:'u', w:'u', W:'u', ArrowDown:'d', s:'d', S:'d', ' ':'a', Enter:'a'};
function hostStart() {
  const def = GAMES[S.role], cv = $('#gc'), c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
  const g = {
    W:360, H:480, c, av:S.av, accent:role().c, role:S.role, name:who(), easy:S.easy, t:0, over:false, stars:0,
    key:{l:0, r:0, u:0, d:0, a:0},       // held right now
    press:{l:0, r:0, u:0, d:0, a:0},     // went down since the last step (true for one step)
    ptr:{x:0, y:0, down:false},          // finger or mouse on the canvas, in canvas units
    tap:null,                            // {x, y} for the one step after the canvas is pressed, else null
    rnd,
    hud(text) { const el = $('#ghint'); if (el && el.textContent !== text) el.textContent = text; },
    score(text) { const el = $('#gscore'); if (el && el.textContent !== text) el.textContent = text; },
    setStars(n) { g.stars = Math.max(0, Math.min(3, n)); const el = $('#chstars'); if (el) el.innerHTML = stars(g.stars); },
    // finish the job: stars 0..3 and one short sentence for the result screen, e.g. "You flew through 9 of 10 rings."
    end(n, line) {
      if (g.over) return; g.over = true; g.setStars(n); S.last = g.stars; S.line = line || '';
      S.done[S.role] = Math.max(S.done[S.role] || 0, g.stars);
      tally(t => { t.plays++; t.roles[S.role] = (t.roles[S.role] || 0) + 1; t.stars[g.stars]++; });
      setTimeout(() => { if (S.run === run) go('result'); }, 1500);
    },
  };
  const run = S.run = {g, def, game:null, endT:0};
  const at = e => { const b = cv.getBoundingClientRect(); g.ptr.x = (e.clientX - b.left) * g.W / b.width; g.ptr.y = (e.clientY - b.top) * g.H / b.height; };
  cv.addEventListener('pointerdown', e => { e.preventDefault(); at(e); g.ptr.down = true; g.tap = {x:g.ptr.x, y:g.ptr.y}; try { cv.setPointerCapture(e.pointerId); } catch (_) {} });
  cv.addEventListener('pointermove', at);
  for (const n of ['pointerup', 'pointercancel', 'lostpointercapture']) cv.addEventListener(n, () => { g.ptr.down = false; });
  cv.addEventListener('contextmenu', e => e.preventDefault());
  $$('[data-pad]').forEach(el => {
    const k = el.dataset.pad, off = () => { g.key[k] = 0; el.classList.remove('down'); };
    el.addEventListener('pointerdown', e => { e.preventDefault(); if (!g.key[k]) g.press[k] = 1; g.key[k] = 1; el.classList.add('down'); try { el.setPointerCapture(e.pointerId); } catch (_) {} });
    for (const n of ['pointerup', 'pointercancel', 'lostpointercapture']) el.addEventListener(n, off);
    el.addEventListener('contextmenu', e => e.preventDefault());
  });
  const begin = () => {
    if (S.run !== run) return;
    run.game = def.make(g);
    let last = performance.now(), acc = 0;
    const loop = ts => {
      if (S.run !== run) return;
      acc += Math.min(.05, (ts - last) / 1000); last = ts;
      while (acc >= 1 / 60) { hostStep(1 / 60); acc -= 1 / 60; }
      hostDraw(); requestAnimationFrame(loop);
    };
    hostDraw(); requestAnimationFrame(loop);
  };
  // canvas text needs the font; do not wait long for it
  Promise.race([document.fonts ? document.fonts.load('20px "Jersey 15"') : 0, new Promise(r => setTimeout(r, 700))]).then(begin, begin);
}
function hostStep(dt) {
  const run = S.run, g = run.g; g.t += dt;
  if (g.over) run.endT += dt;
  run.game.step(dt);
  g.tap = null; g.press = {l:0, r:0, u:0, d:0, a:0};
}
function hostDraw() {
  const run = S.run, g = run.g, c = g.c; if (!run.game) return;
  run.game.draw(c);
  if (g.over && run.endT > .25) {
    ART.box(c, 50, 180, 260, 104, '#fff', 4, 6);
    ART.text(c, g.stars ? 'Job done!' : 'Time is up', 180, 192, 34, ART.P.navy, 'center');
    for (let i = 0; i < 3; i++) ART.star(c, 180 - 62 + i * 44, 236, 3, i < g.stars);
  }
}
// test robot: play the current game with its own auto() until it ends
function hostSim(max = 20000) { const run = S.run, g = run.g; let n = 0; while (!g.over && n < max) { run.def.auto(g, run.game); hostStep(1 / 60); n++; } g.key = {l:0, r:0, u:0, d:0, a:0}; return {over:g.over, stars:g.stars, steps:n, line:S.line}; }

addEventListener('keydown', e => {
  const run = S.run, k = KEYMAP[e.key]; if (!run || !k || e.target.tagName === 'INPUT') return;
  e.preventDefault();
  if (document.activeElement && document.activeElement.tagName === 'BUTTON') $('#gc').focus({preventScroll:true});
  if (!run.g.key[k]) run.g.press[k] = 1; run.g.key[k] = 1;
});
addEventListener('keyup', e => { const run = S.run, k = KEYMAP[e.key]; if (run && k) run.g.key[k] = 0; });

/* at a stall, an abandoned game goes back to the start after 75 seconds */
let idleT = 0;
function idle() { clearTimeout(idleT); if (STAND) idleT = setTimeout(() => { if (S.screen !== 'start' && S.screen !== 'stats') { S = fresh(); go('start'); } }, 75000); }
for (const n of ['pointerdown', 'keydown']) addEventListener(n, idle, true);

function boot() { render(); idle(); }
