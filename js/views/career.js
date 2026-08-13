import { el, card, numberField, selectField, saveBar } from '../ui.js';
import { getProfile, update } from '../store.js';
import { breakdownRadar } from '../radar.js';

export function renderCareer(rerender) {
  const draft = {
    education: 'bachelor', yearsExperience: null, satisfaction: 5,
    learningHours: null, hasMentor: false, closeProfessionalContacts: null,
    ...(getProfile().career || {}),
  };

  const saved = getProfile().career;
  const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
  const radar = saved ? breakdownRadar([
    { label: 'Credentials', value: clamp(({ none: 10, secondary: 30, vocational: 45, bachelor: 60, master: 75, doctorate: 90 }[saved.education] ?? 30) + clamp((saved.yearsExperience ?? 0) * 4, 0, 40), 0, 100) },
    { label: 'Satisfaction', value: saved.satisfaction ? clamp(saved.satisfaction * 10, 0, 100) : null },
    { label: 'Learning', value: clamp((saved.learningHours ?? 0) * 12 + 40, 0, 100) },
    { label: 'Network', value: clamp((saved.hasMentor ? 60 : 20) + clamp((saved.closeProfessionalContacts ?? 0) * 6, 0, 60), 0, 100) },
  ]) : null;

  return el('div', {},
    el('h2', {}, 'Career & education'),
    el('p', { class: 'view-intro' },
      'Structured self-report on where you stand professionally. Scored with a transparent heuristic (education + experience, satisfaction, deliberate learning, mentorship + network) — there is no validated single instrument for "career positioning", so we do not pretend otherwise.'),
    radar && card('Career breakdown', radar,
      el('p', { class: 'hint' }, 'The sub-dimensions behind your career score.')),
    card(null,
      selectField({
        label: 'Highest completed education',
        value: draft.education,
        options: [
          { value: 'none', label: 'No formal qualification' },
          { value: 'secondary', label: 'Secondary / high school' },
          { value: 'vocational', label: 'Vocational / associate' },
          { value: 'bachelor', label: "Bachelor's degree" },
          { value: 'master', label: "Master's degree" },
          { value: 'doctorate', label: 'Doctorate / professional degree' },
        ],
        onChange: (v) => (draft.education = v),
      }),
      numberField({ label: 'Years of experience in your current field', min: 0, max: 60, value: draft.yearsExperience, onInput: (v) => (draft.yearsExperience = v) }),
      numberField({ label: 'Job satisfaction (1-10)', sub: '1 = dread it, 10 = love it.', min: 1, max: 10, value: draft.satisfaction, onInput: (v) => (draft.satisfaction = v) }),
      numberField({
        label: 'Hours per week of deliberate skill development',
        sub: 'Structured learning with feedback — courses, practice projects, coaching. Not passive doing-the-job.',
        min: 0, max: 60, value: draft.learningHours, onInput: (v) => (draft.learningHours = v),
      }),
      selectField({
        label: 'Do you have a mentor or coach?',
        value: draft.hasMentor ? 'yes' : 'no',
        options: [{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }],
        onChange: (v) => (draft.hasMentor = v === 'yes'),
      }),
      numberField({
        label: 'Professional contacts you could call for a favor',
        sub: 'People who would take your call and actually help.',
        min: 0, max: 500, value: draft.closeProfessionalContacts, onInput: (v) => (draft.closeProfessionalContacts = v),
      }),
      saveBar(() => { update('career', { ...draft }); rerender(); })));
}
