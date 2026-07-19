# Open Questions

Resolve before or during Phase 0–1. Record decisions in the table at the bottom.

| # | Question | Options / notes | Status |
|---|----------|-----------------|--------|
| 1 | **First-party vs developer OAuth app** | Hard-coded first-party (`isTrusted`) vs registered like third-party apps | Open |
| 2 | **Chat authorization** | `chat:read` / `chat:write` on Official Mobile App / REST scopes (coach-wattz) | **Decided** |
| 3 | **Modify recommendation UX** | Inline choices on Today vs dedicated detail screen | **Decided** |
| 4 | **Hosted vs self-hosted distribution** | Single App Store binary + instance picker vs separate branded builds | Open |
| 5 | **Streaming chat** | ~~SSE / WebSocket / polling~~ → **Bearer WebSocket primary**; poll degraded only | **Decided** |
| 6 | **Companion aggregate API** | New `/api/mobile/*` vs document composition of existing endpoints | Open |
| 7 | **App package location** | Expo at repo root (this repo) vs later sync with coach-wattz `clients/mobile` | Lean: **this repo is the app**; coach-wattz keeps API/docs | Proposed |
| 8 | **Expo channel** | Managed Expo vs early dev client (needed for HealthKit in v1.5+) | Open — start managed; add dev client when native modules land |
| 9 | **Nutrition entry IA** | Log tab section vs More → Nutrition | **Decided:** Log (write surface) |
| 10 | **Athlete metrics vs full settings** | Metrics-only editor vs port Profile Settings tabs | **Decided:** metrics-only (weight, FTP, max HR, LTHR); rest → Open web |
| 11 | **Planned detail Bearer + structure** | Session-only `GET /api/planned-workouts/:id` vs `requireAuth` + structure fields for intervals | **Decided** |
| 12 | **Upcoming vs Recent More entries** | Single “Workouts” hub vs separate Upcoming + Recent links | **Decided:** separate More rows (Recent activity + Upcoming) |
| 13 | **Today when no recommendation** | Empty-only vs planned-hero fallback | **Decided** |
| 14 | **Planned compliance vs recommendation actions** | Same CTAs vs distinct complete/skip on planned | **Decided** |
| 15 | **Week strip placement** | Today below CTAs vs Upcoming-only | **Decided** |
| 16 | **Session notes / coach comments** | Planned `description` only vs per-workout comment thread | **Decided** |
| 17 | **Store-candidate offline floor** | Online-only v1 vs cache last Today + planned read-only | **Decided** |
| 18 | **Skip/miss API shape** | Reuse PATCH/`completionStatus` vs new mobile endpoint | Open — pair with coach-wattz; complete path already exists |

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
| 2026-07-19 | Mobile Coach client: `useChat` + Bearer WS | `@ai-sdk/react` + `expo/fetch` to `POST /api/chat/messages`; WS deltas primary; poll while turn active if WS down; seed from Today/recovery query cache |
| 2026-07-19 | v1.5: upcoming planned + richer details | Field companion needs “what’s next”, not only today; More → Upcoming (no heatmap) |
| 2026-07-19 | v1.5: athlete metrics edit on More | `profile:write` / `PATCH /api/profile`; not full Profile Settings |
| 2026-07-19 | v1.5: nutrition quick-log on Log | Tracking handy on mobile; planning/grocery stay web; scopes `nutrition:read` / `nutrition:write` |
| 2026-07-19 | Planned detail Bearer + `structuredWorkout` | `GET /api/planned-workouts/:id` uses `requireAuth` + `workout:read`; structure from `structuredWorkout` (no intervals-preview for mobile lite) |
| 2026-07-19 | More → Recent + Upcoming (separate rows) | Workouts glance package; not a fifth tab or calendar heatmap |
| 2026-07-19 | Modify UX = recommendation detail | Accept/Rest stay on Today; Modify opens detail for rationale; alternative chips only if server returns options — no on-device invention |
| 2026-07-19 | Today planned-only fallback | No recommendation + planned workout → planned is the hero decision surface (complete / skip / detail / ask coach) |
| 2026-07-19 | Planned compliance distinct from rec actions | Complete/skip planned via `completionStatus` / complete API; Accept/Rest remain recommendation mutations |
| 2026-07-19 | Week strip on Today | Thin next ~7 days below CTAs; Upcoming keeps full capped list; no month grid or drag-reschedule |
| 2026-07-19 | Session notes = `description` | Show planned/activity description prominently; no per-workout comment thread in v1 (Coach tab for Q&A) |
| 2026-07-19 | Store-candidate offline floor | Cache last successful Today + today’s planned detail read-only; writes queue or honest offline — not full offline-first |
| 2026-07-19 | Universal link host = `coachwatts.com` with `/go/*` prefix | Same production host as the web app; `/go` avoids Nuxt route collisions; AASA/assetlinks still to deploy on coach-wattz |

When a row above is decided, move it here and update [product-baseline.md](./product-baseline.md) / [implementation-plan.md](./implementation-plan.md) if scope changes.
