// Prediction & planning engine. Every projection is a RANGE with its basis
// stated, built from published effect sizes and standard progression models —
// not point predictions. Where evidence is weak we say "heuristic".

import { vo2maxFromCooper, rateVo2max, ratePushups, rateLift } from './data/benchmarks.js';
import { normalCdf } from './data/cognitive.js';

const fmt = (n) => Math.round(n).toLocaleString();
const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

// ---------- Earnings potential ----------
// Transparent lever model anchored to current income. Literature anchors:
// each additional year of schooling ~8-10% earnings premium (Psacharopoulos &
// Patrinos, 2018); cognitive ability correlates r ≈ .25-.3 with income;
// conscientiousness r ≈ .2 with job performance (Schmidt & Hunter, 1998);
// job switching and negotiation produce well-documented step gains.
export function earningsPotential(profile, scores) {
  const income = profile.finance?.monthlyIncome;
  if (!income) return null;

  const levers = [];
  let low = 5, high = 12; // baseline 5-year real wage drift, %

  const c = profile.career || {};
  if (['none', 'secondary', 'vocational'].includes(c.education)) {
    levers.push('Completing a degree or high-value certification (education premium ≈ 8-10% per year of schooling)');
    low += 8; high += 25;
  }
  if ((c.learningHours ?? 0) < 3) {
    levers.push('Deliberate skill development 3+ hrs/week toward in-demand skills in your field');
    low += 3; high += 10;
  }
  if (!c.hasMentor) {
    levers.push('Finding a mentor/sponsor (associated with faster promotion rates)');
    low += 2; high += 6;
  }
  if ((c.closeProfessionalContacts ?? 0) < 5) {
    levers.push('Building your professional network — most job moves come through weak ties (Granovetter)');
    low += 2; high += 6;
  }
  if ((c.satisfaction ?? 10) <= 4) {
    levers.push('Strategic job change — external moves typically out-pay internal raises');
    low += 5; high += 15;
  }
  const cog = profile.cognition?.battery;
  if (cog && cog.z > 0.7) {
    levers.push('Your cognitive estimate is well above average — favors complex, high-leverage roles where ability premiums are largest');
    high += 8;
  }
  const traits = scores?.personalityTraits;
  if (traits && traits.C >= 70) {
    levers.push('High conscientiousness — the best-replicated personality predictor of job performance; compounds every other lever');
    high += 5;
  }

  return {
    currentMonthly: income,
    lowPct: low,
    highPct: high,
    projectedLow: income * (1 + low / 100),
    projectedHigh: income * (1 + high / 100),
    levers,
  };
}

// ---------- Strength potential ----------
// Novice lifters on structured progressive overload typically gain 40-100%
// on main lifts in year one; intermediates 10-25%.
export function strengthPotential(profile) {
  const f = profile.fitness;
  if (!f) return null;
  const age = profile.basics?.age ?? 30, sex = profile.basics?.sex ?? 'male';

  const ratings = [];
  if (f.pushups !== null && f.pushups !== undefined) ratings.push(ratePushups(f.pushups, age, sex));
  if (f.bodyweightKg) {
    for (const lift of ['squat', 'bench', 'deadlift']) {
      if (f[`${lift}Kg`]) ratings.push(rateLift(lift, f[`${lift}Kg`], f.bodyweightKg, sex));
    }
  }
  if (!ratings.length) return null;
  const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;

  if (avgRating < 2) {
    return {
      level: 'novice',
      gainLow: 40, gainHigh: 100, horizon: '12 months',
      plan: '3 full-body sessions/week of progressive overload (e.g. a beginner barbell or calisthenics program), adding small increments every session while recovery allows.',
      basis: 'Typical documented novice gains under structured progression ("newbie gains").',
    };
  }
  if (avgRating < 3) {
    return {
      level: 'intermediate',
      gainLow: 10, gainHigh: 25, horizon: '12 months',
      plan: '4 sessions/week with periodized programming (weekly progression, planned deloads), tracking lifts and eating adequate protein (~1.6 g/kg/day).',
      basis: 'Typical intermediate progression rates with periodized training.',
    };
  }
  return {
    level: 'advanced',
    gainLow: 3, gainHigh: 10, horizon: '12 months',
    plan: 'Specialized block periodization; gains at your level come from programming quality, sleep, and consistency.',
    basis: 'Advanced trainees approach their genetic ceiling; progress slows accordingly.',
  };
}

// ---------- Cardio potential ----------
// Meta-analyses: aerobic training improves VO2max ~15-25% in untrained people
// over 3-6 months; HIIT adds further gains.
export function cardioPotential(profile) {
  const f = profile.fitness;
  if (!f?.cooperMeters) return null;
  const age = profile.basics?.age ?? 30, sex = profile.basics?.sex ?? 'male';
  const vo2 = vo2maxFromCooper(f.cooperMeters);
  const rating = rateVo2max(vo2, age, sex);
  const [gLow, gHigh] = rating <= 1 ? [15, 25] : rating === 2 ? [10, 18] : [5, 10];
  return {
    currentVo2: vo2,
    rating,
    targetLow: vo2 * (1 + gLow / 100),
    targetHigh: vo2 * (1 + gHigh / 100),
    horizon: '6 months',
    plan: '3-4 zone-2 sessions (30-45 min, conversational pace) + 1 interval session (e.g. 4×4 min hard) per week.',
    basis: 'Meta-analytic VO2max trainability estimates; the 4×4 protocol is among the best-studied (Helgerud et al., 2007).',
  };
}

// ---------- Wealth projection ----------
// Compound growth at 4% real return: current path vs a 20% savings rate.
export function wealthProjection(profile) {
  const fin = profile.finance;
  if (!fin?.monthlyIncome || fin.monthlyExpenses === null || fin.monthlyExpenses === undefined) return null;
  const r = 0.04 / 12;
  const months = 10 * 12;
  const start = fin.netWorth ?? 0;
  const currentSave = Math.max(0, fin.monthlyIncome - fin.monthlyExpenses);
  const targetSave = fin.monthlyIncome * 0.20;

  const project = (monthly) => {
    let total = start;
    for (let m = 0; m < months; m++) total = total * (1 + r) + monthly;
    return total;
  };

  return {
    currentSave,
    targetSave,
    currentPath: project(currentSave),
    targetPath: project(targetSave),
    gap: project(targetSave) - project(currentSave),
    basis: '10-year compound projection at a 4% real annual return (roughly the historical global equity real return, minus fees).',
  };
}

// ---------- Language timeline ----------
// FSI-style estimates: roughly 150-200 guided hours per CEFR level step for
// languages related to your own; 2-3x that for distant languages.
export function languageTimeline(profile, hoursPerWeek = 5) {
  const list = profile.languages?.list || [];
  const learning = list.find((l) => ['A1', 'A2', 'B1', 'B2'].includes(l.level));
  if (!learning) return null;
  const next = { A1: 'A2', A2: 'B1', B1: 'B2', B2: 'C1' }[learning.level];
  const hoursLow = 150, hoursHigh = 250;
  return {
    language: learning.name,
    from: learning.level,
    to: next,
    weeksLow: Math.ceil(hoursLow / hoursPerWeek),
    weeksHigh: Math.ceil(hoursHigh / hoursPerWeek),
    hoursPerWeek,
    basis: 'FSI-derived estimates of ~150-250 study hours per CEFR step for related languages (more for distant ones).',
  };
}

// ---------- Body composition ----------
export function bodyMetrics(profile) {
  const b = profile.basics;
  if (!b?.heightCm || !b?.weightKg) return null;
  const h = b.heightCm / 100;
  const bmi = b.weightKg / (h * h);
  const whtr = b.waistCm ? b.waistCm / b.heightCm : null;
  return {
    bmi,
    bmiClass: bmi < 18.5 ? 'underweight' : bmi < 25 ? 'healthy range' : bmi < 30 ? 'overweight' : 'obese range',
    whtr,
    whtrOk: whtr === null ? null : whtr < 0.5,
  };
}

export { fmt, clamp, normalCdf };
