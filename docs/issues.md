# UX/UI Issues — Index

Backlog from the July 2026 UX/UI review. Each issue lives in [issues/](./issues/) as `{id}.md` with problem, proposal, and file pointers. Conventions the fixes must follow: [DESIGN.md](./DESIGN.md).

Already shipped from that review (not tracked here): shared `Button` (variants, a11y, contrast fix), `SportIcon` on workout rows, `hitSlop` on text links, skeleton loading states, `DESIGN.md`.

**Status:** open → in-progress → done. Update the row and the issue file together.

## Core app polish

| ID | Issue | Area | Priority | Effort | Status |
|----|-------|------|----------|--------|--------|
| [001](./issues/001.md) | Friendly error copy instead of raw API messages | cross-cutting | high | S | done |
| [002](./issues/002.md) | Haptic feedback on key moments | cross-cutting | medium | S | done |
| [003](./issues/003.md) | Recommendation hero: state color, confidence visual, accepted state | Today | high | M | done |
| [004](./issues/004.md) | Modify/Rest affordance: "Discuss with Coach" | Today | medium | M | open |
| [005](./issues/005.md) | Recovery glance polish: sentiment dots + band header rename | Today | medium | S | open |
| [006](./issues/006.md) | Faster check-in: tap controls, save feedback, weight unit | Log | high | M | in progress |
| [007](./issues/007.md) | Log cleanup: drop "Back to Today", read-only chip icon | Log | low | XS | done |
| [008](./issues/008.md) | Workout structure silhouette on planned detail | detail | high | M | done |
| [009](./issues/009.md) | Zone color ramp (Z1–Z5) across zones UI | detail/charts | high | S | done |
| [010](./issues/010.md) | Hero stat blocks on detail screens | detail | medium | S | open |
| [011](./issues/011.md) | Live refresh while workout analysis runs | detail | medium | M | open |
| [012](./issues/012.md) | Coach input bar: icons + native attach sheet | Coach | medium | S | open |
| [013](./issues/013.md) | Render markdown in coach replies | Coach | high | M | open |
| [014](./issues/014.md) | Simplify coach header status line | Coach | low | XS | open |
| [015](./issues/015.md) | Restructure More tab: sections, icons, chevrons, version | More | medium | M | done |
| [016](./issues/016.md) | Notification preferences screen | More | high | M | open |
| [017](./issues/017.md) | Unread badge on More tab icon | More | low | XS | done |
| [018](./issues/018.md) | Login polish: hide dev plumbing, add wordmark | auth | high | S | done |

## Companion expansion (beyond current scope)

| ID | Issue | Area | Priority | Effort | Status |
|----|-------|------|----------|--------|--------|
| [019](./issues/019.md) | Weekly glance strip on Today | expansion | medium | M | open |
| [020](./issues/020.md) | Plan-vs-done compliance marks on lists | expansion | medium | M | open |
| [021](./issues/021.md) | Day-grouped Upcoming list | expansion | low | S | open |
| [022](./issues/022.md) | "Analysis ready" card on Today | expansion | medium | S | open |
| [023](./issues/023.md) | Home-screen widget / Live Activity | expansion | high | L | open |
| [024](./issues/024.md) | Offline-first Today and planned detail | expansion | medium | M | open |
| [025](./issues/025.md) | HealthKit / Health Connect prefill for check-in | expansion | medium | L | open |
| [026](./issues/026.md) | Race/event countdown chip on Today | expansion | low | S | open |

## Suggested first batch

Store-readiness and highest daily-loop impact: **018** (login), **001** (error copy), **006** (check-in), **003** (hero), then the visual pair **009 → 008** (zone colors feed the silhouette).

OpenSpec changes exist for this batch (run `/opsx:apply` on one to implement):

| Change | Covers |
|--------|--------|
| `login-and-error-polish` | 018, 001 |
| `quick-checkin-form` | 006 |
| `recommendation-hero-states` | 003 |
| `zone-colors-structure-profile` | 009, 008 |
| `app-chrome-essentials` | — (store chrome audit: notification accent color, branded crash screen, version + legal links on More, device-verify splash/icon) |
