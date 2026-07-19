## Context

Log is the companion write surface (wellness + recovery). Product baseline v1.5 adds nutrition quick-log there; nutrition planning/grocery stay on web. coach-wattz exposes `GET/POST /api/nutrition` with `nutrition:read` / `nutrition:write`. Hydration quick-add exists but may still be session-only.

## Goals / Non-Goals

**Goals:**
- Today’s nutrition totals glance on Log
- Quick-log a meal/macro item and hydration
- Request `nutrition:read` and `nutrition:write` on the Official Mobile App client
- Open web for planning depth

**Non-Goals:**
- Meal plan generation, grocery lists, strategy / metabolic wave UI
- Barcode scanning / camera OCR
- Full nutrition dashboard parity with web

## Decisions

1. **IA: Log tab** — Nutrition section on Log (or Log stack), not More; matches “Log writes” principle.
2. **Compose existing APIs** — `GET /api/nutrition` for today’s day record; `POST /api/nutrition` for items/totals; hydration via Bearer-ready quick-add or POST items with hydration entry.
3. **Scopes** — Add `nutrition:read` and `nutrition:write` to `COMPANION_SCOPES`.
4. **UX budget** — Simple form: meal slot + calories/macros (and optional name); hydration volume quick chips; not a food database browser in first ship.
5. **Feature module** — `src/features/nutrition/` for types, API, mappers; keep business logic on server.

## Risks / Trade-offs

- [Hydration route session-only] → Prefer POST nutrition items with hydration fields, or coach-wattz Bearer fix before relying on hydration-quick-add.
- [Complex nutrition DTO] → Map only fields needed for totals + item append; ignore planning payloads.
- [Allowlist missing nutrition scopes] → Confirm Official Mobile App before shipping.

## Open Questions

- Exact shape of “today” fetch (list with date filter vs by-date helper) — confirm against coach-wattz when implementing
- Whether Today tab should show a one-line nutrition strip (default: no; Log only)
