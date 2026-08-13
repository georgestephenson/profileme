import { el, card, numberField, selectField, saveBar, statCard } from '../ui.js';
import { getProfile, update } from '../store.js';
import { bodyMetrics } from '../predictions.js';
import { isImperial, setUnits, kgToLb, lbToKg, cmToIn, inToCm, cmToFtIn, ftInToCm } from '../units.js';

export function renderBasics(rerender) {
  const profile = getProfile();
  const draft = { age: null, sex: 'male', heightCm: null, weightKg: null, waistCm: null, ...(profile.basics || {}) };
  const imperial = isImperial();

  const container = el('div', {},
    el('h2', {}, 'Basics'),
    el('p', { class: 'view-intro' },
      'Age and sex select the right benchmark tables; height, weight, and waist give body-composition metrics. Start here — other modules use these values.'));

  const bm = bodyMetrics(profile);
  if (bm) {
    const stats = [
      statCard({
        label: 'BMI', value: bm.bmi.toFixed(1), sub: bm.bmiClass,
        tone: bm.bmi >= 18.5 && bm.bmi < 25 ? 'good' : bm.bmi < 30 ? 'ok' : 'bad',
      }),
    ];
    if (bm.whtr !== null) {
      stats.push(statCard({
        label: 'Waist-to-height', value: bm.whtr.toFixed(2),
        sub: bm.whtrOk ? 'below 0.5 — healthy' : '0.5+ — elevated cardiometabolic risk',
        tone: bm.whtrOk ? 'good' : 'bad',
      }));
    }
    container.append(card('Body metrics',
      el('div', { class: 'stat-grid' }, stats),
      el('p', { class: 'hint' },
        'Waist-to-height ratio below 0.5 is a better-supported screen than BMI alone (BMI misclassifies muscular people). Both are population screens, not diagnoses.')));
  }

  // Height inputs: single cm field, or feet + inches when imperial.
  let heightInputs;
  if (imperial) {
    const start = draft.heightCm ? cmToFtIn(draft.heightCm) : { ft: null, inches: null };
    let ft = start.ft, inches = start.inches;
    const setH = () => (draft.heightCm = (ft || inches) ? Math.round(ftInToCm(ft, inches)) : null);
    heightInputs = el('div', { style: 'display:flex; gap:0.8rem;' },
      numberField({ label: 'Height (feet)', min: 3, max: 8, value: ft, onInput: (v) => { ft = v; setH(); } }),
      numberField({ label: '(inches)', min: 0, max: 11.9, value: inches, onInput: (v) => { inches = v; setH(); } }));
  } else {
    heightInputs = numberField({ label: 'Height (cm)', min: 100, max: 250, value: draft.heightCm, onInput: (v) => (draft.heightCm = v) });
  }

  container.append(card(null,
    selectField({
      label: 'Units',
      sub: 'Applies everywhere: heights, weights, distances. Stored values convert automatically.',
      value: imperial ? 'imperial' : 'metric',
      options: [
        { value: 'metric', label: 'Metric (kg, cm)' },
        { value: 'imperial', label: 'Imperial (lbs, feet & inches)' },
      ],
      onChange: (v) => { setUnits(v); rerender(); },
    }),
    numberField({ label: 'Age', min: 13, max: 100, value: draft.age, onInput: (v) => (draft.age = v) }),
    selectField({
      label: 'Sex',
      sub: 'Used only to pick physiological benchmark tables.',
      value: draft.sex,
      options: [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
      ],
      onChange: (v) => (draft.sex = v),
    }),
    heightInputs,
    numberField({
      label: imperial ? 'Weight (lbs)' : 'Weight (kg)',
      min: imperial ? 55 : 25, max: imperial ? 660 : 300,
      value: draft.weightKg ? (imperial ? Math.round(kgToLb(draft.weightKg)) : draft.weightKg) : null,
      onInput: (v) => (draft.weightKg = v === null ? null : Math.round((imperial ? lbToKg(v) : v) * 10) / 10),
    }),
    numberField({
      label: imperial ? 'Waist circumference (inches) — optional' : 'Waist circumference (cm) — optional',
      sub: 'Measured at the navel, relaxed. Enables the waist-to-height health screen.',
      min: imperial ? 16 : 40, max: imperial ? 87 : 220,
      value: draft.waistCm ? (imperial ? Math.round(cmToIn(draft.waistCm) * 10) / 10 : draft.waistCm) : null,
      onInput: (v) => (draft.waistCm = v === null ? null : Math.round((imperial ? inToCm(v) : v) * 10) / 10),
    }),
    saveBar(() => { update('basics', { ...draft }); rerender(); })));

  return container;
}
