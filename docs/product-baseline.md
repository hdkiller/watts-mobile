# Product Baseline — Companion App

Distilled from coach-wattz PR [#239](https://github.com/hdkiller/coach/pull/239). Update when product decisions change.

## Positioning

| Surface | Role |
|---------|------|
| **Web** | Control room: planning, analytics, integrations, teams, nutrition planning depth, library, billing |
| **Mobile** | Field companion: what should I do today, what’s coming up, check in, quick nutrition log, ask the coach |

If a screen exists mainly to configure, explore, or architect training → web. Mobile ships the daily athlete loop plus light field writes (wellness, recovery, nutrition quick-log, athlete metrics).

## Stack

Expo (React Native) + TypeScript · Expo Router · NativeWind · TanStack Query · expo-secure-store · Expo Notifications · Sentry RN.

Auth: OAuth 2.0 + PKCE · tokens in Secure Store · `offline_access` for refresh.

## v1 scope (priority order)

1. **Today** — planned workout + AI recommendation (accept / modify / rest), short rationale
2. **Log** — daily wellness (sleep, readiness/feel, notes, weight if already in flows) **and** recovery events (illness, fatigue, sleep disruption, etc. — parity with web “Log recovery event”)
3. **Session detail** — today’s planned structure; completed-workout AI analysis + stream/zone/power-curve charts in-app; map / explorer depth → open web
4. **Recent activity** — last few workouts with sync/analysis status (not full calendar)
5. **Coach chat** — short Q&A seeded with today + recovery
6. **Notifications** — push + in-app inbox
7. **Account glue** — instance URL, sign-in, notification prefs, open web

## Explicit non-goals (v1)

Plan architect · analytics/explorer · coaching teams · integration OAuth connects · nutrition planning / grocery · library editing · billing/admin · full web Profile Settings / Athlete Profile generate · calendar heatmaps.

Use **Open in browser** instead of half-porting these.

## v1.5 scope (after store-candidate v1)

Promoted from vague “later” into an explicit companion expansion:

1. **Upcoming planned workouts** — More → Upcoming (capped next ~7–14 days via `GET /api/planned-workouts`); not a fifth tab or heatmap
2. **Richer session details** — planned interval/step summary when payload allows; completed-workout summary metrics + AI analysis + charts in-app; map / interval audit → open web
3. **Athlete metrics edit** — More → Athlete: weight, FTP, max HR, LTHR (`profile:write` / `PATCH /api/profile`); not full Profile Settings
4. **Nutrition quick-log** — Log tab section: today’s totals glance, macro/meal item log, hydration quick-add (`nutrition:read` / `nutrition:write`); planning/grocery stay on web

## Later (v1.5+)

HealthKit / Health Connect · structured workout push to devices · stronger offline Today · weekly glance (load/form lite, not CTL).

## Information architecture

**Tabs:** Today · Log · Coach · More

**Stacks:** recommendation detail, planned workout detail, activity summary, upcoming planned list, notification inbox, athlete metrics, nutrition log (Log stack), sign-in / instance setup, settings.

**Today (top → bottom):** greeting → recommendation hero (or planned-only hero) → planned summary when with a recommendation → optional recovery metrics → named **Active Recovery Context** band (chips + Log event / Check in / History) → Accept / Modify / Rest → thin **Coming up** (planned workouts only) → **Recently** teaser → optional **Nutrition** glance (when `nutritionTrackingEnabled`) → optional “Ask coach”.

Recovery **writes** stay Log-first; Today shows named active context and secondary actions (not a second hero CTA). Coming up is planned workouts for now — race/life calendar events later. Nutrition glance is totals-only; meal/hydration writes stay on Log.

**Log writes:** wellness + recovery events (+ nutrition quick-log in v1.5 when tracking enabled).

**More hosts:** recent activity, upcoming planned, notifications, athlete metrics, account glue.

First viewport = one decision. No CTL grids or calendar heatmaps.

## Interaction principles

1. Morning path < 30s
2. Thumb-first primary CTAs on Today
3. Today/Coach decide; Log writes (wellness + recovery events + nutrition quick-log)
4. Push deep-links to Today or detail (never a dead inbox)
5. Honest empty/loading (“Waiting for Whoop sync…”)
6. Self-hosted instance URL first-class
7. Web escape hatch for out-of-scope depth
8. Do not clone `/dashboard`

## Auth — suggested scopes

| Scope | Why |
|-------|-----|
| `profile:read` | Name, basics, FTP display |
| `profile:write` | Athlete metrics edit (v1.5) |
| `workout:read` | Recent + planned / upcoming surface |
| `workout:write` | Completed-workout AI analyze / regenerate |
| `health:read` / `health:write` | Recovery strip + check-in |
| `recommendations:read` / `recommendations:write` | Today + accept/dismiss |
| `planning:read` | Today’s planned workout |
| `nutrition:read` / `nutrition:write` | Nutrition quick-log (v1.5) |
| `offline_access` | Refresh tokens |
| `chat:read` / `chat:write` | Coach tab send/receive (+ room state / resume-retry on write) |

## Companion API (logical)

| Capability | Contract |
|------------|----------|
| Bootstrap / home | Prefer `GET /api/mobile/today` (new) or documented composition |
| Recommendation actions | Existing accept / dismiss |
| Wellness check-in | Existing wellness write |
| Recovery event | `POST/PATCH/DELETE /api/recovery-context/journey*` + `GET /api/recovery-context` |
| Recent activities | Limited workouts list (`GET /api/workouts`) |
| Upcoming planned | `GET /api/planned-workouts` (date range + limit) |
| Planned / activity detail | Planned + workout by id (Bearer); structure summary; activity AI + `/streams` + `/power-curve` charts |
| Athlete metrics | `GET/PATCH /api/profile` (`profile:read` / `profile:write`) |
| Nutrition quick-log | `GET/POST /api/nutrition` (+ hydration quick-add when Bearer-ready) |
| Chat | Existing rooms/messages APIs + Bearer WebSocket (`websocket-token`); `@ai-sdk/react` on client; poll as degraded fallback |
| Notifications | Existing `/api/notifications` |
| Push register | `POST /api/mobile/devices` (new) |

Push events (initial): `RECOMMENDATION_READY`, `WORKOUT_ANALYSIS_READY`, `SYNC_COMPLETED`, `COACH_MESSAGE`.

## Non-functionals (baseline)

iOS + Android via Expo · warm-cache Today < ~2s with skeleton · reuse Tolgee locales where practical · a11y on primary CTAs · no health metrics in analytics · Sentry + minimal product events.
