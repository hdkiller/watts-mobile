## Context

Today already shows action + short rationale on the hero, and View Details opens `RecommendationDetailSheet` with Why (`reasoning`), Recovery Context (active items), Key Factors (`analysisJson.key_factors`), Original Plan, and Suggested Changes — mirroring web `RecommendationDetailModal.vue`.

The recommendation payload from coach-wattz `recommend-today-activity` also includes `analysisJson.recovery_analysis` (`hrv_status`, `sleep_quality`, `fatigue_level`, `readiness_score`). Mobile already types and maps those fields into the old AI recovery strip via `mapRecoveryStrip`, but `today-home` correctly forbids presenting that strip as device biometrics once Recent Wellness exists. The detail sheet never surfaces recovery_analysis as “inputs that informed this call,” so thin-data mornings look unexplained.

## Goals / Non-Goals

**Goals:**

- Make View Details answer: what drove today’s call, in plain language.
- Honest empty/missing states when key_factors / recovery_analysis / reasoning pieces are absent.
- Reuse existing Bearer today recommendation payload only for v1.
- Keep clear separation: Recent Wellness = device metrics; recommendation drivers = coaching inputs / AI labels from this recommendation.

**Non-Goals:**

- New structured driver API (optional later coach-wattz work).
- Medical/diagnostic claims; raw chain-of-thought or prompt dumps.
- Reintroducing Sleep/HRV tiles on the Today hero from `analysisJson`.
- Porting web MacroExplain or nutrition target math into this sheet (owned by `nutrition-summary-detail-modals`).
- Changing Accept / Refine / Rest mutation behavior.

## Decisions

1. **Client-side driver rows from existing fields (no new endpoint)**
   - **Choice:** Build a small mapper (e.g. `mapRecommendationDrivers`) that yields ordered plain-language rows from:
     - `recovery_analysis` labels when present (Sleep quality, HRV status, Fatigue, Readiness) — labeled as recommendation inputs, not live biometrics
     - `key_factors` strings (dedupe against recovery_analysis text when obviously overlapping)
     - optional quiet fuel-state row when nutrition tracking is on and today’s fuel state is known (shared source as `today-fueling-decision-link`)
   - **Why:** Payload already has these; web detail modal does not yet elevate recovery_analysis either — mobile can lead without blocking on backend.
   - **Alternatives:** Wait for structured drivers API → delays trust UX; show raw JSON → violates product tone.

2. **Keep Why? + Drivers as sibling sections**
   - **Choice:** Retain narrative `Why?` (`reasoning`); add **What drove this** below it (or rename Key Factors into that section when factors exist). Prefer one drivers list over both “Key Factors” and a duplicate drivers block.
   - **Why:** Avoid double lists of the same bullets; `key_factors` become the free-text part of drivers.

3. **Missing-data honesty**
   - **Choice:** If neither recovery_analysis fields nor key_factors are present, show a short empty line (“Limited inputs for this recommendation”) rather than hiding the section entirely when reasoning exists. If reasoning is also empty, keep current sparse sheet.
   - **Why:** Trust comes from acknowledging thin data (activation / soft-activated athletes).

4. **No medical framing**
   - **Choice:** Copy stays coaching-tone (“inputs Coach Watts used”); never “diagnosed,” “unsafe,” or clinical severity language beyond server-provided labels shown as-is (or lightly titled).
   - **Why:** Store/privacy + product baseline.

5. **coach-wattz dependency (optional follow-up)**
   - If free-text `key_factors` remain too noisy, request structured `{ id, label, availability: present|missing|thin }` drivers on the recommendation payload. Not required to ship this change.

## Risks / Trade-offs

- **[recovery_analysis labels ≠ Recent Wellness values]** → Explicit section helper: “From this recommendation’s inputs” so athletes don’t confuse AI labels with device glance.
- **[Duplicate Key Factors vs Drivers]** → Collapse into one section in UI; migrate copy from “Key Factors” to “What drove this.”
- **[Overlap with fueling decision link]** → Detail sheet may show a quiet fuel row; Today hero shows the compact decision chip. Same data source; different surfaces.
- **[Over-promising transparency]** → Do not invent load/CTL/fuel drivers not in the payload.

## Migration Plan

- Pure client UI/mapper change behind existing View Details entry.
- Update unit tests for `mapRecommendationDetail` / new driver mapper.
- No schema migration; rollback = revert client.

## Open Questions

- Should Daily Coach Check-In summary appear in drivers when available (web modal has “Today’s check-in”)? Prefer yes if a Bearer summary is already cheap on Today; otherwise defer — do not add a blocking fetch.
- Exact section title copy: “What drove this” vs “Key inputs” — pick during UI pass; keep non-clinical.
