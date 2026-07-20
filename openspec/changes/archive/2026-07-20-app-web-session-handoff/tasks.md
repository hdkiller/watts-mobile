## 1. coach-wattz — handoff API

- [x] 1.1 Add `returnTo` path validator (relative `/…` only; reject `//`, schemes, `..`)
- [x] 1.2 Implement `POST /api/auth/app-web-handoff` — `requireAuth`, mint opaque code into `VerificationToken` (`identifier` `app-web-handoff:<userId>`, TTL ≤60s), return `{ url, expiresIn }`
- [x] 1.3 Implement `GET /api/auth/app-web-handoff/consume` — validate+delete code, create `Session`, set Auth.js cookie (`__Secure-` when HTTPS), redirect to `returnTo`
- [x] 1.4 Invalid/expired/replay consume → redirect to login (with safe callback) rather than 500
- [x] 1.5 Unit tests: mint authz, bad `returnTo`, consume once, replay fails, cookie name on http vs https

## 2. watts-mobile — shared Open web helper

- [x] 2.1 Add API client for handoff mint (`POST /api/auth/app-web-handoff` with optional `returnTo`)
- [x] 2.2 Add `openInstanceWeb(path?)` — mint → `WebBrowser.openBrowserAsync(url)`; on failure open bare `absoluteInstanceUrl`
- [x] 2.3 Same-origin chat links (optional in this change per design): if href is instance origin, hand off with path; else open directly

## 3. Wire instance Open web CTAs

- [x] 3.1 More — Open web
- [x] 3.2 Today empty-state Open web
- [x] 3.3 Activity detail + planned detail Open web
- [x] 3.4 Nutrition “Open web for planning”, upcoming/calendar/events Open web, athlete Profile Settings Open web
- [x] 3.5 Leave privacy / terms / support on direct open (no handoff)

## 4. Docs + verify

- [x] 4.1 Record decision in `docs/open-questions.md` (Bearer → cookie handoff for Open web)
- [x] 4.2 Note contract in `docs/oauth-setup.md` or short handoff blurb (mint/consume paths)
- [x] 4.3 Manual: signed-in app → Open web → landed signed in on web; replay URL fails; kill mint route / 404 → bare URL still opens
