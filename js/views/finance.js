import { el, card, numberField, selectField, saveBar, statCard } from '../ui.js';
import { getProfile, update } from '../store.js';
import { CURRENCIES, getCurrency, setCurrency, money } from '../currency.js';
import {
  financeMetrics, rateSavingsRate, rateEmergencyFund, rateDebtToIncome,
  expectedNetWorth, RATING_LABELS, ratingClass,
} from '../data/benchmarks.js';

export function renderFinance(rerender) {
  const profile = getProfile();
  const draft = {
    monthlyIncome: null, monthlyExpenses: null, liquidSavings: null,
    nonMortgageDebt: null, netWorth: null,
    ...(profile.finance || {}),
  };

  const container = el('div', {},
    el('h2', {}, 'Finances'),
    el('p', { class: 'view-intro' },
      'Standard personal-finance health metrics: savings rate, emergency-fund coverage, debt load, and net worth versus an age-and-income expectation. Amounts are never converted — pick your currency once and it is used everywhere money appears.'),
    card('Currency',
      selectField({
        label: 'Display currency',
        value: getCurrency().code,
        options: CURRENCIES.map((c) => ({ value: c.code, label: c.label })),
        onChange: (v) => { setCurrency(v); rerender(); },
      })));

  if (profile.finance) {
    const m = financeMetrics(profile.finance);
    const stats = [];
    if (m.savingsRate !== null) {
      const r = rateSavingsRate(m.savingsRate);
      stats.push(statCard({ label: 'Savings rate', value: `${m.savingsRate.toFixed(0)}%`, sub: RATING_LABELS[r], tone: ratingClass(r) }));
    }
    if (m.emergencyMonths !== null) {
      const r = rateEmergencyFund(m.emergencyMonths);
      stats.push(statCard({ label: 'Emergency fund', value: `${m.emergencyMonths.toFixed(1)} mo`, sub: `of expenses — ${RATING_LABELS[r]}`, tone: ratingClass(r) }));
    }
    if (m.debtToIncome !== null) {
      const r = rateDebtToIncome(m.debtToIncome);
      stats.push(statCard({ label: 'Debt / annual income', value: m.debtToIncome.toFixed(2), sub: RATING_LABELS[r], tone: ratingClass(r) }));
    }
    if (profile.finance.netWorth !== null && profile.finance.netWorth !== undefined && m.annualIncome > 0 && profile.basics?.age) {
      const expected = expectedNetWorth(profile.basics.age, m.annualIncome);
      const ratio = expected > 0 ? profile.finance.netWorth / expected : null;
      stats.push(statCard({
        label: 'Net worth vs expected',
        value: ratio !== null ? `${(ratio * 100).toFixed(0)}%` : '—',
        sub: `expected ≈ ${money(expected)} (age × income ÷ 10)`,
        tone: ratio === null ? '' : ratio >= 1 ? 'good' : ratio >= 0.5 ? 'ok' : 'bad',
      }));
    }
    if (stats.length) container.append(card('Your results', el('div', { class: 'stat-grid' }, stats)));
  }

  container.append(card('Inputs',
    numberField({ label: 'Monthly take-home income', min: 0, value: draft.monthlyIncome, onInput: (v) => (draft.monthlyIncome = v) }),
    numberField({ label: 'Monthly expenses', sub: 'Everything: rent, food, transport, subscriptions.', min: 0, value: draft.monthlyExpenses, onInput: (v) => (draft.monthlyExpenses = v) }),
    numberField({ label: 'Liquid savings', sub: 'Cash you could access within days (checking, savings, money market).', min: 0, value: draft.liquidSavings, onInput: (v) => (draft.liquidSavings = v) }),
    numberField({ label: 'Non-mortgage debt', sub: 'Credit cards, personal loans, car loans, student loans.', min: 0, value: draft.nonMortgageDebt, onInput: (v) => (draft.nonMortgageDebt = v) }),
    numberField({ label: 'Total net worth', sub: 'All assets (incl. investments, property equity) minus all debts. Can be negative.', value: draft.netWorth, onInput: (v) => (draft.netWorth = v) }),
    saveBar(() => { update('finance', { ...draft }); rerender(); })));

  return container;
}
