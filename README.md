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
| Cardio fitness | Cooper 12-minute run → VO2max, or resting heart rate | Cooper (1968); ACSM-style age/sex ratings |
| Strength | Push-ups, plank, optional bodyweight-relative lifts | Common strength-standard benchmarks |
| Finances | Savings rate, emergency fund, debt-to-income, net worth vs. age | Standard personal-finance metrics |
| Cognition | 28-item ability battery (verbal, series, matrix reasoning) + digit span + reaction time | ICAR-format items (Condon & Revelle, 2014); reported as an estimated range with provisional norms |
| Career & education | Structured self-report (education, experience, satisfaction, learning, network) | Heuristic, labeled as such |
| Languages | CEFR self-assessment per language | Council of Europe CEFR framework |
| Relationships | UCLA-3 loneliness scale + social contact frequency | Hughes et al. (2004) short loneliness scale |

## Synthesis

The dashboard combines domain scores into a radar chart, shows your personality
trait profile separately, and runs a rule-based recommendation engine: each
recommendation is triggered by your actual data and grounded in well-replicated
findings (e.g. zone-2 training for low VO2max, implementation intentions for low
conscientiousness + stalled goals, savings-rate targets, social connection as a
predictor of well-being).

The **Potential & plans** page turns the profile forward-looking: pick goals
(earn more, get stronger, improve endurance, build wealth, level up a language)
and get quantified projections — earnings-uplift ranges from a transparent lever
model, strength/VO2max gain ranges from published trainability data, 10-year
compound wealth projections, and FSI-derived language timelines. Every plan
states its evidence basis and is presented as a range, not a promise.

## Running it

No build step, no dependencies. From the repo root:

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000. (A server is needed because the app uses ES
modules; opening `index.html` directly from disk won't work in all browsers.)

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
