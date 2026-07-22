## 1. Preconditions / overlap

- [ ] 1.1 Confirm `nutrition-summary-detail-modals` status (prefer complete/archive before or with this change); note whether Today glance already opens the shared explain sheet
- [ ] 1.2 Decide chip tap destination for this change: Log nutrition (minimum) vs shared calories explain when available — record in code comment / PR

## 2. Decision-band fuel link

- [ ] 2.1 Add compact fuel-state chip/row component reusing `fuelStateLabel` + `useTodayNutritionQuery` / profile tracking gate
- [ ] 2.2 Place it in Today decision composition under recommendation hero and planned-only hero (omit on Finish setup / tracking off / unknown fuel state)
- [ ] 2.3 Wire tap to Log `?section=nutrition` or shared explain sheet per 1.2 — no inline meal form on Today

## 3. Glance placement

- [ ] 3.1 Move full `NutritionGlance` from above the hero to below primary decision CTAs
- [ ] 3.2 Confirm first viewport no longer shows calorie/macro wall before Accept / Rest
- [ ] 3.3 Keep glance omitted when tracking off or Finish setup showing

## 4. Verification

- [ ] 4.1 Smoke Today with tracking on: chip visible, glance below CTAs, tap opens intended destination
- [ ] 4.2 Smoke tracking off / incomplete activation: no fuel chrome
- [ ] 4.3 Align with `recommendation-why-transparency` if both applied: one fuel vocabulary, no duplicate macro UI in View Details
