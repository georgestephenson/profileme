import { el, card } from '../ui.js';
import { getProfile, update } from '../store.js';
import { CEFR_LEVELS } from '../data/benchmarks.js';
import { COMMON_LANGUAGES } from '../data/languages.js';

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

  const langSelect = el('select', { style: 'max-width:260px;' },
    COMMON_LANGUAGES.map((l) => el('option', { value: l.name }, `${l.name} — ${l.speakers} speakers`)),
    el('option', { value: '__other__' }, 'Other…'));
  const otherInput = el('input', {
    type: 'text', placeholder: 'Language name', style: 'max-width:180px; display:none;',
  });
  langSelect.addEventListener('change', () => {
    otherInput.style.display = langSelect.value === '__other__' ? '' : 'none';
    if (langSelect.value === '__other__') otherInput.focus();
  });
  const levelSelect = el('select', { style: 'max-width:230px;' },
    CEFR_LEVELS.map((l) => el('option', { value: l.value }, l.label)));
  const addBtn = el('button', {
    class: 'btn',
    onclick: () => {
      const name = langSelect.value === '__other__' ? otherInput.value.trim() : langSelect.value;
      if (!name) return;
      if (list.some((l) => l.name.toLowerCase() === name.toLowerCase())) return;
      list.push({ name, level: levelSelect.value });
      otherInput.value = '';
      save();
    },
  }, 'Add');

  renderRows();
  container.append(card('Your languages', rows,
    el('div', { style: 'display:flex; gap:0.6rem; align-items:center; margin-top:1rem; flex-wrap:wrap;' },
      langSelect, otherInput, levelSelect, addBtn),
    el('p', { class: 'hint' }, 'Add as many as you like — start with your native language. Speaker counts are approximate totals (native + second-language).')));
  return container;
}
