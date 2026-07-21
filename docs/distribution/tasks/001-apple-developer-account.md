# 001 — Apple ID + Developer Program enrollment

**Area:** account · **Priority:** high · **Status:** done

## Goal

Own the App Store listing under **Watt Mind Kft.**, with a durable company Account Holder Apple ID.

## Decision (2026-07-20)

| Choice | Detail |
|--------|--------|
| Program | **Organization** (not Individual) |
| Legal entity | Watt Mind Kft. |
| Domain | watt-mind.com |
| Account Holder | New Apple ID: **`deploy@watt-mind.com`** — **not** `hdkiller@gmail.com` |
| Personal ID | `hdkiller@gmail.com` stays personal; invite to the team as Admin (or Developer) after enrollment |

Why not enroll with the Gmail Apple ID: the App Store seller / legal entity should be the Kft.; Account Holder recovery and ownership stay with the company if personal access changes; Apple verifies Organization against entity docs + D‑U‑N‑S.

## Steps

1. [x] Confirm legal entity: Watt Mind Kft. (`watt-mind.com`).
2. [x] D‑U‑N‑S / entity details provided in Apple enrollment (as required by the flow).
3. [x] Create mailbox `deploy@watt-mind.com` (monitored / aliased).
4. [x] Create **new** Apple ID with `deploy@watt-mind.com`; 2FA on; credentials in password manager (not git).
5. [x] Enroll as **Organization** → Watt Mind Kft.; upload supporting documents.
6. [x] Apple entity review cleared; proceed to paid membership.
7. [x] Pay Apple Developer Program membership — order **`W1458543323`** (confirmation + activation info → `deploy@watt-mind.com`, 2026-07-21).
8. [x] Confirm membership is **active** in [Apple Developer](https://developer.apple.com/account) (entity: Watt Mind Korlatolt Felelossegu Tarsasag).
9. [x] Record **Team ID** `42K8S6866N` in [log.md](../log.md) / [distribution.md](../../distribution.md) (AASA: `42K8S6866N.com.coachwatts.app`).
10. [x] Invite `hdkiller@gmail.com` as **Admin**; invitation accepted (2026-07-21).
11. [ ] Optionally invite Expo/EAS CI or other teammates with their own Apple IDs (can do later; not required to close this task).

## Blockers / notes

- Secrets: never commit Apple ID passwords or recovery keys.
- Account Holder remains `deploy@watt-mind.com`; day-to-day via `hdkiller@gmail.com` Admin.

## Done when

- Organization membership active for Watt Mind Kft.; Team ID known; Account Holder is the company-email Apple ID; personal Gmail invited to the team.
