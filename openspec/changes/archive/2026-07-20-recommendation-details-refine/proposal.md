## Why

Today’s recommendation hero shows a short rationale and Accept, but athletes cannot open the web’s **Today’s Training Recommendation** breakdown (Why?, Recovery Context, Key Factors, Original Plan / Suggested Changes) or **Refine or Refresh** with optional feedback. Analyze Readiness already posts `userFeedback` on the empty state; once a recommendation exists, mobile still has no View Details or Refine parity with the dashboard card.

## What Changes

- Add a **View Details** secondary action on the recommendation hero that opens a sheet/modal mirroring web’s `RecommendationDetailModal`: action badge, confidence, Why? (`reasoning`), Recovery Context (reuse Active Recovery items when available), Key Factors, Original Plan, Suggested Changes, and Accept Changes when mods exist and not yet accepted.
- Add a **Refine** secondary action that opens a **Refine or Refresh** sheet: optional feedback textarea; empty → refresh with latest data; non-empty → refine plan. Submit reuses `POST /api/recommendations/today` with `{ userFeedback }` and the existing generate/status polling UX.
- Map additional `analysisJson` fields (`key_factors`, `planned_workout`, `suggested_modifications` duration/TSS, etc.) into the Today view model (or a detail-specific mapper) so the sheet does not scrape raw API shapes in UI.
- Keep the first viewport decision-focused: View Details / Refine sit with secondary CTAs (alongside Discuss with Coach), not as new hero chrome.
- **coach-wattz:** no new endpoints expected if Bearer generate + today GET already ship the full recommendation payload; confirm `analysisJson` fields are present on mobile GET. Detail Accept uses existing `POST /api/recommendations/{id}/accept`.

## Capabilities

### New Capabilities

- `recommendation-detail`: In-depth Today’s Training Recommendation sheet opened from View Details, including Why?, recovery/check-in context, key factors, original plan, suggested changes, and Accept Changes when applicable.
- `recommendation-refine`: Refine or Refresh sheet — optional athlete feedback, refresh-vs-refine CTA label, wired to existing generate mutation + polling/quota handling.

### Modified Capabilities

- `today-home`: When a recommendation is present, Today SHALL offer View Details and Refine secondary actions (in addition to Discuss with Coach / Accept).
- `today-data`: Extend the Today view model / mapper for detail fields used by the recommendation detail sheet; refine reuses generate mutation with optional `userFeedback`.
- `recommendation-actions`: Clarify Refine/Refresh regenerates the recommendation (same path as Analyze Readiness) and does not replace Accept; Accept from the detail sheet uses the same accept mutation.
- `analyze-readiness`: Generating/quota/error patterns MAY be shared when Refine/Refresh is in flight (same job family).

## Impact

- **watts-mobile:** `app/(app)/(tabs)/today/`, `src/features/today/` (mapper, sheets, CTAs), possibly deep-link `recommendations/:id` → detail sheet.
- **coach-wattz:** Verify Bearer `GET/POST /api/recommendations/today` payloads include detail fields; no new product surface beyond what web already exposes.
- **Out of scope:** Full recommendations history inbox, score-explanation chain, auto-analyze settings, inventing Modify alternatives, Daily Coach Check-In questionnaire, ad-hoc workout generation (separate change).
