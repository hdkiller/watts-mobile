## Context

Today’s Coming up strip and the Upcoming screen are planned-workout-only. Product decided (open-questions #19) to ship planned first and add race/life calendar events later. Web stores races in `Event` and exposes `GET /api/events` (session-only today). Issue 026 asks for a single countdown chip, not a calendar.

## Goals / Non-Goals

**Goals:**
- Bearer-read upcoming events and show a thin countdown on Today
- Optionally surface next event(s) on Coming up / Upcoming without heatmap chrome
- Keep morning decision composition intact

**Non-Goals:**
- Event create/edit/delete in-app
- Calendar heatmap / month grid / CTL
- Goals CRUD or plan linking UI
- Using the heavy `GET /api/calendar` aggregate for this glance

## Decisions

1. **Source API: `GET /api/events`, not `/api/calendar`**  
   Events list is the race/life surface athletes mean; calendar aggregate mixes workouts/nutrition/goals and is session-bound.  
   *Alternative:* calendar index — rejected (too wide; heatmap temptation).

2. **coach-wattz: `requireAuth` + `goal:read`**  
   No `events:` REST scope exists. Events are goal-adjacent product; use `goal:read` unless coach-wattz prefers another existing scope. Confirm Official Mobile App grant.  
   *Alternative:* invent `events:read` — only if product wants a dedicated scope; more IdP churn.

3. **Today placement: countdown below decision, not in hero**  
   Single chip/line (“Gran Fondo — 23 days”) with glances; never a second hero CTA.  
   *Alternative:* hero eyebrow — rejected; competes with recommendation.

4. **Coming up: planned rows primary; one next-event line optional**  
   Do not interleave a mixed timeline in v1 of this change; keep planned teaser contract and add a quiet event line. Upcoming may have a small Events section above/below planned.  
   *Alternative:* fully merged chronological feed — defer; harder empty/dedupe UX.

5. **No in-app event detail stack required**  
   Countdown + list title/date is enough; Open web for depth. Add read-only detail only if payload makes it trivial later.

6. **Local-day countdown**  
   Compute days-until using athlete local calendar date (same timezone assumptions as Today wellness date), not raw UTC hour diffs that flip overnight incorrectly.

## Risks / Trade-offs

- **[Risk] Events API still session-only** → Mitigation: coach-wattz prerequisite task before mobile UI; feature flag or hide CTA until 200 with Bearer.
- **[Risk] Scope consent churn if `goal:read` newly requested** → Mitigation: document re-login; prefer additive scope only.
- **[Risk] Crowding Coming up** → Mitigation: max one event line on Today; Events section on Upcoming can show more (still capped).

## Migration Plan

1. coach-wattz: Bearer on `GET /api/events` + Official Mobile App scope.
2. Mobile: add `goal:read` to `COMPANION_SCOPES` if missing; query + mappers.
3. Ship countdown on Today; then Upcoming Events section.
4. Update product-baseline / open-questions decision log.
5. Rollback: hide event UI; planned Coming up unchanged.

## Open Questions

- Confirm final scope (`goal:read` vs new `events:read`).
- Whether event priority (A/B/C) is shown on the chip or only on Upcoming.
- Whether “today’s event” (race day) uses special copy (“Today”) vs “0 days”.
