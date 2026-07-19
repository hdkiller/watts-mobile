# app-shell Delta — App Chrome Essentials

## ADDED Requirements

### Requirement: Branded error fallback
The root layout SHALL export a Coach Watts-branded error boundary that catches render/runtime errors on any route, shows a dark-surface fallback with friendly copy and a "Try again" recovery action, and reports the error to Sentry. The fallback MUST NOT show raw error messages or stacks in production builds; development builds MAY append diagnostic detail below the branded chrome.

#### Scenario: Crash shows branded fallback
- **WHEN** a screen throws during render in a production build
- **THEN** the user sees the Coach Watts error screen with a "Try again" action instead of the framework default, and the error is captured by Sentry

#### Scenario: Recovery action retries
- **WHEN** the user taps "Try again" on the error fallback
- **THEN** the failed route re-renders and the app continues if the error was transient

#### Scenario: Dev detail preserved
- **WHEN** a screen throws in a development build
- **THEN** the fallback additionally shows the error message and stack for debugging
