## 1. coach-wattz attribution for share landings

- [ ] 1.1 Add `mobile_content_share` to `ReferralShareMedium` + `normalizeReferralSource` (shared + server) with unit coverage
- [ ] 1.2 Extend `referral-via` middleware to persist `via` on `/share` and `/share/**` (not only `/join`)
- [ ] 1.3 Forward `via` + UTM/source from share layout / `SharePageCTA` Get Started links into `/join?...`
- [ ] 1.4 Smoke: open `/share/workouts/{token}?via=CODE` → Get Started → confirm `cw_via` / join attribution path

## 2. Mobile content-share module

- [ ] 2.1 Add `src/features/content-share/` API helper for `POST /api/share/generate` (`WORKOUT` | `PLANNED_WORKOUT`)
- [ ] 2.2 Add `attributeShareUrl` helper (`via`, `utm_source=in_app_share`, `utm_medium=mobile_content_share`, `utm_campaign=athlete_referral`, `utm_content`)
- [ ] 2.3 Add `sharePublicContent` wrapper around RN `Share.share` (Invite-compatible message/url)
- [ ] 2.4 Vitest: attribution URL composition + generate request shape

## 3. Detail screen affordances

- [ ] 3.1 Wire Share on activity summary (`app/(app)/activity/[id].tsx`) — mint on press, attribute when referral available, honest error
- [ ] 3.2 Wire Share on planned detail (`app/(app)/planned/[id].tsx`) — same flow with `PLANNED_WORKOUT`
- [ ] 3.3 Add `testID`s for Share controls (`activity-share`, `planned-share` or equivalent)

## 4. Baseline + companion docs

- [ ] 4.1 Update `docs/product-baseline.md`: native attributed activity/planned share in-scope; templates / Intervals remain web
- [ ] 4.2 Update coach-wattz `docs/06-plans/mobile-companion-app.md` in the same train when touching that repo
- [ ] 4.3 Note decision in `docs/open-questions.md` if a prior “share stays web” open item exists

## 5. E2E + verification

- [ ] 5.1 Maestro: assert Share affordance on activity + planned detail (do not automate OS sheet targets)
- [ ] 5.2 Manual: share → open attributed URL in browser → Get Started → signup attribution (hosted)
- [ ] 5.3 Confirm unattributed fallback still opens Share sheet when referrals API fails
