import { el, card, statCard } from '../ui.js';
import { getProfile, update } from '../store.js';
import { rateDigitSpan, rateReactionTime, RATING_LABELS, ratingClass } from '../data/benchmarks.js';

export function renderCognition(rerender) {
  const saved = getProfile().cognition || {};

  const container = el('div', {},
    el('h2', {}, 'Cognition'),
    el('p', { class: 'view-intro' },
      'Two classic cognitive-psychology tasks: forward digit span (working memory) and simple visual reaction time (processing speed).'),
    el('div', { class: 'callout' },
      'Honesty note: this is not an IQ test. Valid IQ tests (WAIS, Stanford-Binet) are proprietary and must be administered by a professional — any website claiming to measure your IQ is overselling. These tasks measure two narrow, real components of cognition, and scores vary with sleep, caffeine, and practice.'));

  const stats = [];
  if (saved.digitSpan) {
    const r = rateDigitSpan(saved.digitSpan);
    stats.push(statCard({ label: 'Digit span', value: `${saved.digitSpan}`, sub: `digits — ${RATING_LABELS[r]} (adult avg ≈ 7 ± 2)`, tone: ratingClass(r) }));
  }
  if (saved.reactionMs) {
    const r = rateReactionTime(saved.reactionMs);
    stats.push(statCard({ label: 'Reaction time', value: `${Math.round(saved.reactionMs)} ms`, sub: `median of 5 — ${RATING_LABELS[r]}`, tone: ratingClass(r) }));
  }
  if (stats.length) container.append(card('Your results', el('div', { class: 'stat-grid' }, stats)));

  container.append(digitSpanTask(saved, rerender));
  container.append(reactionTask(saved, rerender));
  return container;
}

// ---------- Digit span ----------

function digitSpanTask(saved, rerender) {
  const stage = el('div', { class: 'task-stage' });
  const cardEl = card('Task 1 — Forward digit span',
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
  let state = 'idle'; // idle | waiting | go

  const panel = el('div', { class: 'rt-panel' }, 'Click to start');
  const cardEl = card('Task 2 — Reaction time',
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
