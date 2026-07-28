# Security Policy

## Reporting Vulnerabilities

We take security seriously at Coach Watts. If you discover a vulnerability or security issue in `watts-mobile` or associated services, please report it responsibly rather than opening a public GitHub issue.

### How to Report

- **GitHub Private Vulnerability Reporting (Recommended)**: Submit a report directly via the repository's **Security** tab → **[Report a vulnerability](https://github.com/watt-mind/watts-mobile/security/advisories/new)**.
- **Email**: Send vulnerability reports to [hdkiller@coachwatts.com](mailto:hdkiller@coachwatts.com).
- **Details**: Please include:
  - Description of the vulnerability and its potential impact.
  - Steps to reproduce or proof-of-concept (PoC) code.
  - Any affected versions or client environments.

### What to Expect

- **Acknowledgement**: We will acknowledge receipt of your report within 48 hours.
- **Triage & Fix**: We will evaluate the report, provide an estimated timeline for remediation, and notify you when a fix is deployed or released.
- **Disclosure**: We ask that you give us reasonable time to remediate issues before making them public.

## Supported Versions

| Version / Branch | Supported |
| ---------------- | --------- |
| `develop` / `master` | Yes |
| Release builds (App Store / Play Store) | Yes |

## Security Best Practices for Contributors

- **Secrets**: Never commit real API keys, OAuth client secrets, Sentry DSNs, or keystore certificates to the repository.
- **Environment Variables**: Always use `.env.example` as a template for local environment configuration.
