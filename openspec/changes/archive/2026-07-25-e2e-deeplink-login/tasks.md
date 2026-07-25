## 1. Deep-link parse + mint

- [x] 1.1 Add `parseE2eLoginDeepLink` + pending e2e login storage (email + instance URL)
- [x] 1.2 Add `mintE2eToken` client calling `POST {instance}/api/__e2e/token` with host allowlist reuse
- [x] 1.3 Unit tests for parse defaults, query overrides, and host refusal

## 2. Auth bootstrap wire-up

- [x] 2.1 Handle e2e login in `+native-intent` (store pending; do not treat as product app href)
- [x] 2.2 Consume pending e2e login in `AuthProvider` bootstrap (before env seed); seed tokens + userinfo
- [x] 2.3 Keep `applyE2eAuthSeed` as optional fallback when env flag is set

## 3. Maestro + docs

- [x] 3.1 Harden `maestro/subflows/connect-dev-client.yaml` (no double packager attach)
- [x] 3.2 Add `maestro/subflows/e2e-login.yaml` and `runFlow` it from authenticated flows
- [x] 3.3 Update `docs/e2e.md` + `docs/deep-links.md`; register any new suite entry in validate script if needed
- [x] 3.4 Run `pnpm test:e2e:validate`, Vitest for new units, and local `smoke-unauth` + `smoke-shell` / `flow-today-recommendation` against `:3199`
