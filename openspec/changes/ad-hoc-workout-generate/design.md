## Context

Web `TrainingRecommendationCard` opens `DashboardCreateAdHocModal` and posts to `POST /api/workouts/generate`, which triggers Trigger.dev task `generate-ad-hoc-workout` after quota check `generate_structured_workout`. Completion on web is via task-run realtime events (`onTaskCompleted`). That endpoint still uses `getServerSession` (cookie), not Bearer `requireAuth`. Mobile already requests `workout:write` in companion scopes and can show planned workouts on Today.

## Goals / Non-Goals

**Goals:**
- Companion form parity: type, duration, intensity, notes → generate
- Bearer-authenticated generate with honest quota / error UX
- After completion, Today shows the new planned workout (hero or planned block)
- Secondary placement that does not replace Accept / Analyze Readiness

**Non-Goals:**
- Library workout CRUD / structure editor
- Garmin publish / intervals.icu push from this sheet
- Adjusting an existing structured workout (`adjust` / `generate-structure` endpoints)
- Recommendation detail / refine (separate change)

## Decisions

1. **Endpoint: `POST /api/workouts/generate`**  
   Same body as web: `{ type, durationMinutes, intensity, notes }`. Types: `Ride` | `Run` | `Swim` | `WeightTraining`. Intensities: Recovery, Endurance, Tempo, Threshold, VO2Max, Anaerobic.  
   *Alternative:* chat tool to invent a workout — wrong product surface for a deterministic form.

2. **Auth: `requireAuth` + `workout:write`**  
   coach-wattz must migrate generate off session-only. Companion already includes `workout:write`.  
   *Alternative:* `workout:read` — incorrect for create.

3. **Completion signal: jobId + poll / refetch**  
   Response returns `{ success, jobId, message }`. Web uses websocket task events; mobile SHOULD poll a Bearer status helper if one exists (or add lightweight status for `generate-ad-hoc-workout`), and ALWAYS refetch today + upcoming/planned-for-today on an interval until a new planned workout appears or timeout (~60–90s).  
   *Alternative:* fire-and-forget toast only — too weak for field use.

4. **CTA placement**  
   Secondary “Generate Ad-Hoc Workout” (or shorter “Ad-hoc workout”) on Today when authenticated and Bearer generate is available:
   - With recommendation: below primary Accept row / with other secondary actions
   - Planned-only or empty: available so athletes can still create a session without a recommendation  
   Hide or disable while generate is in flight; do not show a fake CTA if endpoint returns 401/scope missing.  
   *Alternative:* More → Settings only — poorer morning discoverability.

5. **Form defaults**  
   Match web: type Ride, 60 min, Endurance, empty notes. Validate duration > 0 before submit.

6. **Quota**  
   Surface 429 with clear copy + Open web (plan/billing lives on web). Do not retry-loop.

7. **Navigation after success**  
   Prefer refreshing Today so the new planned card appears; optional deep-link into planned detail when id is known from refetch. Do not invent a fake local workout card before server confirmation.

## Risks / Trade-offs

- **[Risk] Session-only endpoint blocks ship** → Mitigation: coach-wattz Bearer PR is a hard prerequisite; mobile feature-flags CTA until green.
- **[Risk] No status API for ad-hoc jobs** → Mitigation: refetch planned-for-today / today recommendation payload; timeout + Retry; follow-up backend status if needed.
- **[Risk] Ad-hoc replaces / conflicts with planned rest day** → Mitigation: server owns conflict rules; mobile shows resulting plan honestly after refetch.
- **[Risk] Long generation on cellular** → Mitigation: generating overlay, timeout, Offline banner separate.

## Migration Plan

1. coach-wattz: Bearer + `workout:write` on `POST /api/workouts/generate`; document Official Mobile App; optional status endpoint.
2. Mobile: API helper, form sheet, CTA, poll/refetch, quota UI.
3. Update today-home / oauth docs.
4. Rollback: hide CTA; no client-side fake generate.

## Open Questions

- Exact status endpoint (reuse generic task-run status vs new workout generate status).
- Whether generate should be hidden when a recommendation is already accepted for today.
- Post-success: stay on Today vs auto-open planned detail.
