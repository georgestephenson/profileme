import { el, card, numberField, selectField, saveBar, statCard } from '../ui.js';
import { getProfile, update } from '../store.js';
import { CHRONO_ITEMS, scoreChronotype, chronotypeAdvice } from '../data/chronotype.js';
import { fetchLifeExpectancy } from '../countrydata.js';
import { lifeExpectancyFactors, lifeExpectancyEstimate } from '../lifeexpectancy.js';

// Satisfaction With Life Scale (Diener et al., 1985) — 5 items, free to use
// with attribution; among the most-validated well-being measures in existence.
export const SWLS_ITEMS = [
  'In most ways my life is close to my ideal.',
  'The conditions of my life are excellent.',
  'I am satisfied with my life.',
  'So far I have gotten the important things I want in life.',
  'If I could live my life over, I would change almost nothing.',
];

const SWLS_SCALE = [1, 2, 3, 4, 5, 6, 7];
const SWLS_LABELS = { 1: 'Strongly disagree', 4: 'Neutral', 7: 'Strongly agree' };

// Sleep-quality index: 4 original items in the territory the (proprietary)
// PSQI covers — latency, continuity, restedness, daytime function.
const SLEEP_QUALITY_ITEMS = [
  {
    id: 'latency', text: 'How long does it usually take you to fall asleep?',
    options: [
      { value: 4, label: 'Under 15 min' }, { value: 3, label: '15-30 min' },
      { value: 1, label: '30-60 min' }, { value: 0, label: 'Over an hour' }],
  },
  {
    id: 'wakings', text: 'How often do you wake during the night?',
    options: [
      { value: 4, label: 'Rarely / once' }, { value: 2, label: 'A couple of times' },
      { value: 0, label: 'Many times' }],
  },
  {
    id: 'refreshed', text: 'How rested do you feel on waking?',
    options: [
      { value: 4, label: 'Refreshed' }, { value: 2, label: 'Somewhat rested' },
      { value: 0, label: 'Unrested' }],
  },
  {
    id: 'daytime', text: 'How often does sleepiness interfere with your day?',
    options: [
      { value: 4, label: 'Rarely' }, { value: 2, label: 'Sometimes' },
      { value: 0, label: 'Most days' }],
  },
];

export function swlsCategory(total) {
  if (total >= 31) return 'Extremely satisfied';
  if (total >= 26) return 'Satisfied';
  if (total >= 21) return 'Slightly satisfied';
  if (total === 20) return 'Neutral';
  if (total >= 15) return 'Slightly dissatisfied';
  if (total >= 10) return 'Dissatisfied';
  return 'Extremely dissatisfied';
}

export function sleepQualityScore(sq) {
  if (!sq) return null;
  const vals = SLEEP_QUALITY_ITEMS.map((i) => sq[i.id]);
  if (vals.some((v) => v === undefined || v === null)) return null;
  return Math.round((vals.reduce((a, b) => a + b, 0) / 16) * 100);
}

export function scoreWellbeing(w) {
  if (!w?.swls || w.swls.some((v) => !v)) return null;
  const total = w.swls.reduce((a, b) => a + b, 0); // 5-35
  const parts = [((total - 5) / 30) * 100];
  if (w.sleepHours) {
    parts.push(w.sleepHours >= 7 && w.sleepHours <= 9 ? 100
      : w.sleepHours >= 6 && w.sleepHours <= 10 ? 60 : 25);
  }
  const sq = sleepQualityScore(w.sleepQuality);
  if (sq !== null) parts.push(sq);
  return {
    total,
    category: swlsCategory(total),
    score: Math.round(parts.reduce((a, b) => a + b, 0) / parts.length),
  };
}

export function renderWellbeing(rerender) {
  const profile = getProfile();
  const saved = profile.wellbeing;
  const draft = {
    swls: saved?.swls ? [...saved.swls] : [null, null, null, null, null],
    sleepHours: saved?.sleepHours ?? null,
    sleepQuality: { ...(saved?.sleepQuality || {}) },
    chrono: { ...(saved?.chrono || {}) },
    smoking: saved?.smoking ?? null,
    drinksPerWeek: saved?.drinksPerWeek ?? null,
  };

  const container = el('div', {},
    el('h2', {}, 'Well-being & health'),
    el('p', { class: 'view-intro' },
      'Life satisfaction (the validated Satisfaction With Life Scale), sleep quantity and quality, your chronotype, and the health habits that drive the life-expectancy estimate.'));

  // Results
  const result = scoreWellbeing(saved);
  const chrono = saved?.chrono ? scoreChronotype(saved.chrono) : null;
  const sq = sleepQualityScore(saved?.sleepQuality);
  if (result || chrono) {
    const stats = [];
    if (result) {
      stats.push(statCard({
        label: 'Life satisfaction', value: `${result.total}/35`, sub: result.category,
        tone: result.total >= 26 ? 'good' : result.total >= 20 ? 'ok' : 'bad',
      }));
    }
    if (saved?.sleepHours) {
      stats.push(statCard({
        label: 'Sleep', value: `${saved.sleepHours}h`,
        sub: saved.sleepHours >= 7 && saved.sleepHours <= 9 ? 'in the 7-9h sweet spot' : 'outside the 7-9h range',
        tone: saved.sleepHours >= 7 && saved.sleepHours <= 9 ? 'good' : 'ok',
      }));
    }
    if (sq !== null) {
      stats.push(statCard({
        label: 'Sleep quality', value: `${sq}`, sub: 'out of 100',
        tone: sq >= 70 ? 'good' : sq >= 45 ? 'ok' : 'bad',
      }));
    }
    if (chrono) stats.push(statCard({ label: 'Chronotype', value: `${chrono.total}/25`, sub: chrono.type }));
    container.append(card('Your results', el('div', { class: 'stat-grid' }, stats),
      chrono ? el('p', { class: 'hint' }, chronotypeAdvice(chrono)) : null));
  }

  // Life expectancy estimate (needs country + sex)
  const country = profile.settings?.country;
  const sex = profile.basics?.sex;
  if (country && sex) {
    const leCard = card('Life-expectancy estimate', el('p', { class: 'empty-note' }, 'Loading national baseline…'));
    container.append(leCard);
    const renderLe = (base) => {
      const factors = lifeExpectancyFactors(profile);
      const est = lifeExpectancyEstimate(base.years, factors);
      leCard.replaceChildren(
        el('h3', {}, 'Life-expectancy estimate'),
        el('div', { class: 'stat-grid' },
          statCard({
            label: 'Estimated range', value: `${Math.round(est.low)}–${Math.round(est.high)}`,
            sub: 'years, at birth-cohort level', tone: est.adjustment >= 0 ? 'good' : 'ok',
          }),
          statCard({
            label: `${base.country} baseline`, value: base.years.toFixed(1),
            sub: `${sex}, ${base.year} (World Bank)`,
          }),
          statCard({
            label: 'Your factors', value: `${est.adjustment >= 0 ? '+' : ''}${est.adjustment.toFixed(1)} yrs`,
            sub: `${factors.length} factors applied`, tone: est.adjustment >= 0 ? 'good' : 'bad',
          })),
        factors.length
          ? el('div', { style: 'margin-top:0.8rem;' },
              factors.map((f) => el('div', { class: 'rec', style: 'padding:0.45rem 0.9rem;' },
                el('p', { style: 'font-size:0.85rem;' },
                  el('strong', {}, `${f.years >= 0 ? '+' : ''}${f.years} yrs — ${f.label}. `),
                  el('span', { style: 'color:var(--text-soft);' }, f.why)))))
          : el('p', { class: 'empty-note' }, 'Complete more modules (fitness, relationships, habits below) to personalize the estimate.'),
        el('p', { class: 'hint' },
          'This is population statistics, not prophecy: a national baseline shifted by factors with well-replicated mortality associations, shown transparently above. Individual outcomes vary enormously, associations are not guarantees, and period life expectancy at birth understates what today\'s adults will likely reach. Treat the levers as the message — smoking, fitness, sleep, and connection are the big ones.'));
    };
    const cached = profile.settings?.lifeExp;
    if (cached && cached.iso3 === country && cached.sex === sex) {
      renderLe(cached);
    } else {
      fetchLifeExpectancy(country, sex)
        .then((base) => {
          update('settings', { ...(getProfile().settings || {}), lifeExp: { ...base, iso3: country, sex } });
          renderLe(base);
        })
        .catch(() => {
          leCard.replaceChildren(el('h3', {}, 'Life-expectancy estimate'),
            el('p', { class: 'empty-note' }, 'Could not fetch the national baseline right now — try again later.'));
        });
    }
  } else {
    container.append(card('Life-expectancy estimate',
      el('p', { class: 'empty-note' },
        'Set your sex in Basics and your country in Finances to unlock a transparent, factor-by-factor life-expectancy estimate.')));
  }

  // SWLS + sleep inputs
  const swlsItems = SWLS_ITEMS.map((text, i) =>
    el('div', { class: 'likert-item' },
      el('p', {}, el('span', { class: 'num' }, `${i + 1}.`), text),
      el('div', { class: 'likert-options' },
        SWLS_SCALE.map((v) =>
          el('label', {},
            el('input', {
              type: 'radio', name: `swls-${i}`, value: v,
              checked: draft.swls[i] === v,
              onchange: () => (draft.swls[i] = v),
            }),
            SWLS_LABELS[v] ?? String(v))))));

  const optionBlock = (items, target) =>
    items.map((item) =>
      el('div', { class: 'likert-item' },
        el('p', {}, item.text),
        el('div', { class: 'likert-options' },
          item.options.map((opt) =>
            el('label', {},
              el('input', {
                type: 'radio', name: `wb-${item.id}`, value: opt.points ?? opt.value,
                checked: target[item.id] === (opt.points ?? opt.value),
                onchange: () => (target[item.id] = opt.points ?? opt.value),
              }),
              opt.label)))));

  container.append(
    card('Satisfaction With Life Scale', ...swlsItems),
    card('Sleep',
      numberField({
        label: 'Typical sleep per night (hours)',
        sub: '7-9 hours is the adult consensus recommendation (AASM/SRS).',
        min: 3, max: 14, value: draft.sleepHours, onInput: (v) => (draft.sleepHours = v),
      }),
      ...optionBlock(SLEEP_QUALITY_ITEMS, draft.sleepQuality)),
    card('Chronotype',
      el('p', { class: 'hint', style: 'margin-bottom:0.4rem;' },
        'Morningness-eveningness, in the style of the Horne-Ostberg MEQ. Larks and owls are both normal — the payoff is scheduling around your biology.'),
      ...optionBlock(CHRONO_ITEMS, draft.chrono)),
    card('Health habits',
      selectField({
        label: 'Smoking',
        value: draft.smoking ?? '',
        options: [
          { value: '', label: '— select —' },
          { value: 'never', label: 'Never smoked' },
          { value: 'former', label: 'Former smoker' },
          { value: 'current', label: 'Current smoker' },
        ],
        onChange: (v) => (draft.smoking = v || null),
      }),
      numberField({
        label: 'Alcoholic drinks per week',
        sub: 'Standard drinks, honest average.',
        min: 0, max: 100, value: draft.drinksPerWeek, onInput: (v) => (draft.drinksPerWeek = v),
      }),
      saveBar(() => {
        if (draft.swls.some((v) => !v)) {
          alert('Please answer all five life-satisfaction statements.');
          return;
        }
        update('wellbeing', { ...draft, completedAt: new Date().toISOString() });
        rerender();
      })));

  return container;
}
