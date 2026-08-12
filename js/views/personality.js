import { el, card, traitBar } from '../ui.js';
import { getProfile, update } from '../store.js';
import { ITEMS, LIKERT, TRAITS, TRAIT_DESCRIPTIONS, scoreIpip } from '../data/ipip.js';

export function renderPersonality(rerender) {
  const saved = getProfile().personality;
  const answers = { ...(saved?.answers || {}) };

  const container = el('div', {},
    el('h2', {}, 'Personality — Big Five'),
    el('p', { class: 'view-intro' },
      'The 50-item IPIP Big Five factor markers (Goldberg, 1992) — a public-domain, extensively validated measure of the five major personality dimensions. Rate how accurately each statement describes you. There are no good or bad results: this is a profile, not a grade.'));

  const traits = saved?.answers ? scoreIpip(saved.answers) : null;
  if (traits) {
    container.append(card('Your trait profile',
      Object.keys(TRAITS).map((t) =>
        el('div', {},
          traitBar({ name: TRAITS[t], value: traits[t] }),
          el('p', { class: 'hint', style: 'margin-bottom:0.8rem;' }, TRAIT_DESCRIPTIONS[t]))),
      el('p', { class: 'hint' },
        'Scores are your position on each 10-item scale (0-100), not population percentiles. Retake any time — answers below are pre-filled.')));
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
    update('personality', { answers, completedAt: new Date().toISOString() });
    rerender();
    window.scrollTo(0, 0);
  });

  refreshProgress();
  container.append(card('Questionnaire', progressNote, ...items,
    el('div', { style: 'margin-top:1rem;' }, submitBtn)));
  return container;
}
