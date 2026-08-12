// Historical "profile twins" dataset — full-profile edition.
//
// Trait values (0-100) are COARSE ILLUSTRATIVE ESTIMATES adapted from
// published historiometric research where it exists:
// - US presidents: expert personality ratings from Rubenzer & Faschingbauer,
//   "Personality, Character, and Leadership in the White House" (2004).
// - Cognitive bands: Cox (1926), historiometric estimates for 301 geniuses.
// - Everything else (fitness, finances, languages, grooming, relationships,
//   career): biographical consensus — documented facts like "died in debt",
//   "spoke nine languages", "boxed daily", rendered as coarse 0-100 bands.
// Only deceased figures are included: no published estimates exist for living
// people, and inventing them would be fabrication.
//
// N = emotional stability (high = stable), matching the app's convention.
// Domains: fitness, finance, cognition, career, languages, relationships, grooming.

export const FIGURES = [
  {
    name: 'George Washington', era: '1732-1799', tag: 'The disciplined founder',
    traits: { E: 55, A: 50, C: 92, N: 72, O: 35 },
    domains: { fitness: 80, finance: 85, cognition: 65, career: 100, languages: 15, relationships: 70, grooming: 90 },
    note: 'Legendary self-control; a famously strong horseman, meticulous about dress and decorum.',
    basis: 'presidents',
  },
  {
    name: 'Abraham Lincoln', era: '1809-1865', tag: 'The melancholy visionary',
    traits: { E: 45, A: 72, C: 65, N: 28, O: 85 },
    domains: { fitness: 75, finance: 45, cognition: 85, career: 100, languages: 15, relationships: 65, grooming: 30 },
    note: 'A champion wrestler in youth and famously unkempt; deep empathy with lifelong melancholy.',
    basis: 'presidents',
  },
  {
    name: 'Thomas Jefferson', era: '1743-1826', tag: 'The polymath idealist',
    traits: { E: 40, A: 55, C: 75, N: 60, O: 95 },
    domains: { fitness: 60, finance: 35, cognition: 90, career: 95, languages: 90, relationships: 55, grooming: 70 },
    note: 'Read six languages and designed his own university — yet died deeply in debt.',
    basis: 'presidents-cox',
  },
  {
    name: 'Theodore Roosevelt', era: '1858-1919', tag: 'The human dynamo',
    traits: { E: 98, A: 40, C: 76, N: 70, O: 80 },
    domains: { fitness: 90, finance: 70, cognition: 80, career: 100, languages: 70, relationships: 75, grooming: 65 },
    note: 'Boxed in the White House, wrote 35 books, highest extraversion ever rated in the presidential study.',
    basis: 'presidents',
  },
  {
    name: 'Franklin D. Roosevelt', era: '1882-1945', tag: 'The buoyant operator',
    traits: { E: 85, A: 55, C: 70, N: 80, O: 70 },
    domains: { fitness: 35, finance: 85, cognition: 75, career: 100, languages: 55, relationships: 80, grooming: 80 },
    note: 'Unsinkable temperament through polio and depression-era crisis; a master of people.',
    basis: 'presidents',
  },
  {
    name: 'John F. Kennedy', era: '1917-1963', tag: 'The charismatic improviser',
    traits: { E: 90, A: 55, C: 32, N: 65, O: 76 },
    domains: { fitness: 45, finance: 90, cognition: 80, career: 95, languages: 40, relationships: 80, grooming: 90 },
    note: 'Immense charm over chronic hidden illness; famously low on rules and routine.',
    basis: 'presidents',
  },
  {
    name: 'Richard Nixon', era: '1913-1994', tag: 'The brilliant grudge-holder',
    traits: { E: 40, A: 15, C: 70, N: 22, O: 55 },
    domains: { fitness: 40, finance: 60, cognition: 80, career: 85, languages: 20, relationships: 25, grooming: 60 },
    note: 'Driven and able, undone by suspicion and hostility — the cautionary profile.',
    basis: 'presidents',
  },
  {
    name: 'Napoleon Bonaparte', era: '1769-1821', tag: 'The relentless strategist',
    traits: { E: 75, A: 25, C: 85, N: 55, O: 70 },
    domains: { fitness: 55, finance: 75, cognition: 90, career: 100, languages: 60, relationships: 45, grooming: 55 },
    note: 'Reorganized Europe on four hours of sleep; low agreeableness at continental scale.',
    basis: 'bio-cox',
  },
  {
    name: 'Isaac Newton', era: '1643-1727', tag: 'The obsessive genius',
    traits: { E: 15, A: 20, C: 85, N: 30, O: 92 },
    domains: { fitness: 25, finance: 80, cognition: 100, career: 100, languages: 70, relationships: 15, grooming: 30 },
    note: 'Among the highest estimates in Cox (1926); solitary, prickly, forgot to eat while working.',
    basis: 'bio-cox',
  },
  {
    name: 'Marie Curie', era: '1867-1934', tag: 'The unbreakable researcher',
    traits: { E: 25, A: 55, C: 95, N: 55, O: 90 },
    domains: { fitness: 45, finance: 40, cognition: 95, career: 100, languages: 85, relationships: 55, grooming: 40 },
    note: 'Two Nobel Prizes in two sciences, five languages, indifferent to money and dress alike.',
    basis: 'bio',
  },
  {
    name: 'Leonardo da Vinci', era: '1452-1519', tag: 'The boundless imaginer',
    traits: { E: 55, A: 60, C: 35, N: 60, O: 100 },
    domains: { fitness: 75, finance: 50, cognition: 100, career: 90, languages: 40, relationships: 60, grooming: 85 },
    note: 'Could reportedly bend horseshoes bare-handed; dressed beautifully; finished almost nothing.',
    basis: 'bio-cox',
  },
  {
    name: 'Charles Darwin', era: '1809-1882', tag: 'The patient observer',
    traits: { E: 30, A: 75, C: 82, N: 38, O: 90 },
    domains: { fitness: 35, finance: 90, cognition: 90, career: 95, languages: 45, relationships: 80, grooming: 55 },
    note: 'Twenty years of meticulous evidence; also a quietly brilliant investor and devoted family man.',
    basis: 'bio-cox',
  },
  {
    name: 'Benjamin Franklin', era: '1706-1790', tag: 'The pragmatic charmer',
    traits: { E: 80, A: 65, C: 70, N: 76, O: 90 },
    domains: { fitness: 70, finance: 90, cognition: 90, career: 100, languages: 75, relationships: 90, grooming: 60 },
    note: 'Retired rich at 42, swam daily, charmed two continents — the well-rounded high scorer.',
    basis: 'bio-cox',
  },
  {
    name: 'Wolfgang Amadeus Mozart', era: '1756-1791', tag: 'The playful prodigy',
    traits: { E: 75, A: 55, C: 50, N: 45, O: 92 },
    domains: { fitness: 40, finance: 20, cognition: 95, career: 90, languages: 75, relationships: 65, grooming: 75 },
    note: 'Effortless genius in four languages, loved fine clothes, permanently in debt.',
    basis: 'bio-cox',
  },
  {
    name: 'Florence Nightingale', era: '1820-1910', tag: 'The systematizing reformer',
    traits: { E: 40, A: 62, C: 95, N: 45, O: 75 },
    domains: { fitness: 40, finance: 70, cognition: 85, career: 95, languages: 80, relationships: 50, grooming: 70 },
    note: 'Invented modern nursing with statistics, iron discipline, and five languages.',
    basis: 'bio',
  },
  {
    name: 'Albert Einstein', era: '1879-1955', tag: 'The playful revolutionary',
    traits: { E: 40, A: 65, C: 45, N: 65, O: 98 },
    domains: { fitness: 45, finance: 60, cognition: 100, career: 100, languages: 55, relationships: 55, grooming: 15 },
    note: 'Rewrote physics; famously refused socks, combs, and conventions of every kind.',
    basis: 'bio',
  },
  {
    name: 'Nikola Tesla', era: '1856-1943', tag: 'The immaculate visionary',
    traits: { E: 35, A: 40, C: 75, N: 35, O: 95 },
    domains: { fitness: 50, finance: 25, cognition: 95, career: 85, languages: 90, relationships: 30, grooming: 95 },
    note: 'Spoke eight languages, dressed impeccably, walked miles daily — and died broke and alone.',
    basis: 'bio',
  },
  {
    name: 'Ada Lovelace', era: '1815-1852', tag: 'The poetical scientist',
    traits: { E: 45, A: 55, C: 60, N: 40, O: 95 },
    domains: { fitness: 40, finance: 45, cognition: 95, career: 80, languages: 60, relationships: 55, grooming: 70 },
    note: 'Saw the computer age a century early; undone somewhat by illness and gambling debts.',
    basis: 'bio',
  },
  {
    name: 'Muhammad Ali', era: '1942-2016', tag: 'The magnetic champion',
    traits: { E: 95, A: 55, C: 70, N: 75, O: 70 },
    domains: { fitness: 100, finance: 65, cognition: 65, career: 100, languages: 25, relationships: 80, grooming: 90 },
    note: 'The greatest — supreme physical mastery, verbal genius, and showmanship in one profile.',
    basis: 'bio',
  },
  {
    name: 'Bruce Lee', era: '1940-1973', tag: 'The philosopher athlete',
    traits: { E: 70, A: 50, C: 90, N: 65, O: 85 },
    domains: { fitness: 100, finance: 55, cognition: 80, career: 90, languages: 70, relationships: 70, grooming: 85 },
    note: 'Trained with scientific obsession, wrote philosophy, built a bridge between worlds.',
    basis: 'bio',
  },
  {
    name: 'Ernest Hemingway', era: '1899-1961', tag: 'The combative adventurer',
    traits: { E: 70, A: 35, C: 55, N: 25, O: 85 },
    domains: { fitness: 75, finance: 70, cognition: 80, career: 95, languages: 65, relationships: 45, grooming: 45 },
    note: 'Boxed, fished, fought, and wrote in three languages; four marriages and a dark undertow.',
    basis: 'bio',
  },
  {
    name: 'Jane Austen', era: '1775-1817', tag: 'The quiet observer',
    traits: { E: 40, A: 70, C: 80, N: 60, O: 90 },
    domains: { fitness: 50, finance: 35, cognition: 90, career: 85, languages: 45, relationships: 75, grooming: 60 },
    note: 'Immortal social intelligence from a writing desk in genteel poverty; a devoted long walker.',
    basis: 'bio',
  },
  {
    name: 'Frida Kahlo', era: '1907-1954', tag: 'The defiant self-creator',
    traits: { E: 65, A: 50, C: 55, N: 30, O: 95 },
    domains: { fitness: 25, finance: 45, cognition: 80, career: 85, languages: 70, relationships: 60, grooming: 95 },
    note: 'Turned chronic pain into iconic art and made self-presentation itself a masterpiece.',
    basis: 'bio',
  },
  {
    name: 'Winston Churchill', era: '1874-1965', tag: 'The indomitable orator',
    traits: { E: 75, A: 35, C: 60, N: 45, O: 85 },
    domains: { fitness: 30, finance: 40, cognition: 90, career: 100, languages: 35, relationships: 70, grooming: 70 },
    note: 'Nobel-winning prose and wartime nerve, funded by chronic debt, cigars, and champagne.',
    basis: 'bio',
  },
  {
    name: 'Marcus Aurelius', era: '121-180', tag: 'The philosopher king',
    traits: { E: 35, A: 70, C: 90, N: 85, O: 85 },
    domains: { fitness: 55, finance: 90, cognition: 85, career: 100, languages: 85, relationships: 65, grooming: 50 },
    note: 'Ruled an empire while writing private notes on humility — the emotional-stability benchmark.',
    basis: 'bio',
  },
  {
    name: 'Cleopatra', era: '69-30 BC', tag: 'The polyglot sovereign',
    traits: { E: 75, A: 45, C: 75, N: 65, O: 85 },
    domains: { fitness: 55, finance: 100, cognition: 85, career: 95, languages: 100, relationships: 70, grooming: 100 },
    note: 'Plutarch credits her with nine languages; wealth, statecraft, and presentation as power.',
    basis: 'bio',
  },
  {
    name: 'Andrew Carnegie', era: '1835-1919', tag: 'The self-made systematizer',
    traits: { E: 70, A: 55, C: 85, N: 70, O: 75 },
    domains: { fitness: 55, finance: 100, cognition: 80, career: 100, languages: 25, relationships: 70, grooming: 70 },
    note: 'Bobbin boy to richest man alive — then gave it away building 2,500 libraries.',
    basis: 'bio',
  },
  {
    name: 'Richard Francis Burton', era: '1821-1890', tag: 'The insatiable explorer',
    traits: { E: 60, A: 30, C: 65, N: 70, O: 98 },
    domains: { fitness: 85, finance: 40, cognition: 90, career: 85, languages: 100, relationships: 45, grooming: 60 },
    note: 'Spoke some 29 languages, master swordsman, went everywhere he was told not to.',
    basis: 'bio',
  },
  {
    name: 'Beau Brummell', era: '1778-1840', tag: 'The original dandy',
    traits: { E: 70, A: 40, C: 55, N: 55, O: 60 },
    domains: { fitness: 50, finance: 10, cognition: 60, career: 50, languages: 40, relationships: 55, grooming: 100 },
    note: 'Invented modern menswear and five-hour grooming — then died destitute. Style is not a portfolio.',
    basis: 'bio',
  },
  {
    name: 'Katharine Hepburn', era: '1907-2003', tag: 'The self-possessed original',
    traits: { E: 70, A: 45, C: 85, N: 75, O: 75 },
    domains: { fitness: 85, finance: 80, cognition: 75, career: 95, languages: 30, relationships: 55, grooming: 80 },
    note: 'Swam in cold ocean daily into her 80s, wore what she pleased, answered to no one.',
    basis: 'bio',
  },
  {
    name: 'Socrates', era: '470-399 BC', tag: 'The barefoot questioner',
    traits: { E: 60, A: 55, C: 50, N: 90, O: 95 },
    domains: { fitness: 70, finance: 15, cognition: 95, career: 80, languages: 20, relationships: 80, grooming: 10 },
    note: 'Chose poverty, marched barefoot through winter campaigns, and was never once seen to hurry.',
    basis: 'bio',
  },
  {
    name: 'Queen Elizabeth I', era: '1533-1603', tag: 'The calculating survivor',
    traits: { E: 60, A: 40, C: 80, N: 60, O: 85 },
    domains: { fitness: 60, finance: 85, cognition: 90, career: 100, languages: 95, relationships: 40, grooming: 90 },
    note: 'Five languages, forty-five years of survival politics, and image management as statecraft.',
    basis: 'bio',
  },
];

export const BASIS_LABELS = {
  presidents: 'Personality adapted from expert ratings in Rubenzer & Faschingbauer (2004); life domains from biographical consensus',
  'presidents-cox': 'Personality from Rubenzer & Faschingbauer (2004); cognitive estimate from Cox (1926); life domains from biographical consensus',
  'bio-cox': 'Cognitive estimate from Cox (1926) historiometry; all else biographical consensus',
  bio: 'Biographical consensus',
};

export const FIGURE_DOMAIN_KEYS = ['fitness', 'finance', 'cognition', 'career', 'languages', 'relationships', 'grooming'];

// A figure's composite, mirroring the user's: mean of the seven life domains
// plus a personality-assets term (conscientiousness + emotional stability).
export function figureComposite(f) {
  const assets = (f.traits.C + f.traits.N) / 2;
  const vals = [...FIGURE_DOMAIN_KEYS.map((k) => f.domains[k]), assets];
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

// Full-profile matching: every Big Five trait and every completed life domain
// is one dimension; similarity = 100 minus the mean absolute distance.
// userTraits may be null (domains-only matching); userDomains holds only
// the domains the user has completed.
export function matchFigures(userTraits, userDomains = {}, topN = 3) {
  const domainKeys = FIGURE_DOMAIN_KEYS.filter(
    (k) => userDomains[k] !== null && userDomains[k] !== undefined);
  const traitKeys = userTraits ? ['E', 'A', 'C', 'N', 'O'] : [];
  const dims = traitKeys.length + domainKeys.length;
  if (dims < 3) return null;

  return {
    dimensions: dims,
    matches: FIGURES
      .map((f) => {
        let dist = 0;
        for (const k of traitKeys) dist += Math.abs(userTraits[k] - f.traits[k]);
        for (const k of domainKeys) dist += Math.abs(userDomains[k] - f.domains[k]);
        return { ...f, similarity: Math.round(100 - dist / dims), composite: figureComposite(f) };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topN),
  };
}
