# Product Baseline — Companion App

Distilled from coach-wattz PR [#239](https://github.com/hdkiller/coach/pull/239). Update when product decisions change.

## Positioning

| Surface | Role |
|---------|------|
| **Web** | Control room: planning, analytics, integrations, teams, nutrition depth, library, billing |
| **Mobile** | Field companion: what should I do today, check in, ask the coach |

If a screen exists mainly to configure, explore, or architect training → web. Mobile ships the daily athlete loop only.

## Stack

Expo (React Native) + TypeScript · Expo Router · NativeWind · TanStack Query · expo-secure-store · Expo Notifications · Sentry RN.

Auth: OAuth 2.0 + PKCE · tokens in Secure Store · `offline_access` for refresh.

## v1 scope (priority order)

1. **Today** — planned workout + AI recommendation (accept / modify / rest), short rationale
2. **Log** — sleep, readiness/feel, notes (weight if already in wellness flows)
3. **Session detail** — today’s planned structure; deep analysis → open web
4. **Recent activity** — last few workouts with sync/analysis status (not full calendar)
5. **Coach chat** — short Q&A seeded with today + recovery
6. **Notifications** — push + in-app inbox
7. **Account glue** — instance URL, sign-in, notification prefs, open web

## Explicit non-goals (v1)

Plan architect · analytics/explorer · coaching teams · integration OAuth connects · nutrition planning · library editing · billing/admin.

Use **Open in browser** instead of half-porting these.

## Later (v1.5+)

HealthKit / Health Connect · structured workout push to devices · stronger offline Today · weekly glance · optional nutrition quick-log.

## Information architecture

**Tabs:** Today · Log · Coach · More

**Stacks:** recommendation detail, planned workout detail, activity summary, notification inbox, sign-in / instance setup, settings.

**Today (top → bottom):** greeting → recommendation hero → planned workout → recovery strip → Accept / Modify / Rest → optional “Ask coach”.

First viewport = one decision. No CTL grids or calendar heatmaps.

## Interaction principles

1. Morning path < 30s
2. Thumb-first primary CTAs on Today
3. Today/Coach decide; Log writes
4. Push deep-links to Today or detail (never a dead inbox)
5. Honest empty/loading (“Waiting for Whoop sync…”)
6. Self-hosted instance URL first-class
7. Web escape hatch for out-of-scope depth
8. Do not clone `/dashboard`

## Auth — suggested v1 scopes

| Scope | Why |
|-------|-----|
| `profile:read` | Name, basics, FTP |
| `workout:read` | Recent + planned surface |
| `health:read` / `health:write` | Recovery strip + check-in |
| `recommendations:read` / `recommendations:write` | Today + accept/dismiss |
| `planning:read` | Today’s planned workout |
| `offline_access` | Refresh tokens |
| Chat | **TBD** — see [open-questions.md](./open-questions.md) |

## Companion API (logical)

| Capability | Contract |
|------------|----------|
| Bootstrap / home | Prefer `GET /api/mobile/today` (new) or documented composition |
| Recommendation actions | Existing accept / dismiss |
| Wellness check-in | Existing wellness write |
| Recent activities | Limited workouts list |
| Chat | Existing chat APIs (auth/streaming TBD) |
| Notifications | Existing `/api/notifications` |
| Push register | `POST /api/mobile/devices` (new) |

Push events (initial): `RECOMMENDATION_READY`, `WORKOUT_ANALYSIS_READY`, `SYNC_COMPLETED`, `COACH_MESSAGE`.

## Non-functionals (baseline)

iOS + Android via Expo · warm-cache Today < ~2s with skeleton · reuse Tolgee locales where practical · a11y on primary CTAs · no health metrics in analytics · Sentry + minimal product events.
