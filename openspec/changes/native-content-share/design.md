## Context

Mobile can open activity and planned detail, and Invite friends already uses the OS Share sheet with an attributed `/join?via=` URL. Web can mint public share pages via `POST /api/share/generate` (`WORKOUT`, `PLANNED_WORKOUT`, …) that render under `/share/...` with a Get Started → `/join` CTA.

Product baseline currently buckets “share” with templates / Intervals as web leftovers. That conflates **catalog/publish control-room** work with **field content share**, which athletes expect on phone and which is a growth channel.

Attribution gap: `server/middleware/referral-via.ts` only sets the `cw_via` cookie on `/join` paths. Share layout CTAs currently link to bare `/join`, so `?via=` on a `/share/...` URL would not attribute today.

## Goals / Non-Goals

**Goals:**

- Share completed activities and planned workouts from detail screens via the system Share sheet.
- Recipients land on **public share pages** (not private deep links), then Join / Get Started.
- Shares are **attributed** to the sharer’s athlete referral code (same A→B system as Invite friends).
- Amend product baseline language so native content share is in-scope; templates / Intervals stay web.
- Reuse existing Bearer APIs; no second share-token system on mobile.

**Non-Goals:**

- Plan templates, save-as-template, plan catalog, Intervals.icu publish.
- Native share for chat, nutrition day, wellness, AI report, or full training-plan public access UI.
- Full web share-modal parity (expiry picker, force-new, revoke, QR, OG image editor).
- Shipping `expo-sharing` file/GPX export.
- Rewards for referrals (track-only, same as Invite friends).

## Decisions

### 1. Public share URL + client-side attribution compose

**Choice:** Mint with `POST /api/share/generate` `{ resourceType, resourceId }` → `{ token, url }`, then append referral query params on the client before `Share.share`.

**Attributed URL shape:**

```
{site}/share/workouts/{token}?via={CODE}&utm_source=in_app_share&utm_medium=mobile_content_share&utm_campaign=athlete_referral&utm_content=workout
{site}/share/planned-workout/{token}?via=...&utm_content=planned_workout
```

**Why not share `/join?via=` only:** Growth needs the workout/plan preview as the hook; Join is the conversion CTA on that page.

**Why not private deep links (`/go/activities/:id`):** Recipients without the app (or without auth) cannot convert; public pages are the growth surface.

**Alternatives considered:** Server returns attributed URL from generate — rejected for v1 to avoid coupling share mint to referrals; client compose reuses `GET /api/referrals/me` already in the app.

### 2. coach-wattz must persist `via` from share landings

**Choice (both):**

1. Extend `referral-via` middleware to also accept `via` on `/share` and `/share/**` (and training-plan access paths if needed later).
2. Share layout / `SharePageCTA` Get Started links MUST forward current `via`, `utm_medium` / source, and useful UTMs into `/join?...`.

**Why both:** Middleware covers browse-then-join; CTA forwarding covers clients that strip cookies or land Join in a new context.

**Medium:** Add `mobile_content_share` to `ReferralShareMedium` (and `normalizeReferralSource`) so content shares are distinguishable from Invite QR / generic link. Cookie source + analytics use that medium.

### 3. Thin mobile module; mirror Invite share UX

**Choice:** `src/features/content-share/` (or similar) with:

- `generateShareLink(resourceType, resourceId)` → API call
- `attributeShareUrl(publicUrl, { code, medium, content })` → URL with query params
- `shareContent({ title?, url })` → `Share.share` (same RN API as invite)

UI: Share control on `app/(app)/activity/[id].tsx` and `app/(app)/planned/[id].tsx` (toolbar / overflow — match existing detail chrome). Loading + error toasts/haptics; do not mint on screen open (mint on Share press).

**Gate:** Hosted + local instances that already expose referrals (same allowlist spirit as Invite). If referral fetch fails, still allow share of **unattributed** public URL rather than blocking share entirely; log/analytics that attribution was skipped.

### 4. Default token expiry

**Choice:** Omit `expiresIn` / `forceNew` so server defaults apply (currently 30 days, reuse active token). No revoke UI on mobile.

### 5. Baseline doc split

**Choice:** Update `docs/product-baseline.md` (and coach-wattz companion doc in the same train when that repo is touched) to say:

- **Native:** attributed public share for activity + planned (OS Share sheet).
- **Web leftovers:** templates / catalog / Intervals publish / deep share admin.

Plan tab “Templates & share on web” remains for templates/publish; it is not the activity/planned share path.

## Risks / Trade-offs

- **[Attribution broken if only mobile ships]** → Ship / require coach-wattz middleware + Join CTA forwarding in the same release train; mobile QA includes cold open of attributed share URL → Get Started → cookie/`via` present.
- **[Self-hosted without referral product]** → Share still works unattributed; Invite already gates some surfaces — keep content share available wherever `share/generate` succeeds.
- **[Privacy / oversharing]** → Reuse web PREVIEW token semantics and existing share sanitization; no new payload surface on mobile.
- **[Token reuse surprises]** → Reusing active tokens matches web `useResourceShare`; acceptable for v1.
- **[Share sheet message vs url platform quirks]** → Follow Invite pattern (`message` + `url`); keep message short with URL for Android.

## Migration Plan

1. Land coach-wattz attribution fixes + medium enum (deploy API/web first or same window).
2. Land mobile Share affordances + Vitest for URL attribution helper.
3. Amend product-baseline (and companion doc).
4. Maestro: assert Share control visible on activity + planned detail (sheet itself is OS — do not automate Messages).
5. Rollback: hide Share controls / feature-flag if needed; tokens already minted remain valid until expiry (same as web).

## Open Questions

- None blocking v1. Follow-ups: AI report share, nutrition day share, in-app revoke, richer share card image attachment via `expo-sharing`.
