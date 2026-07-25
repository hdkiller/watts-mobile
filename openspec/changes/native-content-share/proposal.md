## Why

Athletes expect to share a completed workout or planned session from their phone. Today mobile only shares Invite friends links; plan/workout “share” is documented as web-only, which blocks a natural growth loop. Web already mints public share pages — mobile should reuse them with referral attribution so recipients who join credit the sharer.

## What Changes

- **BREAKING (product baseline):** Split “share” leftovers — **native content share** (activity + planned → public share page + OS Share sheet) becomes in-scope; plan templates / catalog / Intervals publish remain web.
- Add Share on **activity detail** and **planned workout detail** (system Share sheet).
- Mint public URLs via existing `POST /api/share/generate` (`WORKOUT` / `PLANNED_WORKOUT`).
- Attribute shares: append sharer’s referral `via` + UTMs so landing → Join → signup credits Athlete A→B (same referral system as Invite friends).
- **coach-wattz:** preserve attribution when recipients land on `/share/*` then tap Get Started / Join (today `via` cookie is only set on `/join`).
- Update `docs/product-baseline.md` (and coach-wattz `mobile-companion-app.md` when touching that repo) so “share stays web” no longer means “no native content share.”

## Capabilities

### New Capabilities

- `native-content-share`: Mint attributed public share links for completed activities and planned workouts; present OS Share sheet from detail screens; recipients land on public share pages that funnel to Join with referral attribution.

### Modified Capabilities

- `recent-activity`: Activity summary gains a Share action that mints/shares an attributed public workout link.
- `upcoming-planned`: Planned detail gains a Share action that mints/shares an attributed public planned-workout link.

## Impact

- **watts-mobile:** activity + planned detail UI; thin share feature module (generate + attribute + `Share.share`); reuse `GET /api/referrals/me` for referral code; Maestro coverage for share affordances; product-baseline doc amendment.
- **coach-wattz (required for growth attribution):** `referral-via` middleware and/or share layout Join CTAs must persist `via` (+ medium) from `/share/*` landings; optional new referral medium for content-share analytics (`mobile_content_share` or equivalent).
- **APIs reused:** `POST /api/share/generate` (`workout:read` — already on Official Mobile App), `GET /api/referrals/me`.
- **Out of scope:** plan templates / catalog / public plan share UI, Intervals publish, chat / nutrition / wellness / AI report share, full web share-modal parity (expiry picker, revoke, OG editor).
