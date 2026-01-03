# 🏗️ Architecture Documentation

**Project**: Runware Generator  
**Version**: 1.0  
**Last Updated**: 2026-01-02

---

## 📋 Overview

The Runware Generator is a hybrid desktop application combining Electron (Node.js) for the frontend and Python (FastAPI) for the backend. This architecture provides the best of both worlds: native desktop capabilities with Python's rich AI/ML ecosystem.

### Design Principles

1. **Separation of Concerns**: Clear boundaries between frontend, backend, and AI services
2. **Type Safety**: TypeScript for frontend, Python type hints for backend
3. **Async-First**: All I/O operations are asynchronous for performance
4. **Security**: IPC isolation, API key protection, input validation
5. **Extensibility**: Modular design for easy feature additions

---

## 🎯 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Desktop Application                     │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                    Electron Application Layer                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │         Main Process (Node.js)                         │    │
│  │  - Window Lifecycle                                    │    │
│  │  - Python Process Management                           │    │
│  │  - IPC Handlers                                       │    │
│  │  - File System Access                                  │    │
│  │  - OS Integration                                     │    │
│  └────────────────────────────────────────────────────────┘    │
│                          ↑↓ IPC                               │
│  ┌────────────────────────────────────────────────────────┐    │
│  │       Preload Script (Security Bridge)                │    │
│  │  - Context Isolation                                  │    │
│  │  - API Exposure                                      │    │
│  │  - Type Definitions                                  │    │
│  └────────────────────────────────────────────────────────┘    │
│                          ↑↓ window.electronAPI                │
│  ┌────────────────────────────────────────────────────────┐    │
│  │       Renderer Process (React + TypeScript)            │    │
│  │  - UI Components (React 19)                          │    │
│  │  - State Management (Zustand)                         │    │
│  │  - Routing (React Router 7)                          │    │
│  │  - Styling (Tailwind CSS 4)                          │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────────┐
│                    Python Backend Layer                       │
│  ┌────────────────────────────────────────────────────────┐    │
│  │       API Layer (FastAPI)                             │    │
│  │  - REST Endpoints                                    │    │
│  │  - WebSocket Endpoints                               │    │
│  │  - Request Validation (Pydantic)                     │    │
│  │  - Authentication                                    │    │
│  │  - Error Handling                                    │    │
│  └────────────────────────────────────────────────────────┘    │
│                          ↓                                    │
│  ┌────────────────────────────────────────────────────────┐    │
│  │       Service Layer                                    │    │
│  │  - Runware Service (SDK Wrapper)                     │    │
│  │  - Storage Service (File Management)                 │    │
│  │  - Image Processing Service                          │    │
│  │  - Business Logic                                    │    │
│  └────────────────────────────────────────────────────────┘    │
│                          ↓                                    │
│  ┌────────────────────────────────────────────────────────┐    │
│  │       Data Layer                                       │    │
│  │  - SQLite Database (SQLAlchemy)                      │    │
│  │  - ORM Models                                        │    │
│  │  - Local File Storage                                │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              ↕ WebSocket
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                           │
│  - Runware AI API (Image/Video Generation)                   │
│  - Optional: Cloud Storage (future)                         │
│  - Optional: Analytics (future)                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔷 Electron Architecture

### Main Process (Node.js)

**File**: `electron/main/main.ts`

**Responsibilities:**

1. Application lifecycle
2. Window creation and management
3. Python backend process management
4. IPC (Inter-Process Communication)
5. OS integration (file system, native dialogs)

**Key Classes/Modules:**

- `main.ts` - Application entry point
- `pythonBridge.ts` - Python process manager
- `ipcHandlers.ts` - IPC request handlers
- `windowManager.ts` - Window management

### Renderer Process (React)

**File**: `electron/renderer/`

**Responsibilities:**

1. UI rendering
2. User interaction handling
3. State management
4. API calls via IPC

**Key Components:**

- `App.tsx` - Root component
- `pages/` - Route components
- `components/` - Reusable UI components
- `store/` - Zustand state stores
- `hooks/` - Custom React hooks

### Communication: Main ↔ Renderer

**Pattern**: IPC (Inter-Process Communication)

**Flow:**

```
Renderer Process                Main Process
     ↓                              ↓
window.electronAPI.generate   IPC Handler
      ↓                              ↓
  ipcRenderer.invoke          IPC Main Handler
      ↓                              ↓
  ────────────────────────→  HTTP Request
      ↓                              ↓
   Promise.resolve        HTTP Response
      ↓                              ↓
  ────────────────────────→  Return Result
      ↓
   User sees result
```

**Security:**

- Context isolation enabled
- Node integration disabled
- Preload script bridges only specific APIs
- No direct access to Node.js APIs

### Communication: Main ↔ Python

**Pattern**: HTTP + WebSocket

**HTTP (REST API)** - Used for:

- CRUD operations
- State queries
- Configuration changes
- File operations

**WebSocket** - Used for:

- Real-time generation progress
- Long-running operations
- Server-sent events

---

## 🟢 Python Backend Architecture

### FastAPI Application

**File**: `backend/main.py`

**Structure:**

```python
┌─────────────────────────────────────┐
│         FastAPI Application          │
│  - CORS Middleware                  │
│  - Exception Handlers               │
│  - Middleware                      │
│  - Route Registration              │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│            API Routes               │
│  - /api/generate/*                 │
│  - /api/history/*                  │
│  - /api/settings/*                 │
│  - /health                         │
└─────────────────────────────────────┘
```

### Layered Architecture

#### 1. API Layer (`backend/api/endpoints/`)

**Purpose**: HTTP request/response handling

**Components:**

- `generate.py` - Generation endpoints
- `history.py` - History endpoints
- `settings.py` - Settings endpoints

**Responsibilities:**

- Request validation (Pydantic)
- Response formatting
- Error handling
- Calling service layer

#### 2. Service Layer (`backend/services/`)

**Purpose**: Business logic

**Components:**

- `runware_service.py` - Runware SDK wrapper
- `storage_service.py` - File storage
- `image_service.py` - Image processing

**Responsibilities:**

- SDK interactions
- Business rules
- Data transformation
- Error handling

#### 3. Data Layer (`backend/core/`, `backend/models/`)

**Purpose**: Data persistence

**Components:**

- `database.py` - SQLAlchemy setup
- `config.py` - Configuration
- `generation.py` - Database models

**Responsibilities:**

- Database operations
- Configuration management
- Session handling

---

## 🔐 Security Architecture

### IPC Security

**Threats:**

- Renderer process accessing Node.js APIs
- Malicious code injection
- Privilege escalation

**Mitigations:**

1. **Context Isolation**: Renderer runs in isolated world
2. **Preload Script**: Only exposes safe APIs
3. **No Node Integration**: Node.js APIs not accessible from renderer
4. **Type Safety**: TypeScript prevents accidental misuse

### API Security

**Threats:**

- API key exposure
- Unauthorized access
- Request forgery

**Mitigations:**

1. **Environment Variables**: API keys stored in .env (not committed)
2. **Input Validation**: All inputs validated with Pydantic
3. **CORS**: Configured only for localhost (Electron)
4. **Rate Limiting**: Prevent API abuse (future)

### File System Security

**Threats:**

- Unauthorized file access
- Path traversal attacks

**Mitigations:**

1. **Sandbox**: Electron sandbox enabled
2. **Path Validation**: All paths validated
3. **Restricted Access**: File dialogs only in response to user action
4. **Storage Directory**: Configured, isolated location

---

## 📊 Data Flow

### Generation Request Flow

```
1. User Input (Renderer)
   ↓
2. Validate in React component
   ↓
3. Send to Main via IPC
   ↓
4. PythonBridge makes HTTP request
   ↓
5. FastAPI validates request
   ↓
6. RunwareService calls SDK
   ↓
7. Runware API processes
   ↓
8. Image URL returned
   ↓
9. StorageService downloads
   ↓
10. Saved to local files
   ↓
11. Metadata saved to DB
   ↓
12. Response sent to Main
   ↓
13. IPC response to Renderer
   ↓
14. Display result to user
```

### Real-time Progress Flow

```
1. Generation starts
   ↓
2. WebSocket connection opened
   ↓
3. RunwareService sends progress updates
   ↓
4. WebSocket broadcasts to Main
   ↓
5. Main forwards to Renderer via IPC
   ↓
6. Renderer updates UI progress bar
   ↓
7. Generation completes
   ↓
8. WebSocket closes
```

---

## 🗄️ Database Schema

### Generation Table

```python
class Generation(Base):
    __tablename__ = "generations"

    id = Column(Integer, primary_key=True)
    type = Column(String)  # "image" or "video"
    prompt = Column(String)
    negative_prompt = Column(String, nullable=True)
    parameters = Column(JSON)  # {width, height, steps, etc.}
    file_path = Column(String)  # Local file path
    url = Column(String)  # Runware URL
    seed = Column(Integer, nullable=True)
    model = Column(String)  # "runware:100@1"
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
```

### Settings Table (Future)

```python
class Settings(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True)
    key = Column(String, unique=True)
    value = Column(String)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
```

---

## 🔌 API Contract

### Frontend → Backend (via IPC)

#### Generate Image

```typescript
interface GenerateImageRequest {
  prompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
  steps: number;
  cfgScale: number;
  seed?: number;
}

interface GenerateImageResponse {
  success: boolean;
  data: {
    id: number;
    filePath: string;
    url: string;
    seed: number;
    created_at: string;
  } | null;
  error?: string;
}
```

#### Get History

```typescript
interface GetHistoryResponse {
  success: boolean;
  data: GenerationItem[];
}
```

### Backend → Runware

#### Image Generation

```python
request = IImageInference(
    model="runware:100@1",
    positivePrompt=prompt,
    negativePrompt=negative_prompt,
    width=width,
    height=height,
    steps=steps,
    CFGScale=cfg_scale,
    seed=seed,
    numberResults=1
)

images = await client.imageInference(requestImage=request)
```

---

## 🎨 Component Architecture

### React Components

**Page Components** (Routes)

- `GeneratorPage` - Main generation interface
- `HistoryPage` - View past generations
- `SettingsPage` - App configuration

**UI Components** (Reusable)

- `PromptInput` - Text prompt input
- `ParameterPanel` - Generation parameters
- `ImageGallery` - Display generated images
- `ProgressBar` - Generation progress
- `Sidebar` - Navigation
- `Header` - Top navigation bar

**State Stores** (Zustand)

- `generationStore` - Current generation state
- `historyStore` - History data
- `settingsStore` - App settings

### Component Communication

```
Component → Store → Action → IPC → Backend
    ↓                                          ↓
  Render                                    Data
    ↑                                          ↓
  State ← Response ← IPC ← Backend
```

---

## ⚡ Performance Optimization

### Frontend Optimization

1. **Code Splitting**: Lazy load routes with React.lazy()
2. **Image Optimization**:
   - Lazy loading with Intersection Observer
   - Thumbnails for gallery
   - WebP format support
3. **State Management**: Zustand's lightweight state
4. **Virtual Scrolling**: For large histories (future)

### Backend Optimization

1. **Async/Await**: Non-blocking I/O
2. **Connection Pooling**: Reuse database connections
3. **Caching**: Cache Runware responses (future)
4. **Background Tasks**: Offload heavy operations (future)

### Build Optimization

1. **Electron**:
   - Minimize bundle size
   - Useasar packaging
   - Exclude dev dependencies

2. **Python**:
   - PyInstaller with --onefile
   - Exclude unused packages
   - Compress resources

---

## 🧪 Testing Architecture

### Unit Tests

**Frontend**: Jest + React Testing Library

- Component rendering
- User interactions
- Store actions

**Backend**: pytest

- Service methods
- API endpoints (mocked)
- Database operations

### Integration Tests

**E2E**: Playwright

- Full user flows
- Cross-component interactions
- API integration

### Test Organization

```
tests/
├── unit/
│   ├── frontend/     # React component tests
│   └── backend/      # Python service tests
├── integration/
│   ├── api/          # API endpoint tests
│   └── ipc/          # IPC communication tests
└── e2e/
    └── user-flows/   # Complete user scenarios
```

---

## 🔄 Deployment Architecture

### Development Build

```
Electron App
├── Main process (TypeScript compiled)
├── Renderer (Vite dev server)
└── Python (virtualenv)
```

### Production Build

```
RunwareGenerator.exe
├── Electron runtime
│   ├── main process (compiled JS)
│   ├── renderer (bundled)
│   └── assets
├── Python runtime
│   ├── python.exe (embedded)
│   ├── backend (embedded)
│   └── dependencies
└── Configuration
```

### Distribution Channels

1. **Windows**: NSIS installer, Portable EXE
2. **macOS**: DMG (future)
3. **Linux**: AppImage, deb (future)

---

## 📚 References

**Technology Documentation**

- Electron: https://electronjs.org/docs
- FastAPI: https://fastapi.tiangolo.com/
- React: https://react.dev/
- SQLAlchemy: https://docs.sqlalchemy.org/
- Runware SDK: https://github.com/Runware/sdk-python

**Internal Documentation**

- [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) - Project summary
- [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) - Implementation phases
- [ROADMAP.md](ROADMAP.md) - Technical roadmap

---

**Last Updated**: 2026-01-02  
**Next Review**: After Phase 4 completion  
**Maintained By**: Tech Lead
