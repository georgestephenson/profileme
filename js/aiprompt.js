// "Prompt for AI agents": serializes the user's ENTIRE profile — raw results,
// benchmark ratings, our grades and analysis — into one comprehensive prompt
// the user can paste into any capable LLM for deep personalized insight.

import { TRAITS } from './data/ipip.js';
import { DOMAIN_LABELS, getRecommendations } from './synthesis.js';
import { matchFigures } from './data/figures.js';
import {
  vo2maxFromCooper, vdotFrom5k, rateVo2max, rateRestingHr, ratePlank,
  rateVerticalJump, rateBalance, rateToeTouch, oneRepMax, RATING_LABELS,
  financeMetrics, expectedNetWorth,
} from './data/benchmarks.js';
import { rateExercise, migrateLegacyFitness, findExercise } from './data/exercises.js';
import { muscleContributions, muscleScores, MUSCLES } from './data/muscles.js';
import { bodyMetrics, earningsPotential, strengthPotential, cardioPotential, wealthProjection, languageTimeline } from './predictions.js';
import { scoreStress, scoreGse, scoreGrit } from './data/resilience.js';
import { scoreChronotype } from './data/chronotype.js';
import { scorePolitics, politicsLabel } from './data/politics.js';
import { VALUE_ITEMS } from './views/values.js';
import { scoreWellbeing, sleepQualityScore, swlsCategory } from './views/wellbeing.js';
import { lifeExpectancyFactors, lifeExpectancyEstimate } from './lifeexpectancy.js';

const line = (label, value) => (value === null || value === undefined || value === '' ? null : `- ${label}: ${value}`);
const section = (title, lines) => {
  const body = lines.filter(Boolean);
  return body.length ? `\n## ${title}\n${body.join('\n')}` : '';
};
const pct = (v) => (v === null || v === undefined ? null : `${Math.round(v)}/100`);

export function buildAiPrompt(profile, scores) {
  const age = profile.basics?.age, sex = profile.basics?.sex;
  const out = [];

  out.push(`You are an expert coach with deep knowledge of psychology, physiology, personal finance, and career strategy. Below is my complete self-profile from ProfileMe (geosona.com/profileme), a science-grounded self-assessment app. All scores are 0-100 against published benchmarks unless noted. Analyze it thoroughly.

# MY COMPLETE PROFILE`);

  // Basics
  const bm = bodyMetrics(profile);
  out.push(section('Basics', [
    line('Age', age), line('Sex', sex),
    line('Height', profile.basics?.heightCm ? `${profile.basics.heightCm} cm` : null),
    line('Weight', profile.basics?.weightKg ? `${profile.basics.weightKg} kg` : null),
    bm ? line('BMI', `${bm.bmi.toFixed(1)} (${bm.bmiClass})`) : null,
    bm?.whtr ? line('Waist-to-height ratio', `${bm.whtr.toFixed(2)} (${bm.whtrOk ? 'healthy' : 'elevated risk'})`) : null,
  ]));

  // Composite + domains
  if (scores.composite) {
    out.push(section('Overall synthesis (app-computed)', [
      line('Composite score', `${scores.composite.score}/100 (from ${scores.composite.components} of ${scores.composite.total} components)`),
      ...Object.keys(DOMAIN_LABELS).map((k) => line(`${DOMAIN_LABELS[k]} domain score`, pct(scores[k]))),
      line('Personality assets (C + stability + honesty)', pct(scores.personalityAssets)),
    ]));
  }

  // Personality
  const t = scores.personalityTraits;
  if (t) {
    out.push(section('Personality (IPIP-50 Big Five, 0-100 scale position)', [
      ...Object.keys(TRAITS).map((k) => line(TRAITS[k], t[k])),
      line('Honesty-Humility (HEXACO supplement)', scores.honestyHumility),
    ]));
  }

  // Cognition
  const c = profile.cognition;
  if (c) {
    out.push(section('Cognition', [
      c.battery ? line('Ability battery estimate (ICAR-format, provisional norms)', `${c.battery.estimateLow}-${c.battery.estimateHigh} IQ-scale band, ~${c.battery.percentile}th percentile`) : null,
      c.battery ? line('Battery sections (correct)', Object.entries(c.battery.parts).map(([k, p]) => `${k} ${p.correct}/${p.total}`).join(', ')) : null,
      c.digitSpan ? line('Forward digit span', `${c.digitSpan} digits`) : null,
      c.reactionMs ? line('Reaction time (median)', `${Math.round(c.reactionMs)} ms`) : null,
    ]));
  }

  // Fitness
  const f = migrateLegacyFitness(profile.fitness);
  if (f) {
    const bw = profile.basics?.weightKg ?? f.bodyweightKg;
    const lines = [];
    if (f.cooperMeters) lines.push(line('Est. VO2max (Cooper test)', `${vo2maxFromCooper(f.cooperMeters).toFixed(1)} mL/kg/min — ${RATING_LABELS[rateVo2max(vo2maxFromCooper(f.cooperMeters), age ?? 30, sex ?? 'male')]}`));
    if (f.fiveKMin) lines.push(line('Est. VO2max (5k time)', `${vdotFrom5k(f.fiveKMin).toFixed(1)} mL/kg/min — ${RATING_LABELS[rateVo2max(vdotFrom5k(f.fiveKMin), age ?? 30, sex ?? 'male')]}`));
    if (f.restingHr) lines.push(line('Resting heart rate', `${f.restingHr} bpm — ${RATING_LABELS[rateRestingHr(f.restingHr)]}`));
    if (f.plankSec) lines.push(line('Plank', `${f.plankSec}s — ${RATING_LABELS[ratePlank(f.plankSec)]}`));
    if (f.verticalJumpCm) lines.push(line('Vertical jump', `${f.verticalJumpCm} cm — ${RATING_LABELS[rateVerticalJump(f.verticalJumpCm, age ?? 30, sex ?? 'male')]}`));
    if (f.balanceSec) lines.push(line('One-leg balance', `${f.balanceSec}s — ${RATING_LABELS[rateBalance(f.balanceSec)]}`));
    if (f.toeTouch) lines.push(line('Toe-touch flexibility', `${f.toeTouch} — ${RATING_LABELS[rateToeTouch(f.toeTouch)]}`));
    for (const entry of f.exercises || []) {
      const ex = findExercise(entry.id);
      const r = rateExercise(entry, sex ?? 'male', bw);
      if (!ex || r === null) continue;
      const detail = ex.type === 'reps'
        ? `${entry.reps} reps`
        : `${entry.weightKg} kg × ${entry.reps || 1} (est. 1RM ${Math.round(oneRepMax(entry.weightKg, entry.reps || 1))} kg)`;
      lines.push(line(`${ex.name} (${ex.equipment})`, `${detail} — ${RATING_LABELS[r]}`));
    }
    const ms = muscleScores(muscleContributions(f, age ?? 30, sex ?? 'male', bw));
    const msLine = Object.entries(ms).filter(([, v]) => v !== null).map(([k, v]) => `${MUSCLES[k]} ${v}`).join(', ');
    if (msLine) lines.push(line('Muscle-group scores (0-100)', msLine));
    out.push(section('Fitness (age/sex-benchmarked)', lines));
  }

  // Finance
  if (profile.finance) {
    const m = financeMetrics(profile.finance);
    const lines = [
      line('Monthly income', profile.finance.monthlyIncome),
      line('Monthly expenses', profile.finance.monthlyExpenses),
      m.savingsRate !== null ? line('Savings rate', `${m.savingsRate.toFixed(0)}%`) : null,
      m.emergencyMonths !== null ? line('Emergency fund', `${m.emergencyMonths.toFixed(1)} months of expenses`) : null,
      m.debtToIncome !== null ? line('Non-mortgage debt / annual income', m.debtToIncome.toFixed(2)) : null,
      line('Net worth', profile.finance.netWorth),
      age && m.annualIncome ? line('Net worth vs expected (age × income ÷ 10)', `${Math.round((profile.finance.netWorth / Math.max(1, expectedNetWorth(age, m.annualIncome))) * 100)}%`) : null,
    ];
    const cs = profile.settings?.countryStats;
    if (cs) lines.push(line(`Income vs ${cs.countryName} average`, `annual income ≈ $${Math.round(profile.finance.monthlyIncome * 12 * cs.usdRate).toLocaleString()} vs GDP/capita $${Math.round(cs.gdpPcPpp).toLocaleString()} (${cs.year})`));
    out.push(section(`Finances (amounts in ${profile.settings?.currency || 'user currency'})`, lines));
  }

  // Career
  if (profile.career) {
    out.push(section('Career & education', [
      line('Education', profile.career.education),
      line('Years of experience in field', profile.career.yearsExperience),
      line('Job satisfaction (1-10)', profile.career.satisfaction),
      line('Deliberate learning (hrs/week)', profile.career.learningHours),
      line('Has mentor', profile.career.hasMentor ? 'yes' : 'no'),
      line('Professional contacts who would help', profile.career.closeProfessionalContacts),
    ]));
  }

  // Languages
  if (profile.languages?.list?.length) {
    out.push(section('Languages (CEFR self-assessed)',
      profile.languages.list.map((l) => line(l.name, l.level))));
  }

  // Relationships
  const r = profile.relationships;
  if (r) {
    const ucla = r.ucla?.every((v) => v) ? r.ucla.reduce((a, b) => a + b, 0) : null;
    out.push(section('Relationships & social health', [
      ucla !== null ? line('UCLA-3 loneliness', `${ucla}/9 (${ucla >= 6 ? 'lonely range' : 'not lonely'})`) : null,
      line('Close friends', r.closeFriends),
      line('Meaningful social interactions/week', r.weeklyInteractions),
      line('Family contacts/week', r.familyContactsPerWeek),
      line('Relationship status', r.partnerStatus),
      line('Relationship satisfaction (1-10)', r.partnerSatisfaction),
    ]));
  }

  // Grooming
  if (scores.grooming !== null && scores.grooming !== undefined) {
    out.push(section('Grooming & presentation', [line('Habit score', pct(scores.grooming))]));
  }

  // Well-being
  const w = profile.wellbeing;
  if (w) {
    const wb = scoreWellbeing(w);
    const chrono = w.chrono ? scoreChronotype(w.chrono) : null;
    const sq = sleepQualityScore(w.sleepQuality);
    out.push(section('Well-being & health', [
      wb ? line('Satisfaction With Life Scale', `${wb.total}/35 (${swlsCategory(wb.total)})`) : null,
      line('Sleep', w.sleepHours ? `${w.sleepHours} h/night` : null),
      sq !== null ? line('Sleep quality index', `${sq}/100`) : null,
      chrono ? line('Chronotype', `${chrono.type} (${chrono.total}/25)`) : null,
      line('Smoking', w.smoking),
      line('Alcoholic drinks/week', w.drinksPerWeek),
    ]));
    const base = profile.settings?.lifeExp;
    if (base) {
      const est = lifeExpectancyEstimate(base.years, lifeExpectancyFactors(profile));
      out.push(section('Life-expectancy estimate (population statistics, not prophecy)', [
        line('National baseline', `${base.years.toFixed(1)} yrs (${base.country}, ${base.sex})`),
        line('Factor adjustment', `${est.adjustment >= 0 ? '+' : ''}${est.adjustment.toFixed(1)} yrs`),
        line('Estimated range', `${Math.round(est.low)}-${Math.round(est.high)} yrs`),
        line('Factors', lifeExpectancyFactors(profile).map((fa) => `${fa.label} (${fa.years >= 0 ? '+' : ''}${fa.years})`).join('; ')),
      ]));
    }
  }

  // Resilience
  const res = profile.resilience;
  if (res) {
    const stress = res.stressAnswers ? scoreStress(res.stressAnswers) : null;
    const gse = res.gseAnswers ? scoreGse(res.gseAnswers) : null;
    const grit = res.gritAnswers ? scoreGrit(res.gritAnswers) : null;
    out.push(section('Mind & resilience', [
      stress !== null ? line('Perceived stress', `${stress}/16 (${stress <= 5 ? 'low' : stress <= 9 ? 'moderate' : 'high'})`) : null,
      gse !== null ? line('General self-efficacy (GSE)', `${gse}/40`) : null,
      grit !== null ? line('Grit (Grit-S-style)', `${grit}/5`) : null,
    ]));
  }

  // Background
  const bg = profile.background;
  if (bg?.childhoodLadder && bg?.currentLadder) {
    out.push(section('Background & social mobility', [
      line('MacArthur ladder, childhood household', `${bg.childhoodLadder}/10`),
      line('MacArthur ladder, today', `${bg.currentLadder}/10 (mobility: ${bg.currentLadder - bg.childhoodLadder >= 0 ? '+' : ''}${bg.currentLadder - bg.childhoodLadder})`),
      line("Parents' highest education", bg.parentEducation),
      line('First-generation university', bg.firstGenUniversity ? 'yes' : 'no'),
    ]));
  }

  // Values
  if (profile.values?.answers) {
    const ranked = [...VALUE_ITEMS].filter((v) => profile.values.answers[v.key])
      .sort((a, b) => profile.values.answers[b.key] - profile.values.answers[a.key]);
    out.push(section('Values (Schwartz-model, importance 1-5)',
      ranked.map((v) => line(v.label, profile.values.answers[v.key]))));
  }

  // Politics
  if (profile.politics?.answers) {
    const p = scorePolitics(profile.politics.answers);
    if (p) {
      out.push(section('Political orientation (descriptive only)', [
        line('Position', politicsLabel(p)),
        line('Economic axis', `${p.econ} (−100 left … +100 right)`),
        line('Social axis', `${p.social} (−100 libertarian … +100 authoritarian)`),
      ]));
    }
  }

  // Twins
  const userDomains = Object.fromEntries(Object.keys(DOMAIN_LABELS).map((k) => [k, scores[k]]));
  const twins = matchFigures(scores.personalityTraits, userDomains, 5);
  if (twins) {
    out.push(section('Closest historical profile matches (of 256 figures)',
      twins.matches.map((m) => line(m.name, `${m.similarity}% similar — ${m.tag}`))));
  }

  // App recommendations & projections
  const recs = getRecommendations(profile, scores);
  if (recs.length) {
    out.push(section('App-generated recommendations already shown to me',
      recs.map((rc) => line(rc.domain, rc.text))));
  }
  const proj = [];
  const ep = earningsPotential(profile, scores);
  if (ep) proj.push(line('Earnings potential (5yr, lever model)', `+${ep.lowPct}% to +${ep.highPct}%`));
  const sp = strengthPotential(profile);
  if (sp) proj.push(line('Strength level / 12-month potential', `${sp.level}, +${sp.gainLow}-${sp.gainHigh}%`));
  const cp = cardioPotential(profile);
  if (cp) proj.push(line('VO2max potential (6 months)', `${cp.currentVo2.toFixed(1)} → ${cp.targetLow.toFixed(1)}-${cp.targetHigh.toFixed(1)}`));
  const wp = wealthProjection(profile);
  if (wp) proj.push(line('10-year net worth (current path vs 20% savings rate)', `${Math.round(wp.currentPath).toLocaleString()} vs ${Math.round(wp.targetPath).toLocaleString()}`));
  const lt = languageTimeline(profile);
  if (lt) proj.push(line(`${lt.language} ${lt.from}→${lt.to}`, `${lt.weeksLow}-${lt.weeksHigh} weeks at ${lt.hoursPerWeek}h/week`));
  out.push(section('App-computed projections', proj));

  // Instructions
  out.push(`
# WHAT I WANT FROM YOU

Using everything above — the raw numbers, the benchmark ratings, and the app's own analysis — give me your most insightful, honest read. Specifically:

1. **Summarize me as a person** in a few paragraphs, as if describing me to someone perceptive who has never met me. Integrate across domains — how do my personality, cognition, body, money, relationships, values, and background fit together into one coherent picture? What tensions or contradictions do you see?
2. **Strengths and weaknesses**: my 5 clearest strengths and 5 clearest weaknesses, each grounded in specific data points above, ranked by how much they matter.
3. **Predict what I'm like**: how I probably come across to others, how I likely behave under stress, in relationships, at work, with money — including things I may not see about myself.
4. **Predict my future**: the most likely trajectory over the next 5-10 years if I change nothing, and the realistic best-case if I play my hand well. Be specific about which data drives each prediction, and honest about uncertainty.
5. **Key advice**: the highest-leverage changes for me specifically — not generic advice. For each, say why it fits my exact profile and what measurable difference to expect.
6. **Priorities**: if I could only work on three things in the next 12 months, which three, in what order, and why those over everything else.

Be direct and specific. Do not flatter me, and do not soften the weaknesses. Where the data is thin or self-reported, say so and hold your confidence accordingly.`);

  return out.filter(Boolean).join('\n');
}
