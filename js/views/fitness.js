import { el, card, numberField, selectField, saveBar, statCard } from '../ui.js';
import { getProfile, update } from '../store.js';
import {
  vo2maxFromCooper, vdotFrom5k, rateVo2max, rateRestingHr, ratePlank,
  rateVerticalJump, rateBalance, rateToeTouch, oneRepMax,
  TOE_TOUCH_OPTIONS, RATING_LABELS, ratingClass,
} from '../data/benchmarks.js';
import { EXERCISE_CATALOG, EQUIPMENT_LABELS, findExercise, rateExercise, migrateLegacyFitness } from '../data/exercises.js';
import { MUSCLES, muscleContributions, muscleScores, muscleColor } from '../data/muscles.js';
import { breakdownRadar } from '../radar.js';
import { isImperial, kgToLb, lbToKg, cmToIn, inToCm, milesToM, mToMiles, fmtWeight } from '../units.js';

const avg = (xs) => {
  const v = xs.filter((x) => x !== null && x !== undefined);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
};
const rs = (r) => (r === null || r === undefined ? null : r * 25);

export function renderFitness(rerender) {
  const profile = getProfile();
  const migrated = migrateLegacyFitness(profile.fitness);
  const draft = {
    cooperMeters: null, fiveKMin: null, restingHr: null,
    plankSec: null, verticalJumpCm: null, balanceSec: null, toeTouch: null,
    ...(migrated || {}),
    exercises: [...(migrated?.exercises || [])],
  };
  const age = profile.basics?.age ?? 30;
  const sex = profile.basics?.sex ?? 'male';
  const bodyweightKg = profile.basics?.weightKg ?? profile.fitness?.bodyweightKg ?? null;
  const imperial = isImperial();

  const container = el('div', {},
    el('h2', {}, 'Fitness'),
    el('p', { class: 'view-intro' },
      'Cardio, strength, power, balance, and flexibility, rated against age- and sex-adjusted benchmarks. Build your own exercise list — barbell, dumbbell, Smith machine, or calisthenics — and enter any weight × reps set; 1RM is estimated with the Epley formula.'),
    !profile.basics?.age && el('div', { class: 'callout' }, 'Set your age and sex in Basics first — fitness norms depend on both.'),
    !bodyweightKg && el('div', { class: 'callout' }, 'Add your weight in Basics to rate weighted exercises (they are scored relative to bodyweight).'));

  const f = migrated;
  if (f) {
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
    if (f.plankSec) push('Plank', `${f.plankSec}s`, '', ratePlank(f.plankSec));
    if (f.verticalJumpCm) push('Vertical jump', imperial ? `${(cmToIn(f.verticalJumpCm)).toFixed(1)} in` : `${f.verticalJumpCm} cm`, '', rateVerticalJump(f.verticalJumpCm, age, sex));
    if (f.balanceSec) push('One-leg balance', `${f.balanceSec}s`, '', rateBalance(f.balanceSec));
    if (f.toeTouch) push('Flexibility', TOE_TOUCH_OPTIONS.find((o) => o.value === f.toeTouch)?.label ?? '', '', rateToeTouch(f.toeTouch));
    for (const entry of f.exercises || []) {
      const ex = findExercise(entry.id);
      const r = rateExercise(entry, sex, bodyweightKg);
      if (!ex || r === null) continue;
      if (ex.type === 'reps') {
        push(ex.name, `${entry.reps}`, 'reps', r);
      } else {
        const orm = oneRepMax(entry.weightKg, entry.reps || 1);
        push(ex.name, `${fmtWeight(orm)} 1RM`, `${(orm / bodyweightKg).toFixed(2)}× BW`, r);
      }
    }
    if (stats.length) container.append(card('Your results', el('div', { class: 'stat-grid' }, stats)));

    // Breakdown radar by movement category
    const catRatings = { push: [], pull: [], lower: [], core: [] };
    for (const entry of f.exercises || []) {
      const ex = findExercise(entry.id);
      const r = rateExercise(entry, sex, bodyweightKg);
      if (!ex || r === null) continue;
      const primary = Object.entries(ex.muscles).sort((a, b) => b[1] - a[1])[0][0];
      if (['chest', 'shoulders', 'triceps'].includes(primary)) catRatings.push.push(r);
      else if (['upperBack', 'biceps', 'forearms'].includes(primary)) catRatings.pull.push(r);
      else if (['quads', 'glutes', 'hamstrings', 'calves', 'lowerBack'].includes(primary)) catRatings.lower.push(r);
      else catRatings.core.push(r);
    }
    if (f.plankSec) catRatings.core.push(ratePlank(f.plankSec));
    const cardioParts = [
      f.cooperMeters ? rateVo2max(vo2maxFromCooper(f.cooperMeters), age, sex) : null,
      f.fiveKMin ? rateVo2max(vdotFrom5k(f.fiveKMin), age, sex) : null,
      f.restingHr ? rateRestingHr(f.restingHr) : null,
    ];
    const radar = breakdownRadar([
      { label: 'Cardio', value: avg(cardioParts.map(rs)) },
      { label: 'Upper push', value: avg(catRatings.push.map(rs)) },
      { label: 'Upper pull', value: avg(catRatings.pull.map(rs)) },
      { label: 'Lower body', value: avg(catRatings.lower.map(rs)) },
      { label: 'Core', value: avg(catRatings.core.map(rs)) },
      { label: 'Power', value: f.verticalJumpCm ? rs(rateVerticalJump(f.verticalJumpCm, age, sex)) : null },
      { label: 'Balance', value: f.balanceSec ? rs(rateBalance(f.balanceSec)) : null },
      { label: 'Flexibility', value: f.toeTouch ? rs(rateToeTouch(f.toeTouch)) : null },
    ]);
    if (radar) {
      container.append(card('Fitness breakdown', radar,
        el('p', { class: 'hint' }, 'The sub-dimensions behind your fitness score. Complete more tests to fill in the picture.')));
    }

    // Muscle map
    const mScores = muscleScores(muscleContributions(f, age, sex, bodyweightKg));
    if (Object.values(mScores).some((v) => v !== null)) {
      container.append(card('Muscle map',
        el('div', { class: 'muscle-map-wrap' }, bodySvg('front', mScores), bodySvg('back', mScores)),
        el('div', { class: 'muscle-legend' },
          el('span', { style: 'color:#dc2626;' }, 'Needs work'),
          el('span', { style: 'color:#d97706;' }, 'Fair'),
          el('span', { style: 'color:#84cc16;' }, 'Good'),
          el('span', { style: 'color:#16a34a;' }, 'Strong'),
          el('span', { style: 'color:#a8aeb8;' }, 'No data')),
        el('p', { class: 'hint' },
          'Each muscle group is colored by the benchmark ratings of the exercises that train it, weighted by involvement. Add curls for biceps, calf raises for calves, rows for upper back… to light up the whole body.')));
    }
  }

  // ------- Exercise list manager (typeahead) -------
  const exListEl = el('div', { class: 'row-list' });

  function renderExerciseRows() {
    exListEl.replaceChildren(...(
      draft.exercises.length
        ? draft.exercises.map((entry, i) => {
            const ex = findExercise(entry.id);
            if (!ex) return el('div');
            const inputs = [];
            if (ex.type === 'weight') {
              inputs.push(
                el('input', {
                  type: 'number', min: 1, max: imperial ? 1100 : 500, placeholder: imperial ? 'lbs' : 'kg',
                  value: entry.weightKg ? (imperial ? Math.round(kgToLb(entry.weightKg)) : entry.weightKg) : '',
                  style: 'max-width:80px;',
                  oninput: (e) => {
                    const v = e.target.value === '' ? null : Number(e.target.value);
                    entry.weightKg = v === null ? null : Math.round((imperial ? lbToKg(v) : v) * 10) / 10;
                  },
                }),
                el('span', { style: 'color:var(--text-soft); font-size:0.8rem;' }, imperial ? 'lbs ×' : 'kg ×'));
            }
            inputs.push(
              el('input', {
                type: 'number', min: ex.type === 'weight' ? 1 : 0, max: 200, placeholder: 'reps', value: entry.reps ?? '',
                style: 'max-width:70px;',
                oninput: (e) => (entry.reps = e.target.value === '' ? null : Number(e.target.value)),
              }),
              el('span', { style: 'color:var(--text-soft); font-size:0.8rem;' }, 'reps'));
            return el('div', { class: 'row' },
              el('div', { style: 'min-width:180px;' },
                el('strong', {}, ex.name),
                el('span', { class: 'badge', style: 'margin-left:0.4rem;' }, EQUIPMENT_LABELS[ex.equipment])),
              ...inputs,
              el('button', { class: 'row-remove', onclick: () => { draft.exercises.splice(i, 1); renderExerciseRows(); } }, 'Remove'));
          })
        : [el('p', { class: 'empty-note' }, 'No exercises yet — search above and add the ones you actually do.')]));
  }

  const datalist = el('datalist', { id: 'exercise-options' },
    EXERCISE_CATALOG.map((ex) => el('option', { value: `${ex.name} (${EQUIPMENT_LABELS[ex.equipment]})` })));
  const searchInput = el('input', {
    type: 'text', list: 'exercise-options', placeholder: 'Type to search… e.g. curl, squat, dips',
    style: 'max-width:320px;',
  });
  const addBtn = el('button', {
    class: 'btn',
    onclick: () => {
      const val = searchInput.value.trim().toLowerCase();
      const ex = EXERCISE_CATALOG.find((e) =>
        `${e.name} (${EQUIPMENT_LABELS[e.equipment]})`.toLowerCase() === val || e.name.toLowerCase() === val);
      if (!ex) { alert('Pick an exercise from the suggestions.'); return; }
      if (draft.exercises.some((en) => en.id === ex.id)) { searchInput.value = ''; return; }
      draft.exercises.push({ id: ex.id, weightKg: null, reps: null });
      searchInput.value = '';
      renderExerciseRows();
    },
  }, 'Add');

  renderExerciseRows();

  container.append(
    card('Your exercises',
      el('p', { class: 'hint', style: 'margin-bottom:0.6rem;' },
        bodyweightKg
          ? `Search the catalog (${EXERCISE_CATALOG.length} exercises: barbell, dumbbell, Smith machine, calisthenics) and log your best recent set. Weighted lifts are rated relative to your ${fmtWeight(bodyweightKg)} bodyweight; dumbbell entries are per dumbbell.`
          : 'Search the catalog and log your best recent set. Add your weight in Basics to rate weighted exercises.'),
      datalist,
      el('div', { style: 'display:flex; gap:0.6rem; flex-wrap:wrap; margin-bottom:0.8rem;' }, searchInput, addBtn),
      exListEl,
      saveBar(() => { update('fitness', { ...draft }); rerender(); })),
    card('Cardio',
      numberField({
        label: imperial ? 'Cooper test: distance covered in 12 minutes (miles)' : 'Cooper test: distance covered in 12 minutes (meters)',
        sub: `Run/walk as far as you can in 12 minutes on flat ground.${imperial ? ' Decimals fine: 1.25 = 1¼ miles.' : ''} Warm up first; skip if you have cardiovascular risk factors.`,
        min: imperial ? 0.3 : 500, max: imperial ? 3.2 : 5000,
        value: draft.cooperMeters ? (imperial ? Math.round(mToMiles(draft.cooperMeters) * 100) / 100 : draft.cooperMeters) : null,
        onInput: (v) => (draft.cooperMeters = v === null ? null : Math.round(imperial ? milesToM(v) : v)),
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
    card('Field tests: core, power, balance & flexibility',
      numberField({ label: 'Max plank hold (seconds)', min: 0, max: 1200, value: draft.plankSec, onInput: (v) => (draft.plankSec = v) }),
      numberField({
        label: imperial ? 'Vertical jump (inches)' : 'Vertical jump (cm)',
        sub: 'Standing reach vs. jump-and-touch height difference.',
        min: imperial ? 2 : 5, max: imperial ? 47 : 120,
        value: draft.verticalJumpCm ? (imperial ? Math.round(cmToIn(draft.verticalJumpCm) * 10) / 10 : draft.verticalJumpCm) : null,
        onInput: (v) => (draft.verticalJumpCm = v === null ? null : Math.round(imperial ? inToCm(v) : v)),
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
      }),
      saveBar(() => { update('fitness', { ...draft }); rerender(); })));

  return container;
}

// Simple segmented body diagram, front and back, colored per muscle group.
function bodySvg(side, scores) {
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '0 0 100 180');

  const shape = (tag, attrs, muscle) => {
    const node = document.createElementNS(svgNS, tag);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
    if (muscle) {
      node.setAttribute('fill', muscleColor(scores[muscle]));
      const title = document.createElementNS(svgNS, 'title');
      title.textContent = `${MUSCLES[muscle]}: ${scores[muscle] === null ? 'no data' : scores[muscle] + '/100'}`;
      node.append(title);
    }
    svg.append(node);
    return node;
  };

  shape('circle', { cx: 50, cy: 10, r: 8, fill: '#e8ebef' });
  shape('rect', { x: 46, y: 17, width: 8, height: 6, fill: '#e8ebef' });

  if (side === 'front') {
    shape('ellipse', { cx: 27, cy: 30, rx: 8, ry: 6 }, 'shoulders');
    shape('ellipse', { cx: 73, cy: 30, rx: 8, ry: 6 }, 'shoulders');
    shape('rect', { x: 36, y: 26, width: 13, height: 16, rx: 4 }, 'chest');
    shape('rect', { x: 51, y: 26, width: 13, height: 16, rx: 4 }, 'chest');
    shape('ellipse', { cx: 23, cy: 50, rx: 5.5, ry: 11 }, 'biceps');
    shape('ellipse', { cx: 77, cy: 50, rx: 5.5, ry: 11 }, 'biceps');
    shape('ellipse', { cx: 20, cy: 74, rx: 4.5, ry: 11 }, 'forearms');
    shape('ellipse', { cx: 80, cy: 74, rx: 4.5, ry: 11 }, 'forearms');
    shape('rect', { x: 38, y: 44, width: 24, height: 28, rx: 6 }, 'core');
    shape('rect', { x: 34, y: 76, width: 14, height: 42, rx: 6 }, 'quads');
    shape('rect', { x: 52, y: 76, width: 14, height: 42, rx: 6 }, 'quads');
    shape('rect', { x: 36, y: 122, width: 11, height: 38, rx: 5, fill: '#e8ebef' });
    shape('rect', { x: 53, y: 122, width: 11, height: 38, rx: 5, fill: '#e8ebef' });
    shape('text', { x: 50, y: 174, 'text-anchor': 'middle', 'font-size': 8, fill: '#5b6675' }).textContent = 'Front';
  } else {
    shape('rect', { x: 34, y: 26, width: 32, height: 22, rx: 5 }, 'upperBack');
    shape('ellipse', { cx: 23, cy: 50, rx: 5.5, ry: 11 }, 'triceps');
    shape('ellipse', { cx: 77, cy: 50, rx: 5.5, ry: 11 }, 'triceps');
    shape('ellipse', { cx: 20, cy: 74, rx: 4.5, ry: 11 }, 'forearms');
    shape('ellipse', { cx: 80, cy: 74, rx: 4.5, ry: 11 }, 'forearms');
    shape('rect', { x: 40, y: 50, width: 20, height: 20, rx: 5 }, 'lowerBack');
    shape('ellipse', { cx: 43, cy: 80, rx: 8.5, ry: 8 }, 'glutes');
    shape('ellipse', { cx: 57, cy: 80, rx: 8.5, ry: 8 }, 'glutes');
    shape('rect', { x: 34, y: 90, width: 14, height: 34, rx: 6 }, 'hamstrings');
    shape('rect', { x: 52, y: 90, width: 14, height: 34, rx: 6 }, 'hamstrings');
    shape('ellipse', { cx: 41, cy: 142, rx: 5.5, ry: 15 }, 'calves');
    shape('ellipse', { cx: 59, cy: 142, rx: 5.5, ry: 15 }, 'calves');
    shape('text', { x: 50, y: 174, 'text-anchor': 'middle', 'font-size': 8, fill: '#5b6675' }).textContent = 'Back';
  }
  return svg;
}
