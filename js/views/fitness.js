import { el, card, numberField, selectField, saveBar, statCard } from '../ui.js';
import { getProfile, update } from '../store.js';
import {
  vo2maxFromCooper, vdotFrom5k, rateVo2max, rateRestingHr, ratePushups, ratePullups,
  ratePlank, rateLift, rateVerticalJump, rateBalance, rateToeTouch, TOE_TOUCH_OPTIONS,
  RATING_LABELS, ratingClass,
} from '../data/benchmarks.js';

const LIFTS = [
  ['squat', 'Squat'],
  ['bench', 'Bench press'],
  ['deadlift', 'Deadlift'],
  ['press', 'Overhead press'],
  ['row', 'Barbell row'],
];

export function renderFitness(rerender) {
  const profile = getProfile();
  const draft = {
    cooperMeters: null, fiveKMin: null, restingHr: null,
    pushups: null, pullups: null, plankSec: null,
    verticalJumpCm: null, balanceSec: null, toeTouch: null,
    bodyweightKg: null, squatKg: null, benchKg: null, deadliftKg: null, pressKg: null, rowKg: null,
    ...(profile.fitness || {}),
  };
  const age = profile.basics?.age ?? 30;
  const sex = profile.basics?.sex ?? 'male';

  const container = el('div', {},
    el('h2', {}, 'Fitness'),
    el('p', { class: 'view-intro' },
      'Cardio (Cooper test, 5k time, or resting heart rate), strength (bodyweight and barbell), power, balance, and flexibility — all rated against age- and sex-adjusted benchmarks. Every field is optional: fill in what you can actually measure.'),
    !profile.basics && el('div', { class: 'callout' }, 'Set your age and sex in Basics first — fitness norms depend on both.'));

  // Results
  if (profile.fitness) {
    const f = profile.fitness;
    const stats = [];
    const push = (label, value, sub, r) =>
      stats.push(statCard({ label, value, sub: `${sub}${sub ? ' — ' : ''}${RATING_LABELS[r]}`, tone: ratingClass(r) }));

    if (f.cooperMeters) {
      const vo2 = vo2maxFromCooper(f.cooperMeters);
      push('Est. VO2max (Cooper)', vo2.toFixed(1), 'mL/kg/min', rateVo2max(vo2, age, sex));
    }
    if (f.fiveKMin) {
      const vdot = vdotFrom5k(f.fiveKMin);
      push('Est. VO2max (5k time)', vdot.toFixed(1), 'mL/kg/min', rateVo2max(vdot, age, sex));
    }
    if (f.restingHr) push('Resting HR', `${f.restingHr}`, 'bpm', rateRestingHr(f.restingHr));
    if (f.pushups !== null && f.pushups !== undefined) push('Push-ups', `${f.pushups}`, '', ratePushups(f.pushups, age, sex));
    if (f.pullups !== null && f.pullups !== undefined) push('Pull-ups', `${f.pullups}`, '', ratePullups(f.pullups, age, sex));
    if (f.plankSec) push('Plank', `${f.plankSec}s`, '', ratePlank(f.plankSec));
    if (f.verticalJumpCm) push('Vertical jump', `${f.verticalJumpCm} cm`, '', rateVerticalJump(f.verticalJumpCm, age, sex));
    if (f.balanceSec) push('One-leg balance', `${f.balanceSec}s`, '', rateBalance(f.balanceSec));
    if (f.toeTouch) push('Flexibility', TOE_TOUCH_OPTIONS.find((o) => o.value === f.toeTouch)?.label ?? '', '', rateToeTouch(f.toeTouch));
    if (f.bodyweightKg) {
      for (const [lift, label] of LIFTS) {
        const w = f[`${lift}Kg`];
        if (!w) continue;
        push(label, `${(w / f.bodyweightKg).toFixed(2)}× BW`, `${w} kg`, rateLift(lift, w, f.bodyweightKg, sex));
      }
    }
    if (stats.length) container.append(card('Your results', el('div', { class: 'stat-grid' }, stats)));
  }

  container.append(
    card('Cardio',
      numberField({
        label: 'Cooper test: distance covered in 12 minutes (meters)',
        sub: 'Run/walk as far as you can in 12 minutes on flat ground. Warm up first; skip if you have cardiovascular risk factors.',
        min: 500, max: 5000, value: draft.cooperMeters, onInput: (v) => (draft.cooperMeters = v),
      }),
      numberField({
        label: 'Recent 5k time (minutes)',
        sub: 'An all-out 5k converts to VO2max via the Daniels & Gilbert VDOT formula. Decimals fine: 26.5 = 26:30.',
        min: 12, max: 90, value: draft.fiveKMin, onInput: (v) => (draft.fiveKMin = v),
      }),
      numberField({
        label: 'Resting heart rate (bpm)',
        sub: 'Measure seated, after 5 minutes of rest — ideally in the morning.',
        min: 30, max: 150, value: draft.restingHr, onInput: (v) => (draft.restingHr = v),
      })),
    card('Bodyweight strength & endurance',
      numberField({ label: 'Max push-ups in one set', min: 0, max: 200, value: draft.pushups, onInput: (v) => (draft.pushups = v) }),
      numberField({ label: 'Max strict pull-ups in one set', min: 0, max: 60, value: draft.pullups, onInput: (v) => (draft.pullups = v) }),
      numberField({ label: 'Max plank hold (seconds)', min: 0, max: 1200, value: draft.plankSec, onInput: (v) => (draft.plankSec = v) })),
    card('Power, balance & flexibility',
      numberField({
        label: 'Vertical jump (cm)',
        sub: 'Standing reach vs. jump-and-touch height difference.',
        min: 5, max: 120, value: draft.verticalJumpCm, onInput: (v) => (draft.verticalJumpCm = v),
      }),
      numberField({
        label: 'One-leg stand, eyes open (seconds, max 60)',
        sub: 'Hands on hips, either leg. Under 10 seconds in middle age is a meaningful health flag (Araujo et al., 2022).',
        min: 0, max: 60, value: draft.balanceSec, onInput: (v) => (draft.balanceSec = v),
      }),
      selectField({
        label: 'Standing toe-touch: how far can you reach with straight legs?',
        value: draft.toeTouch ?? '',
        options: [{ value: '', label: '— not measured —' }, ...TOE_TOUCH_OPTIONS],
        onChange: (v) => (draft.toeTouch = v || null),
      })),
    card('Barbell lifts (1RM, optional)',
      numberField({ label: 'Bodyweight (kg)', sub: 'Needed to rate the lifts below.', min: 30, max: 250, value: draft.bodyweightKg, onInput: (v) => (draft.bodyweightKg = v) }),
      ...LIFTS.map(([lift, label]) =>
        numberField({ label: `${label} 1RM (kg)`, min: 0, max: 500, value: draft[`${lift}Kg`], onInput: (v) => (draft[`${lift}Kg`] = v) })),
      saveBar(() => { update('fitness', { ...draft }); rerender(); })));

  return container;
}
