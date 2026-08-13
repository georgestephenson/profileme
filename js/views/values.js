import { el, card, saveBar } from '../ui.js';
import { getProfile, update } from '../store.js';
import { breakdownRadar } from '../radar.js';

// Ten basic values from Schwartz's circumplex model — the dominant framework
// in values research. Items are original (the PVQ instrument is licensed).
// Values are a PROFILE: ungraded, excluded from the composite.
export const VALUE_ITEMS = [
  { key: 'selfDirection', label: 'Self-direction', text: 'Thinking up new ideas, being creative, and doing things my own way.' },
  { key: 'stimulation', label: 'Stimulation', text: 'An exciting life, full of new experiences and adventure.' },
  { key: 'hedonism', label: 'Hedonism', text: 'Enjoying life\'s pleasures and having a good time.' },
  { key: 'achievement', label: 'Achievement', text: 'Being very successful and having my achievements recognized.' },
  { key: 'power', label: 'Power', text: 'Being in charge — wealth, authority, and influence over others.' },
  { key: 'security', label: 'Security', text: 'Living in safe, stable, and orderly surroundings.' },
  { key: 'conformity', label: 'Conformity', text: 'Following rules and expectations, and not upsetting others.' },
  { key: 'tradition', label: 'Tradition', text: 'Maintaining customs, faith, and the ways of my family and culture.' },
  { key: 'benevolence', label: 'Benevolence', text: 'Helping the people close to me and being deeply loyal to them.' },
  { key: 'universalism', label: 'Universalism', text: 'Equality, justice, and protecting nature — for everyone, not just my own circle.' },
];

const SCALE = [
  { value: 1, label: 'Not important' },
  { value: 2, label: 'Slightly' },
  { value: 3, label: 'Moderately' },
  { value: 4, label: 'Very' },
  { value: 5, label: 'Supremely' },
];

export function renderValues(rerender) {
  const saved = getProfile().values;
  const answers = { ...(saved?.answers || {}) };

  const container = el('div', {},
    el('h2', {}, 'Values'),
    el('p', { class: 'view-intro' },
      'What actually matters to you, mapped onto the ten basic values from Schwartz\'s model — the dominant framework in cross-cultural values research. A profile, not a grade: no value is "better", and this never enters your composite. The shape is what\'s informative — especially your top three.'));

  if (saved?.answers && VALUE_ITEMS.every((v) => saved.answers[v.key])) {
    const ranked = [...VALUE_ITEMS].sort((a, b) => saved.answers[b.key] - saved.answers[a.key]);
    container.append(card('Your value shape',
      breakdownRadar(VALUE_ITEMS.map((v) => ({ label: v.label, value: ((saved.answers[v.key] - 1) / 4) * 100 })), { size: 430 }),
      el('p', {},
        'Top values: ', el('strong', {}, ranked.slice(0, 3).map((v) => v.label).join(', ')), '.'),
      el('p', { class: 'hint' },
        'Adjacent values on the circle tend to go together (e.g. benevolence + universalism); opposite ones trade off (e.g. power vs. universalism). Use your top three as a decision filter: choices aligned with them tend to feel right in hindsight.')));
  }

  const items = VALUE_ITEMS.map((item, i) =>
    el('div', { class: 'likert-item' },
      el('p', {}, el('span', { class: 'num' }, `${i + 1}.`), el('strong', {}, item.label + ': '), item.text),
      el('div', { class: 'likert-options' },
        SCALE.map((opt) =>
          el('label', {},
            el('input', {
              type: 'radio', name: `val-${item.key}`, value: opt.value,
              checked: answers[item.key] === opt.value,
              onchange: () => (answers[item.key] = opt.value),
            }),
            opt.label)))));

  container.append(card('How important is each of these as a guiding principle in your life?',
    ...items,
    saveBar(() => {
      if (!VALUE_ITEMS.every((v) => answers[v.key])) {
        alert('Please rate all ten values.');
        return;
      }
      update('values', { answers, completedAt: new Date().toISOString() });
      rerender();
      window.scrollTo(0, 0);
    })));

  return container;
}
