## Context

Mobile auth is OAuth 2.0 Authorization Code + PKCE against coach-wattz. Unauthenticated athletes open the system browser to `/api/oauth/authorize`, which (for the official mobile client) redirects to `/oauth/login` when no web session exists. That page currently offers **Google** and **Intervals.icu** only (`coach-wattz` Auth.js / `@sidebase/nuxt-auth`). There is no Coach Watts email/password.

App Store Guideline **4.8** applies because Google (and similar) establish the primary Coach Watts account. ASC Sign-In Information + review notes do not satisfy 4.8. First store submission needs a compliant IdP login surface.

Stakeholders: Watt Mind App Review readiness (watts-mobile distribution), IdP ownership (coach-wattz), Apple Developer team `42K8S6866N`.

## Goals / Non-Goals

**Goals:**

- Offer **Sign in with Apple** on the IdP login used by mobile PKCE, with prominence comparable to Google.
- Create or link Coach Watts users from Apple identity (name + email; support Hide My Email).
- Keep the mobile companion’s PKCE client, redirect URI, and scopes unchanged.
- Document App Review path (SIWA and/or dedicated Google demo) in distribution docs / ASC notes.

**Non-Goals:**

- Native `expo-apple-authentication` / in-app Apple button (browser IdP SIWA is enough for v1 and matches Google).
- Removing Google or Intervals.
- Adding password, magic link, or passkeys.
- Changing OAuth scopes, client id, or `coachwatts://oauth/callback`.
- Full redesign of web marketing login beyond adding the Apple control where social providers already appear.

## Decisions

### 1. Implement SIWA on coach-wattz Auth.js (not native-only in Expo)

- **Choice:** Add Apple as an Auth.js provider; trigger via `signIn('apple')` from `/oauth/login` (and web `/login` / `/join` for parity).
- **Why:** Guideline 4.8 cares about the login services used to establish the primary account. That happens on the IdP page the system browser already shows. Native SIWA alone would diverge from web and still need server-side token validation / account linking.
- **Alternatives:** Native Expo Apple button → still needs IdP account linking and does not fix web; first-party email/password → larger product change, not needed if SIWA ships.

### 2. Apple Services ID + key for web OAuth callback

- **Choice:** Configure a Services ID (web) with return URL(s) pointing at Auth.js Apple callback on `https://coachwatts.com` (and local/dev if needed). Store key / team / client id in deployment secrets.
- **Why:** Browser-based SIWA through Auth.js uses the web Services ID flow, not only the iOS App ID entitlement.
- **Alternatives:** App-only native SIWA → rejected for this design (see Decision 1).

### 3. Equal prominence on `/oauth/login`

- **Choice:** Add a “Sign in with Apple” control on `/oauth/login` alongside Google (and Intervals), not buried. Prefer Apple’s button guidelines / recognizable black Apple control.
- **Why:** Reviewers and Guideline 4.8 expect an equivalent option, not a hidden secondary path.

### 4. Account linking by email when safe

- **Choice:** Follow existing Auth.js / coach-wattz linking patterns used for Google: new Apple users create a User; if Apple returns a verified email that already maps to an account, link per current Auth.js `allowDangerousEmailAccountLinking` / project policy (document exact flag in implementation). Respect private relay emails as stable identifiers for that Apple account.
- **Why:** Athletes may already have Google accounts; avoid duplicate athletes when Apple shares the same email. Private relay must not be treated as “merge with Google” unless emails match.
- **Alternatives:** Always create a separate Apple-only user → duplicate athletes and support burden.

### 5. Mobile remains PKCE-only

- **Choice:** No watts-mobile auth code change required for happy path beyond docs / review notes / smoke test.
- **Why:** After SIWA, session cookie exists on IdP; authorize continues and returns code to the app as today.

### 6. App Review credentials

- **Choice:** Prefer a dedicated Google review account in ASC (easy to share password) **or** document SIWA with a reviewer Apple ID; notes MUST describe Safari → Sign in with Apple / Google → return to app.
- **Why:** Apple reviewers may not want to use personal Apple IDs; Google demo remains valid once SIWA is also offered for 4.8.

## Risks / Trade-offs

- **[4.8 still rejected if Apple is missing on web-only paths reviewers hit]** → Ship SIWA on `/oauth/login` first (mobile path); also add to `/login` / `/join` in the same change to avoid inconsistency.
- **[Hide My Email / no email on later sign-ins]** → Persist Apple `sub` on Account; do not require email on every login; test first-login vs returning user.
- **[Account linking creates wrong merge]** → Only link on verified email match per Auth.js rules; never invent password reset.
- **[Secrets / key rotation]** → Document Apple key location in ops runbook; never commit `.p8` to git.
- **[Self-hosted instances]** → SIWA credentials are hosted-product concern; self-hosted operators may omit Apple provider (mobile against self-host already depends on that instance’s IdP). Official App Store binary defaults to hosted `coachwatts.com`.
- **[Intervals still present]** → Intervals is a niche training IdP, not a generic “social login” like Google; keep it. Primary 4.8 risk is Google without equivalent.

## Migration Plan

1. Create Apple Services ID + key on Watt Mind team; register Auth.js callback URL(s).
2. Deploy coach-wattz with Apple provider behind env flags / secrets (dark launch OK if UI gated on config present).
3. Enable SIWA buttons on `/oauth/login` (+ web login/join).
4. Smoke: mobile PKCE → Apple → tokens → Today; also Google regression.
5. Update ASC notes + [008](../../docs/distribution/tasks/008-reviewer-demo-account.md); optional Apple-ID review account.
6. Rollback: remove Apple button / unset Apple env → previous Google/Intervals-only login (reopens 4.8 risk — only for emergency).

## Open Questions

1. Exact Auth.js Apple env var names already used (if any) in coach-wattz deploy — align with existing secret store.
2. Whether to show SIWA above Google on `/oauth/login` (Apple HIG often puts Apple first when present) — default **Apple first**, then Google, then Intervals.
3. Need for a one-time “link Apple to existing Google athlete” support playbook if reviewers or users hit duplicates — document after first staging test.
