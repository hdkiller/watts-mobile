## Why

App Store Guideline **4.8 (Login Services)** requires an equivalent privacy-preserving login when Google (or similar) is used to create or authenticate the user’s primary Coach Watts account. Today the mobile PKCE path opens `/oauth/login` with **Google** and **Intervals.icu** only — no Sign in with Apple (SIWA) and no first-party email/password. ASC demo credentials alone do not satisfy 4.8. First TestFlight / App Review is imminent, so SIWA is the clearest compliance path.

## What Changes

- Add **Sign in with Apple** as a first-class Auth.js provider on **coach-wattz** (IdP), with equal prominence on the OAuth login UI used by the official mobile client (`/oauth/login`) and, for consistency, web `/login` / `/join` where other social providers appear.
- Wire Apple Developer / Services ID credentials (key, team, client id, callback URLs) into hosted Auth.js config — secrets stay out of git.
- Ensure Apple-linked accounts create or link the same Coach Watts user model as Google (email + name; respect Hide My Email).
- Update **App Review notes** and distribution docs: reviewer can use SIWA or a dedicated Google demo account; document the Safari → provider → `coachwatts://oauth/callback` flow.
- Mobile companion keeps **OAuth 2.0 + PKCE** unchanged; no native `expo-apple-authentication` required for v1 if the system browser presents SIWA on the IdP page (matches Google today).

## Capabilities

### New Capabilities
- `sign-in-with-apple`: IdP SIWA provider, OAuth login UI parity with Google, account create/link behavior, App Review / distribution documentation for Guideline 4.8.

### Modified Capabilities
- `oauth-pkce`: After authorize redirect to IdP login, athletes MUST be able to complete sign-in via Sign in with Apple in addition to existing providers (no change to PKCE grant or scopes).

## Impact

- **coach-wattz (required):** Auth.js Apple provider; `/oauth/login` (+ web login/join) UI; Apple Services ID + key in deployment secrets; account linking / email privacy handling; optional docs in oauth-provider / authentication guides.
- **watts-mobile:** App Review notes + [docs/distribution](../../docs/distribution.md) / task 008 updates; smoke that PKCE + SIWA returns tokens. No mandatory native Apple Sign-In SDK for this change.
- **Apple Developer / ASC:** App ID + Services ID capability; return URLs for Auth.js callback; may use same Watt Mind team (`42K8S6866N`).
- **Out of scope:** Replacing Google/Intervals; native-only SIWA button inside the Expo app; password/magic-link IdP; changing PKCE scopes or redirect URI.
