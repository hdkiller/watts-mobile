## ADDED Requirements

### Requirement: Store subscriptions are limited to the hosted service
The app SHALL offer Watt Mind App Store and Google Play subscriptions only when the authenticated instance is the canonical hosted `https://coachwatts.com` service. It MUST NOT initialize a purchasable offering or attach a restored Watt Mind purchase to a self-hosted instance.

#### Scenario: Hosted athlete can load offerings
- **WHEN** an authenticated athlete on `https://coachwatts.com` opens Subscription & Billing and has no active paid provider
- **THEN** the app loads the platform's current RevenueCat offering

#### Scenario: Self-hosted athlete cannot buy hosted access
- **WHEN** an authenticated athlete uses a non-hosted instance
- **THEN** the app shows instance-owned entitlement information without a Watt Mind purchase or restore action

### Requirement: Purchases use an authenticated stable customer identity
The app MUST configure RevenueCat purchases with the authenticated Coach Watts user UUID and MUST NOT initiate a real store purchase under an anonymous RevenueCat identity.

#### Scenario: Configure after authentication
- **WHEN** Coach Watts authentication yields a stable user UUID on the hosted instance
- **THEN** the app identifies the RevenueCat customer with that UUID before loading purchasable packages

#### Scenario: Account signs out
- **WHEN** the athlete signs out or changes Coach Watts account
- **THEN** the app detaches the prior RevenueCat identity and cannot expose its subscription state to the next account

### Requirement: Paywall uses the store catalog
The subscription surface SHALL offer Supporter and Pro monthly/annual choices using store-returned localized names, prices, periods, and offer eligibility. It MUST clearly disclose recurring billing, renewal, cancellation, Terms, and Privacy before purchase.

#### Scenario: Eligible free user opens subscription screen
- **WHEN** a hosted free athlete with no active paid provider opens Subscription & Billing
- **THEN** the app displays the available Supporter and Pro packages using the active store's localized product data and required disclosures

### Requirement: Purchase activation is server-confirmed
After a store purchase, the app SHALL reconcile and refetch the canonical Coach Watts entitlement. The app MUST NOT treat client-only RevenueCat success as authorization for server-paid features.

#### Scenario: Purchase succeeds and server confirms
- **WHEN** RevenueCat completes a purchase and Coach Watts reconciliation returns the purchased tier
- **THEN** the app refreshes subscription-dependent queries and displays the canonical active tier

#### Scenario: Store succeeds but reconciliation is delayed
- **WHEN** RevenueCat completes a purchase but the canonical server entitlement is not yet updated
- **THEN** the app shows a recoverable “confirming purchase” state and retries/refetches without asking the athlete to buy again

#### Scenario: User cancels purchase sheet
- **WHEN** the athlete cancels the platform purchase sheet
- **THEN** the app leaves the canonical entitlement unchanged and returns to the subscription surface without an error claim

### Requirement: Existing subscriptions prevent duplicate acquisition
The app SHALL read canonical subscription source before presenting an initial purchase and SHALL suppress new store purchase actions when Stripe, Apple, or Google already provides active paid access.

#### Scenario: Existing Stripe subscriber opens billing
- **WHEN** an athlete with an active Stripe subscription opens Subscription & Billing on mobile
- **THEN** the app shows the active tier and Stripe management action without offering a duplicate Apple or Google subscription

#### Scenario: Existing store subscriber opens the other platform
- **WHEN** an athlete has active store-backed access associated with the same Coach Watts account on another platform
- **THEN** the app shows that access and its owning provider rather than prompting for another subscription

### Requirement: Purchases can be restored
The hosted subscription surface SHALL provide Restore Purchases and SHALL reconcile restored store ownership with the currently authenticated Coach Watts account according to the configured transfer policy.

#### Scenario: Restore succeeds
- **WHEN** the authenticated athlete chooses Restore Purchases and the store account owns an eligible subscription
- **THEN** the app reconciles the purchase and displays the server-confirmed entitlement and provider

#### Scenario: Nothing is restorable
- **WHEN** the athlete chooses Restore Purchases and the store reports no eligible purchases
- **THEN** the app explains that no subscription was found without changing entitlement state

### Requirement: Subscription management follows the owning provider
The app SHALL display the active subscription provider and SHALL open the provider-appropriate management destination for Apple, Google Play, or Stripe. It MUST NOT claim that one provider can cancel or edit a subscription owned by another.

#### Scenario: Manage Apple subscription
- **WHEN** an Apple-managed subscriber chooses Manage Subscription
- **THEN** the app opens Apple's subscription-management destination

#### Scenario: Manage Google subscription
- **WHEN** a Google-managed subscriber chooses Manage Subscription
- **THEN** the app opens Google Play's subscription-management destination

#### Scenario: Manage Stripe subscription
- **WHEN** a Stripe-managed subscriber chooses Manage Subscription
- **THEN** the app opens the authenticated Coach Watts web billing/Stripe portal path

### Requirement: Pending and unavailable commerce states are honest
The app SHALL distinguish loading, offline, pending purchase, canceled purchase, billing issue, unavailable store, and recoverable error states. It MUST NOT display a tier as active before canonical confirmation.

#### Scenario: Store is unavailable
- **WHEN** the store or RevenueCat catalog cannot be reached
- **THEN** the current canonical tier remains visible and purchase actions show a retryable unavailable state

#### Scenario: Google purchase is pending
- **WHEN** Google Play reports a pending purchase
- **THEN** the app explains that payment is pending and does not unlock the paid tier until the server confirms entitlement

