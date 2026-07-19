## Context

OAuth PKCE works against local/prod Official Mobile App clients. Today is a placeholder. Product baseline: one-decision morning surface.

coach-wattz already exposes:

| Capability | Endpoint | Bearer today? |
|------------|----------|---------------|
| Today recommendation | `GET /api/recommendations/today` (`recommendation:read`) | Yes (`requireAuth`) |
| Accept | `POST /api/recommendations/:id/accept` | **No** (session only) |
| Generic rec patch/dismiss | `PATCH /api/recommendations/:id` | **No** (session only; different rec model) |
| Planned workouts list | `GET /api/planned-workouts` | Check — likely session or dual |
| Planned workout detail | `GET /api/planned-workouts/:id` | Check |

`GET /api/recommendations/today` may already embed `plannedWorkout`. Prefer that payload first.

## Goals / Non-Goals

**Goals:**

- Usable Today screen after login with real recommendation data when present
- Accept and rest/skip actions when backend supports Bearer
- Planned workout detail from Today
- Honest empty states when no recommendation / sync pending

**Non-Goals:**

- `/api/mobile/today` BFF (document as follow-up; compose meanwhile)
- Full modify UX (open detail or web if complex)
- Log / Coach / push

## Decisions

### 1. Compose, don’t wait for BFF

**Choice:** `useTodayQuery` fetches `GET /api/recommendations/today` as primary. Supplement with planned-workouts / wellness only if fields missing.

**Why:** Unblocks UI without coach-wattz BFF PR. Swap to `/api/mobile/today` later behind the same mapper.

### 2. Mapper boundary

**Choice:** `src/features/today/types.ts` + `mapTodayPayload()` → view model `{ recommendation, plannedWorkout, recovery, actions }`.

**Why:** Isolates API shape churn from UI.

### 3. Fix Bearer on accept in coach-wattz

**Choice:** Change `accept.post.ts` (and any dismiss path we use) to `requireAuth(event, ['recommendation:read'])` or a write scope if one exists. Today REST scopes list `recommendation:read` only — accept is a mutation. Prefer `requireAuth` with `recommendation:read` for parity with how web session users have full access, **or** introduce `recommendation:write` later. Minimal fix: `requireAuth(event)` / scopes matching read until a write scope exists.

**Why:** Without this, CTAs cannot work from the app.

### 4. Rest / skip

**Choice:** If accept with Rest-type modification is the web path, mirror it. Else PATCH status / dedicated dismiss if available on activity recommendations. Investigate activityRecommendation vs recommendationRepository — do not call wrong model.

### 5. Modify CTA

**Choice:** v1 opens recommendation/planned detail with rationale; deep modify can “Open web” if accept-with-options is too heavy.

### 6. Recovery strip

**Choice:** Show fields already on today recommendation analysis / user wellness if cheap; otherwise hide strip rather than fan out many calls.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Accept is session-only | Fix in coach-wattz before marking action tasks done |
| Wrong dismiss API (generic recommendations vs activity) | Trace web Today CTAs; call the same endpoints |
| No recommendation for day | Empty state with generate CTA only if Bearer generate exists; else “Open web” / wait |
| Scope name confusion (`recommendation:read` vs MCP `recommendations:*`) | Keep REST names from Phase 0 |

## Open Questions

1. Exact rest/skip endpoint for **activity** recommendations (not generic Recommendation model)
2. Whether accept should require a new `recommendation:write` scope
3. Timing of `/api/mobile/today` vs composition
