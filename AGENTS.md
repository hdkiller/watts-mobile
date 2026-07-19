# Agent Guidelines — Coach Watts Mobile

This repository is the **native iOS/Android companion app** for [Coach Watts](https://coachwatts.com).

Web stays the control room (planning, analytics, integrations, coaching, billing).
This app is the **field companion**: today’s recommendation, check-in, light chat, and push — not a full web port.

## Source of truth

| Doc | Role |
|-----|------|
| [docs/product-baseline.md](docs/product-baseline.md) | Product positioning, v1 scope, IA, non-goals |
| [docs/implementation-plan.md](docs/implementation-plan.md) | Delivery phases and checklist for this repo |
| [docs/open-questions.md](docs/open-questions.md) | Decisions to resolve before/during Phase 0–1 |
| [docs/oauth-setup.md](docs/oauth-setup.md) | Public OAuth client + redirect URI registration |
| coach-wattz `docs/06-plans/mobile-companion-app.md` | Full living baseline (PR [#239](https://github.com/hdkiller/coach/pull/239); merge pending) |
| OpenSpec `phase-0-expo-oauth` | Phase 0 scaffold + OAuth PKCE (complete; archive when ready) |
| OpenSpec `phase-1-today-loop` | Today recommendation loop |
| OpenSpec `phase-2-log-checkin` | Log wellness check-in (notifications still open) |

When the coach-wattz PR merges, prefer that file for product/API narrative and keep this repo’s docs focused on **implementation**.

## Stack

| Layer | Choice |
|-------|--------|
| Runtime | **Expo (React Native) + TypeScript** (dev client when native modules needed) |
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

## v1 product summary

**In:** Today (recommendation + planned workout), Log (wellness check-in), recent activities (lite), Coach chat (seeded), notifications, account glue (instance URL, sign-in, open web).

**Out:** Plan architect, analytics/explorer, coaching teams, integration OAuth connects, nutrition planning, library editing, billing/admin.

IA: bottom tabs **Today · Log · Coach · More**.

## Working rules

1. Treat **coach-wattz** as source of truth for API contracts, scopes, and product behavior. Do not invent endpoints or scope names.
2. Keep business logic on the server. Mobile is presentation, caching, and optimistic UI.
3. Prefer a thin companion aggregate (`GET /api/mobile/today` or documented composition) over cold-start fan-out.
4. Self-hosted instance URL is first-class (validate reachability before OAuth).
5. Secrets stay out of git (tokens, client secrets, `.env`).
6. Follow [BRANDING.md](../coach-wattz/BRANDING.md) in coach-wattz — companion is Coach Watts, not a generic fitness shell.
7. Update [docs/open-questions.md](docs/open-questions.md) when a decision lands.
