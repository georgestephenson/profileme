// Muscle-group model: maps logged exercises' benchmark ratings (0-4) onto the
// muscle groups they train, weighted by involvement, producing per-muscle
// 0-100 scores for the body diagram.

import { ratePlank, rateVerticalJump } from './benchmarks.js';
import { findExercise, rateExercise } from './exercises.js';

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

// Contributions from the non-catalog field tests.
const FIELD_TESTS = {
  plank: { core: 1 },
  verticalJump: { quads: 0.6, glutes: 0.5, calves: 0.6 },
};

// -> [{ muscles: {m: weight}, rating: 0-4 }]
export function muscleContributions(fitness, age, sex, bodyweightKg) {
  const f = fitness || {};
  const out = [];
  for (const entry of f.exercises || []) {
    const ex = findExercise(entry.id);
    const rating = rateExercise(entry, sex, bodyweightKg);
    if (ex && rating !== null) out.push({ muscles: ex.muscles, rating });
  }
  if (f.plankSec) out.push({ muscles: FIELD_TESTS.plank, rating: ratePlank(f.plankSec) });
  if (f.verticalJumpCm) out.push({ muscles: FIELD_TESTS.verticalJump, rating: rateVerticalJump(f.verticalJumpCm, age, sex) });
  return out;
}

// Per-muscle 0-100 score (weighted mean of contributing ratings), null = no data.
export function muscleScores(contributions) {
  const out = {};
  for (const m of Object.keys(MUSCLES)) {
    let num = 0, den = 0;
    for (const c of contributions) {
      const w = c.muscles[m];
      if (!w) continue;
      num += c.rating * 25 * w;
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
