# Open Questions

Resolve before or during Phase 0–1. Record decisions in the table at the bottom.

| # | Question | Options / notes | Status |
|---|----------|-----------------|--------|
| 1 | **First-party vs developer OAuth app** | Hard-coded first-party (`isTrusted`) vs registered like third-party apps | Open |
| 2 | **Chat authorization** | `chat:read` / `chat:write` on Official Mobile App / REST scopes (coach-wattz) | **Decided** |
| 3 | **Modify recommendation UX** | Inline choices on Today vs dedicated detail screen | Open |
| 4 | **Hosted vs self-hosted distribution** | Single App Store binary + instance picker vs separate branded builds | Open |
| 5 | **Streaming chat** | ~~SSE / WebSocket / polling~~ → **Bearer WebSocket primary**; poll degraded only | **Decided** |
| 6 | **Companion aggregate API** | New `/api/mobile/*` vs document composition of existing endpoints | Open |
| 7 | **App package location** | Expo at repo root (this repo) vs later sync with coach-wattz `clients/mobile` | Lean: **this repo is the app**; coach-wattz keeps API/docs | Proposed |
| 8 | **Expo channel** | Managed Expo vs early dev client (needed for HealthKit in v1.5+) | Open — start managed; add dev client when native modules land |
| 9 | **Nutrition entry IA** | Log tab section vs More → Nutrition | **Decided:** Log (write surface) |
| 10 | **Athlete metrics vs full settings** | Metrics-only editor vs port Profile Settings tabs | **Decided:** metrics-only (weight, FTP, max HR, LTHR); rest → Open web |
| 11 | **Planned detail Bearer + structure** | Session-only `GET /api/planned-workouts/:id` vs `requireAuth` + structure fields for intervals | **Decided** |
| 12 | **Upcoming vs Recent More entries** | Single “Workouts” hub vs separate Upcoming + Recent links | **Decided:** separate More rows (Recent activity + Upcoming) |

## Decision log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-07-14 | Companion, not full port | Daily athlete loop; web keeps depth (baseline PR) |
| 2026-07-14 | Expo + TypeScript | Align with Nuxt/TS team; OTA-friendly |
| 2026-07-14 | Four-tab IA: Today / Log / Coach / More | One job per tab |
| 2026-07-14 | OAuth PKCE + Bearer | Existing IdP; cookies are web-only |
| 2026-07-19 | Implementation lives in `watts-mobile` | Separate client repo; coach-wattz remains API/product host |
| 2026-07-19 | Production instance URL is `https://coachwatts.com` | Not `app.coachwatts.com`; wired in `.env.example` / `app.json` extra |
| 2026-07-19 | Compose Today from existing APIs first | `/api/mobile/today` BFF deferred; accept uses Bearer via requireAuth |
| 2026-07-19 | Today recovery UX = light context, Log-first writes | Active chips + quiet “Log recovery event” link on Today; full create/edit on Log — keeps morning decision primary |
| 2026-07-19 | Coach chat: `@ai-sdk/react` + Bearer WebSocket | Align with web AI SDK UI; WS for live deltas; poll only as safety net |
| 2026-07-19 | coach-wattz chat Bearer path ready | `websocket-token` + room `state` + resume/retry via `requireAuth`; `chat:*` public scopes / Official Mobile App |
| 2026-07-19 | v1.5: upcoming planned + richer details | Field companion needs “what’s next”, not only today; More → Upcoming (no heatmap) |
| 2026-07-19 | v1.5: athlete metrics edit on More | `profile:write` / `PATCH /api/profile`; not full Profile Settings |
| 2026-07-19 | v1.5: nutrition quick-log on Log | Tracking handy on mobile; planning/grocery stay web; scopes `nutrition:read` / `nutrition:write` |
| 2026-07-19 | Planned detail Bearer + `structuredWorkout` | `GET /api/planned-workouts/:id` uses `requireAuth` + `workout:read`; structure from `structuredWorkout` (no intervals-preview for mobile lite) |
| 2026-07-19 | More → Recent + Upcoming (separate rows) | Workouts glance package; not a fifth tab or calendar heatmap |

When a row above is decided, move it here and update [product-baseline.md](./product-baseline.md) / [implementation-plan.md](./implementation-plan.md) if scope changes.
