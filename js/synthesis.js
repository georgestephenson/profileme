// Turns raw profile data into 0-100 domain scores and evidence-informed,
// rule-based recommendations. Personality is intentionally NOT scored as a
// single number — traits are a profile, not a grade.

import { scoreIpip, scoreHH } from './data/ipip.js';
import { scoreGrooming } from './data/grooming.js';
import {
  vo2maxFromCooper, vdotFrom5k, rateVo2max, rateRestingHr, ratePushups, ratePullups,
  ratePlank, rateLift, rateVerticalJump, rateBalance, rateToeTouch,
  financeMetrics, rateSavingsRate, rateEmergencyFund, rateDebtToIncome,
  expectedNetWorth, rateDigitSpan, rateReactionTime, cefrPoints,
} from './data/benchmarks.js';

const ratingToScore = (r) => (r === null || r === undefined ? null : r * 25);
const avg = (xs) => {
  const v = xs.filter((x) => x !== null && x !== undefined && !Number.isNaN(x));
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
};
const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

export function computeScores(profile) {
  const { basics } = profile;
  const age = basics?.age ?? 30;
  const sex = basics?.sex ?? 'male';
  const scores = {};

  // Personality: full trait profile (not graded)…
  scores.personalityTraits = profile.personality?.answers
    ? scoreIpip(profile.personality.answers)
    : null;
  scores.honestyHumility = profile.personality?.hhAnswers
    ? scoreHH(profile.personality.hhAnswers)
    : null;

  // …plus a "personality assets" subscore from the aspects with broadly
  // positive outcomes: conscientiousness and emotional stability predict
  // performance, health, and longevity across meta-analyses; honesty-humility
  // predicts integrity outcomes. Extraversion/agreeableness/openness stay
  // out — their optima genuinely depend on context and goals.
  scores.personalityAssets = scores.personalityTraits
    ? avg([scores.personalityTraits.C, scores.personalityTraits.N, scores.honestyHumility])
    : null;

  // Fitness: average of available cardio + strength ratings.
  if (profile.fitness) {
    const f = profile.fitness;
    const parts = [];
    if (f.cooperMeters) parts.push(ratingToScore(rateVo2max(vo2maxFromCooper(f.cooperMeters), age, sex)));
    if (f.fiveKMin) parts.push(ratingToScore(rateVo2max(vdotFrom5k(f.fiveKMin), age, sex)));
    if (f.restingHr) parts.push(ratingToScore(rateRestingHr(f.restingHr)));
    if (f.pushups !== null && f.pushups !== undefined) parts.push(ratingToScore(ratePushups(f.pushups, age, sex)));
    if (f.pullups !== null && f.pullups !== undefined) parts.push(ratingToScore(ratePullups(f.pullups, age, sex)));
    if (f.plankSec) parts.push(ratingToScore(ratePlank(f.plankSec)));
    if (f.verticalJumpCm) parts.push(ratingToScore(rateVerticalJump(f.verticalJumpCm, age, sex)));
    if (f.balanceSec) parts.push(ratingToScore(rateBalance(f.balanceSec)));
    if (f.toeTouch) parts.push(ratingToScore(rateToeTouch(f.toeTouch)));
    if (f.bodyweightKg) {
      for (const lift of ['squat', 'bench', 'deadlift', 'press', 'row']) {
        const w = f[`${lift}Kg`];
        if (w) parts.push(ratingToScore(rateLift(lift, w, f.bodyweightKg, sex)));
      }
    }
    scores.fitness = avg(parts);
  } else scores.fitness = null;

  // Finance
  if (profile.finance) {
    const m = financeMetrics(profile.finance);
    const parts = [
      ratingToScore(rateSavingsRate(m.savingsRate)),
      ratingToScore(rateEmergencyFund(m.emergencyMonths)),
      ratingToScore(rateDebtToIncome(m.debtToIncome)),
    ];
    if (profile.finance.netWorth !== null && profile.finance.netWorth !== undefined && m.annualIncome > 0) {
      const ratio = profile.finance.netWorth / Math.max(1, expectedNetWorth(age, m.annualIncome));
      parts.push(clamp(ratio * 50, 0, 100)); // 2x expected net worth = 100
    }
    scores.finance = avg(parts);
    scores.financeMetrics = m;
  } else scores.finance = null;

  // Cognition: battery percentile (when taken) weighs double the mini-tasks.
  if (profile.cognition) {
    const c = profile.cognition;
    scores.cognition = avg([
      c.battery ? c.battery.percentile : null,
      c.battery ? c.battery.percentile : null,
      c.digitSpan ? ratingToScore(rateDigitSpan(c.digitSpan)) : null,
      c.reactionMs ? ratingToScore(rateReactionTime(c.reactionMs)) : null,
    ]);
  } else scores.cognition = null;

  // Career (transparent heuristic, labeled as such in the UI)
  if (profile.career) {
    const c = profile.career;
    const eduPts = { none: 10, secondary: 30, vocational: 45, bachelor: 60, master: 75, doctorate: 90 }[c.education] ?? 30;
    const expPts = clamp(c.yearsExperience * 4, 0, 40);
    const satPts = clamp((c.satisfaction ?? 5) * 10, 0, 100);
    const learnPts = clamp((c.learningHours ?? 0) * 12, 0, 60);
    const mentorPts = c.hasMentor ? 60 : 20;
    const netPts = clamp((c.closeProfessionalContacts ?? 0) * 6, 0, 60);
    scores.career = avg([
      clamp(eduPts + expPts, 0, 100),
      satPts,
      clamp(learnPts + 40, 0, 100),
      clamp(mentorPts + netPts, 0, 100),
    ]);
  } else scores.career = null;

  // Languages: native-only baseline 30; each extra language adds points by level.
  if (profile.languages?.list?.length) {
    const pts = profile.languages.list.map((l) => cefrPoints(l.level)).sort((a, b) => b - a);
    let score = 25;
    let weight = 1;
    for (const p of pts) {
      if (p === 7) { score += 10 * weight; } // additional native languages
      else score += p * 9 * weight;
      weight *= 0.6;
    }
    scores.languages = clamp(Math.round(score), 0, 100);
  } else scores.languages = null;

  // Relationships
  if (profile.relationships) {
    const r = profile.relationships;
    const uclaTotal = (r.ucla || []).reduce((a, b) => a + b, 0); // 3-9, lower is better
    const lonelinessScore = clamp(((9 - uclaTotal) / 6) * 100, 0, 100);
    const friendScore = clamp((r.closeFriends ?? 0) * 22, 0, 100);
    const contactScore = clamp(
      ((r.weeklyInteractions ?? 0) + (r.familyContactsPerWeek ?? 0) * 0.5) * 15, 0, 100);
    const partnerScore = r.partnerStatus === 'partnered' && r.partnerSatisfaction
      ? clamp(r.partnerSatisfaction * 10, 0, 100)
      : null;
    scores.relationships = avg([lonelinessScore, friendScore, contactScore, partnerScore]);
    scores.uclaTotal = uclaTotal;
  } else scores.relationships = null;

  // Grooming
  scores.grooming = profile.grooming?.answers
    ? scoreGrooming(profile.grooming.answers)
    : null;

  // Composite: equal-weighted mean of every available component. One number
  // for the gamified overview — the per-domain picture is the real content.
  const componentKeys = [...Object.keys(DOMAIN_LABELS), 'personalityAssets'];
  const available = componentKeys.filter((k) => scores[k] !== null && scores[k] !== undefined);
  scores.composite = available.length >= 3
    ? { score: Math.round(avg(available.map((k) => scores[k]))), components: available.length, total: componentKeys.length }
    : null;

  return scores;
}

export const DOMAIN_LABELS = {
  fitness: 'Fitness',
  finance: 'Finances',
  cognition: 'Cognition',
  career: 'Career',
  languages: 'Languages',
  relationships: 'Relationships',
  grooming: 'Grooming',
};

export const COMPONENT_LABELS = {
  ...DOMAIN_LABELS,
  personalityAssets: 'Personality assets',
};

// ---------- Recommendation engine ----------
// Each rule: applies(profile, scores) -> recommendation | null

const RULES = [
  {
    domain: 'Fitness',
    apply(p, s) {
      const f = p.fitness;
      if (!f?.cooperMeters && !f?.restingHr && !f?.fiveKMin) return null;
      const age = p.basics?.age ?? 30, sex = p.basics?.sex ?? 'male';
      const cardioLow =
        (f.cooperMeters && rateVo2max(vo2maxFromCooper(f.cooperMeters), age, sex) <= 1) ||
        (f.fiveKMin && rateVo2max(vdotFrom5k(f.fiveKMin), age, sex) <= 1) ||
        (f.restingHr && rateRestingHr(f.restingHr) <= 1);
      if (!cardioLow) return null;
      return {
        text: 'Build an aerobic base: 3-4 sessions per week of easy "zone 2" cardio (able to hold a conversation), 30-45 minutes each, plus one harder interval session.',
        why: 'Cardiorespiratory fitness is one of the strongest known predictors of all-cause mortality (Mandsager et al., 2018), and low fitness responds quickly to consistent training.',
      };
    },
  },
  {
    domain: 'Fitness',
    apply(p) {
      const f = p.fitness;
      if (!f) return null;
      const age = p.basics?.age ?? 30, sex = p.basics?.sex ?? 'male';
      const weak = (f.pushups !== undefined && f.pushups !== null && ratePushups(f.pushups, age, sex) <= 1) ||
                   (f.plankSec && ratePlank(f.plankSec) <= 1);
      if (!weak) return null;
      return {
        text: 'Add 2-3 short resistance sessions per week — push-ups, rows, squats, planks — progressing reps or load gradually.',
        why: 'Resistance training is associated with lower all-cause mortality and preserves function with age; strength adapts reliably to progressive overload.',
      };
    },
  },
  {
    domain: 'Finances',
    apply(p, s) {
      const m = s.financeMetrics;
      if (!m || m.savingsRate === null || m.savingsRate >= 10) return null;
      return {
        text: `Your savings rate is ${m.savingsRate.toFixed(0)}%. Target at least 10-20% by automating a transfer on payday and reviewing your three largest expense categories.`,
        why: 'Savings rate is the single biggest lever on financial resilience and time-to-financial-independence; automation reliably beats willpower ("pay yourself first").',
      };
    },
  },
  {
    domain: 'Finances',
    apply(p, s) {
      const m = s.financeMetrics;
      if (!m || m.emergencyMonths === null || m.emergencyMonths >= 3) return null;
      return {
        text: `You have ${m.emergencyMonths.toFixed(1)} months of expenses in liquid savings. Prioritize building this to 3-6 months before other goals.`,
        why: 'An emergency fund prevents high-interest debt spirals from income shocks — the standard first step in every evidence-informed financial planning framework.',
      };
    },
  },
  {
    domain: 'Finances',
    apply(p, s) {
      const m = s.financeMetrics;
      if (!m || m.debtToIncome === null || m.debtToIncome <= 0.5) return null;
      return {
        text: 'Non-mortgage debt exceeds half your annual income. List debts by interest rate and direct all spare cash at the highest-rate one (avalanche method).',
        why: 'The avalanche method minimizes total interest paid; mathematically optimal when you can stay consistent.',
      };
    },
  },
  {
    domain: 'Cognition',
    apply(p) {
      if (!p.cognition) return null;
      const slow = rateReactionTime(p.cognition.reactionMs) <= 1 || rateDigitSpan(p.cognition.digitSpan) <= 1;
      if (!slow) return null;
      return {
        text: 'The most evidence-backed ways to support cognitive performance are aerobic exercise, 7-9 hours of sleep, and managing stress — not brain-training apps.',
        why: 'Brain-training gains rarely transfer beyond the trained task (Simons et al., 2016), while exercise and sleep show broad, replicated cognitive benefits.',
      };
    },
  },
  {
    domain: 'Personality',
    apply(p, s) {
      const t = s.personalityTraits;
      if (!t || t.C >= 40) return null;
      return {
        text: 'Lower conscientiousness makes systems more valuable than willpower: use implementation intentions ("If it is 7am, then I run"), calendars, and environment design instead of relying on motivation.',
        why: 'Implementation intentions show a medium-to-large effect on goal attainment across 94 studies (Gollwitzer & Sheeran, 2006), and are especially useful when self-discipline is not your default mode.',
      };
    },
  },
  {
    domain: 'Personality',
    apply(p, s) {
      const t = s.personalityTraits;
      if (!t || t.N >= 35) return null;
      return {
        text: 'Your emotional-stability score is on the lower end. Consider building a regular stress-management practice — exercise, mindfulness, or CBT-based tools; a professional is worth talking to if distress is frequent.',
        why: 'Neuroticism is the trait most strongly linked to worse well-being outcomes, and it is meaningfully reducible — meta-analyses show therapy and targeted interventions shift it (Roberts et al., 2017).',
      };
    },
  },
  {
    domain: 'Relationships',
    apply(p, s) {
      if (s.uclaTotal === undefined || s.uclaTotal < 6) return null;
      return {
        text: 'Your loneliness screen is in the "lonely" range. Schedule recurring social contact (weekly, same people), join a group activity around a real interest, and treat this with the same seriousness as a health metric — because it is one.',
        why: 'Social connection predicts mortality on par with smoking and above obesity (Holt-Lunstad et al., 2010); recurring, interest-based contact is the most reliable route to new close ties.',
      };
    },
  },
  {
    domain: 'Career',
    apply(p) {
      const c = p.career;
      if (!c || c.satisfaction === undefined || c.satisfaction > 4) return null;
      return {
        text: 'Job satisfaction is low. Before quitting, run a structured diagnosis: is it the tasks, the people, the pay, or the meaning? Job crafting (reshaping tasks and relationships within your role) often fixes more than expected — and if not, you will know exactly what to select for next.',
        why: 'Job-crafting interventions show reliable improvements in engagement and satisfaction (Wrzesniewski & Dutton; meta-analytic support), and structured diagnosis beats impulsive exits.',
      };
    },
  },
  {
    domain: 'Career',
    apply(p) {
      const c = p.career;
      if (!c || (c.learningHours ?? 0) >= 2) return null;
      return {
        text: 'You spend under 2 hours a week on deliberate skill development. Block a recurring 2-3 hour slot for structured learning in your field with a concrete output (a project, certification, or portfolio piece).',
        why: 'Deliberate, feedback-driven practice — not passive experience — is what drives expertise (Ericsson); years on the job alone plateau quickly.',
      };
    },
  },
  {
    domain: 'Grooming',
    apply(p) {
      const a = p.grooming?.answers;
      if (!a || (a.floss ?? 5) >= 4) return null;
      return {
        text: 'Floss (or use interdental brushes) daily — it is the highest-leverage two minutes in personal care.',
        why: 'Periodontal disease is consistently associated with cardiovascular disease and systemic inflammation; interdental cleaning is the intervention gum health depends on.',
      };
    },
  },
  {
    domain: 'Grooming',
    apply(p) {
      const a = p.grooming?.answers;
      if (!a || (a.spf ?? 5) >= 4) return null;
      return {
        text: 'Add a daily SPF 30+ moisturizer to your morning routine.',
        why: 'Daily sunscreen measurably slowed skin aging in a randomized controlled trial (Hughes et al., 2013) and cuts skin-cancer risk — the best-evidenced appearance intervention there is.',
      };
    },
  },
  {
    domain: 'Languages',
    apply(p) {
      const list = p.languages?.list;
      if (!list?.length) return null;
      const learning = list.find((l) => ['A1', 'A2', 'B1'].includes(l.level));
      if (!learning) return null;
      return {
        text: `To push ${learning.name} past ${learning.level}: daily spaced-repetition vocabulary plus regular comprehensible input (podcasts, graded readers) and weekly conversation practice.`,
        why: 'Spaced repetition and comprehensible input are among the best-supported findings in second-language acquisition research; consistency beats intensity.',
      };
    },
  },
];

export function getRecommendations(profile, scores) {
  const recs = [];
  for (const rule of RULES) {
    const r = rule.apply(profile, scores);
    if (r) recs.push({ domain: rule.domain, ...r });
  }
  return recs;
}
