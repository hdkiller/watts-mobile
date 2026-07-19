## Why

AI workout analysis is a core Coach Watts value, but the companion only shows analysis status and sends athletes to the web for the write-up. Cached analysis already rides on `GET /api/workouts/:id` with `workout:read`; mobile should surface it in-app and allow analyze/regenerate with `workout:write`.

## What Changes

- Show athlete-facing AI analysis on the completed activity detail screen: scores, executive summary, section points, recommendations, strengths/weaknesses when `aiAnalysisJson` (or markdown fallback) is present.
- Respect `aiAnalysisStatus` honestly (ready / analyzing / failed / not started / quota).
- Add **Analyze** / **Regenerate** via `POST /api/workouts/:id/analyze`, then poll/refetch until complete.
- Request OAuth scope **`workout:write`** so Bearer analyze works (**BREAKING** for existing sessions until re-consent).
- Keep Open web for charts, streams, maps, plan adherence, and analysis facts depth.
- Update product baseline: companion AI analysis is in-scope; “deep analysis → web” no longer means hiding the AI write-up.

## Capabilities

### New Capabilities

- `activity-ai-analysis`: Completed-workout AI analysis display + analyze/regenerate on the activity detail stack.

### Modified Capabilities

- `recent-activity`: Activity summary is no longer “lite status + Open web only” for analysis — it includes the AI analysis section when data is available.
- `oauth-pkce`: Companion scope set includes `workout:write` for analysis mutations.

## Impact

- **Mobile:** `src/features/activity/*`, `app/(app)/activity/[id].tsx`, `src/auth/scopes.ts`, docs (`product-baseline.md`, `oauth-setup.md`).
- **APIs:** `GET /api/workouts/:id` (read cached analysis); `POST /api/workouts/:id/analyze` (`workout:write`).
- **Auth:** Existing tokens without `workout:write` can still **read** analysis; Analyze/Regenerate needs re-auth with the expanded scope.
- **Out of scope:** Stream charts, power curve, map, plan-adherence analyze (session-only), analysisFacts panels, Intervals publish.
