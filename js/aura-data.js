/* ============================================================
   AURA DATA — 7 colors, each with a unique reading
   Color, glow, and 3 sentences describing personality + energy.
   ============================================================ */

const AURAS = [
  {
    id: 'gold',
    name: 'Gold',
    color: '#ffc857',
    glow: 'rgba(255, 200, 87, 0.6)',
    title: 'You have a Gold Aura',
    reading: `You radiate the warmth of late-summer sunlight — confident, generous, and quietly magnetic. People seek you out when they need to remember their own worth, and you have a gift for turning ordinary moments into something luminous. Your energy is the kind that builds kingdoms out of kindness.`
  },
  {
    id: 'violet',
    name: 'Violet',
    color: '#a97cff',
    glow: 'rgba(169, 124, 255, 0.6)',
    title: 'You have a Violet Aura',
    reading: `You move through the world with one foot in dreams and the other in the unseen. Intuition runs through you like a second pulse, and you sense things others spend years learning to notice. Your presence is calm but layered — the deeper someone looks, the more they find.`
  },
  {
    id: 'blue',
    name: 'Blue',
    color: '#5fb4ff',
    glow: 'rgba(95, 180, 255, 0.6)',
    title: 'You have a Blue Aura',
    reading: `You carry the stillness of deep water — clear, honest, and steadier than you let on. Words mean something when you say them, and people trust you with their truth because you hold it gently. Your energy heals rooms just by being in them.`
  },
  {
    id: 'green',
    name: 'Green',
    color: '#5fd49a',
    glow: 'rgba(95, 212, 154, 0.6)',
    title: 'You have a Green Aura',
    reading: `You are growing, always — quietly, stubbornly, in directions no one predicted. There is a living patience to you, the kind that turns small efforts into forests over time. People feel safer just standing near you, even when you have not said a word.`
  },
  {
    id: 'red',
    name: 'Red',
    color: '#ff5e6c',
    glow: 'rgba(255, 94, 108, 0.6)',
    title: 'You have a Red Aura',
    reading: `You burn with the kind of fire that does not ask permission. Passion, hunger, courage — they live in you so loudly that pretending otherwise has never worked. Your energy wakes people up, sometimes uncomfortably, and the world is better for it.`
  },
  {
    id: 'white',
    name: 'White',
    color: '#f5f0ff',
    glow: 'rgba(245, 240, 255, 0.7)',
    title: 'You have a White Aura',
    reading: `You are a rare frequency — the kind of clear that comes from having walked through a lot and come out softer, not harder. Your energy feels like the moment just after a long exhale. People do not always understand you, but they remember how you made them feel.`
  },
  {
    id: 'orange',
    name: 'Orange',
    color: '#ff9a52',
    glow: 'rgba(255, 154, 82, 0.6)',
    title: 'You have an Orange Aura',
    reading: `You are the spark at the edge of a flame — curious, creative, and impossible to pin down. Joy finds its way to you easily, and you spread it with a laugh that is hard to fake. Your energy is contagious in the best way: it pulls people out of their heads and into their lives.`
  }
];

// Deterministic-ish but fun: pick random per session, but not the same twice in a row
let lastAuraId = null;
function pickRandomAura() {
  let pool = AURAS.filter(a => a.id !== lastAuraId);
  const choice = pool[Math.floor(Math.random() * pool.length)];
  lastAuraId = choice.id;
  return choice;
}
