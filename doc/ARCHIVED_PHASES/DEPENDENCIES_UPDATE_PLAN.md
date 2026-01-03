# План актуализации зависимостей

## Цель
Обновить все библиотеки проекта до актуальных версий (2026) с использованием Context7 для проверки совместимости и лучших практик.

## Библиотеки для обновления

### Python Backend

#### Core Framework
- [ ] **FastAPI** - веб-фреймворк
  - Текущая: `>=0.109.0`
  - Проверить через Context7: последнюю stable версию
  - Изучить breaking changes
  
- [ ] **Uvicorn** - ASGI сервер
  - Текущая: `>=0.27.0`
  - Проверить совместимость с FastAPI
  
- [ ] **Pydantic** - валидация данных
  - Текущая: `>=2.5.0`
  - Важно: Pydantic v2 имеет breaking changes от v1

#### AI/ML
- [ ] **Runware SDK Python**
  - Проверить: последняя версия на PyPI
  - Изучить: changelog и новые фичи
  - Тестировать: совместимость API

#### Database & Storage
- [ ] **SQLAlchemy** - ORM
  - Текущая: `>=2.0.0`
  - Проверить: миграционные инструменты
  
- [ ] **Pillow** - обработка изображений
  - Текущая: `>=10.2.0`
  - Проверить: безопасность и CVE

#### Development Tools
- [ ] **Ruff** - линтер/форматтер
  - Текущая: `>=0.1.0`
  - Проверить: новые правила линтинга
  
- [ ] **Pytest** - тестирование
  - Текущая: `>=8.0.0`
  - Проверить: совместимость плагинов
  
- [ ] **Mypy** - type checking
  - Текущая: `>=1.8.0`
  - Проверить: новые возможности типизации

### TypeScript/Node.js Frontend

#### Core Framework
- [ ] **Electron**
  - Текущая: `^28.0.0`
  - Проверить через Context7: последнюю LTS версию
  - Важно: проверить breaking changes в API
  
- [ ] **React**
  - Текущая: не указана (добавить актуальную)
  - Проверить: React 18+ features (concurrent rendering)
  
- [ ] **Vite**
  - Текущая: `^5.0.0`
  - Проверить: оптимизации для Electron

#### State Management
- [ ] **Zustand**
  - Проверить: последнюю версию
  - Изучить: новые паттерны использования

#### Build Tools
- [ ] **Electron Builder**
  - Текущая: `^24.9.0`
  - Проверить: совместимость с Electron 28+
  
- [ ] **TypeScript**
  - Текущая: `^5.0.0`
  - Проверить: новые фичи (decorators, etc.)

#### UI/Styling
- [ ] **TailwindCSS**
  - Не установлен (запланировать версию)
  - Проверить: v3.x или v4.x

#### Linting & Formatting
- [ ] **ESLint**
  - Текущая: `^8.50.0`
  - Проверить: ESLint 9.x (flat config)
  
- [ ] **Prettier**
  - Текущая: `^3.0.0`
  - Проверить: новые опции форматирования
  
- [ ] **@typescript-eslint**
  - Текущая: `^6.0.0`
  - Проверить: совместимость с TypeScript 5

#### Testing
- [ ] **Jest**
  - Текущая: `^29.7.0`
  - Проверить: нативный ESM support
  
- [ ] **Testing Library**
  - Проверить: последние версии для React

## Процесс актуализации

### Этап 1: Исследование (Context7)

Для каждой библиотеки выполнить:

```bash
# Пример для FastAPI
# Использовать Context7 MCP в Claude Code
```

**Вопросы для Context7:**
1. Какая последняя stable версия библиотеки?
2. Какие breaking changes в последних версиях?
3. Какие новые фичи стоит использовать?
4. Какие deprecated API нужно заменить?
5. Есть ли известные проблемы совместимости?

### Этап 2: Создание плана миграции

Для библиотек с breaking changes:
- [ ] Документировать изменения в коде
- [ ] Создать migration guide
- [ ] Запланировать тестирование

### Этап 3: Обновление по группам

#### Группа 1: Development Tools (низкий риск)
- Ruff, Prettier, ESLint
- Можно обновлять первыми
- Низкий риск breaking changes

#### Группа 2: Testing (средний риск)
- Pytest, Jest, Testing Library
- Обновлять после dev tools
- Могут потребоваться изменения в тестах

#### Группа 3: Core Frameworks (высокий риск)
- FastAPI, Electron, React
- Обновлять с осторожностью
- Тщательное тестирование

#### Группа 4: Specialized Libraries (высокий риск)
- Runware SDK, SQLAlchemy, Pydantic
- Критичны для функциональности
- Полное регрессионное тестирование

### Этап 4: Тестирование после обновления

Для каждой группы:
- [ ] Unit тесты
- [ ] Integration тесты
- [ ] E2E тесты
- [ ] Manual testing критичных фич

### Этап 5: Документация

- [ ] Обновить requirements.txt
- [ ] Обновить package.json
- [ ] Обновить README с новыми версиями
- [ ] Создать CHANGELOG запись

## Приоритеты

### Высокий приоритет (обновить немедленно)
1. **Security patches** - любые CVE
2. **Runware SDK** - новые возможности генерации
3. **Electron** - безопасность и производительность

### Средний приоритет (обновить в течение месяца)
1. **FastAPI/Uvicorn** - новые фичи
2. **React** - performance improvements
3. **TypeScript** - новые type features

### Низкий приоритет (можно отложить)
1. **Linters/Formatters** - косметические улучшения
2. **Testing tools** - если текущие работают

## Использование Context7

### Примеры запросов для Context7:

#### FastAPI
```
Query: "What are the breaking changes between FastAPI 0.109 and the latest version in 2026? 
Show migration guide and new features worth using."
```

#### Electron
```
Query: "Electron migration guide from version 28 to latest stable. 
Focus on IPC changes, security improvements, and build configuration."
```

#### Pydantic
```
Query: "Pydantic 2.5 to latest version migration. 
Show changes in BaseSettings, validators, and serialization."
```

#### React
```
Query: "React 18 best practices for 2026. 
Concurrent features, Suspense, Server Components compatibility with Electron."
```

### Шаблон для Context7 запроса:

```
Библиотека: {название}
Текущая версия: {версия}
Целевая версия: latest stable

Вопросы:
1. Какие breaking changes?
2. Новые фичи для {наш use case}?
3. Deprecated API в текущей версии?
4. Рекомендации по миграции?
5. Известные проблемы совместимости с {другие наши библиотеки}?
```

## Чек-лист актуализации

### Подготовка
- [ ] Создать ветку `dependencies-update`
- [ ] Сделать backup текущего состояния
- [ ] Запустить все тесты на текущих версиях (baseline)

### Python Dependencies

**Development Tools:**
- [ ] Context7 query для Ruff
- [ ] Обновить Ruff в requirements-dev.txt
- [ ] Context7 query для Mypy
- [ ] Обновить Mypy
- [ ] Протестировать lint/format

**Testing:**
- [ ] Context7 query для Pytest
- [ ] Обновить Pytest и плагины
- [ ] Запустить тесты
- [ ] Исправить breaking changes

**Core:**
- [ ] Context7 query для FastAPI
- [ ] Context7 query для Pydantic
- [ ] Обновить FastAPI + Pydantic вместе
- [ ] Обновить Uvicorn
- [ ] Протестировать API endpoints

**AI/Data:**
- [ ] Context7 query для Runware SDK
- [ ] Проверить changelog на GitHub
- [ ] Обновить Runware SDK
- [ ] Тестировать генерацию изображений
- [ ] Context7 query для Pillow
- [ ] Обновить Pillow
- [ ] Context7 query для SQLAlchemy
- [ ] Обновить SQLAlchemy
- [ ] Тестировать database операции

### Node.js Dependencies

**Development Tools:**
- [ ] Context7 query для ESLint
- [ ] Обновить ESLint (проверить flat config)
- [ ] Context7 query для Prettier
- [ ] Обновить Prettier
- [ ] Протестировать lint/format

**Testing:**
- [ ] Context7 query для Jest
- [ ] Обновить Jest + ts-jest
- [ ] Context7 query для Testing Library
- [ ] Обновить Testing Library
- [ ] Запустить тесты

**Build Tools:**
- [ ] Context7 query для TypeScript
- [ ] Обновить TypeScript
- [ ] Context7 query для Vite
- [ ] Обновить Vite
- [ ] Протестировать build

**Core:**
- [ ] Context7 query для Electron
- [ ] Обновить Electron
- [ ] Context7 query для Electron Builder
- [ ] Обновить Electron Builder
- [ ] Context7 query для React
- [ ] Обновить React + React DOM
- [ ] Протестировать app launch

**State & UI:**
- [ ] Context7 query для Zustand
- [ ] Обновить Zustand
- [ ] Context7 query для TailwindCSS
- [ ] Установить/обновить TailwindCSS
- [ ] Протестировать UI

### Финализация
- [ ] Запустить полный набор тестов
- [ ] E2E тестирование
- [ ] Создать production build
- [ ] Протестировать installer
- [ ] Обновить документацию
- [ ] Коммит и PR

## Риски и митигация

| Риск | Вероятность | Влияние | Митигация |
|------|-------------|---------|-----------|
| Breaking changes в Pydantic | Высокая | Высокое | Изучить migration guide, тестировать тщательно |
| Electron API changes | Средняя | Высокое | Проверить changelog, тестировать IPC |
| FastAPI breaking changes | Низкая | Среднее | FastAPI стабилен, но проверить dependencies |
| React concurrent mode issues | Средняя | Среднее | Тестировать state updates, async rendering |
| Runware SDK API changes | Высокая | Критичное | Проверить официальный changelog, контактировать support |

## Timeline

**Неделя 1:**
- День 1-2: Context7 research для всех библиотек
- День 3: Создание детального migration guide
- День 4-5: Обновление development tools

**Неделя 2:**
- День 1-2: Обновление testing frameworks
- День 3-4: Обновление core frameworks (FastAPI, Electron)
- День 5: Тестирование

**Неделя 3:**
- День 1-2: Обновление specialized libraries (Runware, SQLAlchemy)
- День 3-4: E2E тестирование
- День 5: Документация и finalization

## Команды для Context7

Использовать в Claude Code:

```typescript
// Пример использования Context7 MCP
// 1. Resolve library ID
await mcp.context7.resolveLibraryId({
  libraryName: "fastapi",
  query: "FastAPI web framework for Python"
});

// 2. Query documentation
await mcp.context7.queryDocs({
  libraryId: "/tiangolo/fastapi",
  query: "What are breaking changes from version 0.109 to latest? Migration guide."
});
```

## Результат

После завершения актуализации:
- ✅ Все библиотеки на последних stable версиях
- ✅ Исправлены все deprecation warnings
- ✅ Все тесты проходят
- ✅ Документация обновлена
- ✅ Migration guide создан для будущих обновлений

---

**Начать актуализацию после завершения ФАЗЫ 1 (реструктуризация проекта)**
