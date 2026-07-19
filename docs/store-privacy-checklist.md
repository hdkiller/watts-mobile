# Store privacy & health questionnaire strings

Approved English copy for App Store Connect / Google Play Data safety questionnaires.
Tone: Coach Watts companion — no medical claims, no diagnostic language.

Source of truth for product scope: [product-baseline.md](./product-baseline.md).
Brand voice: coach-wattz `BRANDING.md`.

## Purpose of the app (short)

Coach Watts is an AI-powered endurance coaching companion. The mobile app helps you see today’s recommendation, log wellness and recovery context, chat lightly with your coach, and receive coaching notifications. Planning, analytics, billing, and integrations stay on the web.

## Data types (what to declare)

| Category | Collected? | Notes for store forms |
|----------|------------|------------------------|
| Contact info (email, name) | Yes | Via OAuth identity from your Coach Watts instance |
| User ID | Yes | Account identifier from the instance |
| Health & fitness | Yes | Wellness check-in (e.g. sleep, readiness/feel, optional weight) and recovery events (illness, fatigue, sleep disruption, etc.) — athlete-reported training context, **not** medical diagnosis. Optional on-device read of Apple Health / Health Connect sleep + weight to **prefill** the check-in (user confirms before save); health samples are not sent to analytics |
| Other user content | Yes | Coach chat messages; optional notes on check-ins |
| Product interaction / diagnostics | Yes (limited) | Crash/performance via Sentry when configured; no health metrics in analytics |
| Device identifiers | Yes (when push enabled) | Expo push token for coaching notifications |
| Photos / camera | Yes (optional) | Coach chat attachments for meal / context photos (nutrition logging). User-initiated only. |
| Location / financial / contacts | No | Not used by the companion |

## Questionnaire strings (paste-ready)

### OAuth / account identity

> Coach Watts signs you in with OAuth against your Coach Watts instance (hosted or self-hosted). We store access and refresh tokens securely on device so you stay signed in. We use your account name and email to show who is signed in. Sign-out removes tokens from this device.

### Wellness check-in & recovery events

> You can log daily wellness (such as sleep quality, how you feel / readiness, notes, and weight when you choose) and recovery events (for example illness, fatigue, or sleep disruption). This information is training and recovery context for coaching. Coach Watts is not a medical device and does not diagnose, treat, or prevent disease.

### Apple Health / Health Connect (optional prefill)

> With your permission, Coach Watts can read last night’s sleep duration and your latest body weight from Apple Health (iOS) or Health Connect (Android) to prefill today’s wellness check-in. Values stay on your device until you review and save the check-in to your Coach Watts instance. We do not write health data back to Apple Health or Health Connect, and we do not send health samples to crash analytics.

### Notifications

> With your permission, Coach Watts can send push notifications about coaching events (for example a new daily recommendation, workout analysis, sync completion, or coach message). You can change system notification permission in your device settings. Richer notification preferences may also be managed on the web app for your instance.

### Camera & photos (Coach chat)

> With your permission, Coach Watts can use the camera or photo library so you can attach photos in Coach chat—especially meal photos for nutrition logging. Photos are uploaded to your Coach Watts instance and included in the chat turn. You can deny permission and continue using text chat and the Log nutrition form.

### Privacy policy pointer

> Full privacy details for the hosted service are available at your instance’s privacy page (hosted: https://coachwatts.com/privacy). Self-hosted operators publish their own policy for their instance.

### Health claims — do **not** use

Avoid phrases like “diagnoses injury”, “medical advice”, “treats illness”, “FDA approved”, or “replaces your doctor”. Prefer “training context”, “recovery context”, “coaching recommendations”.

## App Store / Play checklist hooks

- [ ] Privacy Nutrition Labels / Data safety form filled using the table above
- [ ] Privacy policy URL set for the listing (hosted or operator URL)
- [ ] Health / fitness declarations match athlete-reported wellness + recovery, plus optional HealthKit / Health Connect read for check-in prefill (sleep + weight only)
- [ ] Push notification purpose string matches “coaching notifications” copy above
- [ ] No medical claims in store description or screenshots captions

## Related

- [store-checklist.md](./store-checklist.md) — icons, splash, Sentry, listing chrome
