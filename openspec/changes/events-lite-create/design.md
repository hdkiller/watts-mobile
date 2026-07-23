## Context

Events hub exists (Today + More → Upcoming Events list/detail). Reads use Bearer `GET /api/events` + `goal:read`. Creates today go through web; coach-wattz `POST /api/events` uses `getServerSession` only (cookie session), so the mobile companion cannot create events until that route accepts Bearer.

Web `EventForm` is wide (distance, elevation, website, virtual/public, Intervals sync). Mobile needs a **lite** create, not a port.

## Goals / Non-Goals

**Goals:**

- Bearer-create a race/life event from More → Events (and empty state).
- Lite fields: title, date, type (and subType when useful), priority A/B/C, optional location / description / startTime.
- On success: invalidate upcoming-events queries; open `/(app)/events/[id]`.
- Keep Manage on web for edit/delete and advanced fields.

**Non-Goals:**

- Native edit / delete.
- Full EventForm parity (website, distance/elevation editors, public/virtual toggles UI — server may still accept defaults).
- Intervals sync configuration UI (server may still set `PENDING` / `LOCAL_ONLY` as today).
- Past-events portfolio browser / heatmap.

## Decisions

### 1. coach-wattz Bearer on POST first

**Choice:** Change `server/api/events/index.post.ts` from session-only to `requireAuth` with write scope. Prefer **`goal:write`** so Official Mobile App scopes stay unchanged (events already paired with `goal:read` for list/detail). Confirm against coach-wattz scope tables; if a dedicated `events:write` exists or is preferred, use that and allowlist the Official Mobile App.

**Why:** Without this, mobile create is impossible. `requireAuth` typically still serves cookie sessions for web.

**Alternatives:** Session handoff-only create — rejects the product ask.

### 2. Create-only lite

**Choice:** Do not Bearer-enable PUT/DELETE in this change unless trivial; edit/delete remain Open web.

**Why:** User asked to add; PUT/DELETE can follow once create UX settles.

### 3. Form surface

**Choice:** `/(app)/events/new` (stack or form-sheet) from list header + empty CTA.

**Why:** Matches Goals create IA; keeps list fingerprint (date tiles) clean.

### 4. Defaults after create

**Choice:** Omit optional advanced fields; let server apply `isVirtual`/`isPublic` defaults and Intervals sync status as today.

**Why:** Field companion — one job: get the race on the calendar.

### 5. Optional goal linking

**Choice:** Out of v1 lite create (no multi-select goalIds). Athletes link on web or via a later change.

**Why:** Avoids Goals list dependency in the create form.

## Risks / Trade-offs

- **[Scope naming]** → Align with coach-wattz; document in tasks before mobile ships.
- **[Timezone / date-only]** → Send ISO date consistent with web EventForm; filter “upcoming” still uses local today.
- **[Athletes expect edit]** → Manage on web stays on list/detail.

## Migration Plan

1. coach-wattz: Bearer POST + tests; deploy API.
2. Docs baseline update.
3. Mobile create UI + API client.
4. Rollback: feature-flag or remove Add; web create still works.

## Open Questions

- Exact write scope name (`goal:write` vs new scope) — resolve in coach-wattz before mobile merge.
- Whether PUT/DELETE Bearer should ride along in the same API PR (nice-to-have, not required for this mobile change).
