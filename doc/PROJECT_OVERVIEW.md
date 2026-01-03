# 📊 Project Overview

**Project Name**: Runware Generator  
**Type**: Desktop Application (Electron + Python)  
**Status**: Phase 2 Ready - Backend Implementation  
**Last Updated**: 2026-01-02

---

## 🎯 Project Vision

Create a user-friendly desktop application for AI-powered image and video generation using the Runware SDK. The application will provide a modern interface for generating, managing, and enhancing AI-generated content.

### Key Features (Planned)

- ✅ Text-to-Image generation
- 🔄 Image-to-Image transformation
- 🔄 Image upscaling
- 🔄 Video generation (planned)
- ✅ History management
- ✅ Local storage
- ✅ Batch processing
- 🔄 Advanced parameters

---

## 🏗️ Technical Architecture

### Technology Stack

**Frontend (Electron Application)**

- **Framework**: Electron 35.7.5
- **UI Library**: React 19
- **Language**: TypeScript 5.7
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand 5
- **Router**: React Router 7

**Backend (Python FastAPI)**

- **Framework**: FastAPI 0.128
- **Server**: Uvicorn 0.40
- **Language**: Python 3.14
- **AI SDK**: Runware 0.4.37
- **Database**: SQLite 3 (SQLAlchemy 2.0)
- **Validation**: Pydantic 2.10

**Development Tools**

- **Python**: Ruff 0.8, Pytest 8.3, Mypy 1.13
- **TypeScript**: ESLint 9, Prettier 3.4, Jest 29.7
- **Version Control**: Git with pre-commit hooks

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Electron App                          │
│  ┌────────────────────────────────────────────────┐   │
│  │         Main Process (Node.js)                 │   │
│  │  - Window Management                          │   │
│  │  - Python Process Bridge                      │   │
│  │  - IPC Handlers                               │   │
│  └────────────────────────────────────────────────┘   │
│                      ↑↓ IPC                           │
│  ┌────────────────────────────────────────────────┐   │
│  │       Renderer Process (React)                │   │
│  │  - UI Components                              │   │
│  │  - State Management (Zustand)                 │   │
│  │  - API Calls via IPC                         │   │
│  └────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                      ↕ HTTP/WebSocket
┌─────────────────────────────────────────────────────────┐
│              Python FastAPI Backend                    │
│  ┌────────────────────────────────────────────────┐   │
│  │        API Layer (Endpoints)                  │   │
│  │  - /api/generate/*                            │   │
│  │  - /api/history/*                             │   │
│  │  - /api/settings/*                            │   │
│  └────────────────────────────────────────────────┘   │
│                      ↓                                 │
│  ┌────────────────────────────────────────────────┐   │
│  │      Service Layer                            │   │
│  │  - Runware Service (SDK Wrapper)              │   │
│  │  - Storage Service                            │   │
│  │  - Image Processing Service                   │   │
│  └────────────────────────────────────────────────┘   │
│                      ↓                                 │
│  ┌────────────────────────────────────────────────┐   │
│  │      Data Layer                               │   │
│  │  - SQLite Database (SQLAlchemy)                │   │
│  │  - Local File Storage                         │   │
│  └────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                      ↕ WebSocket
┌─────────────────────────────────────────────────────────┐
│              Runware AI API                             │
│  - Image Generation                                    │
│  - Video Generation                                    │
│  - Image Processing                                    │
└─────────────────────────────────────────────────────────┘
```

### Communication Patterns

**Electron ↔ Python**

- **REST API**: HTTP requests for CRUD operations
- **WebSocket**: Real-time generation progress
- **IPC**: Secure communication between main and renderer

**Python ↔ Runware API**

- **WebSocket**: Primary communication method
- **Async/Await**: Non-blocking operations
- **Connection Pooling**: Reusable connections

---

## 📊 Project Status

### Completed Phases ✅

**Phase 0: Planning & Research** (Completed 2026-01-02)

- ✅ Project requirements defined
- ✅ Tech stack selected
- ✅ Architecture designed
- ✅ Roadmap created

**Phase 1: Project Restructuring** (Completed 2026-01-02)

- ✅ Directory structure created
- ✅ Configuration files set up
- ✅ Dependencies defined
- ✅ Pre-commit hooks configured

**Dependencies Update** (Completed 2026-01-02)

- ✅ All dependencies updated to 2026 versions
- ✅ Python dependencies installed
- ✅ Node.js dependencies installed
- ✅ Security vulnerabilities fixed

**SDK Testing** (Completed 2026-01-02)

- ✅ Runware SDK installed (v0.4.37)
- ✅ API key configured
- ✅ Basic generation tested
- ✅ Advanced parameters verified
- ✅ Performance metrics collected

### Current Phase 🔄

**Phase 2: Backend Implementation** (Ready to Start)

- ⏳ FastAPI application setup
- ⏳ Runware service implementation
- ⏳ API endpoints creation
- ⏳ Database models setup
- ⏳ Testing

### Upcoming Phases ⏳

**Phase 3: Electron Setup** (2-3 days)

- Main process configuration
- Python bridge implementation
- IPC handlers setup
- Preload script

**Phase 4: React UI** (3-4 days)

- Components development
- State management
- API integration
- Styling

**Phase 5-10**: See [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)

---

## 📁 Project Structure

```
runware-generator/
├── backend/                    # Python FastAPI backend
│   ├── api/                   # API endpoints
│   │   └── endpoints/
│   ├── services/              # Business logic
│   ├── core/                  # Configuration
│   ├── models/                # Database models
│   ├── utils/                 # Utilities
│   └── main.py               # Entry point
├── electron/                  # Electron app
│   ├── main/                 # Main process
│   ├── preload/              # IPC bridge
│   ├── renderer/             # React UI
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   └── hooks/
│   └── resources/            # Assets
├── shared/                     # Shared types
│   └── types/
├── scripts/                    # Build scripts
├── generated/                  # Generated files
├── doc/                        # Documentation
│   ├── PROJECT_OVERVIEW.md    # This file
│   ├── PROJECT_STATUS.md      # Status tracking
│   ├── IMPLEMENTATION_PLAN.md # Implementation plan
│   ├── ROADMAP.md            # Detailed roadmap
│   ├── SETUP_GUIDE.md        # Setup instructions
│   └── ...
├── .serena/                   # Serena memories
├── requirements.txt           # Python deps
├── package.json              # Node.js deps
└── [config files]
```

---

## 🎯 MVP Scope

### Minimum Viable Product (v1.0)

**Must-Have Features**

- ✅ Text-to-Image generation
- ✅ Basic parameters (size, steps, guidance scale)
- ✅ Negative prompts
- ✅ Seed control for reproducibility
- ✅ Save images locally
- ✅ History view
- ✅ API key configuration
- ✅ Windows build (.exe installer)

**Nice-to-Have (v1.1+)**

- Image-to-Image transformation
- Image upscaling
- Batch processing
- Advanced parameters (ControlNet, LoRA)
- Preset system
- macOS/Linux builds
- Auto-updates

---

## 🛠️ Quick Start

### For New Developers

1. **Prerequisites**
   - Python 3.10+
   - Node.js 18+
   - Git

2. **Clone and Setup**

   ```bash
   git clone <repository-url>
   cd runware-generator
   pip install -r requirements.txt
   pip install -r requirements-dev.txt
   npm install
   pre-commit install
   ```

3. **Configure**
   - Copy `.env.example` to `.env`
   - Add Runware API key to `.env`

4. **Run Development**

   ```bash
   # Backend
   python backend/main.py

   # Frontend (in another terminal)
   npm run dev:renderer
   ```

**For detailed setup, see [SETUP_GUIDE.md](SETUP_GUIDE.md)**

---

## 📚 Documentation Links

### Planning & Architecture

- [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) - Detailed implementation phases
- [ROADMAP.md](ROADMAP.md) - Step-by-step technical roadmap
- [ARCHITECTURE.md](ARCHITECTURE.md) - Architecture decisions

### Development

- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Environment setup
- [CODE_STANDARDS.md](CODE_STANDARDS.md) - Coding conventions
- [DEVELOPMENT_WORKFLOW.md](DEVELOPMENT_WORKFLOW.md) - Development process
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Testing procedures

### API Reference

- [RUNWARE_SDK.md](RUNWARE_SDK.md) - SDK documentation
- [BACKEND_API.md](BACKEND_API.md) - FastAPI endpoints
- [IPC_API.md](IPC_API.md) - Electron IPC handlers

### Build & Deploy

- [BUILD_GUIDE.md](BUILD_GUIDE.md) - Build instructions
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Release process

### User Docs

- [USER_GUIDE.md](USER_GUIDE.md) - User manual
- [FEATURES.md](FEATURES.md) - Feature overview

---

## 🚀 Next Steps

### Immediate Actions (Today)

1. **Start Phase 2: Backend Implementation**
   - Read [ROADMAP.md](ROADMAP.md) Phase 2 section
   - Create `backend/core/config.py`
   - Create `backend/core/database.py`
   - Setup FastAPI app in `backend/main.py`

2. **Implement Runware Service**
   - Create `backend/services/runware_service.py`
   - Implement SDK wrapper
   - Add error handling

3. **Create API Endpoints**
   - `/api/generate/text-to-image`
   - `/api/history`
   - `/health`

### This Week

- Complete Phase 2 (Backend)
- Start Phase 3 (Electron Setup)
- Write unit tests for backend

### This Month

- Complete MVP features
- Beta testing
- Bug fixes
- v1.0 release preparation

---

## 👥 Team & Contact

**Project Lead**: [Name]  
**Tech Lead**: [Name]  
**Backend Dev**: [Name]  
**Frontend Dev**: [Name]

**Communication Channels**

- Slack/Discord: #runware-generator
- GitHub Issues: [repository]/issues
- Documentation: [repository]/wiki

---

## 📞 Resources

**External Documentation**

- [Runware SDK GitHub](https://github.com/Runware/sdk-python)
- [Runware API Docs](https://docs.runware.ai/)
- [Electron Docs](https://electronjs.org/docs)
- [FastAPI Docs](https://fastapi.tiangolo.com/)

**Internal Resources**

- Serena Memories: [.serena/memories/](../.serena/memories/)
- Project Archive: [ARCHIVED_PHASES/](ARCHIVED_PHASES/)

---

**Last Updated**: 2026-01-02  
**Document Version**: 1.0  
**Next Review**: Weekly
