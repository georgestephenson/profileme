// Mind & resilience instruments:
// - Perceived stress: 4 items adapted from the style of Cohen's PSS-4.
// - Self-efficacy: the General Self-Efficacy Scale (Schwarzer & Jerusalem,
//   1995), explicitly free to use.
// - Grit: 8 original items written in the style of Duckworth's Grit-S
//   (perseverance of effort + consistency of interests); the original scale
//   is copyrighted, so we use our own items and say so.

export const STRESS_ITEMS = [
  { id: 'st1', keyed: 1, text: 'In the last month, how often have you felt unable to control the important things in your life?' },
  { id: 'st2', keyed: -1, text: 'In the last month, how often have you felt confident about your ability to handle your personal problems?' },
  { id: 'st3', keyed: -1, text: 'In the last month, how often have you felt that things were going your way?' },
  { id: 'st4', keyed: 1, text: 'In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?' },
];

export const STRESS_SCALE = [
  { value: 0, label: 'Never' },
  { value: 1, label: 'Almost never' },
  { value: 2, label: 'Sometimes' },
  { value: 3, label: 'Fairly often' },
  { value: 4, label: 'Very often' },
];

// 0-16, higher = more stressed
export function scoreStress(answers) {
  let sum = 0;
  for (const item of STRESS_ITEMS) {
    const a = answers[item.id];
    if (a === undefined || a === null) return null;
    sum += item.keyed === 1 ? a : 4 - a;
  }
  return sum;
}

export const GSE_ITEMS = [
  'I can always manage to solve difficult problems if I try hard enough.',
  'If someone opposes me, I can find the means and ways to get what I want.',
  'It is easy for me to stick to my aims and accomplish my goals.',
  'I am confident that I could deal efficiently with unexpected events.',
  'Thanks to my resourcefulness, I know how to handle unforeseen situations.',
  'I can solve most problems if I invest the necessary effort.',
  'I can remain calm when facing difficulties because I can rely on my coping abilities.',
  'When I am confronted with a problem, I can usually find several solutions.',
  'If I am in trouble, I can usually think of a solution.',
  'I can usually handle whatever comes my way.',
];

export const GSE_SCALE = [
  { value: 1, label: 'Not at all true' },
  { value: 2, label: 'Hardly true' },
  { value: 3, label: 'Moderately true' },
  { value: 4, label: 'Exactly true' },
];

// 10-40, higher = more self-efficacious
export function scoreGse(answers) {
  if (answers.length !== 10 || answers.some((v) => !v)) return null;
  return answers.reduce((a, b) => a + b, 0);
}

export const GRIT_ITEMS = [
  { keyed: 1, text: 'I finish whatever I begin.' },
  { keyed: 1, text: 'Setbacks don’t discourage me for long.' },
  { keyed: 1, text: 'I am a hard worker.' },
  { keyed: 1, text: 'I keep working toward goals that take years to reach.' },
  { keyed: -1, text: 'New ideas and projects often pull me away from ones I already started.' },
  { keyed: -1, text: 'My interests change from year to year.' },
  { keyed: -1, text: 'I often set a goal but later choose to pursue a different one.' },
  { keyed: -1, text: 'I lose enthusiasm for projects after a few months.' },
];

export const GRIT_SCALE = [
  { value: 1, label: 'Not like me at all' },
  { value: 2, label: 'Not much like me' },
  { value: 3, label: 'Somewhat like me' },
  { value: 4, label: 'Mostly like me' },
  { value: 5, label: 'Very much like me' },
];

// 1.0-5.0 grit score (Grit-S convention)
export function scoreGrit(answers) {
  if (answers.length !== 8 || answers.some((v) => !v)) return null;
  const sum = answers.reduce((a, b, i) => a + (GRIT_ITEMS[i].keyed === 1 ? b : 6 - b), 0);
  return Math.round((sum / 8) * 10) / 10;
}

// Domain score 0-100: mean of low stress, self-efficacy, and grit.
export function scoreResilience(r) {
  if (!r) return null;
  const parts = [];
  const stress = r.stressAnswers ? scoreStress(r.stressAnswers) : null;
  if (stress !== null) parts.push(((16 - stress) / 16) * 100);
  const gse = r.gseAnswers ? scoreGse(r.gseAnswers) : null;
  if (gse !== null) parts.push(((gse - 10) / 30) * 100);
  const grit = r.gritAnswers ? scoreGrit(r.gritAnswers) : null;
  if (grit !== null) parts.push(((grit - 1) / 4) * 100);
  return parts.length ? Math.round(parts.reduce((a, b) => a + b, 0) / parts.length) : null;
}
