# Product Baseline — Activation Companion

Distilled from coach-wattz PR [#239](https://github.com/hdkiller/coach/pull/239), then **repositioned 2026-07-21** for mobile-first activation. Update when product decisions change. Mirror narrative: coach-wattz `docs/06-plans/mobile-companion-app.md`.

## Positioning

| Surface | Role |
|---------|------|
| **Web** | Control room: deep plan adapt/replan, analytics/explorer, teams, nutrition planning/grocery, library editing, billing, admin |
| **Mobile** | **Activation companion**: get a new athlete alive without requiring the web app, then run the daily field loop (today, check-in, coach, push) |

Mobile is no longer “field-only, assume web setup.” Accounts may be created and fully activated on device. Web remains the home for depth and architecture tools that do not fit a thumb-first morning path.

### Design constraints

1. **Activate, then accompany** — day-one path gets the athlete to goal + plan + insight; ongoing path stays the daily loop.
2. **Lite over architect** — goal capture and plan *kickoff* are in-app; full PlanDashboard, block editing, adaptation wizards, analytics stay on web (or Coach tools later).
3. **Connect last, clean** — data connection is required for *full* activation but sits late in the wizard and is skippable so Strava/Intervals login confusion does not block the door. Prefer Health Sync (system sheet) over OAuth apps.
4. **Shared server truth** — onboarding/activation state lives on the API (`onboarding-status` and successors), not only in local UI checklists. Web and mobile must agree on “done.”
5. **Do not clone `/dashboard`** — morning path still one decision; web escape hatch for out-of-scope depth.

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
| **Plan** | A training plan generated and **activated** (lite path) |
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
3. Plan lite wizard (availability → generate → preview → activate)
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
4. **Recent + Upcoming** — More lists (not a calendar heatmap)
5. **Coach chat** — seeded Q&A, markdown-lite, tool feedback lite, sessions + media
6. **Notifications** — push + in-app inbox
7. **Account glue** — instance URL, sign-in, Settings hub (push prefs, Health Sync, units/locale, coach identity lite, sports thresholds lite, export/delete via Open web), **Open web with Bearer→cookie session handoff**
8. **Athlete** — More → Athlete metrics + AI report overview (full report Open web)

## Next chapter — Activation onboarding

Priority work that repositions the product. OpenSpec change: `openspec/changes/mobile-activation-onboarding`.

1. **Mobile-only account path** — sign up (not only returning sign-in); native consent gate parity with web `/onboarding`
2. **Server-driven wizard** — resume from `GET /api/user/onboarding-status` (extend for goal + plan steps; keep `connectLater`)
3. **Goal lite** — create/edit primary goal; optional AI suggest/accept; list under More or Athlete; `goal:read` / `goal:write`
4. **Plan lite wizard** — availability + volume → `plans/initialize` (or documented Bearer equivalent) → first-week preview → activate; not PlanDashboard / adapt / replan
5. **First insight** — week reveal + optional Analyze Readiness; honest copy when biometrics are thin
6. **Connect-last** — Health Sync primary; Connected Apps lite (Strava/Intervals/…) secondary; Skip → soft-activated companion + Finish-setup card
7. **Empty Today replacement** — retire stacked “No X yet” for incomplete activation (supersedes the spirit of [issues/056](./issues/056.md))

### coach-wattz prerequisites (activation)

- Consent write path usable from mobile Bearer session
- Official Mobile App scopes: `goal:write`, `planning:write` (and any plan-initialize/activate routes) documented + allowlisted
- `onboarding-status` (or successor) exposes goal/plan/insight steps shared with web
- Plan initialize + activate Bearer-ready for the lite path
- Web conversion plan updated so activation ≠ “integration only”

## Explicit non-goals

Still **out** of native mobile (use Open web / handoff):

- Full **plan architect** (PlanDashboard, block/week editor, adaptation wizard, drag-reschedule)
- Analytics builder / performance explorer / workout comparison / calendar heatmaps
- Coaching teams / multi-athlete
- Nutrition planning / grocery
- Workout library editing
- Billing / admin / developer portal
- Full web Profile Settings / sport zone editors / detect-from-workouts

**Narrowed vs prior baseline:** goal capture, plan *kickoff*, Health Sync, and Connected Apps **lite** are **in scope**. Deep OAuth edge cases and obscure providers may still Open web.

## Information architecture

**Tabs:** Today · Log · Coach · More

**Stacks (additions bold):** **activation wizard**, **goal lite**, **plan lite**, recommendation detail, planned workout detail, activity summary, upcoming planned list, notification inbox, athlete metrics, nutrition log (Log stack), daily coach check-in, sign-in / **sign-up** / instance setup, settings, **connected apps lite**.

**Today (activated):** greeting → optional analysis-ready card → optional Daily Coach Check-In CTA → recommendation hero / Analyze Readiness empty / planned-only hero → planned summary when with a recommendation → Recent Wellness → Active Recovery Context → Accept / Discuss with Coach → This week → Upcoming Events → Coming up → Recently → optional Nutrition glance.

**Today (incomplete activation):** single **Finish setup** / resume-wizard surface instead of a column of empty section cards. Soft-activated may show provisional plan week + quiet connect CTA.

Recovery **writes** stay Log-first. Coming up stays planned-only; race/life events via Upcoming Events (create/edit may move to goal/event lite later; until then Open web for event CRUD is OK). Offline: last cached Today + planned detail with “last updated.” Instance **Open web** uses session handoff when available.

**More hosts:** recent activity, upcoming planned, notifications inbox, athlete (+ **goals lite**), Settings hub, account glue.

**Settings hub:** push prefs · Health Sync · **Connected Apps lite** (status + Connect/Fix/Manage via web handoff; disconnect/sync/ingest editors stay web) · Units & locale · Instance · Coach identity lite · Sports thresholds lite · Export / Delete via Open web. Billing and full Profile/zone editors stay web.

First viewport (once activated) = one decision. No CTL grids or calendar heatmaps.

## Interaction principles

1. Morning path &lt; 30s **once activated**
2. Thumb-first primary CTAs on Today
3. Today/Coach decide; Log writes (wellness + recovery + nutrition quick-log)
4. Push deep-links to Today or detail (never a dead inbox)
5. Honest empty/loading (“Waiting for Whoop sync…”) — and honest **provisional** plan copy before data
6. Self-hosted instance URL first-class
7. Web escape hatch for out-of-scope depth
8. Do not clone `/dashboard`
9. **Wizard resumable** — kill app mid-activation → return to current server step
10. **Connect never blocks soft activation** — Skip is a first-class outcome

## Auth — suggested scopes

| Scope | Why |
|-------|-----|
| `profile:read` / `profile:write` | Name, basics, athlete metrics |
| `workout:read` / `workout:write` | Recent/planned; activity analyze; planned complete/skip |
| `health:read` / `health:write` | Recovery, check-in, Daily Coach Check-In |
| `recommendation:read` / `recommendation:write` | Today + accept/dismiss / Analyze Readiness *(REST names; not MCP `recommendations:*`)* |
| `plan:read` / `plan:write` | Planned workouts + **plan lite initialize/activate** *(REST names)* |
| `goal:read` / `goal:write` | Events countdown + **goal lite capture** |
| `nutrition:read` / `nutrition:write` | Nutrition quick-log |
| `chat:read` / `chat:write` | Coach tab |
| `offline_access` | Refresh tokens |

Exact Official Mobile App allowlist must match coach-wattz `REST_OAUTH_SCOPES` / public scopes docs.

## Companion API (logical)

| Capability | Contract |
|------------|----------|
| Bootstrap / home | Prefer `GET /api/mobile/today` (new) or documented composition |
| Onboarding status | `GET /api/user/onboarding-status` (+ extend for goal/plan); consent write Bearer path |
| Goal lite | `GET/POST/PATCH /api/goals` (+ optional suggest/review jobs) |
| Plan lite | initialize / preview / activate (existing `plans/*` Bearer-ready) |
| Recommendation actions | Existing accept / dismiss / today generate |
| Wellness check-in | Existing wellness write |
| Recovery event | `POST/PATCH/DELETE /api/recovery-context/journey*` + `GET /api/recovery-context` |
| Recent activities | `GET /api/workouts` |
| Upcoming planned | `GET /api/planned-workouts` |
| Planned / activity detail | Planned + workout by id; structure; AI + streams + power-curve |
| Athlete metrics | `GET/PATCH /api/profile` |
| Nutrition quick-log | `GET/POST /api/nutrition` (+ hydration) |
| Chat | Rooms/messages + Bearer WebSocket |
| Notifications | `/api/notifications` |
| Push register | `POST /api/mobile/devices` |
| Health platform ingest | Wellness/workout upload from HealthKit / Health Connect (opt-in) |
| Connected apps lite | Documented connect/status for primary providers (or Open web handoff where Bearer OAuth is not ready) |

Push events (initial): `RECOMMENDATION_READY`, `WORKOUT_ANALYSIS_READY`, `SYNC_COMPLETED`, `COACH_MESSAGE`.

## Non-functionals (baseline)

iOS + Android via Expo · warm-cache Today &lt; ~2s with skeleton · reuse Tolgee locales where practical · a11y on primary CTAs · no health metrics in analytics · Sentry + minimal product events (include activation funnel: consent → goal → plan → insight → data).

## Decision log (reposition)

| Date | Decision |
|------|----------|
| 2026-07-21 | Positioning → **activation companion** (mobile-first accounts allowed) |
| 2026-07-21 | Fully activated = **data → goal → plan → insight** |
| 2026-07-21 | Wizard UX = goal → plan → insight → **connect last** (Health Sync preferred; Skip OK) |
| 2026-07-21 | Plan creation = **native lite wizard** (not full architect; not chat-only) |
| 2026-07-21 | Docs = **reposition this baseline** (not a side “v2 chapter” while old non-goals remain) |
