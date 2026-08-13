// Simple localStorage-backed profile store. All data stays on-device.
const KEY = 'profileme.v1';

const defaults = () => ({
  basics: null,        // { age, sex }
  personality: null,   // { answers: {itemId: 1..5}, completedAt }
  fitness: null,       // { pushups, plankSec, cooperMeters, restingHr, squatKg, benchKg, deadliftKg, bodyweightKg }
  finance: null,       // { monthlyIncome, monthlyExpenses, liquidSavings, nonMortgageDebt, netWorth }
  cognition: null,     // { digitSpan, reactionMs }
  career: null,        // { education, yearsExperience, satisfaction, learningHours, hasMentor, closeProfessionalContacts }
  languages: null,     // { list: [{ name, level }] }
  relationships: null, // { ucla: [1..3 x3], closeFriends, weeklyInteractions }
  goals: null,         // { selected: [goalKey] }
  grooming: null,      // { answers: {itemId: 1..5}, completedAt }
  wellbeing: null,     // { swls: [1..7 x5], sleepHours, completedAt }
  background: null,    // { childhoodLadder, currentLadder, parentEducation, firstGenUniversity }
  politics: null,      // { answers: {itemId: -2..2}, completedAt } — profile only, never scored
  settings: null,      // { currency, country }
});

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...defaults(), ...JSON.parse(raw) } : defaults();
  } catch {
    return defaults();
  }
}

function persist() {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function getProfile() {
  return state;
}

export function update(section, value) {
  state = { ...state, [section]: value };
  persist();
}

export function resetAll() {
  state = defaults();
  localStorage.removeItem(KEY);
}

export function exportJson() {
  return JSON.stringify(state, null, 2);
}

export function importJson(text) {
  const data = JSON.parse(text); // throws on invalid JSON
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new Error('Not a ProfileMe export');
  }
  state = { ...defaults(), ...data };
  persist();
}
