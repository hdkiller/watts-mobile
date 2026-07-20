## Context

Mobile overview already calls `GET /api/reports?type=ATHLETE_PROFILE&limit=1` and `POST /api/profile/generate` with Bearer. On 403 it hides Sync and says the summary “opens on the web.” Web full report is `/profile/athlete`. Session handoff (`openInstanceWeb`) now exists for signed-in browser opens. Stale tokens without `profile:read`/`profile:write` are the common failure mode after scope expansion.

## Goals / Non-Goals

**Goals:** Clear path when forbidden (re-login); reliable Open full report; optional lite in-app report sheet for latest completed report.

**Non-Goals:** Full historical report browser, share cards, regenerating from dashboard widget chrome, Training Load on Athlete screen.

## Decisions

1. **403/401 copy:** “This session cannot read AI reports. Sign out and sign in again to refresh permissions.” Primary CTA: Sign out → instance/auth. Secondary: Open web (handoff).
2. **Open full report:** Always use `openInstanceWeb(instance, '/profile/athlete')` (already wired on Athlete screen — verify handoff).
3. **Lite report sheet (in scope):** Tap executive summary or “View report” opens a sheet mapping available `analysisJson` sections already returned by the latest report (same mapper extensions). History/share stay web.
4. **Sync:** Remains on overview when not forbidden; 429/timeout messages unchanged honesty.
5. **Scopes:** No new scopes; document re-login in oauth-setup.

## Risks / Trade-offs

- Re-login friction — necessary for scope refresh on public clients.
- Lite sheet may lag web section richness — label as summary/lite and keep Open web.

## Migration Plan

1. Forbidden-state UX + sign-out CTA.
2. Lite report sheet if report payload sufficient; else strengthen Open web only.
3. Docs.

## Open Questions

- Whether lite sheet is required for v1 of this change or Open web + re-auth alone — **prefer include lite sheet if mapper already has sections; otherwise ship re-auth + handoff first.**
