## Context

More currently shows identity from userinfo and account glue (Open web, sign out). Full web Profile Settings are a non-goal. Product baseline v1.5 adds a focused athlete-metrics editor. coach-wattz already exposes `GET /api/profile` and `PATCH /api/profile` with `profile:read` / `profile:write`.

## Goals / Non-Goals

**Goals:**
- Edit weight, FTP, max HR, LTHR from More → Athlete
- Request and use `profile:write` on the Official Mobile App client
- Honest loading/error/save feedback; Open web for deeper settings

**Non-Goals:**
- Port of Profile Settings tabs, sport-specific zone editors, AI athlete profile generate
- Integrations, billing, email preferences, public athlete page
- Changing instance URL from the Athlete screen (stays account glue)

## Decisions

1. **Metrics subset only** — Match `PATCH /api/profile` OpenAPI core fields (weight, ftp, maxHr, lthr); show weight units from GET when present.
2. **Entry: More → Athlete** — Not a fifth tab; sits with account destinations.
3. **Scopes** — Add `profile:write` to `COMPANION_SCOPES`; users re-consent on next login if the IdP requires incremental consent.
4. **TanStack Query** — `useQuery` for profile GET; mutation for PATCH with invalidate on success.
5. **Feature module** — `src/features/profile/` for types, API, form mapping; keep UI in Expo Router stack under More.

## Risks / Trade-offs

- [Allowlist missing `profile:write`] → Confirm Official Mobile App in coach-wattz before shipping; surface clear auth error if scope denied.
- [Zone recalculation side effects] → Server already recalculates on metrics update; mobile does not reimplement zones.
- [Stale userinfo display on More] → Invalidate/refetch profile or userinfo after save so More identity/metrics stay consistent.

## Open Questions

- Whether height / DOB / sex belong in a later pass (default: out of first Athlete editor)
- Per-sport FTP via sportSettings vs default profile FTP (default: default/effective FTP from GET profile)
