# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Typed TypeScript interfaces for every Longhorn CRD spec/status (no more `any`).
- Unit tests for shared formatting/status utilities and a Storybook story for the volume status label.
- Human-readable byte sizes (e.g. `5Gi` instead of `5368709120`) for volume sizes, disk storage, and backup sizes.
- Colored `StatusLabel` rendering for volume `State`/`Robustness`, node disk readiness, and boolean fields.
- PVC name and workload columns on the volume list, with links from a volume to its PVC and pods.

### Changed

- Split the monolithic `src/index.tsx` into `resources/`, `components/`, and `utils/` modules; `index.tsx` now only registers sidebar entries and routes.
- Boolean status/spec fields render as `Yes`/`No` instead of raw `"true"`/`"false"` strings.
- Detail views hide empty (`-`) rows instead of listing them.
- Refreshed `package.json` description from the scaffold default.

### Removed

- Committed build output (`dist/`); `dist/` is now gitignored.
