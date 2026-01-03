# 📦 Build Guide

**Last Updated**: 2026-01-02

---

## 📋 Overview

This guide covers building the Runware Generator for development and production.

---

## 🔧 Prerequisites

- Node.js 18+
- Python 3.10+
- Windows 10/11 (for Windows builds)
- macOS 11+ (for macOS builds)
- Linux (for Linux builds)

---

## 🚀 Development Build

### Python Backend

```bash
# Just run the Python server
python backend/main.py

# Or with uvicorn
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

### React Frontend (Renderer)

```bash
# Start Vite dev server
npm run dev:renderer

# Server runs on http://localhost:5173
```

### Electron App

```bash
# Start Electron in development mode
npm run dev:electron

# This will:
# 1. Start Python backend
# 2. Compile TypeScript for Electron
# 3. Start Vite dev server
# 4. Launch Electron app
```

### All Together

```bash
# Terminal 1 - Backend
python backend/main.py

# Terminal 2 - Frontend
npm run dev:renderer

# Terminal 3 - Electron
npm run dev:electron
```

---

## 🏗️ Production Build

### Step 1: Build Renderer (React)

```bash
npm run build:renderer
```

This creates the production bundle in `dist/renderer/`.

### Step 2: Build Electron Main Process

```bash
npm run build:electron
```

This compiles TypeScript to JavaScript in `dist/electron/`.

### Step 3: Build Everything

```bash
npm run build
```

Builds both renderer and electron.

### Step 4: Package Python (Optional)

```bash
# Create standalone Python executable
pip install pyinstaller
cd backend
pyinstaller --onefile --add-data "config:config" main.py
```

This creates `backend/dist/main/main.exe`.

---

## 📦 Package for Distribution

### Using Electron Builder

```bash
# Build for current platform
npm run dist

# Windows
npm run dist:win

# macOS
npm run dist:mac

# Linux
npm run dist:linux
```

### Output Locations

```
dist/
├── Runware-Generator Setup 1.0.0.exe    # Windows installer
├── Runware-Generator-1.0.0.dmg         # macOS DMG
└── Runware-Generator-1.0.0.AppImage     # Linux AppImage
```

---

## ⚙️ Build Configuration

### package.json Scripts

```json
{
  "scripts": {
    "dev:renderer": "vite",
    "dev:electron": "concurrently \"npm run dev:renderer\" \"wait-on http://localhost:5173 && electron .\"",
    "build:renderer": "vite build",
    "build:electron": "tsc -p tsconfig.electron.json",
    "build": "npm run build:renderer && npm run build:electron",
    "dist": "electron-builder",
    "dist:win": "electron-builder --win",
    "dist:mac": "electron-builder --mac",
    "dist:linux": "electron-builder --linux"
  }
}
```

### electron-builder.json

```json
{
  "appId": "com.runware.generator",
  "productName": "Runware Generator",
  "directories": {
    "output": "dist",
    "buildResources": "electron/resources"
  },
  "files": ["dist/**/*", "electron/main/**/*", "electron/preload/**/*", "package.json"],
  "win": {
    "target": [
      {
        "target": "nsis",
        "arch": ["x64"]
      },
      {
        "target": "portable",
        "arch": ["x64"]
      }
    ],
    "icon": "electron/resources/icon.ico"
  },
  "mac": {
    "target": ["dmg"],
    "icon": "electron/resources/icon.icns",
    "category": "public.app-category.graphics-design"
  },
  "linux": {
    "target": ["AppImage", "deb"],
    "icon": "electron/resources/icon.png",
    "category": "Graphics"
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true,
    "installerIcon": "electron/resources/icon.ico",
    "uninstallerIcon": "electron/resources/icon.ico",
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true
  }
}
```

---

## 🎯 Platform-Specific Builds

### Windows

```bash
# Build Windows installer
npm run dist:win

# Output: dist/Runware-Generator Setup 1.0.0.exe
```

**Requirements:**

- Windows 10/11
- NSIS (included with Electron Builder)

### macOS

```bash
# Build macOS DMG
npm run dist:mac

# Output: dist/Runware-Generator-1.0.0.dmg
```

**Requirements:**

- macOS 11+
- Xcode Command Line Tools
- Wine (for cross-platform builds from Windows)

### Linux

```bash
# Build Linux packages
npm run dist:linux

# Output: dist/Runware-Generator-1.0.0.AppImage
#         dist/runware-generator_1.0.0_amd64.deb
```

**Requirements:**

- Linux (Ubuntu/Debian/Fedora/etc.)
- AppImage tools (included with Electron Builder)

---

## 🔍 Troubleshooting

### Build Fails with TypeScript Error

```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

### Vite Build Fails

```bash
# Check for path aliases
# Update vite.config.ts
```

### Electron Builder Fails

```bash
# Clean electron-builder cache
rm -rf ~/.cache/electron-builder

# Try again
npm run dist
```

### Windows Installer Too Large

```bash
# Useasar packaging (enabled by default)
# In electron-builder.json:
{
  "asar": true
}

# Exclude unnecessary files
{
  "asarUnpack": [
    "backend/python/lib/**"
  ]
}
```

---

## 🚀 Optimizations

### Reduce Bundle Size

```json
// electron-builder.json
{
  "asar": true,
  "compression": "maximum",
  "files": ["dist/**/*", "!dist/**/*.map", "!**/*.test.*", "!**/node_modules/**"]
}
```

### Python Packaging

```bash
# Use PyInstaller with exclusions
pyinstaller \
  --onefile \
  --exclude-module tkinter \
  --exclude-module unittest \
  --add-data "config:config" \
  main.py
```

---

## ✅ Build Checklist

Before releasing:

- [ ] All tests pass
- [ ] Linting passes
- [ ] Build completes successfully
- [ ] Installer launches correctly
- [ ] Python backend starts
- [ ] Frontend renders
- [ ] Generation works
- [ ] History works
- [ ] Settings work
- [ ] No console errors

---

## 📚 Additional Resources

- [Electron Builder Docs](https://www.electron.build/)
- [Vite Build Guide](https://vite.dev/guide/build)
- [PyInstaller Docs](https://pyinstaller.org/)
- [Electron Packaging](https://electronjs.org/docs/latest/tutorial/code-signing)

---

**Last Updated**: 2026-01-02  
**Maintained By**: DevOps Engineer
