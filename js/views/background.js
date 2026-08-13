import { el, card, numberField, selectField, saveBar, statCard } from '../ui.js';
import { getProfile, update } from '../store.js';

const EDU_OPTIONS = [
  { value: 'none', label: 'No formal qualification' },
  { value: 'secondary', label: 'Secondary / high school' },
  { value: 'vocational', label: 'Vocational / associate' },
  { value: 'bachelor', label: "Bachelor's degree" },
  { value: 'master', label: "Master's degree" },
  { value: 'doctorate', label: 'Doctorate / professional degree' },
];
const EDU_RANK = { none: 0, secondary: 1, vocational: 2, bachelor: 3, master: 4, doctorate: 5 };

export function renderBackground(rerender) {
  const profile = getProfile();
  const draft = {
    childhoodLadder: null, currentLadder: null,
    parentEducation: 'secondary', firstGenUniversity: false,
    ...(profile.background || {}),
  };

  const container = el('div', {},
    el('h2', {}, 'Background & social mobility'),
    el('p', { class: 'view-intro' },
      'Where you started versus where you are. Uses the MacArthur ladder — a validated single-item measure of subjective social status widely used in health research — rated for your childhood household and for you today, plus intergenerational education comparison.'));

  const saved = profile.background;
  if (saved?.childhoodLadder && saved?.currentLadder) {
    const delta = saved.currentLadder - saved.childhoodLadder;
    const ownEdu = EDU_RANK[profile.career?.education] ?? null;
    const parentEdu = EDU_RANK[saved.parentEducation] ?? null;
    const eduDelta = ownEdu !== null && parentEdu !== null ? ownEdu - parentEdu : null;
    const dir = delta > 0 ? 'Upward' : delta < 0 ? 'Downward' : 'Stable';
    const stats = [
      statCard({
        label: 'Social mobility', value: dir,
        sub: `ladder ${saved.childhoodLadder} → ${saved.currentLadder} (${delta >= 0 ? '+' : ''}${delta})`,
        tone: delta > 0 ? 'good' : delta < 0 ? 'bad' : 'ok',
      }),
      statCard({ label: 'Current standing', value: `${saved.currentLadder}/10`, sub: 'MacArthur ladder self-placement' }),
    ];
    if (eduDelta !== null) {
      stats.push(statCard({
        label: 'Education vs parents',
        value: eduDelta > 0 ? `+${eduDelta} levels` : eduDelta < 0 ? `${eduDelta} levels` : 'Same',
        sub: saved.firstGenUniversity ? 'first-generation university' : 'intergenerational comparison',
        tone: eduDelta > 0 ? 'good' : eduDelta < 0 ? 'ok' : '',
      }));
    }
    container.append(card('Your mobility', el('div', { class: 'stat-grid' }, stats),
      el('p', { class: 'hint' },
        'Mobility is descriptive, not a grade: starting rung is luck, direction of travel is partly yours. Subjective status on the MacArthur ladder predicts health outcomes even after controlling for objective income (Adler et al., 2000).')));
  }

  container.append(card('Inputs',
    numberField({
      label: 'The ladder, age ~10: where did your childhood household stand? (1-10)',
      sub: 'Imagine a 10-rung ladder of your country by money, education, and respected work. 1 = bottom, 10 = top.',
      min: 1, max: 10, value: draft.childhoodLadder, onInput: (v) => (draft.childhoodLadder = v),
    }),
    numberField({
      label: 'The ladder, today: where do you stand now? (1-10)',
      min: 1, max: 10, value: draft.currentLadder, onInput: (v) => (draft.currentLadder = v),
    }),
    selectField({
      label: "Your parents' highest education (either parent)",
      value: draft.parentEducation,
      options: EDU_OPTIONS,
      onChange: (v) => (draft.parentEducation = v),
    }),
    selectField({
      label: 'Were you the first in your immediate family to attend university?',
      value: draft.firstGenUniversity ? 'yes' : 'no',
      options: [{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }],
      onChange: (v) => (draft.firstGenUniversity = v === 'yes'),
    }),
    saveBar(() => { update('background', { ...draft }); rerender(); })));

  return container;
}
