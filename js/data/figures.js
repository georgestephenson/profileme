// Historical "profile twins" dataset. Trait values (0-100) are COARSE
// ILLUSTRATIVE ESTIMATES adapted from published historiometric research:
// - US presidents: expert personality ratings from Rubenzer & Faschingbauer,
//   "Personality, Character, and Leadership in the White House" (2004).
// - Cognitive bands: Cox (1926), "The Early Mental Traits of Three Hundred
//   Geniuses" — historiometric estimates, not test scores.
// - Others: biographical consensus, labeled as such.
// Only deceased historical figures are included: no published estimates exist
// for living people, and inventing them would be fabrication.
// N = emotional stability (high = stable), matching the app's convention.

export const FIGURES = [
  {
    name: 'George Washington', era: '1732-1799', tag: 'The disciplined founder',
    traits: { E: 55, A: 50, C: 92, N: 72, O: 35 },
    note: 'Legendary self-control and duty; famously reserved and conventional in ideas.',
    basis: 'presidents',
  },
  {
    name: 'Abraham Lincoln', era: '1809-1865', tag: 'The melancholy visionary',
    traits: { E: 45, A: 72, C: 65, N: 28, O: 85 },
    note: 'Deep empathy and openness paired with lifelong bouts of melancholy.',
    basis: 'presidents',
  },
  {
    name: 'Thomas Jefferson', era: '1743-1826', tag: 'The polymath idealist',
    traits: { E: 40, A: 55, C: 75, N: 60, O: 95 },
    note: 'Insatiable intellectual range: statesman, architect, scientist, farmer.',
    basis: 'presidents-cox',
  },
  {
    name: 'Theodore Roosevelt', era: '1858-1919', tag: 'The human dynamo',
    traits: { E: 98, A: 40, C: 76, N: 70, O: 80 },
    note: 'The highest extraversion ever rated in the presidential study.',
    basis: 'presidents',
  },
  {
    name: 'John F. Kennedy', era: '1917-1963', tag: 'The charismatic improviser',
    traits: { E: 90, A: 55, C: 32, N: 65, O: 76 },
    note: 'Immense charm and openness; famously low on rules and routine.',
    basis: 'presidents',
  },
  {
    name: 'Richard Nixon', era: '1913-1994', tag: 'The brilliant grudge-holder',
    traits: { E: 40, A: 15, C: 70, N: 22, O: 55 },
    note: 'Driven and capable, undone by suspicion and hostility — the cautionary profile.',
    basis: 'presidents',
  },
  {
    name: 'Napoleon Bonaparte', era: '1769-1821', tag: 'The relentless strategist',
    traits: { E: 75, A: 25, C: 85, N: 55, O: 70 },
    note: 'Extraordinary drive and tactical mind; low agreeableness at continental scale.',
    basis: 'bio-cox',
  },
  {
    name: 'Isaac Newton', era: '1643-1727', tag: 'The obsessive genius',
    traits: { E: 15, A: 20, C: 85, N: 30, O: 92 },
    note: 'Among the highest cognitive estimates in Cox (1926); solitary, prickly, unstoppable.',
    basis: 'bio-cox',
  },
  {
    name: 'Marie Curie', era: '1867-1934', tag: 'The unbreakable researcher',
    traits: { E: 25, A: 55, C: 95, N: 55, O: 90 },
    note: 'Two Nobel Prizes through sheer methodical persistence under hardship.',
    basis: 'bio',
  },
  {
    name: 'Leonardo da Vinci', era: '1452-1519', tag: 'The boundless imaginer',
    traits: { E: 55, A: 60, C: 35, N: 60, O: 100 },
    note: 'Perhaps history’s greatest openness — and a notorious non-finisher of projects.',
    basis: 'bio-cox',
  },
  {
    name: 'Charles Darwin', era: '1809-1882', tag: 'The patient observer',
    traits: { E: 30, A: 75, C: 82, N: 38, O: 90 },
    note: 'Twenty years of meticulous evidence-gathering; gentle, anxious, thorough.',
    basis: 'bio-cox',
  },
  {
    name: 'Benjamin Franklin', era: '1706-1790', tag: 'The pragmatic charmer',
    traits: { E: 80, A: 65, C: 70, N: 76, O: 90 },
    note: 'Scientist, diplomat, entrepreneur, wit — the well-rounded high scorer.',
    basis: 'bio-cox',
  },
  {
    name: 'Wolfgang Amadeus Mozart', era: '1756-1791', tag: 'The playful prodigy',
    traits: { E: 75, A: 55, C: 50, N: 45, O: 92 },
    note: 'Effortless brilliance, restless energy, chaotic finances.',
    basis: 'bio-cox',
  },
  {
    name: 'Florence Nightingale', era: '1820-1910', tag: 'The systematizing reformer',
    traits: { E: 40, A: 62, C: 95, N: 45, O: 75 },
    note: 'Invented modern nursing with statistics and iron discipline.',
    basis: 'bio',
  },
];

export const BASIS_LABELS = {
  presidents: 'Adapted from expert ratings in Rubenzer & Faschingbauer (2004)',
  'presidents-cox': 'Adapted from Rubenzer & Faschingbauer (2004); cognitive estimate from Cox (1926)',
  'bio-cox': 'Biographical consensus; cognitive estimate from Cox (1926) historiometry',
  bio: 'Biographical consensus',
};

// Similarity: 100 minus mean absolute trait distance across the Big Five.
export function matchFigures(userTraits, topN = 3) {
  const keys = ['E', 'A', 'C', 'N', 'O'];
  return FIGURES
    .map((f) => {
      const dist = keys.reduce((s, k) => s + Math.abs(userTraits[k] - f.traits[k]), 0) / keys.length;
      return { ...f, similarity: Math.round(100 - dist) };
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topN);
}
