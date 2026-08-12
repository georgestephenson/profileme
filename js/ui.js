// Tiny DOM helpers shared by all views.

export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else if (v !== undefined && v !== null && v !== false) node.setAttribute(k, v === true ? '' : v);
  }
  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child.nodeType ? child : document.createTextNode(child));
  }
  return node;
}

export function card(title, ...children) {
  return el('div', { class: 'card' }, title ? el('h3', {}, title) : null, ...children);
}

export function numberField({ label, sub, value, min, max, step, onInput, placeholder }) {
  const input = el('input', {
    type: 'number', min, max, step: step ?? 'any', placeholder,
    value: value ?? '',
    oninput: (e) => onInput(e.target.value === '' ? null : Number(e.target.value)),
  });
  return el('label', { class: 'field' }, label, sub ? el('span', { class: 'sub' }, sub) : null, input);
}

export function selectField({ label, sub, value, options, onChange }) {
  const select = el('select', { onchange: (e) => onChange(e.target.value) },
    options.map((o) => el('option', { value: o.value, selected: o.value === value }, o.label)));
  return el('label', { class: 'field' }, label, sub ? el('span', { class: 'sub' }, sub) : null, select);
}

export function statCard({ label, value, sub, tone }) {
  return el('div', { class: 'stat' },
    el('div', { class: 'stat-label' }, label),
    el('div', { class: `stat-value ${tone || ''}` }, value),
    sub ? el('div', { class: 'stat-sub' }, sub) : null);
}

export function traitBar({ name, value, tone, rightLabel }) {
  return el('div', { class: 'trait-row' },
    el('div', { class: 'trait-head' },
      el('strong', {}, name),
      el('span', {}, rightLabel ?? `${Math.round(value)}/100`)),
    el('div', { class: `bar ${tone || ''}` },
      el('div', { style: `width:${Math.max(2, Math.min(100, value))}%` })));
}

export function saveBar(onSave, savedMsg = 'Saved ✓') {
  const note = el('span', { class: 'progress-note', style: 'margin-left:0.8rem; display:none;' }, savedMsg);
  const btn = el('button', {
    class: 'btn',
    onclick: () => {
      onSave();
      note.style.display = 'inline';
      setTimeout(() => { note.style.display = 'none'; }, 2000);
    },
  }, 'Save');
  return el('div', { style: 'margin-top:0.6rem;' }, btn, note);
}
