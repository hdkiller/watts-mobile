# Issues — Index

Backlog from the July 2026 UX/UI review plus the July 2026 bug review (code audit). Each issue lives in [issues/](./issues/) as `{id}.md` with problem, proposal, and file pointers. Conventions the fixes must follow: [DESIGN.md](./DESIGN.md).

Already shipped from that review (not tracked here): shared `Button` (variants, a11y, contrast fix), `SportIcon` on workout rows, `hitSlop` on text links, skeleton loading states, `DESIGN.md`.

**Status:** open → in-progress → done. Update the row and the issue file together.

## Core app polish

| ID | Issue | Area | Priority | Effort | Status |
|----|-------|------|----------|--------|--------|
| [001](./issues/001.md) | Friendly error copy instead of raw API messages | cross-cutting | high | S | done |
| [002](./issues/002.md) | Haptic feedback on key moments | cross-cutting | medium | S | done |
| [003](./issues/003.md) | Recommendation hero: state color, confidence visual, accepted state | Today | high | M | done |
| [004](./issues/004.md) | Modify/Rest affordance: "Discuss with Coach" | Today | medium | M | done |
| [005](./issues/005.md) | Recovery glance polish: sentiment dots + band header rename | Today | medium | S | done |
| [006](./issues/006.md) | Faster check-in: tap controls, save feedback, weight unit | Log | high | M | done |
| [007](./issues/007.md) | Log cleanup: drop "Back to Today", read-only chip icon | Log | low | XS | done |
| [008](./issues/008.md) | Workout structure silhouette on planned detail | detail | high | M | done |
| [009](./issues/009.md) | Zone color ramp (Z1–Z5) across zones UI | detail/charts | high | S | done |
| [010](./issues/010.md) | Hero stat blocks on detail screens | detail | medium | S | done |
| [011](./issues/011.md) | Live refresh while workout analysis runs | detail | medium | M | done |
| [012](./issues/012.md) | Coach input bar: icons + native attach sheet | Coach | medium | S | done |
| [013](./issues/013.md) | Render markdown in coach replies | Coach | high | M | done |
| [014](./issues/014.md) | Simplify coach header status line | Coach | low | XS | done |
| [015](./issues/015.md) | Restructure More tab: sections, icons, chevrons, version | More | medium | M | done |
| [016](./issues/016.md) | Notification preferences screen | More | high | M | done |
| [017](./issues/017.md) | Unread badge on More tab icon | More | low | XS | done |
| [018](./issues/018.md) | Login polish: hide dev plumbing, add wordmark | auth | high | S | done |

## Companion expansion (beyond current scope)

| ID | Issue | Area | Priority | Effort | Status |
|----|-------|------|----------|--------|--------|
| [019](./issues/019.md) | Weekly glance strip on Today | expansion | medium | M | done |
| [020](./issues/020.md) | Plan-vs-done compliance marks on lists | expansion | medium | M | done |
| [021](./issues/021.md) | Day-grouped Upcoming list | expansion | low | S | done |
| [022](./issues/022.md) | "Analysis ready" card on Today | expansion | medium | S | done |
| [023](./issues/023.md) | Home-screen widget / Live Activity | expansion | high | L | done |
| [024](./issues/024.md) | Offline-first Today and planned detail | expansion | medium | M | done |
| [025](./issues/025.md) | HealthKit / Health Connect prefill for check-in | expansion | medium | L | done |
| [026](./issues/026.md) | Race/event countdown chip on Today | expansion | low | S | done |

## Bug review — July 2026 (code audit)

Findings from a static review of auth, API, chat, dates, and the Log/Today loops. Tests (209) and `tsc` were green at review time — these are logic/runtime defects, not build breaks.

| ID | Issue | Area | Priority | Effort | Status |
|----|-------|------|----------|--------|--------|
| [027](./issues/027.md) | Token refresh race (apiFetch vs coachChatFetch) + missing auth-failure propagation | auth/api | high | S | open |
| [028](./issues/028.md) | Date-only strings parsed as UTC shift days in western timezones | dates | high | S | open |
| [029](./issues/029.md) | saveTokens leaves stale refresh token / expiry behind | auth | medium | XS | open |
| [030](./issues/030.md) | Switching instance URL keeps old tokens and query cache | auth/instance | medium | S | open |
| [031](./issues/031.md) | Check-in weight: display unit label ≠ stored/sent unit | Log | high | S | open |
| [032](./issues/032.md) | Health sleep prefill double-counts (two-night window, overlapping samples) | Log/health | medium | M | open |
| [033](./issues/033.md) | Today generation poll leaks setInterval on unmount / stacks on retap | Today | medium | S | done |
| [034](./issues/034.md) | Check-in form state clobbered by wellness refetch | Log | medium | S | open |
| [035](./issues/035.md) | Raw JSON parse errors leak to athlete from generate endpoints | cross-cutting | low | XS | open |
| [036](./issues/036.md) | Week glance bars mix seconds with TSS, flattening planned days | Today | low | XS | open |
| [037](./issues/037.md) | Coach chat keyboard: input hidden, no dismiss, send unreachable | Coach | high | S | done |

Suggested order: **037** (daily-loop blocker, reported from device), then **027 → 029 → 030** (one auth hardening pass), **028** (needs API date-format check against coach-wattz), **031** (needs wellness API unit contract), then **034**, and the small ones **035 / 036 / 032** as time allows.

## UX/UI review — July 2026 (live walkthrough)

Findings from a device walkthrough (iPhone 17 Pro simulator, real account data) of Today, Log, Coach, More, Settings, Notifications, planned detail, and the daily check-in, judged against [DESIGN.md](./DESIGN.md).

| ID | Issue | Area | Priority | Effort | Status |
|----|-------|------|----------|--------|--------|
| [038](./issues/038.md) | Chat shows internal seed context as the athlete's own message | Coach | high | S | open |
| [039](./issues/039.md) | Check-in card promises questions; screen says "No questions today" | Today/check-in | high | S | open |
| [040](./issues/040.md) | Bottom content trapped under the floating native tab bar | tabs/layout | medium | S | open |
| [041](./issues/041.md) | Implausible health values shown prominently ("Sleep 0.2 hrs ↓ 69%") | Today/wellness | medium | S | open |
| [042](./issues/042.md) | Planned detail: "2 bpm" step meta, all-gray silhouette, jargon status | detail | medium | M | open |
| [043](./issues/043.md) | Raw workout type strings in UI ("WeightTraining") | cross-cutting | low | XS | open |
| [044](./issues/044.md) | Notifications inbox: repetition wall, inconsistent timestamps | notifications | low | S | open |
| [045](./issues/045.md) | Coach open uses a spinner, against the skeleton rule | Coach | low | S | open |
| [046](./issues/046.md) | Polish sweep: double Settings title, placeholder-as-value fields, "Water 0.0 L" | cross-cutting | low | S | open |
| [047](./issues/047.md) | Planned detail: collapse zones table, put zone info on steps (web parity) | detail | medium | M | open |
| [048](./issues/048.md) | Activity detail: analysis wall, scale-less scores, chart/desc polish | detail | medium | M | open |
| [049](./issues/049.md) | Drill-downs hide the tab bar; one global stack accumulates history | navigation | medium | M | open |
| [050](./issues/050.md) | Athlete screen: scale-less AI score chips, dense wayfinding prose | profile | low | S | open |
| [051](./issues/051.md) | Sports settings: duplicated titles, raw enums, weak row affordance | settings | low | S | open |
| [052](./issues/052.md) | Units & locale: raw always-expanded IANA timezone list | settings | low | S | open |

## Product-quality horizon — July 2026

Cross-cutting quality gaps surfaced while closing the review; each needs a decision more than a quick fix.

| ID | Issue | Area | Priority | Effort | Status |
|----|-------|------|----------|--------|--------|
| [053](./issues/053.md) | Dynamic Type untested, Reduce Motion ignored | accessibility | medium | M | open |
| [054](./issues/054.md) | i18n scaffold is dead code; mixed-language UX unowned | i18n | medium | M | open |
| [055](./issues/055.md) | iPad enabled but ships stretched phone layouts | store/layout | medium | S–M | open |
| [056](./issues/056.md) | First-run experience unaudited (day-one athlete) | onboarding | medium | M | open |

Suggested order: the trust pair **038 + 039** first (both make the daily loop feel broken), **041** with them (same "trust the numbers" theme), then **040** (one shared inset fix), the detail-page trio **042 → 047 → 048** (042's `units` fix unlocks 047), **049** as its own routing change (touches deep links — don't batch it), and the polish batch **043 / 044 / 045 / 046 / 050 / 051 / 052** together.

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
