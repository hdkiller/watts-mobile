# Design — Quick Check-in Form

## Context

`app/(app)/(tabs)/log.tsx` renders five `Field` text inputs. Readiness and sleep quality are small bounded scales entered via number pad; `formFromWellness` prefills from today's record, `toWellnessPayload` builds the write. The recovery-event screen already has a chip-row pattern (time presets) to mirror.

## Goals / Non-Goals

**Goals:**
- Complete a typical check-in (readiness + sleep) with taps only, no keyboard.
- Make save state legible: create vs update, success confirmation visible where the user is looking.
- Correct weight unit display.

**Non-Goals:**
- No payload/API changes; `LogFormValues` stays string-based so `mapLogForm` and its tests keep working.
- No HealthKit prefill (issue 025) and no notes/weight redesign — text stays text.
- No new dependencies (no slider/toast libraries).

## Decisions

1. **Chips over sliders.** A row of tappable number chips (1–10 readiness; 1–5 sleep quality) mirrors the existing recovery-event preset pattern and is more precise than a slider at these ranges. Selected chip: `border-brand bg-brand/10 text-brand`; tapping the selected chip clears it (fields stay optional). Readiness wraps to two rows of five on narrow widths.
2. **Keep form state as strings.** Chips write `'7'` into the existing `LogFormValues` — zero change to validation, payload mapping, or tests. Alternative (numeric state) rejected as churn without benefit.
3. **Save affordance.** Label is "Update check-in" when `formFromWellness` hydrated any field, else "Save check-in". On success, the button renders a checkmark + "Saved" state for ~2s (local state timer) before returning to the label; the small text line goes away. Alternative (toast) rejected — no toast primitive exists and the button is already in view when pressed.
4. **Sleep hours stepper.** Keep the decimal text input but add −/+ 0.5h steppers beside it; typing remains for odd values.
5. **Weight unit from profile.** `mapProfile` exposes `weightUnit` when the payload provides one (fallback `'kg'`); label reads "Weight (kg)" / "Weight (lb)". Payload continues to send the raw number — unit conversion is out of scope and noted in the field copy if the unit is not kg.

## Risks / Trade-offs

- [Chip rows lengthen the form] → Chips are dense (min-w ~40pt, wrap); net height gain is small and the keyboard no longer covers the form.
- [Profile payload may not include a unit] → Fallback to kg preserves current behavior; verify against coach-wattz profile response before relying on it.

## Open Questions

- Does `GET /api/profile` expose a preferred weight unit today? If not, ship with kg fallback and file a coach-wattz request.
