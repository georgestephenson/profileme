import { el, card, statCard } from '../ui.js';
import { getProfile, update } from '../store.js';
import { GROOMING_ITEMS, FREQ, scoreGrooming } from '../data/grooming.js';

export function renderGrooming(rerender) {
  const saved = getProfile().grooming;
  const answers = { ...(saved?.answers || {}) };

  const container = el('div', {},
    el('h2', {}, 'Grooming & presentation'),
    el('p', { class: 'view-intro' },
      'Daily upkeep habits. The health items carry real evidence — oral hygiene is linked to cardiovascular health, and daily SPF is the single best-evidenced anti-aging intervention (Hughes et al., 2013, RCT). The presentation items track how consistently you show up well-kept, which reliably shapes first impressions.'));

  const score = saved?.answers ? scoreGrooming(saved.answers) : null;
  if (score !== null) {
    container.append(card('Your result',
      el('div', { class: 'stat-grid' },
        statCard({
          label: 'Grooming score', value: `${score}`, sub: 'out of 100',
          tone: score >= 70 ? 'good' : score >= 45 ? 'ok' : 'bad',
        }))));
  }

  const progressNote = el('p', { class: 'progress-note' });
  const submitBtn = el('button', { class: 'btn' }, score !== null ? 'Re-score' : 'Score my habits');
  function refresh() {
    const n = Object.keys(answers).length;
    progressNote.textContent = `${n} / ${GROOMING_ITEMS.length} answered`;
    submitBtn.disabled = n < GROOMING_ITEMS.length;
  }

  const items = GROOMING_ITEMS.map((item, idx) =>
    el('div', { class: 'likert-item' },
      el('p', {}, el('span', { class: 'num' }, `${idx + 1}.`), item.text),
      el('div', { class: 'likert-options' },
        FREQ.map((opt) =>
          el('label', {},
            el('input', {
              type: 'radio', name: `groom-${item.id}`, value: opt.value,
              checked: answers[item.id] === opt.value,
              onchange: () => { answers[item.id] = opt.value; refresh(); },
            }),
            opt.label)))));

  submitBtn.addEventListener('click', () => {
    update('grooming', { answers, completedAt: new Date().toISOString() });
    rerender();
    window.scrollTo(0, 0);
  });

  refresh();
  container.append(card('Habits', progressNote, ...items,
    el('div', { style: 'margin-top:1rem;' }, submitBtn)));
  return container;
}
