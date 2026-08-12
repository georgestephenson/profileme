import { el, card, numberField, selectField, saveBar } from '../ui.js';
import { getProfile, update } from '../store.js';

export function renderBasics() {
  const draft = { age: null, sex: 'male', ...(getProfile().basics || {}) };

  return el('div', {},
    el('h2', {}, 'Basics'),
    el('p', { class: 'view-intro' },
      'Age and sex are used to select the right benchmark tables (fitness norms and net-worth expectations differ by both). Start here — other modules use these values.'),
    card(null,
      numberField({ label: 'Age', min: 13, max: 100, value: draft.age, onInput: (v) => (draft.age = v) }),
      selectField({
        label: 'Sex',
        sub: 'Used only to pick physiological benchmark tables.',
        value: draft.sex,
        options: [
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
        ],
        onChange: (v) => (draft.sex = v),
      }),
      saveBar(() => update('basics', { ...draft }))));
}
