// Benchmark tables and rating helpers. These are population approximations from
// commonly published sources (Cooper Institute-style VO2max categories, ACSM-style
// push-up norms, community strength standards, standard personal-finance rules of
// thumb). Ratings: 0 = very poor ... 4 = excellent.

export const RATING_LABELS = ['Very poor', 'Poor', 'Fair', 'Good', 'Excellent'];

export function ratingClass(r) {
  return r >= 3 ? 'good' : r >= 2 ? 'ok' : 'bad';
}

function bandRating(value, bands) {
  // bands: ascending thresholds [t1, t2, t3, t4] -> rating 0..4
  let r = 0;
  for (const t of bands) if (value >= t) r++;
  return r;
}

// ---------- Cardio ----------

// Cooper (1968): VO2max (mL/kg/min) ≈ (distance in meters - 504.9) / 44.73
export function vo2maxFromCooper(meters) {
  return (meters - 504.9) / 44.73;
}

export function rateVo2max(vo2, age, sex) {
  const decades = Math.max(0, (age - 25) / 10);
  const base = sex === 'female'
    ? [24, 29, 33, 38, 44]
    : [28, 33, 38, 44, 51];
  const decline = sex === 'female' ? 3.5 : 4;
  const bands = base.slice(1).map((t) => t - decline * decades);
  return bandRating(vo2, bands);
}

export function rateRestingHr(hr) {
  // Lower is better: <60 excellent, 60-69 good, 70-79 fair, 80-89 poor, 90+ very poor
  if (hr < 60) return 4;
  if (hr < 70) return 3;
  if (hr < 80) return 2;
  if (hr < 90) return 1;
  return 0;
}

// ---------- Strength ----------

export function ratePushups(count, age, sex) {
  const decades = Math.max(0, (age - 25) / 10);
  const base = sex === 'female' ? [6, 10, 15, 21, 30] : [11, 17, 22, 29, 36];
  const decline = sex === 'female' ? 2.5 : 3;
  const bands = base.slice(1).map((t) => Math.max(1, t - decline * decades));
  return bandRating(count, bands);
}

export function ratePlank(seconds) {
  return bandRating(seconds, [15, 30, 60, 120]);
}

// Lift ratings by bodyweight multiple (community strength standards, roughly
// untrained -> novice -> intermediate -> advanced boundaries).
const LIFT_STANDARDS = {
  male:   { squat: [0.75, 1.0, 1.25, 1.75], bench: [0.6, 0.8, 1.0, 1.5], deadlift: [1.0, 1.25, 1.5, 2.25] },
  female: { squat: [0.5, 0.75, 1.0, 1.5],   bench: [0.35, 0.5, 0.7, 1.0], deadlift: [0.7, 1.0, 1.2, 1.75] },
};

export function rateLift(lift, weightKg, bodyweightKg, sex) {
  const table = LIFT_STANDARDS[sex === 'female' ? 'female' : 'male'][lift];
  return bandRating(weightKg / bodyweightKg, table);
}

// ---------- Finance ----------

export function financeMetrics(f) {
  const income = f.monthlyIncome || 0;
  const expenses = f.monthlyExpenses || 0;
  const annualIncome = income * 12;
  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : null;
  const emergencyMonths = expenses > 0 ? (f.liquidSavings || 0) / expenses : null;
  const debtToIncome = annualIncome > 0 ? (f.nonMortgageDebt || 0) / annualIncome : null;
  return { savingsRate, emergencyMonths, debtToIncome, annualIncome };
}

export function rateSavingsRate(pct) {
  if (pct === null) return null;
  if (pct >= 30) return 4;
  if (pct >= 20) return 3;
  if (pct >= 10) return 2;
  if (pct >= 0) return 1;
  return 0;
}

export function rateEmergencyFund(months) {
  if (months === null) return null;
  return bandRating(months, [1, 3, 6, 12]);
}

export function rateDebtToIncome(ratio) {
  if (ratio === null) return null;
  // Lower is better (non-mortgage debt vs annual income)
  if (ratio <= 0.05) return 4;
  if (ratio <= 0.2) return 3;
  if (ratio <= 0.5) return 2;
  if (ratio <= 1.0) return 1;
  return 0;
}

// "Expected" net worth heuristic (Stanley & Danko): age × annual income / 10.
export function expectedNetWorth(age, annualIncome) {
  return (age * annualIncome) / 10;
}

// ---------- Cognition ----------

export function rateDigitSpan(span) {
  // Adult forward digit span averages ~7 ± 2 (Miller, 1956)
  if (span >= 9) return 4;
  if (span >= 8) return 3;
  if (span >= 6) return 2;
  if (span >= 5) return 1;
  return 0;
}

export function rateReactionTime(ms) {
  // Median adult simple visual reaction time is roughly 250-300 ms
  if (ms < 220) return 4;
  if (ms < 270) return 3;
  if (ms < 320) return 2;
  if (ms < 380) return 1;
  return 0;
}

// ---------- Languages ----------

export const CEFR_LEVELS = [
  { value: 'A1', label: 'A1 — Beginner', points: 1 },
  { value: 'A2', label: 'A2 — Elementary', points: 2 },
  { value: 'B1', label: 'B1 — Intermediate', points: 3 },
  { value: 'B2', label: 'B2 — Upper intermediate', points: 4 },
  { value: 'C1', label: 'C1 — Advanced', points: 5 },
  { value: 'C2', label: 'C2 — Mastery', points: 6 },
  { value: 'native', label: 'Native', points: 7 },
];

export function cefrPoints(level) {
  const found = CEFR_LEVELS.find((l) => l.value === level);
  return found ? found.points : 0;
}

// ---------- Relationships ----------

// UCLA 3-item loneliness scale (Hughes et al., 2004): each item 1-3, total 3-9.
// Totals of 6+ are conventionally classed as "lonely".
export const UCLA3_ITEMS = [
  'How often do you feel that you lack companionship?',
  'How often do you feel left out?',
  'How often do you feel isolated from others?',
];

export const UCLA3_OPTIONS = [
  { value: 1, label: 'Hardly ever' },
  { value: 2, label: 'Some of the time' },
  { value: 3, label: 'Often' },
];
