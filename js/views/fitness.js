import { el, card, numberField, selectField, saveBar, statCard } from '../ui.js';
import { getProfile, update } from '../store.js';
import {
  vo2maxFromCooper, vdotFrom5k, rateVo2max, rateRestingHr, ratePushups, ratePullups,
  ratePlank, rateLift, rateVerticalJump, rateBalance, rateToeTouch, rateCalfRaises,
  oneRepMax, TOE_TOUCH_OPTIONS, RATING_LABELS, ratingClass,
} from '../data/benchmarks.js';
import { BARBELL_LIFTS, MUSCLES, exerciseRatings, muscleScores, muscleColor } from '../data/muscles.js';
import { breakdownRadar } from '../radar.js';

const avg = (xs) => {
  const v = xs.filter((x) => x !== null && x !== undefined);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
};
const rs = (r) => (r === null || r === undefined ? null : r * 25);

export function renderFitness(rerender) {
  const profile = getProfile();
  const draft = {
    cooperMeters: null, fiveKMin: null, restingHr: null,
    pushups: null, pullups: null, plankSec: null, calfRaises: null,
    verticalJumpCm: null, balanceSec: null, toeTouch: null,
    squatKg: null, squatReps: null, benchKg: null, benchReps: null,
    deadliftKg: null, deadliftReps: null, pressKg: null, pressReps: null,
    rowKg: null, rowReps: null, curlKg: null, curlReps: null,
    ...(profile.fitness || {}),
  };
  const age = profile.basics?.age ?? 30;
  const sex = profile.basics?.sex ?? 'male';
  // Bodyweight comes from Basics (no duplicate entry); legacy field as fallback.
  const bodyweightKg = profile.basics?.weightKg ?? profile.fitness?.bodyweightKg ?? null;

  const container = el('div', {},
    el('h2', {}, 'Fitness'),
    el('p', { class: 'view-intro' },
      'Cardio, strength, power, balance, and flexibility, rated against age- and sex-adjusted benchmarks. For barbell lifts, enter any weight × reps set — your one-rep max is estimated with the Epley formula. Every field is optional.'),
    !profile.basics?.age && el('div', { class: 'callout' }, 'Set your age and sex in Basics first — fitness norms depend on both.'),
    !bodyweightKg && el('div', { class: 'callout' }, 'Add your weight in Basics to rate barbell lifts (they are scored relative to bodyweight).'));

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
    if (f.calfRaises) push('Calf raises (single-leg)', `${f.calfRaises}`, '', rateCalfRaises(f.calfRaises));
    if (f.verticalJumpCm) push('Vertical jump', `${f.verticalJumpCm} cm`, '', rateVerticalJump(f.verticalJumpCm, age, sex));
    if (f.balanceSec) push('One-leg balance', `${f.balanceSec}s`, '', rateBalance(f.balanceSec));
    if (f.toeTouch) push('Flexibility', TOE_TOUCH_OPTIONS.find((o) => o.value === f.toeTouch)?.label ?? '', '', rateToeTouch(f.toeTouch));
    if (bodyweightKg) {
      for (const [lift, label] of BARBELL_LIFTS) {
        const w = f[`${lift}Kg`];
        if (!w) continue;
        const orm = oneRepMax(w, f[`${lift}Reps`] || 1);
        push(label, `${Math.round(orm)} kg 1RM`, `${(orm / bodyweightKg).toFixed(2)}× BW`, rateLift(lift, orm, bodyweightKg, sex));
      }
    }
    if (stats.length) container.append(card('Your results', el('div', { class: 'stat-grid' }, stats)));

    // Breakdown radar: the sub-dimensions behind the fitness score
    const ratings = exerciseRatings(f, age, sex, bodyweightKg);
    const cardioParts = [
      f.cooperMeters ? rateVo2max(vo2maxFromCooper(f.cooperMeters), age, sex) : null,
      f.fiveKMin ? rateVo2max(vdotFrom5k(f.fiveKMin), age, sex) : null,
      f.restingHr ? rateRestingHr(f.restingHr) : null,
    ];
    const sub = [
      { label: 'Cardio', value: avg(cardioParts.map(rs)) },
      { label: 'Upper push', value: avg([ratings.bench, ratings.press, ratings.pushups].map(rs)) },
      { label: 'Upper pull', value: avg([ratings.row, ratings.pullups, ratings.curl].map(rs)) },
      { label: 'Lower body', value: avg([ratings.squat, ratings.deadlift, ratings.calfRaises].map(rs)) },
      { label: 'Core', value: rs(ratings.plank) },
      { label: 'Power', value: rs(ratings.verticalJump) },
      { label: 'Balance', value: f.balanceSec ? rs(rateBalance(f.balanceSec)) : null },
      { label: 'Flexibility', value: f.toeTouch ? rs(rateToeTouch(f.toeTouch)) : null },
    ];
    const radar = breakdownRadar(sub);
    if (radar) {
      container.append(card('Fitness breakdown', radar,
        el('p', { class: 'hint' }, 'The sub-dimensions behind your fitness score. Complete more tests to fill in the picture.')));
    }

    // Muscle map
    const mScores = muscleScores(ratings);
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
          'Each muscle group is colored by the benchmark ratings of the exercises that train it, weighted by involvement. Log more exercises (curls for biceps, calf raises for calves, rows for upper back…) to light up the whole body.')));
    }
  }

  const liftRow = (lift, label) =>
    el('div', { style: 'display:flex; gap:0.8rem; flex-wrap:wrap; align-items:flex-end;' },
      numberField({ label: `${label} — weight (kg)`, min: 0, max: 500, value: draft[`${lift}Kg`], onInput: (v) => (draft[`${lift}Kg`] = v) }),
      numberField({ label: 'reps', sub: '1 = it was a max single', min: 1, max: 30, value: draft[`${lift}Reps`], onInput: (v) => (draft[`${lift}Reps`] = v) }));

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
      numberField({ label: 'Max plank hold (seconds)', min: 0, max: 1200, value: draft.plankSec, onInput: (v) => (draft.plankSec = v) }),
      numberField({
        label: 'Single-leg calf raises to fatigue (reps)',
        sub: 'Stand on one foot, rise onto the ball of your foot, full range, until you can\'t.',
        min: 0, max: 100, value: draft.calfRaises, onInput: (v) => (draft.calfRaises = v),
      })),
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
    card('Barbell lifts (any weight × reps set)',
      el('p', { class: 'hint', style: 'margin-bottom:0.8rem;' },
        bodyweightKg
          ? `Rated relative to your bodyweight (${bodyweightKg} kg, from Basics). Enter your best recent set — 1RM is estimated with the Epley formula.`
          : 'Add your weight in Basics to enable lift ratings.'),
      ...BARBELL_LIFTS.map(([lift, label]) => liftRow(lift, label)),
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

  // silhouette basics (both sides)
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
