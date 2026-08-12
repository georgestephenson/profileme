import { el, card } from '../ui.js';
import { getProfile, update } from '../store.js';
import { computeScores } from '../synthesis.js';
import {
  earningsPotential, strengthPotential, cardioPotential,
  wealthProjection, languageTimeline,
} from '../predictions.js';
import { money } from '../currency.js';

const GOAL_DEFS = [
  { key: 'earnMore', label: 'Earn more' },
  { key: 'getStronger', label: 'Get stronger' },
  { key: 'improveCardio', label: 'Improve endurance' },
  { key: 'buildWealth', label: 'Build wealth' },
  { key: 'learnLanguage', label: 'Level up a language' },
];

export function renderGoals(rerender) {
  const profile = getProfile();
  const scores = computeScores(profile);
  const selected = new Set(profile.goals?.selected || GOAL_DEFS.map((g) => g.key));

  const container = el('div', {},
    el('h2', {}, 'Potential & plans'),
    el('p', { class: 'view-intro' },
      'What your profile suggests you could achieve, and how. Every projection is a range with its evidence basis stated — treat these as planning tools, not promises. The more modules you complete, the more plans unlock.'));

  // Goal selection
  container.append(card('Your goals',
    el('div', { class: 'likert-options', style: 'margin-bottom:0.3rem;' },
      GOAL_DEFS.map((g) =>
        el('label', {},
          el('input', {
            type: 'checkbox', checked: selected.has(g.key),
            onchange: (e) => {
              e.target.checked ? selected.add(g.key) : selected.delete(g.key);
              update('goals', { selected: [...selected] });
              rerender();
            },
          }),
          g.label))),
    el('p', { class: 'hint' }, 'Pick what matters to you — plans below follow your selection.')));

  const plans = [];

  if (selected.has('earnMore')) {
    const e = earningsPotential(profile, scores);
    plans.push(planCard('Earning potential', e
      ? [
          el('p', {},
            `Current income: ${money(e.currentMonthly)}/month. A realistic 5-year range if you work the levers below: `,
            el('strong', {}, `${money(e.projectedLow)}–${money(e.projectedHigh)}/month`),
            ` (+${e.lowPct}% to +${e.highPct}%).`),
          e.levers.length
            ? el('ul', { style: 'padding-left:1.2rem; font-size:0.9rem;' }, e.levers.map((l) => el('li', { style: 'margin-bottom:0.35rem;' }, l)))
            : el('p', { class: 'hint' }, 'Your profile already shows most levers pulled — gains from here come from performance and negotiation.'),
          basis('Heuristic synthesis of published effect sizes: education premium ≈ 8-10%/year of schooling (Psacharopoulos & Patrinos, 2018), cognitive ability r ≈ .25-.3 with earnings, conscientiousness r ≈ .2 with job performance (Schmidt & Hunter, 1998). Individual outcomes vary enormously — this is a planning range, not a promise.'),
        ]
      : needs('finances (income)')));
  }

  if (selected.has('getStronger')) {
    const s = strengthPotential(profile);
    plans.push(planCard('Strength potential', s
      ? [
          el('p', {},
            `You test as a ${s.level}. Typical gain with structured training over ${s.horizon}: `,
            el('strong', {}, `+${s.gainLow}% to +${s.gainHigh}%`), ' on your main lifts.'),
          el('p', { style: 'font-size:0.9rem;' }, `Plan: ${s.plan}`),
          basis(s.basis),
        ]
      : needs('fitness (push-ups or lifts)')));
  }

  if (selected.has('improveCardio')) {
    const c = cardioPotential(profile);
    plans.push(planCard('Endurance potential', c
      ? [
          el('p', {},
            `Estimated VO2max ${c.currentVo2.toFixed(1)} → `,
            el('strong', {}, `${c.targetLow.toFixed(1)}–${c.targetHigh.toFixed(1)} mL/kg/min`),
            ` within ${c.horizon} of consistent training.`),
          el('p', { style: 'font-size:0.9rem;' }, `Plan: ${c.plan}`),
          basis(c.basis),
        ]
      : needs('fitness (Cooper test)')));
  }

  if (selected.has('buildWealth')) {
    const w = wealthProjection(profile);
    plans.push(planCard('Wealth projection', w
      ? [
          el('p', {},
            `On your current path (saving ${money(w.currentSave)}/month), 10-year projected net worth: `,
            el('strong', {}, money(w.currentPath)), '. At a 20% savings rate (',
            `${money(w.targetSave)}/month): `, el('strong', {}, money(w.targetPath)),
            ` — a difference of ${money(w.gap)}.`),
          el('p', { style: 'font-size:0.9rem;' },
            'Plan: automate the savings transfer on payday, hold low-cost index funds, and revisit your three largest expense categories once.'),
          basis(w.basis),
        ]
      : needs('finances')));
  }

  if (selected.has('learnLanguage')) {
    const l = languageTimeline(profile);
    plans.push(planCard('Language timeline', l
      ? [
          el('p', {},
            `${l.language}: ${l.from} → `, el('strong', {}, l.to),
            ` in roughly ${l.weeksLow}–${l.weeksHigh} weeks at ${l.hoursPerWeek} hrs/week.`),
          el('p', { style: 'font-size:0.9rem;' },
            'Plan: daily spaced-repetition vocabulary (15 min), comprehensible input most days (podcasts, graded readers), one conversation session per week.'),
          basis(l.basis),
        ]
      : needs('languages (a language below C1)')));
  }

  if (!plans.length) {
    container.append(card('Plans', el('p', { class: 'empty-note' }, 'Select at least one goal above.')));
  } else {
    container.append(...plans);
  }

  return container;
}

function planCard(title, children) {
  return card(title, ...children);
}

function needs(what) {
  return [el('p', { class: 'empty-note' }, `Complete the ${what} module to unlock this plan.`)];
}

function basis(text) {
  return el('p', { class: 'hint', style: 'margin-top:0.5rem;' }, `Basis: ${text}`);
}
