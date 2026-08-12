// The 50-item IPIP Big-Five Factor Markers (Goldberg, 1992), public domain.
// Source: International Personality Item Pool, https://ipip.ori.org
// Each item: id, text, trait, keyed (+1 or -1).
// Traits: E extraversion, A agreeableness, C conscientiousness,
//         N emotional stability (high = stable), O openness/intellect.

export const TRAITS = {
  E: 'Extraversion',
  A: 'Agreeableness',
  C: 'Conscientiousness',
  N: 'Emotional stability',
  O: 'Openness / Intellect',
};

export const TRAIT_DESCRIPTIONS = {
  E: 'Sociability, assertiveness, and energy drawn from social interaction.',
  A: 'Warmth, compassion, and cooperativeness toward others.',
  C: 'Organization, dependability, and self-discipline.',
  N: 'Calmness and resilience under stress (the opposite pole of neuroticism).',
  O: 'Curiosity, imagination, and openness to ideas and experiences.',
};

export const ITEMS = [
  { id: 1,  text: 'Am the life of the party.', trait: 'E', keyed: 1 },
  { id: 2,  text: 'Feel little concern for others.', trait: 'A', keyed: -1 },
  { id: 3,  text: 'Am always prepared.', trait: 'C', keyed: 1 },
  { id: 4,  text: 'Get stressed out easily.', trait: 'N', keyed: -1 },
  { id: 5,  text: 'Have a rich vocabulary.', trait: 'O', keyed: 1 },
  { id: 6,  text: "Don't talk a lot.", trait: 'E', keyed: -1 },
  { id: 7,  text: 'Am interested in people.', trait: 'A', keyed: 1 },
  { id: 8,  text: 'Leave my belongings around.', trait: 'C', keyed: -1 },
  { id: 9,  text: 'Am relaxed most of the time.', trait: 'N', keyed: 1 },
  { id: 10, text: 'Have difficulty understanding abstract ideas.', trait: 'O', keyed: -1 },
  { id: 11, text: 'Feel comfortable around people.', trait: 'E', keyed: 1 },
  { id: 12, text: 'Insult people.', trait: 'A', keyed: -1 },
  { id: 13, text: 'Pay attention to details.', trait: 'C', keyed: 1 },
  { id: 14, text: 'Worry about things.', trait: 'N', keyed: -1 },
  { id: 15, text: 'Have a vivid imagination.', trait: 'O', keyed: 1 },
  { id: 16, text: 'Keep in the background.', trait: 'E', keyed: -1 },
  { id: 17, text: "Sympathize with others' feelings.", trait: 'A', keyed: 1 },
  { id: 18, text: 'Make a mess of things.', trait: 'C', keyed: -1 },
  { id: 19, text: 'Seldom feel blue.', trait: 'N', keyed: 1 },
  { id: 20, text: 'Am not interested in abstract ideas.', trait: 'O', keyed: -1 },
  { id: 21, text: 'Start conversations.', trait: 'E', keyed: 1 },
  { id: 22, text: "Am not interested in other people's problems.", trait: 'A', keyed: -1 },
  { id: 23, text: 'Get chores done right away.', trait: 'C', keyed: 1 },
  { id: 24, text: 'Am easily disturbed.', trait: 'N', keyed: -1 },
  { id: 25, text: 'Have excellent ideas.', trait: 'O', keyed: 1 },
  { id: 26, text: 'Have little to say.', trait: 'E', keyed: -1 },
  { id: 27, text: 'Have a soft heart.', trait: 'A', keyed: 1 },
  { id: 28, text: 'Often forget to put things back in their proper place.', trait: 'C', keyed: -1 },
  { id: 29, text: 'Get upset easily.', trait: 'N', keyed: -1 },
  { id: 30, text: 'Do not have a good imagination.', trait: 'O', keyed: -1 },
  { id: 31, text: 'Talk to a lot of different people at parties.', trait: 'E', keyed: 1 },
  { id: 32, text: 'Am not really interested in others.', trait: 'A', keyed: -1 },
  { id: 33, text: 'Like order.', trait: 'C', keyed: 1 },
  { id: 34, text: 'Change my mood a lot.', trait: 'N', keyed: -1 },
  { id: 35, text: 'Am quick to understand things.', trait: 'O', keyed: 1 },
  { id: 36, text: "Don't like to draw attention to myself.", trait: 'E', keyed: -1 },
  { id: 37, text: 'Take time out for others.', trait: 'A', keyed: 1 },
  { id: 38, text: 'Shirk my duties.', trait: 'C', keyed: -1 },
  { id: 39, text: 'Have frequent mood swings.', trait: 'N', keyed: -1 },
  { id: 40, text: 'Use difficult words.', trait: 'O', keyed: 1 },
  { id: 41, text: "Don't mind being the center of attention.", trait: 'E', keyed: 1 },
  { id: 42, text: "Feel others' emotions.", trait: 'A', keyed: 1 },
  { id: 43, text: 'Follow a schedule.', trait: 'C', keyed: 1 },
  { id: 44, text: 'Get irritated easily.', trait: 'N', keyed: -1 },
  { id: 45, text: 'Spend time reflecting on things.', trait: 'O', keyed: 1 },
  { id: 46, text: 'Am quiet around strangers.', trait: 'E', keyed: -1 },
  { id: 47, text: 'Make people feel at ease.', trait: 'A', keyed: 1 },
  { id: 48, text: 'Am exacting in my work.', trait: 'C', keyed: 1 },
  { id: 49, text: 'Often feel blue.', trait: 'N', keyed: -1 },
  { id: 50, text: 'Am full of ideas.', trait: 'O', keyed: 1 },
];

export const LIKERT = [
  { value: 1, label: 'Very inaccurate' },
  { value: 2, label: 'Somewhat inaccurate' },
  { value: 3, label: 'Neither' },
  { value: 4, label: 'Somewhat accurate' },
  { value: 5, label: 'Very accurate' },
];

// Score answers {itemId: 1..5} into trait scores on a 0-100 scale.
// Each trait has 10 items; raw range 10-50 maps linearly to 0-100.
export function scoreIpip(answers) {
  const sums = { E: 0, A: 0, C: 0, N: 0, O: 0 };
  for (const item of ITEMS) {
    const a = answers[item.id];
    if (!a) return null; // incomplete
    sums[item.trait] += item.keyed === 1 ? a : 6 - a;
  }
  const out = {};
  for (const t of Object.keys(sums)) {
    out[t] = Math.round(((sums[t] - 10) / 40) * 100);
  }
  return out;
}
