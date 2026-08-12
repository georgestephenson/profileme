import { el, card, numberField, selectField, saveBar } from '../ui.js';
import { getProfile, update } from '../store.js';
import { UCLA3_ITEMS, UCLA3_OPTIONS } from '../data/benchmarks.js';

export function renderRelationships(rerender) {
  const saved = getProfile().relationships;
  const draft = {
    ucla: saved?.ucla ? [...saved.ucla] : [null, null, null],
    closeFriends: saved?.closeFriends ?? null,
    weeklyInteractions: saved?.weeklyInteractions ?? null,
    familyContactsPerWeek: saved?.familyContactsPerWeek ?? null,
    partnerStatus: saved?.partnerStatus ?? 'single',
    partnerSatisfaction: saved?.partnerSatisfaction ?? null,
  };

  const container = el('div', {},
    el('h2', {}, 'Relationships & social health'),
    el('p', { class: 'view-intro' },
      'Social connection is a health metric — it predicts mortality on par with smoking (Holt-Lunstad et al., 2010). This module uses the UCLA 3-item loneliness scale, a short validated screen, plus simple contact measures.'));

  if (saved?.ucla?.every((v) => v)) {
    const total = saved.ucla.reduce((a, b) => a + b, 0);
    const lonely = total >= 6;
    container.append(card('Your result',
      el('p', {},
        'Loneliness screen: ', el('strong', {}, `${total} / 9`), ' ',
        el('span', { class: `badge ${lonely ? 'bad' : 'good'}` }, lonely ? 'Lonely range (6+)' : 'Not lonely range')),
      el('p', { class: 'hint' },
        'Scores of 6 or more are conventionally classed as "lonely" in research using this scale. This is a screen, not a diagnosis.')));
  }

  const uclaItems = UCLA3_ITEMS.map((text, i) =>
    el('div', { class: 'likert-item' },
      el('p', {}, text),
      el('div', { class: 'likert-options' },
        UCLA3_OPTIONS.map((opt) =>
          el('label', {},
            el('input', {
              type: 'radio', name: `ucla-${i}`, value: opt.value,
              checked: draft.ucla[i] === opt.value,
              onchange: () => (draft.ucla[i] = opt.value),
            }),
            opt.label)))));

  container.append(
    card('UCLA 3-item loneliness scale', ...uclaItems),
    card('Social contact',
      numberField({
        label: 'Close friends',
        sub: 'People you could call in a crisis at 3am.',
        min: 0, max: 50, value: draft.closeFriends, onInput: (v) => (draft.closeFriends = v),
      }),
      numberField({
        label: 'Meaningful social interactions per week',
        sub: 'Real conversations, shared meals, activities — not passive scrolling.',
        min: 0, max: 100, value: draft.weeklyInteractions, onInput: (v) => (draft.weeklyInteractions = v),
      }),
      numberField({
        label: 'Family contacts per week',
        sub: 'Calls, visits, or meals with family members.',
        min: 0, max: 50, value: draft.familyContactsPerWeek, onInput: (v) => (draft.familyContactsPerWeek = v),
      }),
      selectField({
        label: 'Relationship status',
        value: draft.partnerStatus,
        options: [
          { value: 'single', label: 'Single' },
          { value: 'partnered', label: 'In a relationship / married' },
        ],
        onChange: (v) => (draft.partnerStatus = v),
      }),
      numberField({
        label: 'Relationship satisfaction (1-10, if partnered)',
        sub: 'Relationship quality — not just having one — is what predicts well-being.',
        min: 1, max: 10, value: draft.partnerSatisfaction, onInput: (v) => (draft.partnerSatisfaction = v),
      }),
      saveBar(() => {
        if (draft.ucla.some((v) => !v)) {
          alert('Please answer all three loneliness questions.');
          return;
        }
        update('relationships', { ...draft });
        rerender();
      })));

  return container;
}
