## Context

Web `ShareCoachWattsModal` encoded a homepage UTM link with no referrer identity. Coaching invites use `/join/{CODE}` for relationships and are out of mobile scope. Native athletes need a fast QR for gym sharing, with server-side A→B attribution for a future rewards program.

## Goals / Non-Goals

**Goals:**

- Stable per-athlete opaque referral code and share URL (`/join?via=CODE` + UTMs)
- First-touch attribution on new account create (cookie + claim fallback)
- Mobile More → Invite friends (QR, copy, Share) on hosted/local instances
- Track-only v1 (status `ATTRIBUTED`; reserve `REWARDED` / `REVOKED`)

**Non-Goals:**

- Granting trial/days rewards on successful referral
- Coaching team / coach↔athlete invite admin in the app
- Smart App Store / Play redirect landing
- Cross-tenant referrals for arbitrary self-hosted instances

## Decisions

1. **Param `via` (not `ref`)** — `ref` already maps to campaign `referral_type` (e.g. hall-of-fame). Personal codes use `via` → `referral_code` in acquisition analytics.
2. **Stable code, lazy mint** — one reusable code per user until regenerate; gym QR stays valid.
3. **Cookie `cw_via` + claim API** — OAuth strips query params; httpOnly cookie bridges signup; client plugin calls `POST /api/referrals/claim` as fallback when auth events miss the request context.
4. **Hosted/local mobile entry only** — `coachwatts.com` and loopback; hide on custom self-hosted hosts.
5. **Landing = `/join`** — signup first; store download remains a later web concern.

## Risks / Trade-offs

- [Auth event lacks request] → Mitigation: claim endpoint + client plugin after session.
- [Self-referral / invalid codes] → Silent ignore; never overwrite first touch.
- [expo-clipboard native] → Rebuild dev client after install.

## Migration Plan

1. Deploy coach-wattz migration + APIs + web modal/cookie/claim.
2. Ship mobile invite surface against the new API.
3. Smoke: A opens share URL → B signs up → `Referral` row A→B.
