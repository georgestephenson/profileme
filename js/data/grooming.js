// Grooming habit items and scoring.

// Frequency-scored habits. The health-anchored items (oral care, sun
// protection, sleep-adjacent hygiene) have real evidence behind them; the
// presentation items are supported by consistent person-perception findings.
export const GROOMING_ITEMS = [
  { id: 'brush', text: 'I brush my teeth twice a day.' },
  { id: 'floss', text: 'I floss (or use interdental brushes) daily.' },
  { id: 'dentist', text: 'I get a dental checkup at least once a year.' },
  { id: 'shower', text: 'I shower/bathe daily and use deodorant.' },
  { id: 'spf', text: 'I use sunscreen or SPF moisturizer on my face daily.' },
  { id: 'hair', text: 'I keep my hair cut/styled on a regular schedule.' },
  { id: 'nails', text: 'I keep nails, skin, and facial hair tidy.' },
  { id: 'clothes', text: 'My everyday clothes fit well and are in good repair.' },
];

export const FREQ = [
  { value: 1, label: 'Never' },
  { value: 2, label: 'Rarely' },
  { value: 3, label: 'Sometimes' },
  { value: 4, label: 'Usually' },
  { value: 5, label: 'Always' },
];

export function scoreGrooming(answers) {
  const vals = GROOMING_ITEMS.map((i) => answers[i.id]);
  if (vals.some((v) => !v)) return null;
  const sum = vals.reduce((a, b) => a + b, 0);
  return Math.round(((sum - GROOMING_ITEMS.length) / (GROOMING_ITEMS.length * 4)) * 100);
}

