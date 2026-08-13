import { el, card, statCard } from '../ui.js';
import { getProfile, update } from '../store.js';
import { rateDigitSpan, rateReactionTime, RATING_LABELS, ratingClass } from '../data/benchmarks.js';
import { SECTIONS, scoreBattery } from '../data/cognitive.js';
import { breakdownRadar } from '../radar.js';

export function renderCognition(rerender) {
  const saved = getProfile().cognition || {};

  const container = el('div', {},
    el('h2', {}, 'Cognition'),
    el('p', { class: 'view-intro' },
      'A cognitive ability battery using item formats validated by the public-domain ICAR project (verbal knowledge, series, analogies, matrix reasoning — formats that correlate ~0.8 with gold-standard tests), plus working-memory and reaction-time tasks.'),
    el('div', { class: 'callout' },
      'What the estimate means: this battery produces an estimated range, not a clinical IQ. It is untimed and self-administered, our norms are provisional, and scores move with sleep, effort, and retesting. A proper IQ score requires a professionally administered test (WAIS, Stanford-Binet). Treat the range as a rough band — useful signal, not a label. Do the battery once, without looking anything up.'));

  // Results
  const stats = [];
  if (saved.battery) {
    const b = saved.battery;
    stats.push(statCard({
      label: 'Est. cognitive ability',
      value: `${b.estimateLow}–${b.estimateHigh}`,
      sub: `IQ-scale band, ~${b.percentile}th percentile (provisional norms)`,
      tone: b.z > 0.35 ? 'good' : b.z > -0.35 ? 'ok' : 'bad',
    }));
    for (const s of SECTIONS) {
      const p = b.parts[s.key];
      if (p) stats.push(statCard({ label: s.title, value: `${p.correct}/${p.total}`, sub: 'correct' }));
    }
  }
  if (saved.digitSpan) {
    const r = rateDigitSpan(saved.digitSpan);
    stats.push(statCard({ label: 'Digit span', value: `${saved.digitSpan}`, sub: `digits — ${RATING_LABELS[r]} (adult avg ≈ 7 ± 2)`, tone: ratingClass(r) }));
  }
  if (saved.reactionMs) {
    const r = rateReactionTime(saved.reactionMs);
    stats.push(statCard({ label: 'Reaction time', value: `${Math.round(saved.reactionMs)} ms`, sub: `median of 5 — ${RATING_LABELS[r]}`, tone: ratingClass(r) }));
  }
  if (stats.length) container.append(card('Your results', el('div', { class: 'stat-grid' }, stats)));

  // Breakdown radar: battery sections + memory + speed
  const sub = [];
  if (saved.battery) {
    for (const s of SECTIONS) {
      const p = saved.battery.parts[s.key];
      if (p) sub.push({ label: s.title.replace('Letter & number', 'Number'), value: (p.correct / p.total) * 100 });
    }
  }
  if (saved.digitSpan) sub.push({ label: 'Working memory', value: rateDigitSpan(saved.digitSpan) * 25 });
  if (saved.reactionMs) sub.push({ label: 'Speed', value: rateReactionTime(saved.reactionMs) * 25 });
  const radar = breakdownRadar(sub);
  if (radar) {
    container.append(card('Cognition breakdown', radar,
      el('p', { class: 'hint' }, 'Battery sections show percent correct; memory and speed show benchmark ratings.')));
  }

  container.append(batteryTask(saved, rerender));
  container.append(digitSpanTask(saved, rerender));
  container.append(reactionTask(saved, rerender));
  return container;
}

// ---------- Ability battery ----------

function batteryTask(saved, rerender) {
  const stage = el('div', {});
  const totalItems = SECTIONS.reduce((n, s) => n + s.items.length, 0);
  const cardEl = card(`Task 1 — Ability battery (${totalItems} items, ~18 min)`,
    el('p', { class: 'hint', style: 'margin-bottom:0.6rem;' },
      'Three sections. Work quickly but carefully, alone, without looking anything up. Answer every item — an educated guess beats a blank.'),
    stage);

  const answers = Object.fromEntries(SECTIONS.map((s) => [s.key, {}]));
  let sectionIdx = -1;

  function start() {
    sectionIdx = 0;
    showSection();
  }

  function showSection() {
    const section = SECTIONS[sectionIdx];
    const itemNodes = section.items.map((item, i) =>
      el('div', { class: 'likert-item' },
        item.grid ? matrixGrid(item.grid) : el('p', {}, el('span', { class: 'num' }, `${i + 1}.`), item.q),
        el('div', { class: 'likert-options' },
          item.options.map((opt, oi) =>
            el('label', {},
              el('input', {
                type: 'radio', name: `${section.key}-${i}`, value: oi,
                onchange: () => { answers[section.key][i] = oi; refresh(); },
              }),
              opt)))));

    const nextBtn = el('button', { class: 'btn', disabled: true }, sectionIdx < SECTIONS.length - 1 ? 'Next section' : 'Finish & score');
    function refresh() {
      nextBtn.disabled = Object.keys(answers[section.key]).length < section.items.length;
    }
    nextBtn.addEventListener('click', () => {
      sectionIdx++;
      if (sectionIdx < SECTIONS.length) {
        showSection();
        cardEl.scrollIntoView();
      } else {
        finish();
      }
    });

    stage.replaceChildren(
      el('p', { class: 'progress-note' }, `Section ${sectionIdx + 1} of ${SECTIONS.length}: ${section.title}`),
      ...itemNodes,
      el('div', { style: 'margin-top:1rem;' }, nextBtn));
  }

  function finish() {
    const sectionScores = {};
    for (const s of SECTIONS) {
      sectionScores[s.key] = s.items.reduce((n, item, i) => n + (answers[s.key][i] === item.answer ? 1 : 0), 0);
    }
    const result = scoreBattery(sectionScores);
    update('cognition', { ...getProfile().cognition, battery: { ...result, completedAt: new Date().toISOString() } });
    rerender();
    window.scrollTo(0, 0);
  }

  stage.replaceChildren(
    saved.battery
      ? el('p', { class: 'progress-note' }, 'Completed. Retaking inflates scores through practice effects — wait a few months for a meaningful retest.')
      : el('p', {}, ''),
    el('button', { class: 'btn', onclick: start }, saved.battery ? 'Retake battery' : 'Start battery'));

  return cardEl;
}

function matrixGrid(cells) {
  const wrap = el('div', { style: 'display:grid; grid-template-columns:repeat(3, 72px); gap:6px; margin-bottom:0.7rem;' });
  for (let i = 0; i < 9; i++) {
    wrap.append(el('div', {
      style: 'height:56px; display:flex; align-items:center; justify-content:center; font-size:1.25rem;'
        + 'border:1px solid var(--border); border-radius:8px; background:var(--bg); letter-spacing:0.05em;',
    }, i < 8 ? cells[i] : '?'));
  }
  return el('div', {},
    el('p', { class: 'hint' }, 'Which option completes the pattern?'),
    wrap);
}

// ---------- Digit span ----------

function digitSpanTask(saved, rerender) {
  const stage = el('div', { class: 'task-stage' });
  const cardEl = card('Task 2 — Forward digit span',
    el('p', { class: 'hint', style: 'margin-bottom:0.6rem;' },
      'Digits appear one at a time. Type them back in order. Length increases until you miss twice at the same length.'),
    stage);

  let length, failsAtLength, best, sequence;

  function reset() {
    length = 3; failsAtLength = 0; best = 0;
    stage.replaceChildren(el('button', { class: 'btn', onclick: startRound }, 'Start test'));
  }

  function startRound() {
    sequence = Array.from({ length }, () => Math.floor(Math.random() * 10));
    const display = el('div', { class: 'digit-display' }, '');
    stage.replaceChildren(el('p', { class: 'hint' }, `${length} digits`), display);
    let i = 0;
    const timer = setInterval(() => {
      if (i < sequence.length) {
        display.textContent = String(sequence[i]);
        i++;
        // brief blank between repeated digits so they are distinguishable
        setTimeout(() => { if (i <= sequence.length) display.textContent = ''; }, 650);
      } else {
        clearInterval(timer);
        askRecall();
      }
    }, 850);
  }

  function askRecall() {
    const input = el('input', {
      type: 'text', inputmode: 'numeric', placeholder: 'Type the digits…',
      style: 'text-align:center; font-size:1.3rem; letter-spacing:0.2em;',
    });
    const submit = el('button', { class: 'btn', onclick: check }, 'Submit');
    function check() {
      const guess = input.value.replace(/\D/g, '');
      if (guess === sequence.join('')) {
        best = length;
        length++;
        failsAtLength = 0;
        stage.replaceChildren(
          el('p', {}, `Correct — ${best} digits.`),
          el('button', { class: 'btn', onclick: startRound }, `Try ${length} digits`));
      } else {
        failsAtLength++;
        if (failsAtLength >= 2) {
          finish();
        } else {
          stage.replaceChildren(
            el('p', {}, 'Not quite — one more try at this length.'),
            el('button', { class: 'btn', onclick: startRound }, `Retry ${length} digits`));
        }
      }
    }
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') check(); });
    stage.replaceChildren(input, submit);
    input.focus();
  }

  function finish() {
    update('cognition', { ...getProfile().cognition, digitSpan: best });
    rerender();
  }

  reset();
  return cardEl;
}

// ---------- Reaction time ----------

function reactionTask(saved, rerender) {
  const TRIALS = 5;
  let results = [];
  let timeout = null;
  let goTime = null;
  let state = 'idle'; // idle | waiting | go | between

  const panel = el('div', { class: 'rt-panel' }, 'Click to start');
  const cardEl = card('Task 3 — Reaction time',
    el('p', { class: 'hint', style: 'margin-bottom:0.6rem;' },
      `When the panel turns green, click as fast as you can. ${TRIALS} trials; your score is the median.`),
    panel);

  function arm() {
    state = 'waiting';
    panel.className = 'rt-panel waiting';
    panel.textContent = `Wait for green… (trial ${results.length + 1}/${TRIALS})`;
    timeout = setTimeout(() => {
      state = 'go';
      goTime = performance.now();
      panel.className = 'rt-panel go';
      panel.textContent = 'CLICK!';
    }, 1500 + Math.random() * 2500);
  }

  panel.addEventListener('click', () => {
    if (state === 'idle') {
      results = [];
      arm();
    } else if (state === 'waiting') {
      clearTimeout(timeout);
      state = 'between';
      panel.className = 'rt-panel';
      panel.textContent = 'Too early — get ready…';
      setTimeout(arm, 800);
    } else if (state === 'go') {
      const ms = performance.now() - goTime;
      results.push(ms);
      if (results.length >= TRIALS) {
        const sorted = [...results].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];
        update('cognition', { ...getProfile().cognition, reactionMs: median });
        rerender();
      } else {
        panel.className = 'rt-panel';
        panel.textContent = `${Math.round(ms)} ms — next trial…`;
        state = 'between';
        setTimeout(arm, 700);
      }
    }
  });

  return cardEl;
}
