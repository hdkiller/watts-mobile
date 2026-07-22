# Store privacy & health questionnaire strings

Approved English copy for App Store Connect / Google Play Data safety questionnaires.
Tone: Coach Watts companion — no medical claims, no diagnostic language.

Source of truth for product scope: [product-baseline.md](./product-baseline.md).
Brand voice: coach-wattz `BRANDING.md`.

## Purpose of the app (short)

Coach Watts is an AI-powered endurance coaching companion. The mobile app helps you activate an account, see today’s recommendation, log wellness and recovery context, chat with your coach, receive coaching notifications, and—on the hosted service—purchase or restore Supporter/Pro through the App Store or Google Play. Deep planning, analytics, and billing administration stay on the web/provider surface.

## Data types (what to declare)

| Category | Collected? | Notes for store forms |
|----------|------------|------------------------|
| Contact info (email, name) | Yes | Via OAuth identity from your Coach Watts instance |
| User ID | Yes | Account identifier from the instance |
| Health & fitness | Yes | Wellness check-in (e.g. sleep, readiness/feel, optional weight) and recovery events (illness, fatigue, sleep disruption, etc.) — athlete-reported training context, **not** medical diagnosis. Optional Apple Health / Health Connect: (1) prefill check-in sleep/weight on-device until save; (2) when **Health Sync** is enabled, upload objective metrics (sleep, RHR, HRV, weight, steps, distance, exercise minutes, floors, calories, etc.) and optionally workouts (incl. HR/power/cadence/speed streams and GPS route) to the athlete’s Coach Watts instance. Health metric values are not sent to analytics |
| Location | Yes (optional, workouts only) | Precise GPS points from Apple Health / Health Connect workout routes when Sync workouts is on — uploaded inside the workout FIT to the athlete’s instance. Not used for advertising or continuous tracking |
| Other user content | Yes | Coach chat messages; optional notes on check-ins |
| Product interaction / diagnostics | Yes (limited) | Crash/performance via Sentry when configured; no health metrics in analytics |
| Device identifiers | Yes (when push enabled) | Expo push token for coaching notifications |
| Photos / camera | Yes (optional) | Coach chat attachments for meal / context photos (nutrition logging). User-initiated only. |
| Purchase history | Yes (hosted subscriptions) | Store product/transaction identifiers, tier, status, renewal/expiry, and owning provider are processed through Apple/Google, RevenueCat, and the hosted Coach Watts account to grant and restore access. Not used for advertising |
| Payment information | No | Apple/Google process the payment method; Coach Watts/RevenueCat do not receive raw card or store-payment credentials from the app |
| Contacts | No | Address-book contacts are not used by the companion |

## Questionnaire strings (paste-ready)

### OAuth / account identity

> Coach Watts signs you in with OAuth against your Coach Watts instance (hosted or self-hosted). We store access and refresh tokens securely on device so you stay signed in. We use your account name and email to show who is signed in. Sign-out removes tokens from this device.

### Wellness check-in & recovery events

> You can log daily wellness (such as sleep quality, how you feel / readiness, notes, and weight when you choose) and recovery events (for example illness, fatigue, or sleep disruption). This information is training and recovery context for coaching. Coach Watts is not a medical device and does not diagnose, treat, or prevent disease.

### Apple Health / Health Connect (optional prefill + Health Sync)

> With your permission, Coach Watts can read health data from Apple Health (iOS) or Health Connect (Android). By default this is used only to prefill today’s wellness check-in (for example sleep and weight); those values stay on your device until you save the check-in. If you turn on **Sync to Coach Watts** in Settings → Health Sync, Coach Watts can also upload objective daily metrics (such as sleep, resting heart rate, HRV, weight, steps, distance, exercise minutes, floors, and calories) and, when Sync workouts is on, exercise sessions — including heart-rate and other time-series streams plus GPS route points when available — to your Coach Watts instance automatically. Sync may also run in the background when new health data arrives or on a periodic schedule while the app is not open. Sync is off until you enable it, and turning it off (or signing out) stops background collection and route reads. We do not write health data back to Apple Health or Health Connect, and we do not send health metric values to crash analytics.

### Notifications

> With your permission, Coach Watts can send push notifications about coaching events (for example a new daily recommendation, workout analysis, sync completion, or coach message). You can change system notification permission in your device settings. Richer notification preferences may also be managed on the web app for your instance.

### Camera & photos (Coach chat)

> With your permission, Coach Watts can use the camera or photo library so you can attach photos in Coach chat—especially meal photos for nutrition logging. Photos are uploaded to your Coach Watts instance and included in the chat turn. You can deny permission and continue using text chat and the Log nutrition form.

### Hosted subscriptions / RevenueCat

> On the hosted Coach Watts service, you can purchase or restore Supporter and Pro subscriptions through Apple App Store or Google Play billing. Apple or Google processes your payment method. Coach Watts uses RevenueCat to receive store product, transaction, subscription status, renewal/expiry, and purchase-history events linked to your Coach Watts account ID so access works across your devices and existing web subscriptions are not duplicated. Coach Watts does not receive your full card or store-payment credentials. Subscription management and refunds remain with the provider that charged you.

### Privacy policy pointer

> Full privacy details for the hosted service are available at your instance’s privacy page (hosted: https://coachwatts.com/privacy). Self-hosted operators publish their own policy for their instance.

### Health claims — do **not** use

Avoid phrases like “diagnoses injury”, “medical advice”, “treats illness”, “FDA approved”, or “replaces your doctor”. Prefer “training context”, “recovery context”, “coaching recommendations”.

## App Store / Play checklist hooks

Tracked as distribution [task 003](./distribution/tasks/003-privacy-and-compliance.md) (App Store) and [task 012](./distribution/tasks/012-play-data-safety-and-content.md) (Play):

- [x] Privacy Nutrition Labels filled in ASC using the table above (published)
- [x] Play Data safety form filled using the table above (→ task 012; submitted 2026-07-21)
- [x] Privacy policy URL set for the ASC listing (`https://coachwatts.com/privacy`)
- [x] Health / fitness declarations match athlete-reported wellness + recovery, plus optional HealthKit / Health Connect reads (precise location for workout routes declared)
- [x] Push / Device ID purpose covered via Device ID nutrition label (App Functionality)
- [x] No medical claims in ASC store description (disclaimer included); re-check screenshot captions when assets land
- [ ] Before subscription release, update App Store App Privacy / Play Data safety for purchase history and RevenueCat processing; confirm raw payment information remains “not collected” by the app/developer

## Related

- [distribution.md](./distribution.md) — shipping hub, tasks, progress log
- [store-checklist.md](./store-checklist.md) — icons, splash, Sentry, listing chrome
