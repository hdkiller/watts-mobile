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
| 8 | **Expo channel** | Managed Expo vs early dev client (needed for HealthKit in v1.5+) | **Decided:** `expo-dev-client` early; rebuild after native deps ([native-modules.md](./native-modules.md)) |
| 9 | **Nutrition entry IA** | Log tab section vs More → Nutrition | **Decided:** Log (write surface) |
| 10 | **Athlete metrics vs full settings** | Metrics-only editor vs port Profile Settings tabs | **Decided:** More → Athlete = default-profile metrics (weight, FTP, max HR, LTHR); Settings → Sports = lite per-sport FTP/LTHR/Max HR; zones / detect-from-workouts / full Sport Settings → Open web |
| 20 | **Settings hub field-companion scope** | Thin device/daily prefs vs port web Profile/Settings | **Decided:** Settings hub = Notifications, Health Sync, Units & locale, Instance, Coach identity lite (nickname/persona/About me/tool approval), Export/Delete via Open web; push prefs stay separate from email Communication prefs; full Profile/Apps/Billing/zones stay web — see `openspec/changes/settings-field-companion` |
| 11 | **Planned detail Bearer + structure** | Session-only `GET /api/planned-workouts/:id` vs `requireAuth` + structure fields for intervals | **Decided** |
| 12 | **Upcoming vs Recent More entries** | Single “Workouts” hub vs separate Upcoming + Recent links | **Decided:** separate More rows (Recent activity + Upcoming) |
| 13 | **Today when no recommendation** | Empty-only vs planned-hero fallback | **Decided** |
| 14 | **Planned compliance vs recommendation actions** | Same CTAs vs distinct complete/skip on planned | **Decided** |
| 15 | **Week strip placement** | Today below CTAs vs Upcoming-only | **Decided** |
| 16 | **Session notes / coach comments** | Planned `description` only vs per-workout comment thread | **Decided** |
| 17 | **Store-candidate offline floor** | Online-only v1 vs cache last Today + planned read-only | **Decided** |
| 18 | **Skip/miss API shape** | Reuse PATCH/`completionStatus` vs new mobile endpoint | Open — pair with coach-wattz; complete path already exists |
| 19 | **Today Coming up: planned vs calendar events** | Planned workouts only vs also race/life calendar events | **Decided:** planned primary; race/life countdown via `GET /api/events` + `goal:read` |

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
| 2026-07-19 | Today Coming up = planned workouts only | Want both planned + race/life calendar events eventually; ship planned teaser first; calendar/life events deferred |
| 2026-07-19 | Race/life events via `GET /api/events` + `goal:read` | Bearer-read events; Today countdown chip + quiet Coming up line; no in-app event CRUD |
| 2026-07-19 | Today nutrition glance when tracking on | Gate on `nutritionTrackingEnabled` (same as web); totals + Log meal → Log; hide Log nutrition section when off |
| 2026-07-19 | Coach sessions = web 15-minute reuse | Open last room if `index` ≤ 15m else `POST /rooms`; room list + New chat on mobile |
| 2026-07-19 | Chat photo attach via `chat:write` upload | Bearer `POST /api/storage/upload`; no separate storage scope; tool approvals via `tool-approval-response` on messages POST |
| 2026-07-19 | Early `expo-dev-client` (not Expo Go) | Push, image picker, and future HealthKit need a custom binary; document rebuild-after-native-dep in [native-modules.md](./native-modules.md) |
| 2026-07-19 | Today Recent Wellness glance | Sleep/HRV/RHR from `profile/dashboard` + `wellness/trend`; empty “No recent wellness · Check in”; drop AI Sleep/HRV/Feel strip; Check in → Log; trends moved to Wellness Overview sheet (2026-07-20) |
| 2026-07-20 | Settings = field companion only | Hub: push prefs, Health Sync, units/timezone, instance, coach identity lite; Export/Delete Open web; no full Profile Settings / Apps / Billing / zones; push ≠ email prefs API — `settings-field-companion` |
| 2026-07-20 | Lite per-sport thresholds on Settings → Sports | List profiles; edit FTP/LTHR/Max HR (pace if present) via `PATCH` `sportSettings`; Athlete metrics stays default-profile quick edit; zones / detect-from-workouts / full Sport Settings stay web — `log-sport-settings` |
| 2026-07-20 | Wellness Overview on Today | Tap Recent Wellness tiles → read-only sheet (`GET /api/wellness/{date}`); 7-day trends in sheet (not inline); Check in → Log; no AI Analyze / PATCH logs |
| 2026-07-20 | Training Load & Form on Today | Compact CTL/ATL/TSB glance below CTAs; PMC chart in sheet via `GET /api/performance/pmc` + `performance:read`; Open web `/performance`; no first-viewport CTL grid |
| 2026-07-20 | Athlete Profile overview on More → Athlete | Identity + HR trio + AI report summary/Sync; reports/generate Bearer via `profile:read`/`profile:write`; full report → Open web `/profile/athlete` |
| 2026-07-20 | Analyze Readiness on mobile | Empty Today → `POST /api/recommendations/today` + status poll under `recommendation:read`; quota/timeout honest; planned-only hero has no generate CTA |
| 2026-07-20 | Daily Coach Check-In on Today | AI YES/NO questionnaire via checkin today/generate/answer (`health:*`); distinct from Log wellness; Active Recovery “Wellness check-in” copy |
| 2026-07-20 | Lite in-app activity route map | `react-native-maps` on activity detail from streams `latlng` / `summaryPolyline`; explorer/GPX stay Open web; reverse prior “map → open web” for lite map only |
| 2026-07-20 | App→web session handoff | `POST /api/auth/app-web-handoff` + consume; mobile `openInstanceWeb` mints then opens browser; bare URL fallback; privacy/terms/support stay direct |
| 2026-07-20 | Training Load ±% trends on Today | CTL/ATL/TSB trend badges vs prior ~7 PMC days (web TrendIndicator parity); ATL lower-is-better; 403 → re-login cue |
| 2026-07-20 | Monthly Progress on Today | Glance + sheet via `GET /api/stats/monthly-comparison` (`workout:read`); metric/sport/view filters; Open web `/dashboard` |
| 2026-07-20 | Athlete AI report access | 403 → Sign out & sign in; lite in-app report sheet; Open full report via handoff `/profile/athlete` |

When a row above is decided, move it here and update [product-baseline.md](./product-baseline.md) / [implementation-plan.md](./implementation-plan.md) if scope changes.
