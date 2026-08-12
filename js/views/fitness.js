import { el, card, numberField, saveBar, statCard } from '../ui.js';
import { getProfile, update } from '../store.js';
import {
  vo2maxFromCooper, rateVo2max, rateRestingHr, ratePushups, ratePlank, rateLift,
  RATING_LABELS, ratingClass,
} from '../data/benchmarks.js';

export function renderFitness(rerender) {
  const profile = getProfile();
  const draft = {
    cooperMeters: null, restingHr: null, pushups: null, plankSec: null,
    bodyweightKg: null, squatKg: null, benchKg: null, deadliftKg: null,
    ...(profile.fitness || {}),
  };
  const age = profile.basics?.age ?? 30;
  const sex = profile.basics?.sex ?? 'male';

  const container = el('div', {},
    el('h2', {}, 'Fitness'),
    el('p', { class: 'view-intro' },
      'Cardio via the Cooper 12-minute run test (a validated field estimate of VO2max) or resting heart rate, plus strength benchmarks. Fill in what you can measure — every field is optional.'),
    !profile.basics && el('div', { class: 'callout' }, 'Set your age and sex in Basics first — fitness norms depend on both.'));

  // Results
  if (profile.fitness) {
    const f = profile.fitness;
    const stats = [];
    if (f.cooperMeters) {
      const vo2 = vo2maxFromCooper(f.cooperMeters);
      const r = rateVo2max(vo2, age, sex);
      stats.push(statCard({ label: 'Est. VO2max', value: `${vo2.toFixed(1)}`, sub: `mL/kg/min — ${RATING_LABELS[r]}`, tone: ratingClass(r) }));
    }
    if (f.restingHr) {
      const r = rateRestingHr(f.restingHr);
      stats.push(statCard({ label: 'Resting HR', value: `${f.restingHr}`, sub: `bpm — ${RATING_LABELS[r]}`, tone: ratingClass(r) }));
    }
    if (f.pushups !== null && f.pushups !== undefined) {
      const r = ratePushups(f.pushups, age, sex);
      stats.push(statCard({ label: 'Push-ups', value: `${f.pushups}`, sub: RATING_LABELS[r], tone: ratingClass(r) }));
    }
    if (f.plankSec) {
      const r = ratePlank(f.plankSec);
      stats.push(statCard({ label: 'Plank', value: `${f.plankSec}s`, sub: RATING_LABELS[r], tone: ratingClass(r) }));
    }
    if (f.bodyweightKg) {
      for (const [lift, label] of [['squat', 'Squat'], ['bench', 'Bench press'], ['deadlift', 'Deadlift']]) {
        const w = f[`${lift}Kg`];
        if (!w) continue;
        const r = rateLift(lift, w, f.bodyweightKg, sex);
        stats.push(statCard({
          label, value: `${(w / f.bodyweightKg).toFixed(2)}× BW`,
          sub: `${w} kg — ${RATING_LABELS[r]}`, tone: ratingClass(r),
        }));
      }
    }
    if (stats.length) container.append(card('Your results', el('div', { class: 'stat-grid' }, stats)));
  }

  container.append(
    card('Cardio',
      numberField({
        label: 'Cooper test: distance covered in 12 minutes (meters)',
        sub: 'Run/walk as far as you can in 12 minutes on flat ground or a track. Warm up first; skip if you have cardiovascular risk factors.',
        min: 500, max: 5000, value: draft.cooperMeters, onInput: (v) => (draft.cooperMeters = v),
      }),
      numberField({
        label: 'Resting heart rate (bpm)',
        sub: 'Measure seated, after 5 minutes of rest — ideally in the morning.',
        min: 30, max: 150, value: draft.restingHr, onInput: (v) => (draft.restingHr = v),
      })),
    card('Strength',
      numberField({ label: 'Max push-ups in one set', min: 0, max: 200, value: draft.pushups, onInput: (v) => (draft.pushups = v) }),
      numberField({ label: 'Max plank hold (seconds)', min: 0, max: 1200, value: draft.plankSec, onInput: (v) => (draft.plankSec = v) }),
      numberField({ label: 'Bodyweight (kg)', sub: 'Needed to rate the lifts below.', min: 30, max: 250, value: draft.bodyweightKg, onInput: (v) => (draft.bodyweightKg = v) }),
      numberField({ label: 'Squat 1RM (kg) — optional', min: 0, max: 500, value: draft.squatKg, onInput: (v) => (draft.squatKg = v) }),
      numberField({ label: 'Bench press 1RM (kg) — optional', min: 0, max: 400, value: draft.benchKg, onInput: (v) => (draft.benchKg = v) }),
      numberField({ label: 'Deadlift 1RM (kg) — optional', min: 0, max: 500, value: draft.deadliftKg, onInput: (v) => (draft.deadliftKg = v) }),
      saveBar(() => { update('fitness', { ...draft }); rerender(); })));

  return container;
}
