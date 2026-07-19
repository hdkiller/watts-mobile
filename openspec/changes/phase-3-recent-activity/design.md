## Context

`GET /api/workouts` already supports Bearer `workout:read` with limit/offset. `GET /api/planned-workouts` supports Bearer `workout:read` with `startDate` / `endDate` / `limit` and is documented as upcoming planned. Product baseline calls for a lite recent list plus a capped upcoming list — not a calendar. Today should stay a morning decision surface.

Existing `app/(app)/planned/[id].tsx` is thin (title, duration, TSS, description). Direction pass requires richer structure summary when the API provides intervals/steps.

## Goals / Non-Goals

**Goals:**
- Show last N completed workouts (small cap, e.g. 5–10) with honest status
- Show next N planned workouts (e.g. 7–14 day window) from More
- Lite completed summary + richer planned detail; deep analysis opens web
- Entry from More without crowding Today’s first viewport

**Non-Goals:**
- Full calendar / CTL charts / explorer
- Editing or rescheduling planned workouts
- New mobile-only workouts API
- Fifth tab

## Decisions

1. **Compose from existing list APIs** — `GET /api/workouts?limit=` and `GET /api/planned-workouts?startDate=&endDate=&limit=`; no BFF required for lists.
2. **Primary entry: More → Recent activity and More → Upcoming**; optional Today “next up” teaser only if space remains after recommendation + planned + recovery.
3. **Status mapping (recent)** — present server-provided sync/analysis fields when present; otherwise neutral “Uploaded” / “Processing…” / “Ready” copy without inventing analytics.
4. **Completed detail** — stack screen with title, date, duration, load/TSS if present; CTA “Open in Coach Watts” for depth.
5. **Planned detail** — deepen mapper/UI: when structure/intervals exist, show a compact step list (name, duration, intensity targets if present); otherwise keep description + Open web. coach-wattz must Bearer-enable detail if still session-only.
6. **Feature module** — `src/features/activity/` owns recent list + activity summary; planned list fetch may live there or reuse `src/features/today` planned helpers — prefer one workouts-glance module to avoid split ownership.

## Risks / Trade-offs

- [Sparse status fields] → Prefer honest unknowns over fake progress bars.
- [Large payloads] → Strict low `limit`; no infinite scroll in v1.
- [Planned detail session-only] → Block richer detail until coach-wattz `requireAuth` + `workout:read`; list can ship first.
- [Thin structure DTO] → Show what we get; document gap rather than inventing interval UI from description text.

## Open Questions

- ~~Exact workout DTO fields for analysis/sync status~~ → Resolved: `aiAnalysisStatus` on list; no workout `syncStatus` on list DTO (see [api-findings.md](./api-findings.md))
- ~~Whether planned detail returns interval structure or needs a secondary endpoint~~ → Resolved: `structuredWorkout` on `GET /api/planned-workouts/:id`; no secondary endpoint for lite summary
- Whether Today teaser is in or out for first ship (default: More-only)
