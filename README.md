# Coach Watts Mobile

Native iOS/Android **field companion** for [Coach Watts](https://coachwatts.com).

Web stays the control room (planning, analytics, integrations, billing). This app covers the daily athlete loop: today’s recommendation, check-in, light Coach chat, notifications, and account glue — not a full web port.

| Layer | Choice |
|-------|--------|
| Runtime | Expo (React Native) + TypeScript + **`expo-dev-client`** |
| Navigation | Expo Router |
| UI | React Native + NativeWind |
| Server state | TanStack Query |
| Auth | OAuth 2.0 Authorization Code + PKCE (S256); Bearer tokens in Secure Store |
| Push | Expo Notifications → APNs / FCM |
| Observability | Sentry React Native |

**Tabs:** Today · Log · Coach · More

## Prerequisites

- **Node.js** 20+ (workspace commonly uses Node 24) and **pnpm** 9+
- **Xcode** + iOS Simulator (or a physical iPhone) for iOS
- **Android Studio** + emulator (or a device) for Android
- Local [coach-wattz](https://github.com/hdkiller/coach) API/IdP on `http://localhost:3099` for day-to-day auth (or point `.env` at production)
- Optional for e2e: [Maestro CLI](https://maestro.mobile.dev/getting-started/installing-maestro)

Use the **dev client** binary, not Expo Go, for day-to-day work. Native modules (notifications, HealthKit, maps, widgets, etc.) are not available in Expo Go.

## Quick start

```bash
pnpm install
cp .env.example .env
# Defaults to local coach-wattz (localhost:3099). Production pair is commented in .env.

# First run / after adding native packages: build the expo-dev-client binary
pnpm ios       # iOS Simulator
# or: pnpm android

# Day-to-day JS iteration (binary already installed)
pnpm start
```

| Target | Typical instance URL |
|--------|----------------------|
| iOS Simulator | `http://localhost:3099` |
| Android Emulator | `http://10.0.2.2:3099` |
| Physical device | `http://<your-lan-ip>:3099` |

### OAuth client (coach-wattz)

The companion is a **public** PKCE client (no secret in the binary). Official client IDs and redirect registration live in [docs/oauth-setup.md](./docs/oauth-setup.md).

```bash
cd ~/Develop/coach-wattz
pnpm cw:cli oauth create-mobile-app --owner-email you@example.com
```

Redirect URI for the standalone/dev client: `coachwatts://oauth/callback`.

## Development

### Day-to-day loop

1. Ensure coach-wattz is running locally (or switch `.env` to production).
2. Start Metro: `pnpm start`
3. Open the already-installed dev client on simulator/device (or press `i` / `a` in the Expo CLI).
4. Sign in via system browser OAuth → land on Today.

Restart Metro after changing `EXPO_PUBLIC_*` env vars so the new values are picked up.

### When to rebuild the native binary

Metro alone will **not** link new native code. Rebuild after:

- Adding/upgrading a package with iOS/Android native code
- Changing config plugins or permissions in `app.json` / `app.config.ts`

```bash
pnpm ios       # or pnpm android
```

Symptom of a stale binary: `Cannot find native module '…'`. Details: [docs/native-modules.md](./docs/native-modules.md).

### Free Personal Team (physical iPhone)

A free Apple ID cannot provision Push, Associated Domains, HealthKit, or App Groups. For on-device installs without a paid team:

```bash
pnpm ios:free-team:prebuild          # regenerate ios/ without paid entitlements
pnpm ios:free-team:device            # Debug (needs Metro)
pnpm ios:free-team:device:release    # Release (JS bundled; works unplugged)
```

Push, universal links, Health prefill, and the home-screen widget are unavailable on that binary. Switch back to the full app with a clean prebuild (no `IOS_FREE_TEAM`) before simulator/paid-team work — see [docs/native-modules.md](./docs/native-modules.md).

### Scripts

| Command | Description |
|---------|-------------|
| `pnpm start` | Expo / Metro dev server |
| `pnpm ios` / `pnpm android` | Build & run the dev client |
| `pnpm ios:free-team:*` | Capability-stripped Personal Team device builds |
| `pnpm typecheck` | TypeScript (`tsc --noEmit`) |
| `pnpm lint` | Expo ESLint + theme-token check |
| `pnpm lint:theme` | Theme-token check only |
| `pnpm test` | Unit tests (Vitest, once) |
| `pnpm test:watch` | Vitest watch mode |
| `pnpm test:e2e` | All Maestro flows under `maestro/` |
| `pnpm test:e2e:unauth` | Unauthenticated cold-start smoke |
| `pnpm test:e2e:shell` | Authenticated tab-shell smoke |

## Testing

### Unit tests (Vitest)

Pure mapping/logic tests live next to features under `src/**/__tests__/`.

```bash
pnpm test            # CI-style single run
pnpm test:watch      # while iterating
pnpm typecheck       # separate from Vitest
pnpm lint            # ESLint + theme tokens
```

### E2E smoke (Maestro)

Maestro covers cold launch and tab navigation. Prerequisites: a built dev client on a simulator and the Maestro CLI. Full details: [docs/e2e.md](./docs/e2e.md).

**Unauthenticated** (normal `.env`, e2e auth off):

```bash
pnpm test:e2e:unauth
```

**Authenticated shell** — seed Secure Store instead of browser PKCE:

```bash
# In .env (never commit tokens; never enable on store builds)
EXPO_PUBLIC_E2E_AUTH=1
EXPO_PUBLIC_E2E_INSTANCE_URL=http://localhost:3099
EXPO_PUBLIC_E2E_ACCESS_TOKEN=<athlete access token>
```

Restart Metro, reload the app, then:

```bash
pnpm test:e2e:shell
# or all flows:
pnpm test:e2e
```

| Flow | What it checks |
|------|----------------|
| `maestro/smoke-unauth.yaml` | Cold start → login screen |
| `maestro/smoke-shell.yaml` | Seeded auth → Today → Log → Coach → More |

## Project layout

```
app/                 Expo Router screens (tabs + stacks)
src/features/        Feature modules (today, log, nutrition, …)
src/components/      Shared UI (Button, SportIcon, …)
src/linking/         Deep-link path map + resolver
src/theme/           Colors / theme tokens
maestro/             Maestro e2e flows
openspec/            Change proposals, specs, and archive
docs/                Product baseline, OAuth, e2e, distribution, …
plugins/             Expo config plugins (e.g. free-team strip)
```

## Docs

| Doc | Purpose |
|-----|---------|
| [docs/product-baseline.md](./docs/product-baseline.md) | Positioning, v1 scope, IA, non-goals |
| [docs/DESIGN.md](./docs/DESIGN.md) | UI conventions and shared components |
| [docs/implementation-plan.md](./docs/implementation-plan.md) | Delivery phases |
| [docs/oauth-setup.md](./docs/oauth-setup.md) | OAuth client IDs + redirect URIs |
| [docs/e2e.md](./docs/e2e.md) | Maestro + e2e auth seed |
| [docs/native-modules.md](./docs/native-modules.md) | When to rebuild the binary |
| [docs/deep-links.md](./docs/deep-links.md) | Scheme / universal link map |
| [docs/distribution.md](./docs/distribution.md) | App Store / Play shipping hub |
| [AGENTS.md](./AGENTS.md) | Agent / contributor working rules |

Index of all docs: [docs/README.md](./docs/README.md).

## Related repositories

| Repo | Role |
|------|------|
| [coach-wattz](https://github.com/hdkiller/coach) | Production web + API + OAuth IdP |
| watts-marketing | Brand / outreach knowledge |

API base (hosted): `https://coachwatts.com/api/`  
Local default: `http://localhost:3099/api/`
