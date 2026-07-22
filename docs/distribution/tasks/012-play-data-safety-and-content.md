# 012 — Play Data safety & content ratings

**Area:** listing · **Priority:** medium · **Status:** done

**Depends on:** [011](./011-play-console-app.md)  
**Copy source:** [../../store-privacy-checklist.md](../../store-privacy-checklist.md)

## Goal

Complete Google Play Data safety, content rating, and target-audience forms without medical claims.

## Progress (2026-07-21)

Saved in Play Console:

| Item | Status |
|------|--------|
| Store settings — category **Health & Fitness** | done |
| Store settings — contacts (`support@coachwatts.com`, `+36302858822`, `https://coachwatts.com`) | done |
| Privacy policy (`https://coachwatts.com/privacy`) | done |
| Ads — no ads | done |
| Government apps — no | done |
| Financial features — none | done |
| Advertising ID — no | done |
| Sign in details — Yes (restricted); Google demo `coachwatts.play.review@gmail.com` (password in password manager only) | done → [008](./008-reviewer-demo-account.md) |
| Target audience — **18 and over** | done |
| Health apps — Activity and fitness, Nutrition and weight management, Sleep management (not a medical device) | done |
| Content rating (IARC) — All Other App Types; ESRB **Everyone** / PEGI 3 / etc. | done |
| Data safety — submitted (Preview → Save; “Change saved. Send for review in Publishing overview.”) | done |
| Store listing assets | open → [013](./013-play-listing-assets.md) |

### Data safety — types & handling

| Type | Collected | Shared | Required? | Purposes |
|------|-----------|--------|-----------|----------|
| Name, Email, User IDs | yes | no | required | App functionality (+ Account management for User IDs) |
| Precise location | yes | no | optional | App functionality |
| Other in-app messages | yes | no | optional | App functionality |
| Photos | yes | no | optional | App functionality |
| Health info, Fitness info | yes | no | optional | App functionality |
| App interactions, Other user-generated content | yes | no | optional | App functionality |
| Crash logs | yes | yes (Sentry) | optional | Analytics + Fraud prevention / security |
| Diagnostics | yes | yes (Sentry) | optional | Analytics |
| Device or other IDs | yes | no | optional | App functionality + Developer communications |

Delete account URL: `https://coachwatts.com/settings/danger`. Encryption in transit: yes.

## Steps

1. [x] **Data safety** form: map categories from the privacy checklist; usage/handling + Preview → Save submitted 2026-07-21.
2. [x] Privacy policy URL: `https://coachwatts.com/privacy`.
3. [x] **Content rating** questionnaire (IARC) — endurance coaching companion, not a medical device.
4. [x] Target audience — 18 and over. Ads declaration already **No**.
5. [x] **Health** declaration: fitness/wellness companion; not a regulated medical device.
6. [x] **Sign in details**: restricted; Google demo `coachwatts.play.review@gmail.com` saved 2026-07-21 (seed athlete on hosted IdP still open → [008](./008-reviewer-demo-account.md)).
7. [ ] Store listing text later ([013](./013-play-listing-assets.md)) must match Data safety (no diagnosis language).

## Done when

- Data safety, content rating, and required policy declarations saved with no blocking incomplete sections.
