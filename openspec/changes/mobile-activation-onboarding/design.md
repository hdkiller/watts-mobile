## Context

Product baseline repositioned (2026-07-21) to **activation companion**: mobile-only accounts, soft activation = goal + plan + insight, full activation also requires usable data, wizard UX puts connect **last**.

Today mobile assumes a returning athlete (OAuth sign-in → tabs). Empty accounts see stacked “No X yet” cards ([issues/056](../../docs/issues/056.md)). Web onboarding-status tracks integration → import → first insight only — not goal/plan. Plan initialize/activate are still session-cookie only; REST has `plan:read` but no `plan:write`. Consent (`POST /api/user/consent`) and goals CRUD already use `requireAuth`.

Related in-flight: `health-platform-ingest` / `-v2`, `connected-apps-lite` — consumed at connect-last.

## Goals / Non-Goals

**Goals:**
- Soft-activate a brand-new account entirely on device without opening web.
- Server-driven, resumable wizard shared conceptually with web activation definitions.
- Goal lite + plan lite (kickoff only) + first insight + connect-last (Health Sync preferred, Skip OK).
- Finish-setup Today until fully activated; no empty-card pile for incomplete activation.

**Non-Goals:**
- Full PlanDashboard, adaptation wizard, block editor, drag-reschedule.
- Native Strava/Garmin/etc. OAuth (use Connected Apps lite handoff).
- Replacing web setup hub UI (share status model only).
- Apple Sign In as a hard requirement in this change (track as store follow-up if Google-only signup is rejected).
- Chat-based plan generation as the primary path (native lite wizard is primary).

## Decisions

1. **Same OAuth PKCE for sign-up and sign-in**  
   Account creation happens when the IdP creates/links the user on first authorize. Mobile offers “Create account” / “Sign in” copy on the same PKCE flow. After tokens exist, activation gate runs.  
   **Why:** No separate mobile registration API; matches hosted IdP.  
   **Alt:** Email/password native signup — out of scope (web join is OAuth providers).

2. **Activation gate in app shell before tabs**  
   After auth hydration, fetch `GET /api/user/onboarding-status` (and/or a thin mobile activation DTO once extended). If consent missing or soft steps incomplete → force `/(activation)/*` wizard stack. Soft-activated → tabs + Finish-setup. Fully activated → normal Today.  
   **Why:** Prevents using empty companion before goal/plan exist.  
   **Alt:** Soft modal on Today only — too easy to dismiss; fails issue 056.

3. **Extend onboarding-status (shared) rather than a parallel mobile-only checklist**  
   coach-wattz extends step model with `consent`, `goal`, `plan`, `insight`, `connect_data` (order for presentation may differ from dependency order). Expose flags: `softActivated`, `fullyActivated`, `hasPrimaryGoal`, `hasActivePlan`, `hasFirstInsight`, `hasUsableData`, `connectLater`.  
   **Why:** Web + mobile must agree; local MMKV checklists drift.  
   **Alt:** Client-only wizard progress — rejected.

4. **Wizard UX order ≠ activation dependency order**  
   UX: consent → goal → plan → insight → connect (last).  
   Full activation criteria: data → goal → plan → insight (all required eventually). Soft = goal+plan+insight without data.  
   **Why:** Strava friction last; Health Sync is the clean primary connect path.

5. **Consent via existing Bearer `POST /api/user/consent`**  
   Native screen with terms + privacy + health consent toggles; send current policy versions from shared constants or a small public versions endpoint if versions cannot be bundled safely.  
   **Why:** Already `requireAuth`.  
   **Alt:** Open web `/onboarding` handoff — breaks mobile-only promise.

6. **Goal lite: one primary goal in-wizard; edit later under More → Athlete (or Goals)**  
   Types aligned with web: EVENT / PERFORMANCE / CONSISTENCY / BODY_COMPOSITION. Minimal fields (title, type, targetDate when needed). Optional `POST /api/goals/suggest` (or existing suggest job) with accept → create.  
   **Scopes:** `goal:read` / `goal:write` (add `goal:write` to companion scope list).  
   **Why:** Enough to drive plan initialize; full goal AI review can stay web.

7. **Plan lite: narrow initialize payload + activate**  
   Collect: weekly availability (days/hours — use `availability:write` if Bearer-ready, else embed slots in initialize custom fields / minimal availability PATCH), volume LOW/MID/HIGH, preferred sports (default Ride/Run as product chooses). Call `POST /api/plans/initialize` then show first-week preview from returned/current plan, then `POST /api/plans/:id/activate`.  
   **coach-wattz:** switch initialize + activate to `requireAuth(..., ['plan:write'])`; **add `plan:write` to `REST_OAUTH_SCOPES`**.  
   **Why:** Reuses Gemini initialize path; avoids porting PlanWizard depth.  
   **Alt:** Coach `generate_training_plan` tool — good later, not day-one primary.  
   **Alt:** Open web PlanWizard — rejects mobile-only activation.

8. **First insight = plan week reveal (+ optional Analyze Readiness)**  
   After activate, show “Here’s your week” list from planned workouts; optional generate today’s recommendation with honest thin-biometric copy. Mark insight viewed via onboarding complete/first-value API (extend if needed).  
   **Why:** Insight without data is still a coaching outcome; readiness improves after connect.

9. **Connect last composes existing surfaces**  
   Primary CTA → Health Sync settings (enable sync). Secondary → Connected Apps lite. Skip / Later sets `connectLater` and enters soft-activated tabs. Finish-setup card remains until `hasUsableData` (or equivalent).  
   **Why:** No third connect UI; Skip unblocks confused users.

10. **Module / route layout**  
    - `app/(activation)/` — consent, goal, plan, insight, connect screens (no tabs)  
    - `src/features/activation/` — status query, gate helper, analytics events  
    - `src/features/goals/` — goal lite API + forms  
    - `src/features/plans/` — plan lite API + preview  
    - App layout: if authenticated && !softActivated → redirect activation; if soft && route is activation connect-only optional

11. **Scopes update**  
    Add to `COMPANION_SCOPES`: `goal:write`, `plan:write`, and `availability:read` / `availability:write` if availability PATCH is used. Existing users re-consent on next login when scopes expand.

12. **Older self-hosted instances**  
    If onboarding-status lacks new fields or plan initialize returns 401/404, show honest “instance needs update” + Open web handoff; do not fake local activation complete.

## Risks / Trade-offs

- **[Plan without data is weak]** → Label provisional; improve after Health Sync; do not claim full readiness.  
- **[Two onboarding UIs drift]** → Shared status flags; document soft/full in web conversion plan.  
- **[plan:write missing today]** → Blocker in coach-wattz; ship backend slice before mobile plan step.  
- **[Initialize is slow / AI]** → Progress UI + poll/job if initialize is async; timeout + retry + Open web escape.  
- **[Availability API session-only]** → Spike early; may need Bearer on availability or fold slots into initialize.  
- **[Store: Sign in with Apple]** → If other third-party login is offered, Apple may be required — track outside core wizard.  
- **[Scope re-consent friction]** → Batch scope adds with this change; document in oauth-setup.

## Migration Plan

1. Land coach-wattz: `plan:write`, Bearer initialize/activate, onboarding-status extensions, availability Bearer if needed.  
2. Land mobile scopes + activation gate + consent + goal (can soft-gate before plan API ready with feature flag).  
3. Land plan lite + insight + connect-last + Today Finish-setup.  
4. Align web setup hub to read new flags (can lag one release if mobile-only accounts are the priority).  
5. Rollback: gate wizard behind remote/config flag; old clients ignore new status fields.

## Open Questions

1. Exact onboarding-status step IDs / JSON shape — finalize with coach-wattz (extend vs parallel `activation` object).  
2. Is plan initialize synchronous or job-based today for mobile UX (spinner vs poll)?  
3. Where ongoing goal list lives: More → Athlete subsection vs dedicated Goals row.  
4. Minimum sports set for plan lite v1 (cycling-only vs multi-sport picker).  
5. Whether Finish-setup dismisses permanently on Skip forever or only when fully activated (recommend: until fully activated or explicit “don’t remind” stored server-side).
