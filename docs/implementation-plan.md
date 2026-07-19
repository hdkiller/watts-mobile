# Implementation Plan

Phased delivery for this repository. Product detail: [product-baseline.md](./product-baseline.md). Blockers: [open-questions.md](./open-questions.md).

## Current state

- Expo app scaffolded (Phase 0 OpenSpec change `phase-0-expo-oauth`).
- coach-wattz baseline PR [#239](https://github.com/hdkiller/coach/pull/239) still draft — merge when ready.
- OAuth client registered as **Official Mobile App** in local + production; wire `EXPO_PUBLIC_OAUTH_CLIENT_ID` from [oauth-setup.md](./oauth-setup.md).

## Phase 0 — Platform & auth

Goal: runnable Expo app that can sign in against hosted or self-hosted Coach Watts and store tokens securely.

- [x] Scaffold Expo + TypeScript + Expo Router app at repo root
- [x] NativeWind + basic theme tokens aligned with Coach Watts branding
- [x] Instance URL onboarding (validate reachability)
- [x] OAuth PKCE via `expo-auth-session` + system browser
- [x] Secure Store for access + refresh; refresh-on-401
- [x] Sign out + Open web
- [x] TanStack Query client + API fetch wrapper (Bearer)
- [x] Sentry RN stub
- [x] Env example + scheme `coachwatts` (EAS channels later)
- [x] Coordinate OAuth client registration with coach-wattz (dev/prod redirect URIs)

**Exit:** cold launch → pick instance → login → authenticated shell → sign out.

**IdP smoke (2026-07-19):** Local authorize with client `cc24aade-…` + `coachwatts://oauth/callback` + companion scopes → **302** to consent. Unknown redirect → **400**. Authorize-details returns Official Mobile App. Full simulator consent still requires a manual device run.

## Phase 1 — Today loop

Goal: the morning decision surface.

- [x] Today tab UI (hero recommendation, planned workout, recovery strip, CTAs)
- [x] Wire via composition: `GET /api/recommendations/today` (+ planned detail)
- [x] Recommendation accept (Bearer); rest labeled when action is `rest`
- [x] Planned workout detail stack screen
- [x] Empty / loading / error states + pull-to-refresh
- [x] Unit tests for Today mappers (`pnpm test`)

**Backend (coach-wattz, done for mutations):**
- `POST /api/recommendations/:id/accept` → `requireAuth` + `recommendation:read`
- `GET /api/planned-workouts/:id` → `requireAuth` + `workout:read`

**API smoke (2026-07-19):** Bearer token against local IdP → `GET /api/recommendations/today` **204** (no rec today). Client treats 204 as empty Today.

**Still optional:** `GET /api/mobile/today` aggregate BFF.

**Exit:** login → Today shows data (or empty) → accept updates server → detail opens.

## Phase 2 — Log + notifications

- [x] Log tab wellness form → `POST /api/wellness` (`health:write`)
- [ ] Soft offline queue for check-in (nice-to-have in Phase 2; harden in 4)
- [ ] Notifications list + mark read
- [ ] `POST` device registration + Expo push token
- [ ] Handle first push event types (deep-link stubs OK)

**Also done:** `POST /api/checkin/answer` Bearer fix in coach-wattz; OpenSpec `phase-2-log-checkin` for the Log slice (notifications still open).

**Backend dependency:** device registration + push send hooks when analysis/recommendation completes.

**Exit:** check-in saves; inbox works; at least one push path verified on device.

## Phase 3 — Coach + polish

- [ ] Coach tab threaded chat with today/recovery context seeding
- [ ] Starter prompts
- [ ] Universal links / scheme for Today, recommendation, activity, chat
- [ ] i18n (Tolgee keys / shared locales where practical)
- [ ] Store prep: icons, splash, privacy strings
- [ ] E2E smoke (Maestro or Detox): login → Today → Accept; login → Log → Save

**Exit:** chat usable; deep links land correctly; store checklist started.

## Phase 4 — v1.5 extensions

- [ ] HealthKit / Health Connect ingest
- [ ] Structured workout export to devices / Intervals
- [ ] Stronger offline Today cache
- [ ] Weekly glance (lite)
- [ ] Optional nutrition quick-log

## Suggested repo layout (target)

```
watts-mobile/
  AGENTS.md
  docs/
  app/                 # Expo Router routes
  src/                 # api, auth, features, ui
  assets/
  package.json
  app.json / app.config.ts
  eas.json
```

(Adjust if Expo defaults differ; keep business logic out of the client beyond presentation.)

## Work that lives in coach-wattz

Track separately (or as paired PRs) — mobile UI polish should not wait forever on these, but Phase 1+ needs them:

1. Official companion OAuth client + redirect URIs
2. Chat auth approach for Bearer clients
3. `GET /api/mobile/today` (or composition docs)
4. `POST /api/mobile/devices` + push send path
5. Deep-link / universal link host association

## Definition of done (v1 store candidate)

- Auth + Today loop production-safe
- Log + notifications + coach chat shippable
- No v1 non-goal surfaces half-ported
- Sentry + privacy labels + store metadata ready
