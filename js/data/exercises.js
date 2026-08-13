// Exercise catalog: barbell, dumbbell, smith machine, and calisthenics
// movements. Weight exercises are rated by estimated 1RM relative to
// bodyweight (Epley from any weight × reps set; dumbbell standards are per
// dumbbell); rep exercises are rated by max reps. bands = ascending
// thresholds -> rating 0-4, [male, female].

export const EXERCISE_CATALOG = [
  // --- Barbell ---
  { id: 'bb-squat', name: 'Squat', equipment: 'barbell', type: 'weight', bands: { male: [0.75, 1.0, 1.25, 1.75], female: [0.5, 0.75, 1.0, 1.5] }, muscles: { quads: 1, glutes: 0.8, lowerBack: 0.3, core: 0.3 } },
  { id: 'bb-frontsquat', name: 'Front squat', equipment: 'barbell', type: 'weight', bands: { male: [0.6, 0.85, 1.05, 1.5], female: [0.4, 0.6, 0.85, 1.25] }, muscles: { quads: 1, glutes: 0.6, core: 0.5 } },
  { id: 'bb-bench', name: 'Bench press', equipment: 'barbell', type: 'weight', bands: { male: [0.6, 0.8, 1.0, 1.5], female: [0.35, 0.5, 0.7, 1.0] }, muscles: { chest: 1, triceps: 0.6, shoulders: 0.4 } },
  { id: 'bb-incline', name: 'Incline bench press', equipment: 'barbell', type: 'weight', bands: { male: [0.5, 0.7, 0.85, 1.25], female: [0.3, 0.45, 0.6, 0.85] }, muscles: { chest: 0.9, shoulders: 0.6, triceps: 0.5 } },
  { id: 'bb-deadlift', name: 'Deadlift', equipment: 'barbell', type: 'weight', bands: { male: [1.0, 1.25, 1.5, 2.25], female: [0.7, 1.0, 1.2, 1.75] }, muscles: { hamstrings: 0.9, glutes: 0.8, lowerBack: 1, forearms: 0.5, upperBack: 0.4 } },
  { id: 'bb-rdl', name: 'Romanian deadlift', equipment: 'barbell', type: 'weight', bands: { male: [0.8, 1.05, 1.3, 1.9], female: [0.55, 0.8, 1.0, 1.5] }, muscles: { hamstrings: 1, glutes: 0.7, lowerBack: 0.7 } },
  { id: 'bb-press', name: 'Overhead press', equipment: 'barbell', type: 'weight', bands: { male: [0.35, 0.5, 0.65, 0.9], female: [0.25, 0.35, 0.45, 0.65] }, muscles: { shoulders: 1, triceps: 0.6 } },
  { id: 'bb-row', name: 'Barbell row', equipment: 'barbell', type: 'weight', bands: { male: [0.5, 0.7, 0.9, 1.2], female: [0.35, 0.5, 0.65, 0.9] }, muscles: { upperBack: 1, biceps: 0.5, forearms: 0.4 } },
  { id: 'bb-curl', name: 'Barbell curl', equipment: 'barbell', type: 'weight', bands: { male: [0.2, 0.3, 0.4, 0.55], female: [0.12, 0.2, 0.28, 0.4] }, muscles: { biceps: 1, forearms: 0.4 } },
  { id: 'bb-hipthrust', name: 'Hip thrust', equipment: 'barbell', type: 'weight', bands: { male: [0.8, 1.1, 1.5, 2.2], female: [0.7, 1.0, 1.4, 2.0] }, muscles: { glutes: 1, hamstrings: 0.5 } },
  // --- Dumbbell (weight = one dumbbell) ---
  { id: 'db-bench', name: 'Dumbbell bench press', equipment: 'dumbbell', type: 'weight', bands: { male: [0.22, 0.32, 0.42, 0.6], female: [0.12, 0.2, 0.28, 0.42] }, muscles: { chest: 1, triceps: 0.5, shoulders: 0.4 } },
  { id: 'db-press', name: 'Dumbbell shoulder press', equipment: 'dumbbell', type: 'weight', bands: { male: [0.15, 0.22, 0.3, 0.45], female: [0.1, 0.15, 0.22, 0.32] }, muscles: { shoulders: 1, triceps: 0.5 } },
  { id: 'db-row', name: 'Dumbbell row', equipment: 'dumbbell', type: 'weight', bands: { male: [0.25, 0.35, 0.5, 0.7], female: [0.15, 0.25, 0.35, 0.5] }, muscles: { upperBack: 1, biceps: 0.5, forearms: 0.4 } },
  { id: 'db-curl', name: 'Dumbbell curl', equipment: 'dumbbell', type: 'weight', bands: { male: [0.1, 0.15, 0.2, 0.3], female: [0.06, 0.1, 0.14, 0.2] }, muscles: { biceps: 1, forearms: 0.4 } },
  { id: 'db-goblet', name: 'Goblet squat', equipment: 'dumbbell', type: 'weight', bands: { male: [0.3, 0.45, 0.6, 0.85], female: [0.2, 0.3, 0.45, 0.65] }, muscles: { quads: 1, glutes: 0.6, core: 0.4 } },
  { id: 'db-lunge', name: 'Dumbbell lunge', equipment: 'dumbbell', type: 'weight', bands: { male: [0.2, 0.3, 0.4, 0.6], female: [0.12, 0.2, 0.3, 0.45] }, muscles: { quads: 0.9, glutes: 0.8, hamstrings: 0.4 } },
  { id: 'db-latraise', name: 'Lateral raise', equipment: 'dumbbell', type: 'weight', bands: { male: [0.06, 0.1, 0.14, 0.2], female: [0.04, 0.06, 0.1, 0.14] }, muscles: { shoulders: 1 } },
  // --- Smith machine (bar weight varies by machine; rated ~ barbell) ---
  { id: 'sm-squat', name: 'Smith machine squat', equipment: 'smith', type: 'weight', bands: { male: [0.8, 1.05, 1.3, 1.8], female: [0.55, 0.8, 1.05, 1.55] }, muscles: { quads: 1, glutes: 0.7 } },
  { id: 'sm-bench', name: 'Smith machine bench press', equipment: 'smith', type: 'weight', bands: { male: [0.65, 0.85, 1.05, 1.55], female: [0.4, 0.55, 0.75, 1.05] }, muscles: { chest: 1, triceps: 0.5, shoulders: 0.4 } },
  { id: 'sm-press', name: 'Smith machine shoulder press', equipment: 'smith', type: 'weight', bands: { male: [0.4, 0.55, 0.7, 0.95], female: [0.28, 0.4, 0.5, 0.7] }, muscles: { shoulders: 1, triceps: 0.5 } },
  // --- Calisthenics (max reps in one set) ---
  { id: 'cal-pushup', name: 'Push-ups', equipment: 'calisthenics', type: 'reps', bands: { male: [11, 17, 22, 36], female: [4, 8, 15, 30] }, muscles: { chest: 0.7, triceps: 0.5, shoulders: 0.4, core: 0.3 } },
  { id: 'cal-pullup', name: 'Pull-ups', equipment: 'calisthenics', type: 'reps', bands: { male: [3, 6, 10, 15], female: [1, 2, 5, 10] }, muscles: { upperBack: 0.9, biceps: 0.8, forearms: 0.6 } },
  { id: 'cal-chinup', name: 'Chin-ups', equipment: 'calisthenics', type: 'reps', bands: { male: [4, 7, 11, 16], female: [1, 3, 6, 11] }, muscles: { biceps: 0.9, upperBack: 0.8, forearms: 0.5 } },
  { id: 'cal-dip', name: 'Dips', equipment: 'calisthenics', type: 'reps', bands: { male: [3, 8, 15, 25], female: [1, 3, 8, 15] }, muscles: { triceps: 0.9, chest: 0.7, shoulders: 0.4 } },
  { id: 'cal-bwsquat', name: 'Bodyweight squats', equipment: 'calisthenics', type: 'reps', bands: { male: [15, 25, 40, 60], female: [12, 20, 35, 55] }, muscles: { quads: 0.8, glutes: 0.5 } },
  { id: 'cal-pistol', name: 'Pistol squats (per leg)', equipment: 'calisthenics', type: 'reps', bands: { male: [1, 3, 6, 12], female: [1, 2, 5, 10] }, muscles: { quads: 1, glutes: 0.7, core: 0.4 } },
  { id: 'cal-calfraise', name: 'Single-leg calf raises', equipment: 'calisthenics', type: 'reps', bands: { male: [5, 12, 20, 30], female: [5, 12, 20, 30] }, muscles: { calves: 1 } },
  { id: 'cal-invrow', name: 'Inverted rows', equipment: 'calisthenics', type: 'reps', bands: { male: [5, 10, 18, 28], female: [3, 6, 12, 20] }, muscles: { upperBack: 0.9, biceps: 0.6 } },
  { id: 'cal-legraise', name: 'Hanging leg raises', equipment: 'calisthenics', type: 'reps', bands: { male: [4, 8, 14, 22], female: [2, 5, 10, 18] }, muscles: { core: 1, forearms: 0.3 } },
];

export const EQUIPMENT_LABELS = { barbell: 'Barbell', dumbbell: 'Dumbbell', smith: 'Smith machine', calisthenics: 'Calisthenics' };

export function findExercise(id) {
  return EXERCISE_CATALOG.find((e) => e.id === id);
}

import { oneRepMax } from './benchmarks.js';

function bandRating(value, bands) {
  let r = 0;
  for (const t of bands) if (value >= t) r++;
  return r;
}

// entry: { id, weightKg?, reps } -> 0-4 rating, or null if unratable.
export function rateExercise(entry, sex, bodyweightKg) {
  const ex = findExercise(entry.id);
  if (!ex) return null;
  const bands = ex.bands[sex === 'female' ? 'female' : 'male'];
  if (ex.type === 'reps') {
    if (!entry.reps && entry.reps !== 0) return null;
    return bandRating(entry.reps, bands);
  }
  if (!entry.weightKg || !bodyweightKg) return null;
  const orm = oneRepMax(entry.weightKg, entry.reps || 1);
  return bandRating(orm / bodyweightKg, bands);
}

// Migrate the old fixed-field format to the exercise list, once.
export function migrateLegacyFitness(f) {
  if (!f || f.exercises) return f;
  const exercises = [];
  const liftMap = { squat: 'bb-squat', bench: 'bb-bench', deadlift: 'bb-deadlift', press: 'bb-press', row: 'bb-row', curl: 'bb-curl' };
  for (const [old, id] of Object.entries(liftMap)) {
    if (f[`${old}Kg`]) exercises.push({ id, weightKg: f[`${old}Kg`], reps: f[`${old}Reps`] || 1 });
  }
  if (f.pushups !== null && f.pushups !== undefined) exercises.push({ id: 'cal-pushup', reps: f.pushups });
  if (f.pullups !== null && f.pullups !== undefined) exercises.push({ id: 'cal-pullup', reps: f.pullups });
  if (f.calfRaises) exercises.push({ id: 'cal-calfraise', reps: f.calfRaises });
  return { ...f, exercises };
}
