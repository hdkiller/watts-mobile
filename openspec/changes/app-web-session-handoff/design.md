## Context

Mobile Open web uses `WebBrowser.openBrowserAsync(instanceUrl)` (and path variants). Auth is OAuth Bearer in SecureStore; web is Auth.js / NuxtAuth cookie sessions (`Session` + `next-auth.session-token`). There is no Bearer→cookie bridge today. PKCE login uses a non-ephemeral auth session so cookies *sometimes* already exist in Safari’s jar, but that is unreliable (Android Custom Tabs, expiry, cleared data, refresh-without-reauth).

coach-wattz already mints DB sessions for e2e (`POST /api/__e2e/login`) and impersonation — the production handoff should follow that pattern with a short-lived single-use code.

## Goals / Non-Goals

**Goals:**
- From any authenticated Open web (instance) CTA, land in the web app as the same user without a second interactive login.
- Keep the handoff secure: no access tokens in URLs; short TTL; single-use; same-origin redirect only.
- Degrade gracefully if mint/consume fails (open bare URL).
- Work for hosted and self-hosted instance URLs.

**Non-Goals:**
- SSO into third-party sites (privacy/terms/support).
- Embedding the full web app in a WebView.
- Changing PKCE login or replacing cookies with Bearer on the web.
- Long-lived “remember this browser from the app” tokens beyond a normal web session.
- Auto-handoff for every external `https://` link in chat markdown (only curated Open web / instance paths).

## Decisions

1. **Two-step mint + consume (not token-in-URL)**  
   - `POST /api/auth/app-web-handoff` with `Authorization: Bearer …` and optional `{ returnTo?: string }`  
   - Response: `{ url: string, expiresIn: number }` where `url` is absolute instance consume URL including one-time `code`.  
   - Browser opens `url` → server validates, deletes code, creates `Session`, sets cookie, `302` to `returnTo` (default `/`).  
   - **Why:** Industry standard; Bearer never appears in browser history/referrers.  
   - **Alt considered:** Cookie reuse only — rejected as too flaky. WebView + cookie inject — rejected for escape-hatch UX.

2. **Code storage: `VerificationToken`**  
   - `identifier`: `app-web-handoff:<userId>`  
   - `token`: high-entropy opaque code (e.g. 32 bytes hex/base64url)  
   - `expires`: now + 60s  
   - On mint: replace any prior unused code for that identifier (one outstanding handoff per user).  
   - On consume: delete-then-use (or transaction) so replay fails.  
   - **Why:** Existing Prisma model; no migration.  
   - **Alt:** New `AppWebHandoff` table — clearer but unnecessary for v1.

3. **Authz for mint**  
   - `requireAuth` with Bearer (or session — harmless). Any valid companion access token is enough; no new OAuth scope.  
   - Deactivated users rejected by existing guard.  
   - **Why:** Opening web as yourself is not a privileged scope; adding `offline_access`-style scope noise is unnecessary.

4. **`returnTo` allowlist**  
   - Accept only relative paths starting with `/`, rejecting `//`, schemes, and `..` segments.  
   - Resolve against instance `siteUrl` / request origin.  
   - Mobile passes paths already used today (`/`, `/nutrition`, `/calendar`, `/workouts/:id`, profile settings path, etc.).

5. **Cookie parity with Auth.js**  
   - Create `prisma.session` row (sessionToken UUID, expires ~30 days or match NuxtAuth session maxAge if configured).  
   - Set httpOnly, sameSite=lax, path=/; use `__Secure-next-auth.session-token` + `secure` when request is HTTPS, else `next-auth.session-token` (match e2e/impersonation + Auth.js).  
   - Do not invent a parallel cookie name.

6. **Mobile shared helper**  
   - `openInstanceWeb(path = '/')` in e.g. `src/features/account/openInstanceWeb.ts`:  
     1. Mint via API client (Bearer)  
     2. `WebBrowser.openBrowserAsync(handoffUrl)`  
     3. On mint error → open `absoluteInstanceUrl(instance, path)` and optionally soft toast  
   - All instance Open web CTAs call this; privacy/terms/support keep direct open.  
   - Chat markdown links: only hand off when href is same instance origin; otherwise open as today (or out of scope — prefer same-origin only in this change).

7. **Consume UX**  
   - Prefer a thin server route `GET /api/auth/app-web-handoff/consume?code=&returnTo=` that sets cookie + redirects (no Vue page required).  
   - Invalid/expired code → redirect to `/login?error=handoff_expired` (or login with callbackUrl) so the athlete can still sign in.

## Risks / Trade-offs

- **[Risk] Code interception if URL leaks** → Mitigation: 60s TTL, single-use, HTTPS in prod, no sensitive payload in query beyond opaque code.  
- **[Risk] Cookie name / secure flag mismatch → web ignores session** → Mitigation: mirror Auth.js + existing e2e login; smoke on https prod and http localhost.  
- **[Risk] Older self-hosted instances lack the endpoint** → Mitigation: mobile 404/5xx → bare URL fallback.  
- **[Risk] Race: user taps Open web twice** → Mitigation: last mint wins; first consume invalidates prior code.  
- **[Trade-off] Full web session power from companion token** → Acceptable: user already authenticated as themselves; session is standard web session, not elevated.  
- **[Trade-off] Chat external links not handed off** → Intentional; only instance Open web paths.

## Migration Plan

1. Ship coach-wattz mint + consume (+ unit tests) and deploy hosted.  
2. Ship mobile helper + wire CTAs; works against new API, falls back on old instances.  
3. Record decision in `docs/open-questions.md`.  
4. Rollback: disable or remove mint route; mobile fallback keeps Open web working (re-login).

## Open Questions

- Exact NuxtAuth `session.maxAge` — match it when creating the DB session (confirm in auth config at implement time).  
- Whether chat same-origin links should use handoff in this change or a follow-up (default: **yes for same-origin**, no for external).  
- Rate limit: rely on existing API limits vs explicit per-user mint cap (e.g. 10/min) — prefer light per-user throttle if cheap.
