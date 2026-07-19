## 1. Scaffold Expo app

- [x] 1.1 Create Expo + TypeScript + Expo Router project at repo root without wiping `AGENTS.md`, `docs/`, or `openspec/`
- [x] 1.2 Add NativeWind, TanStack Query, expo-secure-store, expo-auth-session, expo-web-browser, expo-linking, @sentry/react-native
- [x] 1.3 Configure app scheme `coachwatts`, brand colors, and `.env.example` (`EXPO_PUBLIC_OAUTH_CLIENT_ID`, `EXPO_PUBLIC_DEFAULT_INSTANCE_URL`, optional Sentry DSN)
- [x] 1.4 Add `.gitignore` for Expo/Node and ensure secrets are not committed

## 2. Instance configuration

- [x] 2.1 Implement instance URL storage + normalize (trim, strip trailing slash)
- [x] 2.2 Build instance setup screen with default `https://app.coachwatts.com`
- [x] 2.3 Add reachability validation before allowing continue to login

## 3. OAuth PKCE + session

- [x] 3.1 Implement PKCE authorize + token exchange against `{instance}/api/oauth/*` as a public client
- [x] 3.2 Persist access/refresh tokens in Secure Store; restore session on launch
- [x] 3.3 Implement refresh-on-401 with single-flight refresh and forced re-auth on failure
- [x] 3.4 Implement sign-out (clear tokens, keep instance URL)

## 4. API client + shell

- [x] 4.1 Implement Bearer `apiFetch` + TanStack Query provider
- [x] 4.2 Fetch userinfo after login; show identity on More
- [x] 4.3 Add `(auth)` vs `(app)` route groups with Today / Log / Coach / More placeholders
- [x] 4.4 Add Open web action and Sentry stub init
- [x] 4.5 Update `docs/implementation-plan.md` Phase 0 checkboxes / README with run instructions

## 5. Verify

- [x] 5.1 Confirm TypeScript/Expo starts (`pnpm start` or equivalent)
- [x] 5.2 Document OAuth redirect URI(s) and client registration steps for coach-wattz
