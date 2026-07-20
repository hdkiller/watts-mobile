# 004 — Listing metadata & assets

**Area:** listing · **Priority:** high · **Status:** open

**Depends on:** [002](./002-app-store-connect-app.md)

## Goal

Fill App Store listing fields Apple requires before submission. Phone-only (no iPad screenshots) — `supportsTablet: false`.

## Steps

1. [ ] Decide screenshot owner (marketing vs eng) and capture required iPhone sizes from a **production/TestFlight** build.
2. [ ] Write subtitle / description / keywords / promotional text using companion positioning (Today, Log, Coach, notifications; web keeps planning/analytics). Source blurb: [../../store-privacy-checklist.md](../../store-privacy-checklist.md) “Purpose of the app”.
3. [ ] Support URL: `https://coachwatts.com` or support page; marketing URL optional. Support email path already in-app (`mailto:support@coachwatts.com`).
4. [ ] Category: Health & Fitness (or product choice); secondary optional.
5. [ ] App icon: 1024×1024 from `assets/images/icon.png` (ASC may pull from binary; keep asset branded).
6. [ ] What’s New for 0.1.0 / first release.
7. [ ] Review captions and screenshots: **no medical claims**.

## Done when

- ASC listing has required screenshots + text for the locales we ship.
