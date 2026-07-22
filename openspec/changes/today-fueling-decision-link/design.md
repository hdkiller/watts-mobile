## Context

Product baseline: first viewport = one decision; glances below primary CTAs. Nutrition tracking already exposes Eco / Steady / Performance via `fuelState` on `GET /api/nutrition`, mapped by `fuelStateLabel`. `NutritionGlance` on Today currently renders **above** the recommendation hero (and Daily Coach Check-In), which crowds the morning path and treats macros as primary.

`nutrition-summary-detail-modals` (active, nearly complete) adds tap-to-explain sheets for calorie/macro targets on Log (optional Today glance wiring). This change must reuse that work, not fork another modal.

## Goals / Non-Goals

**Goals:**

- Put today’s fuel state into the **decision composition** as a compact affordance.
- Move the full nutrition glance below primary CTAs.
- Keep writes Log-first; reuse existing nutrition queries and labels.
- Call out and avoid duplicate work with `nutrition-summary-detail-modals`.

**Non-Goals:**

- Grocery, meal plans, nutrition settings editing, fueling-strategy editor on Today.
- First-viewport calorie/macro dashboard or progress bars beside Accept.
- New nutrition APIs.
- Changing Daily Coach Check-In placement rules beyond not letting Nutrition steal the hero slot.

## Decisions

1. **Compact fuel-state link in decision band**
   - **Choice:** When nutrition tracking is enabled and `fuelState` is 1|2|3, show a single-line / chip affordance under the hero rationale (or planned-only hero): e.g. “Fueling · Steady day” with tap → Log nutrition section (`/(app)/(tabs)/log?section=nutrition`). If macro-explain sheet is already wired for Today from `nutrition-summary-detail-modals`, tapping the chip MAY open calories explain instead of navigating — prefer one clear destination, documented in tasks.
   - **Why:** Answers “does fueling belong to today’s call?” without a macro wall.
   - **Alternatives:** Only relocate NutritionGlance → still no decision-level fuel signal; put fuel chip in glance only → fails the athlete job.

2. **Relocate full NutritionGlance below CTAs**
   - **Choice:** Remove glance from its current pre-hero slot; render after Accept / Rest / primary decision CTAs (with other glances: wellness, load, coming up, etc.).
   - **Why:** Restores one-decision first viewport; matches `today-home` glance rules.

3. **No second design system**
   - **Choice:** Reuse `fuelStateLabel`, existing glance card styles, and explain sheet from nutrition feature module.
   - **Why:** Avoid parallel chrome with Log.

4. **Apply order vs nutrition-summary-detail-modals**
   - **Choice:** Prefer finishing/archiving `nutrition-summary-detail-modals` first (or same PR wave). This change’s tap target SHOULD call the shared sheet when present; otherwise Log navigation is the minimum bar.
   - **Why:** Spec already optional-wired Today glance taps; don’t rebuild explain UI here.

5. **Overlap with recommendation-why-transparency**
   - **Choice:** Detail sheet may show a quiet fuel row as a driver; Today shows the decision chip. Same `fuelState` source; do not put macro tiles in View Details.

## Risks / Trade-offs

- **[First viewport still crowded by Daily Coach Check-In]** → Out of scope to redesign check-in; only fix nutrition placement. Note in open questions if check-in should also move below CTAs later.
- **[Tracking off / no fuel state]** → Omit chip and full glance per existing tracking gates; no empty fuel chrome.
- **[Double nutrition surfaces]** → Chip + post-CTA glance is intentional (decision vs detail); chip must stay one line.

## Migration Plan

- Client layout + small presentational component; no API migration.
- Update Today composition tests / Maestro smoke if they assert Nutrition above hero.
- Rollback = revert layout.

## Open Questions

- Chip tap: always Log vs open calories explain when available — default recommendation: Log for write path; long-press or secondary “Why this target?” only if explain is already on glance tiles.
- Should planned-only / empty Analyze Readiness states also show the fuel chip when tracking is on? Yes when a decision surface is shown (including planned-only); omit on Finish-setup-only incomplete activation.
