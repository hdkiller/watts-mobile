# E2E smoke (Maestro)

Automated smoke for the companion shell. Unit logic stays on Vitest; Maestro covers cold launch + tab navigation.

## Prerequisites

- Built dev client on a simulator (`pnpm ios` — iOS Simulator recommended first)
- [Maestro CLI](https://maestro.mobile.dev/getting-started/installing-maestro) installed
- For authenticated smoke: local [coach-wattz](../AGENTS.md) on `http://localhost:3099` and a fixture Bearer token

## E2E auth flavor

When `EXPO_PUBLIC_E2E_AUTH=1`, bootstrap skips system-browser PKCE and seeds SecureStore from env:

| Variable | Purpose |
|----------|---------|
| `EXPO_PUBLIC_E2E_AUTH` | `1` / `true` enables seed |
| `EXPO_PUBLIC_E2E_INSTANCE_URL` | Instance base URL (no `/api`). Defaults to `EXPO_PUBLIC_DEFAULT_INSTANCE_URL` |
| `EXPO_PUBLIC_E2E_ACCESS_TOKEN` | Fixture access token (required when auth is on) |
| `EXPO_PUBLIC_E2E_REFRESH_TOKEN` | Optional refresh token |
| `EXPO_PUBLIC_E2E_ALLOWED_HOSTS` | Extra hostnames (comma-separated) beyond localhost / `127.0.0.1` / `10.0.2.2` |
| `EXPO_PUBLIC_E2E_ALLOW_ANY_HOST` | `1` to skip host allowlist (staging only) |

**Never** set these on production / store EAS profiles. Tokens in `EXPO_PUBLIC_*` are embedded in the JS bundle for that build.

### Simulator → instance URL

| Target | Example URL |
|--------|-------------|
| iOS Simulator | `http://localhost:3099` |
| Android Emulator | `http://10.0.2.2:3099` |
| Physical device | `http://<mac-lan-ip>:3099` |

## Local run

### Unauthenticated smoke

Normal `.env` (e2e auth **off**). App already installed on the sim:

```bash
pnpm test:e2e:unauth
```

### Authenticated shell smoke

1. Put fixture values in `.env` (or export for the Metro process):

```bash
EXPO_PUBLIC_E2E_AUTH=1
EXPO_PUBLIC_E2E_INSTANCE_URL=http://localhost:3099
EXPO_PUBLIC_E2E_ACCESS_TOKEN=<athlete access token>
```

2. Restart Metro so env is picked up, reload the app (or relaunch the binary).

3. Run:

```bash
pnpm test:e2e:shell
```

Or all flows under `maestro/`:

```bash
pnpm test:e2e
```

Mint a token however you already do for API smoke (signed-in session against local IdP / CLI). Do not commit tokens.

## EAS profile

`eas.json` includes an `e2e` profile that extends `development` and sets `EXPO_PUBLIC_E2E_AUTH=1` + localhost instance. Supply `EXPO_PUBLIC_E2E_ACCESS_TOKEN` via EAS secrets or local env when building — not committed.

## Flows

| File | What it checks |
|------|----------------|
| `maestro/smoke-unauth.yaml` | Cold start → login screen |
| `maestro/smoke-shell.yaml` | Seeded auth → Today → Log → Coach → More |
