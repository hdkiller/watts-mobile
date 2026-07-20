## Context

Web’s **Wellness Overview** (`coach-wattz/app/components/WellnessModal.vue`) opens from dashboard wellness tiles and shows: key metrics with trend indicators, optional AI analysis, 7-day bar trends, a coach recommendation cue, and editable subjective logs.

Mobile already has (or is shipping via `today-wellness-glance`) a compact Recent Wellness glance (Sleep / HRV / RHR + trend %). Interaction today is Check in → Log; inline 7-day expand was specified but is a weak stand-in for the web explain surface. Athletes expect tap → overview.

Constraints: companion is not a full web port; Today stays recommendation-first; Log owns wellness writes; `health:read` already covers `GET /api/wellness/{date}`.

## Goals / Non-Goals

**Goals:**

1. Tap Recent Wellness glance (tiles / row, not Check in) opens a read-only **Wellness Overview** sheet.
2. Sheet shows date, stale warning when not today, key metrics present on that day (beyond glance trio when available), and **7-day trend bars** for Sleep / HRV / RHR (and Recovery when series exists).
3. Surface a short coaching cue when the wellness payload already includes AI recommendation text or when a cheap client heuristic matches web’s non-AI fallback — without triggering analyze jobs.
4. Distinct Check in → Log; optional Open web to the instance wellness/fitness day.
5. Replace inline expand-on-Today for trends with sheet-hosted trends.

**Non-Goals:**

- AI Analyze / Regenerate (`POST /api/wellness/analyze`), background job polling.
- PATCH editable mood/stress/fatigue/soreness/custom fields from the sheet.
- Metric visibility settings, Garmin logo chrome, SpO2/BP deep stacks unless already on the day payload (show if present; do not chase missing sensors).
- New BFF endpoint.

## Decisions

### 1. Presentation: page sheet modal

**Decision:** Use React Native `Modal` with `presentationStyle="pageSheet"` (same pattern as `RoomListSheet`) titled “Wellness Overview”. Not a stack route for v1 — keeps Today context and matches web modal mental model.

**Alternative:** Expo Router modal route `/(app)/wellness-overview`. Rejected for v1 to avoid deep-link/back-stack complexity; revisit if sheet content grows.

### 2. Data: wellness day detail + trends from one GET

| Need | Endpoint | Scope |
|------|----------|--------|
| Day metrics + per-metric trends (`history`, avg7, …) + AI fields if present | `GET /api/wellness/{date}` (YYYY-MM-DD of `latestWellnessDate` or local today) | `health:read` |
| Glance tiles (unchanged) | `GET /api/profile/dashboard` + `GET /api/wellness/trend` | `profile:read` / `health:read` |

**Decision:** Overview query is lazy — fetch when the sheet opens (TanStack Query, keyed by date). Prefetch on glance press-in is optional. Prefer server `trends` on the wellness GET for bar charts (web modal path) rather than re-deriving solely from `/wellness/trend`.

### 3. Metric set in the sheet

**Decision (locked):** Show tiles for any non-null among: HRV, Sleep (hrs), RHR, Recovery %, Readiness, Weight, Stress, Mood (and SpO2 / BP if present). Omit nulls. Glance on Today remains Sleep / HRV / RHR only.

### 4. Trends in sheet, not inline on Today

**Decision (locked):** Supersede `today-wellness-glance` inline expand. Glance row tap → open sheet. Check in stays a separate text/button target that must not open the sheet.

**Alternative:** Keep both inline expand and sheet. Rejected — two trend UIs confuse and bloat Today.

### 5. Coaching cue (read-only)

**Decision:** If wellness response includes completed AI executive summary or first recommendation string, show a compact “Coach note” card. Else show web-style heuristic recommendation text when recovery/HRV/sleep/RHR inputs allow (port minimal logic from `WellnessModal`’s `getTrainingRecommendation`). No “Analyze with AI” CTA.

### 6. Writes and escapes

**Decision:** Sheet is read-only. Footer actions: **Check in** (Log tab) and **Open web** (instance URL to wellness/fitness day when a stable path exists; otherwise dashboard `?focus=wellness`).

### 7. Relationship to `today-wellness-glance`

**Decision:** This change depends on the glance tiles existing. Implementation order: finish glance data/UI if still incomplete, skip tasks 3.x (inline bars) from that change, wire overview instead. Specs here MODIFY the glance interaction requirement.

## Risks / Trade-offs

- **[Larger metric surface vs companion density]** → Sheet only; Today stays 3 tiles.
- **[AI fields often empty]** → Heuristic cue + honest omit when neither exists.
- **[Date selection]** → v1 opens latest wellness date only; no full calendar day picker (follow-up).
- **[Duplicate trend sources]** → Prefer wellness GET `trends` in sheet; glance keeps its own trend % math.

## Migration Plan

1. Add wellness-by-date client + mappers/tests.
2. Build `WellnessOverviewSheet` (metrics + bars + cue + actions).
3. Wire glance press → sheet; remove/skip inline expand.
4. Update open-questions; note supersession of inline bars.
5. Rollback: hide sheet wiring; glance remains read-only tiles + Check in.

## Open Questions

1. Exact Open web path for a wellness day on self-hosted instances (confirm `/fitness/{id}` vs dashboard focus) — resolve against coach-wattz routes during implement.
2. Whether Recovery % gets a 7-day bar in v1 when `trends.recoveryScore.history` exists — default **yes** if series non-empty.
