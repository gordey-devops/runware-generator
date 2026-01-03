# 📜 Changelog

All notable changes to the Runware Generator project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned

- Phase 2: Backend Implementation
- Phase 3: Electron Setup
- Phase 4: React UI
- Text-to-Image generation
- Image history management
- Settings page

---

## [0.0.1] - 2026-01-02

### Added

- Phase 0: Project Planning & Research
- Phase 1: Project Restructuring
- Directory structure for Electron + Python app
- Configuration files (package.json, tsconfig, etc.)
- Python dependencies (FastAPI, Runware SDK, SQLAlchemy)
- Node.js dependencies (React 19, Electron 35, Vite 6)
- Development tools (Ruff, ESLint, Prettier, Jest)
- Pre-commit hooks
- Documentation structure
- SDK integration and testing
- Test images generated successfully

### Changed

- Updated all dependencies to 2026 versions
  - Python: FastAPI 0.128, Pydantic 2.10, SQLAlchemy 2.0.36
  - Node.js: React 19, Electron 35, Vite 6, Tailwind 4
- Restructured documentation for better organization

### Fixed

- aiofiles dependency conflict (pinned to 23.2.1)
- Electron security vulnerability (updated to 35.7)
- npm audit - 0 vulnerabilities

### Security

- Updated Electron from 34.0.0 to 35.7.5
- Updated Pillow from 10.2.0 to 11.1.0 (security fixes)
- All packages now on latest stable versions

### Documentation

- Created comprehensive documentation structure
- PROJECT_OVERVIEW.md - Project summary and status
- PROJECT_STATUS.md - Phase progress and metrics
- IMPLEMENTATION_PLAN.md - 10-phase implementation plan
- ARCHITECTURE.md - System architecture documentation
- SETUP_GUIDE.md - Development environment setup
- CODE_STANDARDS.md - Coding conventions
- ROADMAP.md - Detailed technical roadmap
- RUNWARE_SDK.md - SDK capabilities and usage
- TEST_RESULTS.md - SDK testing results
- Documentation index and README

---

## [0.0.0] - 2026-01-02

### Added

- Initial project structure
- Basic Python setup
- Basic TypeScript setup
- Runware SDK integration plan
- Initial documentation

---

## Version History

| Version | Date       | Release Notes             |
| ------- | ---------- | ------------------------- |
| 0.0.1   | 2026-01-02 | Planning & Setup Complete |
| 0.0.0   | 2026-01-02 | Project Initialization    |

---

## Upcoming Versions

### [0.1.0] - Phase 2 Complete (Backend)

- FastAPI backend implemented
- Runware service integrated
- REST API endpoints working
- Database models created
- API documentation complete

### [0.2.0] - Phase 3 Complete (Electron)

- Electron app running
- Python bridge functional
- IPC communication working
- Development and production builds

### [0.3.0] - Phase 4 Complete (React UI)

- React UI implemented
- State management with Zustand
- Generation interface working
- History page implemented
- Settings page implemented

### [1.0.0] - MVP Release

- Text-to-Image generation
- Basic parameters (size, steps, guidance)
- Negative prompts
- Seed control
- Save images locally
- History management
- Settings page
- Windows build (.exe installer)

### Future Versions

- [1.1.0] - Image-to-Image
- [1.2.0] - Upscaling
- [1.3.0] - Batch processing
- [1.4.0] - Advanced parameters (ControlNet, LoRA)
- [1.5.0] - Video generation
- [2.0.0] - Cross-platform (macOS, Linux)
- [2.1.0] - Preset system
- [2.2.0] - Auto-updates

---

## Types of Changes

- `Added` for new features
- `Changed` for changes in existing functionality
- `Deprecated` for soon-to-be removed features
- `Removed` for now removed features
- `Fixed` for any bug fixes
- `Security` for vulnerability fixes

---

**Last Updated**: 2026-01-02  
**Maintained By**: Project Lead
