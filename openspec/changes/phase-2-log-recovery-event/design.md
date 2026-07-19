## Context

Web UI: `RecoveryContextSlideover` (“Log recovery event”) on dashboard Today, Recovery, Fitness, Nutrition.  
Mobile Log today: wellness-only (`src/features/log`).  
Server: journey CRUD under `/api/recovery-context/journey*` with Bearer scopes already in place.

## Goals / Non-Goals

**Goals:**
- Field-parity create flow for manual recovery/journey events
- Surface active-today context so athletes see what Coach Watts already knows
- Keep wellness check-in intact as a distinct form
- Prefer coach-wattz taxonomy (categories/eventTypes) over inventing mobile-only enums

**Non-Goals:**
- Porting the full Recovery page timeline / filters
- Editing imported wellness periods (read-only on web)
- Daily check-in question editor (separate from journey events; wellness form remains)
- Soft offline queue for journey events (defer with wellness offline hardening)

## Decisions

1. **Two jobs on Log**  
   - Section A: Daily wellness (existing)  
   - Section B: Recovery events — active chips + “Log event”  
   Avoid a single mega-form.

2. **Match web option map** (labels + mapped `category` / `eventType`):  
   Illness → `FATIGUE` + `WELLNESS_CHECK`  
   Injury → `MUSCLE_PAIN` + `SYMPTOM`  
   Fatigue → `FATIGUE` + `SYMPTOM`  
   Poor sleep → `SLEEP` + `WELLNESS_CHECK`  
   Mood/stress → `MOOD` + `WELLNESS_CHECK`  
   GI → `GI_DISTRESS` + `SYMPTOM`  
   Cramping → `CRAMPING` + `SYMPTOM`  
   Dizziness → `DIZZINESS` + `SYMPTOM`  
   Hunger → `HUNGER` + `SYMPTOM`  
   General note → `FATIGUE` + `RECOVERY_NOTE`  

3. **Severity** — Mild=3, Moderate=6, Severe=9 (same as web presets); API still accepts 1–10.

4. **Time presets** — Now / Earlier today / Yesterday / Custom (`datetime`).

5. **Today CTA** — Small “Log event” near recovery strip that navigates to Log’s recovery section (or a stack screen). Must remain secondary to Accept/Modify/Rest.

6. **List scope** — Load `GET /api/recovery-context?days=7` (or similar short window); emphasize `activeToday`-equivalent client filter. Imported items display read-only.

7. **Edit/delete** — Manual `journey_event` items only when API marks editable/deletable (mirror web flags).

## Risks / Trade-offs

- [Log tab gets busy] → Clear section headers; recovery create can be a stack/modal rather than inline sprawl.
- [Option map drift vs web] → Keep a single mapped constant table; comment to sync with `RecoveryContextSlideover`.
- [Description length] → Enforce max 500 client-side to match Zod.

## Open Questions

- Exact UX: inline Log sections vs dedicated `/log/recovery` stack (lean: stack/sheet for create to keep Log scannable)
- Whether Today should show active recovery chips (read-only) in this change or only the CTA (lean: chips if strip already exists and data is cheap)
