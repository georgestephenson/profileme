# ProfileMe

**Profile everything about yourself. Synthesize it. Get evidence-based strategies for improvement.**

ProfileMe is a privacy-first personal profiling app. You complete assessments across
the major domains of life — personality, fitness, finances, cognition, career,
languages, relationships — and the app synthesizes the results into a single
dashboard with analysis and science-informed recommendations.

## Principles

1. **Scientifically honest.** Where a validated, public-domain instrument exists, we
   use it (e.g. the IPIP Big Five markers, Cooper test VO2max estimation, UCLA-3
   loneliness scale). Where it doesn't, we say so plainly rather than inventing
   pseudoscience — for example, we do **not** claim to measure IQ, because valid IQ
   tests (WAIS, Stanford-Binet) are proprietary and must be professionally
   administered. Our cognition module measures working memory and reaction time and
   is labeled as exactly that.
2. **Privacy-first.** Everything runs in your browser. All data is stored in
   `localStorage` on your device. Nothing is ever sent to a server.
3. **Traits are not grades.** Personality is reported as a trait profile, not a
   score — there is no "good" or "bad" Big Five result. Domains where more genuinely
   is better (cardio fitness, savings rate) are scored and benchmarked against
   published norms.

## Domains

| Domain | Instrument / method | Basis |
|---|---|---|
| Personality | IPIP 50-item Big Five factor markers | Public-domain (Goldberg, ipip.ori.org), extensively validated |
| Cardio fitness | Cooper 12-minute run → VO2max, or resting heart rate | Cooper (1968); ACSM-style age/sex ratings |
| Strength | Push-ups, plank, optional bodyweight-relative lifts | Common strength-standard benchmarks |
| Finances | Savings rate, emergency fund, debt-to-income, net worth vs. age | Standard personal-finance metrics |
| Cognition | Digit span (working memory), simple reaction time | Classic cognitive psychology tasks — explicitly *not* an IQ test |
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
