## Why

Today already shows Training Load & Form (CTL / ATL / TSB) values, but web’s dashboard glance also shows **trend %** vs the prior ~7 days (e.g. Fitness −8%, Fatigue −29%, Form +29%). Without those indicators, athletes cannot tell at a glance whether fitness/fatigue/form are rising or falling the way they do on web.

## What Changes

- Add **compact ±% trend badges** next to Fitness (CTL), Fatigue (ATL), and Form (TSB) on the Today Training Load & Form glance, matching web `TrendIndicator` semantics (current summary vs mean of PMC series days −8…−1).
- Label tiles closer to web: Fitness **(CTL)**, Fatigue **(ATL)**, Form **(TSB)**; keep TSB signed (`+3`) when positive.
- ATL uses **lower-is-better** coloring; CTL/TSB use **higher-is-better** (same as web).
- Reuse existing `calculateTrend` (or a thin PMC-series helper) and existing PMC payload — **no new API**.
- Keep tapping the glance → Training Load & Form sheet; do not put a PMC chart on the Today tab itself.
- Optional polish: when PMC returns 403 (missing `performance:read`), show a quiet re-auth / Open web cue instead of silently omitting the glance.

## Capabilities

### New Capabilities

- _(none)_ — trends extend the existing glance.

### Modified Capabilities

- `training-load-form`: Glance SHALL show ±% trends when prior PMC series days exist; tile labeling/signing aligned with web dashboard Training Load & Form strip.

## Impact

- **watts-mobile:** `TrainingLoadGlance.tsx`, `mapPmc.ts` / trend helper + unit tests; docs/open-questions.
- **coach-wattz:** none (`GET /api/performance/pmc` already Bearer with `performance:read`).
- **Out of scope:** Performance Scores card, full analytics explorer, 180d/YTD sheet periods (follow-up), embedding load/form inside Athlete Profile on More.
