# Agent Guidelines — Coach Watts Mobile

This repository is the **native iOS/Android activation companion** for [Coach Watts](https://coachwatts.com).

Web stays the control room (deep plan adapt, analytics, teams, nutrition planning, and billing administration). Native mobile may acquire/restore a hosted Supporter or Pro subscription through Apple/Google via RevenueCat; invoices, payment methods, tax documents, refunds, and provider administration stay web/store-managed.
This app **activates new athletes on device** (consent → goal → plan lite → insight → connect data last), then runs the daily field loop: today, check-in, coach, push — not a full web port.

## Source of truth

| Doc | Role |
|-----|------|
| [docs/product-baseline.md](docs/product-baseline.md) | Product positioning (activation companion), shipped loop, activation chapter, IA, non-goals |
| [docs/implementation-plan.md](docs/implementation-plan.md) | Delivery phases and checklist for this repo |
| [docs/open-questions.md](docs/open-questions.md) | Decisions to resolve before/during Phase 0–1 |
| [docs/issues.md](docs/issues.md) | Known issues / bugs tracked in-repo (maintain here) |
| [docs/oauth-setup.md](docs/oauth-setup.md) | Public OAuth client + redirect URI registration |
| [docs/e2e.md](docs/e2e.md) | Maestro smoke + e2e auth seed (fixture token) |
| [docs/deep-links.md](docs/deep-links.md) | Scheme / universal link path map + host association |
| [docs/native-modules.md](docs/native-modules.md) | When adding Expo native deps: rebuild the dev client |
| [docs/distribution.md](docs/distribution.md) | App Store / Play hub, release-it versioning, GitHub Android APK → `docs/distribution/` tasks + log |
| [docs/store-checklist.md](docs/store-checklist.md) | Brand chrome, About links, Sentry env for store builds |
| [docs/store-privacy-checklist.md](docs/store-privacy-checklist.md) | App Privacy / Data safety questionnaire copy |
| coach-wattz `docs/06-plans/mobile-companion-app.md` | Full living baseline (PR [#239](https://github.com/hdkiller/coach/pull/239); merge pending) |
| OpenSpec archive `2026-07-19-phase-0/1/2/3/4-*` | Auth → Today → Log → push → chat → activity → deep links → store → profile → nutrition (done) |

When the coach-wattz PR merges, prefer that file for product/API narrative and keep this repo’s docs focused on **implementation**.

## Stack

| Layer | Choice |
|-------|--------|
| Runtime | **Expo (React Native) + TypeScript** + **`expo-dev-client`** (not Expo Go for day-to-day) |
| Navigation | **Expo Router** |
| UI | React Native + **NativeWind** (or adapted design tokens) |
| Server state | **TanStack Query** |
| Auth storage | **expo-secure-store** |
| Local cache | MMKV and/or SQLite |
| Push | **Expo Notifications** → APNs / FCM |
| Observability | **Sentry React Native** |

Auth: OAuth 2.0 **Authorization Code + PKCE (S256)** via system browser / `expo-auth-session`. Bearer tokens only — not web cookie sessions.

Do **not** use Capacitor wrapping Nuxt for v1. Prefer Expo over Flutter / separate native stacks unless product decides otherwise.

## Related repositories

| Repo | Path | Role |
|------|------|------|
| **coach-wattz** | `~/Develop/coach-wattz` | Production web + API + OAuth IdP |
| **watts-marketing** | `~/Develop/watts-marketing` | Brand / outreach knowledge |

API base (hosted): `https://coachwatts.com/api/`  
Local coach-wattz (workspace default): `http://localhost:3099/api/`

## Product summary

**Shipped loop:** Today (recommendation + planned), Log (wellness + recovery + nutrition quick-log), session detail, recent/upcoming, Coach chat, notifications, athlete metrics, Settings (Health Sync, etc.), account glue.

**Next — activation onboarding:** mobile-only sign-up + consent, goal lite, plan lite wizard, first insight, connect-last (Health Sync primary; OAuth apps optional/skip). Fully activated = data → goal → plan → insight.

**Out:** Full plan architect/adapt, analytics/explorer, coaching teams, nutrition planning/grocery, library editing, full billing administration, admin, full Profile Settings / zones. Narrow hosted store subscription purchase/status/restore/manage is tracked by OpenSpec `store-subscriptions-revenuecat`.

IA: bottom tabs **Today · Log · Coach · More** (+ activation wizard stacks). See [docs/product-baseline.md](docs/product-baseline.md).

## Working rules

1. Treat **coach-wattz** as source of truth for API contracts, scopes, and product behavior. Do not invent endpoints or scope names.
2. Keep business logic on the server. Mobile is presentation, caching, and optimistic UI.
3. Prefer a thin companion aggregate (`GET /api/mobile/today` or documented composition) over cold-start fan-out.
4. Self-hosted instance URL is first-class (validate reachability before OAuth).
5. Secrets stay out of git (tokens, client secrets, `.env`).
6. Follow [BRANDING.md](../coach-wattz/BRANDING.md) in coach-wattz — companion is Coach Watts, not a generic fitness shell.
7. Update [docs/open-questions.md](docs/open-questions.md) when a decision lands.
8. After adding/upgrading a **native** Expo module or changing its `app.json` plugin, **rebuild the binary** (`pnpm ios` / `pnpm android` or EAS). Metro alone will not link it — see [docs/native-modules.md](docs/native-modules.md). Symptom: `Cannot find native module '…'`.
9. Store / distribution progress: update [docs/distribution/tasks.md](docs/distribution/tasks.md) (and the matching task file) when status changes; **prepend** a dated entry to [docs/distribution/log.md](docs/distribution/log.md) for enrollments, TestFlight builds, submissions, and review outcomes. Never commit Apple passwords, review demo passwords, or real Sentry DSNs — see [docs/distribution.md](docs/distribution.md).
