# Implementation Plan

Phased delivery for this repository. Product detail: [product-baseline.md](./product-baseline.md). Blockers: [open-questions.md](./open-questions.md).

## Current state

- Phase 0–1 and Log check-in shipped; OpenSpecs archived under `openspec/changes/archive/2026-07-19-*`.
- Active OpenSpecs (apply-ready): `phase-2-log-recovery-event` → `phase-2-notifications-push` → `phase-3-coach-chat` → `phase-3-recent-activity` (workouts glance: recent + upcoming) → `phase-3-deep-links` → `phase-3-store-polish` (E2E deferred).
- Phase 4 / v1.5 OpenSpecs proposed: `phase-4-athlete-profile-edit`, `phase-4-nutrition-quick-log` (after store candidate).
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
- [x] Log recovery event (journey) parity with web — OpenSpec `phase-2-log-recovery-event`
- [ ] Soft offline queue for check-in (nice-to-have in Phase 2; harden in 4)
- [ ] Notifications list + mark read — OpenSpec `phase-2-notifications-push`
- [ ] `POST` device registration + Expo push token — same change
- [ ] Handle first push event types (deep-link stubs OK) — same change

**Also done:** `POST /api/checkin/answer` Bearer fix in coach-wattz; Log slice archived as `phase-2-log-checkin`.

**Backend:** Recovery-event APIs already Bearer (`health:read` / `health:write`). Notifications still need Bearer + `POST /api/mobile/devices` + push send hooks.

**Exit:** check-in + recovery event save; inbox works; at least one push path verified on device.

**Suggested apply order within Phase 2:** `phase-2-log-recovery-event` first (API ready), then `phase-2-notifications-push`.

## Phase 3 — Coach + polish

OpenSpecs (suggested apply order after Phase 2 push):

| Change | Focus |
|--------|--------|
| `phase-3-coach-chat` | Threaded chat via `@ai-sdk/react`, seeding, starter prompts, Bearer WS streaming (poll degraded) |
| `phase-3-recent-activity` | Workouts glance: recent completed + upcoming planned + richer detail stacks (More) |
| `phase-3-deep-links` | Scheme/universal link map + push path alignment |
| `phase-3-store-polish` | Icons/splash, privacy strings, More account glue, Sentry |

- [ ] Coach tab threaded chat with today/recovery context seeding
- [ ] Starter prompts
- [ ] Recent activity (lite) from More
- [ ] Upcoming planned list from More (same change / workouts glance)
- [ ] Richer planned + activity detail (interval/step summary when available)
- [ ] Universal links / scheme for Today, recommendation, activity, planned, chat
- [ ] i18n (Tolgee keys / shared locales where practical)
- [ ] Store prep: icons, splash, privacy strings
- [ ] ~~E2E smoke (Maestro or Detox)~~ deferred

**Exit:** chat usable; deep links land correctly; store checklist started (E2E not required for this exit).

## Phase 4 — v1.5 companion expansion

Product themes: [product-baseline.md](./product-baseline.md) § v1.5. Finish Phase 2–3 store candidate first; do not starve push/chat for these.

OpenSpecs (suggested):

| Change | Focus |
|--------|--------|
| `phase-3-recent-activity` (widen) | Upcoming planned + richer details if not finished in Phase 3 |
| `phase-4-athlete-profile-edit` | More → Athlete metrics (weight, FTP, max HR, LTHR) |
| `phase-4-nutrition-quick-log` | Log → nutrition totals + macro/meal log + hydration |

Checklist:

- [ ] Upcoming planned workouts (More → Upcoming, capped 7–14 days)
- [ ] Richer planned workout detail (structure summary) + lite activity summary
- [ ] Athlete metrics editor (`profile:write`, `GET/PATCH /api/profile`)
- [ ] Nutrition quick-log on Log (`nutrition:read` / `nutrition:write`)
- [ ] Soft offline queue for check-in (harden)
- [ ] Stronger offline Today cache
- [ ] Weekly glance (lite load/form — not CTL)
- [ ] HealthKit / Health Connect ingest
- [ ] Structured workout export to devices / Intervals

**coach-wattz prerequisites (Phase 4 / workouts glance):**

1. Bearer on `GET /api/planned-workouts/:id` (list already `workout:read`; detail may still be session-only)
2. Confirm planned structure / intervals fields for mobile summary (compose or document)
3. Official Mobile App allowlist: `profile:write`, `nutrition:read`, `nutrition:write`
4. Bearer on nutrition hydration quick-add (and any session-only nutrition routes used by mobile)

**Exit:** athlete can browse upcoming + recent, edit core metrics, and quick-log nutrition without opening web for the happy path.

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
2. ~~Chat: Bearer `websocket-token` + room `state` + resume/retry; Official Mobile App `chat:*`~~ **done in coach-wattz**
3. `GET /api/mobile/today` (or composition docs)
4. `POST /api/mobile/devices` + push send path
5. Deep-link / universal link host association
6. Bearer + structure docs for planned workout detail; `profile:write` / `nutrition:*` on Official Mobile App (Phase 4)

## Definition of done (v1 store candidate)

- Auth + Today loop production-safe
- Log + notifications + coach chat shippable
- No v1 non-goal surfaces half-ported
- Sentry + privacy labels + store metadata ready

## Definition of done (v1.5 companion expansion)

- Upcoming + recent workouts glance with usable detail stacks
- Athlete metrics editable on device
- Nutrition quick-log on Log (planning/grocery still web-only)
