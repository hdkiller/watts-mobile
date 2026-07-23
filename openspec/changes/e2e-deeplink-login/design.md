## Context

Authenticated Maestro flows today seed tokens via `EXPO_PUBLIC_E2E_AUTH` + Metro env. That couples auth to the packager process, requires restarts between unauth/auth, and recently failed when `EXPO_PUBLIC_E2E_AUTH` did not appear in Expo’s loaded env even though it was in `.env.local`. coach-wattz already exposes `POST /api/__e2e/token` on the e2e stack (`:3199`).

## Goals / Non-Goals

**Goals:**

- One Metro process for unauth + auth Maestro runs.
- Runtime fixture login via deep link that calls `__e2e/token` and seeds SecureStore.
- Host allowlist (localhost / `127.0.0.1` / `10.0.2.2` + optional extras) so production hosts cannot be used.
- Maestro auth flows: connect packager → `openLink` e2e login → assert shell.

**Non-Goals:**

- Disabling API auth on the e2e server.
- Automating real PKCE / system browser.
- Changing product OAuth for athletes.
- Universal-link hosting for `/e2e/login` (scheme-only is enough for Maestro).

## Decisions

1. **Deep link shape** — `coachwatts://e2e/login?email=<fixture>&instance=<baseUrl>`  
   - Defaults: email `e2e-athlete@coachwatts.test`, instance `http://127.0.0.1:3199` (iOS Simulator; avoid `localhost` / `::1`).  
   - Rationale: mirrors web `__e2e/login`; query params keep email readable; no “open API”.

2. **Pending intent + Auth bootstrap** — `+native-intent` parses the URL, stores a pending e2e login payload, returns `/` (or login). `AuthProvider` bootstrap consumes it (before optional env seed), mints token, sets instance + tokens, then `fetchUserInfo`.  
   - Alternative considered: handle entirely inside `+native-intent` (harder to update React auth state).  
   - Alternative considered: env-only seed (status quo; rejected for Metro coupling).

3. **Keep env seed as fallback** — `applyE2eAuthSeed()` remains for CI binaries that bake a token. Maestro local docs prefer deep link.

4. **Packager connect** — `connect-dev-client` taps one `:8081` row **or** deep-links the packager when stuck on “In progress”, never both (avoids `ExpoFabricView` / `AppContextLost` races).

5. **Maestro shared subflow** — `maestro/subflows/e2e-login.yaml` with the canonical `openLink`; auth flows `runFlow` it after connect.

## Risks / Trade-offs

- **[Risk] Deep link works on a store build against a misconfigured host** → Mitigation: refuse non-allowlisted hosts; `__e2e/token` only exists when coach-wattz `E2E_MODE` is on.  
- **[Risk] Query stripped by existing path normalizer** → Mitigation: parse full URL in a dedicated `parseE2eLoginDeepLink` before pathname-only resolve.  
- **[Risk] Soft-activated fixture missing** → Mitigation: document coach-wattz seed (goal + plan); companion still needs soft activation for Today shell.

## Migration Plan

1. Ship deep-link login + Maestro subflow; update `docs/e2e.md`.  
2. Local workflow: Metro without `EXPO_PUBLIC_E2E_AUTH`; auth flows use `e2e-login` subflow.  
3. CI may keep env seed until migrated to deep link + reachable e2e API.  
4. Rollback: revert Maestro YAML to env seed; leave deep link inert if unused.

## Open Questions

- None blocking — Android emulator default instance (`http://10.0.2.2:3199`) can be passed explicitly in the Maestro `openLink` when Android is added to the suite.
