// Matching logic for the historical "profile twins" feature.
// The 256-figure dataset lives in figures-data.js; see the header there for
// sourcing and honesty notes.

export { FIGURES } from './figures-data.js';
import { FIGURES } from './figures-data.js';

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
