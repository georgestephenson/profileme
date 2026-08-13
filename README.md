# ProfileMe

**Profile everything about yourself. Synthesize it. Get evidence-based strategies for improvement.**

ProfileMe is a privacy-first personal profiling app. You complete assessments across
the major domains of life — personality, fitness, finances, cognition, career,
languages, relationships — and the app synthesizes the results into a single
dashboard with analysis and science-informed recommendations.

## Principles

1. **Scientifically honest.** Where a validated, public-domain instrument exists, we
   use it (e.g. the IPIP Big Five markers, Cooper test VO2max estimation, UCLA-3
   loneliness scale). The cognition battery uses item formats validated by the
   public-domain ICAR project (Condon & Revelle, 2014) — formats that correlate
   ~0.8 with commercial gold-standard tests — and reports an **estimated range**,
   never a precise IQ, because our norms are provisional and untimed
   self-administration is not clinical testing. Predictions are ranges with their
   evidence basis stated inline.
2. **Privacy-first.** Everything runs in your browser. All data is stored in
   `localStorage` on your device. Nothing is ever sent to a server.
3. **Traits are not grades.** Personality is reported as a trait profile, not a
   score — there is no "good" or "bad" Big Five result. Domains where more genuinely
   is better (cardio fitness, savings rate) are scored and benchmarked against
   published norms.

## Domains

| Domain | Instrument / method | Basis |
|---|---|---|
| Personality | IPIP 50-item Big Five factor markers + optional Honesty-Humility (HEXACO) supplement | Public-domain (Goldberg, ipip.ori.org); HEXACO sixth factor (Ashton & Lee) |
| Body | BMI, waist-to-height ratio | Standard population screens; WHtR < 0.5 guideline |
| Cardio fitness | Cooper 12-minute run or 5k time → VO2max, or resting heart rate | Cooper (1968); Daniels & Gilbert VDOT; ACSM-style age/sex ratings |
| Strength & function | Build-your-own list from a 29-exercise catalog (barbell, dumbbell, Smith machine, calisthenics) entered as any weight × reps (Epley 1RM), plus plank, vertical jump, one-leg balance, toe-touch | Strength standards per equipment type; Epley formula; Araujo et al. (2022) |
| Finances | Savings rate, emergency fund, debt-to-income, net worth vs. age; user currency (Intl-formatted); income vs. your country via live World Bank GDP-per-capita data | Standard personal-finance metrics; World Bank API + ECB reference rates |
| Cognition | 36-item ability battery (verbal knowledge, series, analogies, matrix reasoning) + digit span + reaction time | ICAR-format items (Condon & Revelle, 2014); reported as an estimated range with provisional norms |
| Career & education | Structured self-report (education, experience, satisfaction, learning, network) | Heuristic, labeled as such |
| Languages | CEFR self-assessment per language | Council of Europe CEFR framework |
| Relationships | UCLA-3 loneliness scale, social + family contact, relationship satisfaction | Hughes et al. (2004); relationship-quality well-being findings |
| Grooming | 8 upkeep-habit items (oral care, SPF, presentation) | Oral-systemic health links; Hughes et al. (2013) sunscreen RCT; person-perception findings |
| Well-being & health | Satisfaction With Life Scale, sleep hours + 4-item sleep-quality index, chronotype (MEQ-style), smoking, alcohol | Diener et al. (1985); AASM/SRS consensus; Horne-Ostberg-style items |
| Mind & resilience | Perceived stress (PSS-4-style), General Self-Efficacy Scale, grit (Grit-S-style original items) | Cohen; Schwarzer & Jerusalem (1995, free to use); Duckworth's construct with original items |
| Values | 10 basic values, Schwartz circumplex model (original items) | Schwartz values framework; profile only, ungraded |
| Life expectancy | National baseline (World Bank, by sex) ± transparent evidence-anchored factors (smoking, fitness, BMI, sleep, connection, alcohol, education) | Doll et al. (2004); Mandsager et al. (2018); Holt-Lunstad et al. (2010); shown factor-by-factor with heavy caveats |
| Background & mobility | MacArthur ladder (childhood vs. now) + intergenerational education | Adler et al. (2000) subjective social status research |
| Politics | 16 original items on two axes (economic left-right, social libertarian-authoritarian) | Standard two-dimensional structure from political psychology; a profile, never graded or included in the composite |

## Synthesis

The dashboard combines domain scores into a radar chart, shows your personality
trait profile separately, and runs a rule-based recommendation engine: each
recommendation is triggered by your actual data and grounded in well-replicated
findings (e.g. zone-2 training for low VO2max, implementation intentions for low
conscientiousness + stalled goals, savings-rate targets, social connection as a
predictor of well-being).

A **composite score** (equal-weighted mean of completed components) gives a
single progress gauge. Personality contributes only through a "personality
assets" subscore — conscientiousness, emotional stability, and honesty-humility,
the aspects with broadly positive outcomes across contexts — while the rest of
the trait profile stays ungraded. A **"You are most like…"** feature matches
your full profile — Big Five traits plus every completed life domain — against
a dataset of **256 deceased historical figures** spanning science, the arts,
sport and exploration, and leadership, each with coarse historiometric
estimates (expert presidential ratings from Rubenzer & Faschingbauer, 2004;
cognitive estimates from Cox, 1926; otherwise documented biography) and a
composite score computed with the same formula as the user's. Clearly labeled
as entertainment with footnotes. Living people are excluded: no published
estimates exist, and inventing them would be fabrication.

The **Potential & plans** page turns the profile forward-looking: pick goals
(earn more, get stronger, improve endurance, build wealth, level up a language)
and get quantified projections — earnings-uplift ranges from a transparent lever
model, strength/VO2max gain ranges from published trainability data, 10-year
compound wealth projections, and FSI-derived language timelines. Every plan
states its evidence basis and is presented as a range, not a promise.

Each module also shows a **breakdown radar** of the sub-dimensions behind its
score (fitness splits into cardio/push/pull/lower/core/power/balance/
flexibility; cognition into battery sections plus memory and speed; and so on),
and fitness renders a **color-coded muscle map** built from the exercises you
log. The dashboard offers a **shareable summary image** (canvas-rendered PNG,
branded geosona.com/profileme) containing only the scores shown on screen —
politics is never included. Profiles can be **exported/imported as JSON**, and
on mobile the navigation collapses behind a menu button.

The dashboard also generates a **"Prompt for AI agents"**: the entire profile —
every result, benchmark rating, grade, and the app's own analysis — serialized
into one prompt with instructions asking an LLM for a summary of the person,
ranked strengths and weaknesses, behavioral predictions, a 5-10 year outlook,
and prioritized advice. One click to copy, paste into any capable AI.

## Running it

No build step, no dependencies. From the repo root:

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000. (A server is needed because the app uses ES
modules; opening `index.html` directly from disk won't work in all browsers.)

## Deploying to GitHub Pages

A workflow (`.github/workflows/pages.yml`) deploys the site on every push to
the default branch — no build step needed since the app is plain static files
with relative paths and hash routing.

One-time setup: in the repo, go to **Settings → Pages** and set **Source** to
**GitHub Actions**. Then re-run the "Deploy to GitHub Pages" workflow from the
Actions tab (or push any commit). The site will be live at
`https://<user>.github.io/profileme/`.

## Roadmap ideas

- Longitudinal tracking (retake assessments, see trends over time)
- Export/import profile as JSON
- Goal setting with progress against benchmarks
- Additional validated instruments (grit scale, PHQ-style well-being screens with
  appropriate care and disclaimers)

## Disclaimers

ProfileMe is a self-improvement tool, not a medical, psychological, or financial
advisory service. Self-administered tests are less reliable than professionally
administered ones. Benchmarks are population approximations. Nothing here is a
diagnosis or professional advice.
