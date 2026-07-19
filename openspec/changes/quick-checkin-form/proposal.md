# Quick Check-in Form

## Why

The morning check-in (docs/issues/006.md) is the core of the "<30s morning path" interaction principle, but readiness (1–10) and sleep quality (1–5) are keyboard text inputs, save feedback is easy to miss, and the weight unit is hard-coded "kg". The highest-friction step of the daily loop should be thumb-only.

## What Changes

- Readiness and sleep-quality fields become tappable number-chip rows (no keyboard); sleep hours gets a stepper alongside numeric entry.
- Save button label becomes "Update check-in" when today's wellness prefilled the form; success renders as a visible confirmation (button morph to checkmark or toast) instead of a small text line below the fold.
- Weight field label/placeholder uses the athlete profile's unit when available, falling back to kg.
- Payload, validation, and API contract are unchanged (`POST /api/wellness`).

No coach-wattz backend changes; unit read uses the existing profile query (`GET /api/profile`).

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `log-checkin`: form-input requirement changes — scale fields SHALL be tap-selectable without a keyboard; save affordance SHALL reflect create-vs-update and confirm success visibly; weight SHALL display in the athlete's profile unit.

## Impact

- `app/(app)/(tabs)/log.tsx` — replace `Field` usage for readiness/sleep quality with chip rows; save-state UI.
- `src/features/log/mapLogForm.ts` (+ tests) — unchanged payload mapping; possible helper for chip values.
- `src/features/profile/mapProfile.ts` — expose weight unit if present in profile payload.
- Follows `docs/DESIGN.md` (chip styling mirrors recovery-event time presets).
