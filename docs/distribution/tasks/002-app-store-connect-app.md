# 002 — App Store Connect app record

**Area:** listing · **Priority:** high · **Status:** open

**Depends on:** [001](./001-apple-developer-account.md)

## Goal

Create the App Store Connect app so builds can upload and a listing can be filled.

## Steps

1. [ ] In App Store Connect → Apps → New App.
2. [ ] Platforms: iOS. Name: **Coach Watts**. Bundle ID: `com.coachwatts.mobile` (register in Certificates, Identifiers & Profiles if missing).
3. [ ] SKU: e.g. `coach-watts-mobile` (internal; stable).
4. [ ] Primary language: English (U.S.) unless product decides otherwise.
5. [ ] Confirm widget / App Group identifiers exist if ASC or Xcode signing prompts for them (`com.coachwatts.mobile.widgets`, `group.com.coachwatts.mobile`).
6. [ ] Note ASC Apple ID / app id in [log.md](../log.md) (no secrets).

## Done when

- ASC app exists and is ready for builds + metadata.
