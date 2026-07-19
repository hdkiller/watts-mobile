# Coach Watts Mobile

Native iOS/Android **companion app** for [coachwatts.com](https://coachwatts.com).

Built with **Expo + TypeScript**, Expo Router, NativeWind, TanStack Query, and OAuth 2.0 PKCE against the Coach Watts IdP.

See [AGENTS.md](./AGENTS.md) and [docs/](./docs/) for product scope and delivery phases.

## Quick start

```bash
pnpm install
cp .env.example .env
# Defaults to local coach-wattz (localhost:3099). Production pair is commented in .env.

pnpm start
```

Then open iOS Simulator, Android emulator, or Expo Go.

### OAuth client registration (coach-wattz)

Official companion is registered as **Official Mobile App** (public + trusted PKCE client):

```bash
cd ~/Develop/coach-wattz
pnpm cw:cli oauth create-mobile-app --owner-email hdkiller@gmail.com
pnpm cw:cli oauth create-mobile-app --owner-email hdkiller@gmail.com --prod --confirm-prod
```

Redirect: `coachwatts://oauth/callback` (Expo Go may print an `exp://…` URI on the Sign in screen — add it with `--force --redirect-uri`).

See [docs/oauth-setup.md](./docs/oauth-setup.md) for client IDs per environment.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm start` | Expo dev server |
| `pnpm ios` / `pnpm android` | Platform targets |
| `pnpm typecheck` | TypeScript check |

## OpenSpec

Active change: `openspec/changes/phase-0-expo-oauth` (Phase 0 scaffold + OAuth PKCE).
