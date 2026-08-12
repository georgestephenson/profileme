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
