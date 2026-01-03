# 🔧 Setup Guide

**Last Updated**: 2026-01-02

---

## 📋 Prerequisites

### Required Software

- **Python**: 3.10 or higher
- **Node.js**: 18 or higher
- **Git**: Latest version
- **OS**: Windows 10/11 (primary), macOS/Linux (future)

### Optional Tools

- **VS Code**: Recommended IDE with extensions
- **Postman**: For API testing
- **Docker**: For containerized testing (optional)

---

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd runware-generator
```

### 2. Python Environment Setup

#### Windows

```bash
# Verify Python version
python --version

# Create virtual environment (optional but recommended)
python -m venv venv

# Activate virtual environment
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

#### macOS/Linux

```bash
# Verify Python version
python3 --version

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

### 3. Node.js Environment Setup

```bash
# Verify Node.js version
node --version

# Install dependencies
npm install
```

### 4. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env file
# Add your Runware API key:
# RUNWARE_API_KEY=your_api_key_here
```

### 5. Setup Pre-commit Hooks

```bash
pre-commit install
```

### 6. Start Development Servers

#### Terminal 1 - Backend

```bash
# Make sure virtual environment is activated
python backend/main.py
```

Server should start on http://localhost:8000

#### Terminal 2 - Frontend

```bash
npm run dev:renderer
```

Vite dev server should start on http://localhost:5173

#### Terminal 3 - Electron (when Phase 3 is complete)

```bash
npm run dev:electron
```

---

## 💻 IDE Setup

### Visual Studio Code

#### Recommended Extensions

```json
{
  "recommendations": [
    "ms-python.python",
    "ms-python.vscode-pylance",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "GitHub.copilot"
  ]
}
```

#### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "python.linting.enabled": true,
  "python.linting.ruffEnabled": true,
  "python.formatting.provider": "ruff",
  "python.testing.pytestEnabled": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.exclude": {
    "**/__pycache__": true,
    "**/*.pyc": true,
    ".pytest_cache": true
  }
}
```

---

## 🔐 Runware API Key Setup

### Get API Key

1. Visit https://runware.ai/
2. Create account
3. Generate API key
4. Copy key

### Configure API Key

Create or edit `.env` file:

```env
# Runware Configuration
RUNWARE_API_KEY=your_actual_api_key_here

# Server Configuration
HOST=127.0.0.1
PORT=8000

# Storage Configuration
STORAGE_PATH=./generated

# Database Configuration
DATABASE_URL=sqlite:///./runware.db
```

### Verify API Key

```bash
# Run SDK test
python test_runware.py
```

---

## 🧪 Verify Installation

### Test Python Backend

```bash
# Run health check
curl http://localhost:8000/health

# Or use browser
# http://localhost:8000/docs  # Swagger UI
```

### Test Frontend

```bash
# Open browser
# http://localhost:5173
```

### Run Tests

```bash
# Python tests
pytest

# Node.js tests
npm test

# Pre-commit hooks
pre-commit run --all-files
```

---

## 📁 Project Structure Overview

```
runware-generator/
├── backend/                    # Python FastAPI backend
│   ├── api/                   # API endpoints
│   ├── services/              # Business logic
│   ├── core/                  # Configuration
│   ├── models/                # Database models
│   └── main.py               # Entry point
├── electron/                  # Electron app
│   ├── main/                 # Main process
│   ├── preload/              # IPC bridge
│   └── renderer/             # React UI
├── shared/                     # Shared types
├── doc/                        # Documentation
├── .env                        # Environment variables
├── requirements.txt           # Python deps
├── package.json              # Node.js deps
└── README.md                 # Project README
```

---

## ⚙️ Configuration Files

### Python Configuration

**`pyproject.toml`**: Python tools configuration

- Ruff (linting/formatting)
- Pytest (testing)
- Mypy (type checking)

**`requirements.txt`**: Production Python dependencies
**`requirements-dev.txt`**: Development Python dependencies

### Node.js Configuration

**`package.json`**: Node.js dependencies and scripts
**`tsconfig.json`**: TypeScript configuration
**`tsconfig.electron.json`**: Electron TypeScript configuration
**`vite.config.ts`**: Vite build configuration
**`tailwind.config.js`**: Tailwind CSS configuration
**`jest.config.js`**: Jest testing configuration
**`.eslintrc.json`**: ESLint rules
**`.prettierrc.json`**: Prettier formatting

---

## 🔧 Common Tasks

### Add New Python Dependency

```bash
pip install package_name
pip freeze > requirements.txt
```

### Add New Node.js Dependency

```bash
npm install package_name
# Or for dev dependency
npm install -D package_name
```

### Update Dependencies

```bash
# Python
pip install --upgrade -r requirements.txt

# Node.js
npm update
npm audit fix
```

### Clean Build Files

```bash
# Python
find . -type d -name __pycache__ -exec rm -rf {} +
find . -type f -name "*.pyc" -delete

# Node.js
rm -rf node_modules
rm -rf dist
npm install
```

---

## 🚨 Troubleshooting

### Python Issues

**Issue**: ModuleNotFoundError

```bash
# Solution: Install dependencies
pip install -r requirements.txt
```

**Issue**: PermissionError

```bash
# Solution: Use virtual environment
python -m venv venv
venv\Scripts\activate
```

### Node.js Issues

**Issue**: ENOENT: no such file or directory

```bash
# Solution: Install dependencies
npm install
```

**Issue**: Port already in use

```bash
# Solution: Kill process on port
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :8000
kill -9 <PID>
```

### Runware API Issues

**Issue**: Authentication failed

```bash
# Solution: Check .env file
# Ensure RUNWARE_API_KEY is set correctly
```

**Issue**: Connection timeout

```bash
# Solution: Check internet connection
# Verify API key is valid
```

---

## 📚 Additional Resources

### Learning Resources

- **Python**: https://docs.python.org/
- **FastAPI**: https://fastapi.tiangolo.com/tutorial/
- **Electron**: https://electronjs.org/docs/latest/
- **React**: https://react.dev/learn
- **TypeScript**: https://www.typescriptlang.org/docs/

### Development Tools

- **Ruff**: https://docs.astral.sh/ruff/
- **Prettier**: https://prettier.io/docs/en/
- **ESLint**: https://eslint.org/docs/latest/
- **Jest**: https://jestjs.io/docs/getting-started

---

## ✅ Setup Checklist

- [ ] Python 3.10+ installed
- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] Repository cloned
- [ ] Virtual environment created
- [ ] Python dependencies installed
- [ ] Node.js dependencies installed
- [ ] Pre-commit hooks installed
- [ ] .env file configured with API key
- [ ] SDK test passed
- [ ] Backend starts successfully
- [ ] Frontend starts successfully
- [ ] All tests pass

---

## 🆘 Getting Help

If you encounter issues during setup:

1. Check this guide's [Troubleshooting](#-troubleshooting) section
2. Review [PROJECT_STATUS.md](PROJECT_STATUS.md) for known issues
3. Search existing GitHub issues
4. Create new issue with details
5. Contact team on Slack/Discord

---

**Last Updated**: 2026-01-02  
**Document Version**: 1.0
