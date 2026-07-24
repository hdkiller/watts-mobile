# Product Baseline — Activation Companion

Distilled from coach-wattz PR [#239](https://github.com/hdkiller/coach/pull/239), then **repositioned 2026-07-21** for mobile-first activation, and **expanded 2026-07-24** so Plan is a standing fifth-tab companion surface (training generator + replan + nutrition plan). Update when product decisions change. Mirror narrative: coach-wattz `docs/06-plans/mobile-companion-app.md`.

## Positioning

| Surface | Role |
|---------|------|
| **Web** | Control room for **leftovers that stay web**: plan templates / save-as-template / public share, Intervals.icu publish, analytics/explorer, coaching teams, workout library editing, billing administration (invoices/payment methods/tax/refunds), admin |
| **Mobile** | **Activation companion + Plan companion**: get a new athlete alive without requiring the web app, run the daily field loop (today, check-in, coach, push), and own standing **training plan + nutrition plan** life (generate, adapt, replan, weekly meal plan / grocery) |

Mobile is no longer “field-only, assume web setup.” Accounts may be created and fully activated on device. Web remains the home for catalog/template/share/publish and deep analytics — **not** for day-to-day plan or nutrition-plan management.

### Design constraints

1. **Activate, then accompany** — day-one path gets the athlete to goal + plan + insight; ongoing path is the daily loop **plus** Plan tab when the season needs attention.
2. **Plan owns plan life** — create / generate / adapt / replan / abandon live on the Plan tab (thumb-first patterns, not a desktop PlanDashboard clone). Templates, share links, and Intervals publish stay on web.
3. **Connect last, clean** — data connection is required for *full* activation but sits late in the wizard and is skippable so Strava/Intervals login confusion does not block the door. Prefer Health Sync (system sheet) over OAuth apps.
4. **Shared server truth** — onboarding/activation state lives on the API (`onboarding-status` and successors), not only in local UI checklists. Web and mobile must agree on “done.”
5. **Do not clone `/dashboard`** — morning path still one decision on Today; Plan is the season/week surface; web escape hatch for true leftovers.

## Activation model

### Fully activated (north star)

An athlete is **fully activated** when all four are true, in this dependency order:

```
data → goal → plan → insight
```

| Step | Meaning |
|------|---------|
| **Data** | Usable training/wellness data from Health Sync and/or a connected app |
| **Goal** | At least one primary goal captured (race/event, performance, consistency, or body) |
| **Plan** | A training plan generated and **activated** (Plan generator; first run often via activation wizard) |
| **Insight** | Athlete has seen a personalized coaching outcome (first-week plan reveal and/or today’s recommendation) |

### Soft vs full activation

| State | Criteria | Product behavior |
|-------|----------|------------------|
| **Soft-activated** | Goal + plan + first insight | Enter the companion tabs; Today may be provisional (“better after you connect”) |
| **Fully activated** | Soft + usable data | Normal companion; setup prompts dismiss |
| **Incomplete** | Missing any soft step | Resume activation wizard (server-driven) |

### Wizard UX order (not the same as dependency order)

High-friction credential steps come **last** so confused users still get a plan:

```
0. Account (sign up / sign in) + instance URL
1. Consent (terms + health/biometric) — blocking, native
2. Intent + goal lite
3. Plan generator (availability → generate → preview → activate) — same module as Plan tab
4. First insight reveal
5. Connect data (LAST) — Health Sync primary · OAuth apps secondary · Skip / later OK
→ Companion tabs + optional “Finish setup” card on Today until fully activated
```

Analytics should distinguish soft vs full activation. Align web conversion plan so both clients share the same definitions.

## Stack

Expo (React Native) + TypeScript · Expo Router · NativeWind · TanStack Query · expo-secure-store · Expo Notifications · Sentry RN · **`expo-dev-client`**.

Auth: OAuth 2.0 + PKCE · tokens in Secure Store · `offline_access` for refresh. Sign-**up** and native consent are first-class (not web-only).

## Shipped companion loop (store-candidate base)

Already delivered as the daily athlete loop (former v1 / v1.5):

1. **Today** — planned workout + AI recommendation (accept / modify / rest), **Analyze Readiness** generate when empty, Daily Coach Check-In, Recent Wellness, Training Load & Form, Monthly Progress, Active Recovery Context, week strip, Upcoming Events glance, Coming up, Recently teaser, nutrition glance when tracking on
2. **Log** — wellness + recovery events + nutrition quick-log (when tracking enabled)
3. **Session detail** — planned Complete/Skip; activity AI analysis, adherence, charts, lite route map; fueling prep when on; explorer/GPX → Open web
4. **Recent + Upcoming** — More lists (detail escape; not a Today heatmap). Upcoming stays separate from Plan for now.
5. **Coach chat** — seeded Q&A, markdown-lite, tool feedback lite, sessions + media
6. **Notifications** — push + in-app inbox
7. **Account glue** — instance URL, sign-in, Settings hub (push prefs, Health Sync, units/locale, **Nutrition settings**, coach identity lite, sports thresholds lite, export/delete via Open web), **Open web with Bearer→cookie session handoff**
8. **Athlete** — More / Today name → Athlete: metrics + AI report overview + **swipeable 12-week glance** (Activity done/planned; Nutrition logged/gaps when tracking on; full report Open web)

## Next chapter — Plan companion tab

Priority expansion after activation foundations. OpenSpec train (apply in order):

| Change | Focus |
|--------|--------|
| `plan-tab-shell` | 5th tab **Plan** with Training \| Nutrition segments; active-plan read shell; empty → create |
| `plan-generator-full` | Full training plan generator pipeline (initialize → activate → block/week/structure jobs); activation reuses same module |
| `plan-adapt-replan` | Adapt (recalc week / push forward), replan structure, abandon, start new — Plan owns “life blew up” |
| `plan-structure-edit` | Week tune, reschedule/move, block CRUD (mobile patterns, not desktop DnD clone) |
| `nutrition-plan-on-plan-tab` | Weekly nutrition plan, draft generate, meal done/skip/replace, day regen, grocery |

**Web leftovers (stay Open web):** plan templates / save-as-template, public plan share, publish planned workout to Intervals.icu, analytics/explorer, library editing, teams, billing administration.

## Next chapter — Activation onboarding

Priority work that repositions the product. OpenSpec change: `openspec/changes/archive/2026-07-22-mobile-activation-onboarding` (archived; live specs under `openspec/specs/`).

1. **Mobile-only account path** — sign up (not only returning sign-in); native consent gate parity with web `/onboarding`
2. **Server-driven wizard** — resume from `GET /api/user/onboarding-status` (extend for goal + plan steps; keep `connectLater`)
3. **Goal lite** — create primary goal in activation; ongoing More → Goals (list + detail + **lite create**); edit/delete + AI suggest/review on web; `goal:read` / `goal:write`
4. **Plan generator (activation path)** — availability + volume → `plans/initialize` → preview → activate; after soft activation, ongoing create/replan lives on **Plan** tab (not Open web)
5. **First insight** — week reveal + optional Analyze Readiness; honest copy when biometrics are thin
6. **Connect-last** — Health Sync primary; Connected Apps lite (Strava/Intervals/…) secondary; Skip → soft-activated companion + Finish-setup card
7. **Empty Today replacement** — retire stacked “No X yet” for incomplete activation (supersedes the spirit of [issues/056](./issues/056.md))

### coach-wattz prerequisites (activation + Plan)

- Consent write path usable from mobile Bearer session
- Official Mobile App scopes: `goal:write`, `plan:read` / `plan:write`, `nutrition:read` / `nutrition:write` (and plan/nutrition plan routes) documented + allowlisted
- `onboarding-status` (or successor) exposes goal/plan/insight steps shared with web
- Plan initialize / activate / generate-block / generate-ai-week / adapt / structure + nutrition plan APIs Bearer-ready
- Optional: push type when plan/week generation completes (today only readiness/analysis-style events exist)
- Web conversion plan updated so activation ≠ “integration only”

## Explicit non-goals

Still **out** of native mobile (use Open web / handoff):

- Plan **templates** / save-as-template / public plan **share** / catalog
- **Publish** planned workouts to Intervals.icu (and other structured-workout device push until a later chapter)
- Analytics builder / performance explorer / workout comparison / **Today** calendar heatmaps (Athlete’s compact 12-week done/planned glance is in scope — not a CTL/year explorer)
- Coaching teams / multi-athlete
- Workout library editing
- Full billing administration (invoices, payment methods, tax documents, refunds) / admin / developer portal; narrow hosted store subscription acquisition/status/restore/manage is in scope
- Full web Profile Settings / sport zone editors / detect-from-workouts — **except** Nutrition settings (Profile → Nutrition parity) and Sports thresholds lite

**In scope (2026-07-24):** Plan tab training generator + adapt/replan + structure edit (mobile UX); Plan tab nutrition weekly plan / generate / meal actions / grocery; activation reuses the Plan generator module.

## Next chapter — Store subscriptions

OpenSpec: `openspec/changes/store-subscriptions-revenuecat`.

- Hosted `https://coachwatts.com` athletes may purchase, restore, inspect, and manage **Supporter** or **Pro** subscriptions with Apple App Store / Google Play billing through RevenueCat.
- Existing Stripe subscribers keep the same mobile entitlements and are not offered a duplicate store subscription.
- Coach Watts server entitlement state remains authoritative; the mobile SDK never grants paid server behavior by itself.
- Store acquisition is **hosted-only**. Self-hosted instances keep instance-owned entitlement behavior and do not attach Watt Mind store purchases.
- Web/provider surfaces keep invoices, payment-method editing, tax documents, refunds, and billing administration.

## Information architecture

**Tabs:** Today · **Plan** · Log · Coach · More

| Tab | Role |
|-----|------|
| **Today** | Morning decision (recommendation / planned / readiness) |
| **Plan** | Season + week training plan and nutrition plan (Training \| Nutrition) |
| **Log** | Wellness + recovery + nutrition quick-log writes |
| **Coach** | Chat |
| **More** | Recent, Upcoming (stays separate), Goals, Events, Athlete, notifications, Settings, Open web |

**Stacks (additions bold):** **activation wizard**, **Plan tab** (training + nutrition plan stacks), recommendation detail, planned workout detail, activity summary, upcoming planned list, **Goals hub** (list/detail/**create**), **Events hub** (Upcoming Events list/detail/**create**), notification inbox, athlete metrics, nutrition log (Log stack), daily coach check-in, sign-in / **sign-up** / instance setup, settings, **nutrition settings**, **connected apps lite**, **Subscription & Billing**.

**Today (activated):** greeting → optional analysis-ready card → optional Daily Coach Check-In CTA → recommendation hero / Analyze Readiness empty / planned-only hero → planned summary when with a recommendation → Recent Wellness → Active Recovery Context → Accept / Discuss with Coach → This week → Upcoming Events → Coming up → Recently → optional Nutrition glance.

**Today (incomplete activation):** single **Finish setup** / resume-wizard surface instead of a column of empty section cards. Soft-activated may show provisional plan week + quiet connect CTA.

**Plan (activated):** Training segment — active plan header, season timeline, current week workouts, generator/adapt/replan/structure actions (per OpenSpec train). Nutrition segment — weekly meal plan, generate, meal actions, grocery (when tracking on). Empty training → create plan. Open web for templates / share / Intervals publish only.

Recovery **writes** stay Log-first. Coming up stays planned-only; race/life events via Upcoming Events (list/detail + **lite create** in-app; **edit/delete on web** — OpenSpec `events-lite-create`, needs Bearer `POST /api/events`). Goals after activation: More → Goals list/detail + **lite create** in-app (`goals-lite-create`); **edit/delete + AI suggest/review on web** (activation create remains native). Offline: last cached Today + planned detail with “last updated.” Instance **Open web** uses session handoff when available.

**More hosts:** recent activity, upcoming planned (**separate from Plan** for now), **Goals**, **Events**, notifications inbox, athlete (biometrics / AI report / **activity glance** + primary-goal teaser → Goals hub), Settings hub, account glue, **Invite friends** (hosted/local QR + share link with Athlete A→B referral attribution; also at the bottom of **Athlete** / Today → name; coaching `/join/{CODE}` relationships stay web).

**Settings hub:** push prefs · Health Sync · **Connected Apps lite** (status + Connect/Fix/Manage via web handoff; disconnect/sync/ingest editors stay web) · Units & locale · Log defaults · **Nutrition settings** (tracking, metabolic, meal pattern, dietary constraints, fuel calibration, adaptive engine, hydration — web Profile → Nutrition parity) · Instance · Coach identity lite · Sports thresholds lite · **Subscription & Billing** (hosted current plan + Apple/Google purchase/restore/manage; Stripe manage via web) · Export / Delete via Open web. Billing administration and zone editors stay web.

First viewport of **Today** (once activated) = one decision. No CTL grids or calendar heatmaps on Today. Athlete may show a compact rolling 12-week done/planned day-circle glance (not a year contribution graph). Plan tab is allowed richer week/season chrome without turning Today into a dashboard.

## Interaction principles

1. Morning path &lt; 30s **once activated** (Today)
2. Thumb-first primary CTAs on Today; Plan actions confirm-gated when destructive
3. Today decides the day; Plan owns the season/week; Log writes (wellness + recovery + nutrition quick-log)
4. Push deep-links to Today, Plan, or detail (never a dead inbox)
5. Honest empty/loading (“Waiting for Whoop sync…”) — and honest **provisional** plan copy before data
6. Self-hosted instance URL first-class
7. Web escape hatch for true leftovers (templates / share / Intervals publish / analytics)
8. Do not clone `/dashboard` onto Today
9. **Wizard resumable** — kill app mid-activation → return to current server step
10. **Connect never blocks soft activation** — Skip is a first-class outcome
11. **Async plan jobs are first-class** — generation/adapt MUST show progress / failure / retry (not fake sync)

## Auth — suggested scopes

| Scope | Why |
|-------|-----|
| `profile:read` / `profile:write` | Name, basics, athlete metrics |
| `workout:read` / `workout:write` | Recent/planned; activity analyze; planned complete/skip; structure generate |
| `health:read` / `health:write` | Recovery, check-in, Daily Coach Check-In |
| `recommendation:read` / `recommendation:write` | Today + accept/dismiss / Analyze Readiness *(REST names; not MCP `recommendations:*`)* |
| `plan:read` / `plan:write` | Active plan reads + initialize / activate / generate / adapt / replan / structure edit |
| `goal:read` / `goal:write` | Events list/detail + **event lite create** + **goal lite** (activation + Goals hub create) + Goals hub reads |
| `nutrition:read` / `nutrition:write` | Nutrition quick-log + Profile nutrition settings + **nutrition plan** (weekly plan / generate / meals / grocery) |
| `chat:read` / `chat:write` | Coach tab |
| `offline_access` | Refresh tokens |

Exact Official Mobile App allowlist must match coach-wattz `REST_OAUTH_SCOPES` / public scopes docs.

## Companion API (logical)

| Capability | Contract |
|------------|----------|
| Bootstrap / home | Prefer `GET /api/mobile/today` (new) or documented composition |
| Onboarding status | `GET /api/user/onboarding-status` (+ extend for goal/plan); consent write Bearer path |
| Goal lite / Goals hub | `GET/POST/PATCH /api/goals` (list/detail + lite create; activation create; edit/delete/AI Open web) |
| Upcoming Events | `GET /api/events`, `GET /api/events/:id`, Bearer `POST /api/events` (lite create; edit/delete Open web) |
| Plan companion | `GET` active/current plan; `POST /api/plans/initialize`; activate; `generate-block`; `generate-ai-week`; `adapt`; replan-structure; abandon; week PATCH; block CRUD; planned `move` / `generate-structure` |
| Recommendation actions | Existing accept / dismiss / today generate |
| Wellness check-in | Existing wellness write |
| Recovery event | `POST/PATCH/DELETE /api/recovery-context/journey*` + `GET /api/recovery-context` |
| Recent activities | `GET /api/workouts` |
| Upcoming planned | `GET /api/planned-workouts` (More list; Plan week may compose the same) |
| Planned / activity detail | Planned + workout by id; structure; AI + streams + power-curve |
| Athlete metrics | `GET/PATCH /api/profile` |
| Nutrition quick-log | `GET/POST /api/nutrition` (+ hydration) |
| Nutrition settings | `GET/POST /api/profile/nutrition` (Bearer `nutrition:read` / `nutrition:write`) |
| Nutrition plan | `GET /api/nutrition/plan`; `POST …/plan/generate`; `POST …/generate-plan`; meal PATCH/lock; `GET …/grocery` |
| Chat | Rooms/messages + Bearer WebSocket |
| Notifications | `/api/notifications` |
| Push register | `POST /api/mobile/devices` |
| Health platform ingest | Wellness/workout upload from HealthKit / Health Connect (opt-in) |
| Connected apps lite | Documented connect/status for primary providers (or Open web handoff where Bearer OAuth is not ready) |

Push events (initial): `RECOMMENDATION_READY`, `WORKOUT_ANALYSIS_READY`, `SYNC_COMPLETED`, `COACH_MESSAGE`.  
**Plan companion follow-up:** consider plan/week-ready push when generator jobs complete.  
Living channel taxonomy (push ↔ inbox ↔ email): `~/Develop/watts-marketing/knowledge/push/inventory.md`.

## Non-functionals (baseline)

iOS + Android via Expo · warm-cache Today &lt; ~2s with skeleton · reuse Tolgee locales where practical · a11y on primary CTAs · no health metrics in analytics · Sentry + minimal product events (include activation funnel: consent → goal → plan → insight → data).

## Decision log (reposition)

| Date | Decision |
|------|----------|
| 2026-07-21 | Positioning → **activation companion** (mobile-first accounts allowed) |
| 2026-07-21 | Fully activated = **data → goal → plan → insight** |
| 2026-07-21 | Wizard UX = goal → plan → insight → **connect last** (Health Sync preferred; Skip OK) |
| 2026-07-21 | Plan creation = **native lite wizard** (superseded 2026-07-24 by Plan companion tab) |
| 2026-07-21 | Docs = **reposition this baseline** (not a side “v2 chapter” while old non-goals remain) |
| 2026-07-23 | **Nutrition settings** on mobile (Profile → Nutrition parity); planning/grocery later moved in-scope 2026-07-24 |
| 2026-07-23 | **Goals & Events hubs** on More (list + detail in-app); create/edit/delete stay web — `goals-events-more-hubs` |
| 2026-07-23 | **Goals & Events lite create** in-app; edit/delete (+ goal AI) stay web — `goals-lite-create`, `events-lite-create` |
| 2026-07-24 | **Plan companion tab** — five tabs (Today · Plan · Log · Coach · More); Plan owns training generator + adapt/replan + structure edit + nutrition plan (Training \| Nutrition); Upcoming stays separate; templates / share / Intervals publish stay web — OpenSpec train `plan-tab-shell` → `plan-generator-full` → `plan-adapt-replan` → `plan-structure-edit` → `nutrition-plan-on-plan-tab` |
