import { el, card, traitBar } from '../ui.js';
import { getProfile, update } from '../store.js';
import { ITEMS, LIKERT, TRAITS, TRAIT_DESCRIPTIONS, scoreIpip, HH_ITEMS, scoreHH } from '../data/ipip.js';
import { breakdownRadar } from '../radar.js';

export function renderPersonality(rerender) {
  const saved = getProfile().personality;
  const answers = { ...(saved?.answers || {}) };

  const container = el('div', {},
    el('h2', {}, 'Personality — Big Five'),
    el('p', { class: 'view-intro' },
      'The 50-item IPIP Big Five factor markers (Goldberg, 1992) — a public-domain, extensively validated measure of the five major personality dimensions. Rate how accurately each statement describes you. There are no good or bad results: this is a profile, not a grade.'));

  const traits = saved?.answers ? scoreIpip(saved.answers) : null;
  const hhScore = saved?.hhAnswers ? scoreHH(saved.hhAnswers) : null;
  if (traits) {
    const radar = breakdownRadar([
      { label: 'Extraversion', value: traits.E },
      { label: 'Agreeableness', value: traits.A },
      { label: 'Conscientious', value: traits.C },
      { label: 'Stability', value: traits.N },
      { label: 'Openness', value: traits.O },
      hhScore !== null ? { label: 'Honesty', value: hhScore } : null,
    ].filter(Boolean));
    if (radar) {
      container.append(card('Trait shape', radar,
        el('p', { class: 'hint' }, 'Your personality as a shape, not a score — there is no "good" polygon here.')));
    }
  }

  if (traits || hhScore !== null) {
    container.append(card('Your trait profile',
      traits ? Object.keys(TRAITS).map((t) =>
        el('div', {},
          traitBar({ name: TRAITS[t], value: traits[t] }),
          el('p', { class: 'hint', style: 'margin-bottom:0.8rem;' }, TRAIT_DESCRIPTIONS[t]))) : [],
      hhScore !== null && el('div', {},
        traitBar({ name: 'Honesty-Humility (HEXACO supplement)', value: hhScore }),
        el('p', { class: 'hint', style: 'margin-bottom:0.8rem;' },
          'Sincerity, fairness, and modesty — the sixth factor from the HEXACO model, a stronger predictor of integrity-related behavior than any Big Five trait.')),
      el('p', { class: 'hint' },
        'Scores are your position on each scale (0-100), not population percentiles. Retake any time — answers below are pre-filled.')));
  }

  const progressNote = el('p', { class: 'progress-note' });
  const submitBtn = el('button', { class: 'btn' }, traits ? 'Re-score' : 'Score my answers');

  function refreshProgress() {
    const n = Object.keys(answers).length;
    progressNote.textContent = `${n} / ${ITEMS.length} answered`;
    submitBtn.disabled = n < ITEMS.length;
  }

  const items = ITEMS.map((item) =>
    el('div', { class: 'likert-item' },
      el('p', {}, el('span', { class: 'num' }, `${item.id}.`), `I… ${item.text}`),
      el('div', { class: 'likert-options' },
        LIKERT.map((opt) =>
          el('label', {},
            el('input', {
              type: 'radio',
              name: `ipip-${item.id}`,
              value: opt.value,
              checked: answers[item.id] === opt.value,
              onchange: () => { answers[item.id] = opt.value; refreshProgress(); },
            }),
            opt.label)))));

  submitBtn.addEventListener('click', () => {
    update('personality', { ...(getProfile().personality || {}), answers, completedAt: new Date().toISOString() });
    rerender();
    window.scrollTo(0, 0);
  });

  refreshProgress();
  container.append(card('Questionnaire', progressNote, ...items,
    el('div', { style: 'margin-top:1rem;' }, submitBtn)));

  // Optional HEXACO Honesty-Humility supplement
  const hhAnswers = { ...(saved?.hhAnswers || {}) };
  const hhNote = el('p', { class: 'progress-note' });
  const hhBtn = el('button', { class: 'btn' }, hhScore !== null ? 'Re-score supplement' : 'Score supplement');
  function refreshHH() {
    const n = Object.keys(hhAnswers).length;
    hhNote.textContent = `${n} / ${HH_ITEMS.length} answered`;
    hhBtn.disabled = n < HH_ITEMS.length;
  }
  const hhItems = HH_ITEMS.map((item, idx) =>
    el('div', { class: 'likert-item' },
      el('p', {}, el('span', { class: 'num' }, `${idx + 1}.`), `I… ${item.text}`),
      el('div', { class: 'likert-options' },
        LIKERT.map((opt) =>
          el('label', {},
            el('input', {
              type: 'radio', name: `hh-${item.id}`, value: opt.value,
              checked: hhAnswers[item.id] === opt.value,
              onchange: () => { hhAnswers[item.id] = opt.value; refreshHH(); },
            }),
            opt.label)))));
  hhBtn.addEventListener('click', () => {
    update('personality', { ...(getProfile().personality || {}), hhAnswers });
    rerender();
    window.scrollTo(0, 0);
  });
  refreshHH();
  container.append(card('Optional — Honesty-Humility supplement (HEXACO)',
    el('p', { class: 'hint', style: 'margin-bottom:0.4rem;' },
      'Ten items in the style of the public-domain IPIP HEXACO scales. Adds the sixth personality factor, which predicts integrity-related outcomes beyond the Big Five.'),
    hhNote, ...hhItems,
    el('div', { style: 'margin-top:1rem;' }, hhBtn)));

  return container;
}
