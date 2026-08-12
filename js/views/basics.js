import { el, card, numberField, selectField, saveBar, statCard } from '../ui.js';
import { getProfile, update } from '../store.js';
import { bodyMetrics } from '../predictions.js';

export function renderBasics(rerender) {
  const profile = getProfile();
  const draft = { age: null, sex: 'male', heightCm: null, weightKg: null, waistCm: null, ...(profile.basics || {}) };

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

  container.append(card(null,
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
    numberField({ label: 'Height (cm)', min: 100, max: 250, value: draft.heightCm, onInput: (v) => (draft.heightCm = v) }),
    numberField({ label: 'Weight (kg)', min: 25, max: 300, value: draft.weightKg, onInput: (v) => (draft.weightKg = v) }),
    numberField({
      label: 'Waist circumference (cm) — optional',
      sub: 'Measured at the navel, relaxed. Enables the waist-to-height health screen.',
      min: 40, max: 220, value: draft.waistCm, onInput: (v) => (draft.waistCm = v),
    }),
    saveBar(() => { update('basics', { ...draft }); rerender(); })));

  return container;
}
