## ADDED Requirements

### Requirement: Subscription records are payment-provider-neutral
Coach Watts SHALL persist paid subscription lifecycle state independently for Stripe, Apple, and Google and SHALL retain provider identity, external transaction/subscription identity, product, mapped tier, normalized status, provider-native status, entitlement end, environment, and event version metadata.

#### Scenario: Apple transaction is received
- **WHEN** a valid Apple lifecycle event is synchronized through RevenueCat
- **THEN** Coach Watts upserts the Apple provider subscription without overwriting unrelated Stripe or Google identity fields

#### Scenario: Google lifecycle state has no Stripe equivalent
- **WHEN** Google reports a pending, paused, or account-hold state
- **THEN** Coach Watts preserves that provider-native state and maps access according to the canonical entitlement policy

### Requirement: Server entitlement remains authoritative
Coach Watts SHALL compute the canonical `FREE`, `SUPPORTER`, or `PRO` tier from valid provider subscriptions, contributor access, trials, and promotional grants. Server APIs MUST use that canonical result rather than client purchase state.

#### Scenario: Active store subscription gates a paid API
- **WHEN** an Apple or Google subscription maps to an active Pro entitlement
- **THEN** the same server-side Pro gates apply as for an active Stripe Pro subscriber

#### Scenario: Client claims success without server state
- **WHEN** the mobile client reports purchase success but no verified provider state exists
- **THEN** Coach Watts does not grant paid server entitlements

### Requirement: Lifecycle ingestion is verified and idempotent
RevenueCat webhook and foreground reconciliation handling MUST authenticate its source, distinguish sandbox from production, and process duplicate or out-of-order events without duplicate grants or regression to older state.

#### Scenario: Duplicate webhook arrives
- **WHEN** Coach Watts receives a lifecycle event whose provider/event version has already been processed
- **THEN** the handler acknowledges it without applying the transition twice

#### Scenario: Older event arrives after a renewal
- **WHEN** an older cancellation or status event arrives after a newer renewal state
- **THEN** Coach Watts retains the newer verified entitlement state and records the stale event for diagnostics

#### Scenario: Webhook authentication fails
- **WHEN** a request does not satisfy the configured RevenueCat webhook authorization check
- **THEN** Coach Watts rejects it without changing subscription or entitlement state

### Requirement: Existing Stripe subscriptions share customer identity
Active Stripe subscriptions SHALL be tracked in RevenueCat with the same Coach Watts user UUID used by the mobile SDK, while Stripe remains the payment and management provider for those subscriptions.

#### Scenario: Existing Stripe subscriber is backfilled
- **WHEN** migration finds a valid Stripe subscription ID for a Coach Watts user
- **THEN** it submits/tracks that subscription under the matching RevenueCat App User ID and preserves the existing canonical entitlement

#### Scenario: New Stripe checkout completes after launch
- **WHEN** the existing Stripe webhook activates a subscription
- **THEN** Coach Watts also updates RevenueCat tracking for that user without requiring a mobile restore

### Requirement: Expiry, grace, cancellation, and revocation are enforced
Canonical entitlement calculation SHALL preserve access through a verified paid-through or configured grace period and SHALL remove store-funded access after expiry, refund/revocation, or provider policy indicates entitlement is no longer valid.

#### Scenario: User cancels renewal
- **WHEN** a provider reports cancellation with a future paid-through date
- **THEN** Coach Watts keeps the current tier until that entitlement end while marking auto-renew off

#### Scenario: Store revokes a refunded purchase
- **WHEN** a verified store event revokes or refunds the active subscription entitlement
- **THEN** Coach Watts removes that provider grant and recomputes access from any remaining valid source

#### Scenario: Billing grace remains valid
- **WHEN** the provider reports a supported billing grace period that has not ended
- **THEN** Coach Watts retains access until the verified grace expiry

### Requirement: Overlapping paid providers are visible and safe
Coach Watts MUST NOT silently cancel an overlapping subscription. It SHALL grant the highest currently valid tier, record the collision, and return enough provider-management information for the athlete or support to resolve double billing.

#### Scenario: Stripe and Apple are both active
- **WHEN** reconciliation detects active Stripe Supporter and Apple Pro subscriptions for one user
- **THEN** canonical access is Pro and the subscription summary identifies both active providers and their management destinations

### Requirement: Mobile can read and reconcile subscription status with Bearer auth
`coach-wattz` SHALL provide documented Official Mobile App Bearer contracts to read canonical subscription/entitlement status and request idempotent foreground reconciliation after purchase or restore.

#### Scenario: Mobile reads current plan
- **WHEN** an authorized hosted mobile user requests subscription status
- **THEN** the API returns canonical tier, effective status/end, active provider or collision state, and the appropriate management destination without exposing provider secrets

#### Scenario: Mobile requests reconciliation
- **WHEN** an authorized hosted mobile user requests reconciliation after RevenueCat purchase or restore
- **THEN** the backend verifies current RevenueCat state for that same user identity and returns the recomputed canonical summary

