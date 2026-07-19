## Context

Web Sport Settings is a large control-room surface. Mobile needs a field path for **per-sport threshold bumps** without porting zones or detect-from-workouts. **Settings** (not Log) is the right home: athletic config prefs sit with Units / Health Sync, while Log stays daily write jobs (wellness, recovery, nutrition).

APIs:

- `GET /api/profile` → `sportSettings[]` (`profile:read`)
- `PATCH /api/profile` `{ sportSettings: [...] }` → upsert (`profile:write`)

## Goals / Non-Goals

**Goals:**

- Settings → Sports list + lite editor (FTP / LTHR / Max HR; threshold pace when present).
- Persist with the same PATCH contract as web for those fields.
- Clear Open web path for everything else.
- Athlete metrics points here for per-sport edits.

**Non-Goals:**

- Log segment for Sports.
- Zone editing, detect-from-workouts, advanced power fields, types mapping, create/delete profiles.
- Measurements / body composition.

## Decisions

1. **IA: Settings → Sports** (not Log) — Rationale: Log is daily logging; sport thresholds are configuration. User confirmed Settings placement.
2. **Lite field set** — FTP, LTHR, Max HR; threshold pace only when already on the profile.
3. **Edit existing only** — Open web for lifecycle.
4. **Save payload** — Round-trip full profile JSON; patch only lite fields.
5. **Stack editor** — `/(app)/sports/[id]` with `useKeyboardOverlap`.

## Risks / Trade-offs

- **[Risk] Athletes expect zones after changing FTP** → Helper + Open web.  
- **[Trade-off] Discoverability vs Log** → Settings hub row + Athlete pointer.

## Open Questions

- None blocking.
