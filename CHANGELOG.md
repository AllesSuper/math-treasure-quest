# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned

- Sound effects and gentle background music
- Parent dashboard with progress overview
- Additional adventure worlds

## [1.0.0] - 2026-06-09

### Added

- Initial public release of Mathe-Schatzreise.
- Offline-capable PWA (installable via "Add to Home Screen" on iPad Safari).
- Language selection screen on first launch with 16 languages (German first),
  saved to `localStorage` and changeable later in settings.
- Clean i18n dictionary with German fallback for missing keys.
- Three math modes (addition, subtraction, multiplication) plus a mixed mode.
- Range-safe task generation: addition sums <= 100, non-negative subtraction,
  multiplication from 1x1 to 10x11.
- Adventure map with a moving traveler and station-by-station progress.
- Adaptive difficulty, optional timer mode, and optional quick mode (10 tasks).
- Helpful hints shown after mistakes.
- Rewards: stars, streaks, coins, badges, and a random treasure chest each run.
- Premium cartoon look built entirely from original CSS/SVG/HTML graphics.
- Full keyboard and touch support, high-contrast accessible UI, RTL support,
  and `prefers-reduced-motion` handling.
- Service worker caching the full app shell for offline play.
- Node-based unit tests verifying math stays within the requested ranges.
- GitHub Actions workflows for Pages deployment and quality checks.
- Open-source project files: README, LICENSE (MIT), CONTRIBUTING, CODE OF
  CONDUCT, SECURITY, ROADMAP, issue templates, and PR template.

[Unreleased]: https://github.com/AllesSuper/math-treasure-quest/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/AllesSuper/math-treasure-quest/releases/tag/v1.0.0
