# ✅ Runware Generator - Implementation Checklist

## 🎯 Подготовка (1-2 дня)

- [ ] Получить Runware API key
- [ ] Создать `.env` файл с API key
- [ ] Клонировать Runware SDK: `git clone https://github.com/Runware/sdk-python`
- [ ] Изучить README и examples SDK
- [ ] Создать и запустить `test_runware.py` (proof of concept)
- [ ] Документировать доступные методы SDK
- [ ] Определить MVP scope (что делать в первую очередь)

## 📁 Фаза 1: Реструктуризация (1 день)

### Backend структура
- [ ] `mkdir -p backend/api/endpoints`
- [ ] `mkdir -p backend/services`
- [ ] `mkdir -p backend/core`
- [ ] `mkdir -p backend/models`
- [ ] `mkdir -p backend/utils`

### Electron структура
- [ ] `mkdir -p electron/main`
- [ ] `mkdir -p electron/preload`
- [ ] `mkdir -p electron/resources`
- [ ] `mkdir -p shared/types`

### Frontend реструктуризация
- [ ] Переместить `src/` в `electron/renderer/`
- [ ] `mkdir -p electron/renderer/components`
- [ ] `mkdir -p electron/renderer/pages`
- [ ] `mkdir -p electron/renderer/store`
- [ ] `mkdir -p electron/renderer/hooks`

### Dependencies
- [ ] Обновить `requirements.txt` (FastAPI, Runware, SQLAlchemy, etc.)
- [ ] Обновить `package.json` (Electron, Vite, Zustand, etc.)
- [ ] `pip install -r requirements.txt`
- [ ] `npm install`

## 🐍 Фаза 2: Python Backend (2-3 дня)

### Core Setup
- [ ] `backend/core/config.py` - Settings класс с Pydantic
- [ ] `backend/core/database.py` - SQLAlchemy setup
- [ ] `backend/core/security.py` - API key management
- [ ] `backend/.env.example` - Template для env переменных

### Models
- [ ] `backend/models/generation.py` - SQLAlchemy модель для истории
- [ ] Создать таблицы: `Base.metadata.create_all()`

### Services
- [ ] `backend/services/runware_service.py` - Wrapper для Runware SDK
  - [ ] `generate_image()` метод
  - [ ] `upscale_image()` метод
  - [ ] Error handling
  - [ ] Retry logic
- [ ] `backend/services/storage_service.py` - Сохранение файлов
- [ ] `backend/services/image_service.py` - Обработка изображений

### API Endpoints
- [ ] `backend/main.py` - FastAPI app initialization
- [ ] `backend/api/endpoints/generate.py`:
  - [ ] POST `/api/generate/text-to-image`
  - [ ] POST `/api/generate/image-to-image`
  - [ ] POST `/api/generate/upscale`
- [ ] `backend/api/endpoints/history.py`:
  - [ ] GET `/api/history`
  - [ ] DELETE `/api/history/{id}`
- [ ] `backend/api/schemas.py` - Pydantic models для requests/responses

### Testing
- [ ] Запустить FastAPI: `uvicorn backend.main:app --reload`
- [ ] Тест endpoint `/health`
- [ ] Тест endpoint `/api/generate/text-to-image` через Postman
- [ ] Unit тесты для `runware_service.py`

## ⚡ Фаза 3: Electron Setup (2-3 дня)

### Main Process
- [ ] `electron/main/main.ts` - Entry point, window creation
- [ ] `electron/main/pythonBridge.ts` - Python process management
  - [ ] `start()` - запуск Python backend
  - [ ] `stop()` - остановка Python backend
  - [ ] `checkHealth()` - проверка здоровья backend
- [ ] `electron/main/ipcHandlers.ts` - IPC handlers
  - [ ] Handler для generate:text-to-image
  - [ ] Handler для history:get
  - [ ] Handler для history:delete
- [ ] `electron/main/windowManager.ts` - Window management
- [ ] `electron/main/fileSystem.ts` - File operations

### Preload Script
- [ ] `electron/preload/preload.ts` - Context bridge setup
- [ ] Expose API:
  - [ ] `window.electronAPI.generate.*`
  - [ ] `window.electronAPI.history.*`
- [ ] `shared/types/electron.d.ts` - TypeScript types для API

### Configuration
- [ ] `vite.config.ts` - Vite для React
- [ ] `electron-builder.json` - Builder configuration
- [ ] `package.json` scripts:
  - [ ] `dev:electron` - запуск в dev mode
  - [ ] `build:electron` - сборка приложения

### Testing
- [ ] Запустить Electron: `npm run dev:electron`
- [ ] Проверить что Python backend стартует автоматически
- [ ] Проверить IPC коммуникацию через console.log
- [ ] Проверить hot reload React приложения

## ⚛️ Фаза 4: React UI (3-4 дня)

### Store Setup (Zustand)
- [ ] `electron/renderer/store/generationStore.ts` - Generation state
- [ ] `electron/renderer/store/historyStore.ts` - History state
- [ ] `electron/renderer/store/settingsStore.ts` - Settings state

### Components
- [ ] `electron/renderer/components/PromptInput.tsx`
  - [ ] Textarea для промпта
  - [ ] Input для negative prompt
  - [ ] Submit button
- [ ] `electron/renderer/components/ParameterPanel.tsx`
  - [ ] Size selector
  - [ ] Steps slider
  - [ ] Guidance scale slider
  - [ ] Seed input
- [ ] `electron/renderer/components/ImageGallery.tsx`
  - [ ] Grid layout
  - [ ] Image cards с preview
  - [ ] Click to enlarge
- [ ] `electron/renderer/components/ProgressBar.tsx`
  - [ ] Progress indicator
  - [ ] Status text
- [ ] `electron/renderer/components/HistorySidebar.tsx`
  - [ ] List of past generations
  - [ ] Search/filter

### Pages
- [ ] `electron/renderer/pages/GeneratorPage.tsx` - Main generation page
- [ ] `electron/renderer/pages/HistoryPage.tsx` - Full history view
- [ ] `electron/renderer/pages/SettingsPage.tsx` - App settings

### Hooks
- [ ] `electron/renderer/hooks/useGeneration.ts` - Generation logic
- [ ] `electron/renderer/hooks/useWebSocket.ts` - WebSocket для прогресса

### Utils
- [ ] `electron/renderer/utils/api.ts` - API client wrapper
- [ ] `electron/renderer/utils/types.ts` - TypeScript types

### Styling
- [ ] Install TailwindCSS: `npm install -D tailwindcss`
- [ ] Configure Tailwind
- [ ] Create base styles
- [ ] Dark/light theme support

### Testing
- [ ] Проверить отрисовку всех компонентов
- [ ] Проверить генерацию изображения end-to-end
- [ ] Проверить сохранение в историю
- [ ] Unit тесты для компонентов

## 🎨 Фаза 5: Core Features (4-5 дней)

### Text-to-Image
- [ ] Полная интеграция с UI
- [ ] Все параметры работают (size, steps, guidance, seed)
- [ ] Negative prompt
- [ ] Multiple images generation

### Image-to-Image
- [ ] Drag & drop для загрузки
- [ ] Preview uploaded image
- [ ] Strength parameter
- [ ] Save results

### Upscaling
- [ ] Upload image
- [ ] Scale factor selector
- [ ] Process and display result

### History Management
- [ ] Save all generations to DB
- [ ] Display history with thumbnails
- [ ] Search and filter
- [ ] Delete from history
- [ ] Export history

### Settings
- [ ] API key configuration
- [ ] Output directory selection
- [ ] Default parameters
- [ ] Theme selection

## 🔄 Фаза 6: WebSocket & Real-time (2-3 дня)

- [ ] Backend: WebSocket endpoint `/ws/generation`
- [ ] Backend: Progress updates через WebSocket
- [ ] Frontend: WebSocket connection hook
- [ ] Frontend: Progress bar updates
- [ ] Frontend: Real-time status updates
- [ ] Queue management для multiple generations

## 🧪 Фаза 7: Testing (2-3 дня)

### Backend Tests
- [ ] Unit тесты для services
- [ ] API endpoint тесты
- [ ] Integration тесты
- [ ] Coverage report

### Frontend Tests
- [ ] Component тесты (Jest + Testing Library)
- [ ] Store тесты
- [ ] Hook тесты
- [ ] IPC communication mocks

### E2E Tests
- [ ] Install Playwright
- [ ] Test main user flow
- [ ] Test error scenarios

### Performance
- [ ] Lazy loading images
- [ ] Virtual scrolling для истории
- [ ] Optimize bundle size
- [ ] Memory leak checks

## 📦 Фаза 8: Build & Package (2-3 дня)

### Python Packaging
- [ ] Install PyInstaller: `pip install pyinstaller`
- [ ] Create `backend.spec` file
- [ ] Build standalone executable
- [ ] Test standalone Python app
- [ ] Include all dependencies and resources

### Electron Builder
- [ ] Configure `electron-builder.json`:
  - [ ] Windows config (nsis, portable)
  - [ ] macOS config (dmg)
  - [ ] Linux config (AppImage, deb)
- [ ] Add app icons
- [ ] Configure auto-update (optional)
- [ ] Code signing (optional)

### Build Scripts
- [ ] `scripts/build-python.sh` - Build Python backend
- [ ] `scripts/build-electron.sh` - Build Electron app
- [ ] `scripts/build-all.sh` - Full build process
- [ ] `package.json`: npm script для `build`

### Testing Distribution
- [ ] Test Windows installer
- [ ] Test macOS dmg
- [ ] Test Linux AppImage
- [ ] Verify Python process starts correctly
- [ ] Verify all features work in production build

## 📝 Фаза 9: Documentation (1-2 дня)

- [ ] Update README.md
  - [ ] Installation instructions
  - [ ] Usage guide
  - [ ] Screenshots
  - [ ] Troubleshooting
- [ ] Create USER_GUIDE.md
- [ ] API documentation
- [ ] Developer documentation
- [ ] CHANGELOG.md
- [ ] LICENSE file

## 🚀 Фаза 10: Release (1 день)

- [ ] Semantic versioning setup
- [ ] Git tags для версий
- [ ] GitHub releases
- [ ] Upload installers
- [ ] Release notes
- [ ] Announce release

---

## 📊 Progress Tracking

### MVP Features (обязательно)
- [ ] Text-to-Image generation
- [ ] Basic parameters (size, steps, guidance)
- [ ] Save images locally
- [ ] History view
- [ ] Settings page
- [ ] Windows build

### Nice-to-Have (можно отложить)
- [ ] Video generation
- [ ] Batch processing
- [ ] Advanced editing (inpainting)
- [ ] Preset system
- [ ] macOS/Linux builds
- [ ] Auto-updates
- [ ] Watermarking

### Status Indicators
- ⏳ Not started
- 🔄 In progress
- ✅ Completed
- ❌ Blocked
- ⏸️ On hold

---

**Начните с NEXT_STEPS.md для детальных инструкций!**
