'use strict';
/* Words and matching. Text is written for a 9 year old: short sentences, everyday words. */
const GAME_NAME = 'Engineer Me';

const SKILLS = [
  {id:'solve', n:'Solving puzzles', i:'bulb'},
  {id:'build', n:'Building things', i:'hammer'},
  {id:'draw', n:'Drawing and designing', i:'pencil'},
  {id:'maths', n:'Working things out', i:'maths'},
  {id:'code', n:'Computers and coding', i:'code'},
  {id:'apart', n:'Finding out how things work', i:'cog'},
  {id:'nature', n:'Caring for the planet', i:'leaf'},
  {id:'team', n:'Working in a team', i:'team'},
  {id:'detail', n:'Spotting tiny details', i:'search'},
  {id:'why', n:'Asking “why?”', i:'why'},
  {id:'talk', n:'Explaining my ideas', i:'talk'},
  {id:'grit', n:'Never giving up', i:'flag'},
];
const SKILL = Object.fromEntries(SKILLS.map(s => [s.id, s]));

const ROLES = {
  design: {
    n:'Aerospace Engineer', i:'pencil', c:'#2447C9', cd:'#14275E',
    tag:'You design things that fly.',
    w:{draw:3, maths:2, talk:2, build:1, solve:1, why:1},
    does:'You design aircraft engines. You draw your ideas, test them, and make them better.',
    rr:'The fan on the newest Rolls-Royce test engine is 140 inches wide. That is about 3.6 metres. It is taller than a basketball hoop!',
    planet:'A better shape burns less fuel. Less fuel means less pollution.',
    subjects:'Design and Technology, Art, Maths, Physics',
    try:'Draw an invention. Then build a model of it from card or LEGO.',
  },
  software: {
    n:'Software Engineer', i:'code', c:'#7E22CE', cd:'#4C1D95',
    tag:'You tell machines what to do.',
    w:{code:3, solve:2, grit:2, maths:1, detail:1, team:1},
    does:'You write code. Code tells machines what to do. When it goes wrong, you find the bug and fix it.',
    rr:'A jet engine is full of sensors. Rolls-Royce software checks the engine is healthy while the plane is flying.',
    planet:'Smart code helps an engine use just the right amount of fuel.',
    subjects:'Computer Science, Maths, Physics',
    try:'Make a game in Scratch, or learn some Python.',
  },
  materials: {
    n:'Materials Engineer', i:'hex', c:'#BE185D', cd:'#831843',
    tag:'You choose what things are made of.',
    w:{why:3, detail:2, apart:2, maths:1, nature:1, team:1},
    does:'You choose what things are made of. Should it be light? Strong? Able to take the heat?',
    rr:'Inside a jet engine, the gas is so hot it could melt the metal blades. Special metals and tiny cooling holes keep them safe.',
    planet:'Lighter parts mean less fuel. Parts that last longer mean less waste.',
    subjects:'Chemistry, Physics, Maths',
    try:'Test things at home. Which paper bridge holds the most coins?',
  },
  manufacturing: {
    n:'Manufacturing Engineer', i:'factory', c:'#C2410C', cd:'#7C2D12',
    tag:'You work out how to build it.',
    w:{build:3, team:2, grit:1, detail:1, apart:1, talk:1},
    does:'You work out how to build things. Which machine does which job? What goes first?',
    rr:'A big jet engine has many thousands of parts. Every one is made, checked and fitted together.',
    planet:'A good factory wastes less metal and uses less energy.',
    subjects:'Design and Technology, Maths, Physics',
    try:'Take an old pen or toy apart. Then put it back together.',
  },
  electrical: {
    n:'Electrical Engineer', i:'bolt', c:'#0369A1', cd:'#0C4A6E',
    tag:'You bring machines to life.',
    w:{apart:3, solve:2, maths:2, code:1, build:1, detail:1},
    does:'You design circuits, motors and batteries. They bring machines to life.',
    rr:'Rolls-Royce built an electric plane called Spirit of Innovation. In 2021 it flew at 345 miles per hour and set world records.',
    planet:'Electric motors make no fumes while they run.',
    subjects:'Physics, Maths, Computer Science',
    try:'Build a circuit with a battery and a bulb, or try a micro:bit.',
  },
  sustainability: {
    n:'Sustainability Engineer', i:'leaf', c:'#15803D', cd:'#14532D',
    tag:'You power the world without hurting it.',
    w:{nature:3, team:2, talk:2, why:1, grit:1},
    does:'You find ways to give people power and travel without hurting the planet.',
    rr:'Rolls-Royce has run jet engines on fuel made from waste, like used cooking oil. It is also designing small nuclear power stations.',
    planet:'This whole job is about the planet. The UK could need up to 725,000 people in new green jobs.',
    subjects:'Science, Geography, Maths',
    try:'Find out what uses the most energy at home or school. How could you cut it?',
  },
};
const ROLE_IDS = Object.keys(ROLES);

// Highest total wins. Ties go to the role that best fits the skill you picked first.
function match(picks) {
  const score = id => picks.reduce((t, p) => t + (ROLES[id].w[p] || 0), 0);
  return ROLE_IDS.slice().sort((a, b) => {
    if (score(b) !== score(a)) return score(b) - score(a);
    for (const p of picks) { const d = (ROLES[b].w[p] || 0) - (ROLES[a].w[p] || 0); if (d) return d; }
    return 0;
  });
}

// Result headline and line by stars. Never "clever" or "brainy": the point is "this could be you".
const VERDICT = [
  ['You had a look around', 'You skipped this one. Have a proper go, or try a different engineer.'],
  ['Job done', 'You finished the job. Play again to earn more stars. Which part did you like best?'],
  ['Yes, this could be you', 'You did what a real {r} does. With practice you could be great at it.'],
  ['Yes! This job fits you', 'That is exactly how a real {r} thinks.'],
];
