// Life-expectancy estimate: national baseline (World Bank, by sex) adjusted by
// transparent, evidence-anchored factors. This is population statistics, not
// personal prophecy — every factor and its size is shown to the user.

import { vo2maxFromCooper, vdotFrom5k, rateVo2max, rateRestingHr } from './data/benchmarks.js';
import { bodyMetrics } from './predictions.js';

export function lifeExpectancyFactors(profile) {
  const factors = [];
  const add = (label, years, why) => factors.push({ label, years, why });

  // Smoking — the single biggest modifiable factor (Doll et al., 2004: ~10
  // years lost for lifelong smokers; large gains for quitting).
  const smoking = profile.wellbeing?.smoking;
  if (smoking === 'current') add('Current smoker', -8, 'Doll et al. (2004): ~10 years lost for lifelong smokers; quitting recovers most of it');
  else if (smoking === 'former') add('Former smoker', -2, 'Risk falls steeply after quitting but does not fully reach never-smoker levels');
  else if (smoking === 'never') add('Never smoked', +1, 'Avoids the largest single behavioral mortality risk');

  // Cardio fitness (Mandsager et al., 2018: strong inverse CRF-mortality gradient)
  const f = profile.fitness;
  const age = profile.basics?.age ?? 30, sex = profile.basics?.sex ?? 'male';
  let cardio = null;
  if (f?.cooperMeters) cardio = rateVo2max(vo2maxFromCooper(f.cooperMeters), age, sex);
  else if (f?.fiveKMin) cardio = rateVo2max(vdotFrom5k(f.fiveKMin), age, sex);
  else if (f?.restingHr) cardio = rateRestingHr(f.restingHr);
  if (cardio !== null) {
    const map = [-2.5, -1, +1, +2.5, +4];
    add(`Cardio fitness (${['very poor', 'poor', 'fair', 'good', 'excellent'][cardio]})`, map[cardio],
      'Cardiorespiratory fitness shows one of the strongest known dose-response links to all-cause mortality');
  }

  // Body composition
  const bm = bodyMetrics(profile);
  if (bm) {
    if (bm.bmi >= 18.5 && bm.bmi < 25) add('Healthy BMI', +1, 'Lowest all-cause mortality band');
    else if (bm.bmi >= 30) add('BMI in obese range', -3, 'Meta-analyses: class 1+ obesity raises all-cause mortality');
    else if (bm.bmi < 18.5) add('Underweight', -1.5, 'Underweight is associated with elevated mortality');
    else add('BMI in overweight range', -0.5, 'Modest association with mortality risk');
  }

  // Sleep
  const sleep = profile.wellbeing?.sleepHours;
  if (sleep) {
    if (sleep >= 7 && sleep <= 9) add('Sleep 7-9h', +1, 'U-shaped sleep-mortality curve bottoms out at 7-9 hours');
    else add(`Sleep ${sleep}h`, -1.5, 'Both short and long habitual sleep are associated with higher mortality');
  }

  // Social connection (Holt-Lunstad et al., 2010)
  const ucla = profile.relationships?.ucla;
  if (ucla?.every((v) => v)) {
    const lonely = ucla.reduce((a, b) => a + b, 0) >= 6;
    add(lonely ? 'Loneliness screen: lonely range' : 'Socially connected', lonely ? -1.5 : +1,
      'Social connection predicts mortality on par with smoking in meta-analysis');
  }

  // Alcohol
  const drinks = profile.wellbeing?.drinksPerWeek;
  if (drinks !== null && drinks !== undefined) {
    if (drinks === 0) add('No alcohol', +0.5, 'No level of drinking improves mortality; zero avoids the risk entirely');
    else if (drinks <= 7) add('Light drinking', 0, 'Within most national low-risk guidelines');
    else if (drinks <= 14) add('Moderate-heavy drinking', -1, 'Above low-risk guidelines');
    else add('Heavy drinking', -3, 'Heavy use is strongly associated with premature mortality');
  }

  // Education
  const edu = profile.career?.education;
  if (['bachelor', 'master', 'doctorate'].includes(edu)) {
    add('Degree-level education', +1.5, 'Education shows a consistent mortality gradient across countries');
  }

  return factors;
}

export function lifeExpectancyEstimate(baseYears, factors) {
  const adj = Math.max(-12, Math.min(9, factors.reduce((a, f) => a + f.years, 0)));
  const estimate = baseYears + adj;
  return { base: baseYears, adjustment: adj, low: estimate - 3, high: estimate + 3 };
}
