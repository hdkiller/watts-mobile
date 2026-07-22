## Why

Athletes decide whether to trust today’s call from a short hero rationale, but the View Details sheet still under-explains *which inputs drove the call* — especially when sleep, HRV, load, recovery context, or fuel context are thin or missing. Without plain-language drivers and honest gaps, Refine / Discuss with Coach feels opaque even though the payload already carries more than we show.

## What Changes

- Extend the recommendation detail sheet so “why” includes a plain-language **What drove this** section built from existing recommendation fields (`reasoning`, `analysisJson.key_factors`, `analysisJson.recovery_analysis`, Active Recovery Context already shown).
- Show honest **missing / thin data** states when driver inputs are absent (no invented metrics, no medical claims, no raw chain-of-thought).
- Keep Recent Wellness as the source of device biometrics; do **not** reintroduce an AI Sleep/HRV strip on Today or present `recovery_analysis` labels as live device readings.
- Optionally surface today’s fuel state as a quiet context row in the detail sheet when nutrition tracking is on and fuel state is known — without turning the sheet into a nutrition dashboard (composition with `today-fueling-decision-link`).
- No new recommendation generate/accept APIs. If structured driver objects beyond today’s `key_factors` + `recovery_analysis` are desired later, document that as a coach-wattz dependency rather than inventing fields.

## Capabilities

### New Capabilities

_None._ Prefer extending existing recommendation detail mapping over inventing a parallel “explain” capability.

### Modified Capabilities

- `recommendation-detail`: Detail sheet SHALL present a drivers / inputs section with honest missing-data states, using existing analysis payload fields; MUST NOT dump raw model traces or claim clinical diagnosis.
- `today-data` (light): Mapping for detail view MAY expose typed recovery-analysis / driver rows for the sheet (no change to Today fetch contract).

## Impact

- **Mobile UI**: `RecommendationDetailSheet`, detail view-model in `src/features/today/types.ts` / `mapRecommendationDetail`.
- **Data**: Existing `GET /api/recommendations/today` payload — `reasoning`, `analysisJson.key_factors`, `analysisJson.recovery_analysis` (already typed on mobile but only partially used for the retired AI glance strip).
- **coach-wattz**: No required API change for v1 of this change. Optional later dependency: structured driver list with availability flags if free-text `key_factors` proves too noisy.
- **Overlap**: Complements `today-fueling-decision-link` (Today composition); does not replace nutrition explain modals (`nutrition-summary-detail-modals`).
- **Non-goals**: Medical claims, raw CoT, dashboard of all wellness metrics inside the sheet, inventing load/CTL numbers not in the payload.
