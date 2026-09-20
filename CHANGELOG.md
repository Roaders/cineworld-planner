# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.6.8] - 2026-09-20

### Added

- Added an architecture, privacy, deployment, and cost proposal for usage analytics and public statistics.
- Added a Ko-fi support widget styled to match the application's buttons.

## [1.6.7] - 2026-09-20

### Fixed

- Made preference service tests independent of the test runner's `localStorage` implementation.

## [1.6.6] - 2026-09-20

### Added

- Added a changelog covering releases from 1.6.0 onward.

### Changed

- Documented the application's features in the README.
- Made selected films visually distinct with a persistent active style and selection tick.
- Required releases to run from the `main` branch.
- Updated the release process to create the changelog release section automatically.

### Fixed

- Kept selected-film feedback visible after the first tap on mobile devices.
- Treated trailer allowance and maximum break length as numbers, preventing extremely large calculated overlaps after editing either field.
- Widened the planning preference inputs so their complete values remain visible.

## [1.6.4] - 2026-09-20

### Changed

- Updated component styles to remove Angular build warnings.

### Fixed

- Corrected event timeline chart rendering when listings are not returned chronologically.

## [1.6.3] - 2026-09-19

### Added

- Added a GitHub repository link to the application footer.

## [1.6.2] - 2026-09-19

### Changed

- Added API documentation throughout the Angular application and Node server.

## [1.6.1] - 2026-09-19

### Added

- Added automated tagged GitHub releases.
- Restored ESLint as a build quality gate.
- Documented local development, deployment, and container workflows.

### Changed

- Updated the Node and Angular runtimes and project dependencies.
- Cached itinerary calculations and reduced legacy frontend dependencies.
- Hardened the production container and public API resource limits.

### Fixed

- Validated Cineworld API responses and listings request parameters before processing them.

## [1.6.0] - 2026-09-19

### Changed

- Migrated cinema listings and film metadata to Cineworld's current APIs.
- Added fallback discovery when Cineworld changes its Gatsby theater query identifier.
