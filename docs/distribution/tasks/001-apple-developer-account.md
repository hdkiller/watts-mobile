# 001 — Apple ID + Developer Program enrollment

**Area:** account · **Priority:** high · **Status:** blocked

## Goal

Own the App Store listing under **Watt Mind Kft.**, with a durable company Account Holder Apple ID.

## Decision (2026-07-20)

| Choice | Detail |
|--------|--------|
| Program | **Organization** (not Individual) |
| Legal entity | Watt Mind Kft. |
| Domain | watt-mind.com |
| Account Holder | New Apple ID: planned **`deploy@watt-mind.com`** — **not** `hdkiller@gmail.com` |
| Personal ID | `hdkiller@gmail.com` stays personal; invite to the team as Admin (or Developer) after enrollment |

Why not enroll with the Gmail Apple ID: the App Store seller / legal entity should be the Kft.; Account Holder recovery and ownership stay with the company if personal access changes; Apple verifies Organization against entity docs + D‑U‑N‑S.

## Steps

1. [x] Confirm legal entity: Watt Mind Kft. (`watt-mind.com`).
2. [x] D‑U‑N‑S / entity details provided in Apple enrollment (as required by the flow).
3. [x] Create mailbox `deploy@watt-mind.com` (monitored / aliased).
4. [x] Create **new** Apple ID with `deploy@watt-mind.com`; 2FA on; credentials in password manager (not git).
5. [x] Enroll as **Organization** → Watt Mind Kft.; upload supporting documents.
6. [ ] **Blocked:** wait for Apple review (“We’ll review the details you provided and contact you soon.”). Watch `deploy@watt-mind.com` (and spam).
7. [ ] After approval: complete paid membership / agreements if prompted; record **Team ID** in [log.md](../log.md) (AASA needs `TEAMID.com.coachwatts.mobile`).
8. [ ] Invite `hdkiller@gmail.com` as **Admin** (or Developer) so day-to-day work uses the personal Apple ID without it owning the account.
9. [ ] Optionally invite Expo/EAS CI or other teammates with their own Apple IDs.

## Blockers / notes

- **Current blocker:** Apple entity verification in progress (docs uploaded 2026-07-20). Typical wait: a few business days; can be longer for new Orgs / non-US entities.
- If Apple emails asking for more docs or a phone call, respond from the Account Holder context (`deploy@…`); log the outcome.
- Secrets: never commit Apple ID passwords or recovery keys.
- Do **not** start a parallel Individual enrollment on `hdkiller@gmail.com` while waiting.

## Done when

- Organization membership active for Watt Mind Kft.; Team ID known; Account Holder is the company-email Apple ID; personal Gmail invited to the team.
