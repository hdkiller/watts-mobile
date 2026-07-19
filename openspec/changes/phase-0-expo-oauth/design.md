## Context

`watts-mobile` is greenfield aside from agent/docs/OpenSpec scaffolding. Coach Watts already exposes OAuth 2.0 + PKCE as an IdP (`/api/oauth/authorize`, `/api/oauth/token`). Phase 0 builds the client foundation only — no Today/business features.

Constraints from product baseline: Expo + TypeScript, Expo Router, NativeWind, TanStack Query, Secure Store, companion (not web port), self-hosted instance URL first-class.

## Goals / Non-Goals

**Goals:**

- Runnable Expo app on iOS Simulator / Android emulator
- Instance URL capture + validation before OAuth
- End-to-end PKCE login against a configured Coach Watts instance
- Secure token persistence, refresh-on-401, sign-out
- Authenticated API client + Query provider ready for Phase 1
- Placeholder four-tab shell + Open web

**Non-Goals:**

- Today aggregate, wellness log, chat, push, HealthKit
- Store submission / EAS production channels beyond basic config
- Implementing coach-wattz `/api/mobile/*` endpoints
- Full design-system port of Nuxt UI

## Decisions

### 1. Expo app at repository root

**Choice:** Create the Expo project in `watts-mobile/` root (not nested `clients/mobile`).

**Why:** This repo *is* the mobile client. Avoids an empty wrapper directory.

**Alternative:** Nested `apps/mobile` monorepo — defer until a second package exists.

### 2. Managed Expo first; scheme-based redirect

**Choice:** Start with Expo managed workflow + Expo Router. Use app scheme redirect (e.g. `coachwatts://oauth/callback`) via `expo-auth-session` / `AuthSession.makeRedirectUri`.

**Why:** Fastest path to PKCE; matches baseline. Dev client later when HealthKit lands (v1.5).

**Alternative:** Bare React Native — higher setup cost for Phase 0.

### 3. Public OAuth client + PKCE (no embedded client secret)

**Choice:** Treat the companion as a **public** native client. Token exchange sends `client_id`, `code`, `redirect_uri`, `code_verifier` — **not** a client secret baked into the binary.

**Why:** Secrets in mobile apps are extractable. Coach Watts auth docs mention `client_secret` for confidential clients; mobile must use PKCE public-client mode. If the IdP currently requires secret for all clients, that is a **coach-wattz dependency** to fix/configure before production.

**Fallback for local dev:** Optional `EXPO_PUBLIC_` vs server proxy is rejected for v1 — keep native PKCE direct to IdP; use a public client registration.

### 4. Auth module ownership

**Choice:** Isolate auth in `src/auth/` (session store, PKCE helpers, refresh) and gate routes with Expo Router groups: `(auth)` for instance/login, `(app)` for tabs when session present.

**Why:** Clear auth boundary for Phase 1 features.

### 5. Instance URL storage

**Choice:** Persist base URL in Secure Store (or AsyncStorage if non-secret) separately from tokens. Normalize (trim trailing slash). Health-check with a cheap unauthenticated request (e.g. HEAD/GET to a known public path or OAuth authorize reachability) before starting login.

**Why:** Self-hosted is first-class per baseline.

### 6. Default hosted instance

**Choice:** Prefill `https://app.coachwatts.com` but allow override. Env `EXPO_PUBLIC_DEFAULT_INSTANCE_URL` for builds.

### 7. API client

**Choice:** Thin `apiFetch` wrapping `fetch` with `Authorization: Bearer`, base URL from instance config, and single-flight refresh on 401. TanStack Query `QueryClientProvider` at app root.

**Why:** Enough for Phase 1 without inventing a heavy SDK.

### 8. NativeWind + brand tokens

**Choice:** NativeWind v4 + CSS variables / theme mirroring Coach Watts green (`#00DC82` / `#00C16A`) and zinc dark background (`#09090b`). Light shell is fine; dark-friendly tokens from day one.

### 9. Sentry stub

**Choice:** Conditional init when `EXPO_PUBLIC_SENTRY_DSN` is set; no-op otherwise.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| IdP requires `client_secret` for token exchange | Verify public-client path on coach-wattz; register companion as public; document blocker in open-questions |
| OAuth client not registered yet | Ship app with configurable `EXPO_PUBLIC_OAUTH_CLIENT_ID`; document redirect URI for registration |
| Expo Go redirect URI differs from standalone | Use `makeRedirectUri` + document both Expo Go and production URIs for OAuth app config |
| Secure Store unavailable on web | Phase 0 targets iOS/Android; web optional/dev-only with clear limitation |
| Overbuilding tabs UI | Placeholders only — no fake dashboard cards |

## Migration Plan

1. Scaffold Expo in-place (preserve `AGENTS.md`, `docs/`, `openspec/`)
2. Add `.env.example` (never commit secrets)
3. Register OAuth redirect URIs in coach-wattz when client id is ready
4. Rollback: delete generated app dirs if scaffold fails; docs/OpenSpec remain

## Open Questions

Carried from `docs/open-questions.md` that affect Phase 0:

1. First-party trusted client vs standard developer app registration
2. Exact redirect URI list for Expo Go vs EAS builds
3. Whether token endpoint accepts public clients without secret today
