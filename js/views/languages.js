import { el, card } from '../ui.js';
import { getProfile, update } from '../store.js';
import { CEFR_LEVELS } from '../data/benchmarks.js';

export function renderLanguages(rerender) {
  const list = [...(getProfile().languages?.list || [])];

  const container = el('div', {},
    el('h2', {}, 'Languages'),
    el('p', { class: 'view-intro' },
      'Self-assess each language on the CEFR scale (Council of Europe framework, A1-C2). Be honest: B2 means you can work and argue in the language; C1 means near-effortless professional use.'));

  const rows = el('div', { class: 'row-list' });

  function save() {
    update('languages', { list: [...list] });
    rerender();
  }

  function renderRows() {
    rows.replaceChildren(...(
      list.length
        ? list.map((lang, i) =>
            el('div', { class: 'row' },
              el('strong', {}, lang.name),
              el('span', { class: 'badge' }, CEFR_LEVELS.find((l) => l.value === lang.level)?.label ?? lang.level),
              el('button', { class: 'row-remove', onclick: () => { list.splice(i, 1); save(); } }, 'Remove')))
        : [el('p', { class: 'empty-note' }, 'No languages added yet — include your native language.')]));
  }

  const nameInput = el('input', { type: 'text', placeholder: 'e.g. Spanish', style: 'max-width:200px;' });
  const levelSelect = el('select', { style: 'max-width:230px;' },
    CEFR_LEVELS.map((l) => el('option', { value: l.value }, l.label)));
  const addBtn = el('button', {
    class: 'btn',
    onclick: () => {
      const name = nameInput.value.trim();
      if (!name) return;
      list.push({ name, level: levelSelect.value });
      nameInput.value = '';
      save();
    },
  }, 'Add');

  renderRows();
  container.append(card('Your languages', rows,
    el('div', { style: 'display:flex; gap:0.6rem; align-items:center; margin-top:1rem; flex-wrap:wrap;' },
      nameInput, levelSelect, addBtn)));
  return container;
}
