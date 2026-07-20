# 005 — EAS credentials & production secrets

**Area:** build · **Priority:** high · **Status:** open

**Depends on:** [001](./001-apple-developer-account.md)

## Goal

EAS can sign iOS production builds and release env is configured without committing secrets.

## Steps

1. [ ] `eas login` as Expo owner with access to `hdkillers-team` / project `3fad7b8c-dc45-4616-8d77-d48f44d161b2`.
2. [ ] Link Apple Developer team / ASC app (`eas credentials` or first `eas build` interactive flow).
3. [x] Set EAS secrets / env for **preview** and **production**:
   - `EXPO_PUBLIC_SENTRY_DSN` — set (sensitive) on development/preview/production; Sentry org `watt-mind` / project `coach-watts-app`
   - Optional: `EXPO_PUBLIC_SENTRY_RELEASE`, `EXPO_PUBLIC_SENTRY_DIST` (`EXPO_PUBLIC_SENTRY_ENVIRONMENT` already in `eas.json` profiles)
4. [ ] Confirm production profile does **not** set `EXPO_PUBLIC_E2E_AUTH` or fixture tokens ([../../e2e.md](../../e2e.md)).
5. [ ] Confirm production OAuth falls back via `app.json` `extra` (`https://coachwatts.com` + production client id) or set explicit `EXPO_PUBLIC_*` on the profile if preferred.
6. [ ] Document secret *names* (not values) in [log.md](../log.md) when configured.

## Profiles (`eas.json`)

| Profile | Use |
|---------|-----|
| `development` | Dev client, internal |
| `preview` | Internal distribution |
| `production` | App Store / TestFlight submit |

## Done when

- Apple credentials managed by EAS; production secrets set; e2e flags absent from store profiles.
