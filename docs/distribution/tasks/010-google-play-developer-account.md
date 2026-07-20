# 010 — Google Play Developer account (Watt Mind Kft.)

**Area:** account · **Priority:** medium · **Status:** in-progress

## Goal

Own Play Console under **Watt Mind Kft.** with a durable organization account (parallel to Apple Org enrollment).

## Decision

| Choice | Detail |
|--------|--------|
| Account type | **Organization** (not personal) |
| Legal entity | Watt Mind Kft. (`watt-mind.com`) |
| Console login | Prefer company Google account / Cloud Identity on `watt-mind.com` (e.g. `deploy@watt-mind.com` or a dedicated Play admin). Avoid tying the developer account solely to a personal Gmail if the Kft. should own it. |
| Personal access | Invite `hdkiller@gmail.com` (or Workspace user) as admin after org setup |

Google’s org verification (D‑U‑N‑S / business docs) is separate from Apple’s; expect its own review timeline and a one-time Play Console registration fee.

## Walkthrough

Follow [../play-console-signup.md](../play-console-signup.md) end-to-end (prereqs → signup → verification → invite Admin).

## Steps

1. [x] Decide Play admin Google identity (Workspace / `deploy@watt-mind.com` family).
2. [x] D‑U‑N‑S / org details provided in signup flow as required.
3. [x] Register **Organization** Play Console account; **registration fee paid** (2026-07-20).
4. [x] Organization **website verified** in Play Console.
5. [ ] Complete **ID / identity verification** (user will finish later today — docs or ID check Google requests).
6. [ ] Invite day-to-day admins (`hdkiller@gmail.com` or Workspace); record Play owner email (not passwords) in [log.md](../log.md).
7. [x] Accept Play developer distribution agreement / policies (as part of paid signup).

## Blockers / notes

- Can proceed **in parallel** with Apple waiting — does not unblock iOS, but shortens calendar if both reviews run together.
- Secrets: never commit Play Console passwords or service-account JSON keys to git. Store service-account JSON for EAS Submit in EAS secrets / password manager only.
- If a personal Play account already exists under Gmail, prefer **not** publishing Coach Watts there long-term; transfer to org or start org-owned from day one.

## Done when

- Play Console Organization for Watt Mind Kft. is verified and usable to create apps.
