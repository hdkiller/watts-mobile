## 1. Forbidden / re-auth UX

- [x] 1.1 Replace vague “opens on the web” 403 copy with re-login explanation
- [x] 1.2 Add Sign out & sign in CTA (navigate to auth) + keep Open web secondary
- [x] 1.3 Confirm Sync remains available when `profile:write` works; hide only when generate is forbidden

## 2. Report depth

- [x] 2.1 Ensure Open full report uses `openInstanceWeb(..., '/profile/athlete')`
- [x] 2.2 If latest report payload has usable sections: add lite `AthleteReportSheet` from overview
- [x] 2.3 Keep history / share / advanced regenerate as Open web only

## 3. Docs and verify

- [x] 3.1 Document re-login after `profile:read` / `profile:write` in `docs/oauth-setup.md` / open-questions
- [x] 3.2 Manual: stale-token 403 → re-login restores summary + Sync; Open full report lands signed in on web; Sync empty → completed summary
