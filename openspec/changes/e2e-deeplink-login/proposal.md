## Why

Maestro authenticated flows currently depend on baking `EXPO_PUBLIC_E2E_*` into Metro, which forces packager restarts between unauth/auth, flakes when env flags fail to load, and fights `clearState` + dev-client connect. We need the same Metro process for the whole suite, with fixture auth applied at runtime against the coach-wattz e2e stack.

## What Changes

- Add a **dev/e2e-only** deep link that mints a fixture Bearer via coach-wattz `POST /api/__e2e/token` and seeds SecureStore (no system-browser PKCE).
- Wire Maestro authenticated flows to `openLink` that URL after Metro connect; unauth smoke stays untouched.
- Keep optional env-based `EXPO_PUBLIC_E2E_AUTH` seed as a CI fallback; prefer deep-link login for local Maestro.
- Document the path in `docs/e2e.md` + `docs/deep-links.md`.
- Harden `connect-dev-client` so it does not double-attach Metro (tap **or** deep-link packager, not both).

## Capabilities

### New Capabilities
- `e2e-deeplink-login`: Runtime fixture login via `coachwatts://e2e/login` for Maestro / local smoke against the e2e API.

### Modified Capabilities
- *(none — oauth-pkce product auth unchanged; this is a test-only bypass)*

## Impact

- Mobile: deep-link resolver / `+native-intent`, auth bootstrap, Maestro YAML + `docs/e2e.md` / `docs/deep-links.md`.
- Backend: uses existing coach-wattz `POST /api/__e2e/token` (E2E stack `:3199` only). No new server endpoints; soft-activated e2e seed (goal + plan) remains a coach-wattz fixture concern.
- Store / preview / production: deep link must refuse non-allowlisted hosts and must not ship enabled auth bypass on store profiles.
