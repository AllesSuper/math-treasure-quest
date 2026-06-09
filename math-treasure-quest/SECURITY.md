# Security Policy

## Our security posture

Mathe-Schatzreise is a fully client-side, static web app. It has:

- **No backend or server-side code**
- **No user accounts or authentication**
- **No external network requests, APIs, ads, or trackers**
- **No personal data collection** - progress is stored only in the browser's
  `localStorage` on the user's own device

This dramatically reduces the attack surface, but we still take security and
child safety seriously.

## Supported versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |

## Reporting a vulnerability

If you discover a security or privacy issue, please **do not open a public
issue**. Instead:

1. Use GitHub's private security advisory feature on this repository, **or**
2. Email the maintainers at `security@example.com` (replace with your contact).

Please include:

- A clear description of the issue
- Steps to reproduce
- The potential impact

We aim to acknowledge reports within **7 days** and to provide a fix or
mitigation plan as quickly as is practical.

## Scope

Examples of in-scope issues:

- Cross-site scripting (XSS) via crafted input
- A dependency or asset that unexpectedly contacts the network
- Any code path that could leak data off the device

Thank you for helping keep children and families safe.
