## Context

Planned and activity detail screens already ship lite companion depth (structure, AI, charts, map). Web still owns the control room. Gap analysis surfaced seven high field-value items that close the train → do → debrief loop on-device without porting explorer UI.

Existing decisions constrain the design:

- Complete/skip are **distinct** from recommendation Accept/Rest (`docs/open-questions.md` #14).
- Skip/miss API shape is still **open** (#18); complete path exists: `POST /api/planned-workouts/:id/complete`.
- Coach already supports Today discuss handoff (`?discuss=1`) and seed context helpers.
- Nutrition prep on web uses `GET /api/workouts/planned/:id/fueling` (session-auth today — needs Bearer confirmation).
- `planAdherence` and `exercises` are already included on web `GET /api/workouts/:id`.

## Goals / Non-Goals

**Goals:**

- Let athletes mark planned sessions complete or skipped from mobile planned detail (and Today planned-only hero when present).
- Show lite plan adherence after a completed workout and navigate to the linked planned session.
- Open Coach from either detail screen with honest session-scoped seed (no invented prescriptions).
- Bidirectional planned ↔ completed navigation when the API exposes links.
- Show read-only fueling prep on planned detail when nutrition tracking is enabled.
- Surface more present-only summary metrics and completed strength exercises.

**Non-Goals:**

- Structure edit, AI adjust, publish/export, share, library save.
- Map explorer, GPX, interval audit, advanced metrics tiles, pacing/timeline sections.
- Adherence Analyze/Regenerate, unlink, or deviation-matrix editing.
- Fueling strategy override or full NutritionPrepCard parity.
- Personal notes editor, workout edit/delete, comparison dock.

## Decisions

### 1. Compliance mutations live on planned detail (and planned-only Today hero)

- **Choice:** Primary Complete / Skip CTAs on planned detail; mirror on Today when there is no recommendation and planned is the hero (already decided product behavior).
- **Why:** Matches open-question #14; keeps Accept/Rest recommendation-only.
- **Complete:** `POST /api/planned-workouts/:id/complete` with optional `workoutId` when a same-day candidate is known; otherwise complete without link (API already allows null `workoutId`).
- **Skip:** Prefer `PATCH /api/planned-workouts/:id` with `completionStatus: 'SKIPPED'` (or agreed enum) once coach-wattz confirms Bearer + allowed values. If PATCH cannot express skip, add a thin dedicated endpoint in coach-wattz rather than inventing client-only status.
- **Alternatives considered:** Reuse recommendation Rest — rejected (different domain). Web-only complete — rejected (field value).

### 2. Adherence is read-only glance, not analysis UI

- **Choice:** Map `planAdherence` from existing workout detail: overall score, summary, analysis status, `plannedWorkoutId`. Show when status is completed / ready with content; show pending/failed honestly; omit section when absent.
- **Why:** Closes debrief loop; Analyze/Regenerate and deviation tables stay web.
- **CTA:** “View plan” → in-app planned detail (`plannedWorkoutId`), not Open web by default.
- **Alternatives considered:** Port full PlanAdherence component — too heavy. List-only ✓/~/- heuristic only — insufficient for field debrief.

### 3. Session Coach handoff extends `?discuss=` pattern

- **Choice:** Navigate to Coach with query params (e.g. `discuss=session&kind=planned|activity&id=…`) and build seed via a new `buildSessionCoachSeedContext(...)` alongside existing Today seed. Prefill/send a short discuss prompt; strip seed from athlete-visible bubbles as today.
- **Why:** Reuses room selection policy and seed plumbing; avoids a separate chat product surface.
- **Alternatives considered:** Open web “Chat about workout” — weaker companion loop. New dedicated chat room per workout — out of scope / server policy unknown.

### 4. Linked navigation uses server ids only

- **Choice:** Activity → planned when `plannedWorkoutId` or `planAdherence.plannedWorkoutId` present. Planned → activity when detail exposes a completed workout id (confirm field name with coach-wattz: linked workout from complete response or planned detail include). Never invent links from date/type heuristics on detail screens (list compliance marks may stay heuristic).
- **Why:** Honest navigation; heuristics already exist for list badges and should not drive stack jumps.

### 5. Fueling prep is gated and compact

- **Choice:** If profile `nutritionTrackingEnabled`, lazy-fetch fueling for the planned id; show carbs/energy targets and short strategy label when present; hide when tracking off or plan null. Deep prep / strategy override → Open web or Log.
- **Why:** Field prep before a session; Log remains write surface for meals.
- **Backend:** Confirm `requireAuth` + Bearer on fueling GET (today uses `getServerSession`).

### 6. Richer metrics = expand mapper allow-list

- **Choice:** Extend `mapWorkoutSummaryMetrics` with present-only fields already on workout summary (cadence, calories, max HR, max power, VI, EF — exact keys per API). Cap visual density (compact grid; no new section hierarchy).
- **Why:** Zero new endpoints; keeps `includeStreams=false`.
- **Alternatives considered:** Full metrics/raw JSON section — non-goal.

### 7. Completed strength exercises reuse planned strength list UX

- **Choice:** When `exercises` array present on workout detail, render a compact Exercises section (name + sets/reps/load/RPE when present), same truncation spirit as planned (e.g. max ~24).
- **Why:** Strength athletes need debrief parity with planned prescription view.
- **Non-goal:** Superset editing, Hevy deep sync UI.

### 8. Delivery order

Ship in vertical slices that each leave the app usable:

1. API contract spike (skip shape, Bearer fueling, link fields) in coach-wattz  
2. Planned compliance + cache invalidation (Today / upcoming / planned detail)  
3. Adherence glance + linked planned nav  
4. Richer metrics + completed exercises  
5. Session Coach handoff  
6. Fueling prep glance  

## Risks / Trade-offs

- **[Skip API unresolved]** → Block Skip UI behind confirmed contract; ship Complete first if needed.  
- **[Fueling still session-cookie auth]** → Feature-detect / fail soft (omit section) until Bearer lands; do not invent prep.  
- **[Complete without workoutId leaves orphan completed status]** → Accept API behavior; optionally offer “link recent activity” later, not in this change.  
- **[Coach seed too long / noisy]** → Hard cap seed lines; prefer title, date, type, 1–2 KPIs, adherence score if any.  
- **[Metric clutter]** → Present-only + fixed allow-list; omit empty keys.  
- **[Scope creep toward web detail]** → Explicit non-goals; Open web remains for explorer depth.

## Migration Plan

1. Land coach-wattz Bearer/skip/fueling confirmations (or minimal patches) before or in lockstep with mobile mutations.  
2. Ship mobile behind normal OTA-friendly JS; no native rebuild expected.  
3. Invalidate TanStack Query keys for planned detail, upcoming list, Today, and activity summary after compliance mutations.  
4. Rollback: hide CTAs / sections via omitting mapper fields if API unavailable; no data migration.

## Open Questions

1. Exact skip/miss enum and endpoint (`PATCH completionStatus` vs `POST …/skip`) — open question #18.  
2. Planned detail field for linked completed `workoutId` (name + when populated).  
3. Whether Complete should present a same-day activity picker when multiple candidates exist, or always complete without link in v1 of this change (lean: complete without picker; link when server already associated).  
4. Fueling GET Bearer + required scope (`nutrition:read` vs `workout:read`).  
5. Whether Today planned-only hero Skip/Complete ship in the same PR as detail CTAs (lean: yes for product parity).
