// Cognitive ability battery. Original items written in the formats validated by
// the public-domain ICAR project (icar-project.com): verbal knowledge,
// letter/number series, and matrix reasoning. ICAR-type items correlate ~0.8
// with commercial gold-standard tests (Condon & Revelle, 2014), which is the
// scientific basis for treating this as a usable *estimate*.
//
// Honesty constraint: our norms are provisional (assumed population mean/SD for
// untimed self-administration), so results are reported as a WIDE ESTIMATED
// RANGE, never a precise IQ number.

export const VOCAB_ITEMS = [
  { q: 'ENORMOUS most nearly means:', options: ['tiny', 'huge', 'strange', 'loud'], answer: 1 },
  { q: 'CANDID most nearly means:', options: ['hidden', 'sweet', 'honest', 'quick'], answer: 2 },
  { q: 'ARDUOUS most nearly means:', options: ['difficult', 'passionate', 'lengthy', 'pointless'], answer: 0 },
  { q: 'FRUGAL most nearly means:', options: ['wasteful', 'thrifty', 'fragile', 'cheerful'], answer: 1 },
  { q: 'OBSTINATE most nearly means:', options: ['loud', 'clumsy', 'stubborn', 'obvious'], answer: 2 },
  { q: 'EPHEMERAL most nearly means:', options: ['short-lived', 'heavenly', 'delicate', 'repeating'], answer: 0 },
  { q: 'UBIQUITOUS most nearly means:', options: ['unusual', 'found everywhere', 'ambiguous', 'enormous'], answer: 1 },
  { q: 'TACITURN most nearly means:', options: ['tactful', 'sticky', 'moody', 'untalkative'], answer: 3 },
  { q: 'MOLLIFY most nearly means:', options: ['to soften', 'to shape', 'to annoy', 'to divide'], answer: 0 },
  { q: 'PERSPICACIOUS most nearly means:', options: ['sweaty', 'keenly perceptive', 'suspicious', 'talkative'], answer: 1 },
  { q: 'RECALCITRANT most nearly means:', options: ['repentant', 'chalky', 'defiant', 'forgetful'], answer: 2 },
  { q: 'ENERVATE most nearly means:', options: ['to energize', 'to irritate', 'to weaken', 'to inspire'], answer: 2 },
];

export const SERIES_ITEMS = [
  { q: '2, 4, 6, 8, …', options: ['9', '10', '12', '16'], answer: 1 },
  { q: '5, 10, 20, 40, …', options: ['50', '60', '80', '100'], answer: 2 },
  { q: '64, 32, 16, 8, …', options: ['6', '4', '2', '0'], answer: 1 },
  { q: 'A, C, E, G, …', options: ['H', 'I', 'J', 'K'], answer: 1 },
  { q: '1, 1, 2, 3, 5, 8, …', options: ['11', '12', '13', '15'], answer: 2 },
  { q: '1, 4, 9, 16, …', options: ['20', '24', '25', '36'], answer: 2 },
  { q: '2, 3, 5, 7, 11, …', options: ['12', '13', '14', '15'], answer: 1 },
  { q: '3, 4, 6, 9, 13, …', options: ['17', '18', '19', '21'], answer: 1 },
  { q: 'Z, W, T, Q, …', options: ['N', 'M', 'O', 'P'], answer: 0 },
  { q: '2, 6, 12, 20, 30, …', options: ['40', '42', '44', '46'], answer: 1 },
];

export const ANALOGY_ITEMS = [
  { q: 'Kitten is to Cat as Puppy is to:', options: ['Wolf', 'Dog', 'Bone', 'Litter'], answer: 1 },
  { q: 'Author is to Novel as Composer is to:', options: ['Piano', 'Orchestra', 'Symphony', 'Conductor'], answer: 2 },
  { q: 'Drought is to Rain as Famine is to:', options: ['Hunger', 'Food', 'Poverty', 'Crops'], answer: 1 },
  { q: 'Miser is to Generous as Coward is to:', options: ['Afraid', 'Weak', 'Brave', 'Careful'], answer: 2 },
  { q: 'Scalpel is to Surgeon as Chisel is to:', options: ['Hammer', 'Carpenter', 'Sculptor', 'Stone'], answer: 2 },
  { q: 'Circle is to Sphere as Square is to:', options: ['Rectangle', 'Cube', 'Box', 'Pyramid'], answer: 1 },
  { q: 'Ember is to Fire as Echo is to:', options: ['Cave', 'Silence', 'Sound', 'Wall'], answer: 2 },
  { q: 'Prologue is to Novel as Overture is to:', options: ['Opera', 'Finale', 'Audience', 'Encore'], answer: 0 },
];

// Matrix reasoning: 3x3 grid of symbol cells, last cell missing.
export const MATRIX_ITEMS = [
  {
    grid: ['●', '●●', '●●●', '■', '■■', '■■■', '▲', '▲▲'],
    options: ['▲▲', '▲▲▲', '■■■', '●●●'], answer: 1,
  },
  {
    grid: ['→', '↓', '←', '↓', '←', '↑', '←', '↑'],
    options: ['→', '↑', '↓', '←'], answer: 0,
  },
  {
    grid: ['●', '■', '▲', '■', '▲', '●', '▲', '●'],
    options: ['▲', '●', '■', '◆'], answer: 2,
  },
  {
    grid: ['○', '◐', '●', '◐', '●', '○', '●', '○'],
    options: ['●', '○', '◑', '◐'], answer: 3,
  },
  {
    grid: ['●', '○', '●○', '■', '□', '■□', '▲', '△'],
    options: ['▲▲', '△△', '▲△', '●○'], answer: 2,
  },
  {
    grid: ['●', '■■', '▲▲▲', '■', '▲▲', '●●●', '▲', '●●'],
    options: ['▲▲▲', '■■', '■■■', '●●'], answer: 2,
  },
];

export const SECTIONS = [
  { key: 'vocab', title: 'Verbal knowledge', items: VOCAB_ITEMS, weight: 0.25 },
  { key: 'series', title: 'Letter & number series', items: SERIES_ITEMS, weight: 0.30 },
  { key: 'analogies', title: 'Verbal analogies', items: ANALOGY_ITEMS, weight: 0.20 },
  { key: 'matrix', title: 'Matrix reasoning', items: MATRIX_ITEMS, weight: 0.25 },
];

// Provisional norms for untimed, self-administered testing: assumed population
// mean proportion-correct 0.55, SD 0.17 on the weighted composite.
const NORM_MEAN = 0.55;
const NORM_SD = 0.17;

export function scoreBattery(sectionScores) {
  // sectionScores: { vocab: nCorrect, series: nCorrect, matrix: nCorrect }
  let composite = 0;
  const parts = {};
  for (const s of SECTIONS) {
    const p = (sectionScores[s.key] ?? 0) / s.items.length;
    parts[s.key] = { correct: sectionScores[s.key] ?? 0, total: s.items.length, proportion: p };
    composite += p * s.weight;
  }
  const z = Math.max(-2.67, Math.min(2.67, (composite - NORM_MEAN) / NORM_SD));
  const center = Math.round(100 + 15 * z);
  return {
    parts,
    composite,
    z,
    estimateLow: center - 9,
    estimateHigh: center + 9,
    percentile: Math.round(normalCdf(z) * 100),
  };
}

export function normalCdf(z) {
  // Abramowitz & Stegun approximation
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}
