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

1. **Path map (initial)**  
   - `/today` → Today tab  
   - `/recommendations/:id` or `/today/recommendation` → Today / recommendation context  
   - `/planned/:id` → planned workout detail  
   - `/activities/:id` → activity summary  
   - `/coach` or `/chat/:roomId?` → Coach tab  
   - `/notifications` → inbox  
   Exact paths finalized to match Expo Router file routes when implementing; keep aliases stable once shipped.

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

- Production host for AASA (`coachwatts.com` vs www / api subdomain)
- Android applicationId / SHA-256 cert fingerprints for assetlinks
- Whether recommendation modify links open chat or a future detail screen
