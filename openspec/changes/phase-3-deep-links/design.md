## Context

OAuth already uses `coachwatts://oauth/callback`. Push Phase 2 will stub routes. Product requires deep links into Today, recommendation, activity, and chat. coach-wattz does not yet host AASA / Digital Asset Links.

## Goals / Non-Goals

**Goals:**
- Single route resolver shared by custom scheme, universal links, and push `path`/`url`
- Correct cold-start and warm-start behavior in Expo Router
- Document host-side association files and path contract for coach-wattz

**Non-Goals:**
- App Clip
- Marketing smart app banner copy beyond pointing at association files
- E2E deep-link automation

## Decisions

1. **Path map (finalized against Expo Router)**  
   - `/today`, `/today/recommendation`, `/recommendations/:id` → `/(app)/(tabs)/today`  
   - `/planned/:id` → `/(app)/planned/:id`  
   - `/activities` → `/(app)/activity`; `/activities/:id` → `/(app)/activity/:id`  
   - `/upcoming` → `/(app)/upcoming`  
   - `/coach`, `/chat`, `/chat/:roomId` → `/(app)/(tabs)/coach`  
   - `/notifications` → `/(app)/notifications` (stub until Phase 2 inbox)  
   - HTTPS uses `https://coachwatts.com/go/*` (same path map after stripping `/go`)  
   Keep aliases stable once the first store build ships. See `docs/deep-links.md`.

2. **Custom scheme always; https universal links when hosted**  
   Ship scheme routing in the app immediately. Universal Links / App Links require team ID, package name, and hosted JSON — tracked as coach-wattz/infra tasks.

3. **Auth gate**  
   If a link opens while logged out, preserve intended path and resume after PKCE completes (same pattern as post-login redirect).

4. **Push alignment**  
   Push payloads SHOULD include `path` matching this map; client falls back to type→default path (`RECOMMENDATION_READY` → `/today`, etc.).

## Risks / Trade-offs

- [AASA not deployed] → Scheme + push still work; https links won’t open the app until infra lands.
- [Path churn] → Freeze aliases in docs once first store build ships.
- [iOS associated domains entitlement] → Needs native config / EAS; may require dev client rebuild.

## Open Questions

- ~~Production host for AASA (`coachwatts.com` vs www / api subdomain)~~ → **`coachwatts.com` + `/go/*`**
- Android SHA-256 cert fingerprints for assetlinks (fill when Play App Signing is configured)
- Whether recommendation modify links open chat or a future detail screen (today: Today tab)
