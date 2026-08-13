import { el, card } from '../ui.js';
import { getProfile, update } from '../store.js';
import { POLITICS_ITEMS, POLITICS_SCALE, scorePolitics, politicsLabel } from '../data/politics.js';

export function renderPolitics(rerender) {
  const saved = getProfile().politics;
  const answers = { ...(saved?.answers || {}) };

  const container = el('div', {},
    el('h2', {}, 'Political orientation'),
    el('p', { class: 'view-intro' },
      'Where you sit on the two best-established dimensions of political attitudes: economic left-right and social libertarian-authoritarian. Like personality, this is a map, not a mark — no position scores "better", it never enters your composite, and it stays on this page unless you choose to share it.'));

  const scores = saved?.answers ? scorePolitics(saved.answers) : null;
  if (scores) {
    container.append(card('Your position',
      el('p', { style: 'text-align:center; font-size:1.15rem; margin-bottom:0.6rem;' },
        el('strong', {}, politicsLabel(scores))),
      el('div', { class: 'compass-wrap' }, compassSvg(scores)),
      el('p', { class: 'hint' },
        `Economic axis: ${scores.econ} (−100 left … +100 right) · Social axis: ${scores.social} (−100 libertarian … +100 authoritarian). Positions shift with life stage and context — retake any time.`)));
  }

  const progressNote = el('p', { class: 'progress-note' });
  const submitBtn = el('button', { class: 'btn' }, scores ? 'Re-score' : 'Score my answers');
  function refresh() {
    const n = Object.keys(answers).length;
    progressNote.textContent = `${n} / ${POLITICS_ITEMS.length} answered`;
    submitBtn.disabled = n < POLITICS_ITEMS.length;
  }

  const items = POLITICS_ITEMS.map((item, idx) =>
    el('div', { class: 'likert-item' },
      el('p', {}, el('span', { class: 'num' }, `${idx + 1}.`), item.text),
      el('div', { class: 'likert-options' },
        POLITICS_SCALE.map((opt) =>
          el('label', {},
            el('input', {
              type: 'radio', name: `pol-${item.id}`, value: opt.value,
              checked: answers[item.id] === opt.value,
              onchange: () => { answers[item.id] = opt.value; refresh(); },
            }),
            opt.label)))));

  submitBtn.addEventListener('click', () => {
    update('politics', { answers, completedAt: new Date().toISOString() });
    rerender();
    window.scrollTo(0, 0);
  });

  refresh();
  container.append(card('Statements', progressNote, ...items,
    el('div', { style: 'margin-top:1rem;' }, submitBtn)));
  return container;
}

function compassSvg(scores) {
  const svgNS = 'http://www.w3.org/2000/svg';
  const size = 300, pad = 30;
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  const plot = size - pad * 2;
  const toX = (v) => pad + ((v + 100) / 200) * plot;
  const toY = (v) => pad + ((v + 100) / 200) * plot; // +social (authoritarian) at top

  const rect = (x, y, fill) => {
    const r = document.createElementNS(svgNS, 'rect');
    r.setAttribute('x', x); r.setAttribute('y', y);
    r.setAttribute('width', plot / 2); r.setAttribute('height', plot / 2);
    r.setAttribute('fill', fill);
    svg.append(r);
  };
  rect(pad, pad, '#fee2e2');                       // auth-left
  rect(pad + plot / 2, pad, '#dbeafe');            // auth-right
  rect(pad, pad + plot / 2, '#dcfce7');            // lib-left
  rect(pad + plot / 2, pad + plot / 2, '#fef9c3'); // lib-right

  for (const [x1, y1, x2, y2] of [
    [pad, pad + plot / 2, pad + plot, pad + plot / 2],
    [pad + plot / 2, pad, pad + plot / 2, pad + plot],
  ]) {
    const l = document.createElementNS(svgNS, 'line');
    l.setAttribute('x1', x1); l.setAttribute('y1', y1);
    l.setAttribute('x2', x2); l.setAttribute('y2', y2);
    l.setAttribute('stroke', '#8b93a1');
    svg.append(l);
  }

  const label = (text, x, y) => {
    const t = document.createElementNS(svgNS, 'text');
    t.setAttribute('x', x); t.setAttribute('y', y);
    t.setAttribute('text-anchor', 'middle');
    t.setAttribute('font-size', 11);
    t.setAttribute('fill', '#5b6675');
    t.textContent = text;
    svg.append(t);
  };
  label('Authoritarian', size / 2, pad - 12);
  label('Libertarian', size / 2, size - 8);
  label('Left', pad - 14, size / 2 + 4);
  label('Right', size - pad + 16, size / 2 + 4);

  const dot = document.createElementNS(svgNS, 'circle');
  dot.setAttribute('cx', toX(scores.econ));
  dot.setAttribute('cy', toY(-scores.social) );
  dot.setAttribute('r', 7);
  dot.setAttribute('fill', '#1c2430');
  dot.setAttribute('stroke', '#fff');
  dot.setAttribute('stroke-width', 2.5);
  svg.append(dot);
  return svg;
}
