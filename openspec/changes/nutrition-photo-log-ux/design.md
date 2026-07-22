## Context

`LogMealSheet` already supports camera capture → `estimatePhotoNutrition` → silent form prefill (`showMacros`, small `photoNotice`) → Save → immediate `onClose`. Athletes report missing the filled values and getting no post-save sense of day progress even though `NutritionTargetsCard` and Log totals exist. APIs are proven; this change is presentation-state UX inside the existing Log meal sheet.

## Goals / Non-Goals

**Goals:**
- Make photo estimate a clear **review** step (mode change, not quiet prefill).
- Keep name/macros/meal editable before commit.
- After successful save, show **updated day nutrition** as positive, factual feedback before dismiss.
- Reuse `POST /api/nutrition/estimate-photo`, `POST /api/nutrition`, and refreshed `GET /api/nutrition` day data.

**Non-Goals:**
- New backend endpoints or model changes.
- Auto-save without confirm.
- Redesigning Coach chat photo attach / tool logging.
- Meal planning, grocery, or fueling-plan generation on device.
- Gamified celebrations (confetti, streaks, badges).

## Decisions

### 1. Sheet modes instead of a new route
**Decision:** Keep a single `LogMealSheet` modal with explicit UI modes: `compose` | `analyzing` | `review` | `logged`.  
**Why:** Avoids stack navigation churn after camera; matches current Log quick-action pattern.  
**Alternatives:** Full-screen wizard route (heavier); toast-only success (still easy to miss progress).

### 2. Review card owns the middle of the sheet
**Decision:** On estimate success, switch to `review`: photo thumbnail, editable name, always-visible calories/macros, meal slot, confidence when present, primary **Save meal**, secondary **Retake**. Demote or collapse the targets/history chrome so the estimate is the focal plane.  
**Why:** Addresses “I didn’t notice fields filled.”  
**Alternatives:** Highlight existing inputs only (weaker); separate confirm dialog (extra tap, loses edit context).

### 3. Analyzing is a full-sheet state
**Decision:** After camera returns with an image, show analyzing UI (thumbnail + spinner/copy) until estimate resolves or errors.  
**Why:** Prevents interacting with a half-stale compose form during the AI round-trip.

### 4. Post-save “Logged” beat with day progress
**Decision:** On successful `POST /api/nutrition`, invalidate/refetch day nutrition, enter `logged` mode showing confirmation + updated `NutritionTargetsCard` (or equivalent progress summary) + **Done** (optional short auto-dismiss). Apply to photo **and** manual saves from this sheet so feedback is consistent.  
**Why:** Closes the loop: action → day moved.  
**Alternatives:** Close immediately and hope Log glance updates (current); banner on Log only (weaker coupling to the action).

### 5. Tone: factual progress, not cheerleading
**Decision:** Copy stays useful (“Logged · {name}”, “1,840 / 2,400 kcal”). Soft on-track / over-target notes allowed; no scolding or hype.  
**Why:** Matches Coach Watts field companion voice.

### 6. Coach photo path stays
**Decision:** Do not remove Coach attach from other nutrition surfaces; in-sheet estimate remains the primary Log Meal photo path.  
**Why:** Spec already allows Coach photo; this change improves the sheet path without collapsing both into one.

### 7. Client-only; no API contract change
**Decision:** Consume existing estimate payload (`name`, macros, `meal`, `confidence`). Show confidence when present; omit when absent. Keep local URI/base64 for thumbnail for the session only (do not upload meal photos for logging unless already done elsewhere).  
**Why:** Zero backend dependency for this UX pass.

## Risks / Trade-offs

- **[Risk] Sheet mode complexity / state bugs** → Mitigation: small explicit mode enum; reset all modes when sheet closes/opens.
- **[Risk] Day totals lag after save** → Mitigation: await mutation + invalidate; show loading on progress card in `logged` if refetch pending; fall back to optimistic totals from previous day + logged item if needed.
- **[Risk] Large base64 in memory** → Mitigation: keep one asset for thumbnail; clear on dismiss/retake.
- **[Risk] Dual photo mental models (sheet vs Coach)** → Mitigation: Log Meal CTA copy stays “Photo estimate”; Coach path remains secondary elsewhere.
- **[Trade-off] Extra tap (Done) after save** → Acceptable; optional auto-dismiss after ~1.5s still shows the progress beat.

## Migration Plan

- Ship as client-only UI change; no feature flag required unless preferred for staged TestFlight.
- Rollback = revert mobile PR; server unchanged.

## Open Questions

- Auto-dismiss timing for `logged` vs Done-only (default: Done + ~1.5s auto-dismiss when totals ready).
- Whether hydration quick-add should get the same post-save progress beat in a later change (out of scope here).
