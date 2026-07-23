# 018 — RevenueCat project and ownership

**Area:** account · **Priority:** high · **Status:** in-progress

## Goal

Establish a production-owned RevenueCat project that can normalize Apple App Store, Google Play, and existing Stripe subscriptions for hosted Coach Watts users.

**OpenSpec:** [`store-subscriptions-revenuecat`](../../../openspec/changes/store-subscriptions-revenuecat/proposal.md)

## Decisions already landed

| Choice | Detail |
|--------|--------|
| Subscription service | RevenueCat |
| Coach Watts authority | Server-computed entitlements remain authoritative |
| App User ID | Stable Coach Watts user UUID; no anonymous real purchases |
| Instance scope | Hosted `https://coachwatts.com` only |
| Existing Stripe | Track/import under the same RevenueCat user identity |

## Recorded identifiers (non-secret)

| Item | Value |
|------|-------|
| Project | Coach Watts (`12d4d797`) |
| App Store app | Coach Watts (App Store) (`app17fce11c8d`) |
| Play Store app | Coach Watts (Play Store) (`app95807dc9bd`) |
| Bundle / package | `com.coachwatts.app` |
| Test Store app | (`app6576eca3e0`) |
| Offering | `default` (`ofrng241eb81932`) |
| Entitlement `pro` | `entl26a02aeeb6` |
| Entitlement `supporter` | `entle72479d322` |
| Legacy entitlement (Test Store scaffold) | `Coach Watts Pro` (`entle7cb2c50a6`) — keep or retire later; store products use `pro` / `supporter` |
| Apple IAP key (in RC only) | Key ID `376Y9C7VR2` (`.p8` never in git) |
| Play service account (in RC only) | JSON uploaded (2026-07-23). SA email `revenuecat-service-account@coach-watts.iam.gserviceaccount.com` — Play Console account perms: View app information (bulk reports) + View financial data/orders/cancellation survey + Manage orders and subscriptions; Coach Watts app access. RC may still show “Credentials need attention” until Google propagates (~24–36h). |

### App Store products (RevenueCat)

| ASC product ID | RC product ID | Entitlement | Offering package |
|----------------|---------------|-------------|------------------|
| `coachwatts_supporter_monthly` | `prod2f5daa0faa` | `supporter` | `$rc_monthly` |
| `coachwatts_supporter_annual` | `prodd08553544a` | `supporter` | `$rc_annual` |
| `coachwatts_pro_monthly` | `prod974593a237` | `pro` | `pro_monthly` |
| `coachwatts_pro_annual` | `prod717f82f421` | `pro` | `pro_annual` |

### Play Store products (RevenueCat) — created 2026-07-23

Google identifiers use `productId:basePlanId`.

| Play store identifier | RC product ID | Entitlement | Offering package |
|-----------------------|---------------|-------------|------------------|
| `coachwatts_supporter:monthly` | `prodb5d6bb3530` | `supporter` | `$rc_monthly` |
| `coachwatts_supporter:annual` | `prode0326033d7` | `supporter` | `$rc_annual` |
| `coachwatts_pro:monthly` | `prod434c2b2576` | `pro` | `pro_monthly` |
| `coachwatts_pro:annual` | `prod29bfe3abe4` | `pro` | `pro_annual` |

### Local env / tooling (gitignored `.env`)

Public SDK keys and product ID lists may live in the app bundle via `EXPO_PUBLIC_*`. Secret keys never ship in the client.

| Variable | Purpose |
|----------|---------|
| `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` | App Store public SDK key (`appl_…`) |
| `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` | Play public SDK key (`goog_…`; written to local `.env` 2026-07-23) |
| `EXPO_PUBLIC_REVENUECAT_TEST_STORE_API_KEY` | Test Store public SDK key (`test_…`) for sandbox UI |
| `EXPO_PUBLIC_SUBSCRIPTION_SUPPORTER_PRODUCT_IDS` | Comma-separated ASC + Play (`productId:basePlanId`) IDs |
| `EXPO_PUBLIC_SUBSCRIPTION_PRO_PRODUCT_IDS` | Comma-separated ASC + Play (`productId:basePlanId`) IDs |
| `REVENUECAT_PROJECT_ID` | `12d4d797` — REST API v2 / MCP |
| `REVENUECAT_API_V2_SECRET_KEY` | Dashboard secret **Cursor MCP / local API** (`sk_…`); customer + project-config read/write |

Placeholders only in [`.env.example`](../../../.env.example). Production webhook authorization and server-side secrets stay in **coach-wattz**, not this repo.

### RevenueCat MCP / REST API

- Cloud MCP: `https://mcp.revenuecat.ai/mcp` (Bearer = V2 secret).
- Project Cursor config: [`.cursor/mcp.json`](../../../.cursor/mcp.json) references `${env:REVENUECAT_API_V2_SECRET_KEY}` (no secret in git).
- User Cursor config may hold the Bearer for GUI-launched sessions when shell env is unavailable.
- REST API v2 verified against `GET /v2/projects/{id}/apps` (2026-07-23).

Apple Server Notification URL is on the App Store app page in RevenueCat — paste into ASC when configuring App Store Server Notifications (task 019 / store setup).

## Steps

1. [x] Create RevenueCat account (2026-07-22).
2. [ ] Create/confirm the production project under a durable Watt Mind Kft. owner identity; invite day-to-day admins individually.
3. [x] Record non-secret RevenueCat project/app identifiers here; keep API keys out of git (2026-07-22/23).
4. [ ] Select a RevenueCat plan that supports the required production webhook/server-notification workflow and record the commercial owner.
5. [ ] Decide and record restore-transfer behavior for one store account used with multiple Coach Watts accounts.
6. [x] Add Apple app config for bundle `com.coachwatts.app` with required App Store IAP key credentials stored only in RevenueCat (2026-07-22). ASC API key (product import) still optional/open.
7. [x] Add Google app config for package `com.coachwatts.app` (2026-07-23): Play app `app95807dc9bd`, four products mapped to `supporter`/`pro` + `default` packages, Android public SDK key in local `.env`, service-account JSON in RC, Play Console SA permissions granted.
8. [ ] Connect Stripe Billing for existing Coach Watts products/subscriptions.
9. [x] Create RevenueCat `supporter` / `pro` entitlements and current `default` offering with four distinguishable packages (2026-07-22). Play products attached to the same packages (2026-07-23).
10. [x] Create local V2 secret + wire MCP/API env for agent/tooling (2026-07-23). Production webhook path still open.
11. [~] Notification paths: Play RTDN connected (2026-07-23) via topic `projects/coach-watts/topics/Play-Store-Notifications` + Play Monetization setup + test notification sent. SA has `roles/pubsub.admin` + `roles/monitoring.viewer`. Still open: Apple Server Notification URL into ASC; sandbox/production separation verification.

## Security

- Public platform SDK keys may be supplied through EAS / local release `.env` when task 021 enables acquisition.
- RevenueCat secret keys, webhook authorization values, Apple IAP keys, Google service-account JSON, and Stripe credentials never enter git or the app bundle.
- Do not paste credentials or full secret-bearing dashboard screenshots into this task/log.

## Done when

- Watt Mind owns the RevenueCat project; team access/plan/restore policy are recorded; Apple, Google, and Stripe configurations are connected; entitlements/offerings map unambiguously to Coach Watts tiers.
