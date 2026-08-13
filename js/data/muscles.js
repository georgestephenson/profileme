// Muscle-group model: maps each exercise's benchmark rating (0-4) onto the
// muscle groups it trains, weighted by involvement, to produce a per-muscle
// 0-100 score for the body diagram.

import {
  ratePushups, ratePullups, ratePlank, rateLift, rateVerticalJump, rateCalfRaises,
} from './benchmarks.js';
import { oneRepMax } from './benchmarks.js';

export const MUSCLES = {
  shoulders: 'Shoulders',
  chest: 'Chest',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Forearms',
  core: 'Core',
  upperBack: 'Upper back',
  lowerBack: 'Lower back',
  glutes: 'Glutes',
  quads: 'Quads',
  hamstrings: 'Hamstrings',
  calves: 'Calves',
};

// exercise -> { muscle: weight }
const EXERCISE_MUSCLES = {
  bench: { chest: 1, triceps: 0.6, shoulders: 0.4 },
  press: { shoulders: 1, triceps: 0.6 },
  row: { upperBack: 1, biceps: 0.5, forearms: 0.4 },
  curl: { biceps: 1, forearms: 0.4 },
  squat: { quads: 1, glutes: 0.8, lowerBack: 0.3, core: 0.3 },
  deadlift: { hamstrings: 0.9, glutes: 0.8, lowerBack: 1, forearms: 0.5, upperBack: 0.4 },
  pullups: { upperBack: 0.9, biceps: 0.8, forearms: 0.6 },
  pushups: { chest: 0.7, triceps: 0.5, shoulders: 0.4, core: 0.3 },
  plank: { core: 1 },
  verticalJump: { quads: 0.6, glutes: 0.5, calves: 0.6 },
  calfRaises: { calves: 1 },
};

export const BARBELL_LIFTS = [
  ['squat', 'Squat'],
  ['bench', 'Bench press'],
  ['deadlift', 'Deadlift'],
  ['press', 'Overhead press'],
  ['row', 'Barbell row'],
  ['curl', 'Barbell curl'],
];

// Collect each exercise's 0-4 rating from the fitness data (null if absent).
export function exerciseRatings(fitness, age, sex, bodyweightKg) {
  const f = fitness || {};
  const r = {};
  if (f.pushups !== null && f.pushups !== undefined) r.pushups = ratePushups(f.pushups, age, sex);
  if (f.pullups !== null && f.pullups !== undefined) r.pullups = ratePullups(f.pullups, age, sex);
  if (f.plankSec) r.plank = ratePlank(f.plankSec);
  if (f.verticalJumpCm) r.verticalJump = rateVerticalJump(f.verticalJumpCm, age, sex);
  if (f.calfRaises) r.calfRaises = rateCalfRaises(f.calfRaises);
  if (bodyweightKg) {
    for (const [lift] of BARBELL_LIFTS) {
      const w = f[`${lift}Kg`];
      if (!w) continue;
      const orm = oneRepMax(w, f[`${lift}Reps`] || 1);
      r[lift] = rateLift(lift, orm, bodyweightKg, sex);
    }
  }
  return r;
}

// Per-muscle 0-100 score (weighted mean of contributing exercise ratings),
// or null when no relevant exercise has data.
export function muscleScores(ratings) {
  const out = {};
  for (const m of Object.keys(MUSCLES)) {
    let num = 0, den = 0;
    for (const [ex, muscles] of Object.entries(EXERCISE_MUSCLES)) {
      const w = muscles[m];
      if (!w || ratings[ex] === undefined) continue;
      num += ratings[ex] * 25 * w;
      den += w;
    }
    out[m] = den > 0 ? Math.round(num / den) : null;
  }
  return out;
}

export function muscleColor(score) {
  if (score === null || score === undefined) return '#d5d9df';
  if (score < 30) return '#dc2626';
  if (score < 55) return '#d97706';
  if (score < 75) return '#84cc16';
  return '#16a34a';
}
