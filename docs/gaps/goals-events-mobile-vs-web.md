# Gap analysis — Goals & Events (mobile vs web)

Date: 2026-07-23. Updated for lite-create proposals.

## Product decision

| Layer | Mobile | Web |
|-------|--------|-----|
| Browse | More → Goals / Events list + detail | `/profile/goals`, `/events` |
| **Create** | **Lite create in-app** — `goals-lite-create`, `events-lite-create` | Full wizards / forms |
| Edit / delete | Open web | Full |
| Goal AI Suggest / Review | Open web | Full |
| Athlete | Primary-goal teaser → Goals hub (no inline rename) | — |

## Comparison

| Capability | Web | Mobile today | After lite-create |
|------------|-----|--------------|-------------------|
| Goals list (all) | `/profile/goals` | More → Goals | Unchanged |
| Goal detail | Wizard / card | Read-only detail | Unchanged |
| Goal create | Full `EventGoalWizard` | Activation + **hub create** | Min fields (+ EVENT `eventData`) |
| Goal edit / delete / AI | Yes | Open web | Open web |
| Events list | `/events` | Today + More | Unchanged |
| Event detail | Full | Read-only in-app | Unchanged |
| Event create | Full `EventForm` + Intervals | **Hub create** (lite) | Title/date/type/priority + optionals |
| Event edit / delete | Yes | Open web | Open web |

## API notes

| Endpoint | Auth today | Lite-create need |
|----------|------------|------------------|
| `GET/POST/PATCH /api/goals` | Bearer (`goal:read` / `goal:write`) | Ready — mobile create only |
| `DELETE /api/goals` | Check session vs Bearer | Not in lite-create scope |
| `GET /api/events`, `GET /api/events/:id` | Bearer `goal:read` | Ready |
| `POST /api/events` | Bearer `goal:write` (`requireAuth`) | Ready — mobile lite create |
| `PUT/DELETE /api/events` | Session only | Not in lite-create scope |

## Related OpenSpecs

- `goals-events-more-hubs` — browse hubs (done / applying)
- `goals-lite-create` — native goal create
- `events-lite-create` — native event create (+ Bearer POST)
