import { el, card, numberField, saveBar, statCard } from '../ui.js';
import { getProfile, update } from '../store.js';

// Satisfaction With Life Scale (Diener et al., 1985) — 5 items, free to use
// with attribution; among the most-validated well-being measures in existence.
export const SWLS_ITEMS = [
  'In most ways my life is close to my ideal.',
  'The conditions of my life are excellent.',
  'I am satisfied with my life.',
  'So far I have gotten the important things I want in life.',
  'If I could live my life over, I would change almost nothing.',
];

const SWLS_SCALE = [1, 2, 3, 4, 5, 6, 7];
const SWLS_LABELS = { 1: 'Strongly disagree', 4: 'Neutral', 7: 'Strongly agree' };

export function swlsCategory(total) {
  if (total >= 31) return 'Extremely satisfied';
  if (total >= 26) return 'Satisfied';
  if (total >= 21) return 'Slightly satisfied';
  if (total === 20) return 'Neutral';
  if (total >= 15) return 'Slightly dissatisfied';
  if (total >= 10) return 'Dissatisfied';
  return 'Extremely dissatisfied';
}

export function scoreWellbeing(w) {
  if (!w?.swls || w.swls.some((v) => !v)) return null;
  const total = w.swls.reduce((a, b) => a + b, 0); // 5-35
  const swlsScore = ((total - 5) / 30) * 100;
  let sleepScore = null;
  if (w.sleepHours) {
    sleepScore = w.sleepHours >= 7 && w.sleepHours <= 9 ? 100
      : w.sleepHours >= 6 && w.sleepHours <= 10 ? 60 : 25;
  }
  const parts = [swlsScore, sleepScore].filter((x) => x !== null);
  return {
    total,
    category: swlsCategory(total),
    score: Math.round(parts.reduce((a, b) => a + b, 0) / parts.length),
  };
}

export function renderWellbeing(rerender) {
  const saved = getProfile().wellbeing;
  const draft = {
    swls: saved?.swls ? [...saved.swls] : [null, null, null, null, null],
    sleepHours: saved?.sleepHours ?? null,
  };

  const container = el('div', {},
    el('h2', {}, 'Well-being'),
    el('p', { class: 'view-intro' },
      'Life satisfaction via the Satisfaction With Life Scale (Diener et al., 1985) — one of the most-validated instruments in psychology — plus sleep, the single most underrated health behavior.'));

  const result = scoreWellbeing(saved);
  if (result) {
    container.append(card('Your result',
      el('div', { class: 'stat-grid' },
        statCard({
          label: 'Life satisfaction', value: `${result.total}/35`,
          sub: result.category,
          tone: result.total >= 26 ? 'good' : result.total >= 20 ? 'ok' : 'bad',
        }),
        saved.sleepHours ? statCard({
          label: 'Sleep', value: `${saved.sleepHours}h`,
          sub: saved.sleepHours >= 7 && saved.sleepHours <= 9 ? 'in the 7-9h sweet spot' : 'outside the 7-9h range',
          tone: saved.sleepHours >= 7 && saved.sleepHours <= 9 ? 'good' : 'ok',
        }) : null)));
  }

  const items = SWLS_ITEMS.map((text, i) =>
    el('div', { class: 'likert-item' },
      el('p', {}, el('span', { class: 'num' }, `${i + 1}.`), text),
      el('div', { class: 'likert-options' },
        SWLS_SCALE.map((v) =>
          el('label', {},
            el('input', {
              type: 'radio', name: `swls-${i}`, value: v,
              checked: draft.swls[i] === v,
              onchange: () => (draft.swls[i] = v),
            }),
            SWLS_LABELS[v] ?? String(v))))));

  container.append(card('Satisfaction With Life Scale', ...items,
    numberField({
      label: 'Typical sleep per night (hours)',
      sub: '7-9 hours is the adult consensus recommendation (AASM/SRS).',
      min: 3, max: 14, value: draft.sleepHours, onInput: (v) => (draft.sleepHours = v),
    }),
    saveBar(() => {
      if (draft.swls.some((v) => !v)) {
        alert('Please answer all five statements.');
        return;
      }
      update('wellbeing', { ...draft, completedAt: new Date().toISOString() });
      rerender();
    })));

  return container;
}
