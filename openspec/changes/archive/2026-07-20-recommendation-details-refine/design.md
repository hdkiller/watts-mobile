## Context

Web dashboard card exposes **View Details** → `RecommendationDetailModal` and **Refine** → `DashboardRefineRecommendationModal` (“Refine or Refresh”). Mobile already loads today via Bearer `GET /api/recommendations/today`, Accept, and Analyze Readiness (`POST /api/recommendations/today` + status poll). The API helper already accepts optional `userFeedback`, but UI only one-taps generate from the empty state. The Today view model keeps short `rationale` / `modificationSummary` and leaves full `analysisJson` on `raw` — detail UI needs a stable mapped shape.

## Goals / Non-Goals

**Goals:**
- Field-readable recommendation breakdown parity with web detail modal
- Refine or Refresh with optional feedback, reusing generate + poll pipeline
- Secondary CTAs that do not steal the Accept primary decision
- Shared generating/quota UX when refine is in flight

**Non-Goals:**
- Recommendations history / pinned inbox
- Score-explanation / chain-of-thought UI
- Auto-analyze settings
- Ad-hoc workout generation (separate change)
- Porting web check-in store questions into the detail sheet if Active Recovery + Log already cover context (optional thin “Today’s check-in” line only if data is already on-device)

## Decisions

1. **Presentation: bottom sheet / modal route, not a full tab**  
   Match other Today sheets (Training Load, Wellness Overview). Title: “Today’s Training Recommendation”. Close + Accept Changes in footer when `canAccept`.  
   *Alternative:* stack screen — heavier; deep-link can still open the same sheet.

2. **Data: extend mapper with `RecommendationDetailViewModel`**  
   Map from today payload / `raw.analysisJson`: `key_factors`, `planned_workout` (original title/duration/TSS), `suggested_modifications` (title/duration/TSS/description), full `reasoning`, action + confidence. Recovery Context section reuses Active Recovery Context items already fetched for Today (same chips/source badges), not a second API.  
   *Alternative:* render from `raw` in the sheet — rejected; keep mapper boundary.

3. **CTAs on hero: View Details (secondary) + Refine (secondary/emphasized)**  
   Place beside Discuss with Coach when a recommendation exists. Refine opens feedback sheet; View Details opens breakdown. Do not require opening details to refine.  
   *Alternative:* details-only entry that contains Refine — worse discoverability vs web’s two buttons.

4. **Refine submit = existing generate mutation**  
   Trimmed feedback → `userFeedback` string; empty/whitespace → `POST` with `{}` (refresh). Reuse Analyze Readiness poll (`GET /api/recommendations/status` + refetch today), timeout, and 429 quota panel. Button label: “Refine Plan” vs “Refresh Data” based on non-empty feedback (web copy).  
   *Alternative:* separate regenerate endpoint — none exists; wrong.

5. **Accept from detail sheet**  
   Same `acceptRecommendation(id)` mutation as hero Accept; close sheet on success; invalidate today. Suggested Changes block only when mods exist.

6. **Confidence in detail**  
   Show percent string in the detail sheet (web parity). Hero keeps the compact non-textual confidence indicator from recommendation-hero-states — no change there.

7. **coach-wattz dependency**  
   Prefer no backend work if Bearer GET already returns full `analysisJson`. If fields are stripped for mobile, restore them. No new refine endpoint.

## Risks / Trade-offs

- **[Risk] Long reasoning / many factors crowd the sheet** → Mitigation: scrollable body; keep hero rationale short.
- **[Risk] Refine while Accept pending confuses state** → Mitigation: disable Refine/Accept while generating; clear copy (“Updating plan…”).
- **[Risk] Recovery Context empty in sheet but band has chips** → Mitigation: share the same Active Recovery query source.
- **[Risk] Double-generate from empty Analyze + Refine** → Mitigation: single in-flight generate flag across Today.

## Migration Plan

1. Confirm today GET payload includes detail fields on a real account.
2. Mapper + detail sheet + refine sheet; wire secondary CTAs.
3. Reuse generate poll path for refine; update specs/docs.
4. Rollback: hide View Details / Refine; Analyze Readiness unchanged.

## Open Questions

- Whether deep link `/recommendations/:id` opens the detail sheet vs only Today hero.
- Whether “Today’s check-in” summary is required in v1 or deferred to Log/Active Recovery.
- Exact secondary-button visual weight (web: View Details outline, Refine brand fill).
