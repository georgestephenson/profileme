import { el, card, numberField, selectField, saveBar } from '../ui.js';
import { getProfile, update } from '../store.js';

export function renderCareer(rerender) {
  const draft = {
    education: 'bachelor', yearsExperience: null, satisfaction: 5,
    learningHours: null, hasMentor: false, closeProfessionalContacts: null,
    ...(getProfile().career || {}),
  };

  return el('div', {},
    el('h2', {}, 'Career & education'),
    el('p', { class: 'view-intro' },
      'Structured self-report on where you stand professionally. Scored with a transparent heuristic (education + experience, satisfaction, deliberate learning, mentorship + network) — there is no validated single instrument for "career positioning", so we do not pretend otherwise.'),
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
