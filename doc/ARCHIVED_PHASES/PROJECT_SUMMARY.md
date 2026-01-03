# 📋 Runware Generator - Project Summary

**Дата создания**: 2026-01-02  
**Статус**: Planning & Setup Complete  
**Следующая фаза**: Implementation Start

---

## 🎯 Что это за проект?

**Runware Generator** - desktop приложение для генерации AI изображений и видео.

**Технологии:**
- **Frontend**: Electron + React + TypeScript + TailwindCSS
- **Backend**: Python + FastAPI + Runware SDK
- **Архитектура**: Desktop app с встроенным Python backend

**Ключевые возможности (планируемые):**
- Генерация изображений по текстовым промптам
- Преобразование изображений (img2img)
- Генерация видео
- Upscaling изображений
- История генераций
- Batch обработка

---

## 📚 Документация проекта

### Основные документы

| Файл | Назначение | Когда использовать |
|------|-----------|-------------------|
| **NEXT_STEPS.md** | Immediate action items | Начать отсюда! |
| **ROADMAP.md** | Детальный технический план | Для понимания архитектуры |
| **CHECKLIST.md** | Complete implementation checklist | Трекинг прогресса |
| **DEPENDENCIES_UPDATE_PLAN.md** | План актуализации библиотек | После Фазы 1 |
| **START.md** | Оригинальный roadmap | Справочная информация |

### Конфигурационные файлы

**Python:**
- `pyproject.toml` - Ruff, pytest, mypy конфигурация
- `requirements.txt` - Production зависимости
- `requirements-dev.txt` - Development зависимости
- `.pre-commit-config.yaml` - Pre-commit hooks

**TypeScript:**
- `tsconfig.json` - TypeScript конфигурация
- `package.json` - Node.js dependencies и scripts
- `.eslintrc.json` - ESLint rules
- `.prettierrc.json` - Prettier configuration
- `jest.config.js` - Jest тестирование

**Electron:** (планируется)
- `electron-builder.json` - Build configuration
- `vite.config.ts` - Vite для React

---

## 🏗️ Архитектура проекта

### Текущая структура
```
runware-generator/
├── backend/              # Python backend (FastAPI)
│   ├── __init__.py
│   ├── main.py          # Entry point
│   └── tests/
├── src/                 # TypeScript frontend (будет перемещен)
│   ├── index.ts
│   └── __tests__/
├── .serena/             # Serena agent memories
│   └── memories/
│       ├── project_overview.md
│       ├── implementation_plan.md
│       ├── code_style_conventions.md
│       ├── suggested_commands.md
│       ├── quick_start_guide.md
│       └── task_completion_checklist.md
└── [конфигурационные файлы]
```

### Целевая структура (после Фазы 1)
```
runware-generator/
├── backend/              # Python FastAPI + Runware SDK
│   ├── api/             # REST endpoints
│   │   └── endpoints/
│   ├── services/        # Business logic
│   │   ├── runware_service.py
│   │   ├── image_service.py
│   │   └── storage_service.py
│   ├── core/            # Config, DB, security
│   ├── models/          # SQLAlchemy models
│   └── tests/
├── electron/            # Electron app
│   ├── main/           # Main process (Node.js)
│   │   ├── main.ts
│   │   ├── pythonBridge.ts
│   │   └── ipcHandlers.ts
│   ├── preload/        # IPC bridge
│   │   └── preload.ts
│   ├── renderer/       # React UI
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/      # Zustand
│   │   └── hooks/
│   └── resources/      # Icons, assets
├── shared/             # Shared TypeScript types
│   └── types/
└── scripts/            # Build scripts
```

---

## 🛠️ Development Tools Setup

### Python Tools
✅ **Ruff** - Линтинг и форматирование
- Конфигурация: `pyproject.toml`
- Команда: `ruff check backend/` и `ruff format backend/`

✅ **Pytest** - Тестирование
- Конфигурация: `pyproject.toml`
- Команда: `pytest` или `pytest --cov=backend`

✅ **Mypy** - Type checking
- Конфигурация: `pyproject.toml`
- Команда: `mypy backend/`

### TypeScript Tools
✅ **ESLint** - Линтинг
- Конфигурация: `.eslintrc.json`
- Команда: `npm run lint`

✅ **Prettier** - Форматирование
- Конфигурация: `.prettierrc.json`
- Команда: `npm run format`

✅ **Jest** - Тестирование
- Конфигурация: `jest.config.js`
- Команда: `npm test`

### Git Hooks
✅ **Pre-commit** - Автоматические проверки
- Конфигурация: `.pre-commit-config.yaml`
- Включает: Ruff, Mypy, ESLint, Prettier, trailing whitespace, etc.

---

## 📋 Implementation Phases

### ✅ Фаза 0: Подготовка (ЗАВЕРШЕНА)
- [x] Инициализация проекта
- [x] Настройка dev tools
- [x] Создание roadmap
- [x] Планирование архитектуры

### ⏳ Фаза 1: Реструктуризация (1 день)
**Статус**: Готово к началу
**Документ**: ROADMAP.md, Фаза 1

Задачи:
- [ ] Создать директории для Electron
- [ ] Переместить `src/` в `electron/renderer/`
- [ ] Создать структуру backend (api, services, core, models)
- [ ] Обновить dependencies (requirements.txt, package.json)

### ⏳ Фаза 2: Python Backend (2-3 дня)
**Статус**: Запланировано
**Документ**: ROADMAP.md, Фаза 2

Задачи:
- [ ] Настроить FastAPI app
- [ ] Интегрировать Runware SDK
- [ ] Создать API endpoints
- [ ] Настроить SQLite database

### ⏳ Фаза 3: Electron Setup (2-3 дня)
**Статус**: Запланировано
**Документ**: ROADMAP.md, Фаза 3

Задачи:
- [ ] Настроить main process
- [ ] Python process management
- [ ] IPC communication
- [ ] Preload script

### ⏳ Фазы 4-10
См. ROADMAP.md для детального плана

---

## 🔑 Ключевые решения

### Архитектурные решения

**1. Связь Electron ↔ Python**
- ✅ Выбрано: REST API + WebSocket
- Альтернативы: Child Process, Named Pipes
- Причина: Легче тестировать, можно разрабатывать отдельно

**2. State Management**
- ✅ Выбрано: Zustand
- Альтернативы: Redux Toolkit, Context API
- Причина: Простота, меньше boilerplate

**3. Styling**
- ✅ Выбрано: TailwindCSS
- Альтернативы: Material-UI, styled-components
- Причина: Быстрая разработка, гибкость

**4. Database**
- ✅ Выбрано: SQLite
- Альтернативы: PostgreSQL, JSON files
- Причина: Встроенная, без внешних зависимостей

### Code Style Standards

**Python:**
- Type hints обязательны
- Google/NumPy style docstrings
- Max line length: 100
- PEP 8 compliance

**TypeScript:**
- Strict mode enabled
- Explicit return types
- Single quotes
- Max line length: 100

---

## 📦 Dependencies Overview

### Python Core
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `runware-sdk-python` - AI generation
- `pydantic` - Data validation
- `sqlalchemy` - ORM
- `pillow` - Image processing

### TypeScript Core
- `electron` - Desktop framework
- `react` - UI library
- `typescript` - Type safety
- `vite` - Build tool
- `zustand` - State management
- `axios` - HTTP client

### Development
- Python: `ruff`, `pytest`, `mypy`, `pre-commit`
- TypeScript: `eslint`, `prettier`, `jest`, `@testing-library/react`

**Актуализация**: См. DEPENDENCIES_UPDATE_PLAN.md

---

## 🎯 MVP Scope

### Обязательно для первого релиза:
1. ✅ Text-to-Image generation
2. ✅ Базовые параметры (size, steps, guidance)
3. ✅ Сохранение результатов локально
4. ✅ История генераций
5. ✅ Простой UI (промпт + галерея)
6. ✅ Настройки API key
7. ✅ Windows build

### Можно отложить:
- Video generation
- Image-to-Image
- Batch processing
- Advanced parameters
- Preset system
- macOS/Linux builds

---

## 🚀 Quick Start (для нового разработчика)

### 1. Установка
```bash
# Clone repository
git clone <repo-url>
cd runware-generator

# Python dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Node.js dependencies
npm install

# Pre-commit hooks
pre-commit install
```

### 2. Получить Runware API Key
1. Регистрация на https://runware.ai/
2. Получить API key
3. Создать `.env`:
   ```
   RUNWARE_API_KEY=your_key_here
   STORAGE_PATH=./generated
   ```

### 3. Тестовый запуск
```bash
# Backend
python backend/main.py

# Frontend (когда будет готов)
npm run dev
```

### 4. Следующие шаги
Читать **NEXT_STEPS.md** 👈

---

## 📞 Resources & Links

**Documentation:**
- Runware SDK: https://github.com/Runware/sdk-python
- Runware API Docs: https://docs.runware.ai/
- Electron: https://electronjs.org/
- FastAPI: https://fastapi.tiangolo.com/
- React: https://react.dev/

**Tools:**
- Serena Agent: Semantic code analysis
- Context7: Library documentation lookup
- Claude Code: AI-powered development

**Internal Docs:**
- `.serena/memories/` - Project knowledge base
- `ROADMAP.md` - Technical implementation plan
- `CHECKLIST.md` - Progress tracking

---

## ⚠️ Known Issues & Risks

### Risks
1. **Runware API limits** - Необходимо кэширование
2. **Electron bundle size** - Оптимизация сборки
3. **Python packaging** - PyInstaller сложности
4. **Cross-platform** - Разные ОС проблемы

### Mitigation
- Кэширование результатов генерации
- Lazy loading dependencies
- Раннее тестирование PyInstaller
- Начать с одной платформы (Windows)

---

## 📊 Current Status

**Last Updated**: 2026-01-02

**Phase**: Planning Complete ✅  
**Next Phase**: Implementation Start (Фаза 1)

**Ready to start**:
1. ✅ Project structure designed
2. ✅ Dev tools configured
3. ✅ Architecture decisions made
4. ✅ Implementation plan created
5. ✅ Dependencies plan created

**Waiting for**:
- Runware API key
- Proof of concept with SDK
- Team decision on starting Фаза 1

---

## 🎓 Learning Resources

**For new team members:**
1. Read NEXT_STEPS.md (start here!)
2. Review ROADMAP.md (architecture)
3. Study `.serena/memories/` (project knowledge)
4. Check DEPENDENCIES_UPDATE_PLAN.md (libraries)

**For external contributors:**
1. README.md (project overview)
2. Code style in `.serena/memories/code_style_conventions.md`
3. CHECKLIST.md (what needs to be done)

---

**🚀 Готово к разработке! Начинайте с NEXT_STEPS.md**
