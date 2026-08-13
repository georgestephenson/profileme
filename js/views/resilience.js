import { el, card, saveBar, statCard } from '../ui.js';
import { getProfile, update } from '../store.js';
import {
  STRESS_ITEMS, STRESS_SCALE, scoreStress,
  GSE_ITEMS, GSE_SCALE, scoreGse,
  GRIT_ITEMS, GRIT_SCALE, scoreGrit,
} from '../data/resilience.js';
import { breakdownRadar } from '../radar.js';

export function renderResilience(rerender) {
  const saved = getProfile().resilience;
  const draft = {
    stressAnswers: { ...(saved?.stressAnswers || {}) },
    gseAnswers: saved?.gseAnswers ? [...saved.gseAnswers] : Array(10).fill(null),
    gritAnswers: saved?.gritAnswers ? [...saved.gritAnswers] : Array(8).fill(null),
  };

  const container = el('div', {},
    el('h2', {}, 'Mind & resilience'),
    el('p', { class: 'view-intro' },
      'Three short instruments: perceived stress (adapted from the style of Cohen\'s PSS-4), the General Self-Efficacy Scale (Schwarzer & Jerusalem, 1995 — free to use), and grit (original items in the style of Duckworth\'s Grit-S, whose scale is copyrighted). Together they measure how you handle pressure, obstacles, and long goals.'));

  // Results
  const stress = saved?.stressAnswers ? scoreStress(saved.stressAnswers) : null;
  const gse = saved?.gseAnswers ? scoreGse(saved.gseAnswers) : null;
  const grit = saved?.gritAnswers ? scoreGrit(saved.gritAnswers) : null;
  if (stress !== null || gse !== null || grit !== null) {
    const stats = [];
    if (stress !== null) stats.push(statCard({
      label: 'Perceived stress', value: `${stress}/16`,
      sub: stress <= 5 ? 'low' : stress <= 9 ? 'moderate' : 'high',
      tone: stress <= 5 ? 'good' : stress <= 9 ? 'ok' : 'bad',
    }));
    if (gse !== null) stats.push(statCard({
      label: 'Self-efficacy', value: `${gse}/40`,
      sub: gse >= 33 ? 'high' : gse >= 27 ? 'moderate' : 'lower',
      tone: gse >= 33 ? 'good' : gse >= 27 ? 'ok' : 'bad',
    }));
    if (grit !== null) stats.push(statCard({
      label: 'Grit', value: `${grit}/5`,
      sub: grit >= 4 ? 'very gritty' : grit >= 3.2 ? 'gritty' : 'developing',
      tone: grit >= 4 ? 'good' : grit >= 3.2 ? 'ok' : 'bad',
    }));
    container.append(card('Your results', el('div', { class: 'stat-grid' }, stats)));

    const radar = breakdownRadar([
      { label: 'Low stress', value: stress !== null ? ((16 - stress) / 16) * 100 : null },
      { label: 'Self-efficacy', value: gse !== null ? ((gse - 10) / 30) * 100 : null },
      { label: 'Grit', value: grit !== null ? ((grit - 1) / 4) * 100 : null },
    ]);
    if (radar) container.append(card('Resilience breakdown', radar));
  }

  const likertBlock = (items, scale, get, set, namePrefix) =>
    items.map((item, i) =>
      el('div', { class: 'likert-item' },
        el('p', {}, el('span', { class: 'num' }, `${i + 1}.`), typeof item === 'string' ? item : item.text),
        el('div', { class: 'likert-options' },
          scale.map((opt) =>
            el('label', {},
              el('input', {
                type: 'radio', name: `${namePrefix}-${i}`, value: opt.value,
                checked: get(i) === opt.value,
                onchange: () => set(i, opt.value),
              }),
              opt.label)))));

  container.append(
    card('Perceived stress (last month)',
      ...likertBlock(STRESS_ITEMS, STRESS_SCALE,
        (i) => draft.stressAnswers[STRESS_ITEMS[i].id],
        (i, v) => (draft.stressAnswers[STRESS_ITEMS[i].id] = v), 'stress')),
    card('General Self-Efficacy Scale',
      ...likertBlock(GSE_ITEMS, GSE_SCALE,
        (i) => draft.gseAnswers[i],
        (i, v) => (draft.gseAnswers[i] = v), 'gse')),
    card('Grit',
      ...likertBlock(GRIT_ITEMS, GRIT_SCALE,
        (i) => draft.gritAnswers[i],
        (i, v) => (draft.gritAnswers[i] = v), 'grit'),
      saveBar(() => {
        const complete = Object.keys(draft.stressAnswers).length === STRESS_ITEMS.length
          && draft.gseAnswers.every((v) => v) && draft.gritAnswers.every((v) => v);
        if (!complete) {
          alert('Please answer every item in all three sections.');
          return;
        }
        update('resilience', { ...draft, completedAt: new Date().toISOString() });
        rerender();
        window.scrollTo(0, 0);
      })));

  return container;
}
