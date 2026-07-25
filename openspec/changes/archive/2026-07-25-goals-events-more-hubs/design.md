## Context

### Gap analysis (mobile vs web)

| Capability | Web | Mobile today |
|------------|-----|--------------|
| Goals list (all) | `/profile/goals` | Athlete shows **primary only** |
| Goal create/edit all fields | `EventGoalWizard` | Activation create; Athlete **title rename** only |
| Goal delete / AI Suggest / Review | Yes | No (Open web) |
| Events list | `/events` | Today glance + `/(app)/events` — **not on More** |
| Event detail | `/events/:id` | Read-only in-app detail — OK |
| Event create/edit/delete | Full `EventForm` + Intervals sync | Open web only; POST/PUT/DELETE **session-only** |
| Discoverability | Sidebar Goals + Events | Buried (Athlete / Today) |

**Product decision for this change:** Mobile is the **browse + detail companion**; web remains the **management control room**. Do not expand Athlete inline rename. Add More hubs so Goals/Events are first-class.

Future (out of this change): native lite CRUD would need Bearer on `POST/PUT/DELETE /api/events` and `DELETE /api/goals`, plus form UI — track separately if product wants write parity later.

## Goals / Non-Goals

**Goals:**

- More → Goals and More → Events entry points.
- Goals list (Bearer `GET /api/goals`) + Goal detail read screen.
- Events list reachable from More (existing list/detail).
- Athlete goal block becomes summary → Goals hub / detail + Open web manage.
- Clear Open web CTAs to `/profile/goals` and `/events` (handoff).

**Non-Goals:**

- Native EventForm / EventGoalWizard field parity.
- Bearer event writes or goal DELETE.
- AI Suggest / Review on device.
- Calendar heatmap / past-events portfolio browser.
- Changing activation goal-create step.

## Decisions

### 1. Browse/detail on device; manage on web

**Choice:** Lists + details native; create/edit/delete via Open web.

**Why:** Matches athlete request (details in app; management on web) and avoids coach-wattz event-write Bearer work. Removes confusing Athlete title-only PATCH.

**Alternatives:** Native lite CRUD now — larger cross-repo scope; defer.

### 2. More hubs, not Athlete-as-portfolio

**Choice:** Dedicated `/(app)/goals` (+ `/(app)/goals/[id]`) and link Events to existing `/(app)/events`. Athlete keeps a compact primary-goal teaser that navigates into Goals.

**Why:** More is the glance package (Recent, Upcoming planned, inbox). Goals/Events belong with that IA. Athlete stays biometrics / AI report focused.

### 3. Goals list shows active goals; detail is read-only

**Choice:** List all goals returned by `GET /api/goals` (typically ACTIVE). Detail shows title, type, priority, dates, values/metrics, linked events (tappable → event detail when id present). Manage → Open web.

**Why:** Server already returns the portfolio; no new API. Write stays web.

### 4. Remove Athlete inline rename

**Choice:** Delete Edit/Save title UI from `GoalsLiteSection`; replace with tap → Goals list or primary goal detail + “Manage on web”.

**Why:** Half-edit is worse than clear browse + web manage.

## Risks / Trade-offs

- **[Athletes who used Athlete rename]** → Mitigation: Open web Manage is one tap; activation create still native.
- **[Goals list empty vs activation incomplete]** → Honest empty + Open web + optional cue to resume activation if no goal.
- **[Duplicate Events entry points]** → Today glance “See all” and More → Events share the same list route.

## Migration Plan

- No data migration. Ship with normal app release.
- Rollback: remove More rows and Goals routes; restore Athlete rename if needed.

## Open Questions

- Whether a later `goals-events-lite-crud` change should add native create/edit (requires coach-wattz Bearer on event writes + goal delete). Not blocking this hubs change.
