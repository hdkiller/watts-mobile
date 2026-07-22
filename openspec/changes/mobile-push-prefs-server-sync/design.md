## Context

Backend (364/365) ships:

- `GET/PUT /api/mobile/devices/preferences` with keys `RECOMMENDATION_READY`, `WORKOUT_ANALYSIS_READY`, `SYNC_COMPLETED`, `COACH_MESSAGE`
- Defaults: all `true` except `SYNC_COMPLETED: false`
- Optional `preferences` on `POST /api/mobile/devices`
- `sendExpoPushToUser` skips when type disabled

Mobile already GETs/PUTs with SecureStore fallback (`api.ts`). Gaps vs policy:

1. Local default `SYNC_COMPLETED: true` contradicts server.
2. Settings still exposes Sync Status as if OS pushes exist.
3. Update path writes SecureStore first and soft-fails PUT — UI can look saved while server disagreed (or never received).
4. Copy says “on this device” though prefs are per-user.

## Goals / Non-Goals

**Goals:**

- Server authoritative when reachable.
- Honest Sync Status UX (hidden or disabled + explanation).
- Failed PUT visible and rolled back or retried.
- Align defaults with server for cold start before first GET.

**Non-Goals:**

- Implement analysis/coach Expo senders (366).
- Email Communication settings.
- Receipts / Expo observability (368).

## Decisions

1. **Server wins on successful GET**
   - Cache response in SecureStore for offline display.
   - On GET failure: use cache, then defaults matching server (`SYNC_COMPLETED: false`).

2. **PUT must succeed for mutation success**
   - When prefs API responds non-OK / network error, mutation fails; keep previous query data.
   - Optimistic UI optional; on error revert.
   - If endpoint 404 (old self-hosted), fall back to local-only with quiet helper copy (“saved on this device only”) — rare after 364 on hosted.

3. **Hide Sync Status toggle**
   - Prefer omit row entirely (cleaner than disabled dead control).
   - Still accept `SYNC_COMPLETED` in API types; always send `false` if a partial PUT needs the key, or omit and let server keep false.

4. **Registration**
   - After prefs load (or on register), MAY attach current prefs to `POST /api/mobile/devices` — nice-to-have, not blocking.

5. **Copy**
   - “Choose which coaching alerts Coach Watts may send as push notifications.” (account-level)

## Risks / Trade-offs

- **[Stale SecureStore with SYNC_COMPLETED true]** → First successful GET overwrites cache; hide toggle so users cannot re-enable via UI.
- **[Self-hosted without 364]** → Keep 404 local fallback; document hosted expects API.

## Open Questions

_None blocking._ Analysis email XOR remains a coach-wattz 366 concern, not this change.
