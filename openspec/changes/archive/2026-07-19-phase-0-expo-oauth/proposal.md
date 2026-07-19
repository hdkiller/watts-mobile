## Why

The companion app has no runnable client yet. Phase 0 must establish an Expo + TypeScript foundation with OAuth PKCE so later Today/Log/Coach work can call the Coach Watts API with secure tokens.

## What Changes

- Scaffold an Expo (React Native) + TypeScript app with Expo Router at the repo root
- Add NativeWind + basic Coach Watts brand tokens
- Add instance URL onboarding (hosted or self-hosted) with reachability check
- Implement OAuth 2.0 Authorization Code + PKCE sign-in via system browser
- Persist access/refresh tokens in Secure Store; refresh on 401; sign out
- Add TanStack Query + authenticated API client wrapper
- Add authenticated shell with placeholder tabs (Today · Log · Coach · More) and Open web
- Add env/config for client id, default instance URL, redirect URI scheme
- Stub Sentry React Native initialization

## Capabilities

### New Capabilities

- `app-shell`: Expo Router app structure, theme tokens, tab shell, Open web escape hatch
- `instance-config`: First-launch / settings instance base URL capture and validation
- `oauth-pkce`: OAuth Authorization Code + PKCE login, token storage, refresh, sign-out
- `api-client`: Bearer HTTP client with TanStack Query provider and 401 refresh handling

### Modified Capabilities

- _(none — greenfield)_

## Impact

- **This repo:** new Expo app, dependencies, env example; first runnable binary/simulator target
- **coach-wattz (dependency):** OAuth client registration + redirect URIs for the companion (dev/prod); public/native client + PKCE must work end-to-end — coordinate separately if not already provisioned
- **Out of scope:** Today data, wellness log, chat, push, HealthKit, store submission
