import { el, card, numberField, selectField, saveBar, statCard } from '../ui.js';
import { getProfile, update } from '../store.js';
import { CURRENCIES, getCurrency, setCurrency, money } from '../currency.js';
import { COUNTRIES, fetchGdpPerCapita, fetchUsdRate, incomeVsCountry } from '../countrydata.js';
import { breakdownRadar } from '../radar.js';
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
    card('Currency & country',
      selectField({
        label: 'Display currency',
        value: getCurrency().code,
        options: CURRENCIES.map((c) => ({ value: c.code, label: c.label })),
        onChange: (v) => { setCurrency(v); rerender(); },
      }),
      selectField({
        label: 'Country',
        sub: 'Used to compare your income against live national economic data (World Bank).',
        value: profile.settings?.country ?? '',
        options: [{ value: '', label: '— select —' }, ...COUNTRIES.map(([name, iso3]) => ({ value: iso3, label: name }))],
        onChange: (v) => {
          update('settings', { ...(profile.settings || {}), country: v || null, countryStats: null });
          rerender();
        },
      })));

  // Country comparison (live World Bank data, cached after first fetch)
  const country = profile.settings?.country;
  if (country && profile.finance?.monthlyIncome) {
    const cached = profile.settings?.countryStats;
    const compareCard = card('Your income vs your country', el('p', { class: 'empty-note' }, 'Loading live data…'));
    container.append(compareCard);
    const renderComparison = (stats) => {
      const annualLocal = profile.finance.monthlyIncome * 12;
      const annualUsd = annualLocal * stats.usdRate;
      const ratio = annualUsd / stats.gdpPcPpp;
      const band = incomeVsCountry(ratio);
      compareCard.replaceChildren(
        el('h3', {}, 'Your income vs your country'),
        el('div', { class: 'stat-grid' },
          statCard({
            label: 'Your income vs national avg', value: `${ratio.toFixed(1)}×`,
            sub: band.label, tone: band.tone,
          }),
          statCard({
            label: `${stats.countryName} GDP per capita`,
            value: `$${Math.round(stats.gdpPcPpp).toLocaleString()}`,
            sub: `PPP int'l $, ${stats.year} (World Bank)`,
          }),
          statCard({
            label: 'Your annual income', value: `≈ $${Math.round(annualUsd).toLocaleString()}`,
            sub: 'converted at current exchange rates',
          })),
        el('p', { class: 'hint' },
          'GDP per capita is average output per person, not average salary — most people earn somewhat less than it, so matching it puts you above the typical earner. Market exchange rates are a rough proxy for purchasing-power dollars. Live data from the World Bank API and ECB reference rates; only your country and currency codes are sent, never your data.'));
    };
    if (cached && cached.iso3 === country && cached.currency === getCurrency().code) {
      renderComparison(cached);
    } else {
      Promise.all([fetchGdpPerCapita(country), fetchUsdRate(getCurrency().code)])
        .then(([gdp, usdRate]) => {
          const stats = {
            iso3: country, currency: getCurrency().code,
            gdpPcPpp: gdp.gdpPcPpp, year: gdp.year, countryName: gdp.country, usdRate,
            fetchedAt: new Date().toISOString(),
          };
          update('settings', { ...(getProfile().settings || {}), countryStats: stats });
          renderComparison(stats);
        })
        .catch(() => {
          compareCard.replaceChildren(
            el('h3', {}, 'Your income vs your country'),
            el('p', { class: 'empty-note' },
              'Could not fetch live country data right now (your currency may not have an ECB exchange rate, or the API is unreachable). Your profile is unaffected — try again later.'));
        });
    }
  }

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

    const expected = profile.basics?.age && m.annualIncome > 0
      ? expectedNetWorth(profile.basics.age, m.annualIncome) : null;
    const nwScore = expected && profile.finance.netWorth !== null && profile.finance.netWorth !== undefined
      ? Math.max(0, Math.min(100, (profile.finance.netWorth / Math.max(1, expected)) * 50)) : null;
    const radar = breakdownRadar([
      { label: 'Savings rate', value: m.savingsRate !== null ? rateSavingsRate(m.savingsRate) * 25 : null },
      { label: 'Emergency fund', value: m.emergencyMonths !== null ? rateEmergencyFund(m.emergencyMonths) * 25 : null },
      { label: 'Low debt', value: m.debtToIncome !== null ? rateDebtToIncome(m.debtToIncome) * 25 : null },
      { label: 'Net worth', value: nwScore },
    ]);
    if (radar) {
      container.append(card('Finance breakdown', radar,
        el('p', { class: 'hint' }, 'The sub-dimensions behind your finances score.')));
    }
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
