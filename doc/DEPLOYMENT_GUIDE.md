# 🚀 Deployment Guide

**Last Updated**: 2026-01-02

---

## 📋 Overview

This guide covers releasing and deploying Runware Generator.

---

## 📦 Release Process

### 1. Pre-Release Checklist

- [ ] All tests pass
- [ ] Code is reviewed and merged
- [ ] Documentation is updated
- [ ] CHANGELOG.md is updated
- [ ] Version number is bumped
- [ ] No known critical bugs

### 2. Version Bump

```bash
# Bump version (patch/minor/major)
npm version patch
# This updates package.json and creates git tag
```

### 3. Update CHANGELOG

```markdown
## [1.0.1] - 2026-01-02

### Added

- New feature

### Fixed

- Bug fix

### Changed

- Breaking change
```

### 4. Build Release

```bash
# Build for production
npm run build

# Build distributables
npm run dist
```

### 5. Test Release

- Install from build
- Test all features
- Check for regressions

### 6. Create GitHub Release

```bash
# Push tag
git push origin v1.0.1

# Or use GitHub UI
# Go to: https://github.com/user/runware-generator/releases/new
# Select tag: v1.0.1
# Add release notes from CHANGELOG
# Upload installer files
```

---

## 🌐 Distribution Channels

### GitHub Releases

1. Go to GitHub releases page
2. Create new release
3. Upload installers:
   - Windows: `.exe`
   - macOS: `.dmg`
   - Linux: `.AppImage`, `.deb`
4. Add release notes
5. Publish

### Direct Download (Future)

- Website download page
- Download statistics
- Version checking

### Auto-Updates (Future)

- Electron auto-updater
- Check for updates on launch
- Download and install updates

---

## 🔐 Code Signing

### Windows

```bash
# Set up code signing certificate
# 1. Get certificate from CA (e.g., DigiCert)
# 2. Install certificate on Windows

# In electron-builder.json:
{
  "win": {
    "certificateFile": "path/to/certificate.pfx",
    "certificatePassword": "password"
  }
}

# Or set environment variables:
set CSC_LINK=path/to/certificate.pfx
set CSC_KEY_PASSWORD=password

npm run dist:win
```

### macOS

```bash
# 1. Get Apple Developer certificate
# 2. Set up in electron-builder.json:
{
  "mac": {
    "identity": "Developer ID Application: Your Name (TEAM_ID)",
    "hardenedRuntime": true,
    "gatekeeperAssess": false
  }
}

# 3. Notarize (required for macOS 10.15+)
npm run dist:mac
electron-notarize dist/Runware-Generator-1.0.0.dmg
```

---

## 📝 Release Notes Template

```markdown
## [VERSION] - DATE

### 🎉 New Features

- Feature 1
- Feature 2

### 🐛 Bug Fixes

- Fix 1
- Fix 2

### ⚡ Improvements

- Improvement 1
- Improvement 2

### 📝 Documentation

- Doc update

### 🔧 Breaking Changes

- Breaking change
- Migration guide: [link]

### ⬆️ Upgrade Guide

See CHANGELOG.md for full details.

### 📥 Downloads

- Windows: [link to .exe]
- macOS: [link to .dmg]
- Linux: [link to .AppImage]
```

---

## 🔄 Versioning

### Semantic Versioning

`MAJOR.MINOR.PATCH`

- **MAJOR**: Incompatible API changes
- **MINOR**: New features, backwards compatible
- **PATCH**: Bug fixes, backwards compatible

### Version Bump Examples

```bash
# Bug fix
npm version patch  # 1.0.0 -> 1.0.1

# New feature
npm version minor  # 1.0.0 -> 1.1.0

# Breaking change
npm version major  # 1.0.0 -> 2.0.0
```

---

## 📊 Release Metrics

### Track Metrics

- Download count
- Installation success rate
- Crash reports
- User feedback
- Bug reports

### Analytics (Future)

- Google Analytics
- Custom event tracking
- Version telemetry

---

## 🚨 Rollback Procedure

### If Critical Bug Found

1. **Stop distribution**
   - Remove from GitHub releases
   - Disable auto-updates

2. **Fix bug**
   - Create hotfix branch
   - Implement fix
   - Test thoroughly

3. **Release hotfix**
   - Bump patch version
   - Build and test
   - Release as patch

4. **Communicate**
   - Announce hotfix
   - Update documentation
   - Notify users

---

## ✅ Pre-Release Testing

### Test Checklist

- [ ] Install from fresh
- [ ] Update from previous version
- [ ] All features work
- [ ] No crashes
- [ ] Performance acceptable
- [ ] No security vulnerabilities
- [ ] Documentation matches

### Test Platforms

- Windows 10
- Windows 11
- macOS 11 (Big Sur)
- macOS 12 (Monterey)
- Ubuntu 20.04 LTS
- Ubuntu 22.04 LTS

---

## 📞 Post-Release

### Monitor

- GitHub issues
- Download metrics
- User feedback
- Crash reports

### Support

- Respond to issues quickly
- Document common problems
- Update FAQ

### Next Release

- Start planning next release
- Gather feature requests
- Prioritize bug fixes

---

## 🚀 Deployment Automation (Future)

### CI/CD Pipeline

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]

    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'

      - name: Install dependencies
        run: |
          npm install
          pip install -r requirements.txt

      - name: Run tests
        run: |
          npm test
          pytest

      - name: Build
        run: npm run dist

      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist-${{ matrix.os }}
          path: dist/*
```

---

## 📚 Additional Resources

- [Semantic Versioning](https://semver.org/)
- [Electron Builder](https://www.electron.build/)
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github)
- [Electron Auto-Update](https://www.electronjs.org/docs/latest/tutorial/updates)

---

**Last Updated**: 2026-01-02  
**Maintained By**: DevOps Engineer
