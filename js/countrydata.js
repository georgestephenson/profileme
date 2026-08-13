// Country economic comparison using live public data:
// - World Bank API: GDP per capita, PPP (current international $) — indicator
//   NY.GDP.PCAP.PP.CD, most recent available year.
// - Frankfurter (ECB reference rates) to convert the user's income currency
//   to USD as a rough proxy for international dollars.
// Both are free, keyless, CORS-enabled APIs. Only the country code and
// currency code are sent — never any profile data.

export const COUNTRIES = [
  ['United States', 'USA'], ['United Kingdom', 'GBR'], ['Germany', 'DEU'],
  ['France', 'FRA'], ['Spain', 'ESP'], ['Italy', 'ITA'], ['Netherlands', 'NLD'],
  ['Ireland', 'IRL'], ['Sweden', 'SWE'], ['Norway', 'NOR'], ['Denmark', 'DNK'],
  ['Finland', 'FIN'], ['Poland', 'POL'], ['Portugal', 'PRT'], ['Greece', 'GRC'],
  ['Switzerland', 'CHE'], ['Austria', 'AUT'], ['Belgium', 'BEL'],
  ['Czechia', 'CZE'], ['Ukraine', 'UKR'], ['Turkey', 'TUR'],
  ['Canada', 'CAN'], ['Mexico', 'MEX'], ['Brazil', 'BRA'], ['Argentina', 'ARG'],
  ['Colombia', 'COL'], ['Chile', 'CHL'], ['Peru', 'PER'],
  ['Australia', 'AUS'], ['New Zealand', 'NZL'],
  ['Japan', 'JPN'], ['South Korea', 'KOR'], ['China', 'CHN'], ['India', 'IND'],
  ['Indonesia', 'IDN'], ['Philippines', 'PHL'], ['Vietnam', 'VNM'],
  ['Thailand', 'THA'], ['Malaysia', 'MYS'], ['Singapore', 'SGP'],
  ['Pakistan', 'PAK'], ['Bangladesh', 'BGD'],
  ['Nigeria', 'NGA'], ['Kenya', 'KEN'], ['Ghana', 'GHA'],
  ['South Africa', 'ZAF'], ['Egypt', 'EGY'], ['Morocco', 'MAR'],
  ['Saudi Arabia', 'SAU'], ['United Arab Emirates', 'ARE'], ['Israel', 'ISR'],
];

export async function fetchGdpPerCapita(iso3) {
  const url = `https://api.worldbank.org/v2/country/${iso3}/indicator/NY.GDP.PCAP.PP.CD?format=json&per_page=10`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('World Bank request failed');
  const data = await res.json();
  const row = (data[1] || []).find((r) => r.value !== null);
  if (!row) throw new Error('No GDP data for this country');
  return { gdpPcPpp: row.value, year: row.date, country: row.country?.value };
}

export async function fetchUsdRate(currencyCode) {
  if (currencyCode === 'USD') return 1;
  const res = await fetch(`https://api.frankfurter.app/latest?from=${currencyCode}&to=USD`);
  if (!res.ok) throw new Error('FX request failed');
  const data = await res.json();
  const rate = data?.rates?.USD;
  if (!rate) throw new Error('No FX rate available');
  return rate;
}

// Rough band for annual income vs the national average output per person.
export function incomeVsCountry(ratio) {
  if (ratio >= 2) return { label: 'far above the national average', tone: 'good' };
  if (ratio >= 1.2) return { label: 'above the national average', tone: 'good' };
  if (ratio >= 0.8) return { label: 'around the national average', tone: 'ok' };
  if (ratio >= 0.5) return { label: 'below the national average', tone: 'ok' };
  return { label: 'well below the national average', tone: 'bad' };
}
