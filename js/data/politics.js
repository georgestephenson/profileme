// Political orientation: two-axis model (economic left-right, social
// libertarian-authoritarian), the structure used across decades of political
// psychology research. Items are original, written to balance both poles.
// Like personality, this is a PROFILE, not a grade: it never enters the
// composite score, and no position is treated as "better".

export const POLITICS_AXES = {
  econ: { negLabel: 'Economic left', posLabel: 'Economic right' },
  social: { negLabel: 'Libertarian', posLabel: 'Authoritarian' },
};

// keyed: +1 means agreement pushes toward posLabel, -1 toward negLabel.
export const POLITICS_ITEMS = [
  { id: 'e1', axis: 'econ', keyed: 1, text: 'The freer the market, the freer the people.' },
  { id: 'e2', axis: 'econ', keyed: -1, text: 'Essential services like water and railways are better run publicly than by private companies.' },
  { id: 'e3', axis: 'econ', keyed: -1, text: 'Taxes on the wealthiest should be significantly higher than they are.' },
  { id: 'e4', axis: 'econ', keyed: 1, text: 'Government regulation of business usually does more harm than good.' },
  { id: 'e5', axis: 'econ', keyed: -1, text: 'A strong welfare safety net makes society better, even if taxes must rise to pay for it.' },
  { id: 'e6', axis: 'econ', keyed: 1, text: 'Private enterprise, not government programs, is the best route out of poverty.' },
  { id: 'e7', axis: 'econ', keyed: 1, text: 'Large differences in wealth are an acceptable feature of a healthy economy.' },
  { id: 'e8', axis: 'econ', keyed: -1, text: 'Workers would be better off with stronger unions.' },
  { id: 's1', axis: 'social', keyed: 1, text: 'Some restrictions on free expression are necessary to protect social harmony.' },
  { id: 's2', axis: 'social', keyed: -1, text: 'The government should not interfere in what consenting adults do in private.' },
  { id: 's3', axis: 'social', keyed: 1, text: 'Obedience and respect for authority are among the most important values children should learn.' },
  { id: 's4', axis: 'social', keyed: -1, text: 'People should be free to make risky personal choices if they harm no one else.' },
  { id: 's5', axis: 'social', keyed: 1, text: 'A strong leader who bends the rules is sometimes what a country needs.' },
  { id: 's6', axis: 'social', keyed: 1, text: 'Broad surveillance of citizens is an acceptable price for public safety.' },
  { id: 's7', axis: 'social', keyed: 1, text: 'Traditional values should carry more weight than individual lifestyles.' },
  { id: 's8', axis: 'social', keyed: -1, text: 'Civil liberties matter more than national security.' },
];

export const POLITICS_SCALE = [
  { value: -2, label: 'Strongly disagree' },
  { value: -1, label: 'Disagree' },
  { value: 0, label: 'Neutral' },
  { value: 1, label: 'Agree' },
  { value: 2, label: 'Strongly agree' },
];

// answers: {itemId: -2..2} -> { econ: -100..100, social: -100..100 }
export function scorePolitics(answers) {
  const sums = { econ: 0, social: 0 };
  const counts = { econ: 0, social: 0 };
  for (const item of POLITICS_ITEMS) {
    const a = answers[item.id];
    if (a === undefined || a === null) return null;
    sums[item.axis] += a * item.keyed;
    counts[item.axis]++;
  }
  return {
    econ: Math.round((sums.econ / (counts.econ * 2)) * 100),
    social: Math.round((sums.social / (counts.social * 2)) * 100),
  };
}

export function politicsLabel(scores) {
  const e = scores.econ, s = scores.social;
  const band = (v, neg, pos) => (Math.abs(v) < 20 ? 'center' : v < 0 ? neg : pos);
  const eb = band(e, 'left', 'right');
  const sb = band(s, 'libertarian', 'authoritarian');
  if (eb === 'center' && sb === 'center') return 'Centrist';
  if (eb === 'center') return sb === 'libertarian' ? 'Libertarian centrist' : 'Authoritarian centrist';
  if (sb === 'center') return eb === 'left' ? 'Center-left' : 'Center-right';
  return `${sb === 'libertarian' ? 'Libertarian' : 'Authoritarian'} ${eb}`;
}
